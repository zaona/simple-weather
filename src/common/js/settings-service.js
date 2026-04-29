import file from "@system.file"
import {showToast} from "@system.prompt"
import {STORAGE, MESSAGES, TOAST_DURATION} from "./config.js"

const DEFAULT_SETTINGS = {
  autoUpdateEnabled: false,
  hourlyForecastEnabled: false,
  alertEnabled: false,
  reduceAnimationEnabled: false
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
            this.cache = {...DEFAULT_SETTINGS, ...settings}
            resolve(this.cache)
          } catch (error) {
            console.error("设置解析失败:", error)
            resolve({...DEFAULT_SETTINGS})
          }
        },
        fail: () => {
          resolve({...DEFAULT_SETTINGS})
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
          this.cache = {...settings}
          resolve(true)
        },
        fail: (error) => {
          console.error("设置保存失败:", error)
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
  async getSetting(key) {
    const settings = await this.readSettings()
    return !!settings[key]
  }

  async setSetting(key, enabled) {
    const settings = await this.readSettings()
    return this.saveSettings({...settings, [key]: !!enabled})
  }

  isAutoUpdateEnabled() {
    return this.getSetting("autoUpdateEnabled")
  }

  isHourlyForecastEnabled() {
    return this.getSetting("hourlyForecastEnabled")
  }

  isReduceAnimationEnabled() {
    return this.getSetting("reduceAnimationEnabled")
  }

  setAutoUpdateEnabled(enabled) {
    return this.setSetting("autoUpdateEnabled", enabled)
  }

  setHourlyForecastEnabled(enabled) {
    return this.setSetting("hourlyForecastEnabled", enabled)
  }

  isAlertEnabled() {
    return this.getSetting("alertEnabled")
  }

  setAlertEnabled(enabled) {
    return this.setSetting("alertEnabled", enabled)
  }

  setReduceAnimationEnabled(enabled) {
    return this.setSetting("reduceAnimationEnabled", enabled)
  }

  clearCache() {
    this.cache = null
  }
}

export default new SettingsService()
