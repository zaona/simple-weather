<img src="src/common/logo.png" alt="腕上漫画" width="64" style="margin-bottom: 4px;">

# 简明天气

<a href='https://github.com/zaona/simple-weather/stargazers'><img alt="GitHub stars" src="https://img.shields.io/github/stars/zaona/simple-weather?style=social"></a>
<a href='https://github.com/zaona/simple-weather/forks'><img alt="GitHub forks" src="https://img.shields.io/github/forks/zaona/simple-weather?style=social"></a>

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

## 功能概览

- 天气状况展示：显示今天及未来天气概览，支持进入详情页查看单日完整指标。
- 逐小时天气：在支持的设备上可开启 24h 小时级天气卡片。
- 自动更新：在支持的设备上可开启，数据超过 1 小时自动尝试刷新。
- 手动更新：关于页可主动触发更新。
- 多布局适配：根据设备 `product` 自动路由到 `default` / `circle` / `rect` 界面。
- 本地持久化：天气、逐小时天气、设置。

## 数据来源

应用支持两条数据链路：

1. 互联同步链路（手表 <- 同步器端）
   - 通过 `@system.interconnect` 建立连接。
   - 监听并接收天气 JSON，校验后写入本地文件。
2. API 拉取链路（手表 -> 和风天气接口）
   - 从本地缓存提取 `locationId`。
   - 请求 `/v7/weather/7d` 与 `/v7/weather/24h`。

## 调试模式

在 `src/common/js/config.js` 中开启：

```javascript
export const DEBUG = {
  ENABLED: true
}
```

开启后：

- 加载页出现“关于”入口
- 关于页显示调试面板（`模拟数据` / `清除数据`）

## 天气 API 配置

如果需要使用手表端主动拉取天气能力，请配置私有 API 参数：

1. 复制 `src/common/js/weather-api-config-example.js`
2. 重命名为 `src/common/js/weather-api-config.js`
3. 填入你的 API 主机与密钥

可参考 [获取和风天气API配置](https://www.yuque.com/zaona/weather/api)

```javascript
export const WEATHER_API_PRIVATE = {
  HOST: "https://xxx.re.qweatherapi.com",
  KEY: "your-api-key"
}
```

建议：

- `weather-api-config.js` 仅用于本地/私有环境，不要提交真实密钥。

## 开发规范

从2.x版本开始，CSS类名命名遵循 [BEM](https://en.bem.info/methodology/css/) 规范，部分陈旧代码会逐步改写

BEM = Block（独立组件） + Element（组件内部元素） + Modifier（状态或变体）

结构：

```
.block {}
.block__element {}
.block--modifier {}
```

示例：

```
.card {}
.card__title {}
.card__image {}
.card__button {}

.card--active {}
.card--disabled {}
```

## 构建与发布

### 安装依赖

```bash
npm install
```

### 发布构建

```
npm run build
npm run release
```

### 格式化

```
npm run format
```

## 数据文件

- 天气数据：`internal://files/weather.txt`
- 逐小时数据：`internal://files/weather-hourly.txt`
- 用户设置：`internal://files/settings.txt`

## 许可证

本项目采用 Apache-2.0 许可证，详见 `LICENSE`。
