/**
 * SlideshowSubPanels — internal sub-surface components for SlideshowPanel.
 * Not exported from the package index; used only by SlideshowPanel.tsx.
 */

import { useState, useCallback, useId } from "react";
import type { SlideRef, SlideHotspot, SlideSequence } from "@hyperframes/core/slideshow";
import type { DomEditSelection } from "../editor/domEditing";
import type { SceneInfo } from "./slideshowPanelHelpers";
import { generateId } from "../../utils/generateId";

// ── Section header (accordion toggle) ────────────────────────────────────

export function SectionHeader({
  children,
  expanded,
  onToggle,
}: {
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-medium text-neutral-400 hover:text-neutral-200 active:bg-neutral-800/60 border-b border-neutral-800 transition-colors"
      onClick={onToggle}
      aria-expanded={expanded}
    >
      <span>{children}</span>
      <span className="text-[10px] text-neutral-600">{expanded ? "▲" : "▼"}</span>
    </button>
  );
}

// ── Sub-surface: Slide List ──────────────────────────────────────────────

export interface SlideListProps {
  scenes: SceneInfo[];
  slides: SlideRef[];
  selectedSceneId: string | null;
  onSelect: (sceneId: string) => void;
  onToggle: (sceneId: string) => void;
  onReorder: (sceneId: string, dir: "up" | "down") => void;
}

export function SlideList({
  scenes,
  slides,
  selectedSceneId,
  onSelect,
  onToggle,
  onReorder,
}: SlideListProps) {
  const slideIds = new Set(slides.map((s) => s.sceneId));
  const sceneById = new Map(scenes.map((s) => [s.id, s]));
  const orderedSlideScenes = slides
    .map((sl) => sceneById.get(sl.sceneId))
    .filter((s): s is SceneInfo => s !== undefined);
  const nonSlideScenes = scenes.filter((sc) => !slideIds.has(sc.id));
  const rows = [...orderedSlideScenes, ...nonSlideScenes];
  return (
    <div className="flex flex-col gap-px">
      {rows.map((scene) => {
        const isSlide = slideIds.has(scene.id);
        const isSelected = selectedSceneId === scene.id;
        const slideIndex = slides.findIndex((s) => s.sceneId === scene.id);
        return (
          <div
            key={scene.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-[11px] transition-colors ${
              isSelected ? "bg-on text-text-0" : "hover:bg-neutral-800/60 text-neutral-300"
            }`}
            onClick={() => onSelect(scene.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(scene.id);
              }
            }}
          >
            <input
              type="checkbox"
              aria-label={`将 ${scene.label} 设为主线幻灯片`}
              checked={isSlide}
              onChange={() => onToggle(scene.id)}
              onClick={(e) => e.stopPropagation()}
              className="accent-studio-accent shrink-0"
            />
            <span className="flex-1 truncate">{scene.label || scene.id}</span>
            {isSlide && (
              <span className="flex gap-0.5 shrink-0">
                <button
                  type="button"
                  aria-label="上移幻灯片"
                  title="上移"
                  disabled={slideIndex <= 0}
                  className="px-1 py-0.5 text-[10px] text-neutral-400 enabled:hover:text-text-0 enabled:active:scale-[0.95] disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder(scene.id, "up");
                  }}
                >
                  ▲
                </button>
                <button
                  type="button"
                  aria-label="下移幻灯片"
                  title="下移"
                  disabled={slideIndex === slides.length - 1}
                  className="px-1 py-0.5 text-[10px] text-neutral-400 enabled:hover:text-text-0 enabled:active:scale-[0.95] disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder(scene.id, "down");
                  }}
                >
                  ▼
                </button>
              </span>
            )}
          </div>
        );
      })}
      {scenes.length === 0 && (
        <p className="px-3 py-2 text-[11px] text-neutral-500 italic">未找到场景</p>
      )}
    </div>
  );
}

// ── Sub-surface: Slide Inspector ─────────────────────────────────────────

export interface SlideInspectorProps {
  sceneId: string;
  slide: SlideRef | undefined;
  currentTime: number;
  onSetNotes: (notes: string) => void;
  onMarkFragment: () => void;
  onRemoveFragment: (time: number) => void;
}

// fallow-ignore-next-line complexity
export function SlideInspector({
  sceneId,
  slide,
  currentTime,
  onSetNotes,
  onMarkFragment,
  onRemoveFragment,
}: SlideInspectorProps) {
  const fragments = slide?.fragments ?? [];
  return (
    <div className="flex flex-col gap-3 px-3 py-2">
      <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide truncate">
        场景： {sceneId}
      </p>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-neutral-400">备注</label>
        <textarea
          className="bg-neutral-800 border border-neutral-700 rounded-sm px-2 py-1.5 text-[11px] text-text-0 resize-none placeholder-neutral-600 focus:border-studio-accent/60 focus:outline-hidden"
          rows={3}
          placeholder="演讲备注或脚本…"
          value={slide?.notes ?? ""}
          onChange={(e) => onSetNotes(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-neutral-400">分步停顿点</span>
          <button
            type="button"
            className="text-[10px] px-2 py-0.5 rounded-sm bg-hover hover:bg-press text-neutral-200 transition-colors"
            onClick={onMarkFragment}
            title={`将 ${currentTime.toFixed(2)}s 标记为停顿点`}
          >
            标记 {currentTime.toFixed(2)}s
          </button>
        </div>
        {fragments.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {fragments.map((t, i) => (
              <span
                key={`frag-${i}`}
                className="inline-flex items-center gap-1 bg-neutral-700 rounded-sm px-1.5 py-0.5 text-[10px] text-neutral-200"
              >
                {t.toFixed(2)}s
                <button
                  type="button"
                  aria-label={`移除 ${t.toFixed(2)}s 处的停顿点`}
                  className="text-neutral-400 hover:text-danger-ink transition-colors"
                  onClick={() => onRemoveFragment(t)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-neutral-600 italic">还没有停顿点</p>
        )}
      </div>
    </div>
  );
}

// ── Sub-surface: Branch Tree ──────────────────────────────────────────────

export interface BranchTreeProps {
  sequences: SlideSequence[];
  scenes: SceneInfo[];
  onCreateSequence: (label: string) => void;
  onRenameSequence: (id: string, label: string) => void;
  onDeleteSequence: (id: string) => void;
  onAssign: (sequenceId: string, sceneId: string, assign: boolean) => void;
  selectedSceneId: string | null;
  selectedSequenceId: string | null;
  onSelectBranchSlide: (sequenceId: string, sceneId: string) => void;
}

export function BranchTree({
  sequences,
  scenes,
  onCreateSequence,
  onRenameSequence,
  onDeleteSequence,
  onAssign,
  selectedSceneId,
  selectedSequenceId,
  onSelectBranchSlide,
}: BranchTreeProps) {
  const [newLabel, setNewLabel] = useState("");
  const inputId = useId();

  const handleCreate = useCallback(() => {
    const label = newLabel.trim();
    if (!label) return;
    onCreateSequence(label);
    setNewLabel("");
  }, [newLabel, onCreateSequence]);

  return (
    <div className="flex flex-col gap-3 px-3 py-2">
      <div className="flex gap-1.5">
        <input
          id={inputId}
          type="text"
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-sm px-2 py-1 text-[11px] text-text-0 placeholder-neutral-600 focus:border-studio-accent/60 focus:outline-hidden"
          placeholder="新分支名称…"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          aria-label="新分支序列名称"
        />
        <button
          type="button"
          className="px-2 py-1 rounded-sm bg-hover hover:bg-press text-[11px] text-neutral-200 transition-colors shrink-0"
          onClick={handleCreate}
        >
          添加
        </button>
      </div>

      {sequences.length === 0 ? (
        <p className="text-[10px] text-neutral-600 italic">还没有分支</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sequences.map((seq) => (
            <BranchItem
              key={seq.id}
              seq={seq}
              scenes={scenes}
              onRename={onRenameSequence}
              onDelete={onDeleteSequence}
              onAssign={onAssign}
              selectedSceneId={selectedSceneId}
              selectedSequenceId={selectedSequenceId}
              onSelectBranchSlide={onSelectBranchSlide}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface BranchItemProps {
  seq: SlideSequence;
  scenes: SceneInfo[];
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onAssign: (sequenceId: string, sceneId: string, assign: boolean) => void;
  selectedSceneId: string | null;
  selectedSequenceId: string | null;
  onSelectBranchSlide: (sequenceId: string, sceneId: string) => void;
}

function BranchItem({
  seq,
  scenes,
  onRename,
  onDelete,
  onAssign,
  selectedSceneId,
  selectedSequenceId,
  onSelectBranchSlide,
}: BranchItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(seq.label);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const commitRename = useCallback(() => {
    const label = draft.trim();
    if (label && label !== seq.label) onRename(seq.id, label);
    setEditing(false);
  }, [draft, onRename, seq.id, seq.label]);

  return (
    <div className="border border-neutral-700/60 rounded-sm p-2 flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {editing ? (
          <input
            className="flex-1 bg-neutral-800 border border-neutral-600 rounded-sm px-1.5 py-0.5 text-[11px] text-text-0 focus:border-studio-accent/60 focus:outline-hidden"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setEditing(false);
            }}
            aria-label={`重命名分支 ${seq.label}`}
          />
        ) : (
          <span
            role="button"
            tabIndex={0}
            className="flex-1 text-[11px] text-text-0 font-medium truncate cursor-pointer hover:text-neutral-300"
            title="点击重命名"
            onClick={() => setEditing(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setEditing(true);
              }
            }}
          >
            {seq.label}
          </span>
        )}
        <button
          type="button"
          aria-label={`删除分支 ${seq.label}`}
          className="text-[10px] text-neutral-500 hover:text-danger-ink active:scale-[0.95] transition-colors px-1"
          onClick={() => setConfirmingDelete(true)}
        >
          ✕
        </button>
      </div>
      {confirmingDelete && (
        <div className="px-2 py-1.5 bg-danger/15 border-l-2 border-red-500 flex flex-col gap-1 rounded-xs">
          <span className="text-[10px] text-danger-ink">
            删除分支“{seq.label}&rdquo;
            {seq.slides.length > 0
              ? `及其 ${seq.slides.length} 张幻灯片${seq.slides.length === 1 ? "" : ""}`
              : ""}
            ？指向它的热点将失效。
          </span>
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => {
                setConfirmingDelete(false);
                onDelete(seq.id);
              }}
              className="px-2 py-0.5 text-[10px] rounded-sm bg-danger text-on-danger hover:brightness-95 active:brightness-90 transition-colors"
            >
              删除
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="px-2 py-0.5 text-[10px] rounded-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-px pl-2">
        {scenes.map((scene) => {
          const assigned = seq.slides.some((s) => s.sceneId === scene.id);
          const isSelected = selectedSequenceId === seq.id && selectedSceneId === scene.id;
          return (
            <div
              key={scene.id}
              className="flex items-center gap-1.5 py-0.5 text-[11px] text-neutral-400"
            >
              <input
                type="checkbox"
                aria-label={`将 ${scene.label || scene.id} 分配到分支 ${seq.label}`}
                checked={assigned}
                onChange={(e) => onAssign(seq.id, scene.id, e.target.checked)}
                className="accent-studio-accent shrink-0"
              />
              {assigned ? (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  className={`flex-1 text-left truncate transition-colors hover:text-neutral-200 ${
                    isSelected ? "text-text-0" : "text-neutral-400"
                  }`}
                  onClick={() => onSelectBranchSlide(seq.id, scene.id)}
                >
                  {scene.label || scene.id}
                </button>
              ) : (
                <span className="flex-1 truncate">{scene.label || scene.id}</span>
              )}
            </div>
          );
        })}
        {scenes.length === 0 && <p className="text-[10px] text-neutral-600 italic">没有场景</p>}
      </div>
    </div>
  );
}

// ── Sub-surface: Hotspot Tool ─────────────────────────────────────────────

export interface HotspotToolProps {
  selectedSceneId: string | null;
  slide: SlideRef | undefined;
  domEditSelection: DomEditSelection | null;
  sequences: SlideSequence[];
  onAddHotspot: (sceneId: string, hotspot: SlideHotspot) => void;
  onRemoveHotspot: (sceneId: string, hotspotId: string) => void;
}

// fallow-ignore-next-line complexity
export function HotspotTool({
  selectedSceneId,
  slide,
  domEditSelection,
  sequences,
  onAddHotspot,
  onRemoveHotspot,
}: HotspotToolProps) {
  const [targetSequenceId, setTargetSequenceId] = useState("");
  const [hotspotLabel, setHotspotLabel] = useState("");
  const hotspots = slide?.hotspots ?? [];

  const selectedElementId = domEditSelection?.element?.id ?? null;
  const selectedHfId = domEditSelection?.hfId ?? null;
  const elementKey = selectedElementId || selectedHfId;

  // fallow-ignore-next-line complexity
  const handleMakeHotspot = useCallback(() => {
    if (!selectedSceneId || !targetSequenceId || !elementKey) return;
    const id = `hotspot-${elementKey}-${generateId()}`;
    const label = hotspotLabel.trim() || elementKey;
    onAddHotspot(selectedSceneId, { id, label, target: targetSequenceId });
    setHotspotLabel("");
  }, [selectedSceneId, targetSequenceId, elementKey, hotspotLabel, onAddHotspot]);

  if (!selectedSceneId) {
    return (
      <div className="px-3 py-2">
        <p className="text-[11px] text-neutral-500 italic">在幻灯片列表中选择一个场景</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-3 py-2">
      <div className="flex flex-col gap-1.5">
        <p className="text-[11px] text-neutral-400">
          已选元素：{" "}
          <span className="text-neutral-200 font-mono">{elementKey ?? "none"}</span>
        </p>
        {!elementKey && (
          <p className="text-[10px] text-neutral-500 italic">
            点击画布上的元素，作为热点目标。
          </p>
        )}
        {sequences.length === 0 && (
          <p className="text-[10px] text-neutral-500 italic">
            请先在「分支」区域创建分支——热点会跳转到分支。
          </p>
        )}
        <label className="text-[11px] text-neutral-400">热点标签</label>
        <input
          type="text"
          className="bg-neutral-800 border border-neutral-700 rounded-sm px-2 py-1 text-[11px] text-text-0 placeholder-neutral-600 focus:border-studio-accent/60 focus:outline-hidden"
          placeholder="按钮文字…"
          value={hotspotLabel}
          onChange={(e) => setHotspotLabel(e.target.value)}
          aria-label="热点标签"
        />
        <label className="text-[11px] text-neutral-400">目标分支</label>
        <select
          className="bg-neutral-800 border border-neutral-700 rounded-sm px-2 py-1 text-[11px] text-text-0 focus:border-studio-accent/60 focus:outline-hidden"
          value={targetSequenceId}
          onChange={(e) => setTargetSequenceId(e.target.value)}
          aria-label="目标分支序列"
        >
          <option value="">— 选择分支 —</option>
          {sequences.map((seq) => (
            <option key={seq.id} value={seq.id}>
              {seq.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!elementKey || !targetSequenceId}
          title={
            !elementKey
              ? "请先在画布上选择一个元素"
              : !targetSequenceId
                ? "请先选择目标分支"
                : undefined
          }
          className="px-3 py-1.5 rounded-sm bg-accent enabled:hover:bg-accent-hover enabled:active:scale-[0.98] text-on-accent text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleMakeHotspot}
        >
          创建热点
        </button>
      </div>

      {hotspots.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] text-neutral-400 font-medium">本页幻灯片上的热点</p>
          {hotspots.map((h) => {
            const seqLabel = sequences.find((s) => s.id === h.target)?.label ?? h.target;
            return (
              <div
                key={h.id}
                className="flex items-center gap-2 bg-neutral-800 rounded-sm px-2 py-1"
              >
                <span className="flex-1 text-[11px] text-neutral-200 truncate">
                  {h.label} → <span className="text-neutral-400">{seqLabel}</span>
                </span>
                <button
                  type="button"
                  aria-label={`移除热点 ${h.label}`}
                  className="text-[10px] text-neutral-500 hover:text-danger-ink transition-colors"
                  onClick={() => onRemoveHotspot(selectedSceneId, h.id)}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
