import DataService from "./data-service.js"
import HourlyDataService from "./hourly-data-service.js"
import WeatherApiService from "./weather-api-service.js"
import {AUTO_UPDATE} from "./config.js"

/**
 * 刷新调度器
 * 负责统一处理每日/逐小时天气的过期判断、并发控制以及数据刷新
 */
class RefreshController {
  constructor() {
    this.dailyRefreshPromise = null
    this.hourlyRefreshPromise = null
    this.dailyTimestamp = null
    this.hourlyTimestamp = null
  }

  recordDailyUpdate(weatherData) {
    const timestamp = this.extractDailyTimestamp(weatherData)
    if (timestamp) {
      this.dailyTimestamp = timestamp
    }
  }

  recordHourlyUpdate(hourlyData) {
    const timestamp = this.extractHourlyTimestamp(hourlyData)
    if (timestamp) {
      this.hourlyTimestamp = timestamp
    }
  }

  extractDailyTimestamp(weatherData) {
    if (!weatherData || !weatherData.updateTime) {
      return null
    }
    const parsed = new Date(weatherData.updateTime).getTime()
    return Number.isNaN(parsed) ? null : parsed
  }

  extractHourlyTimestamp(hourlyData) {
    if (!hourlyData) {
      return null
    }

    const timestamps = []

    if (typeof hourlyData.updateTime === "string") {
      const parsed = Date.parse(hourlyData.updateTime)
      if (!Number.isNaN(parsed)) {
        timestamps.push(parsed)
      }
    }

    if (Array.isArray(hourlyData.hourly) && hourlyData.hourly.length > 0) {
      const firstEntry = hourlyData.hourly[0]
      const fxTime = firstEntry.fxTime || firstEntry.time
      if (fxTime) {
        const parsed = Date.parse(fxTime)
        if (!Number.isNaN(parsed)) {
          timestamps.push(parsed)
        }
      }
    }

    if (timestamps.length === 0) {
      return null
    }

    return Math.max(...timestamps)
  }

  isDailyExpired(weatherData) {
    const timestamp = this.extractDailyTimestamp(weatherData)
    if (!timestamp) {
      return false
    }
    this.dailyTimestamp = timestamp
    return Date.now() - timestamp >= AUTO_UPDATE.EXPIRY_THRESHOLD
  }

  isHourlyExpired(hourlyData) {
    const timestamp = this.extractHourlyTimestamp(hourlyData)
    if (!timestamp) {
      return true
    }
    this.hourlyTimestamp = timestamp
    return Date.now() - timestamp >= AUTO_UPDATE.EXPIRY_THRESHOLD
  }

  async refreshDailyData() {
    if (!this.dailyRefreshPromise) {
      this.dailyRefreshPromise = (async () => {
        const weatherData = await WeatherApiService.fetchWeatherWithLocation()
        const saved = await DataService.saveWeatherData(JSON.stringify(weatherData))
        if (!saved) {
          const error = new Error("DATA_SAVE_FAILED")
          error.code = "DATA_SAVE_FAILED"
          throw error
        }
        this.recordDailyUpdate(weatherData)
        return weatherData
      })().finally(() => {
        this.dailyRefreshPromise = null
      })
    }
    return this.dailyRefreshPromise
  }

  async refreshHourlyData() {
    if (!this.hourlyRefreshPromise) {
      this.hourlyRefreshPromise = (async () => {
        const hourlyData = await WeatherApiService.fetchHourlyForecast()
        const payload = {...hourlyData}
        const saved = await HourlyDataService.saveHourlyData(JSON.stringify(payload))
        if (!saved) {
          const error = new Error("DATA_SAVE_FAILED")
          error.code = "DATA_SAVE_FAILED"
          throw error
        }
        this.recordHourlyUpdate(payload)
        return payload
      })().finally(() => {
        this.hourlyRefreshPromise = null
      })
    }
    return this.hourlyRefreshPromise
  }

  async ensureDailyData(options = {}) {
    const {forceRefresh = false} = options

    if (forceRefresh) {
      DataService.clearCache()
    }

    const weatherData = await DataService.readWeatherData(true)
    const isValid = weatherData && DataService.validateWeatherData(weatherData)

    if (!isValid || forceRefresh || this.isDailyExpired(weatherData)) {
      const refreshed = await this.refreshDailyData()
      return {weatherData: refreshed, fromCache: false}
    }

    this.recordDailyUpdate(weatherData)
    return {weatherData, fromCache: true}
  }

  async ensureHourlyData(options = {}) {
    const {forceRefresh = false} = options

    if (forceRefresh) {
      HourlyDataService.clearCache()
    }

    const localData = await HourlyDataService.readHourlyData(true)
    const hasValidLocalData =
      localData && HourlyDataService.validateHourlyData(localData) && Array.isArray(localData.hourly)

    const isExpired = hasValidLocalData ? this.isHourlyExpired(localData) : true

    if (hasValidLocalData && !forceRefresh && !isExpired) {
      this.recordHourlyUpdate(localData)
      return {hourlyData: localData, fromCache: true}
    }

    try {
      const refreshed = await this.refreshHourlyData()
      return {hourlyData: refreshed, fromCache: false}
    } catch (error) {
      if (hasValidLocalData) {
        this.recordHourlyUpdate(localData)
        return {hourlyData: localData, fromCache: true, error}
      }
      throw error
    }
  }
}

export default new RefreshController()
