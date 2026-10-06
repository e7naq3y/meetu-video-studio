# Meet U 视频工作室 · 汉化术语表与规则

产品：HyperFrames Studio（视频编辑器）的公司内部中文版，名称为"Meet U 视频工作室"。使用者是不懂技术的公司员工。

## 翻译规则
1. 简洁、口语化、符合国内软件习惯（参考剪映、Premiere 中文版的说法）。按钮用动词短语，不加句号。
2. 原文中的 `${...}` 占位符必须原样保留（可以调整它在句中的位置）。占位符内部如果有英文字符串字面量（例如 `${isExpanded ? "Hide" : "Show"}`），把其中的英文也翻译掉，但不要改动任何代码结构、变量名、引号类型。
3. 保持原文的引号字符风格：译文中不要出现未转义的英文双引号 `"`。需要引号时用中文引号「」或“”。
4. 不翻译、原样返回：快捷键（⌘K、Shift 等）、单位（dB、px、fps）、技术名词（GSAP、CSS、HTML、SVG、MP4、WebM、FFmpeg、Lottie、Three.js、ID、URL）、文件名和路径、代码片段。
5. 产品名：HyperFrames Studio / Studio（指本产品时）→「视频工作室」；单独的 HyperFrames（指底层引擎）保留 HyperFrames。HeyGen 保留原文。
6. 面向 AI 的提示词正文（读起来是在指挥 AI 做事的长句，例如 "You are editing a HyperFrames composition..."）返回 null，保持英文。
7. 不是给人看的字符串（CSS 类名、事件名、内部键、日志标识）返回 null。
8. 全角标点：中文句子用全角逗号、句号、冒号、问号；省略号用"…"。

## 术语表
Composition 合成 · Sub-composition 子合成 · Timeline 时间线 · Clip 片段 · Track 轨道 · Lane 轨道行 · Layer 图层 · Keyframe 关键帧 · Playhead 播放头 · Inspector 检查器 · Capture 采集 · Preview 预览 · Render 渲染 · Renders 渲染记录 · Export 导出 · Assets 素材 · Catalog 素材库 · Block 模块 · Component 组件 · Captions 字幕 · Transition 转场 · Effects 特效 · VFX 视觉特效 · Variables 变量 · Design 设计 · Code 代码 · Lint 检查 · Motion 动效 · Animation 动画 · Layout 布局 · Opacity 不透明度 · Easing 缓动 · Ease 缓动 · Duration 时长 · Start 开始 · End 结束 · Snap 吸附 · Ripple 波纹 · Trim 修剪 · Split 分割 · Mute 静音 · Solo 独听 · Slip 滑移 · Roll 滚动编辑 · Gesture 手势 · Agent AI 助手 · Prompt 提示词 · Frame 帧 · Scene 场景 · Viewport 视口 · Zoom 缩放 · Fit 适应窗口 · Undo 撤销 · Redo 重做 · Project 项目 · Workspace 工作区 · Fade in 淡入 · Fade out 淡出 · Volume 音量 · Speed 速度 · Loop 循环 · Waveform 波形 · Font 字体 · Weight 字重 · Letter spacing 字间距 · Line height 行高 · Align 对齐 · Fill 填充 · Stroke 描边 · Shadow 阴影 · Blur 模糊 · Gradient 渐变 · Mask 遮罩 · Blend mode 混合模式 · Rotation 旋转 · Scale 缩放 · Position 位置 · Size 尺寸 · Selection 选区 · Group 编组 · Ungroup 取消编组 · Duplicate 复制一份 · Copy 复制 · Paste 粘贴 · Delete 删除 · Rename 重命名 · Reset 重置 · Dismiss 关闭 · Close 关闭 · Cancel 取消 · Apply 应用 · Save 保存 · Settings 设置 · Shortcuts 快捷键 · Feedback 反馈 · Toolbar 工具栏 · Panel 面板 · Sidebar 侧边栏 · Dock 停靠栏 · Master 主控 · Audio FX 音频效果 · Carve 人声避让 · Bus 总线 · Gain 增益 · EQ 均衡器 · Compressor 压缩器 · Limiter 限制器 · Reverb 混响 · Delay 延迟 · Hue 色相 · Saturation 饱和度 · Brightness 亮度 · Contrast 对比度 · Grade 调色 · LUT LUT · Media 媒体 · Media start 媒体起点 · Thumbnail 缩略图 · Filmstrip 胶片条 · Marker 标记 · In point 入点 · Out point 出点 · Overlay 叠加层 · Safe zone 安全区 · Aspect ratio 画面比例 · Resolution 分辨率 · Quality 画质 · Draft 草稿 · Runtime 运行时 · Sync 同步 · Conflict 冲突 · Reload 重新加载
