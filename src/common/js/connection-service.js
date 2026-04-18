/**
 * 连接管理服务
 * 统一管理 interconnect 连接、握手协议和消息传递
 */

import interconnect from "@system.interconnect"
import device from "@system.device"
import {CONNECTION} from "./config.js"

/**
 * 连接服务类
 * 提供连接初始化、消息处理、握手协议等功能
 */
class ConnectionService {
  constructor() {
    // interconnect 连接实例
    this.connection = null
    // 消息处理回调函数
    this.messageHandler = null
    // manifest缓存，避免每次info请求重复加载
    this.manifest = null
  }

  /**
   * 初始化并打开连接
   * @param {Function} onMessageCallback - 接收到数据消息时的回调函数
   * @returns {Object} 连接实例
   */
  init(onMessageCallback) {
    // 如果已有连接，先关闭
    if (this.connection) {
      this.close()
    }

    // 创建新的连接实例
    this.connection = interconnect.instance()
    this.messageHandler = onMessageCallback

    // 设置消息接收处理
    this.connection.onmessage = (data) => {
      this.handleMessage(data)
    }

    // 设置错误处理
    this.connection.onerror = (error) => {
      console.error("Connection error:", error)
    }

    // 设置关闭处理
    this.connection.onclose = () => {
      console.log("Connection closed")
      // 延迟重连
      setTimeout(() => {
        if (this.connection) {
          this.connection.open()
        }
      }, CONNECTION.RECONNECT_DELAY)
    }

    // 打开连接
    this.connection.open()

    return this.connection
  }

  /**
   * 处理接收到的消息
   * @param {Object} data - 接收到的消息数据
   */
  handleMessage(data) {
    // 检查是否为握手预检消息
    if (data.data === "start") {
      this.handleHandshake()
      return
    }

    // 检查是否为获取设备信息消息
    if (data.data === "info") {
      this.handleInfoRequest()
      return
    }

    // 处理实际的天气数据消息
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
    if (!this.connection) {
      return
    }

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

  /**
   * 处理握手协议
   * 响应App端的start消息，发送ready确认
   */
  handleHandshake() {
    // 构造ready消息，仅发送一次
    const messageData = {
      action: "ready",
      timestamp: Date.now()
    }

    this.connection.send({
      data: messageData,
      fail: (error) => {
        console.error("发送ready响应失败:", error)
      }
    })
  }

  /**
   * 发送消息
   * @param {Object} data - 要发送的数据对象
   * @returns {Promise<boolean>} 发送成功返回true
   */
  send(data) {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error("连接未初始化"))
        return
      }

      this.connection.send({
        data: data,
        success: () => {
          console.log("消息发送成功")
          resolve(true)
        },
        fail: (error) => {
          console.error("消息发送失败:", error)
          reject(error)
        }
      })
    })
  }

  /**
   * 关闭连接
   */
  close() {
    // 关闭连接
    if (this.connection && typeof this.connection.close === "function") {
      this.connection.close()
      this.connection = null
    }

    // 清除消息处理器
    this.messageHandler = null
  }

  /**
   * 获取连接状态
   * @returns {boolean} 是否正在连接中
   */
  isActive() {
    return !!this.connection
  }
}

// 导出单例
export default new ConnectionService()
