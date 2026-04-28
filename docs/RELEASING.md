# Releasing

## Prerequisites

- Node.js 20 or newer is recommended.
- npm is used for the lockfile in this repository.
- macOS is required for the default macOS DMG build.

## Verify

```bash
npm install
npm run lint
npm run build-static
```

## Build macOS DMG

```bash
npm run dist-mac
```

The DMG is written to `dist/`.

## Publish Source to GitHub

```bash
git init
git add .
git commit -m "Initial open-source release"
git branch -M main
git remote add origin https://github.com/INF-Lucas/timeboxing-open-source.git
git push -u origin main
```

If you use another repository name, update these fields first:

- `package.json -> repository.url`
- `package.json -> bugs.url`
- `package.json -> homepage`

## Suggested GitHub Release Notes

```text
Initial open-source release of Timeboxing.

- Local-first timeboxing workflow
- Plan, focus, review, and settings views
- IndexedDB storage with JSON export/import
- Electron macOS packaging
- MIT License
```
