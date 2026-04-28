'use client';

import { db, LOCAL_DATABASE_NAME, LOCAL_DATABASE_VERSION } from '@/lib/db';
import type { BacklogItem, Box, LogEntry, Settings } from '@/lib/types';

export type LocalStorageInfo = {
  databaseName: string;
  databaseVersion: number;
  boxes: number;
  backlog: number;
  logs: number;
  hasSettings: boolean;
};

export type LocalDataExport = {
  app: 'timeboxing';
  schema_version: number;
  exported_at: string;
  data: {
    boxes: Box[];
    backlog: BacklogItem[];
    logs: LogEntry[];
    settings?: Settings;
  };
};

function parseDate(value: unknown): Date {
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function reviveBox(input: Box): Box {
  return {
    ...input,
    start: parseDate(input.start),
    end: parseDate(input.end),
    created_at: parseDate(input.created_at),
    updated_at: parseDate(input.updated_at),
  };
}

function reviveLog(input: LogEntry): LogEntry {
  return {
    ...input,
    created_at: parseDate(input.created_at),
  };
}

export async function getLocalStorageInfo(): Promise<LocalStorageInfo> {
  const [boxes, backlog, logs, settings] = await Promise.all([
    db.boxes.count(),
    db.backlog.count(),
    db.logs.count(),
    db.settings.get('singleton'),
  ]);

  return {
    databaseName: LOCAL_DATABASE_NAME,
    databaseVersion: LOCAL_DATABASE_VERSION,
    boxes,
    backlog,
    logs,
    hasSettings: Boolean(settings),
  };
}

export async function exportLocalData(): Promise<LocalDataExport> {
  const [boxes, backlog, logs, settings] = await Promise.all([
    db.boxes.toArray(),
    db.backlog.toArray(),
    db.logs.toArray(),
    db.settings.get('singleton'),
  ]);

  return {
    app: 'timeboxing',
    schema_version: LOCAL_DATABASE_VERSION,
    exported_at: new Date().toISOString(),
    data: {
      boxes,
      backlog,
      logs,
      settings,
    },
  };
}

export async function importLocalData(payload: LocalDataExport, replace = true): Promise<void> {
  if (payload.app !== 'timeboxing' || !payload.data) {
    throw new Error('导入文件不是有效的 Timeboxing 数据');
  }

  const boxes = Array.isArray(payload.data.boxes) ? payload.data.boxes.map(reviveBox) : [];
  const backlog = Array.isArray(payload.data.backlog) ? payload.data.backlog : [];
  const logs = Array.isArray(payload.data.logs) ? payload.data.logs.map(reviveLog) : [];
  const settings = payload.data.settings;

  await db.transaction('rw', [db.boxes, db.backlog, db.logs, db.settings], async () => {
    if (replace) {
      await Promise.all([
        db.boxes.clear(),
        db.backlog.clear(),
        db.logs.clear(),
        db.settings.clear(),
      ]);
    }

    if (boxes.length > 0) await db.boxes.bulkPut(boxes);
    if (backlog.length > 0) await db.backlog.bulkPut(backlog);
    if (logs.length > 0) await db.logs.bulkPut(logs);
    if (settings) await db.settings.put(settings);
  });
}

export async function clearLocalData(): Promise<void> {
  await db.transaction('rw', [db.boxes, db.backlog, db.logs, db.settings], async () => {
    await Promise.all([
      db.boxes.clear(),
      db.backlog.clear(),
      db.logs.clear(),
      db.settings.clear(),
    ]);
  });
}
