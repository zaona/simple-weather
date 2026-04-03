import DataService from "./data-service.js"
import WeatherApiService from "./weather-api-service.js"
import {AUTO_UPDATE, MANUAL_UPDATE} from "./config.js"

/**
 * 刷新调度器
 * 负责统一处理聚合天气数据的过期判断、并发控制以及数据刷新
 */
class RefreshController {
  constructor() {
    this.refreshPromise = null
    this.dailyTimestamp = null
  }

  recordDailyUpdate(weatherData) {
    const timestamp = this.extractDailyTimestamp(weatherData)
    if (timestamp) {
      this.dailyTimestamp = timestamp
    }
  }

  async getLastDailyUpdateTimestamp() {
    if (this.dailyTimestamp) {
      return this.dailyTimestamp
    }

    try {
      const weatherData = await DataService.readWeatherData(true)
      const timestamp = this.extractDailyTimestamp(weatherData)
      if (timestamp) {
        this.dailyTimestamp = timestamp
        return timestamp
      }
    } catch (error) {
      console.error("获取天气更新时间失败:", error)
    }

    return null
  }

  async getManualRefreshRemainingTime() {
    const minInterval = MANUAL_UPDATE?.MIN_INTERVAL
    if (!minInterval) {
      return 0
    }

    const lastTimestamp = await this.getLastDailyUpdateTimestamp()
    if (!lastTimestamp) {
      return 0
    }

    const elapsed = Date.now() - lastTimestamp
    return elapsed >= minInterval ? 0 : minInterval - elapsed
  }

  async canTriggerManualRefresh() {
    const remainingTime = await this.getManualRefreshRemainingTime()
    return remainingTime === 0
  }

  extractDailyTimestamp(weatherData) {
    const updateTime = DataService.getPrimaryUpdateTime(weatherData)
    if (!updateTime) {
      return null
    }

    const parsed = new Date(updateTime).getTime()
    return Number.isNaN(parsed) ? null : parsed
  }

  isDailyExpired(weatherData) {
    const timestamp = this.extractDailyTimestamp(weatherData)
    if (!timestamp) {
      return false
    }

    this.dailyTimestamp = timestamp
    return Date.now() - timestamp >= AUTO_UPDATE.EXPIRY_THRESHOLD
  }

  async refreshWeatherData() {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const weatherData = await WeatherApiService.fetchWeatherData()
        const saved = await DataService.saveWeatherData(JSON.stringify(weatherData))

        if (!saved) {
          const error = new Error("DATA_SAVE_FAILED")
          error.code = "DATA_SAVE_FAILED"
          throw error
        }

        this.recordDailyUpdate(weatherData)
        return weatherData
      })().finally(() => {
        this.refreshPromise = null
      })
    }

    return this.refreshPromise
  }

  async ensureDailyData(options = {}) {
    const {forceRefresh = false} = options

    if (forceRefresh) {
      DataService.clearCache()
    }

    const weatherData = await DataService.readWeatherData(true)
    const isValid = weatherData && DataService.validateWeatherData(weatherData)

    if (!isValid || forceRefresh || this.isDailyExpired(weatherData)) {
      const refreshed = await this.refreshWeatherData()
      return {weatherData: refreshed, fromCache: false}
    }

    this.recordDailyUpdate(weatherData)
    return {weatherData, fromCache: true}
  }
}

export default new RefreshController()
