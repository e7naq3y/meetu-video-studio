/** Bare keys Studio's hotkeys bind; the shortcuts list names them from here. */
export const STUDIO_PLAIN_KEYS = {
  fullscreen: "f",
  split: "s",
  record: "r",
  addKeyframe: "k",
  audioGain: "g",
} as const;

export interface ShortcutHint {
  key: string;
  label: string;
}

export interface ShortcutSection {
  title: string;
  hints: readonly ShortcutHint[];
}

const hintKey = (key: string) => key.toUpperCase();

export const SPLIT_SHORTCUT_HINT = hintKey(STUDIO_PLAIN_KEYS.split);

/** What PlayerControls' shortcuts panel lists unless an embedder passes its own sections. */
export const DEFAULT_SHORTCUT_SECTIONS: readonly ShortcutSection[] = [
  {
    title: "播放",
    hints: [
      { key: "Space", label: "播放/暂停" },
      { key: "J", label: "倒放" },
      { key: "K", label: "停止" },
      { key: "L", label: "正向播放" },
      { key: "M", label: "切换静音" },
      { key: "⇧L", label: "切换循环" },
      { key: "←/→", label: "步进 1 帧" },
      { key: "⇧←/⇧→", label: "步进 10 帧" },
      { key: hintKey(STUDIO_PLAIN_KEYS.fullscreen), label: "切换全屏" },
    ],
  },
  {
    title: "关键帧（选中元素时）",
    hints: [
      { key: hintKey(STUDIO_PLAIN_KEYS.addKeyframe), label: "在播放头处添加/删除关键帧" },
      { key: "Del", label: "删除选中的关键帧" },
      { key: hintKey(STUDIO_PLAIN_KEYS.record), label: "录制手势" },
    ],
  },
  {
    title: "编辑",
    hints: [
      { key: "⌘Z", label: "撤销" },
      { key: "⌘⇧Z", label: "重做" },
      { key: "⌘C", label: "复制元素" },
      { key: "⌘V", label: "粘贴元素" },
      { key: "⌘X", label: "剪切元素" },
      { key: SPLIT_SHORTCUT_HINT, label: "在播放头处分割片段" },
      { key: hintKey(STUDIO_PLAIN_KEYS.audioGain), label: "调整有声片段的音频增益" },
      { key: "⇧Click", label: "剃刀工具：分割所有轨道" },
      { key: "[", label: "选择播放头之前开始的片段" },
      { key: "]", label: "选择播放头处及之后的片段" },
      { key: "⌘G", label: "编组元素" },
      { key: "⌘⇧G", label: "取消编组" },
      { key: "Del", label: "删除选中元素（未选中关键帧时）" },
    ],
  },
  {
    title: "手势录制修饰键",
    hints: [
      { key: "Drag", label: "录制 x / y 位置" },
      { key: "Scroll", label: "录制 z 深度" },
      { key: "⇧ Drag", label: "录制 X / Y 轴旋转" },
      { key: "⌥ Drag", label: "录制旋转" },
      { key: "⌘ Drag↕", label: "录制不透明度" },
      { key: "⌘ Scroll", label: "录制缩放" },
    ],
  },
  {
    title: "画布",
    hints: [
      { key: "Drag", label: "移动元素/添加关键帧" },
      { key: "⌥ Drag", label: "移动整条动画路径" },
      { key: "⇧ Drag", label: "等比缩放尺寸" },
    ],
  },
  {
    title: "裁剪",
    hints: [
      { key: "Drag edge", label: "裁剪单边" },
      { key: "Drag center", label: "调整裁剪位置" },
    ],
  },
  {
    title: "面板",
    hints: [
      { key: "⌘1", label: "合成标签页" },
      { key: "⌘2", label: "素材标签页" },
    ],
  },
  {
    title: "工作区域",
    hints: [
      { key: "I", label: "设置入点" },
      { key: "⇧I", label: "清除入点" },
      { key: "O", label: "设置出点" },
      { key: "⇧O", label: "清除出点" },
      { key: "A", label: "跳到入点" },
      { key: "E", label: "跳到出点" },
    ],
  },
];
