import device from "@system.device"

/**
 * 设备信息服务
 * 负责读取并缓存当前设备的 product 信息，用于特性开关控制
 */
class DeviceService {
  constructor() {
    this.product = ""
    this.fetchingPromise = null
  }

  normalizeProduct(product) {
    return (product || "").toLowerCase()
  }

  /**
   * 获取当前设备的 product 字段
   * @returns {Promise<string>}
   */
  async getProduct() {
    if (this.product) {
      return this.product
    }

    if (this.fetchingPromise) {
      return this.fetchingPromise
    }

    this.fetchingPromise = new Promise((resolve) => {
      if (!device || typeof device.getInfo !== "function") {
        resolve("")
        return
      }

      device.getInfo({
        success: (info = {}) => {
          resolve(info.product || "")
        },
        fail: () => {
          resolve("")
        }
      })
    }).then((product) => {
      this.product = product
      this.fetchingPromise = null
      return product
    })

    return this.fetchingPromise
  }

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
   * 判断当前设备是否在黑名单中
   * @param {string[]} blacklist
   * @returns {Promise<boolean>}
   */
  async isProductBlocked(blacklist = []) {
    return this.isProductInList(blacklist)
  }

  /**
   * 清除缓存，通常用于调试或切换设备
   */
  clearCache() {
    this.product = ""
    this.fetchingPromise = null
  }
}

export default new DeviceService()
