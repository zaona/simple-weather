/**
 * 应用配置管理
 * 统一管理所有常量配置和消息文本
 */

// 存储和文件配置
export const STORAGE = {
  // 天气数据存储路径
  WEATHER_FILE: "internal://files/weather.txt",
  // 设置存储路径
  SETTINGS_FILE: "internal://files/settings.txt"
}

// 连接相关配置
export const CONNECTION = {
  // 连接诊断超时（毫秒）
  DIAGNOSIS_TIMEOUT: 10000
}

// 数据操作配置
export const DATA = {
  // 文件保存最大重试次数
  MAX_SAVE_RETRIES: 2,
  // 保存重试延迟（毫秒）
  SAVE_RETRY_DELAY: 500,
  // 缓存有效期（毫秒）- 5分钟
  CACHE_EXPIRY: 5 * 60 * 1000
}

// 自动更新配置
export const AUTO_UPDATE = {
  // 数据过期阈值（毫秒） - 1小时
  EXPIRY_THRESHOLD: 60 * 60 * 1000
}

// 手动更新配置
export const MANUAL_UPDATE = {
  // 手动触发更新的最小间隔（毫秒） - 10分钟
  MIN_INTERVAL: 10 * 60 * 1000
}

// 天气 API 配置（公共参数）
export const WEATHER_API = {
  DAILY_RANGE: "7d",
  HOURLY_RANGE: "24h",
  REQUEST_TIMEOUT: 10000,
  SYNC_PATH: "/api/weather/sync"
}

// 禁用高级功能的设备 product 名称黑名单
export const ADVANCED_FEATURE_PRODUCT_BLACKLIST = ["xiaomi smart band 9", "xiaomi smart band 10"]

// 矩形屏设备 product 名称列表
export const RECT_SCREEN_PRODUCTS = ["redmi watch 5", "redmi watch 6", "o65m"]

// 窄矩形屏设备 product 名称列表
export const NARROW_RECT_SCREEN_PRODUCTS = ["emulator-vela", "xiaomi smart band 9 pro"]

// 圆形屏设备 product 名称列表
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

// 用户提示消息
export const MESSAGES = {
  // 成功消息
  DATA_UPDATED: "数据已更新",

  // 错误消息
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

  // 设置消息
  SETTINGS_SAVED: "已保存，重启后生效",

  // 调试消息
  DEBUG_MOCK_DATA_LOADED: "模拟数据加载",
  DEBUG_MOCK_DATA_FAILED: "模拟数据失败",
  DEBUG_DATA_CLEARED: "数据已清除"
}

// 提示持续时间（毫秒）
export const TOAST_DURATION = {
  SHORT: 1000,
  NORMAL: 2000,
  LONG: 3000
}

// 调试开关（发版时设为 false）
export const DEBUG_ENABLED = false
