# Timeboxing User Guide

This guide explains every page in the open-source Timeboxing app, what each page does, and how to use the main workflows.

## Core Concepts

- Timebox: a task block with a start time, end time, and title.
- Backlog item: an unscheduled task shown on the left side of the Plan page.
- Planning box: a daily timebox for planning the day.
- Free slot: a time range inside the workday that does not overlap existing timeboxes.
- Status: `planned`, `active`, `done`, or `missed`.
- Urgency: set through tags. The UI supports `urgent`, `important`, and `normal`, shown through card colors.
- Local data: all data is stored in IndexedDB on the current device by default.

## Recommended Workflow

1. Open `Settings 设置` and confirm your workday start and end time.
2. Open `Plan 计划`, add backlog items, and set estimated minutes.
3. Select backlog items, set urgency, then click `安排到今天`.
4. Review the calendar and drag or resize timeboxes as needed.
5. Open `Focus 执行` and start the current timebox.
6. At the end of the day, open `Review 复盘` and handle missed items.
7. Export a JSON backup from `Settings 设置 -> 本地数据` regularly.

## Global Layout

### Top Date Bar

- The `日期` input changes the currently selected date.
- Supported range: `2000-01-01` to `2099-12-31`.
- `今天` jumps back to today.
- The selected date affects `Plan 计划`, `Focus 执行`, `Review 复盘`, and `Settings 设置`.

### Sidebar

- `Plan 计划`: create backlog items, schedule timeboxes, and adjust the calendar.
- `Focus 执行`: start and progress the current timebox.
- `Review 复盘`: review completed, missed, planned, and active work.
- `Settings 设置`: configure work hours, focus shield, and local data.

## Home

Route: `/`

The home page provides four quick links:

- `开始计划`: open `Plan 计划`.
- `专注模式`: open `Focus 执行`.
- `回顾总结`: open `Review 复盘`.
- `设置`: open `Settings 设置`.

The home page does not store data. It is a navigation entry.

## Plan

Route: `/plan`

The Plan page is the main workspace. It has three areas: backlog on the left, calendar in the center, and the property panel on the right.

### Create The Daily Planning Box

If the selected date does not have a planning box, the page shows a prompt:

- `创建计划盒`: create a "制定今日计划" box at the workday start time.
- `今日忽略`: hide the prompt without creating a planning box.

The planning box duration comes from `Settings 设置 -> 每日计划时长（分钟）`.

### Backlog

The left panel manages tasks that have not been scheduled.

Available actions:

- Enter a title and estimated minutes, then click `添加`.
- Estimated minutes must be between `5` and `480`.
- Select multiple items and click `重要`, `紧急`, or `一般` to batch set urgency.
- Select multiple items and click `安排到今天` to schedule them into available slots.
- Select multiple items and click `批量删除` to delete them.
- Click a backlog row to show `编辑` and `删除`.
- Edit mode lets you update the title and estimated minutes.

Backlog items are displayed by Chinese pinyin and numeric order. When scheduling selected items, more urgent items are arranged earlier.

### Backlog Shortcuts

When a backlog row is expanded:

- `E`: edit.
- `Delete` or `Backspace`: delete.
- `Esc`: collapse the row.

When editing a backlog item:

- `Enter`: save.
- `Esc`: cancel.

### Calendar

The center calendar shows timeboxes for the selected date in two columns:

- Left: `05:00-13:00`
- Right: `13:00-24:00`

Card colors:

- Red: urgent or missed.
- Yellow: important or default planned work.
- Green: normal or completed.
- Blue: planning box.

Available actions:

- Click a timebox to select it and show details in the property panel.
- Press and hold the left side of a timebox for about 300ms, then drag to move it.
- Drag the bottom edge to resize the timebox.
- Click empty space to clear selection.
- If moving or resizing creates an overlap, a conflict prompt appears.

Conflict options:

- `移到下一空窗`: move to the next available slot.
- `仍然保存`: save the overlapping time.
- `取消`: discard the adjustment.

### Calendar Card Actions

After selecting a timebox, a small action menu appears near the card. Available actions depend on status:

- Planned: start, snooze, delete.
- Active: finish, split, delete.
- Missed: snooze, delete.
- Done: delete.

### Calendar Shortcuts

After selecting a timebox:

- `Space` or `Enter`: start a planned box or finish an active box.
- `X`: split an active box.
- `S`: snooze a planned box.
- `Esc`: clear selection.

### Property Panel

The right panel edits the selected timebox.

It shows:

- Duration.
- Status.

Editable fields:

- Title.
- Tags, separated by spaces.
- Notes.
- Urgency: `重要`, `紧急`, `一般`.

After editing title, tags, or notes, click `保存属性`. The button is disabled when nothing changed.

Status actions:

- `开始`: change a planned box to active.
- `完成`: change a box to done.
- `删除`: delete the timebox.
- `顺延`: move it to the next free slot.
- `分割`: split an active timebox into a completed part and a remaining planned part.

## Focus

Route: `/focus`

The Focus page helps you execute the plan.

Depending on the selected date and current time, the page shows:

- An active timebox, including title, time range, and remaining minutes.
- The planned timebox that should be active now.
- The next planned timebox if nothing is due now.

### When No Timebox Is Active

Available actions:

- `开始`: start the due or next planned timebox.
- `顺延`: move that timebox to the next free slot.

### When A Timebox Is Active

Available actions:

- `完成`: mark it done.
- `分割`: mark the elapsed part done and schedule the remaining duration into the next free slot.

### Focus Shortcuts

- `Space` or `Enter`: finish the active box; otherwise start the due box; otherwise start the next planned box.
- `X`: split the active box.
- `S`: snooze the due or next planned box.
- `5`: extend the active box by 5 minutes.
- `0`: extend the active box by 10 minutes.

If extending creates an overlap, the page shows conflict options:

- `仍然延长`
- `移到下一空窗`
- `取消`

### Focus Shield

When `Settings 设置 -> 专注保护` is enabled and a timebox is active:

- A focus shield notice appears.
- Some notifications and shortcuts are suppressed.
- Finishing the active timebox remains available.

## Review

Route: `/review`

The Review page summarizes the selected day. When the page opens or `刷新` is clicked, planned timeboxes that have passed their end time are marked as `未完成`.

### Metrics

The top section shows four metrics:

- `已计划盒子`: count and minutes still planned.
- `已完成盒子`: count and minutes completed.
- `效率（完成/计划）`: completed minutes divided by all scheduled minutes.
- `进行中`: whether an active timebox exists.

### Completed Today

Shows all completed timeboxes, including title, time range, and minutes.

### Missed Today

Shows timeboxes that passed their end time without being completed.

Available actions:

- `一键顺延全部`: snooze all missed items into later free slots.
- Single-item `顺延`: snooze one missed timebox.
- Single-item `删除`: delete one missed timebox after confirmation.

### Planned Today

Shows timeboxes that are still planned.

## Settings

Route: `/settings`

The Settings page contains work parameters and local data management.

### Workday And Planning Parameters

Configurable fields:

- `工作日开始`: start point for automatic scheduling.
- `工作日结束`: end point for automatic scheduling.
- `每日计划时长（分钟）`: default duration for the planning box, from `5` to `240` minutes.
- `专注保护`: reduce interruptions on the Focus page while a timebox is active.

Buttons:

- `保存设置`: save current settings.
- `恢复默认`: restore default settings.

### Local Data

This section shows:

- Database name.
- Database version.
- Number of timeboxes.
- Number of backlog items.
- Number of logs.

Available actions:

- `导出 JSON`: download a full local data backup.
- `导入 JSON`: choose a backup file and restore it.
- `清空数据`: clear timeboxes, backlog items, logs, and settings, then restore defaults.

Import replaces current local data. Export a backup first if you need a rollback point.

## Backup Suggestions

- Export JSON before making large schedule changes.
- Use export/import when moving between browsers or Electron builds.
- The backup file includes timeboxes, backlog items, logs, and settings. It does not include any server account information.

## FAQ

### Do I need an account?

No. The open-source version runs locally by default.

### Is data uploaded to a server?

No. Data is stored in IndexedDB on the current device by default.

### Why can snoozed items move to a future day?

If today has no large enough free slot, snooze searches for available slots up to 7 days ahead.

### Why did a planned item become missed?

The Review page marks planned timeboxes as missed after their end time passes. Newly created boxes have a short grace period and are not marked immediately.

### Does the open-source version include the AI exploration box?

No. The open-source version removes that personal custom feature.
