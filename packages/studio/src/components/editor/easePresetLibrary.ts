export const EASE_PRESETS = [
  { id: "linear", label: "线性", ease: "none", kind: "curve" },
  { id: "ease-in", label: "缓入", ease: "power1.in", kind: "curve" },
  { id: "quad-in", label: "二次缓入", ease: "power2.in", kind: "curve" },
  { id: "cubic-in", label: "三次缓入", ease: "power3.in", kind: "curve" },
  { id: "ease-out", label: "缓出", ease: "power1.out", kind: "curve" },
  { id: "quad-out", label: "二次缓出", ease: "power2.out", kind: "curve" },
  { id: "cubic-out", label: "三次缓出", ease: "power3.out", kind: "curve" },
  { id: "ease", label: "缓入缓出", ease: "power1.inOut", kind: "curve" },
  { id: "quad-ease", label: "二次缓入缓出", ease: "power2.inOut", kind: "curve" },
  { id: "cubic-ease", label: "三次缓入缓出", ease: "power3.inOut", kind: "curve" },
  { id: "circular-ease", label: "圆形缓入缓出", ease: "circ.inOut", kind: "curve" },
  { id: "rebound-in", label: "回弹缓入", ease: "back.in", kind: "curve" },
  { id: "rebound-out", label: "回弹缓出", ease: "back.out", kind: "curve" },
  { id: "flow-1", label: "流畅 1", ease: "wiggle(1,easeInOut,0.20)", kind: "wiggle" },
  { id: "flow-2", label: "流畅 2", ease: "wiggle(2,easeInOut,0.15)", kind: "wiggle" },
  { id: "flow-3", label: "流畅 3", ease: "wiggle(3,easeInOut,0.12)", kind: "wiggle" },
  { id: "flow-4", label: "流畅 4", ease: "wiggle(4,easeInOut,0.10)", kind: "wiggle" },
  { id: "flow-5", label: "流畅 5", ease: "wiggle(5,easeInOut,0.08)", kind: "wiggle" },
  { id: "flow-6", label: "流畅 6", ease: "wiggle(6,easeInOut,0.07)", kind: "wiggle" },
  { id: "flow-7", label: "流畅 7", ease: "wiggle(7,easeInOut,0.06)", kind: "wiggle" },
  { id: "bounce-1", label: "弹跳 1", ease: "wiggle(4,easeOut,0.22)", kind: "wiggle" },
  { id: "bounce-2", label: "弹跳 2", ease: "wiggle(6,easeOut,0.26)", kind: "wiggle" },
  { id: "bounce-3", label: "弹跳 3", ease: "wiggle(9,uniform,0.32)", kind: "wiggle" },
  { id: "bounce-4", label: "弹跳 4", ease: "wiggle(5,anticipate,0.28)", kind: "wiggle" },
  { id: "hold", label: "定格", ease: "hold", kind: "curve" },
  {
    id: "rebound-ease",
    label: "回弹缓入缓出",
    ease: "back.inOut",
    kind: "curve",
  },
  { id: "expo-in", label: "指数缓入", ease: "expo.in", kind: "curve" },
  { id: "expo-out", label: "指数缓出", ease: "expo.out", kind: "curve" },
  // Runtime spring(bounce) approximates Figma stiffness and damping with bounce alone.
  { id: "spring-gentle", label: "柔和", ease: "spring(0.15)", kind: "spring" },
  { id: "spring-quick", label: "快速", ease: "spring(0.4)", kind: "spring" },
  { id: "spring-bouncy", label: "弹性", ease: "spring(0.6)", kind: "spring" },
  { id: "spring-slow", label: "缓慢", ease: "spring(0.25)", kind: "spring" },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  ease: string;
  kind: "curve" | "spring" | "wiggle";
}>;

export function easePresetLabel(ease: string): string | null {
  return EASE_PRESETS.find((preset) => preset.ease === ease)?.label ?? null;
}
