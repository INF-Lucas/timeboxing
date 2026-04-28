# Local Storage

Timeboxing is local-first. It does not require a backend service.

## Storage Engine

The app uses Dexie on top of IndexedDB.

```text
Database name: timeboxing_open_source_db
Database version: 1
```

The Electron app also uses an isolated session partition:

```text
persist:timeboxing-open-source
```

This keeps the open-source version separate from other local builds.

## Tables

```text
boxes      scheduled timeboxes
backlog    unscheduled tasks
logs       action history for boxes
settings   singleton app settings
```

## Backup

Open `Settings 设置 -> 本地数据` and choose `导出 JSON`.

The exported file contains:

- boxes
- backlog items
- logs
- settings
- export timestamp
- schema version

## Restore

Open `Settings 设置 -> 本地数据` and choose `导入 JSON`.

Import currently replaces existing local data. Export first if you want a rollback point.

## Reset

Open `Settings 设置 -> 本地数据` and choose `清空数据`.

This clears all local tables and re-creates default settings.

## Privacy

Data stays on the user's device. The app does not upload data by default.
