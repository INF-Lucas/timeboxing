'use client';

import AppLayout from '../components/AppLayout';
import { useDate } from '../components/DateProvider';
import { useI18n } from '../components/I18nProvider';
import { useEffect, useRef, useState } from 'react';
import type { LanguagePreference, Settings } from '@/lib/types';
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
  const { t, languagePreference, setLanguagePreference } = useI18n();

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
    return s;
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
    await setLanguagePreference(s.language ?? 'system');
    await refreshStorageInfo();
    showToast(t('settings.toast.initialized'));
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
        language: settings.language ?? languagePreference,
      });
      setSettings(next);
      await refreshStorageInfo();
      showToast(t('settings.toast.saved'));
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
    showToast(t('settings.toast.exported'));
  }

  async function handleImportFile(file: File) {
    const text = await file.text();
    const payload = JSON.parse(text);
    await importLocalData(payload, true);
    const next = await refreshSettings();
    await setLanguagePreference(next.language ?? 'system');
    await refreshStorageInfo();
    showToast(t('settings.toast.imported'));
  }

  async function handleClearData() {
    const ok = window.confirm(t('settings.confirm.clear'));
    if (!ok) return;
    await clearLocalData();
    const defaults = await initDefaultSettings();
    setSettings(defaults);
    await setLanguagePreference(defaults.language ?? 'system');
    await refreshStorageInfo();
    showToast(t('settings.toast.cleared'));
  }

  async function handleLanguageChange(next: LanguagePreference) {
    setSettings((prev) => (prev ? { ...prev, language: next } : prev));
    await setLanguagePreference(next);
    await refreshStorageInfo();
  }

  return (
    <div>
      {toast ? (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-purple-800 text-white text-xs rounded-full px-3 py-2 shadow">
          {toast}
        </div>
      ) : null}
      <h1 className="text-2xl font-semibold mb-2">{t('settings.title')}</h1>
      <p className="text-sm text-gray-600">
        {t('common.currentDate', { date: formatForInput(selectedDate) })}
      </p>

      <div className="mt-4 border rounded-2xl bg-yellow-50/30 p-4">
        <h2 className="text-lg font-medium mb-3">{t('settings.workday')}</h2>
        {!settings ? (
          <div className="text-sm text-gray-500">{t('common.loadingSettings')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">{t('settings.workdayStart')}</label>
              <input
                type="time"
                className="border rounded px-2 py-1 text-sm"
                value={settings.workday_start}
                onChange={(e) => setSettings({ ...settings, workday_start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">{t('settings.workdayEnd')}</label>
              <input
                type="time"
                className="border rounded px-2 py-1 text-sm"
                value={settings.workday_end}
                onChange={(e) => setSettings({ ...settings, workday_end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">{t('settings.planningMinutes')}</label>
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
              <label className="text-sm text-gray-600">{t('settings.focusShield')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.focus_shield}
                  onChange={(e) => setSettings({ ...settings, focus_shield: e.target.checked })}
                />
                <span className="text-xs text-gray-500">{t('settings.focusShieldHelp')}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">{t('settings.language')}</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={settings.language ?? languagePreference}
                onChange={(e) => handleLanguageChange(e.target.value as LanguagePreference)}
              >
                <option value="system">{t('settings.language.system')}</option>
                <option value="zh-CN">{t('settings.language.zhCN')}</option>
                <option value="en-US">{t('settings.language.enUS')}</option>
              </select>
            </div>
          </div>
        )}
        <div className="mt-3 flex gap-2">
          <button
            className="px-3 py-1 rounded-full bg-blue-600 text-white disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || !settings}
          >
            {t('settings.save')}
          </button>
          <button
            className="px-3 py-1 rounded-full bg-gray-200 disabled:opacity-50"
            onClick={handleInitSettings}
            disabled={saving}
          >
            {t('common.reset')}
          </button>
        </div>
      </div>

      <div className="mt-6 border rounded-2xl bg-yellow-50/30 p-4">
        <h2 className="text-lg font-medium mb-3">{t('settings.localData')}</h2>
        {!storageInfo ? (
          <div className="text-sm text-gray-500">{t('common.loadingData')}</div>
        ) : (
          <div className="text-sm text-gray-700 space-y-2">
            <div>{t('settings.database', { value: storageInfo.databaseName })}</div>
            <div>{t('settings.version', { value: storageInfo.databaseVersion })}</div>
            <div>{t('settings.boxes', { value: storageInfo.boxes })}</div>
            <div>{t('settings.backlog', { value: storageInfo.backlog })}</div>
            <div>{t('settings.logs', { value: storageInfo.logs })}</div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="px-3 py-1 rounded-full bg-purple-800 text-white disabled:opacity-50"
            onClick={handleExport}
            disabled={!storageInfo}
          >
            {t('settings.exportJson')}
          </button>
          <button
            className="px-3 py-1 rounded-full bg-blue-600 text-white"
            onClick={() => importInputRef.current?.click()}
          >
            {t('settings.importJson')}
          </button>
          <button
            className="px-3 py-1 rounded-full bg-red-600 text-white"
            onClick={handleClearData}
          >
            {t('settings.clearData')}
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
                showToast(t('common.importFailed'));
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
