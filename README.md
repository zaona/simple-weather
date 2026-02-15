# 简明天气

> 🧩 simple-weather

---

## 项目简介

简明天气是适用于Vela的长期天气存储快应用

## 感谢

- [倒数日](https://github.com/sf-yuzifu/daymatter) 项目
- [WaiJade](https://github.com/CheongSzesuen)
- [xinghengCN](https://github.com/OnDriveLine)

## 快应用包名

com.application.zaona.weather

## 数据传输调试

### 开关

在 `src/services/debug-service.js` 中

```javascript
const DEBUG_MODE = true // 发版时改为 false
```

### 启动时自动注入

在 `src/pages/index/index.ux` 中

```javascript
// 🔧 调试模式：注入模拟数据（可选）
// 取消下面的注释可启用模拟数据注入
// await DebugService.injectMockData()
```

## 手表请求调试

在 `src/services/weather-api-config-example.js` 中

复制一份文件，将文件名改为 `weather-api-config.js`

在文件中填写自己的和风天气API主机地址和密钥

可参考 [获取和风天气API配置](https://www.yuque.com/zaona/weather/api)

```javascript
HOST: "https://xxx.re.qweatherapi.com",
KEY: "xxx"
```

## 快速开始

开发

```
npm install
npm run start
```

构建

```
npm run build
npm run release
```

格式化

```
npm run format
```
