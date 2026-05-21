/**
 * 刷新调度器
 * 负责统一处理聚合天气数据的过期判断、并发控制以及数据刷新
 */
import DataService from "./data-service.js"
import WeatherApiService from "./weather-api-service.js"
import SettingsService from "./settings-service.js"
import DeviceService from "./device-service.js"
import {AUTO_UPDATE, MANUAL_UPDATE, ADVANCED_FEATURE_PRODUCT_BLACKLIST} from "./config.js"

class RefreshController {
  constructor() {
    this.refreshPromise = null
    this.dailyTimestamp = null
  }

  /**
   * 记录每日更新的时间戳
   * @param {Object} weatherData - 天气数据
   */
  recordDailyUpdate(weatherData) {
    const timestamp = this.extractDailyTimestamp(weatherData)
    if (timestamp) {
      this.dailyTimestamp = timestamp
    }
  }

  /**
   * 获取最近一次每日更新的时间戳
   * 优先返回本次运行内已记录的时间戳，其次从本地文件读取
   * @returns {Promise<number|null>} 毫秒时间戳，不存在返回 null
   */
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

  /**
   * 获取手动刷新的剩余冷却时间
   * @returns {Promise<number>} 剩余毫秒数，0 表示可以刷新
   */
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

  /**
   * 从天气数据中提取每日更新时间戳
   * @param {Object} weatherData - 天气数据
   * @returns {number|null} 毫秒时间戳，解析失败返回 null
   */
  extractDailyTimestamp(weatherData) {
    const updateTime = DataService.getPrimaryUpdateTime(weatherData)
    if (!updateTime) {
      return null
    }

    const parsed = new Date(updateTime).getTime()
    return Number.isNaN(parsed) ? null : parsed
  }

  /**
   * 判断每日数据是否已过期
   * @param {Object} weatherData - 天气数据
   * @returns {boolean} 是否超过过期阈值
   */
  isDailyExpired(weatherData) {
    const timestamp = this.extractDailyTimestamp(weatherData)
    if (!timestamp) {
      return false
    }

    return Date.now() - timestamp >= AUTO_UPDATE.EXPIRY_THRESHOLD
  }

  /**
   * 判断自动更新是否需要执行
   * daily 过期时刷新；已开启的高级模块在本地缺失时也通过自动更新补齐。
   * @param {Object} weatherData - 天气数据
   * @returns {Promise<boolean>} 是否需要自动更新
   */
  async shouldAutoUpdate(weatherData) {
    if (!weatherData || this.isDailyExpired(weatherData)) {
      return true
    }

    const isBlocked = await DeviceService.isProductInList(ADVANCED_FEATURE_PRODUCT_BLACKLIST)
    if (isBlocked) {
      return false
    }

    const [hourlyEnabled, alertEnabled] = await Promise.all([
      SettingsService.isHourlyForecastEnabled(),
      SettingsService.isAlertEnabled()
    ])

    if (hourlyEnabled && DataService.getHourlyList(weatherData).length === 0) {
      return true
    }

    if (alertEnabled && !Array.isArray(weatherData.alerts)) {
      return true
    }

    return false
  }

  /**
   * 刷新天气数据
   * 使用 refreshPromise 保证并发调用只发一次网络请求。
   * 如果请求期间同步器已写入本地文件，则优先使用同步器数据。
   * 接口返回后先写入本地文件，保存成功后返回给页面渲染。
   * @returns {Promise<Object>} 最新的天气数据
   * @throws {Error} 数据保存失败，code = DATA_SAVE_FAILED
   */
  async refreshWeatherData() {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const localDataBeforeFetch = await DataService.readWeatherData(true)
        const localSnapshotBeforeFetch = localDataBeforeFetch
          ? JSON.stringify(localDataBeforeFetch)
          : ""

        const weatherData = await WeatherApiService.fetchWeatherData()

        const localDataAfterFetch = await DataService.readWeatherData(true)
        const localSnapshotAfterFetch = localDataAfterFetch ? JSON.stringify(localDataAfterFetch) : ""
        if (
          localDataAfterFetch &&
          localSnapshotAfterFetch &&
          localSnapshotBeforeFetch !== localSnapshotAfterFetch
        ) {
          this.recordDailyUpdate(localDataAfterFetch)
          return localDataAfterFetch
        }

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
}

export default new RefreshController()
