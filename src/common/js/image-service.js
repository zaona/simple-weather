/**
 * 自定义背景图片管理服务
 * 接收手机端发送的天气背景图，存入 internal://files/
 * 提供查询、清除、展示页预览功能
 *
 * 图片接收采用流式写入：分片到达后直接追加写入文件，
 * 避免在内存中缓存全部 base64 分片后再一次性写入。
 *
 * 进度通过监听器推送给传输页，不再使用 prompt toast。
 */

import file from "@system.file"
import interconnect from "@system.interconnect"
import router from "@system.router"

const FILE_PREFIX = "internal://files/custom-bg-"
const DIR_BASE = "internal://files"
const FILE_OP_TIMEOUT = 5000

class ImageService {
  constructor() {
    this.customImages = new Set()
    this.receiving = null
    this.initialized = false
    this.imageWritePromise = Promise.resolve()
    this.currentFilePath = ""
    this.listeners = []
    this.transferUiActive = false
    this.cancelRequested = false
    this.lastEvent = {
      phase: "idle",
      weatherCode: "",
      label: "",
      current: 0,
      total: 0,
      receivedCount: 0,
      totalChunks: 0,
      percent: 0,
      message: "等待传输"
    }
  }

  /**
   * 初始化：扫描本地已保存的自定义背景图
   * @returns {Promise<void>}
   */
  init() {
    if (this.initialized) return Promise.resolve()
    return new Promise((resolve) => {
      file.list({
        uri: DIR_BASE + "/",
        success: (data) => {
          if (data.fileList && data.fileList.length > 0) {
            data.fileList.forEach((item) => {
              // file.list 返回形如 /custom-bg-21.png，直接尾部匹配即可
              const match = item.uri.match(/(custom-bg-(.+)\.png)$/)
              if (match) this.customImages.add(match[2])
            })
          }
          this.initialized = true
          console.log(`ImageService: 已加载 ${this.customImages.size} 张自定义背景图`)
          resolve()
        },
        fail: () => { this.initialized = true; resolve() }
      })
    })
  }

  /**
   * 注册传输进度监听器
   * @param {Function} fn - 进度回调，参数为最新事件快照
   * @returns {Function} 取消监听函数
   */
  onProgress(fn) {
    if (typeof fn !== "function") return () => {}
    this.listeners.push(fn)
    return () => {
      const idx = this.listeners.indexOf(fn)
      if (idx >= 0) this.listeners.splice(idx, 1)
    }
  }

  /**
   * 向所有监听器推送进度事件
   * @param {Object} event - 部分事件字段，会与 lastEvent 合并
   */
  emit(event) {
    this.lastEvent = Object.assign({}, this.lastEvent, event || {})
    this.listeners.forEach((fn) => {
      try {
        fn(this.lastEvent)
      } catch (e) {
        console.error("ImageService: 进度回调失败", e)
      }
    })
  }

  /**
   * 获取当前进度快照（页面晚于传输启动进入时用于补齐状态）
   * @returns {Object}
   */
  getSnapshot() {
    return Object.assign({}, this.lastEvent)
  }

  /**
   * 标记传输页是否在栈顶，避免重复 push
   * @param {boolean} active - 传输页是否处于活跃状态
   */
  setTransferUiActive(active) {
    this.transferUiActive = !!active
  }

  /**
   * 确保传输页已打开；若页面未激活则 router.push
   * 避免重复跳转导致页面栈异常
   */
  ensureTransferPage() {
    if (this.transferUiActive) return
    try {
      router.push({ uri: "/pages/transfer" })
    } catch (e) {
      console.error("ImageService: 打开传输页失败", e)
    }
  }

  /**
   * 是否已有指定天气码的自定义背景
   * @param {string} weatherCode - 天气背景编号
   * @returns {boolean}
   */
  hasCustomImage(weatherCode) {
    return this.customImages.has(weatherCode)
  }

  /**
   * 获取自定义背景文件路径
   * @param {string} weatherCode - 天气背景编号
   * @returns {string}
   */
  getCustomPath(weatherCode) {
    return `${FILE_PREFIX}${weatherCode}.png`
  }

  /**
   * 处理图片传输协议消息
   * @param {Object} msg - 含 type 字段的协议消息
   */
  handleImageMessage(msg) {
    switch (msg.type) {
      case "header":
        this.ensureTransferPage()
        this.handleHeader(msg)
        break
      case "data":
        this.handleChunk(msg)
        break
      case "end":
        this.handleEnd()
        break
      case "clear_all":
        this.ensureTransferPage()
        this.handleClearAll()
        break
      case "cancel":
        this.ensureTransferPage()
        this.handleCancel()
        break
    }
  }

  /**
   * 处理取消传输：丢弃当前接收状态并删除半成品文件
   * @param {string} [message="手机端已取消传输"] - 展示给用户的状态文案
   */
  handleCancel(message) {
    const partialPath = this.currentFilePath
    this.receiving = null
    // 打断串行写入链，避免取消后仍继续追加半成品
    this.imageWritePromise = Promise.resolve()
    if (partialPath) {
      this.prepareImageFile(partialPath).catch(() => {})
    }
    this.currentFilePath = ""
    this.emit({
      phase: "cancelled",
      message: message || "手机端已取消传输",
      percent: 0,
      receivedCount: 0,
      totalChunks: 0
    })
  }

  /**
   * 手表端用户手动取消：本地清理后通知手机停止发送
   */
  cancelByUser() {
    this.cancelRequested = true
    this.handleCancel("已手动取消")
    const conn = interconnect.instance()
    conn.send({
      data: { type: "cancel" },
      fail: (err) => console.error(`ImageService: 发送取消通知失败 code=${err.code}`)
    })
  }

  /**
   * 处理清除全部自定义背景图，并向手机端回传 clear_done
   * @returns {Promise<void>}
   */
  async handleClearAll() {
    this.cancelRequested = false
    this.emit({
      phase: "clearing",
      message: "正在清除自定义背景图...",
      percent: 0,
      current: 0,
      total: 0,
      label: "",
      weatherCode: ""
    })
    await this.clearAll()
    // 用户已手动取消时不再回传，避免覆盖 cancelled 状态
    if (this.cancelRequested) return
    const conn = interconnect.instance()
    conn.send({
      data: { type: "clear_done" },
      fail: (err) => console.error(`ImageService: 发送清除确认失败 code=${err.code}`)
    })
  }

  /**
   * 处理图片传输 header：记录元信息并准备目标文件
   * @param {Object} msg - header 消息
   */
  handleHeader(msg) {
    if (!msg.weatherCode || !msg.totalChunks) return
    this.cancelRequested = false
    const weatherCode = msg.weatherCode

    this.receiving = {
      weatherCode,
      totalChunks: msg.totalChunks,
      receivedCount: 0,
      current: msg.current || 0,
      total: msg.total || 0,
      label: msg.label || ""
    }

    const progress = (msg.current && msg.total) ? ` (${msg.current}/${msg.total})` : ""
    const name = msg.label || ""
    const message = name ? `接收: ${name}${progress}` : "接收中..."

    this.emit({
      phase: "receiving",
      weatherCode,
      label: name,
      current: msg.current || 0,
      total: msg.total || 0,
      receivedCount: 0,
      totalChunks: msg.totalChunks,
      percent: 0,
      message
    })

    // 准备写入：清理旧文件，确保目录干净
    this.currentFilePath = `${FILE_PREFIX}${weatherCode}.png`
    this.imageWritePromise = this.prepareImageFile(this.currentFilePath)
  }

  /**
   * 处理图片分片数据
   * @param {Object} msg - data 消息，含 index 与 chunk
   */
  handleChunk(msg) {
    if (!this.receiving) return
    if (!(msg.index >= 0 && msg.index < this.receiving.totalChunks)) return

    const chunkIndex = msg.index
    const isFirstChunk = (chunkIndex === 0)
    const current = this.receiving

    // 串行写入：每个分片在前一个写入完成后再写入，保证顺序
    this.imageWritePromise = this.imageWritePromise.then(() => {
      return this.writeImageChunk(this.currentFilePath, msg.chunk, isFirstChunk)
    }).then(() => {
      // 取消后 receiving 可能已清空或被新一轮 header 替换，避免脏写进度
      if (!this.receiving || this.receiving !== current) return
      this.receiving.receivedCount++
      const pct = Math.floor((this.receiving.receivedCount / this.receiving.totalChunks) * 100)
      console.log(`ImageService: 已保存分片 ${chunkIndex + 1}/${this.receiving.totalChunks} (${pct}%)`)
      this.emit({
        phase: "receiving",
        weatherCode: this.receiving.weatherCode,
        label: this.receiving.label,
        current: this.receiving.current,
        total: this.receiving.total,
        receivedCount: this.receiving.receivedCount,
        totalChunks: this.receiving.totalChunks,
        percent: pct,
        message: this.receiving.label
          ? `接收: ${this.receiving.label} (${this.receiving.current}/${this.receiving.total})`
          : "接收中..."
      })
    }).catch((error) => {
      console.error(`ImageService: 分片保存失败: ${error && error.message ? error.message : error}`)
      this.emit({
        phase: "error",
        message: "图片保存失败",
        percent: 0
      })
      this.receiving = null
    })
  }

  /**
   * 处理传输结束：校验分片完整性、登记自定义图并回传确认
   */
  handleEnd() {
    if (!this.receiving) return
    const current = this.receiving

    console.log("ImageService: 图片传输完成，等待写入完成...")
    this.imageWritePromise.then(() => {
      // receivedCount 在 Promise 链中的 .then() 里异步递增，
      // 此处 after 所有写入 Promise 完成后检查才是准确的
      if (current.receivedCount < current.totalChunks) {
        console.warn(`ImageService: 分片不完整 (${current.receivedCount}/${current.totalChunks})，丢弃`)
        this.receiving = null
        this.emit({
          phase: "error",
          message: "图片保存失败",
          weatherCode: current.weatherCode,
          label: current.label,
          current: current.current,
          total: current.total
        })
        return
      }

      console.log(`ImageService: 图片已保存: ${this.currentFilePath}`)
      this.customImages.add(current.weatherCode)
      this.receiving = null

      const name = current.label || ""
      const doneAll = current.total > 0 && current.current >= current.total
      this.emit({
        phase: doneAll ? "finished" : "saved",
        weatherCode: current.weatherCode,
        label: name,
        current: current.current,
        total: current.total,
        receivedCount: current.totalChunks,
        totalChunks: current.totalChunks,
        percent: 100,
        message: doneAll
          ? `已完成 ${current.current}/${current.total}`
          : (name ? `已保存: ${name}` : "已保存")
      })

      // 通知手机端可以发送下一张
      const conn = interconnect.instance()
      conn.send({
        data: { type: "image_saved", weatherCode: current.weatherCode },
        fail: (err) => console.error(`ImageService: 发送确认失败 code=${err.code}`)
      })

      // 手动触发 GC（如果运行环境支持）
      if (typeof global !== "undefined" && global.runGC) {
        global.runGC()
      }
    }).catch((error) => {
      console.error(`ImageService: 图片保存失败: ${error && error.message ? error.message : error}`)
      this.emit({
        phase: "error",
        message: "图片保存失败",
        weatherCode: current.weatherCode,
        label: current.label
      })
      this.receiving = null
    })
  }

  /**
   * 准备图片文件：删除同名目标文件避免 append 时残留旧数据
   * 注意：不能调用 clearImageDir()，否则会删掉之前已保存的其他自定义背景图
   * @param {string} filePath - 目标文件路径
   * @returns {Promise<void>}
   */
  prepareImageFile(filePath) {
    return this.runFile(file.delete, { uri: filePath }).catch(() => {})
  }

  /**
   * 清除 internal://files/ 目录下所有自定义背景图
   * @returns {Promise<void>}
   */
  clearImageDir() {
    return this.runFile(file.list, {
      uri: DIR_BASE + "/"
    }).then((data) => {
      const fileList = data.fileList || []
      let deletePromise = Promise.resolve()
      fileList.forEach((item) => {
        const uri = item.uri || ""
        const match = uri.match(/(custom-bg-(.+)\.png)$/)
        if (!match) return
        const fullPath = this.resolveCacheFileUri(uri)
        console.log(`ImageService: 删除文件: ${fullPath}`)
        deletePromise = deletePromise.then(() => {
          return this.runFile(file.delete, { uri: fullPath }).catch(() => {})
        })
      })
      return deletePromise
    }).catch(() => {})
  }

  /**
   * 规范化 URI：补齐 internal://files/ 前缀
   * @param {string} uri - file.list 返回的路径或完整 URI
   * @returns {string}
   */
  resolveCacheFileUri(uri) {
    if (uri.indexOf("internal://") === 0) {
      return uri
    }
    return `${DIR_BASE}/${uri}`
  }

  /**
   * 将 base64 分片数据写入文件
   * @param {string} filePath - 目标文件路径
   * @param {string} base64Data - base64 编码的分片数据
   * @param {boolean} isFirstChunk - 是否为第一个分片（首片覆盖写入，后续追加）
   * @returns {Promise}
   */
  writeImageChunk(filePath, base64Data, isFirstChunk) {
    const imageBytes = this.base64ToArrayBuffer(base64Data)
    if (!imageBytes.byteLength) {
      return Promise.resolve()
    }
    return this.runFile(file.writeArrayBuffer, {
      uri: filePath,
      buffer: new Uint8Array(imageBytes),
      append: !isFirstChunk
    })
  }

  /**
   * 将回调式 file API 包装为带超时的 Promise
   * @param {Function} func - file.xxx 方法
   * @param {Object} params - 传递给 file API 的参数（不含 success/fail 回调）
   * @returns {Promise}
   */
  runFile(func, params) {
    return new Promise((resolve, reject) => {
      let settled = false
      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        reject(new Error(`timeout: ${params.uri || "file operation"}`))
      }, FILE_OP_TIMEOUT)
      func({
        ...params,
        success: (data) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          resolve(data)
        },
        fail: (data, code) => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          reject(new Error(`code=${code}, data=${JSON.stringify(data)}`))
        }
      })
    })
  }

  /**
   * 将 base64 字符串解码为 ArrayBuffer
   * @param {string} base64 - base64 字符串
   * @returns {ArrayBuffer}
   */
  base64ToArrayBuffer(base64) {
    // 清理空白字符和换行
    base64 = (base64 || "").replace(/[\s\r\n]/g, "")
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    const len = base64.length
    if (len === 0) return new ArrayBuffer(0)

    let bufLen = (len * 3) / 4
    if (base64[len - 1] === "=") bufLen--
    if (base64[len - 2] === "=") bufLen--

    const buffer = new ArrayBuffer(bufLen)
    const view = new Uint8Array(buffer)
    let p = 0
    for (let i = 0; i < len; i += 4) {
      const a = chars.indexOf(base64[i])
      const b = chars.indexOf(base64[i + 1])
      const c = chars.indexOf(base64[i + 2])
      const d = chars.indexOf(base64[i + 3])

      // 跳过无效字符
      if (a < 0 || b < 0) continue
      view[p++] = (a << 2) | (b >> 4)
      if (c !== -1 && p < bufLen) view[p++] = ((b & 15) << 4) | (c >> 2)
      if (d !== -1 && p < bufLen) view[p++] = ((c & 3) << 6) | d
    }
    return buffer
  }

  /**
   * 清除全部自定义背景图并推送完成/失败事件
   * @returns {Promise<void>}
   */
  clearAll() {
    return this.clearImageDir().then(() => {
      this.customImages.clear()
      // 手动取消后勿再推送 finished，以免覆盖 cancelled 展示
      if (this.cancelRequested) return
      this.emit({
        phase: "finished",
        message: "已清除所有自定义背景图",
        percent: 100,
        current: 0,
        total: 0,
        label: "",
        weatherCode: ""
      })
    }).catch(() => {
      if (this.cancelRequested) return
      this.emit({
        phase: "error",
        message: "清除失败，请重试",
        percent: 0
      })
    })
  }
}

export default new ImageService()
