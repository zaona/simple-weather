# 调试功能使用指南

## 📝 概述

简明天气项目提供了更强大、更优雅的调试功能，集中在 `debug-service.js` 中。

---

## 🔧 调试服务功能

### 1. 调试模式开关

在 `src/services/debug-service.js` 第 14 行：

```javascript
const DEBUG_MODE = true  // ⚠️ 发版时改为 false
```

**设置：**
- `true` - 启用调试功能（开发时）
- `false` - 禁用调试功能（发版时）

---

## 🎯 三种使用方式

### 方式 1：自动注入（最简单）⭐

在首页启动时自动注入模拟数据。

**操作步骤：**

1. 打开 `src/pages/index/index.ux`
2. 找到第 158 行的注释代码：
   ```javascript
   // 🔧 调试模式：注入模拟数据（可选）
   // 取消下面的注释可启用模拟数据注入
   // await DebugService.injectMockData()
   ```

3. 取消注释：
   ```javascript
   // 🔧 调试模式：注入模拟数据（可选）
   // 取消下面的注释可启用模拟数据注入
   await DebugService.injectMockData()  // ← 已启用
   ```

4. 保存并重新运行应用

**效果：**
- ✅ 应用启动时自动加载模拟数据
- ✅ 显示提示："📝 模拟数据已加载"
- ✅ 无需手机App配合，独立测试

---

### 方式 2：可视化调试面板（最方便）⭐⭐⭐

通过界面按钮控制模拟数据。

**操作步骤：**

1. 确保 `debug-service.js` 中 `DEBUG_MODE = true`
2. 启动应用
3. 进入"关于"页面
4. 会看到两个调试按钮：
   - **注入模拟数据** - 加载完整的模拟天气数据
   - **清除本地数据** - 删除本地数据（测试无数据场景）

**效果：**
- ✅ 随时注入/清除数据
- ✅ 可视化操作，方便测试
- ✅ 测试各种数据场景

**注意：**
- 🔒 发版时（`DEBUG_MODE = false`），调试面板自动隐藏

---

### 方式 3：代码中手动调用（最灵活）

在任何地方调用调试服务的方法。

```javascript
import DebugService from "../../services/debug-service.js"

// 注入模拟数据
await DebugService.injectMockData()

// 清除本地数据
await DebugService.clearLocalData()

// 获取模拟数据对象（不写入文件）
const mockData = DebugService.getMockData()

// 增强日志
DebugService.log('MyTag', { some: 'data' })
```

---

## 📊 模拟数据内容

### 包含的数据

- 📍 **地点：** 北京
- 📅 **日期范围：** 7天天气预报（2025-10-20 至 2025-10-26）
- 🌤️ **天气类型：** 晴、多云、小雨、阴（测试不同图标和背景）
- 📈 **完整字段：** 
  - 温度（最高/最低）
  - 天气描述（白天/夜晚）
  - 风向、风力、风速
  - 湿度、气压、能见度
  - 云量、紫外线指数
  - 日出日落、月升月落、月相

### 数据位置

`src/services/debug-service.js` 第 25-221 行

**自定义模拟数据：**

直接修改 `MOCK_WEATHER_DATA` 对象即可：

```javascript
const MOCK_WEATHER_DATA = {
  location: "上海",  // 修改地点
  updateTime: new Date().toISOString(),
  daily: [
    {
      fxDate: "2025-10-21",
      tempMax: "30",     // 修改温度
      tempMin: "20",
      textDay: "暴雨",   // 修改天气
      iconDay: 310,      // 对应图标代码
      // ... 其他字段
    }
    // ... 更多日期
  ]
}
```

---

## ⚠️ 发版清单

发版前必须检查：

### 步骤 1：关闭调试模式

打开 `src/services/debug-service.js`：

```javascript
const DEBUG_MODE = false  // ⚠️ 改为 false
```

### 步骤 2：注释自动注入（如果启用了）

打开 `src/pages/index/index.ux`：

```javascript
// await DebugService.injectMockData()  // ← 确保已注释
```

### 步骤 3：验证

- ✅ 关于页面不显示调试按钮
- ✅ 启动时不自动加载模拟数据
- ✅ 调试日志不再输出