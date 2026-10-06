import { editabilityForProvenance, type GsapProvenance } from "@hyperframes/core/gsap-parser-acorn";

/**
 * Notice shown for computed tweens: helper/loop tweens offer an "unroll to
 * edit" action; runtime-computed values point to the Code tab. Literal tweens
 * render nothing.
 */
export function ComputedTweenNotice({
  provenance,
  onUnroll,
}: {
  provenance?: GsapProvenance;
  onUnroll?: () => void;
}) {
  const editability = editabilityForProvenance(provenance);
  if (editability === "direct") return null;
  if (editability === "source") {
    return (
      <div className="rounded-md border border-neutral-800 bg-neutral-900/50 px-2 py-1.5 text-[9px] text-neutral-400">
        这是计算得出的值，请在「代码」标签页中修改。
      </div>
    );
  }
  const source = provenance?.fn ? `${provenance.fn}()` : "a loop";
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-neutral-800 bg-neutral-900/50 px-2 py-1.5 text-[9px] text-neutral-400">
      <span>由 {source} 生成，无法直接编辑。</span>
      {onUnroll && (
        <button
          type="button"
          onClick={onUnroll}
          className="shrink-0 rounded-sm px-1.5 py-0.5 text-[9px] font-medium text-accent-ink hover:bg-neutral-800"
          title="把辅助函数/循环展开成独立的补间动画，这样就能直接编辑这个关键帧"
        >
          展开后编辑
        </button>
      )}
    </div>
  );
}
