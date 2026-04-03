/**
 * 天气 API 服务
 * 负责请求后端聚合天气接口，并基于本地缓存中的 locationId 拉取新数据
 */

import fetch from "@system.fetch"
import DataService from "./data-service.js"
import SettingsService from "./settings-service.js"
import DeviceService from "./device-service.js"
import {WEATHER_API, ADVANCED_FEATURE_PRODUCTS} from "./config.js"
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

function buildUrl(base, path) {
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${trimmedBase}${normalizedPath}`
}

class WeatherApiService {
  async fetchWeatherData() {
    const {locationId, locationName} = await this.deriveLocationInfoFromCache()

    if (!locationId) {
      const error = new Error("Location info missing")
      error.code = WEATHER_API_ERRORS.LOCATION_INFO_MISSING
      throw error
    }

    const [hourlyEnabled, supportsAdvancedFeatures] = await Promise.all([
      SettingsService.isHourlyForecastEnabled(),
      DeviceService.isProductSupported(ADVANCED_FEATURE_PRODUCTS)
    ])
    const payload = {
      locationId,
      modules: {
        daily: WEATHER_API.DAILY_RANGE,
        hourly:
          supportsAdvancedFeatures && hourlyEnabled ? WEATHER_API.HOURLY_RANGE : null
      }
    }

    const url = buildUrl(WEATHER_API_PRIVATE.HOST, WEATHER_API_PRIVATE.SYNC_PATH)
    const weatherData = await fetchJson(url, {
      method: "POST",
      data: JSON.stringify(payload),
      header: {
        "Content-Type": "application/json"
      }
    })

    if (!DataService.validateWeatherData(weatherData)) {
      throw new Error(`天气接口返回异常: ${weatherData?.code || "unknown"}`)
    }

    return {
      ...weatherData,
      location: weatherData.location || locationName || ""
    }
  }

  async deriveLocationInfoFromCache() {
    const cachedWeather = await DataService.readWeatherData(true)
    const currentLocationId = this.extractLocationId(cachedWeather)
    const currentLocationName = this.extractLocationName(cachedWeather)
    if (currentLocationId) {
      return {
        locationId: currentLocationId,
        locationName: currentLocationName
      }
    }

    const rawWeather = await DataService.readRawWeatherData()
    return {
      locationId: this.extractLocationId(rawWeather),
      locationName: this.extractLocationName(rawWeather)
    }
  }

  extractLocationName(weatherData) {
    if (!weatherData) {
      return ""
    }

    const rawName = weatherData.location || weatherData.name || ""
    return typeof rawName === "string" ? rawName.trim() : ""
  }

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

    return null
  }
}

export default new WeatherApiService()
