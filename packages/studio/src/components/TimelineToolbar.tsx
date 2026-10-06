import { memo, useEffect, useRef, type ReactNode } from "react";
import {
  ArrowsOutLineHorizontal,
  Image,
  Magnet,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
} from "@phosphor-icons/react";
import {
  useEnableKeyframes,
  isPlayheadWithinTween,
  type EnableKeyframesSession,
} from "../hooks/useEnableKeyframes";
import { computeElementPercentage, playsNear } from "../hooks/gsapShared";
import { useKeyframeKeyboard } from "../hooks/useKeyframeKeyboard";
import {
  getNextTimelineZoomPercent,
  getTimelineZoomPercent,
  timelineZoomPercentToSlider,
  timelineSliderToZoomPercent,
} from "../player/components/timelineZoom";
import { useTimelineZoom } from "../player/components/useTimelineZoom";
import { usePlayerStore, type TimelineElement } from "../player";
import { Tooltip } from "./ui";
import { AudioMetersIcon } from "./icons/AudioMetersIcon";
import { RippleEditIcon } from "./icons/RippleEditIcon";
import { flatActive, flatBtn, flatDisabled, flatIdle } from "./timelineToolbarStyles";
import { TimelineHistoryButtons, type TimelineHistoryButtonsProps } from "./TimelineHistoryButtons";
import { TimelineToolPicker } from "./TimelineToolPicker";
import type { GsapAnimation } from "@hyperframes/core/gsap-parser";
import type { DomEditSelection } from "./editor/domEditingTypes";
import { canSplitElement } from "../utils/timelineElementSplit";
import { useAudioMetersVisible } from "../utils/audioMeterVisibility";
import { LinkedSelectionToggle } from "./LinkedSelectionToggle";
import { useProjectHasAudio } from "../utils/audioMeterMath";
import { canAddBeatAt, addBeatAtCompositionTime } from "../utils/beatEditActions";
import { isTypingTarget } from "../utils/typingTarget";
import { SPLIT_SHORTCUT_HINT } from "../player/components/studioShortcuts";
import type { TimelineProps } from "../player/components/TimelineTypes";

interface DomEditSessionSlice extends EnableKeyframesSession {
  domEditSelection: DomEditSelection | null;
  selectedGsapAnimations: GsapAnimation[];
}

export interface TimelineToolbarProps {
  domEditSession?: DomEditSessionSlice;
  onSplitElement?: (element: TimelineElement, splitTime: number) => void;
  splitShortcut?: TimelineProps["splitShortcut"];
  history?: TimelineHistoryButtonsProps;
  showHistory?: boolean;
  showSelectAroundPlayhead?: boolean;
  showAddBeat?: boolean;
  /** Hides Add keyframe and auto-record, and turns off auto-record and the K shortcut with them. */
  showKeyframes?: boolean;
  rightActions?: ReactNode;
}

interface KeyframeToggleState {
  state: "active" | "inactive" | "none";
  isMotionPath: boolean;
  pathEndpoint: boolean;
  willExtend: boolean;
}

const NO_KEYFRAME_TOGGLE: KeyframeToggleState = {
  state: "none",
  isMotionPath: false,
  pathEndpoint: false,
  willExtend: false,
};

function isMotionPathEndpoint(animation: GsapAnimation | undefined, percentage: number): boolean {
  if (!animation?.keyframes) return false;
  const keyframes = animation.keyframes.keyframes;
  return [keyframes[0], keyframes.at(-1)].some(
    (keyframe) => keyframe && playsNear(animation, keyframe.percentage, percentage),
  );
}

function resolveKeyframeToggleState(
  session: DomEditSessionSlice | undefined,
  currentTime: number,
): KeyframeToggleState {
  if (!session?.domEditSelection) return NO_KEYFRAME_TOGGLE;
  const arcAnimation = session.selectedGsapAnimations.find(
    (animation) => animation.arcPath && animation.keyframes,
  );
  const animation =
    arcAnimation ??
    session.selectedGsapAnimations.find((candidate) => candidate.keyframes && !candidate.arcPath);
  if (!animation?.keyframes) return NO_KEYFRAME_TOGGLE;

  const isMotionPath = Boolean(arcAnimation);
  if (!isPlayheadWithinTween(animation, currentTime)) {
    return { state: "inactive", isMotionPath, pathEndpoint: false, willExtend: true };
  }

  const percentage = computeElementPercentage(currentTime, session.domEditSelection, animation);
  const pathEndpoint = isMotionPathEndpoint(arcAnimation, percentage);
  const active = animation.keyframes.keyframes.some((keyframe) =>
    playsNear(animation, keyframe.percentage, percentage),
  );
  return {
    state: pathEndpoint ? "none" : active ? "active" : "inactive",
    isMotionPath,
    pathEndpoint,
    willExtend: false,
  };
}

/**
 * Can this element be keyframed at all?
 *
 * An audio clip cannot. It has no box on the canvas, so there is nothing to move,
 * scale or fade — and "add a keyframe" on one seeds a tween from the position
 * properties, which produced a position lane on a track that has no position. Audio
 * is automated instead: volume and effect parameters, on their own lanes.
 */
function isKeyframeable(element: TimelineElement | undefined): boolean {
  return element?.tag !== "audio";
}

function useKeyframeToggle(session?: DomEditSessionSlice) {
  const currentTime = usePlayerStore((s) => s.currentTime);
  const selectedElementId = usePlayerStore((s) => s.selectedElementId);
  const elements = usePlayerStore((s) => s.elements);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const onToggle = useEnableKeyframes(
    sessionRef as React.RefObject<EnableKeyframesSession | undefined>,
  );

  const selected = elements.find((element) => (element.key ?? element.id) === selectedElementId);
  if (!isKeyframeable(selected)) return { ...NO_KEYFRAME_TOGGLE, onToggle: undefined };

  const toggleState = resolveKeyframeToggleState(session, currentTime);

  return {
    ...toggleState,
    onToggle: session?.domEditSelection && !toggleState.pathEndpoint ? onToggle : undefined,
  };
}

// fallow-ignore-next-line complexity
export const TimelineToolbar = memo(function TimelineToolbar({
  domEditSession,
  onSplitElement,
  splitShortcut = SPLIT_SHORTCUT_HINT,
  history,
  showHistory = true,
  showSelectAroundPlayhead = true,
  showAddBeat = true,
  showKeyframes = true,
  rightActions,
}: TimelineToolbarProps) {
  const timelineSnapEnabled = usePlayerStore((s) => s.timelineSnapEnabled);
  const setTimelineSnapEnabled = usePlayerStore((s) => s.setTimelineSnapEnabled);
  const rippleEditEnabled = usePlayerStore((s) => s.rippleEditEnabled);
  const setRippleEditEnabled = usePlayerStore((s) => s.setRippleEditEnabled);
  const autoKeyframeEnabled = usePlayerStore((s) => s.autoKeyframeEnabled);
  const setAutoKeyframeEnabled = usePlayerStore((s) => s.setAutoKeyframeEnabled);
  const thumbnailMode = usePlayerStore((s) => s.thumbnailMode);
  const setThumbnailMode = usePlayerStore((s) => s.setThumbnailMode);
  const thumbnailsVisible = thumbnailMode === "adaptive";
  const audioMetersVisible = useAudioMetersVisible((s) => s.visible);
  const setAudioMetersVisible = useAudioMetersVisible((s) => s.setVisible);
  const projectHasAudio = useProjectHasAudio();
  // Subscribe so the add-beat button reacts to playhead movement and analysis load.
  const currentTime = usePlayerStore((s) => s.currentTime);
  const beatAnalysisReady = usePlayerStore((s) => s.beatAnalysis !== null);
  // Subscribe (not getState) so the split button enables/disables the moment
  // the selection changes, not only on the next playhead tick.
  const selectedElementId = usePlayerStore((s) => s.selectedElementId);
  const elements = usePlayerStore((s) => s.elements);
  const timelineFitPps = usePlayerStore((s) => s.timelineFitPps);
  const { zoomMode, manualZoomPercent, setZoomMode, setManualZoomPercent } = useTimelineZoom();
  const displayedTimelineZoomPercent = getTimelineZoomPercent(
    zoomMode,
    manualZoomPercent,
    timelineFitPps,
  );
  const {
    state: keyframeState,
    isMotionPath: keyframeIsMotionPath,
    pathEndpoint: keyframePathEndpoint,
    willExtend: keyframeWillExtend,
    onToggle: onToggleKeyframe,
  } = useKeyframeToggle(domEditSession);

  // Wire the "Add keyframe (K)" shortcut the toolbar advertises. Active only when
  // there's a keyframeable selection; otherwise K stays JKL-pause in playback.
  useKeyframeKeyboard({
    enabled: showKeyframes && Boolean(onToggleKeyframe),
    onAddKeyframe: onToggleKeyframe,
  });

  useEffect(() => {
    if (!showKeyframes) setAutoKeyframeEnabled(false);
  }, [showKeyframes, setAutoKeyframeEnabled]);

  // "N" toggles timeline snapping (industry convention: Resolve/FCP).
  // Skip when typing in an input/contenteditable.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "n" && e.key !== "N") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      const store = usePlayerStore.getState();
      store.setTimelineSnapEnabled(!store.timelineSnapEnabled);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    // The "TIMELINE" label is dropped for CapCut-like density — the pane's
    // position (tracks right below) makes it self-evident.
    <div className="border-b border-neutral-800/60">
      <div className="flex items-center justify-between px-2 py-0.5">
        <div className="flex items-center gap-0.5">
          {showHistory && <TimelineHistoryButtons {...history} />}
          <TimelineToolPicker showSelectAroundPlayhead={showSelectAroundPlayhead} />
          {/* Divider: tool-mode | editing-actions */}
          <div aria-hidden="true" className="mx-1 h-4 w-px bg-neutral-800" />
          <LinkedSelectionToggle />
          <Tooltip label={timelineSnapEnabled ? "吸附已开启（N）" : "吸附已关闭（N）"}>
            <button
              type="button"
              onClick={() => setTimelineSnapEnabled(!timelineSnapEnabled)}
              aria-label="切换时间线吸附"
              aria-pressed={timelineSnapEnabled}
              className={timelineSnapEnabled ? flatActive : flatIdle}
            >
              <Magnet size={16} weight="bold" aria-hidden="true" />
            </button>
          </Tooltip>
          <Tooltip
            label={
              rippleEditEnabled
                ? "波纹已开启 — 主轨道保持无空隙"
                : "波纹已关闭 — 删除主轨道片段会留下空隙"
            }
          >
            <button
              type="button"
              onClick={() => setRippleEditEnabled(!rippleEditEnabled)}
              aria-label="切换波纹编辑"
              aria-pressed={rippleEditEnabled}
              className={rippleEditEnabled ? flatActive : flatIdle}
            >
              <RippleEditIcon size={16} />
            </button>
          </Tooltip>
          {projectHasAudio && (
            <Tooltip label={audioMetersVisible ? "隐藏音量表" : "显示音量表"}>
              <button
                type="button"
                onClick={() => setAudioMetersVisible(!audioMetersVisible)}
                aria-label="切换音量表"
                aria-pressed={audioMetersVisible}
                className={audioMetersVisible ? flatActive : flatIdle}
              >
                <AudioMetersIcon size={16} />
              </button>
            </Tooltip>
          )}
          {showKeyframes && (
            <>
              {/* With no keyframeable selection the button fades to disabled instead of
              unmounting, so the toolbar layout never shifts (CapCut-style). */}
              <Tooltip
                label={
                  keyframePathEndpoint
                    ? "运动路径的端点无法移除"
                    : !onToggleKeyframe
                      ? "选择一个带动画的元素来添加关键帧"
                      : keyframeIsMotionPath
                        ? keyframeWillExtend
                          ? "将运动路径延伸到播放头（K）"
                          : keyframeState === "active"
                            ? "从运动路径移除路径点（K）"
                            : "在运动路径上添加路径点（K）"
                        : keyframeState === "active"
                          ? "移除播放头处的关键帧（K）"
                          : keyframeState === "inactive"
                            ? keyframeWillExtend
                              ? "在播放头处添加关键帧，延长动画（K）"
                              : "在播放头处添加关键帧（K）"
                            : "添加关键帧（K）"
                }
              >
                <button
                  type="button"
                  disabled={!onToggleKeyframe}
                  onClick={onToggleKeyframe}
                  aria-label={
                    keyframePathEndpoint
                      ? "运动路径端点"
                      : keyframeIsMotionPath
                        ? keyframeState === "active"
                          ? "移除运动路径点"
                          : keyframeWillExtend
                            ? "将运动路径延伸到播放头"
                            : "添加运动路径点"
                        : keyframeState === "active"
                          ? "移除播放头处的关键帧"
                          : "在播放头处添加关键帧"
                  }
                  className={
                    !onToggleKeyframe
                      ? flatDisabled
                      : `${flatBtn} active:scale-[0.98] hover:bg-hover ${
                          keyframeState === "active"
                            ? "text-accent-ink"
                            : keyframeState === "inactive"
                              ? "text-neutral-400 hover:text-accent-ink"
                              : "text-neutral-600 hover:text-neutral-400"
                        }`
                  }
                >
                  <svg width="16" height="16" viewBox="0 0 10 10" fill="currentColor">
                    {keyframeState === "active" ? (
                      <path d="M5 0.5L9.5 5L5 9.5L0.5 5Z" />
                    ) : (
                      <path
                        d="M5 1.2L8.8 5L5 8.8L1.2 5Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    )}
                  </svg>
                </button>
              </Tooltip>
              <Tooltip
                label={
                  autoKeyframeEnabled
                    ? "自动将手动修改记录为关键帧（点击关闭）"
                    : "手动修改不会记录为关键帧（点击开启）"
                }
              >
                <button
                  type="button"
                  onClick={() => setAutoKeyframeEnabled(!autoKeyframeEnabled)}
                  aria-label="自动将手动修改记录为关键帧"
                  aria-pressed={autoKeyframeEnabled}
                  className={`${flatBtn} active:scale-[0.98] hover:bg-hover ${
                    autoKeyframeEnabled
                      ? "text-danger-ink"
                      : "text-neutral-600 hover:text-neutral-400"
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 10 10" fill="none">
                    {/* Same diamond outline as the Add-keyframe icon, with a
                      record-style dot inside: filled = auto-recording,
                      hollow = manual edits won't be keyframed. */}
                    <path d="M5 0.7L9.3 5L5 9.3L0.7 5Z" stroke="currentColor" strokeWidth="1" />
                    <circle
                      cx="5"
                      cy="5"
                      r="1.8"
                      fill={autoKeyframeEnabled ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </svg>
                </button>
              </Tooltip>
            </>
          )}
          {onSplitElement &&
            (() => {
              // Render the button unconditionally (disabled when unusable):
              // mounting/unmounting mid-task shifts the neighboring controls.
              // Mirrors the S-key gate: selected clip + playhead strictly inside it.
              const el = selectedElementId
                ? elements.find((e) => (e.key ?? e.id) === selectedElementId)
                : null;
              const splittable = el != null && canSplitElement(el);
              const canSplit =
                splittable && currentTime > el.start && currentTime < el.start + el.duration;
              return (
                <Tooltip
                  label={
                    canSplit
                      ? `在播放头处分割（${splitShortcut}）`
                      : splittable
                        ? "将播放头移到片段内才能分割"
                        : "选择要分割的片段"
                  }
                >
                  <button
                    type="button"
                    disabled={!canSplit}
                    aria-label="在播放头处分割"
                    onClick={() => {
                      if (canSplit && el) onSplitElement(el, currentTime);
                    }}
                    className={canSplit ? flatIdle : flatDisabled}
                  >
                    {/* "][" split glyph: two outward-facing brackets with a center gap */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {/* Right bracket of left half: ] */}
                      <path d="M5 3 L7 3 L7 13 L5 13" />
                      {/* Left bracket of right half: [ */}
                      <path d="M11 3 L9 3 L9 13 L11 13" />
                    </svg>
                  </button>
                </Tooltip>
              );
            })()}
          {(() => {
            if (!showAddBeat) return null;
            // Rendered whenever shown (CapCut-style): before beat analysis loads (or when
            // the project has no analyzed music) the button fades to a disabled
            // state instead of unmounting, so the toolbar layout never shifts.
            const canAdd = beatAnalysisReady && canAddBeatAt(currentTime);
            return (
              <Tooltip
                label={
                  !beatAnalysisReady
                    ? "先添加带节拍分析的音乐轨道，才能放置节拍"
                    : canAdd
                      ? "在播放头处添加节拍"
                      : "播放头处已有节拍"
                }
              >
                <button
                  type="button"
                  disabled={!canAdd}
                  aria-label="在播放头处添加节拍"
                  onClick={() => {
                    if (canAdd) addBeatAtCompositionTime(currentTime);
                  }}
                  className={
                    canAdd
                      ? `${flatBtn} text-text-2 hover:bg-hover hover:text-accent-ink active:scale-[0.98]`
                      : flatDisabled
                  }
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 10C21 12.2091 16.9706 14 12 14M21 10C21 7.79086 16.9706 6 12 6C7.02944 6 3 7.79086 3 10M21 10V16C21 18.2091 16.9706 20 12 20M12 14C7.02944 14 3 12.2091 3 10M12 14V20M3 10V16C3 18.2091 7.02944 20 12 20M7 19.3264V13.3264M17 19.3264V13.3264M12 10L20 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Tooltip>
            );
          })()}
        </div>
        <div className="flex items-center gap-0.5">
          {rightActions}
          <Tooltip
            label={
              thumbnailsVisible
                ? "隐藏缩略图 — 只显示名称"
                : "显示缩略图 — 始终显示封面，操作时显示更丰富的预览"
            }
          >
            <button
              type="button"
              aria-label={
                thumbnailsVisible
                  ? "隐藏缩略图 — 只显示名称"
                  : "显示缩略图 — 始终显示封面，操作时显示更丰富的预览"
              }
              aria-pressed={thumbnailsVisible}
              onClick={() => setThumbnailMode(thumbnailsVisible ? "hidden" : "adaptive")}
              className={`h-7 px-2 rounded-md text-[11px] font-medium transition-colors ${
                thumbnailsVisible
                  ? "bg-studio-accent/10 text-accent-ink"
                  : "text-neutral-400 hover:bg-hover hover:text-neutral-200"
              }`}
            >
              <Image size={16} aria-hidden="true" />
            </button>
          </Tooltip>
          <Tooltip label="时间线适应宽度">
            <button
              type="button"
              onClick={() => setZoomMode("fit")}
              aria-label="时间线适应宽度"
              aria-pressed={zoomMode === "fit"}
              className={`h-7 px-2 rounded-md text-[11px] font-medium transition-colors ${
                zoomMode === "fit"
                  ? "bg-studio-accent/10 text-accent-ink"
                  : "text-neutral-400 hover:bg-hover hover:text-neutral-200"
              }`}
            >
              <ArrowsOutLineHorizontal size={16} aria-hidden="true" />
            </button>
          </Tooltip>
          <Tooltip label="缩小">
            <button
              type="button"
              aria-label="缩小"
              onClick={() => {
                setZoomMode("manual");
                setManualZoomPercent(
                  getNextTimelineZoomPercent("out", zoomMode, manualZoomPercent, timelineFitPps),
                );
              }}
              className={flatIdle}
            >
              <MagnifyingGlassMinus size={16} aria-hidden="true" />
            </button>
          </Tooltip>
          <input
            type="range"
            min="0"
            max="100"
            value={timelineZoomPercentToSlider(displayedTimelineZoomPercent, timelineFitPps)}
            title={`${displayedTimelineZoomPercent}%`}
            aria-label="时间线缩放"
            onChange={(e) => {
              setZoomMode("manual");
              setManualZoomPercent(
                timelineSliderToZoomPercent(Number(e.target.value), timelineFitPps),
              );
            }}
            // h-6 on the input is the 24x24 WCAG 2.2 (2.5.8) target: the visible
            // track stays 2px and the thumb 10px, only the pointer box grows.
            className="mx-1 h-6 w-[96px] cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-[2px] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-neutral-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[10px] [&::-webkit-slider-thumb]:h-[10px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-text-0 [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_#0a0a0a,0_1px_3px_rgba(0,0,0,0.5)] [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb:active]:cursor-grabbing"
          />
          <Tooltip label="放大">
            <button
              type="button"
              aria-label="放大"
              onClick={() => {
                setZoomMode("manual");
                setManualZoomPercent(
                  getNextTimelineZoomPercent("in", zoomMode, manualZoomPercent, timelineFitPps),
                );
              }}
              className={flatIdle}
            >
              <MagnifyingGlassPlus size={16} aria-hidden="true" />
            </button>
          </Tooltip>
          {/* Numeric zoom readout (main-parity): "Fit" in fit mode, N% in manual. */}
          <span
            className="ml-1 w-[38px] text-right font-mono text-[11px] tabular-nums text-neutral-500 select-none"
            aria-label="时间线缩放比例"
          >
            {zoomMode === "fit" ? "适应窗口" : `${displayedTimelineZoomPercent}%`}
          </span>
        </div>
      </div>
    </div>
  );
});
