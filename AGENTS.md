## Vela 开发要点
- `.ux` 语法类似 Vue，但运行时与能力不完全相同；改动前对照 `VelaDocs/guide/framework/` 与 `VelaDocs/guide/framework/script/`。
- Vela 使用 Flex 布局，务必显式设置 `flex-direction`，纵向布局使用 `column`。
- 盒模型为 `border-box`；长度单位支持 `px/%/dp`，`dp = 物理分辨率 / DPR`。
- `px` 受 `src/manifest.json` 中 `config.designWidth` 影响，改动前先核对设计稿基准宽度。
- 样式支持 `tag`/`class`/`id` 选择器，但不支持后代选择器；尽量直接绑定 class。
- 文本只能放在 `text`/`span` 组件中，其它组件不得直接包含文本。
- 定位仅支持 `relative` 与 `absolute`，布局请以 Flex 为主。
- 多屏适配：CSS 中使用 `DEVICE_DATA.md` 提供的水平 `dp` 值；JS 适配请使用 `src/app.ux` 中 `device.getInfo()` 初始化的 `global.screenSize.width`（物理分辨率）。

## 性能与内存
- 手环设备资源有限，优先选择简单、低内存的实现方式，避免深层嵌套与复杂动画。
- 必须参考 `VelaDocs/guide/best-practice/` 的启动/内存/业务优化建议（如减少无意义 `setTimeout`、长列表分批渲染、长文案分块渲染、及时清理定时器与引用）。
- 图片尽量压缩并与控件尺寸一致，减少大图与频繁重绘，控制日志输出量。

## 提交与 PR 规范
- 提交信息格式为 `type(xx): description`，冒号后的 description 必填。
- 允许的 `type` 与范围以 `commitlint.config.js` 为准（例：`feat(learn): add next step`）。
- `xx` 建议使用页面或模块名（如 `learn`、`push`、`setting`）。
- PR 需包含简要说明、测试方式（含“手动测试”）与 UI 变更截图。

## 交流规范
- 和用户交流必须使用简体中文。

## 构建与调试
- 唯一可用构建命令：`pnpm release`（发布构建）。
- 调试需使用 IDE 内置的调试入口启动，命令行不提供调试流程。
- 发布产物默认输出到 `dist/`。