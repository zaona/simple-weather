/**
 * 连接管理服务
 * 统一管理 interconnect 连接、握手协议和消息传递
 * 连接由框架自动管理，本服务仅负责事件监听和消息收发
 */

import interconnect from "@system.interconnect"
import device from "@system.device"

class ConnectionService {
  constructor() {
    this.connection = null
    this.messageHandler = null
    this.manifest = null
  }

  /**
   * 初始化连接监听
   * 连接由框架自动建立/销毁，此处只注册事件处理器
   * @param {Function} onMessageCallback - 接收到数据消息时的回调函数
   * @returns {Object} 连接实例
   */
  init(onMessageCallback) {
    // 已初始化则仅更新消息处理器，避免重复创建
    if (this.connection) {
      this.messageHandler = onMessageCallback
      return this.connection
    }

    this.connection = interconnect.instance()
    this.messageHandler = onMessageCallback

    // 连接打开回调（含重连）
    this.connection.onopen = (data) => {
      console.log(`连接已打开, 是否重连: ${data.isReconnected}`)
      if (data.isReconnected) {
        this.handleHandshake()
      }
    }

    // 消息接收
    this.connection.onmessage = (data) => {
      this.handleMessage(data)
    }

    // 错误处理（区分错误码）
    this.connection.onerror = (error) => {
      if (error.code === 1001) {
        console.warn("手机端App未安装，无法建立连接")
      } else if (error.code === 1006) {
        console.warn("连接丢失")
      } else {
        console.error(`连接错误, code: ${error.code}, msg: ${error.data}`)
      }
    }

    // 关闭处理
    this.connection.onclose = (data) => {
      console.log(`连接关闭, code: ${data.code}, reason: ${data.data}`)
    }

    return this.connection
  }

  /**
   * 处理接收到的消息
   * @param {Object} data - 接收到的消息数据
   */
  handleMessage(data) {
    // 握手预检
    if (data.data === "start") {
      this.handleHandshake()
      return
    }

    // 设备信息请求
    if (data.data === "info") {
      this.handleInfoRequest()
      return
    }

    // 存储信息请求
    if (data.data === "storage") {
      this.handleStorageRequest()
      return
    }

    // 转发业务数据消息
    if (this.messageHandler) {
      this.messageHandler(data)
    }
  }

  getVersionName() {
    if (this.manifest) {
      return this.manifest.versionName || "unknown"
    }

    try {
      this.manifest = require("../../manifest.json")
      return this.manifest.versionName || "unknown"
    } catch (error) {
      console.warn("读取manifest版本失败:", error.message)
      return "unknown"
    }
  }

  getDeviceId() {
    return new Promise((resolve) => {
      if (!device || typeof device.getDeviceId !== "function") {
        resolve("")
        return
      }

      device.getDeviceId({
        success: (result = {}) => {
          resolve(result.deviceId || "")
        },
        fail: () => {
          resolve("")
        }
      })
    })
  }

  async handleInfoRequest() {
    if (!this.connection) return

    const versionName = this.getVersionName()
    const deviceId = await this.getDeviceId()

    this.connection.send({
      data: {
        action: "info",
        versionName,
        deviceId,
        timestamp: Date.now()
      },
      fail: (error) => {
        console.error("发送info响应失败:", error)
      }
    })
  }

  async handleStorageRequest() {
    if (!this.connection) return

    const [totalStorage, availableStorage] = await Promise.all([
      this.getTotalStorage(),
      this.getAvailableStorage()
    ])

    this.connection.send({
      data: {
        action: "storage",
        totalStorage,
        availableStorage,
        timestamp: Date.now()
      },
      fail: (error) => {
        console.error("发送storage响应失败:", error)
      }
    })
  }

  getTotalStorage() {
    return new Promise((resolve) => {
      device.getTotalStorage({
        success: (result = {}) => {
          resolve(result.totalStorage ?? 0)
        },
        fail: () => {
          resolve(0)
        }
      })
    })
  }

  getAvailableStorage() {
    return new Promise((resolve) => {
      device.getAvailableStorage({
        success: (result = {}) => {
          resolve(result.availableStorage ?? 0)
        },
        fail: () => {
          resolve(0)
        }
      })
    })
  }

  /**
   * 处理握手协议
   * 响应App端的start消息，发送ready确认
   */
  handleHandshake() {
    if (!this.connection) return

    this.connection.send({
      data: {
        action: "ready",
        timestamp: Date.now()
      },
      fail: (error) => {
        console.error("发送ready响应失败:", error)
      }
    })
  }

  /**
   * 关闭连接
   * 连接由框架自动管理，此处仅清理本地引用
   */
  close() {
    this.messageHandler = null
    this.connection = null
  }
}

// 导出单例
export default new ConnectionService()
