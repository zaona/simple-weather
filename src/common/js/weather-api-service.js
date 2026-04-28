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

export const WEATHER_API_ERRORS = {
  LOCATION_INFO_MISSING: "LOCATION_INFO_MISSING"
}

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

function buildAuthHeaders(extraHeaders = {}) {
  return {
    "X-Client-Type": WEATHER_API_PRIVATE.AUTH.CLIENT_TYPE,
    "X-API-Key": WEATHER_API_PRIVATE.AUTH.API_KEY,
    ...extraHeaders
  }
}

class WeatherApiService {
  async fetchWeatherData() {
    const localWeatherData = await DataService.readWeatherData(true)
    const locationId = this.extractLocationId(localWeatherData)
    const locationName = DataService.getLocationName(localWeatherData)

    if (!locationId) {
      const error = new Error("Location info missing")
      error.code = WEATHER_API_ERRORS.LOCATION_INFO_MISSING
      throw error
    }

    const [hourlyEnabled, supportsAdvancedFeatures] = await Promise.all([
      SettingsService.isHourlyForecastEnabled(),
      DeviceService.isProductInList(ADVANCED_FEATURE_PRODUCT_BLACKLIST).then(
        (isBlocked) => !isBlocked
      )
    ])
    const payload = {
      locationId,
      modules: this.buildModulePayload(localWeatherData, {
        enableHourly: supportsAdvancedFeatures && hourlyEnabled
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

  buildModulePayload(weatherData, options = {}) {
    const {enableHourly = false} = options
    const dailyLength = DataService.getDailyList(weatherData).length
    const hourlyLength = DataService.getHourlyList(weatherData).length

    return {
      daily: this.buildModuleRange(dailyLength, WEATHER_API.DAILY_RANGE, "d"),
      hourly: enableHourly
        ? this.buildModuleRange(hourlyLength, WEATHER_API.HOURLY_RANGE, "h")
        : null
    }
  }

  buildModuleRange(length, fallbackRange, suffix) {
    const normalizedLength = Number.isFinite(length) ? Math.floor(length) : 0
    return normalizedLength > 0 ? `${normalizedLength}${suffix}` : fallbackRange
  }

  extractLocationId(weatherData) {
    if (!weatherData) return null

    const rawId = weatherData.locationId || weatherData.locationID
    if (rawId) {
      const parsedId = String(rawId).trim()
      if (parsedId) return parsedId
    }

    const fxLink = this.resolveFxLink(weatherData)
    if (!fxLink) return null

    const match = fxLink.match(/-(\d+)(?:\.html)?$/i)
    return match ? match[1] : null
  }

  resolveFxLink(weatherData) {
    if (typeof weatherData.fxLink === "string") return weatherData.fxLink

    const daily = weatherData.daily
    if (!daily) return ""

    if (typeof daily === "object" && !Array.isArray(daily)) {
      if (typeof daily.fxLink === "string") return daily.fxLink
      const nested = Array.isArray(daily.daily) ? daily.daily : []
      return nested.find((d) => typeof d.fxLink === "string")?.fxLink || ""
    }

    if (Array.isArray(daily)) {
      return daily.find((d) => typeof d.fxLink === "string")?.fxLink || ""
    }

    return ""
  }
}

export default new WeatherApiService()
