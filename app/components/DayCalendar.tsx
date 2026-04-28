'use client';

import { useCallback, useMemo, useRef, useState, useEffect, Fragment } from 'react';
import type { Box } from '@/lib/types';
import {
  startBox,
  finishBox,
  deleteBox,
  updateBoxTimes,
  findNextFreeSlot,
  shiftBox,
  splitActiveBox,
} from '@/lib/actions/boxes';
import { hasOverlap } from '@/lib/utils/overlap';
import { useI18n } from './I18nProvider';

type Props = {
  day: Date;
  boxes: Box[];
  onChanged: () => Promise<void>;
  onSelectBox?: (box?: Box) => void;
  selectedBoxId?: string;
};

function toDayTime(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map((v) => parseInt(v, 10));
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

function diffMin(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

function formatHM(d: Date) {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function DayCalendar({
  day,
  boxes,
  onChanged,
  onSelectBox,
  selectedBoxId,
}: Props) {
  const { t } = useI18n();
  // === 常量 ===
  const pxPerMin = 2;
  const MIN_BOX_MINUTES = 15;
  const roundStep = 5;
  const LABEL_COL_WIDTH = 48;
  const CONTENT_LEFT_PAD = 8;
  const CONTENT_RIGHT_PAD = 8;

  // === 两栏定义 ===
  const columns = useMemo(() => {
    const leftStart = toDayTime(day, '05:00');
    const leftEnd = toDayTime(day, '13:00');
    const rightStart = toDayTime(day, '13:00');
    const rightEnd = toDayTime(day, '24:00');
    return [
      {
        index: 0 as const,
        start: leftStart,
        end: leftEnd,
        eventStart: leftStart,
        totalMin: diffMin(leftStart, leftEnd), // 480
      },
      {
        index: 1 as const,
        start: rightStart,
        end: rightEnd,
        eventStart: rightStart,
        totalMin: diffMin(rightStart, rightEnd), // 660
      },
    ];
  }, [day]);

  // === Refs ===
  const colRefs = useRef<(HTMLDivElement | null)[]>([null, null]);

  // === 交互态 ===
  const [moving, setMoving] = useState<{ id: string; durationMin: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; start: Date } | null>(null);
  const [activeColIndex, setActiveColIndex] = useState<number | null>(null);
  const [draftStart, setDraftStart] = useState<Date | null>(null);
  const [draftEnd, setDraftEnd] = useState<Date | null>(null);
  const interacting = !!resizing || !!moving;
  const [busy, setBusy] = useState(false);

  // 长按拖拽状态
  const [isDragReady, setIsDragReady] = useState(false);
  const [dragTimer, setDragTimer] = useState<NodeJS.Timeout | null>(null);

  // 冲突状态
  const [conflict, setConflict] = useState<{ start: Date; end: Date; boxId: string } | null>(null);

  // === 辅助函数（栏相关）===
  function clampToCol(t: Date, colStart: Date, colEnd: Date): Date {
    if (t < colStart) return new Date(colStart);
    if (t > colEnd) return new Date(colEnd);
    return t;
  }

  function roundToStep(t: Date): Date {
    const min = Math.round(t.getMinutes() / roundStep) * roundStep;
    const d = new Date(t);
    d.setMinutes(min, 0, 0);
    return d;
  }

  function colTimeToY(t: Date, colStart: Date, colEnd: Date): number {
    const clamped = clampToCol(t, colStart, colEnd);
    const minutes = diffMin(colStart, clamped);
    return minutes * pxPerMin;
  }

  function colYToTime(y: number, colStart: Date, colEnd: Date): Date {
    const min = Math.round(y / pxPerMin);
    const d = new Date(colStart);
    d.setMinutes(d.getMinutes() + min, 0, 0);
    return roundToStep(clampToCol(d, colStart, colEnd));
  }

  // === 冲突检测 ===
  const hasConflict = useCallback((start: Date, end: Date, exceptId?: string): boolean => {
    return hasOverlap(start, end, boxes, exceptId);
  }, [boxes]);

  const liveConflict = useMemo(() => {
    if (moving && draftStart && draftEnd) {
      return hasConflict(draftStart, draftEnd, moving.id);
    }
    if (resizing && draftStart && draftEnd) {
      return hasConflict(draftStart, draftEnd, resizing.id);
    }
    return false;
  }, [hasConflict, moving, resizing, draftStart, draftEnd]);

  // 冲突弹窗定位
  const POP_HEIGHT = 96;
  function getConflictPopoverY(conflictEnd: Date, colIndex: number): number | null {
    const col = columns[colIndex];
    if (!col) return null;
    const raw = colTimeToY(conflictEnd, col.start, col.end);
    const containerHeight = col.totalMin * pxPerMin;
    const clampedTop = Math.max(raw - POP_HEIGHT / 2, 8);
    return Math.min(clampedTop, containerHeight - POP_HEIGHT - 8);
  }

  // === 判断鼠标在哪个栏（栏外返回 null） ===
  function resolveColIndexFromX(clientX: number): number | null {
    const r0 = colRefs.current[0]?.getBoundingClientRect();
    const r1 = colRefs.current[1]?.getBoundingClientRect();
    if (r0 && clientX >= r0.left && clientX <= r0.right) return 0;
    if (r1 && clientX >= r1.left && clientX <= r1.right) return 1;
    return null;
  }

  // === 紧急程度映射 + 色调 ===
  function getUrgency(b: Box): 'high' | 'medium' | 'low' {
    const tags = (b.tags ?? []).map((t) => t.toLowerCase());
    const includesAny = (keys: string[]) => tags.some((t) => keys.some((k) => t.includes(k)));
    if (includesAny(['#紧急', '紧急', '急', '#urgent', 'urgent', '高', '#high', 'high'])) return 'high';
    if (includesAny(['#中', '中', '#重要', '重要', '#medium', 'medium', '#important', 'important'])) return 'medium';
    if (includesAny(['#低', '低', '不急', '#normal', 'normal', 'low', '#low', '一般', '#一般'])) return 'low';
    if (b.status === 'missed') return 'high';
    if (b.status === 'done') return 'low';
    if (b.status === 'active') return 'medium';
    return 'medium';
  }

  function toneForBox(b: Box): string {
    if (b.is_plan_session) {
      return 'capsule-card bg-gradient-to-br from-blue-100/85 via-indigo-100/75 to-sky-100/85 border-indigo-300/60';
    }
    switch (getUrgency(b)) {
      case 'high':
        return 'capsule-card bg-gradient-to-br from-red-100/85 via-rose-100/75 to-red-100/85 border-red-300/60';
      case 'medium':
        return 'capsule-card bg-gradient-to-br from-amber-100/85 via-yellow-100/75 to-amber-100/85 border-amber-300/60';
      case 'low':
        return 'capsule-card bg-gradient-to-br from-emerald-100/85 via-green-100/75 to-emerald-100/85 border-emerald-300/60';
      default:
        return 'capsule-card bg-gradient-to-br from-slate-100/85 via-gray-100/75 to-slate-100/85 border-slate-300/60';
    }
  }

  // === 长按拖拽逻辑 ===
  function handlePointerDown(box: Box, e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    const timer = setTimeout(() => {
      setIsDragReady(true);
      startMove(box, e);
    }, 300);
    setDragTimer(timer);
  }

  function handleClick(box: Box) {
    if (!isDragReady && !moving) {
      onSelectBox?.(box);
    }
  }

  // === 触发移动/拉伸 ===
  function startMove(box: Box, e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const durationMin = diffMin(box.start as Date, box.end as Date);
    setMoving({ id: box.id, durationMin });
    setDraftStart(box.start as Date);
    setDraftEnd(box.end as Date);
  }

  function startResize(box: Box, e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setResizing({ id: box.id, start: box.start as Date });
    setDraftStart(box.start as Date);
    setDraftEnd(box.end as Date);
  }

  // === 全局 Pointer Move（跨栏拖拽） ===
  function handleGlobalPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!moving && !resizing) return;

    const targetColIndex = resolveColIndexFromX(e.clientX);
    // 鼠标在栏外：不更新 activeColIndex，不滚动，保持当前状态
    if (targetColIndex === null) return;

    if (activeColIndex !== targetColIndex) {
      setActiveColIndex(targetColIndex);
    }

    const col = columns[targetColIndex];
    const colRef = colRefs.current[targetColIndex];
    if (!colRef) return;

    const rect = colRef.getBoundingClientRect();

    // 自动滚动边缘（仅当前栏）
    const EDGE = 48;
    const STEP = 24;
    if (e.clientY > rect.bottom - EDGE) {
      colRef.scrollTop = Math.min(colRef.scrollTop + STEP, colRef.scrollHeight - colRef.clientHeight);
    } else if (e.clientY < rect.top + EDGE) {
      colRef.scrollTop = Math.max(colRef.scrollTop - STEP, 0);
    }

    const y = e.clientY - rect.top + colRef.scrollTop;

    if (moving && draftStart && draftEnd) {
      const t = colYToTime(y, col.start, col.end);
      const fixedDuration = moving.durationMin;
      setDraftStart(t);
      setDraftEnd(new Date(t.getTime() + fixedDuration * 60000));
    }

    if (resizing && draftStart) {
      const t = colYToTime(y, col.start, col.end);
      const min = diffMin(draftStart, t);
      const end =
        min < MIN_BOX_MINUTES
          ? new Date(draftStart.getTime() + MIN_BOX_MINUTES * 60000)
          : t;
      setDraftEnd(end);
    }
  }

  // === 全局 Pointer Up ===
  function handleGlobalPointerUp() {
    if (moving && draftStart && draftEnd) {
      if (hasConflict(draftStart, draftEnd, moving.id)) {
        setConflict({ start: draftStart, end: draftEnd, boxId: moving.id });
      } else {
        void finalizeUpdate(moving.id, draftStart, draftEnd);
      }
    }

    if (resizing && draftStart && draftEnd) {
      if (hasConflict(draftStart, draftEnd, resizing.id)) {
        setConflict({ start: draftStart, end: draftEnd, boxId: resizing.id });
      } else {
        void finalizeUpdate(resizing.id, draftStart, draftEnd);
      }
    }

    setMoving(null);
    setResizing(null);
    setDraftStart(null);
    setDraftEnd(null);
    setActiveColIndex(null);
    setIsDragReady(false);
    if (dragTimer) {
      clearTimeout(dragTimer);
      setDragTimer(null);
    }
  }

  async function finalizeUpdate(boxId: string, start: Date, end: Date) {
    await updateBoxTimes(boxId, start, end);
    await onChanged();
  }

  async function moveConflictToNextFreeSlot() {
    if (!conflict) return;
    const duration = diffMin(conflict.start, conflict.end);
    const slot = await findNextFreeSlot(day, duration, conflict.end);
    if (!slot) {
      alert(t('calendar.alert.noSlot'));
      return;
    }
    await finalizeUpdate(conflict.boxId, slot.start, slot.end);
    setConflict(null);
  }

  // === 背景点击取消选中 ===
  const handleBackgroundClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-box="true"]') || target.closest('[data-interactive="true"]')) return;
    onSelectBox?.(undefined);
  };

  // === 键盘快捷键 ===
  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      if (!selectedBoxId) return;
      if (busy) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const editable = target?.getAttribute('contenteditable') === 'true';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || editable) return;

      const box = boxes.find((x) => x.id === selectedBoxId);
      if (!box) return;

      const key = e.key.toLowerCase();

      if (key === 'escape') {
        onSelectBox?.(undefined);
        return;
      }

      if (key === ' ' || key === 'enter') {
        e.preventDefault();
        if (box.status === 'active') {
          await finishBox(box.id);
        } else if (box.status === 'planned') {
          await startBox(box.id);
        }
        await onChanged();
        return;
      }

      if (key === 'x' && box.status === 'active') {
        e.preventDefault();
        await splitActiveBox(box.id);
        await onChanged();
        return;
      }

      if (key === 's' && box.status === 'planned') {
        e.preventDefault();
        await shiftBox(box.id);
        await onChanged();
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedBoxId, boxes, onChanged, onSelectBox, busy]);

  // === 渲染 ===
  return (
    <div className="relative h-full bg-yellow-50/30" onClick={handleBackgroundClick}>
      {/* 交互时禁用文本选择 */}
      <style>{interacting ? 'html { user-select: none; }' : ''}</style>

      <div className="flex flex-row h-full relative">
        {columns.map((col) => {
          const bgHeight = col.totalMin * pxPerMin;

          // 小时刻度
          const hours: Date[] = [];
          const d = new Date(col.start);
          while (d <= col.end) {
            hours.push(new Date(d));
            d.setHours(d.getHours() + 1, 0, 0, 0);
          }

          // 过滤并截断事件
          const colBoxes = boxes
            .filter((b) => (b.start as Date) < col.end && (b.end as Date) > col.eventStart)
            .sort((a, c) => (a.start as Date).getTime() - (c.start as Date).getTime())
            .map((b) => ({
              box: b,
              start: clampToCol(b.start as Date, col.eventStart, col.end),
              end: clampToCol(b.end as Date, col.eventStart, col.end),
            }));

          return (
            <div
              key={col.index}
              className={`relative flex flex-col h-full ${col.index === 0 ? 'border-r border-slate-200/60' : ''}`}
              style={{ width: '50%', minWidth: '200px' }}
            >
              {/* 栏标题 */}
              <div className="text-center text-xs text-slate-500 py-1 font-medium border-b border-slate-200/40 shrink-0">
                {col.index === 0 ? '05:00-13:00' : '13:00-24:00'}
              </div>

              {/* 栏内容 */}
              <div className="relative flex-1 overflow-hidden">
                <div
                  ref={(el) => { colRefs.current[col.index] = el; }}
                  className="relative h-full overflow-y-auto overflow-x-hidden custom-scrollbar pr-5 -mr-5"
                >
                  <div style={{ height: `${bgHeight}px` }} className="relative pt-5 pb-5">
                  {/* 小时刻度 */}
                  {hours.map((h, i) => (
                    <div key={i} className="absolute" style={{ top: `${colTimeToY(h, col.start, col.end)}px`, height: 0 }}>
                      <div className="absolute border-t border-slate-200/60" style={{ left: LABEL_COL_WIDTH, right: 0 }} />
                      {!(col.index === 0 && h.getTime() === col.end.getTime()) && (
                        <div className="absolute top-1 left-0 pointer-events-none" style={{ width: LABEL_COL_WIDTH }}>
                          <div className="mx-auto w-fit text-[10px] text-slate-600 bg-white/95 px-2 py-1 rounded-full border border-slate-200/60 shadow-sm z-30 text-center font-medium font-mono">
                            {h.getTime() === col.end.getTime() && h.getHours() === 0
                              ? '24:00'
                              : `${String(h.getHours()).padStart(2, '0')}:00`}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* 事件卡片 */}
                  {colBoxes.map(({ box: b, start, end }) => {
                    const top = colTimeToY(start, col.start, col.end);
                    const height = diffMin(start, end) * pxPerMin;
                    const done = b.status === 'done';
                    const active = b.status === 'active';

                    const cardBase =
                      'absolute rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer';
                    const cardTone = toneForBox(b);
                    const enableMove = height >= 30;

                    return (
                      <Fragment key={`${b.id}-${col.index}`}>
                        <div
                          data-box="true"
                          onClick={() => handleClick(b)}
                          className={`${cardBase} ${cardTone} ${
                            selectedBoxId === b.id ? 'ring-2 ring-blue-400/60 shadow-lg' : ''
                          } ${done ? 'opacity-70' : ''}`}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            left: LABEL_COL_WIDTH + CONTENT_LEFT_PAD,
                            right: CONTENT_RIGHT_PAD,
                            ...(b.color ? { borderColor: b.color, borderWidth: 1, borderStyle: 'solid' } : {}),
                          }}
                        >
                          {/* 左侧拖拽区域 */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-8 ${
                              enableMove ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                            }`}
                            onPointerDown={enableMove ? (e) => handlePointerDown(b, e) : undefined}
                            title={enableMove ? t('calendar.dragMove') : ''}
                          />

                          {/* 中右侧点击区域 */}
                          <div
                            className="absolute left-8 top-0 bottom-0 right-0 cursor-pointer"
                            onClick={() => onSelectBox?.(b)}
                          />

                          <div className="flex items-center px-2 py-1 relative z-10 pointer-events-none">
                            <div className="flex items-center gap-2">
                              <div className={`text-sm font-medium truncate ${done ? 'line-through' : ''} text-slate-800`}>
                                {b.title} {b.is_plan_session ? <span className="text-blue-600">{t('calendar.planBadge')}</span> : null}
                              </div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  active
                                    ? 'status-active'
                                    : done
                                    ? 'status-done'
                                    : b.status === 'missed'
                                    ? 'status-urgent'
                                    : 'status-planned'
                                }`}
                              >
                                {active ? t('status.active') : done ? t('status.done') : b.status === 'missed' ? t('status.missed') : t('status.planned')}
                              </span>
                            </div>
                          </div>

                          <div
                            data-resize="true"
                            className="absolute left-0 right-0 h-3 bottom-0 cursor-ns-resize bg-gradient-to-t from-slate-100/20 to-transparent rounded-b-2xl hover:from-slate-200/20 transition-colors duration-200"
                            onPointerDown={(e) => startResize(b, e)}
                            onClick={(e) => e.stopPropagation()}
                            title={t('calendar.resize')}
                          />
                        </div>

                        {/* 选中时弹出竖排操作菜单（放在卡片外部避免 overflow-hidden 裁剪） */}
                        {selectedBoxId === b.id && (
                          <div
                            className="absolute z-50 flex flex-col gap-1 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-1.5 border border-slate-200/60 min-w-[4.5rem] pointer-events-auto"
                            data-interactive="true"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              top: `${top + height + 4}px`,
                              right: `${CONTENT_RIGHT_PAD}px`,
                            }}
                          >
                            {b.status === 'planned' ? (
                              <>
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setBusy(true);
                                    try {
                                      await startBox(b.id);
                                      await onChanged();
                                    } finally {
                                      setBusy(false);
                                    }
                                  }}
                                  className="w-full text-center px-2 py-1 text-[10px] rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors duration-200 font-medium"
                                  disabled={busy}
                                >
                                  {t('common.start')}
                                </button>
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setBusy(true);
                                    try {
                                      await shiftBox(b.id);
                                      await onChanged();
                                    } finally {
                                      setBusy(false);
                                    }
                                  }}
                                  className="w-full text-center px-2 py-1 text-[10px] rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors duration-200 font-medium"
                                  disabled={busy}
                                >
                                  {t('common.snooze')}
                                </button>
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={async (e) => {
                                  e.stopPropagation();
                                  setBusy(true);
                                  try {
                                      await deleteBox(b.id);
                                      await onChanged();
                                    } finally {
                                      setBusy(false);
                                    }
                                  }}
                                  className="w-full text-center px-2 py-1 text-[10px] rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors duration-200 font-medium"
                                  disabled={busy}
                                >
                                  {t('common.delete')}
                                </button>
                              </>
                            ) : b.status === 'active' ? (
                              <>
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setBusy(true);
                                    try {
                                      await finishBox(b.id);
                                      await onChanged();
                                    } finally {
                                      setBusy(false);
                                    }
                                  }}
                                  className="w-full text-center px-2 py-1 text-[10px] rounded-lg bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors duration-200 font-medium"
                                  disabled={busy}
                                >
                                  {t('common.done')}
                                </button>
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setBusy(true);
                                    try {
                                      await splitActiveBox(b.id);
                                      await onChanged();
                                    } finally {
                                      setBusy(false);
                                    }
                                  }}
                                  className="w-full text-center px-2 py-1 text-[10px] rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 font-medium"
                                  disabled={busy}
                                >
                                  {t('common.split')}
                                </button>
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setBusy(true);
                                    try {
                                      await deleteBox(b.id);
                                      await onChanged();
                                    } finally {
                                      setBusy(false);
                                    }
                                  }}
                                  className="w-full text-center px-2 py-1 text-[10px] rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors duration-200 font-medium"
                                  disabled={busy}
                                >
                                  {t('common.delete')}
                                </button>
                              </>
                            ) : b.status === 'missed' ? (
                              <>
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setBusy(true);
                                    try {
                                      await shiftBox(b.id);
                                      await onChanged();
                                    } finally {
                                      setBusy(false);
                                    }
                                  }}
                                  className="w-full text-center px-2 py-1 text-[10px] rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors duration-200 font-medium"
                                  disabled={busy}
                                >
                                  {t('common.snooze')}
                                </button>
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setBusy(true);
                                    try {
                                      await deleteBox(b.id);
                                      await onChanged();
                                    } finally {
                                      setBusy(false);
                                    }
                                  }}
                                  className="w-full text-center px-2 py-1 text-[10px] rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors duration-200 font-medium"
                                  disabled={busy}
                                >
                                  {t('common.delete')}
                                </button>
                              </>
                            ) : (
                              <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setBusy(true);
                                  try {
                                    await deleteBox(b.id);
                                    await onChanged();
                                  } finally {
                                    setBusy(false);
                                  }
                                }}
                                className="w-full text-center px-2 py-1 text-[10px] rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors duration-200 font-medium"
                                disabled={busy}
                              >
                                {t('common.delete')}
                              </button>
                            )}
                          </div>
                        )}
                      </Fragment>
                    );
                  })}

                  {/* 移动预览 */}
                  {moving && activeColIndex === col.index && draftStart && draftEnd && (
                    <>
                      <div
                        className={`absolute z-50 pointer-events-none border-2 ${
                          liveConflict ? 'border-red-500/70 bg-red-300/5' : 'border-blue-500/70 bg-blue-300/5'
                        } border-dashed rounded`}
                        style={{
                          top: `${colTimeToY(draftStart, col.start, col.end)}px`,
                          height: `${diffMin(draftStart, draftEnd) * pxPerMin}px`,
                          left: LABEL_COL_WIDTH + CONTENT_LEFT_PAD,
                          right: CONTENT_RIGHT_PAD,
                        }}
                      />
                      <div
                        className="absolute z-50 pointer-events-none"
                        style={{ top: `${colTimeToY(draftStart, col.start, col.end)}px`, height: 0, left: LABEL_COL_WIDTH, right: 0 }}
                      >
                        <div className={`border-t-2 ${liveConflict ? 'border-red-500' : 'border-blue-500'}`}></div>
                        <div
                          className={`absolute -top-3 left-2 text-[10px] px-2 py-0.5 rounded-full ${liveConflict ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'} shadow`}
                        >
                          {formatHM(draftStart)}
                        </div>
                      </div>
                      <div
                        className="absolute z-50 pointer-events-none"
                        style={{ top: `${colTimeToY(draftEnd, col.start, col.end)}px`, height: 0, left: LABEL_COL_WIDTH, right: 0 }}
                      >
                        <div className={`border-t-2 ${liveConflict ? 'border-red-500' : 'border-blue-500'}`}></div>
                        <div
                          className={`absolute -top-3 right-2 text-[10px] px-2 py-0.5 rounded-full ${liveConflict ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'} shadow`}
                        >
                          {formatHM(draftEnd)} · {t('calendar.previewDuration', { minutes: diffMin(draftStart, draftEnd) })}{liveConflict ? ` · ${t('calendar.conflictSuffix')}` : ''}
                        </div>
                      </div>
                    </>
                  )}

                  {/* 拉伸预览 */}
                  {resizing && activeColIndex === col.index && draftEnd && (
                    <>
                      <div
                        className={`absolute z-50 pointer-events-none border-2 ${
                          liveConflict ? 'border-red-500/70 bg-red-300/5' : 'border-blue-500/70 bg-blue-300/5'
                        } border-dashed rounded`}
                        style={{
                          top: `${colTimeToY(resizing.start, col.start, col.end)}px`,
                          height: `${diffMin(resizing.start, draftEnd) * pxPerMin}px`,
                          left: LABEL_COL_WIDTH + CONTENT_LEFT_PAD,
                          right: CONTENT_RIGHT_PAD,
                        }}
                      />
                      <div
                        className="absolute z-50 pointer-events-none"
                        style={{ top: `${colTimeToY(resizing.start, col.start, col.end)}px`, height: 0, left: LABEL_COL_WIDTH, right: 0 }}
                      >
                        <div className={`border-t-2 ${liveConflict ? 'border-red-500' : 'border-blue-500'}`}></div>
                        <div
                          className={`absolute -top-3 left-2 text-[10px] px-2 py-0.5 rounded-full ${liveConflict ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'} shadow`}
                        >
                          {formatHM(resizing.start)}
                        </div>
                      </div>
                      <div
                        className="absolute z-50 pointer-events-none"
                        style={{ top: `${colTimeToY(draftEnd, col.start, col.end)}px`, height: 0, left: LABEL_COL_WIDTH, right: 0 }}
                      >
                        <div className={`border-t-2 ${liveConflict ? 'border-red-500' : 'border-blue-500'}`}></div>
                        <div
                          className={`absolute -top-3 right-2 text-[10px] px-2 py-0.5 rounded-full ${liveConflict ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'} shadow`}
                        >
                          {formatHM(draftEnd)} · {t('calendar.previewDuration', { minutes: diffMin(resizing.start, draftEnd) })}{liveConflict ? ` · ${t('calendar.conflictSuffix')}` : ''}
                        </div>
                      </div>
                    </>
                  )}

                  {/* 冲突弹窗 */}
                    {conflict && (
                      <div className="absolute inset-0 z-50" onPointerDown={(e) => { e.stopPropagation(); setConflict(null); }}>
                        <div
                          className="absolute right-3 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-4 text-sm border border-slate-200/60"
                          style={{
                            top: `${(getConflictPopoverY(conflict.end, activeColIndex ?? 0) ?? colTimeToY(conflict.end, col.start, col.end))}px`,
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <div className="font-semibold mb-1 text-slate-800">{t('calendar.conflict')}</div>
                          <div className="text-xs text-slate-600 mb-3">
                            {formatHM(conflict.start)} — {formatHM(conflict.end)}
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1.5 text-xs rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors duration-200 font-medium"
                              onClick={moveConflictToNextFreeSlot}
                              title={t('calendar.moveNextTitle')}
                            >
                              {t('calendar.moveNext')}
                            </button>
                            <button
                              className="px-3 py-1.5 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 font-medium"
                              onClick={async () => {
                                await finalizeUpdate(conflict.boxId, conflict.start, conflict.end);
                                setConflict(null);
                              }}
                            >
                              {t('calendar.saveAnyway')}
                            </button>
                            <button
                              className="px-3 py-1.5 text-xs rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors duration-200 font-medium"
                              onClick={() => setConflict(null)}
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {col.index === 0 && <div className="pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-[#fbf8f0]" />}
              {col.index === 1 && <div className="pointer-events-none absolute inset-y-0 right-0 w-[2px] bg-[#fbf8f0]" />}
            </div>
          );
        })}

        {/* 交互期间的全局捕获层 */}
        {interacting && (
          <div
            className="absolute inset-0 z-40"
            style={{ background: 'transparent' }}
            onPointerMove={handleGlobalPointerMove}
            onPointerUp={handleGlobalPointerUp}
          />
        )}
      </div>
    </div>
  );
}
