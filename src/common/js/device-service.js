import device from "@system.device"
import {
  RECT_SCREEN_PRODUCTS,
  NARROW_RECT_SCREEN_PRODUCTS,
  CIRCLE_SCREEN_PRODUCTS
} from "./config.js"

/**
 * 设备信息服务
 * 负责读取当前设备的 product 信息，用于特性开关控制
 */
class DeviceService {
  /** @type {Promise<{product: string, screenWidth: number, screenHeight: number}>|null} */
  _deviceInfoPromise = null

  /**
   * 获取设备信息（带缓存，仅首次调用时请求 device.getInfo）
   * @returns {Promise<{product: string, screenWidth: number, screenHeight: number}>}
   */
  _getDeviceInfo() {
    if (!this._deviceInfoPromise) {
      this._deviceInfoPromise = new Promise((resolve) => {
        if (!device || typeof device.getInfo !== "function") {
          resolve({product: "", screenWidth: 0, screenHeight: 0})
          return
        }

        device.getInfo({
          success: (info = {}) => {
            resolve({
              product: info.product || "",
              screenWidth: Number(info.screenWidth) || 0,
              screenHeight: Number(info.screenHeight) || 0
            })
          },
          fail: () => {
            resolve({product: "", screenWidth: 0, screenHeight: 0})
          }
        })
      })
    }
    return this._deviceInfoPromise
  }

  /**
   * 规范化产品名称为小写
   * @param {string} product - 原始产品名称
   * @returns {string} 小写产品名称
   */
  normalizeProduct(product) {
    return (product || "").toLowerCase()
  }

  /**
   * 获取当前设备的 product 字段
   * @returns {Promise<string>}
   */
  async getProduct() {
    const info = await this._getDeviceInfo()
    return info.product
  }

  /**
   * 获取设备屏幕宽高
   * @returns {Promise<{width: number, height: number}>}
   */
  async getScreenInfo() {
    const info = await this._getDeviceInfo()
    return {width: info.screenWidth, height: info.screenHeight}
  }

  /**
   * 判断是否为模拟器
   * @returns {Promise<boolean>}
   */
  async isEmulator() {
    const product = await this.getProduct()
    return this.normalizeProduct(product) === "emulator-vela"
  }

  /**
   * 判断当前设备是否在指定产品列表中
   * @param {string[]} productList - 产品名称列表
   * @returns {Promise<boolean>}
   */
  async isProductInList(productList = []) {
    if (!Array.isArray(productList) || productList.length === 0) {
      return false
    }

    const product = await this.getProduct()
    const normalized = this.normalizeProduct(product)
    if (!normalized) {
      return false
    }

    const normalizedList = productList.map((item) => this.normalizeProduct(item))
    return normalizedList.includes(normalized)
  }

  /**
   * 判断是否为矩形屏设备（含模拟器矩形模式）
   * @returns {Promise<boolean>}
   */
  async isRectLike() {
    if (await this.isProductInList(RECT_SCREEN_PRODUCTS)) {
      return true
    }
    if (await this.isEmulator()) {
      const {width} = await this.getScreenInfo()
      return width === 432
    }
    return false
  }

  /**
   * 判断是否为窄矩形屏设备（含模拟器窄矩形模式）
   * @returns {Promise<boolean>}
   */
  async isNarrowRectLike() {
    if (await this.isProductInList(NARROW_RECT_SCREEN_PRODUCTS)) {
      return true
    }
    if (await this.isEmulator()) {
      const {width} = await this.getScreenInfo()
      return width === 336
    }
    return false
  }

  /**
   * 判断是否为圆形屏设备（含模拟器圆形模式）
   * @returns {Promise<boolean>}
   */
  async isCircleLike() {
    if (await this.isProductInList(CIRCLE_SCREEN_PRODUCTS)) {
      return true
    }
    if (await this.isEmulator()) {
      const {width, height} = await this.getScreenInfo()
      return width === height
    }
    return false
  }
}

export default new DeviceService()
