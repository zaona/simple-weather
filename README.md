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
- 多布局适配：根据设备类型自动路由到不同主页界面。
- 本地持久化：聚合天气数据、设置。

## 数据来源

应用支持两条数据链路：

1. 互联同步链路（手表 <- 同步器端）
   - 通过 `@system.interconnect` 建立连接。
   - 监听并接收聚合天气 JSON，校验后写入 `weather.txt`。
2. API 拉取链路（手表 -> 天气后端）
   - 从本地缓存/本地天气文件中提取 `locationId` 与 `daily/hourly` 列表长度。
   - POST请求后端接口，获得返回数据，校验后写入 `weather.txt`。

## 调试模式

在 `src/common/js/config.js` 中开启：

```javascript
export const DEBUG_ENABLED = true
```

开启后：

- 无数据页和关于页将显示调试面板（`模拟数据` / `清除数据`）

## 天气接口

手表端主动拉取统一使用后端聚合接口：

在 `/common/js` 目录下新建 `weather-api-config.js` 文件

```js
export const WEATHER_API_PRIVATE = {
  HOST: "",
  AUTH: {
    CLIENT_TYPE: "",
    API_KEY: ""
  }
}

export default WEATHER_API_PRIVATE

```

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
- `daily` 优先根据本地 `daily` 列表长度动态拼接为 `${length}d`
- `hourly` 仅在手表端“天气预测”开关开启且设备支持高级功能时请求，并优先根据本地 `hourly` 列表长度动态拼接为 `${length}h`
- 当本地缓存和本地天气文件中没有可用列表时，分别回退到默认值 `7d` 与 `24h`

## 注释规范

### JSDoc 规范

每个导出的函数/方法必须包含 `/** */` JSDoc 块，描述功能、参数和返回值。

- `@param {type} name` — 标注所有参数，包含类型和中文描述
- `@returns {type}` — 标注返回值类型和中文描述（void 函数可省略）
- `@throws {Error}` — 标注可能抛出的异常及其错误码
- 描述文字使用中文，JSDoc 标签使用英文

```js
/**
 * 读取本地天气数据
 * 优先使用缓存，缓存过期后从文件读取并解析
 * @param {boolean} silent - 静默模式，不显示错误提示
 * @param {boolean} [options.skipCache] - 是否跳过缓存
 * @returns {Promise<Object|null>} 天气数据对象，读取失败返回 null
 */
```

### 文件头部

每个 `.js` 和 `.ux` 文件的脚本区应以 `/** 文件功能描述 */` 开头，一行概括文件职责。

```js
/**
 * 数据管理服务
 * 统一管理聚合天气数据的存储、读取和缓存
 */
```

### 行内注释 `//`

仅用于解释 **为什么** 这样做，而非重复代码已表达的信息：

```js
// ✓ 好 — 解释非显而易见的竞态处理
// 检查在 API 请求期间，同步器是否已更新了本地数据
if (updateTimeBeforeFetch !== updateTimeAfterFetch) { ... }

// ✗ 避免 — 重复代码语义
// 解析数据
const weatherData = JSON.parse(data.text)
```

### 分区注释

长文件的脚本区使用 `// ---- 分区名 ----` 进行视觉分组：

```js
// ---- 页面状态 ----
// ---- 功能开关 ----
// ---- 展示数据 ----
```

CSS 使用 `/* ---- 分区名 ---- */`。

### 模板注释

UX 模板中使用 `<!-- 说明 -->` 标注 UI 区块，便于定位结构：

```html
<!-- 加载动画容器 -->
<div class="loading" if="{{ isLoading }}">...</div>
```

被注释掉的废弃代码应及时清理，不应保留在仓库中。

### 语言约定

- 描述性内容统一使用中文
- JSDoc 关键字（`@param`、`@returns`、`@throws`）使用英文

---

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
