# Changelog / 更新记录

[中文](#中文) | [English](#english)

## 中文

### 1.0.1 - 2026-04-28

- 添加应用内语言设置，支持跟随系统、中文和 English。
- 将主要页面、日历操作、提示文案和设置页接入中英文界面。
- 更新 README、用户手册、本地存储说明、发布说明和更新记录中的语言设置说明。
- 统一首页四个入口按钮宽度，改善中英文切换后的视觉一致性。

### 1.0.0 - 2026-04-28

- 将项目整理为独立开源版本。
- 整理默认功能范围，保留本地优先的计划、执行、复盘和设置流程。
- 为应用添加独立本地存储身份，包括 IndexedDB 数据库名和 Electron session。
- 在设置页添加 JSON 导出、导入和清空本地数据能力。
- 添加应用内语言设置，支持跟随系统、中文和 English。
- 添加 MIT License。
- 添加中英文 README、用户手册、贡献指南、本地存储文档、发布说明和 CI 工作流。
- 升级 Next.js、React、Electron、Electron Builder 和相关前端依赖。
- 将发布版本设定为 `1.0.0`，并将 Node.js 要求更新为 22.13+。
- 添加 PostCSS 依赖覆盖以消除发布前 `npm audit` 漏洞。

## English

### 1.0.1 - 2026-04-28

- Added an in-app language setting with System, Chinese, and English options.
- Localized the main pages, calendar actions, prompts, and Settings UI.
- Updated README, user guides, local storage docs, release docs, and changelog with language-setting details.
- Unified the width of the four home entry buttons for a more consistent Chinese/English layout.

### 1.0.0 - 2026-04-28

- Prepared the project as an independent open-source release.
- Clarified the default feature scope around local-first planning, focus, review, and settings workflows.
- Added independent local storage identity for the app, including IndexedDB database name and Electron session.
- Added JSON export, import, and local data clearing in Settings.
- Added an in-app language setting with System, Chinese, and English options.
- Added MIT License.
- Added bilingual Chinese/English README, user guides, contribution guide, local storage docs, release docs, and CI workflow.
- Upgraded Next.js, React, Electron, Electron Builder, and related frontend dependencies.
- Set the release version to `1.0.0` and updated the Node.js requirement to 22.13+.
- Added a PostCSS dependency override to clear the pre-release `npm audit` report.
