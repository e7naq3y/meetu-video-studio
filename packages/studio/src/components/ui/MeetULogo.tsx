// Meet U 视频工作室品牌标识（安杰开发）。替换原 HeyGen / HyperFrames 标识：
// Apache-2.0 不授予商标使用权，改版发行必须换掉原品牌，同时在悬停提示里注明上游来源。
export function MeetULogo() {
  return (
    <div
      className="flex items-center gap-2 select-none"
      title="Meet U 视频工作室 · 安杰开发 · 基于开源项目 HyperFrames（Apache-2.0）"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="meetu-g" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-brand-gradient-from)" />
            <stop offset="1" stopColor="var(--color-brand-gradient-to)" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="url(#meetu-g)" />
        <path
          d="M4 12.5c1.6-3.2 3.2-3.2 4 0s2.4 3.2 4 0 2.4-3.2 4 0 2.4 3.2 4 0"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="text-step-11 font-semibold text-text-0 whitespace-nowrap">
        Meet U 视频工作室
      </span>
      <span
        className="text-[10px] leading-none px-1.5 py-1 rounded font-medium whitespace-nowrap text-white"
        style={{
          background:
            "linear-gradient(90deg, var(--color-brand-gradient-from), var(--color-brand-gradient-to))",
        }}
      >
        安杰开发
      </span>
    </div>
  );
}
