# Meet U 视频工作室 · 修改声明

本软件是 [HyperFrames](https://github.com/heygen-com/hyperframes)（Copyright HeyGen, Inc.，Apache License 2.0）的修改版，由安杰为 Meet U 公司内部使用而改造。原项目的许可证全文见同目录的 LICENSE 文件，继续适用于本软件。

HyperFrames 与 HeyGen 是其各自所有者的商标。本修改版与 HeyGen 没有隶属关系，也未获其认可。

## 修改内容（相对上游 v0.8.137）

仅修改了 `packages/studio`（浏览器编辑器界面）：

1. 界面汉化：约 1300 条界面文案译为简体中文，并处理了运行时拼接的英文词。
2. 品牌替换：页眉标识、浏览器标题和图标改为"Meet U 视频工作室 · 安杰开发"，品牌渐变色改为粉紫色。
3. 移除"用桌面 App 编辑（Framey）"入口。
4. 编译时关闭界面的使用统计（`VITE_HYPERFRAMES_NO_TELEMETRY=1`），不向 HeyGen 发送使用数据。

命令行工具、渲染引擎等其余部分直接使用官方发布的 npm 包 `hyperframes@0.8.137`，未做修改。
