# 调试功能使用指南

## 概述

简明天气调试功能集中在 `debug-service.js` 中。

---

## 调试模式开关

在 `src/services/debug-service.js` 中：

```javascript
const DEBUG_MODE = true  // 发版时改为 false
```

**设置：**
- `true` - 启用调试功能（开发时）
- `false` - 禁用调试功能（发版时）

---

## 三种使用方式

### 方式 1：自动注入

在首页启动时自动注入模拟数据。

**操作步骤：**

1. 打开 `src/pages/index/index.ux`
2. 找到如下注释代码：
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

---

### 方式 2：可视化调试面板

通过界面按钮控制模拟数据。

**操作步骤：**

1. 确保 `debug-service.js` 中 `DEBUG_MODE = true`
2. 启动应用
3. 进入"关于"页面
4. 会看到两个调试按钮：
   - **注入模拟数据** - 加载完整的模拟天气数据
   - **清除本地数据** - 删除本地数据（测试无数据场景）

---

### 方式 3：代码中手动调用

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

## 发版清单

发版前必须检查：

### 步骤 1：关闭调试模式

打开 `src/services/debug-service.js`：

```javascript
const DEBUG_MODE = false  // 改为 false
```

### 步骤 2：注释自动注入（如果启用了）

打开 `src/pages/index/index.ux`：

```javascript
// await DebugService.injectMockData()  // ← 确保已注释
```