/**
 * 自定义背景图片管理服务
 * 接收手机端发送的天气背景图，存入 internal://files/
 * 提供查询、清除、展示页预览功能
 */

import file from "@system.file"
import prompt from "@system.prompt"

const FILE_PREFIX = "internal://files/custom-bg-"
const DIR_BASE = "internal://files"

class ImageService {
  constructor() {
    this.customImages = new Set()
    this.receiving = null
    this.initialized = false
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
      case "header": this.handleHeader(msg); break
      case "data":   this.handleChunk(msg);  break
      case "end":    this.handleEnd();       break
    }
  }

  handleHeader(msg) {
    if (!msg.weatherCode || !msg.totalChunks) return
    this.receiving = {
      weatherCode: msg.weatherCode,
      chunks: new Array(msg.totalChunks),
      totalChunks: msg.totalChunks,
      receivedCount: 0
    }
    prompt.showToast({ message: "正在接收自定义背景图...", duration: 1000 })
  }

  handleChunk(msg) {
    if (!this.receiving) return
    if (msg.index >= 0 && msg.index < this.receiving.totalChunks) {
      if (!this.receiving.chunks[msg.index]) {
        this.receiving.chunks[msg.index] = msg.chunk
        this.receiving.receivedCount++
      }
    }
  }

  handleEnd() {
    if (!this.receiving) return
    const current = this.receiving
    const { weatherCode, chunks, totalChunks, receivedCount } = current
    if (receivedCount < totalChunks) { this.receiving = null; return }

    const buffer = this.base64ToArrayBuffer(chunks.join(""))
    file.writeArrayBuffer({
      uri: `${FILE_PREFIX}${weatherCode}.png`,
      buffer: buffer,
      success: () => {
        this.customImages.add(weatherCode)
        if (this.receiving === current) this.receiving = null
        prompt.showToast({ message: "自定义背景图已保存", duration: 1000 })
      },
      fail: (data, code) => {
        console.error(`ImageService: 保存失败 code=${code}`)
        if (this.receiving === current) this.receiving = null
      }
    })
  }

  base64ToArrayBuffer(base64) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    const len = base64.length
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
      view[p++] = (a << 2) | (b >> 4)
      if (c !== -1) view[p++] = ((b & 15) << 4) | (c >> 2)
      if (d !== -1) view[p++] = ((c & 3) << 6) | d
    }
    return buffer
  }

  clearAll() {
    return new Promise((resolve) => {
      file.list({
        uri: DIR_BASE + "/",
        success: (data) => {
          const files = data.fileList || []
          const pending = []

          files.forEach((item) => {
            const uri = item.uri || ""
            const match = uri.match(/(custom-bg-(.+)\.png)$/)
            if (!match) return

            const weatherCode = match[2]
            const filePath = `${FILE_PREFIX}${weatherCode}.png`

            pending.push(new Promise((done) => {
              file.delete({
                uri: filePath,
                success: () => {
                  console.log(`clearAll: deleted ${filePath}`)
                  done()
                },
                fail: (data, code) => {
                  console.log(`clearAll: delete fail ${filePath}, code=${code}`)
                  done()
                }
              })
            }))
          })

          Promise.all(pending).then(() => {
            this.customImages.clear()
            prompt.showToast({ message: "已清除所有自定义背景图", duration: 1000 })
            resolve()
          })
        },
        fail: (data, code) => {
          console.log(`clearAll: list fail, code=${code}`)
          prompt.showToast({ message: "清除失败，请重试", duration: 1000 })
          resolve()
        }
      })
    })
  }
}

export default new ImageService()
