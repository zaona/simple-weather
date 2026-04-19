<img src="src/common/logo.png" alt="简明天气" width="64">

# 简明天气

<a href='https://github.com/zaona/simple-weather/stargazers'><img alt="GitHub stars" src="https://img.shields.io/github/stars/zaona/simple-weather?style=social"></a>
<a href='https://github.com/zaona/simple-weather/forks'><img alt="GitHub forks" src="https://img.shields.io/github/forks/zaona/simple-weather?style=social"></a>

> 🧩 simple-weather

---

## 项目简介

简明天气是适用于Vela的长期天气存储快应用

## 感谢

- [倒数日](https://github.com/sf-yuzifu/daymatter) 项目
- [澄序课程表](https://github.com/waterflames-team/clartime-velaapp) 项目
- [WaiJade](https://github.com/CheongSzesuen)
- [xinghengCN](https://github.com/OnDriveLine)

## 快应用包名

com.application.zaona.weather

## 功能概览

- 天气状况展示：显示今天及未来天气概览，支持进入详情页查看单日完整指标。
- 逐小时天气：在支持的设备上可开启逐小时天气卡片。
- 自动更新：在支持的设备上可开启，数据超过 1 小时自动尝试刷新。
- 手动更新：在首页下拉可触发更新。
- 多布局适配：根据设备 `product` 自动路由到 `default` / `circle` / `rect` / `narrow-rect` 界面。
- 本地持久化：聚合天气数据、设置。

## 数据来源

应用支持两条数据链路：

1. 互联同步链路（手表 <- 同步器端）
   - 通过 `@system.interconnect` 建立连接。
   - 监听并接收聚合天气 JSON，校验后写入 `weather.txt`。
2. API 拉取链路（手表 -> 天气后端）
   - 优先从本地缓存提取 `locationId` 与 `daily/hourly` 列表长度；缓存不可用时回退读取本地 `weather.txt`。
   - 请求 `POST 后端接口`。

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

## 天气接口

手表端主动拉取统一使用后端聚合接口：

请求体结构示例：

```json
{
  "locationId": "101190201",
  "modules": {
    "daily": "7d",
    "hourly": "24h"
  }
}
```

说明：
- `daily` 不是写死值，优先根据本地 `daily` 列表长度动态拼接为 `${length}d`
- `hourly` 仅在手表端“天气预测”开关开启且设备支持高级功能时请求，并优先根据本地 `hourly` 列表长度动态拼接为 `${length}h`
- 当本地缓存和本地天气文件中没有可用列表时，分别回退到默认值 `7d` 与 `24h`

## 开发规范

本项目CSS类名命名遵循 [BEM](https://en.bem.info/methodology/css/) 规范

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
- 用户设置：`internal://files/settings.txt`

## 许可证

本项目采用 Apache-2.0 许可证，详见 `LICENSE`。
