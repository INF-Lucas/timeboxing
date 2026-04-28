import Dexie, { Table } from 'dexie';
import type { Box, BacklogItem, LogEntry, Settings } from './types';

export const LOCAL_DATABASE_NAME = 'timeboxing_oss_db';
export const LOCAL_DATABASE_VERSION = 1;

class TimeboxingDB extends Dexie {
  boxes!: Table<Box, string>;
  backlog!: Table<BacklogItem, string>;
  logs!: Table<LogEntry, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super(LOCAL_DATABASE_NAME);
    this.version(LOCAL_DATABASE_VERSION).stores({
      boxes:
        'id, start, end, status, is_plan_session, created_at, updated_at, tags*',
      backlog: 'id, title, estimate_min, tags*',
      logs: 'id, box_id, event, created_at',
      settings: 'id',
    });
  }
}

// Dexie is only available at runtime in the browser/Electron renderer.
export const db = typeof window !== 'undefined' ? new TimeboxingDB() : null as unknown as TimeboxingDB;
