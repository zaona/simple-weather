/**
 * 应用配置管理
 * 统一管理所有常量配置和消息文本
 */

// ---- 存储和文件配置 ----
/** @type {{ WEATHER_FILE: string, SETTINGS_FILE: string }} */
export const STORAGE = {
  WEATHER_FILE: "internal://files/weather.txt",
  SETTINGS_FILE: "internal://files/settings.txt"
}

// ---- 数据操作配置 ----
/** @type {{ MAX_SAVE_RETRIES: number, SAVE_RETRY_DELAY: number, CACHE_EXPIRY: number }} */
export const DATA = {
  MAX_SAVE_RETRIES: 2,
  SAVE_RETRY_DELAY: 500,
  CACHE_EXPIRY: 5 * 60 * 1000
}

// ---- 自动更新配置 ----
/** @type {{ EXPIRY_THRESHOLD: number }} */
export const AUTO_UPDATE = {
  EXPIRY_THRESHOLD: 60 * 60 * 1000
}

// ---- 手动更新配置 ----
/** @type {{ MIN_INTERVAL: number }} */
export const MANUAL_UPDATE = {
  MIN_INTERVAL: 10 * 60 * 1000
}

// ---- 天气 API 公共参数 ----
/** @type {{ DAILY_RANGE: string, HOURLY_RANGE: string, REQUEST_TIMEOUT: number, SYNC_PATH: string }} */
export const WEATHER_API = {
  DAILY_RANGE: "7d",
  HOURLY_RANGE: "24h",
  REQUEST_TIMEOUT: 10000,
  SYNC_PATH: "/api/weather/sync"
}

// ---- 设备兼容性列表 ----
/** @type {string[]} 禁用高级功能的设备黑名单 */
export const ADVANCED_FEATURE_PRODUCT_BLACKLIST = ["xiaomi smart band 9", "xiaomi smart band 10", "xiaomi smart band 10 pro"]

/** @type {string[]} 矩形屏设备 */
export const RECT_SCREEN_PRODUCTS = ["redmi watch 5", "redmi watch 6", "o65m"]

/** @type {string[]} 窄矩形屏设备 */
export const NARROW_RECT_SCREEN_PRODUCTS = ["emulator-vela", "xiaomi smart band 9 pro", "xiaomi smart band 10 pro"]

/** @type {string[]} 圆形屏设备 */
export const CIRCLE_SCREEN_PRODUCTS = [
  "xiaomi watch s3",
  "xiaomi watch s3 esim",
  "xiaomi watch s4",
  "xiaomi watch s4 esim",
  "xiaomi watch s4 sport",
  "marconi_o62m_watch",
  "xiaomi watch s4 41mm",
  "xiaomi watch s5 46mm",
  "xiaomi watch s5 esim 46mm"
]

// ---- 用户提示消息 ----
/** @type {{ [key: string]: string }} */
export const MESSAGES = {
  DATA_UPDATED: "数据已更新",
  DATA_EXPIRED: "数据已过期",
  DATA_MISSING: "数据存在缺失",
  DATA_FORMAT_ERROR: "数据格式错误",
  DATA_PARSE_ERROR: "数据解析失败",
  DATA_SAVE_ERROR: "数据保存失败",
  FETCH_WEATHER_ERROR: "获取天气失败",
  NO_LOCAL_DATA: "本地无数据",
  NO_DATE_RECEIVED: "未接收到日期",
  NO_DATA_FOR_DATE: "数据缺失",
  NAVIGATION_ERROR: "跳转详情页失败",
  LOCATION_INFO_MISSING: "无法获取本地位置信息",
  SETTINGS_SAVE_ERROR: "设置保存失败",
  SETTINGS_SAVED: "已保存，重启后生效",
  DEBUG_MOCK_DATA_LOADED: "模拟数据加载",
  DEBUG_MOCK_DATA_FAILED: "模拟数据失败",
  DEBUG_DATA_CLEARED: "数据已清除"
}

// ---- 提示时长 ----
/** @type {{ SHORT: number, NORMAL: number, LONG: number }} */
export const TOAST_DURATION = {
  SHORT: 1000,
  NORMAL: 2000,
  LONG: 3000
}

/** @type {boolean} 调试开关，发版时设为 false */
export const DEBUG_ENABLED = false
