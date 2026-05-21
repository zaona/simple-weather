/**
 * 天气 API 服务
 * 负责请求后端聚合天气接口，并基于本地天气文件中的 locationId 和模块长度拉取新数据
 */

import fetch from "@system.fetch"
import DataService from "./data-service.js"
import SettingsService from "./settings-service.js"
import DeviceService from "./device-service.js"
import {WEATHER_API, ADVANCED_FEATURE_PRODUCT_BLACKLIST} from "./config.js"
import WEATHER_API_PRIVATE from "./weather-api-config.js"

/**
 * 天气 API 错误码
 * @type {Object}
 */
export const WEATHER_API_ERRORS = {
  LOCATION_INFO_MISSING: "LOCATION_INFO_MISSING"
}

/**
 * 通用 fetch 封装
 * 处理快应用 fetch 响应，自动解析 JSON
 * @param {string} url - 请求地址
 * @param {Object} [options] - 请求选项
 * @param {string} [options.method=GET] - HTTP 方法
 * @param {Object} [options.data] - 请求体
 * @param {Object} [options.header] - 请求头
 * @returns {Promise<Object>} 解析后的响应数据
 * @throws {Error} 请求失败或状态码异常
 */
function fetchJson(url, options = {}) {
  const {method = "GET", data = null, header = {}} = options

  return new Promise((resolve, reject) => {
    fetch.fetch({
      url,
      method,
      data,
      header,
      responseType: "json",
      timeout: WEATHER_API.REQUEST_TIMEOUT,
      success: (response) => {
        try {
          const statusCode = response.statusCode || response.code || 0
          let payload = response.data

          if (payload === undefined) {
            payload = response
          }

          if (typeof payload === "string") {
            payload = JSON.parse(payload)
          }

          if (statusCode >= 200 && statusCode < 300) {
            resolve(payload)
            return
          }

          reject(new Error(`请求失败: ${statusCode}`))
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

/**
 * 构建认证请求头
 * 包含客户端类型和 API Key，用于后端身份校验
 * @param {Object} [extraHeaders] - 额外的请求头
 * @returns {Object} 合并后的请求头
 */
function buildAuthHeaders(extraHeaders = {}) {
  return {
    "X-Client-Type": WEATHER_API_PRIVATE.AUTH.CLIENT_TYPE,
    "X-API-Key": WEATHER_API_PRIVATE.AUTH.API_KEY,
    ...extraHeaders
  }
}

class WeatherApiService {
  /**
   * 获取最新天气数据
   * 从本地数据提取 locationId，结合用户设置构建请求，向服务端发起同步
   * @returns {Promise<Object>} 最新的聚合天气数据
   * @throws {Error} 缺少位置信息时抛出，code = LOCATION_INFO_MISSING
   * @throws {Error} 服务端返回数据格式异常
   */
  async fetchWeatherData() {
    const localWeatherData = await DataService.readWeatherData(true)
    const locationId = this.extractLocationId(localWeatherData)
    const locationName = DataService.getLocationName(localWeatherData)

    if (!locationId) {
      const error = new Error("Location info missing")
      error.code = WEATHER_API_ERRORS.LOCATION_INFO_MISSING
      throw error
    }

    const [hourlyEnabled, alertEnabled, supportsAdvancedFeatures] = await Promise.all([
      SettingsService.isHourlyForecastEnabled(),
      SettingsService.isAlertEnabled(),
      DeviceService.isProductInList(ADVANCED_FEATURE_PRODUCT_BLACKLIST).then(
        (isBlocked) => !isBlocked
      )
    ])
    const payload = {
      locationId,
      modules: this.buildModulePayload(localWeatherData, {
        enableHourly: supportsAdvancedFeatures && hourlyEnabled,
        enableAlerts: supportsAdvancedFeatures && alertEnabled
      })
    }

    const url = `${WEATHER_API_PRIVATE.HOST}${WEATHER_API.SYNC_PATH}`
    const weatherData = await fetchJson(url, {
      method: "POST",
      data: JSON.stringify(payload),
      header: buildAuthHeaders({
        "Content-Type": "application/json"
      })
    })

    if (!DataService.validateWeatherData(weatherData)) {
      throw new Error(`天气接口返回异常: ${weatherData?.code || "unknown"}`)
    }

    return {
      ...weatherData,
      location: weatherData.location || locationName || ""
    }
  }

  /**
   * 构建请求的模块参数
   * 根据本地已有的数据长度和用户设置决定请求哪些模块
   * @param {Object} weatherData - 本地天气数据
   * @param {Object} [options]
   * @param {boolean} [options.enableHourly] - 是否请求逐小时预报
   * @param {boolean} [options.enableAlerts] - 是否请求预警
   * @returns {Object} 模块参数对象 { daily, hourly, alerts }
   */
  buildModulePayload(weatherData, options = {}) {
    const {enableHourly = false, enableAlerts = false} = options
    const dailyLength = DataService.getDailyList(weatherData).length
    const hourlyLength = DataService.getHourlyList(weatherData).length

    return {
      daily: this.buildModuleRange(dailyLength, WEATHER_API.DAILY_RANGE, "d"),
      hourly: enableHourly ? this.buildHourlyRange(hourlyLength) : null,
      alerts: enableAlerts || false
    }
  }

  /**
   * 构建模块的 range 参数
   * 格式为 "{数量}{后缀}"，如 "15d"、"24h"
   * @param {number} length - 本地已有数据长度
   * @param {string} fallbackRange - 默认 range 值
   * @param {string} suffix - 后缀标识（"d" 或 "h"）
   * @returns {string} range 字符串
   */
  buildModuleRange(length, fallbackRange, suffix) {
    const normalizedLength = Number.isFinite(length) ? Math.floor(length) : 0
    return normalizedLength > 0 ? `${normalizedLength}${suffix}` : fallbackRange
  }

  /**
   * 构建逐小时预报 range 参数
   * 后端仅支持 24h、72h、168h，按本地已有长度归一化到最近的下档。
   * @param {number} length - 本地已有逐小时数据长度
   * @returns {string} 逐小时 range 字符串
   */
  buildHourlyRange(length) {
    const normalizedLength = Number.isFinite(length) ? Math.floor(length) : 0
    if (normalizedLength >= 168) {
      return "168h"
    }
    if (normalizedLength >= 72) {
      return "72h"
    }
    return WEATHER_API.HOURLY_RANGE
  }

  /**
   * 从天气数据中提取 locationId
   * 优先使用直接字段，其次从 fxLink 中正则提取
   * @param {Object|null} weatherData - 天气数据
   * @returns {string|null} locationId，提取失败返回 null
   */
  extractLocationId(weatherData) {
    if (!weatherData) return null

    const rawId = weatherData.locationId
    if (rawId) {
      const parsedId = String(rawId).trim()
      if (parsedId) return parsedId
    }

    const fxLink = this.resolveFxLink(weatherData)
    if (!fxLink) return null

    // 优先匹配 -数字.html 结尾的标准格式
    const suffixMatch = fxLink.match(/-(\d+)(?:\.html)?$/i)
    if (suffixMatch && suffixMatch[1]) return suffixMatch[1]

    return null
  }

  /**
   * 获取天气数据的 fxLink 字段
   * @param {Object} weatherData - 天气数据
   * @returns {string} fxLink 字符串，不存在返回空字符串
   */
  resolveFxLink(weatherData) {
    if (typeof weatherData.fxLink === "string") return weatherData.fxLink
    return ""
  }
}

export default new WeatherApiService()
