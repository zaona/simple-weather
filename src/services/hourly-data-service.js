/**
 * 逐小时天气数据存储服务
 * 负责读写 hourly 天气文件并在内存中缓存结果
 */

import file from '@system.file'
import { showToast } from '@system.prompt'
import { STORAGE, DATA, MESSAGES, TOAST_DURATION } from './config.js'

class HourlyDataService {
  constructor() {
    this.cache = null
    this.cacheTime = null
  }

  /**
   * 读取本地逐小时天气数据
   * @param {boolean} silent
   * @returns {Promise<Object|null>}
   */
  readHourlyData(silent = false) {
    return new Promise((resolve) => {
      if (this.cache && this.cacheTime) {
        const now = Date.now()
        if (now - this.cacheTime < DATA.CACHE_EXPIRY) {
          resolve(this.cache)
          return
        }
      }

      file.readText({
        uri: STORAGE.HOURLY_WEATHER_FILE,
        success: (data) => {
          try {
            const parsed = JSON.parse(data.text)
            this.cache = parsed
            this.cacheTime = Date.now()
            resolve(parsed)
          } catch (error) {
            console.error('逐小时数据解析失败:', error)
            if (!silent) {
              showToast({
                message: MESSAGES.DATA_FORMAT_ERROR,
                duration: TOAST_DURATION.NORMAL
              })
            }
            resolve(null)
          }
        },
        fail: () => {
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
   * 保存逐小时天气数据
   * @param {string} dataText
   * @param {number} retryCount
   * @returns {Promise<boolean>}
   */
  saveHourlyData(dataText, retryCount = 0) {
    return new Promise((resolve) => {
      file.writeText({
        uri: STORAGE.HOURLY_WEATHER_FILE,
        text: dataText,
        success: () => {
          try {
            this.cache = JSON.parse(dataText)
          } catch (error) {
            console.error('逐小时缓存更新失败:', error)
            this.cache = null
          }
          this.cacheTime = Date.now()
          resolve(true)
        },
        fail: () => {
          if (retryCount < DATA.MAX_SAVE_RETRIES) {
            setTimeout(() => {
              this.saveHourlyData(dataText, retryCount + 1).then(resolve)
            }, DATA.SAVE_RETRY_DELAY)
          } else {
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
   * 校验 hourly 数据结构
   * @param {Object} data
   * @returns {boolean}
   */
  validateHourlyData(data) {
    return !!data && Array.isArray(data.hourly) && data.hourly.length > 0
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache = null
    this.cacheTime = null
  }
}

export default new HourlyDataService()
