/**
 * 天气 API 服务
 * 负责通过 fetch 模块向和风天气请求数据，并基于本地缓存推导 locationId
 */

import fetch from "@system.fetch"
import DataService from "./data-service.js"
import {WEATHER_API} from "./config.js"
import WEATHER_API_PRIVATE from "./weather-api-config.js"

export const WEATHER_API_ERRORS = {
  LOCATION_INFO_MISSING: "LOCATION_INFO_MISSING"
}

/**
 * 快应用 fetch 的 Promise 封装
 * @param {string} url - 请求地址
 * @returns {Promise<Object>} - 解析后的 JSON 数据
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    fetch.fetch({
      url,
      method: "GET",
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
          } else {
            reject(new Error(`请求失败: ${statusCode}`))
          }
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
 * 构建 URL
 * @param {string} base - 基础域名
 * @param {string} path - API 路径
 * @param {Object} params - 查询参数
 * @returns {string}
 */
function buildUrl(base, path, params = {}) {
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const query = Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join("&")
  return `${trimmedBase}${normalizedPath}${query ? `?${query}` : ""}`
}

class WeatherApiService {
  /**
   * 获取包含地名的天气数据
   * @returns {Promise<Object>}
   */
  async fetchWeatherWithLocation() {
    const locationInfo = await this.deriveLocationInfoFromCache()

    if (!locationInfo) {
      const error = new Error("Location info missing")
      error.code = WEATHER_API_ERRORS.LOCATION_INFO_MISSING
      throw error
    }

    const url = buildUrl(WEATHER_API_PRIVATE.HOST, WEATHER_API.DAILY_PATH, {
      location: locationInfo.locationId,
      key: WEATHER_API_PRIVATE.KEY
    })

    const weatherData = await fetchJson(url)

    if (!weatherData || weatherData.code !== "200") {
      throw new Error(`天气接口返回异常: ${weatherData?.code || "unknown"}`)
    }

    return {
      ...weatherData,
      location: locationInfo.locationName || weatherData.location || "未知地点"
    }
  }

  /**
   * 获取逐小时天气预报
   * @returns {Promise<Object>}
   */
  async fetchHourlyForecast() {
    const locationInfo = await this.deriveLocationInfoFromCache()

    if (!locationInfo) {
      const error = new Error("Location info missing")
      error.code = WEATHER_API_ERRORS.LOCATION_INFO_MISSING
      throw error
    }

    const url = buildUrl(WEATHER_API_PRIVATE.HOST, WEATHER_API.HOURLY_PATH, {
      location: locationInfo.locationId,
      key: WEATHER_API_PRIVATE.KEY
    })

    const hourlyData = await fetchJson(url)

    if (!hourlyData || hourlyData.code !== "200") {
      throw new Error(`逐小时天气接口返回异常: ${hourlyData?.code || "unknown"}`)
    }

    return {
      ...hourlyData,
      location: locationInfo.locationName || hourlyData.location || ""
    }
  }

  /**
   * 从缓存中提取 locationId 与地名
   * @returns {Promise<{locationId: string, locationName: string} | null>}
   */
  async deriveLocationInfoFromCache() {
    const cachedWeather = await DataService.readWeatherData(true)

    if (!cachedWeather) {
      return null
    }

    const locationId = this.extractLocationId(cachedWeather)

    if (!locationId) {
      return null
    }

    return {
      locationId,
      locationName: cachedWeather.location || cachedWeather.name || ""
    }
  }

  /**
   * 从 fxLink 或 locationId 字段中提取 ID
   * @param {Object} weatherData - 本地天气数据
   * @returns {string|null}
   */
  extractLocationId(weatherData) {
    if (!weatherData) {
      return null
    }

    const rawId = weatherData.locationId || weatherData.locationID
    if (rawId) {
      const parsedId = String(rawId).trim()
      if (parsedId) {
        return parsedId
      }
    }

    let fxLink = ""
    if (typeof weatherData.fxLink === "string") {
      fxLink = weatherData.fxLink
    } else if (Array.isArray(weatherData.daily) && weatherData.daily.length > 0) {
      const firstDayLink = weatherData.daily.find((day) => typeof day.fxLink === "string")
      fxLink = firstDayLink?.fxLink || ""
    }

    if (!fxLink) {
      return null
    }

    const suffixMatch = fxLink.match(/-(\d+)(?:\.html)?$/i)
    if (suffixMatch && suffixMatch[1]) {
      return suffixMatch[1]
    }

    const allDigits = fxLink.match(/(\d+)/g)
    if (allDigits && allDigits.length) {
      return allDigits[allDigits.length - 1]
    }

    return null
  }
}

export default new WeatherApiService()
