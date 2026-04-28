# Timeboxing / 时间盒

[中文](#中文) | [English](#english)

## 中文

Timeboxing 是一个本地优先的时间盒应用，用于把一天拆成可执行、可复盘的时间块。

本项目受 Marc Zao-Sanders 的 *Timeboxing: The Power of Doing One Thing at a Time*（中文书名《时间盒》）启发。感谢作者将“把时间放进盒子里，只专注推进一件事”的方法讲清楚。本项目是独立开源实现，不是该书或作者的官方应用。

### 功能

- 计划：维护待办事项，把任务安排到当天空窗。
- 执行：启动、完成、顺延、分割、延长时间盒。
- 复盘：查看已计划、已完成、未完成和执行效率。
- 设置：配置工作日时间、每日计划时长、专注保护和界面语言。
- 本地数据：基于 IndexedDB 存储，支持 JSON 导出、导入和清空。
- 桌面版：通过 Electron 打包为 macOS 应用。

### 文档

- [文档索引 / Docs Index](docs/README.md)
- [中文用户手册](docs/USER_GUIDE.zh-CN.md)
- [English User Guide](docs/USER_GUIDE.en.md)
- [本地存储 / Local Storage](docs/LOCAL_STORAGE.md)
- [发布说明 / Releasing](docs/RELEASING.md)
- [贡献指南 / Contributing](CONTRIBUTING.md)
- [更新记录 / Changelog](CHANGELOG.md)

### 快速开始

推荐使用 Node.js 22.13 或更新版本。

```bash
npm install
npm run dev
```

浏览器访问：

```text
http://localhost:3000
```

启动 Electron 开发版：

```bash
npm run electron-dev
```

构建静态前端：

```bash
npm run build-static
```

构建 macOS 安装包：

```bash
npm run dist-mac
```

构建产物会输出到 `dist/`，该目录不会提交到 Git。

### 本地存储

应用默认使用 IndexedDB，不需要用户配置数据库、账号或服务器。

- 数据库名称：`timeboxing_oss_db`
- 存储内容：时间盒、待办、日志、设置
- 备份入口：`Settings 设置 -> 本地数据 -> 导出 JSON`
- 恢复入口：`Settings 设置 -> 本地数据 -> 导入 JSON`
- 语言入口：`Settings 设置 -> 语言`，支持跟随系统、中文和 English。

更多细节见 [docs/LOCAL_STORAGE.md](docs/LOCAL_STORAGE.md)。

### 项目结构

```text
app/                 Next.js App Router 页面与组件
app/components/      布局、日期上下文、日历组件
lib/actions/         本地数据操作
lib/db.ts            Dexie 数据库定义
lib/types.ts         核心类型定义
electron/            Electron 主进程
public/              应用图标与静态资源
docs/                开源项目文档
```

### 技术栈

- Next.js 16
- React 19
- TypeScript
- Dexie / IndexedDB
- Tailwind CSS
- Electron / electron-builder

### 发布到 GitHub

建议流程：

```bash
git init
git add .
git commit -m "Initial open-source release"
git branch -M main
git remote add origin https://github.com/INF-Lucas/timeboxing.git
git push -u origin main
```

如果仓库名称不同，请同步修改 `package.json` 里的 `repository`、`bugs` 和 `homepage`。

### 致谢

感谢 Marc Zao-Sanders 的 *Timeboxing / 时间盒* 提供的方法论启发。这个项目尝试把书中的核心思路落到一个本地优先、可修改、可自托管的个人效率工具中。

### 许可证

本项目使用 MIT License，详见 [LICENSE](LICENSE)。

## English

Timeboxing is a local-first app for planning a day into clear, executable, reviewable time blocks.

This project is inspired by Marc Zao-Sanders' *Timeboxing: The Power of Doing One Thing at a Time* (published in Chinese as *时间盒*). Thanks to the author for making the timeboxing method practical and easy to understand. This repository is an independent open-source implementation and is not an official app from the book or the author.

### Features

- Plan: manage backlog items and schedule them into available slots.
- Focus: start, finish, snooze, split, and extend timeboxes.
- Review: inspect planned, completed, missed, and active work.
- Settings: configure workday hours, planning duration, focus shield, and interface language.
- Local data: IndexedDB storage with JSON export, import, and reset.
- Desktop: Electron packaging for macOS.

### Documentation

- [Docs Index / 文档索引](docs/README.md)
- [中文用户手册](docs/USER_GUIDE.zh-CN.md)
- [English User Guide](docs/USER_GUIDE.en.md)
- [Local Storage / 本地存储](docs/LOCAL_STORAGE.md)
- [Releasing / 发布说明](docs/RELEASING.md)
- [Contributing / 贡献指南](CONTRIBUTING.md)
- [Changelog / 更新记录](CHANGELOG.md)

### Quick Start

Node.js 22.13 or newer is recommended.

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Run the Electron development app:

```bash
npm run electron-dev
```

Build the static frontend:

```bash
npm run build-static
```

Build the macOS installer:

```bash
npm run dist-mac
```

Build artifacts are written to `dist/`, which is ignored by Git.

### Local Storage

The app uses IndexedDB by default. Users do not need to configure a database, account, or server.

- Database name: `timeboxing_oss_db`
- Stored data: timeboxes, backlog items, logs, and settings
- Backup: `Settings -> Local Data -> Export JSON`
- Restore: `Settings -> Local Data -> Import JSON`
- Language: `Settings -> Language`, with System, 中文, and English options.

See [docs/LOCAL_STORAGE.md](docs/LOCAL_STORAGE.md) for details.

### Project Structure

```text
app/                 Next.js App Router pages and components
app/components/      layout, date context, calendar component
lib/actions/         local data actions
lib/db.ts            Dexie database definition
lib/types.ts         core type definitions
electron/            Electron main process
public/              app icons and static assets
docs/                open-source project documentation
```

### Stack

- Next.js 16
- React 19
- TypeScript
- Dexie / IndexedDB
- Tailwind CSS
- Electron / electron-builder

### Publish To GitHub

Suggested flow:

```bash
git init
git add .
git commit -m "Initial open-source release"
git branch -M main
git remote add origin https://github.com/INF-Lucas/timeboxing.git
git push -u origin main
```

If you use a different repository name, update `repository`, `bugs`, and `homepage` in `package.json`.

### Acknowledgements

Thanks to Marc Zao-Sanders' *Timeboxing / 时间盒* for the product idea and methodology. This project turns the book's core ideas into a local-first, modifiable, self-hostable productivity tool.

### License

This project is released under the MIT License. See [LICENSE](LICENSE).
