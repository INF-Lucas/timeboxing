'use client';

import AppLayout from '../components/AppLayout';
import { useDate } from '../components/DateProvider';
import { useEffect, useRef, useState } from 'react';
import type { Settings } from '@/lib/types';
import { initDefaultSettings, getSettings, updateSettings } from '@/lib/actions/settings';
import {
  clearLocalData,
  exportLocalData,
  getLocalStorageInfo,
  importLocalData,
  type LocalStorageInfo,
} from '@/lib/actions/storage';

export default function SettingsPage() {
  return (
    <AppLayout>
      <SettingsPageContent />
    </AppLayout>
  );
}

function SettingsPageContent() {
  const { selectedDate, formatForInput } = useDate();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [storageInfo, setStorageInfo] = useState<LocalStorageInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  function showToast(text: string) {
    setToast(text);
    setTimeout(() => setToast(null), 1600);
  }

  async function refreshSettings() {
    const s = await getSettings();
    setSettings(s);
  }

  async function refreshStorageInfo() {
    const info = await getLocalStorageInfo();
    setStorageInfo(info);
  }

  useEffect(() => {
    refreshSettings();
    refreshStorageInfo();
  }, []);

  async function handleInitSettings() {
    const s = await initDefaultSettings();
    setSettings(s);
    await refreshStorageInfo();
    showToast('已初始化默认设置');
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const next = await updateSettings({
        workday_start: settings.workday_start,
        workday_end: settings.workday_end,
        planning_default_minutes: settings.planning_default_minutes,
        focus_shield: settings.focus_shield,
        calendar_integration_enabled: settings.calendar_integration_enabled,
      });
      setSettings(next);
      await refreshStorageInfo();
      showToast('设置已保存');
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    const payload = await exportLocalData();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeboxing-backup-${formatForInput(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('已导出本地数据');
  }

  async function handleImportFile(file: File) {
    const text = await file.text();
    const payload = JSON.parse(text);
    await importLocalData(payload, true);
    await refreshSettings();
    await refreshStorageInfo();
    showToast('已导入本地数据');
  }

  async function handleClearData() {
    const ok = window.confirm('确定清空本地数据？此操作会删除时间盒、待办、日志和设置。');
    if (!ok) return;
    await clearLocalData();
    const defaults = await initDefaultSettings();
    setSettings(defaults);
    await refreshStorageInfo();
    showToast('已清空本地数据');
  }

  return (
    <div>
      {toast ? (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-purple-800 text-white text-xs rounded-full px-3 py-2 shadow">
          {toast}
        </div>
      ) : null}
      <h1 className="text-2xl font-semibold mb-2">Settings 设置</h1>
      <p className="text-sm text-gray-600">当前日期：{formatForInput(selectedDate)}</p>

      <div className="mt-4 border rounded-2xl bg-yellow-50/30 p-4">
        <h2 className="text-lg font-medium mb-3">工作日与计划参数</h2>
        {!settings ? (
          <div className="text-sm text-gray-500">正在加载设置……</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">工作日开始</label>
              <input
                type="time"
                className="border rounded px-2 py-1 text-sm"
                value={settings.workday_start}
                onChange={(e) => setSettings({ ...settings, workday_start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">工作日结束</label>
              <input
                type="time"
                className="border rounded px-2 py-1 text-sm"
                value={settings.workday_end}
                onChange={(e) => setSettings({ ...settings, workday_end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">每日计划时长（分钟）</label>
              <input
                type="number"
                min={5}
                max={240}
                step={5}
                className="border rounded px-2 py-1 text-sm w-24"
                value={settings.planning_default_minutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    planning_default_minutes: Math.max(5, Math.min(240, parseInt(e.target.value || '0', 10))),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">专注保护</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.focus_shield}
                  onChange={(e) => setSettings({ ...settings, focus_shield: e.target.checked })}
                />
                <span className="text-xs text-gray-500">开启后在执行页减少提示干扰</span>
              </div>
            </div>
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <button
            className="px-3 py-1 rounded-full bg-blue-600 text-white disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || !settings}
          >
            保存设置
          </button>
          <button
            className="px-3 py-1 rounded-full bg-gray-200 disabled:opacity-50"
            onClick={handleInitSettings}
            disabled={saving}
          >
            恢复默认
          </button>
        </div>
      </div>

      <div className="mt-6 border rounded-2xl bg-yellow-50/30 p-4">
        <h2 className="text-lg font-medium mb-3">本地数据</h2>
        {!storageInfo ? (
          <div className="text-sm text-gray-500">正在加载本地数据……</div>
        ) : (
          <div className="text-sm text-gray-700 space-y-2">
            <div>数据库：{storageInfo.databaseName}</div>
            <div>版本：{storageInfo.databaseVersion}</div>
            <div>时间盒：{storageInfo.boxes}</div>
            <div>待办：{storageInfo.backlog}</div>
            <div>日志：{storageInfo.logs}</div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="px-3 py-1 rounded-full bg-purple-800 text-white disabled:opacity-50"
            onClick={handleExport}
            disabled={!storageInfo}
          >
            导出 JSON
          </button>
          <button
            className="px-3 py-1 rounded-full bg-blue-600 text-white"
            onClick={() => importInputRef.current?.click()}
          >
            导入 JSON
          </button>
          <button
            className="px-3 py-1 rounded-full bg-red-600 text-white"
            onClick={handleClearData}
          >
            清空数据
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.currentTarget.value = '';
              if (!file) return;
              try {
                await handleImportFile(file);
              } catch {
                showToast('导入失败');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
