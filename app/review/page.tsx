'use client';

import AppLayout from '../components/AppLayout';
import { useDate } from '../components/DateProvider';
import { useEffect, useMemo, useState } from 'react';
import type { Box } from '@/lib/types';
import { getBoxesForDay, markMissedForDay, shiftBox, deleteBox } from '@/lib/actions/boxes';

export default function ReviewPage() {
  return (
    <AppLayout>
      <ReviewPageContent />
    </AppLayout>
  );
}

function ReviewPageContent() {
  const { selectedDate, formatForInput } = useDate();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [busy, setBusy] = useState(false);

  // 顶部短暂提示
  const [toast, setToast] = useState<string | null>(null);
  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(null), 1600);
  }

  function diffMin(a: Date, b: Date): number {
    return Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));
  }

  async function refresh() {
    setBusy(true);
    try {
      const changed = await markMissedForDay(selectedDate);
      const rows = await getBoxesForDay(selectedDate);
      setBoxes(rows);
      if (changed > 0) showToast(`已标记 ${changed} 项为未完成`);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const done = useMemo(() => boxes.filter((b) => b.status === 'done'), [boxes]);
  const active = useMemo(() => boxes.filter((b) => b.status === 'active'), [boxes]);
  const planned = useMemo(() => boxes.filter((b) => b.status === 'planned'), [boxes]);
  const missed = useMemo(() => boxes.filter((b) => b.status === 'missed'), [boxes]);

  const plannedMin = useMemo(() => planned.reduce((acc, b) => acc + diffMin(b.start, b.end), 0), [planned]);
  const doneMin = useMemo(() => done.reduce((acc, b) => acc + diffMin(b.start, b.end), 0), [done]);
  const missedMin = useMemo(() => missed.reduce((acc, b) => acc + diffMin(b.start, b.end), 0), [missed]);
  const activeMin = useMemo(() => active.reduce((acc, b) => acc + diffMin(b.start, b.end), 0), [active]);

  const totalScheduledMin = plannedMin + doneMin + missedMin + activeMin;
  const efficiencyPct = totalScheduledMin > 0 ? Math.round((doneMin / totalScheduledMin) * 100) : 0;
  // 动态高度权重（按条目数），确保每栏最小占位
  const G_MIN = 1;
  const growDone = Math.max(G_MIN, done.length);
  const growMissed = Math.max(G_MIN, missed.length);
  const growPlanned = Math.max(G_MIN, planned.length);
  const SECTION_MIN_PX = 120;

  async function snoozeAllMissed() {
    if (missed.length === 0) return;
    setBusy(true);
    let ok = 0;
    let fail = 0;
    try {
      for (const b of missed) {
        try {
          await shiftBox(b.id);
          ok++;
        } catch {
          fail++;
        }
      }
      await refresh();
      showToast(`已顺延 ${ok} 项；失败 ${fail} 项`);
    } finally {
      setBusy(false);
    }
  }

  // 单条顺延
  async function snoozeOne(id: string) {
    setBusy(true);
    try {
      await shiftBox(id);
      await refresh();
      showToast('已顺延 1 项');
    } catch {
      showToast('顺延失败 1 项');
    } finally {
      setBusy(false);
    }
  }

  // 新增：删除未完成项
  async function deleteOne(id: string) {
    const ok = window.confirm('确定删除此未完成项？');
    if (!ok) return;
    setBusy(true);
    try {
      await deleteBox(id);
      await refresh();
      showToast('已删除 1 项');
    } catch {
      showToast('删除失败 1 项');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="h-full flex flex-col min-h-0 overflow-hidden">
        {/* 顶部固定区：标题/日期/操作/指标卡片 */}
        <div className="shrink-0">
          <h1 className="text-2xl font-semibold mb-2">Review 复盘</h1>
          <p className="text-sm text-gray-600">当前日期：{formatForInput(selectedDate)}</p>
          <div className="mt-2 flex gap-2">
            <button
              className="px-3 py-1 text-sm rounded-full bg-purple-800 text-white disabled:opacity-50"
              onClick={refresh}
              disabled={busy}
            >
              刷新
            </button>
          </div>
          {toast ? (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-purple-800 text-white text-xs rounded-full px-3 py-2 shadow">
              {toast}
            </div>
          ) : null}

          {/* 指标卡片 */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border rounded-2xl bg-yellow-50/30 p-3">
              <div className="text-xs text-gray-500">已计划盒子</div>
              <div className="text-lg font-semibold">{planned.length}</div>
              <div className="text-xs text-gray-500 mt-1">{plannedMin} 分钟</div>
            </div>
            <div className="border rounded-2xl bg-yellow-50/30 p-3">
              <div className="text-xs text-gray-500">已完成盒子</div>
              <div className="text-lg font-semibold">{done.length}</div>
              <div className="text-xs text-gray-500 mt-1">{doneMin} 分钟</div>
            </div>
            <div className="border rounded-2xl bg-yellow-50/30 p-3">
              <div className="text-xs text-gray-500">效率（完成/计划）</div>
              <div className="text-lg font-semibold">{efficiencyPct}%</div>
            </div>
            <div className="border rounded-2xl bg-yellow-50/30 p-4">
              <div className="text-xs text-gray-500">进行中</div>
              <div className="text-lg font-semibold">{active.length}</div>
              <div className="text-xs text-gray-500 mt-1">{active.length > 0 ? '正在推进' : '空闲中'}</div>
            </div>
          </div>
      </div>

      {/* 三栏区域：同屏显示，按内容动态分配高度，栏内滚动 */}
      <div className="mt-4 flex-1 min-h-0 overflow-hidden flex flex-col gap-3">
        {/* 今日已完成 */}
        <section
          className="border rounded-2xl bg-yellow-50/30 p-3 flex flex-col min-h-0"
          style={{ flexGrow: growDone, minHeight: SECTION_MIN_PX }}
        >
          <div className="font-medium mb-2 shrink-0">今日已完成</div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {done.length === 0 ? (
              <div className="text-sm text-gray-500">暂无完成记录。</div>
            ) : (
              <ul className="space-y-2">
                {done.map((b) => (
                  <li key={b.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm truncate">{b.title}</div>
                      <div className="text-xs text-gray-500">
                        {fmtHM(b.start)} — {fmtHM(b.end)}（{diffMin(b.start, b.end)} 分钟）
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-400/30">
                      已完成
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 今日未完成（超时） */}
        <section
          className="border rounded-2xl bg-yellow-50/30 p-3 flex flex-col min-h-0"
          style={{ flexGrow: growMissed, minHeight: SECTION_MIN_PX }}
        >
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="font-medium">今日未完成（超时）</div>
            <button
              className="px-3 py-1 text-sm rounded-full bg-amber-500 text-white disabled:opacity-50"
              onClick={snoozeAllMissed}
              disabled={busy || missed.length === 0}
              title="将今日未完成盒子移到下一空窗"
            >
              一键顺延全部
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {missed.length === 0 ? (
              <div className="text-sm text-gray-500">暂无未完成记录。</div>
            ) : (
              <ul className="space-y-2">
                {missed.map((b) => (
                  <li key={b.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm truncate">{b.title}</div>
                      <div className="text-xs text-gray-500">
                        {fmtHM(b.start)} — {fmtHM(b.end)}（{diffMin(b.start, b.end)} 分钟）
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-400/10 text-rose-700 ring-1 ring-rose-400/30">
                        未完成
                      </span>
                      <button 
                        className="px-2 py-0.5 text-[11px] rounded-full bg-amber-500 text-white disabled:opacity-50"
                        onClick={() => snoozeOne(b.id)}
                        disabled={busy}
                        title="顺延到下一空窗"
                      >
                        顺延
                      </button>
                      <button 
                        className="px-2 py-0.5 text-[11px] rounded-full bg-rose-600 text-white disabled:opacity-50"
                        onClick={() => deleteOne(b.id)}
                        disabled={busy}
                        title="删除此未完成项"
                      >
                        删除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 今日已计划 */}
        <section
          className="border rounded-2xl bg-yellow-50/30 p-3 flex flex-col min-h-0"
          style={{ flexGrow: growPlanned, minHeight: SECTION_MIN_PX }}
        >
          <div className="font-medium mb-2 shrink-0">今日已计划</div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {planned.length === 0 ? (
              <div className="text-sm text-gray-500">今日暂无计划盒子。</div>
            ) : (
              <ul className="space-y-2">
                {planned.map((b) => (
                  <li key={b.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm truncate">{b.title}</div>
                      <div className="text-xs text-gray-500">
                        {fmtHM(b.start)} — {fmtHM(b.end)}（{diffMin(b.start, b.end)} 分钟）
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-700 ring-1 ring-amber-400/30">
                      已计划
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
    </>
  );
}

function fmtHM(d: Date) {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
