import { memo } from "react";
import type { GsapAnimation } from "@hyperframes/core/gsap-parser";
import { Film } from "../../icons/SystemIcons";
import { Section } from "./propertyPanelPrimitives";
import type { GsapAnimationEditCallbacks } from "./gsapAnimationCallbacks";
import { GsapAnimationList } from "./GsapAnimationList";

interface GsapAnimationSectionProps extends GsapAnimationEditCallbacks {
  elementId: string;
  animations: GsapAnimation[];
  multipleTimelines?: boolean;
  unsupportedTimelinePattern?: boolean;
  onAddAnimation: (method: "to" | "from" | "set" | "fromTo") => void;
}

export const GsapAnimationSection = memo(function GsapAnimationSection({
  elementId,
  animations,
  multipleTimelines,
  unsupportedTimelinePattern,
  onAddAnimation,
  ...callbacks
}: GsapAnimationSectionProps) {
  return (
    <Section title="动画" icon={<Film size={15} />}>
      {multipleTimelines && (
        <p className="mb-2 rounded-lg bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-warning-ink">
          此文件包含多个 GSAP 时间线，为防止数据丢失已禁用动画编辑。合并为单个时间线后即可编辑。
        </p>
      )}
      {unsupportedTimelinePattern && (
        <p className="mb-2 rounded-lg bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-warning-ink">
          此时间线使用了计算得出的键（window.__timelines[variable]），编辑器无法静态解析。请改用字符串字面量键（window.__timelines[&quot;id&quot;]）或变量声明（const tl = gsap.timeline()）以启用编辑。
        </p>
      )}
      {multipleTimelines || unsupportedTimelinePattern ? null : (
        <GsapAnimationList
          {...callbacks}
          elementId={elementId}
          animations={animations}
          onAddAnimation={onAddAnimation}
          variant="classic"
        />
      )}
    </Section>
  );
});
