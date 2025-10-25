/**
 * 调试工具服务
 * 提供模拟数据注入、日志增强等调试功能
 * ⚠️ 发版时设置 DEBUG_MODE = false
 */

import file from '@system.file'
import { showToast } from '@system.prompt'
import { STORAGE, TOAST_DURATION, MESSAGES } from './config.js'

/**
 * 调试模式开关
 * true: 启用调试功能
 * false: 禁用调试功能（发版时使用）
 */
const DEBUG_MODE = false  // ⚠️ 发版时改为 false

/**
 * 模拟天气数据
 * 用于测试和开发
 */
const MOCK_WEATHER_DATA = {
  location: "北京",
  updateTime: new Date().toISOString(),
  daily: [
    {
      fxDate: "2025-10-20",
      tempMax: "25",
      tempMin: "15",
      textDay: "晴",
      textNight: "晴",
      iconDay: 100,
      iconNight: 150,
      windDirDay: "西北风",
      windDirNight: "西北风",
      windScaleDay: "3-4",
      windScaleNight: "1-2",
      windSpeedDay: "20",
      windSpeedNight: "10",
      wind360Day: "315",
      wind360Night: "315",
      humidity: "45",
      precip: "0.0",
      pressure: "1015",
      vis: "25",
      cloud: "10",
      uvIndex: "5",
      sunrise: "06:30",
      sunset: "18:45",
      moonrise: "19:30",
      moonset: "07:45",
      moonPhase: "上弦月"
    },
    {
      fxDate: "2025-10-21",
      tempMax: "26",
      tempMin: "16",
      textDay: "多云",
      textNight: "多云",
      iconDay: 101,
      iconNight: 151,
      windDirDay: "西风",
      windDirNight: "西风",
      windScaleDay: "2-3",
      windScaleNight: "1-2",
      windSpeedDay: "15",
      windSpeedNight: "8",
      wind360Day: "270",
      wind360Night: "270",
      humidity: "50",
      precip: "0.0",
      pressure: "1012",
      vis: "20",
      cloud: "30",
      uvIndex: "4",
      sunrise: "06:31",
      sunset: "18:44",
      moonrise: "20:15",
      moonset: "08:30",
      moonPhase: "满月"
    },
    {
      fxDate: "2025-10-22",
      tempMax: "24",
      tempMin: "14",
      textDay: "小雨",
      textNight: "阴",
      iconDay: 305,
      iconNight: 104,
      windDirDay: "东风",
      windDirNight: "东风",
      windScaleDay: "3-4",
      windScaleNight: "2-3",
      windSpeedDay: "22",
      windSpeedNight: "12",
      wind360Day: "90",
      wind360Night: "90",
      humidity: "75",
      precip: "5.2",
      pressure: "1008",
      vis: "15",
      cloud: "80",
      uvIndex: "2",
      sunrise: "06:32",
      sunset: "18:43",
      moonrise: "21:00",
      moonset: "09:15",
      moonPhase: "满月"
    },
    {
      fxDate: "2025-10-23",
      tempMax: "22",
      tempMin: "13",
      textDay: "阴",
      textNight: "晴",
      iconDay: 104,
      iconNight: 150,
      windDirDay: "北风",
      windDirNight: "北风",
      windScaleDay: "4-5",
      windScaleNight: "3-4",
      windSpeedDay: "28",
      windSpeedNight: "18",
      wind360Day: "0",
      wind360Night: "0",
      humidity: "60",
      precip: "0.0",
      pressure: "1018",
      vis: "22",
      cloud: "60",
      uvIndex: "3",
      sunrise: "06:33",
      sunset: "18:42",
      moonrise: "21:45",
      moonset: "10:00",
      moonPhase: "亏凸月"
    },
    {
      fxDate: "2025-10-24",
      tempMax: "23",
      tempMin: "12",
      textDay: "晴",
      textNight: "晴",
      iconDay: 100,
      iconNight: 150,
      windDirDay: "南风",
      windDirNight: "南风",
      windScaleDay: "2-3",
      windScaleNight: "1-2",
      windSpeedDay: "16",
      windSpeedNight: "9",
      wind360Day: "180",
      wind360Night: "180",
      humidity: "42",
      precip: "0.0",
      pressure: "1020",
      vis: "28",
      cloud: "5",
      uvIndex: "6",
      sunrise: "06:34",
      sunset: "18:41",
      moonrise: "22:30",
      moonset: "10:45",
      moonPhase: "下弦月"
    },
    {
      fxDate: "2025-10-25",
      tempMax: "25",
      tempMin: "14",
      textDay: "晴",
      textNight: "多云",
      iconDay: 100,
      iconNight: 151,
      windDirDay: "西南风",
      windDirNight: "西南风",
      windScaleDay: "2-3",
      windScaleNight: "1-2",
      windSpeedDay: "14",
      windSpeedNight: "7",
      wind360Day: "225",
      wind360Night: "225",
      humidity: "38",
      precip: "0.0",
      pressure: "1022",
      vis: "30",
      cloud: "8",
      uvIndex: "7",
      sunrise: "06:35",
      sunset: "18:40",
      moonrise: "23:15",
      moonset: "11:30",
      moonPhase: "残月"
    },
    {
      fxDate: "2025-10-26",
      tempMax: "27",
      tempMin: "15",
      textDay: "多云",
      textNight: "晴",
      iconDay: 101,
      iconNight: 150,
      windDirDay: "南风",
      windDirNight: "南风",
      windScaleDay: "3-4",
      windScaleNight: "2-3",
      windSpeedDay: "20",
      windSpeedNight: "11",
      wind360Day: "180",
      wind360Night: "180",
      humidity: "35",
      precip: "0.0",
      pressure: "1019",
      vis: "27",
      cloud: "25",
      uvIndex: "5",
      sunrise: "06:36",
      sunset: "18:39",
      moonrise: "00:00",
      moonset: "12:15",
      moonPhase: "新月"
    }
  ]
}

/**
 * 调试工具类
 */
class DebugService {
  /**
   * 检查是否为调试模式
   * @returns {boolean}
   */
  isDebugMode() {
    return DEBUG_MODE
  }

  /**
   * 注入模拟数据
   * 将模拟的天气数据写入到本地文件
   * @returns {Promise<boolean>}
   */
  injectMockData() {
    if (!DEBUG_MODE) {
      console.log('非调试模式，跳过注入模拟数据')
      return Promise.resolve(false)
    }

    return new Promise((resolve) => {
      const mockDataText = JSON.stringify(MOCK_WEATHER_DATA)

      file.writeText({
        uri: STORAGE.WEATHER_FILE,
        text: mockDataText,
        success: () => {
          console.log('模拟数据注入成功')
          showToast({
            message: MESSAGES.DEBUG_MOCK_DATA_LOADED,
            duration: TOAST_DURATION.SHORT
          })
          resolve(true)
        },
        fail: (data, code) => {
          console.error('模拟数据注入失败:', code)
          showToast({
            message: `${MESSAGES.DEBUG_MOCK_DATA_FAILED}: ${code}`,
            duration: TOAST_DURATION.NORMAL
          })
          resolve(false)
        }
      })
    })
  }

  /**
   * 清除本地数据
   * 用于测试无数据场景
   * @returns {Promise<boolean>}
   */
  clearLocalData() {
    if (!DEBUG_MODE) {
      console.log('非调试模式，跳过清除数据')
      return Promise.resolve(false)
    }

    return new Promise((resolve) => {
      file.delete({
        uri: STORAGE.WEATHER_FILE,
        success: () => {
          console.log('本地数据已清除')
          showToast({
            message: MESSAGES.DEBUG_DATA_CLEARED,
            duration: TOAST_DURATION.SHORT
          })
          resolve(true)
        },
        fail: (data, code) => {
          console.log('清除数据失败（可能文件不存在）:', code)
          resolve(false)
        }
      })
    })
  }

  /**
   * 增强日志输出
   * 在调试模式下输出更详细的信息
   * @param {string} tag - 日志标签
   * @param {any} data - 要输出的数据
   */
  log(tag, data) {
    if (!DEBUG_MODE) return

    const timestamp = new Date().toLocaleTimeString()
    console.log(`[${timestamp}] [${tag}]`, data)
  }

  /**
   * 获取模拟数据（不写入文件）
   * @returns {Object}
   */
  getMockData() {
    return MOCK_WEATHER_DATA
  }
}

// 导出单例
export default new DebugService()

