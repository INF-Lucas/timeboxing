'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSettings, updateSettings } from '@/lib/actions/settings';
import type { LanguagePreference } from '@/lib/types';
import { dictionaries, type TranslationKey } from '@/lib/i18n/dictionaries';

type AppLanguage = Exclude<LanguagePreference, 'system'>;

type I18nContextValue = {
  language: AppLanguage;
  languagePreference: LanguagePreference;
  setLanguagePreference: (next: LanguagePreference) => Promise<void>;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);
const LANGUAGE_CACHE_KEY = 'timeboxing_language_preference';

function detectSystemLanguage(): AppLanguage {
  if (typeof navigator === 'undefined') return 'zh-CN';
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''));
}

function isLanguagePreference(value: string | null): value is LanguagePreference {
  return value === 'system' || value === 'zh-CN' || value === 'en-US';
}

function readCachedPreference(): LanguagePreference {
  if (typeof localStorage === 'undefined') return 'system';
  const cached = localStorage.getItem(LANGUAGE_CACHE_KEY);
  return isLanguagePreference(cached) ? cached : 'system';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [languagePreference, setPreference] = useState<LanguagePreference>(() => readCachedPreference());
  const [systemLanguage, setSystemLanguage] = useState<AppLanguage>(() => detectSystemLanguage());

  useEffect(() => {
    setSystemLanguage(detectSystemLanguage());
  }, []);

  useEffect(() => {
    let alive = true;
    getSettings().then((settings) => {
      if (!alive) return;
      const next = settings.language ?? 'system';
      setPreference(next);
      localStorage.setItem(LANGUAGE_CACHE_KEY, next);
    });
    return () => {
      alive = false;
    };
  }, []);

  const language = languagePreference === 'system' ? systemLanguage : languagePreference;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguagePreference = useCallback(async (next: LanguagePreference) => {
    setPreference(next);
    localStorage.setItem(LANGUAGE_CACHE_KEY, next);
    await updateSettings({ language: next });
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      return interpolate(dictionaries[language][key] ?? dictionaries['zh-CN'][key], vars);
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, languagePreference, setLanguagePreference, t }),
    [language, languagePreference, setLanguagePreference, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
