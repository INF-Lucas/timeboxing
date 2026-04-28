# Contributing / 贡献指南

[中文](#中文) | [English](#english)

## 中文

感谢你考虑为 Timeboxing 做贡献。

### 开发

```bash
npm install
npm run dev
```

提交 Pull Request 前请运行：

```bash
npm run lint
npm run build-static
```

### 适合贡献的范围

- Bug 修复。
- 本地存储改进。
- 无障碍体验改进。
- 文档改进。
- 聚焦、可解释的 UI 优化。
- 测试与验证流程改进。

请尽量保持改动小而清晰，并说明影响了哪些用户行为。

### 产品边界

这个开源版保持本地优先，不默认依赖云服务。新增功能时，请优先考虑：

- 是否破坏本地数据安全。
- 是否需要新增配置。
- 是否影响用户迁移或备份。
- 是否需要更新中英文文档。

如果你想添加 AI 或云端相关能力，请将其设计为可选模块，并在 issue 中先讨论数据流、配置方式和隐私影响。

### 数据模型

应用通过 Dexie 使用 IndexedDB。涉及持久化字段变化时，请同步更新：

- `lib/db.ts`
- `lib/types.ts`
- `docs/LOCAL_STORAGE.md`
- `docs/USER_GUIDE.zh-CN.md`
- `docs/USER_GUIDE.en.md`
- `CHANGELOG.md`

如果需要迁移旧数据，请在 Pull Request 中说明迁移策略和回滚方式。

### Pull Request 内容

请包含：

- 改动内容。
- 用户可见行为变化。
- 如何测试。
- UI 改动的截图或短录屏。
- 存储字段变化和迁移说明。
- 是否需要更新发布说明。

## English

Thanks for considering a contribution to Timeboxing.

### Development

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run lint
npm run build-static
```

### Good Contribution Areas

- Bug fixes.
- Local storage improvements.
- Accessibility improvements.
- Documentation improvements.
- Focused and explainable UI refinements.
- Testing and verification improvements.

Please keep changes small and clear, and explain the user-facing behavior they affect.

### Product Boundary

The open-source version stays local-first and does not depend on cloud services by default. When adding features, consider:

- Whether local data safety is affected.
- Whether new configuration is required.
- Whether backup or migration behavior changes.
- Whether Chinese and English documentation must be updated.

If you want to add AI or cloud-related capabilities, design them as optional modules and discuss data flow, configuration, and privacy impact in an issue first.

### Data Model

The app uses IndexedDB through Dexie. When changing persisted fields, update:

- `lib/db.ts`
- `lib/types.ts`
- `docs/LOCAL_STORAGE.md`
- `docs/USER_GUIDE.zh-CN.md`
- `docs/USER_GUIDE.en.md`
- `CHANGELOG.md`

If old data needs migration, explain the migration strategy and rollback path in the pull request.

### Pull Request Contents

Please include:

- What changed.
- User-visible behavior changes.
- How it was tested.
- Screenshots or short clips for UI changes.
- Storage field changes and migration notes.
- Whether release notes need to be updated.
