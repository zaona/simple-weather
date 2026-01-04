import file from '@system.file'
import { showToast } from '@system.prompt'
import { STORAGE, MESSAGES, TOAST_DURATION } from './config.js'

const DEFAULT_SETTINGS = {
  autoUpdateEnabled: false,
  hourlyForecastEnabled: false
}

class SettingsService {
  constructor() {
    this.cache = null
  }

  /**
   * 读取设置文件
   * @returns {Promise<Object>}
   */
  readSettings() {
    if (this.cache) {
      return Promise.resolve(this.cache)
    }

    return new Promise((resolve) => {
      file.readText({
        uri: STORAGE.SETTINGS_FILE,
        success: (data) => {
          try {
            const settings = JSON.parse(data.text)
            this.cache = { ...DEFAULT_SETTINGS, ...settings }
            resolve(this.cache)
          } catch (error) {
            console.error('设置解析失败:', error)
            resolve({ ...DEFAULT_SETTINGS })
          }
        },
        fail: () => {
          resolve({ ...DEFAULT_SETTINGS })
        }
      })
    })
  }

  /**
   * 保存设置
   * @param {Object} settings
   * @returns {Promise<boolean>}
   */
  saveSettings(settings) {
    const dataText = JSON.stringify(settings)
    return new Promise((resolve) => {
      file.writeText({
        uri: STORAGE.SETTINGS_FILE,
        text: dataText,
        success: () => {
          this.cache = { ...settings }
          resolve(true)
        },
        fail: (error) => {
          console.error('设置保存失败:', error)
          showToast({
            message: MESSAGES.SETTINGS_SAVE_ERROR,
            duration: TOAST_DURATION.NORMAL
          })
          resolve(false)
        }
      })
    })
  }

  /**
   * 获取完整设置
   * @returns {Promise<Object>}
   */
  async getSettings() {
    const settings = await this.readSettings()
    return { ...DEFAULT_SETTINGS, ...settings }
  }

  /**
   * 检查自动更新是否开启
   * @returns {Promise<boolean>}
   */
  async isAutoUpdateEnabled() {
    const settings = await this.getSettings()
    return !!settings.autoUpdateEnabled
  }

  /**
   * 检查逐小时天气是否开启
   * @returns {Promise<boolean>}
   */
  async isHourlyForecastEnabled() {
    const settings = await this.getSettings()
    return !!settings.hourlyForecastEnabled
  }

  /**
   * 更新自动更新配置
   * @param {boolean} enabled
   * @returns {Promise<boolean>}
   */
  async setAutoUpdateEnabled(enabled) {
    const settings = await this.getSettings()
    const nextSettings = {
      ...settings,
      autoUpdateEnabled: !!enabled
    }
    return this.saveSettings(nextSettings)
  }

  /**
   * 更新逐小时天气配置
   * @param {boolean} enabled
   * @returns {Promise<boolean>}
   */
  async setHourlyForecastEnabled(enabled) {
    const settings = await this.getSettings()
    const nextSettings = {
      ...settings,
      hourlyForecastEnabled: !!enabled
    }
    return this.saveSettings(nextSettings)
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache = null
  }
}

export default new SettingsService()
