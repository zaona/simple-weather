/**
 * 数据管理服务
 * 统一管理天气数据的存储、读取和缓存
 */

import file from '@system.file'
import { STORAGE, DATA, MESSAGES, TOAST_DURATION } from './config.js'
import { showToast } from '@system.prompt'

/**
 * 数据服务类
 * 提供天气数据的读写、缓存和查询功能
 */
class DataService {
  constructor() {
    // 内存缓存
    this.cache = null
    // 缓存时间戳
    this.cacheTime = null
  }

  /**
   * 读取天气数据
   * 优先使用缓存，缓存失效或不存在时从文件读取
   * @returns {Promise<Object|null>} 天气数据对象，失败返回null
   */
  readWeatherData() {
    return new Promise((resolve) => {
      // 检查缓存是否有效
      if (this.cache && this.cacheTime) {
        const now = Date.now()
        if (now - this.cacheTime < DATA.CACHE_EXPIRY) {
          console.log('使用缓存数据')
          resolve(this.cache)
          return
        }
      }

      // 缓存失效或不存在，从文件读取
      file.readText({
        uri: STORAGE.WEATHER_FILE,
        success: (data) => {
          try {
            const weatherData = JSON.parse(data.text)
            // 更新缓存
            this.cache = weatherData
            this.cacheTime = Date.now()
            resolve(weatherData)
          } catch (e) {
            console.error('数据解析失败:', e)
            showToast({ 
              message: MESSAGES.DATA_FORMAT_ERROR, 
              duration: TOAST_DURATION.NORMAL 
            })
            resolve(null)
          }
        },
        fail: (data, code) => {
          console.log('读取文件失败:', code)
          showToast({ 
            message: MESSAGES.NO_LOCAL_DATA, 
            duration: TOAST_DURATION.NORMAL 
          })
          resolve(null)
        }
      })
    })
  }

  /**
   * 保存天气数据到文件
   * 带重试机制，最多重试指定次数
   * @param {string} dataText - 要保存的数据（JSON字符串）
   * @param {number} retryCount - 当前重试次数（内部使用）
   * @returns {Promise<boolean>} 保存成功返回true，失败返回false
   */
  saveWeatherData(dataText, retryCount = 0) {
    return new Promise((resolve) => {
      file.writeText({
        uri: STORAGE.WEATHER_FILE,
        text: dataText,
        success: () => {
          console.log('数据已保存到本地')
          
          // 更新缓存
          try {
            this.cache = JSON.parse(dataText)
            this.cacheTime = Date.now()
          } catch (e) {
            console.error('保存后更新缓存失败:', e)
          }
          
          resolve(true)
        },
        fail: () => {
          if (retryCount < DATA.MAX_SAVE_RETRIES) {
            // 重试
            setTimeout(() => {
              this.saveWeatherData(dataText, retryCount + 1)
                .then(resolve)
            }, DATA.SAVE_RETRY_DELAY)
          } else {
            console.error('数据保存失败，已达最大重试次数')
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
   * 根据日期获取天气数据
   * @param {string} date - 日期字符串，格式：YYYY-MM-DD
   * @returns {Promise<Object|null>} 指定日期的天气数据，失败返回null
   */
  async getDataByDate(date) {
    const weatherData = await this.readWeatherData()
    
    if (!weatherData || !weatherData.daily || !Array.isArray(weatherData.daily)) {
      return null
    }

    const dayData = weatherData.daily.find(day => day.fxDate === date)
    return dayData || null
  }

  /**
   * 获取今天的天气数据
   * @returns {Promise<Object|null>} 今天的天气数据
   */
  async getTodayData() {
    const weatherData = await this.readWeatherData()
    
    if (!weatherData || !weatherData.daily || !Array.isArray(weatherData.daily)) {
      return null
    }

    // 获取今天的日期字符串
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    const dayData = weatherData.daily.find(day => day.fxDate === todayStr)
    
    if (!dayData) {
      showToast({ 
        message: MESSAGES.DATA_EXPIRED, 
        duration: TOAST_DURATION.NORMAL 
      })
      return null
    }

    return {
      weatherData,
      todayData: dayData,
      todayStr
    }
  }

  /**
   * 清除缓存
   * 强制下次读取从文件加载
   */
  clearCache() {
    this.cache = null
    this.cacheTime = null
    console.log('缓存已清除')
  }

  /**
   * 验证天气数据格式
   * @param {Object} data - 要验证的数据对象
   * @returns {boolean} 数据格式是否有效
   */
  validateWeatherData(data) {
    return data && 
           data.daily && 
           Array.isArray(data.daily) && 
           data.daily.length > 0
  }
}

// 导出单例
export default new DataService()

