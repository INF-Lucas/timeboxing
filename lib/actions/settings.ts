'use client';

import { db } from '@/lib/db';
import type { Settings } from '@/lib/types';

const DEFAULT_SETTINGS: Settings = {
  id: 'singleton',
  planning_default_minutes: 15,
  meeting_prep_min: 15,
  focus_shield: true,
  workday_start: '09:00',
  workday_end: '18:00',
  colors_by_tag: {},
  calendar_integration_enabled: false,
  language: 'system',
};

function withDefaults(settings: Settings): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    id: 'singleton',
  };
}

export async function initDefaultSettings(): Promise<Settings> {
  const defaults = { ...DEFAULT_SETTINGS };
  await db.settings.put(defaults);
  return defaults;
}

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.get('singleton');
  if (existing) {
    const next = withDefaults(existing);
    if (existing.language === undefined) {
      await db.settings.put(next);
    }
    return next;
  }
  return await initDefaultSettings();
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await db.settings.put(next);
  return next;
}
