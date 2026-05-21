import device from "@system.device"

/**
 * 设备信息服务
 * 负责读取当前设备的 product 信息，用于特性开关控制
 */
class DeviceService {
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
    return new Promise((resolve) => {
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
    })
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
}

export default new DeviceService()
