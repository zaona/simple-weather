/**
 * 连接管理服务
 * 统一管理 interconnect 连接、握手协议和消息传递
 */

import interconnect from "@system.interconnect"
import {CONNECTION, MESSAGES, TOAST_DURATION} from "./config.js"
import {showToast} from "@system.prompt"

/**
 * 连接服务类
 * 提供连接初始化、消息处理、握手协议等功能
 */
class ConnectionService {
  constructor() {
    // interconnect 连接实例
    this.connection = null
    // 是否正在连接中
    this.isConnecting = false
    // 消息处理回调函数
    this.messageHandler = null
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
      // 重置连接状态
      this.isConnecting = false
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

    // 处理实际的天气数据消息
    if (this.messageHandler) {
      this.messageHandler(data)
    }
  }

  /**
   * 处理握手协议
   * 响应App端的start消息，发送ready确认
   */
  handleHandshake() {
    // 如果已经在连接中，忽略新的连接请求
    if (this.isConnecting) {
      return
    }

    // 设置连接状态为正在连接
    this.isConnecting = true

    // 发送ready响应的递归函数
    let retryCount = 0

    const sendReadyResponse = () => {
      // 检查是否已超过最大重试次数
      if (retryCount >= CONNECTION.MAX_READY_RETRIES) {
        console.log("已达到最大重试次数，停止发送ready响应")
        this.isConnecting = false
        return
      }

      retryCount++

      // 构造ready消息
      const messageData = {
        action: "ready",
        timestamp: Date.now()
      }

      // 发送ready响应
      this.connection.send({
        data: messageData,
        success: () => {
          // 短暂延迟后继续发送，确保App端能接收到
          setTimeout(sendReadyResponse, CONNECTION.READY_RETRY_DELAY)
        },
        fail: () => {
          // 发送失败，短暂延迟后重试
          setTimeout(sendReadyResponse, CONNECTION.READY_RETRY_DELAY)
        }
      })
    }

    // 立即发送第一次ready响应
    sendReadyResponse()
  }

  /**
   * 重置连接状态
   * 允许新的连接请求
   */
  resetConnectionState() {
    this.isConnecting = false
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
    // 重置连接状态
    this.isConnecting = false

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
    return this.isConnecting
  }
}

// 导出单例
export default new ConnectionService()
