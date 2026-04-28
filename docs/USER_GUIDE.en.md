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
- Language: choose `System`, `中文`, or `English` from Settings. The UI updates immediately.

## Recommended Workflow

1. Open `Settings` and confirm language, workday start, and workday end.
2. Open `Plan`, add backlog items, and set estimated minutes.
3. Select backlog items, set urgency, then click `Today`.
4. Review the calendar and drag or resize timeboxes as needed.
5. Open `Focus` and start the current timebox.
6. At the end of the day, open `Review` and handle missed items.
7. Export a JSON backup from `Settings -> Local Data` regularly.

## Global Layout

### Top Date Bar

- The `Date` input changes the currently selected date.
- Supported range: `2000-01-01` to `2099-12-31`.
- `Today` jumps back to today.
- The selected date affects `Plan`, `Focus`, `Review`, and `Settings`.

### Sidebar

- `Plan`: create backlog items, schedule timeboxes, and adjust the calendar.
- `Focus`: start and progress the current timebox.
- `Review`: review completed, missed, planned, and active work.
- `Settings`: configure work hours, focus shield, language, and local data.

## Home

Route: `/`

The home page provides four quick links:

- `Plan`: open `Plan`.
- `Focus`: open `Focus`.
- `Review`: open `Review`.
- `Settings`: open `Settings`.

The home page does not store data. It is a navigation entry.

## Plan

Route: `/plan`

The Plan page is the main workspace. It has three areas: backlog on the left, calendar in the center, and the property panel on the right.

### Create The Daily Planning Box

If the selected date does not have a planning box, the page shows a prompt:

- `Create`: create a `Daily Planning` box at the workday start time.
- `Skip`: hide the prompt without creating a planning box.

The planning box duration comes from `Settings -> Plan Minutes`.

### Backlog

The left panel manages tasks that have not been scheduled.

Available actions:

- Enter a title and estimated minutes, then click `Add`.
- Estimated minutes must be between `5` and `480`.
- Select multiple items and click `Imp`, `Urg`, or `Norm` to batch set urgency.
- Select multiple items and click `Today` to schedule them into available slots.
- Select multiple items and click `Del Batch` to delete them.
- Click a backlog row to show `Edit` and `Del`.
- Edit mode lets you update the title and estimated minutes.

Backlog items are sorted by the current interface language and numeric order. When scheduling selected items, more urgent items are arranged earlier.

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

- `Next Slot`: move to the next available slot.
- `Save`: save the overlapping time.
- `Cancel`: discard the adjustment.

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
- Urgency: `Imp`, `Urg`, `Norm`.

After editing title, tags, or notes, click `Save`. The button is disabled when nothing changed.

Status actions:

- `Start`: change a planned box to active.
- `Done`: change a box to done.
- `Del`: delete the timebox.
- `Later`: move it to the next free slot.
- `Split`: split an active timebox into a completed part and a remaining planned part.

## Focus

Route: `/focus`

The Focus page helps you execute the plan.

Depending on the selected date and current time, the page shows:

- An active timebox, including title, time range, and remaining minutes.
- The planned timebox that should be active now.
- The next planned timebox if nothing is due now.

### When No Timebox Is Active

Available actions:

- `Start`: start the due or next planned timebox.
- `Later`: move that timebox to the next free slot.

### When A Timebox Is Active

Available actions:

- `Done`: mark it done.
- `Split`: mark the elapsed part done and schedule the remaining duration into the next free slot.

### Focus Shortcuts

- `Space` or `Enter`: finish the active box; otherwise start the due box; otherwise start the next planned box.
- `X`: split the active box.
- `S`: snooze the due or next planned box.
- `5`: extend the active box by 5 minutes.
- `0`: extend the active box by 10 minutes.

If extending creates an overlap, the page shows conflict options:

- `Keep +Xm`
- `Next Slot`
- `Cancel`

### Focus Shield

When `Settings -> Focus Shield` is enabled and a timebox is active:

- A focus shield notice appears.
- Some notifications and shortcuts are suppressed.
- Finishing the active timebox remains available.

## Review

Route: `/review`

The Review page summarizes the selected day. When the page opens or `Refresh` is clicked, planned timeboxes that have passed their end time are marked as missed.

### Metrics

The top section shows four metrics:

- `Planned`: count and minutes still planned.
- `Done`: count and minutes completed.
- `Efficiency`: completed minutes divided by all scheduled minutes.
- `Active`: whether an active timebox exists.

### Completed Today

Shows all completed timeboxes, including title, time range, and minutes.

### Missed Today

Shows timeboxes that passed their end time without being completed.

Available actions:

- `Snooze All`: snooze all missed items into later free slots.
- Single-item `Later`: snooze one missed timebox.
- Single-item `Del`: delete one missed timebox after confirmation.

### Planned Today

Shows timeboxes that are still planned.

## Settings

Route: `/settings`

The Settings page contains work parameters and local data management.

### Workday And Planning Parameters

Configurable fields:

- `Workday Start`: start point for automatic scheduling.
- `Workday End`: end point for automatic scheduling.
- `Plan Minutes`: default duration for the planning box, from `5` to `240` minutes.
- `Focus Shield`: reduce interruptions on the Focus page while a timebox is active.
- `Language`: choose `System`, `中文`, or `English`. Switching updates the UI immediately and saves the preference locally.

Buttons:

- `Save`: save current settings.
- `Reset`: restore default settings.

### Local Data

This section shows:

- Database name.
- Database version.
- Number of timeboxes.
- Number of backlog items.
- Number of logs.

Available actions:

- `Export JSON`: download a full local data backup.
- `Import JSON`: choose a backup file and restore it.
- `Clear Data`: clear timeboxes, backlog items, logs, and settings, then restore defaults.

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
