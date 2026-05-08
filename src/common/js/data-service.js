/**
 * 数据管理服务
 * 统一管理聚合天气数据的存储、读取和缓存
 */

import file from "@system.file"
import {STORAGE, DATA, MESSAGES, TOAST_DURATION} from "./config.js"
import {showToast} from "@system.prompt"
import {DateUtils} from "./weather-utils.js"

class DataService {
  constructor() {
    this.cache = null
    this.cacheTime = null
  }

  /**
   * 读取本地天气数据
   * 优先使用缓存，缓存过期后从文件读取并解析
   * @param {boolean} silent - 静默模式，不显示错误提示
   * @param {boolean} [options.skipCache] - 是否跳过缓存
   * @returns {Promise<Object|null>} 天气数据对象，读取失败返回 null
   */
  readWeatherData(silent = false, {skipCache = false} = {}) {
    return new Promise((resolve) => {
      if (!skipCache && this.cache && this.cacheTime) {
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

            if (!skipCache) {
              this.cache = weatherData
              this.cacheTime = Date.now()
            }
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

  /**
   * 保存天气数据到本地文件
   * 写入失败时自动重试，超过最大重试次数后提示用户
   * @param {string} dataText - 要保存的 JSON 字符串
   * @param {number} retryCount - 当前重试次数
   * @param {Object|null} parsedData - 已解析的数据对象，用于更新缓存
   * @returns {Promise<boolean>} 保存成功返回 true
   */
  saveWeatherData(dataText, retryCount = 0, parsedData = null) {
    return new Promise((resolve) => {
      file.writeText({
        uri: STORAGE.WEATHER_FILE,
        text: dataText,
        success: () => {
          console.log("数据已保存到本地")

          try {
            const weatherData = parsedData || JSON.parse(dataText)
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
              this.saveWeatherData(dataText, retryCount + 1, parsedData).then(resolve)
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

  /**
   * 提取天气数据中的指定模块
   * 自动处理数组格式 {moduleName: data, updateTime} 和直接对象格式
   * @param {Object|null} weatherData - 天气数据
   * @param {string} name - 模块名称（如 "daily"、"hourly"）
   * @returns {Object|null} 模块数据对象，不存在返回 null
   */
  getModule(weatherData, name) {
    if (!weatherData || !weatherData[name]) {
      return null
    }

    if (Array.isArray(weatherData[name])) {
      return {
        [name]: weatherData[name],
        updateTime: weatherData.updateTime || ""
      }
    }

    if (typeof weatherData[name] === "object") {
      return weatherData[name]
    }

    return null
  }

  /**
   * 获取逐日预报列表
   * @param {Object} weatherData - 天气数据
   * @returns {Array} 逐日预报数组
   */
  getDailyList(weatherData) {
    const dailyModule = this.getModule(weatherData, "daily")
    return Array.isArray(dailyModule?.daily) ? dailyModule.daily : []
  }

  /**
   * 获取逐小时预报列表
   * @param {Object} weatherData - 天气数据
   * @returns {Array} 逐小时预报数组
   */
  getHourlyList(weatherData) {
    const hourlyModule = this.getModule(weatherData, "hourly")
    return Array.isArray(hourlyModule?.hourly) ? hourlyModule.hourly : []
  }

  /**
   * 获取天气预警列表
   * @param {Object} weatherData - 天气数据
   * @returns {Array} 预警信息数组
   */
  getAlertsList(weatherData) {
    if (!weatherData || !Array.isArray(weatherData.alerts)) {
      return []
    }
    return weatherData.alerts
  }

  /**
   * 获取天气数据的主要更新时间
   * @param {Object} weatherData - 天气数据
   * @returns {string} 更新时间字符串，不存在返回空字符串
   */
  getPrimaryUpdateTime(weatherData) {
    if (typeof weatherData?.updateTime === "string" && weatherData.updateTime) {
      return weatherData.updateTime
    }

    return ""
  }

  /**
   * 获取地理位置名称
   * 优先级：location 字段 > name 字段 > "未知地点" 兜底
   * @param {Object} weatherData - 天气数据
   * @returns {string} 地点名称
   */
  getLocationName(weatherData) {
    if (!weatherData) {
      return "未知地点"
    }

    const rawName = weatherData.location || weatherData.name || ""
    return typeof rawName === "string" ? rawName.trim() || "未知地点" : "未知地点"
  }

  /**
   * 根据日期查找对应的天气数据
   * @param {string} date - 日期字符串，格式 YYYY-MM-DD
   * @param {boolean} silent - 静默模式，不显示错误提示
   * @returns {Promise<Object|null>} 匹配的日数据，未找到返回 null
   */
  async getDataByDate(date, silent = false) {
    const weatherData = await this.readWeatherData(silent)
    const dailyList = this.getDailyList(weatherData)
    if (dailyList.length === 0) {
      return null
    }

    const dayData = dailyList.find((day) => day.fxDate === date)
    return dayData || null
  }

  /**
   * 获取今天的数据
   * 返回 status 标记数据状态：success / no_data / expired
   * @param {boolean} silent - 静默模式
   * @returns {Promise<Object>} { status, weatherData, todayData, todayStr }
   */
  async getTodayData(silent = false) {
    const weatherData = await this.readWeatherData(silent)
    const dailyList = this.getDailyList(weatherData)

    if (!weatherData || dailyList.length === 0) {
      return {status: "no_data"}
    }

    const todayStr = DateUtils.getTodayString()
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

  /**
   * 清除内存缓存
   */
  clearCache() {
    this.cache = null
    this.cacheTime = null
    console.log("缓存已清除")
  }

  /**
   * 校验天气数据的基本格式
   * @param {*} data - 待校验数据
   * @returns {boolean} 是否为有效对象
   */
  validateWeatherData(data) {
    return !!data && typeof data === "object" && !Array.isArray(data)
  }
}

export default new DataService()
