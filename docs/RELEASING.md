# Releasing / 发布说明

[中文](#中文) | [English](#english)

## 中文

本文档说明如何验证、打包并发布开源版 Timeboxing。

### 前置要求

- 推荐 Node.js 22.13 或更新版本。
- 本仓库使用 npm lockfile，请使用 `npm install` 或 `npm ci`。
- 默认 macOS DMG 构建需要在 macOS 上执行。
- 如需签名和公证 macOS 应用，需要自行配置 Apple Developer ID，本仓库默认不包含签名证书。

### 本地验证

```bash
npm install
npm run lint
npm run build-static
```

`npm run lint` 负责检查代码质量。`npm run build-static` 会生成 Next.js 静态产物。

### 构建 macOS DMG

```bash
npm run dist-mac
```

构建产物会写入 `dist/`。

当前默认脚本构建 Apple Silicon 版本。如果需要 Intel 版本，可以运行：

```bash
npm run dist-mac-x64
```

### 发布源代码到 GitHub

如果还没有创建远程仓库，先在 GitHub 上创建空仓库，然后执行：

```bash
git init
git add .
git commit -m "Initial open-source release"
git branch -M main
git remote add origin https://github.com/INF-Lucas/timeboxing.git
git push -u origin main
```

如果仓库名称不同，请先更新：

- `package.json -> repository.url`
- `package.json -> bugs.url`
- `package.json -> homepage`
- README 中的 GitHub URL

### GitHub Release 建议

Release 标题：

```text
Timeboxing 1.0.1
```

Release notes：

```text
Timeboxing 1.0.1

- Added in-app System/Chinese/English language setting
- Localized main pages, calendar actions, prompts, and Settings UI
- Updated bilingual documentation for language settings
- Unified home entry button widths for a cleaner layout
```

### 发布前检查清单

- README 中英文内容可读。
- 用户手册覆盖所有页面。
- 应用内语言设置可在跟随系统、中文和 English 之间切换。
- 本地存储说明和当前 schema 一致。
- `npm run lint` 通过。
- `npm run build-static` 通过。
- 如发布桌面安装包，确认 `npm run dist-mac` 产物可打开。
- 如果生成了 `dist/` 或 `node_modules/`，确认它们不会被提交。

## English

This document explains how to verify, package, and publish the open-source Timeboxing app.

### Prerequisites

- Node.js 22.13 or newer is recommended.
- This repository uses an npm lockfile. Use `npm install` or `npm ci`.
- The default macOS DMG build should be run on macOS.
- macOS signing and notarization require your own Apple Developer ID. This repository does not include signing certificates.

### Local Verification

```bash
npm install
npm run lint
npm run build-static
```

`npm run lint` checks code quality. `npm run build-static` creates the Next.js static output.

### Build macOS DMG

```bash
npm run dist-mac
```

The DMG is written to `dist/`.

The default script builds the Apple Silicon package. To build the Intel package, run:

```bash
npm run dist-mac-x64
```

### Publish Source To GitHub

If the remote repository does not exist yet, create an empty GitHub repository first, then run:

```bash
git init
git add .
git commit -m "Initial open-source release"
git branch -M main
git remote add origin https://github.com/INF-Lucas/timeboxing.git
git push -u origin main
```

If you use a different repository name, update these first:

- `package.json -> repository.url`
- `package.json -> bugs.url`
- `package.json -> homepage`
- GitHub URLs in README

### Suggested GitHub Release

Release title:

```text
Timeboxing 1.0.1
```

Release notes:

```text
Timeboxing 1.0.1

- Added in-app System/Chinese/English language setting
- Localized main pages, calendar actions, prompts, and Settings UI
- Updated bilingual documentation for language settings
- Unified home entry button widths for a cleaner layout
```

### Pre-release Checklist

- README is readable in both Chinese and English.
- The user guide covers every page.
- The in-app language setting switches between System, Chinese, and English.
- Local storage documentation matches the current schema.
- `npm run lint` passes.
- `npm run build-static` passes.
- If publishing a desktop installer, confirm the output from `npm run dist-mac` opens.
- If `dist/` or `node_modules/` exists, confirm they are not committed.
