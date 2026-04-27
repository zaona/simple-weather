/**
 * 全局方法注册
 * 将公共服务、工具类和配置常量挂载到 global，避免各页面重复 import
 */

import DataService from "./data-service.js"
import ConnectionService from "./connection-service.js"
import SettingsService from "./settings-service.js"
import DeviceService from "./device-service.js"
import RefreshController from "./refresh-controller.js"
import DebugService from "./debug-service.js"
import {DateUtils, WeatherDataUtils} from "./weather-utils.js"
import {WEATHER_API_ERRORS} from "./weather-api-service.js"
import {
  MESSAGES,
  TOAST_DURATION,
  ADVANCED_FEATURE_PRODUCT_BLACKLIST,
  RECT_SCREEN_PRODUCTS,
  CIRCLE_SCREEN_PRODUCTS,
  NARROW_RECT_SCREEN_PRODUCTS
} from "./config.js"

global.DataService = DataService
global.ConnectionService = ConnectionService
global.SettingsService = SettingsService
global.DeviceService = DeviceService
global.RefreshController = RefreshController
global.DebugService = DebugService
global.DateUtils = DateUtils
global.WeatherDataUtils = WeatherDataUtils
global.WEATHER_API_ERRORS = WEATHER_API_ERRORS
global.MESSAGES = MESSAGES
global.TOAST_DURATION = TOAST_DURATION
global.ADVANCED_FEATURE_PRODUCT_BLACKLIST = ADVANCED_FEATURE_PRODUCT_BLACKLIST
global.RECT_SCREEN_PRODUCTS = RECT_SCREEN_PRODUCTS
global.CIRCLE_SCREEN_PRODUCTS = CIRCLE_SCREEN_PRODUCTS
global.NARROW_RECT_SCREEN_PRODUCTS = NARROW_RECT_SCREEN_PRODUCTS
