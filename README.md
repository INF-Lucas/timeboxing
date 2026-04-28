# Timeboxing

一个本地优先的时间盒应用，用于把一天拆成可执行、可复盘的时间块。

本项目受 Marc Zao-Sanders 的《Timeboxing: The Power of Doing One Thing at a Time》（中文书名《时间盒》）启发。感谢作者将“把时间放进盒子里，只专注推进一件事”的方法讲清楚。本项目是独立开源实现，不是该书或作者的官方应用。

## 功能

- 计划：维护待办事项，把任务安排到当天空窗。
- 执行：启动、完成、顺延、分割、延长时间盒。
- 复盘：查看已计划、已完成、未完成和执行效率。
- 设置：配置工作日时间、每日计划时长、专注保护。
- 本地数据：基于 IndexedDB 存储，支持 JSON 导出、导入和清空。
- 桌面版：通过 Electron 打包为 macOS 应用。

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Dexie / IndexedDB
- Tailwind CSS
- Electron / electron-builder

## 快速开始

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

## 本地存储

应用默认使用 IndexedDB，不需要用户配置数据库、账号或服务器。

- 数据库名称：`timeboxing_open_source_db`
- 存储内容：时间盒、待办、日志、设置
- 备份入口：`Settings 设置 -> 本地数据 -> 导出 JSON`
- 恢复入口：`Settings 设置 -> 本地数据 -> 导入 JSON`

更多细节见 [docs/LOCAL_STORAGE.md](docs/LOCAL_STORAGE.md)。

## 项目结构

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

## 与个人版本的区别

这个仓库是独立的开源版本，和作者本机使用的 macOS 版本分开维护。

- 删除了个人定制的固定时间盒功能。
- 使用独立的 Electron session、appId 和 IndexedDB 数据库名。
- 移除了应用界面中的个人署名文案。
- 增加了本地数据备份/恢复模块和开源文档。

## 发布到 GitHub

建议流程：

```bash
git init
git add .
git commit -m "Initial open-source release"
git branch -M main
git remote add origin https://github.com/INF-Lucas/timeboxing-open-source.git
git push -u origin main
```

如果仓库名称不同，请同步修改 `package.json` 里的 `repository`、`bugs` 和 `homepage`。

## 致谢

感谢 Marc Zao-Sanders 的《Timeboxing / 时间盒》提供的方法论启发。这个项目尝试把书中的核心思路落到一个本地优先、可修改、可自托管的个人效率工具中。

## 许可证

本项目使用 MIT License，详见 [LICENSE](LICENSE)。
