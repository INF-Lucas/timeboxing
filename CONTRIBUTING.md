# Contributing

Thanks for considering a contribution.

## Development

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run lint
npm run build-static
```

## Scope

Good contributions include:

- bug fixes
- local storage improvements
- accessibility improvements
- documentation improvements
- focused UI refinements

Please keep changes small and explain the user-facing behavior they affect.

## Data Model

The app is local-first. Data lives in IndexedDB through Dexie. Schema changes should be reflected in:

- `lib/db.ts`
- `lib/types.ts`
- `docs/LOCAL_STORAGE.md`

When changing persisted fields, add migration notes to `CHANGELOG.md`.

## Pull Requests

Please include:

- what changed
- how it was tested
- screenshots or short clips for UI changes
- migration notes for storage changes
