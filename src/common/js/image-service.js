/**
 * 自定义背景图片管理服务
 * 接收手机端发送的天气背景图，存入 internal://files/
 * 提供查询、清除、展示页预览功能
 *
 * 图片接收采用流式写入：分片到达后直接追加写入文件，
 * 避免在内存中缓存全部 base64 分片后再一次性写入。
 */

import file from "@system.file"
import prompt from "@system.prompt"
import interconnect from "@system.interconnect"

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
  }

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

  hasCustomImage(weatherCode) {
    return this.customImages.has(weatherCode)
  }

  getCustomPath(weatherCode) {
    return `${FILE_PREFIX}${weatherCode}.png`
  }

  handleImageMessage(msg) {
    switch (msg.type) {
      case "header":    this.handleHeader(msg);    break
      case "data":      this.handleChunk(msg);     break
      case "end":       this.handleEnd();          break
      case "clear_all": this.handleClearAll();     break
    }
  }

  async handleClearAll() {
    await this.clearAll()
    const conn = interconnect.instance()
    conn.send({
      data: { type: "clear_done" },
      fail: (err) => console.error(`ImageService: 发送清除确认失败 code=${err.code}`)
    })
  }

  handleHeader(msg) {
    if (!msg.weatherCode || !msg.totalChunks) return
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
    prompt.showToast({ message, duration: 1000 })

    // 准备写入：清理旧文件，确保目录干净
    this.currentFilePath = `${FILE_PREFIX}${weatherCode}.png`
    this.imageWritePromise = this.prepareImageFile(this.currentFilePath)
  }

  handleChunk(msg) {
    if (!this.receiving) return
    if (!(msg.index >= 0 && msg.index < this.receiving.totalChunks)) return

    const chunkIndex = msg.index
    const isFirstChunk = (chunkIndex === 0)

    // 串行写入：每个分片在前一个写入完成后再写入，保证顺序
    this.imageWritePromise = this.imageWritePromise.then(() => {
      return this.writeImageChunk(this.currentFilePath, msg.chunk, isFirstChunk)
    }).then(() => {
      this.receiving.receivedCount++
      const pct = Math.floor((this.receiving.receivedCount / this.receiving.totalChunks) * 100)
      console.log(`ImageService: 已保存分片 ${chunkIndex + 1}/${this.receiving.totalChunks} (${pct}%)`)
    }).catch((error) => {
      console.error(`ImageService: 分片保存失败: ${error && error.message ? error.message : error}`)
      prompt.showToast({ message: "图片保存失败", duration: 1000 })
      this.receiving = null
    })
  }

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
        prompt.showToast({ message: "图片保存失败", duration: 1000 })
        return
      }

      console.log(`ImageService: 图片已保存: ${this.currentFilePath}`)
      this.customImages.add(current.weatherCode)
      this.receiving = null

      const name = current.label || ""
      prompt.showToast({ message: name ? `已保存: ${name}` : "已保存", duration: 1000 })

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
      prompt.showToast({ message: "图片保存失败", duration: 1000 })
      this.receiving = null
    })
  }

  /**
   * 准备图片文件：删除同名目标文件避免 append 时残留旧数据
   * 注意：不能调用 clearImageDir()，否则会删掉之前已保存的其他自定义背景图
   */
  prepareImageFile(filePath) {
    return this.runFile(file.delete, { uri: filePath }).catch(() => {})
  }

  /**
   * 清除 internal://files/ 目录下所有自定义背景图
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

  clearAll() {
    return this.clearImageDir().then(() => {
      this.customImages.clear()
      prompt.showToast({ message: "已清除所有自定义背景图", duration: 1000 })
    }).catch(() => {
      prompt.showToast({ message: "清除失败，请重试", duration: 1000 })
    })
  }
}

export default new ImageService()
