/**
 * 数据管理服务
 * 统一管理聚合天气数据的存储、读取和缓存
 */

import file from "@system.file"
import {STORAGE, DATA, MESSAGES, TOAST_DURATION} from "./config.js"
import {showToast} from "@system.prompt"

class DataService {
  constructor() {
    this.cache = null
    this.cacheTime = null
  }

  readWeatherData(silent = false) {
    return new Promise((resolve) => {
      if (this.cache && this.cacheTime) {
        const now = Date.now()
        if (now - this.cacheTime < DATA.CACHE_EXPIRY) {
          console.log("使用缓存数据")
          resolve(this.cache)
          return
        }
      }

      file.readText({
        uri: STORAGE.WEATHER_FILE,
        success: (data) => {
          try {
            const weatherData = JSON.parse(data.text)
            if (!this.validateWeatherData(weatherData)) {
              throw new Error("INVALID_WEATHER_DATA")
            }

            this.cache = weatherData
            this.cacheTime = Date.now()
            resolve(weatherData)
          } catch (error) {
            console.error("数据解析失败:", error)
            if (!silent) {
              showToast({
                message: MESSAGES.DATA_FORMAT_ERROR,
                duration: TOAST_DURATION.NORMAL
              })
            }
            resolve(null)
          }
        },
        fail: (data, code) => {
          console.log("读取文件失败:", code)
          if (!silent) {
            showToast({
              message: MESSAGES.NO_LOCAL_DATA,
              duration: TOAST_DURATION.NORMAL
            })
          }
          resolve(null)
        }
      })
    })
  }

  readRawWeatherData() {
    return new Promise((resolve) => {
      file.readText({
        uri: STORAGE.WEATHER_FILE,
        success: (data) => {
          try {
            resolve(JSON.parse(data.text))
          } catch (error) {
            console.error("原始数据解析失败:", error)
            resolve(null)
          }
        },
        fail: () => {
          resolve(null)
        }
      })
    })
  }

  saveWeatherData(dataText, retryCount = 0) {
    return new Promise((resolve) => {
      file.writeText({
        uri: STORAGE.WEATHER_FILE,
        text: dataText,
        success: () => {
          console.log("数据已保存到本地")

          try {
            const weatherData = JSON.parse(dataText)
            this.cache = this.validateWeatherData(weatherData) ? weatherData : null
            this.cacheTime = this.cache ? Date.now() : null
          } catch (error) {
            console.error("保存后更新缓存失败:", error)
            this.cache = null
            this.cacheTime = null
          }

          resolve(true)
        },
        fail: () => {
          if (retryCount < DATA.MAX_SAVE_RETRIES) {
            setTimeout(() => {
              this.saveWeatherData(dataText, retryCount + 1).then(resolve)
            }, DATA.SAVE_RETRY_DELAY)
          } else {
            console.error("数据保存失败，已达最大重试次数")
            showToast({
              message: MESSAGES.DATA_SAVE_ERROR,
              duration: TOAST_DURATION.NORMAL
            })
            resolve(false)
          }
        }
      })
    })
  }

  getDailyModule(weatherData) {
    if (!weatherData || !weatherData.daily) {
      return null
    }

    if (Array.isArray(weatherData.daily)) {
      return {
        daily: weatherData.daily,
        updateTime: weatherData.updateTime || ""
      }
    }

    if (typeof weatherData.daily === "object") {
      return weatherData.daily
    }

    return null
  }

  getHourlyModule(weatherData) {
    if (!weatherData || weatherData.hourly === null || weatherData.hourly === undefined) {
      return null
    }

    if (Array.isArray(weatherData.hourly)) {
      return {
        hourly: weatherData.hourly,
        updateTime: weatherData.updateTime || ""
      }
    }

    if (typeof weatherData.hourly === "object") {
      return weatherData.hourly
    }

    return null
  }

  getDailyList(weatherData) {
    const dailyModule = this.getDailyModule(weatherData)
    return Array.isArray(dailyModule?.daily) ? dailyModule.daily : []
  }

  getHourlyList(weatherData) {
    const hourlyModule = this.getHourlyModule(weatherData)
    return Array.isArray(hourlyModule?.hourly) ? hourlyModule.hourly : []
  }

  getPrimaryUpdateTime(weatherData) {
    if (typeof weatherData?.updateTime === "string" && weatherData.updateTime) {
      return weatherData.updateTime
    }

    return ""
  }

  getLocationName(weatherData) {
    if (!weatherData) {
      return "未知地点"
    }

    return weatherData.location || weatherData.name || "未知地点"
  }

  async getDataByDate(date, silent = false) {
    const weatherData = await this.readWeatherData(silent)
    const dailyList = this.getDailyList(weatherData)
    if (dailyList.length === 0) {
      return null
    }

    const dayData = dailyList.find((day) => day.fxDate === date)
    return dayData || null
  }

  getDataByDateFromCache(date) {
    if (!date || !this.cache) {
      return null
    }

    const dailyList = this.getDailyList(this.cache)
    if (dailyList.length === 0) {
      return null
    }

    return dailyList.find((day) => day.fxDate === date) || null
  }

  async getTodayData(silent = false) {
    const weatherData = await this.readWeatherData(silent)
    const dailyList = this.getDailyList(weatherData)

    if (!weatherData || dailyList.length === 0) {
      return {status: "no_data"}
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const todayStr = `${year}-${month}-${day}`
    const dayData = dailyList.find((item) => item.fxDate === todayStr)

    if (!dayData) {
      if (!silent) {
        showToast({
          message: MESSAGES.DATA_EXPIRED,
          duration: TOAST_DURATION.NORMAL
        })
      }
      return {status: "expired"}
    }

    return {
      status: "success",
      weatherData,
      todayData: dayData,
      todayStr
    }
  }

  clearCache() {
    this.cache = null
    this.cacheTime = null
    console.log("缓存已清除")
  }

  validateWeatherData(data) {
    return !!data && typeof data === "object" && !Array.isArray(data)
  }
}

export default new DataService()
