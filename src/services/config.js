/**
 * 应用配置管理
 * 统一管理所有常量配置和消息文本
 */

// 存储和文件配置
export const STORAGE = {
  // 天气数据存储路径
  WEATHER_FILE: 'internal://files/weather.txt'
}

// 连接相关配置
export const CONNECTION = {
  // 最大重试次数
  MAX_READY_RETRIES: 5,
  // ready响应发送间隔（毫秒）
  READY_RETRY_DELAY: 200,
  // 连接重连延迟（毫秒）
  RECONNECT_DELAY: 5000
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

// 用户提示消息
export const MESSAGES = {
  // 成功消息
  DATA_UPDATED: '数据已更新',
  DATA_SAVED: '数据已保存',
  CONNECTION_SUCCESS: '连接成功',
  
  // 错误消息
  DATA_EXPIRED: '数据已过期',
  DATA_MISSING: '数据存在缺失',
  DATA_FORMAT_ERROR: '数据格式错误',
  DATA_PARSE_ERROR: '数据解析失败',
  DATA_SAVE_ERROR: '数据保存失败',
  NO_LOCAL_DATA: '本地无数据',
  NO_DATE_RECEIVED: '未接收到日期',
  NO_DATA_FOR_DATE: '数据缺失',
  CANNOT_READ_DATA: '无法读取天气数据',
  NAVIGATION_ERROR: '跳转详情页失败',
  
  // 连接消息
  CONNECTION_ERROR: '连接错误',
  CONNECTION_CLOSED: '连接已关闭',
  SEND_SUCCESS: '消息发送成功',
  SEND_ERROR: '发送失败'
}

// 提示持续时间（毫秒）
export const TOAST_DURATION = {
  SHORT: 1000,
  NORMAL: 2000,
  LONG: 3000
}

