# AI_CONTEXT

## Purpose

This file is the short startup context for future AI work. Read this first before reading larger docs.

## Project

- System name: 账单管理分析系统
- Current app package: `expense-bill-analyzer@0.1.0`
- Current technical stack: React + TypeScript + Vite + Ant Design + Recharts + xlsx + IndexedDB
- Local test URL: `http://127.0.0.1:5173/-zk/`
- Local start entry: root `start-local-test.bat`

## Current Product Direction

The system is a local-first personal bill and finance management tool.

Current stable modules:

- Bill Manager: upload, preview, save, overwrite monthly iCost bills.
- Monthly Analysis: monthly summary, category tables, charts, detail modal.
- Budget Management: default income, monthly category budgets, shopping budget, budget settlement.
- Asset Overview: asset/liability master data, snapshot records, total assets, total liabilities, net assets.
- Goal Management: custom savings/financial goals, progress, remaining amount, required monthly saving.
- Settings: default monthly income, local backup export/import.

Planned modules:

- Cloud version: login, backend API, database, local-to-cloud migration.

## Navigation Target

Target navigation after V2.1:

1. 账单管理
2. 月度分析
3. 预算管理
4. 资产总览
5. 目标管理
6. 设置

`上传账单` and `数据预览` are workflow screens, not permanent sidebar modules.

## Architecture Direction

Keep the app local-first for now, but structure it as cloud-ready:

- Pages should call service/repository interfaces.
- IndexedDB should be hidden behind local repository implementations.
- Future cloud migration should replace repositories, not rewrite pages.
- Calculation logic stays in `utils/calculate*.ts`.
- Domain types stay in `types/*.ts`.

## Important Rules

- Do not delete files or directories without explicit user confirmation.
- Do not change `.env`, secrets, CI/CD, or deployment configuration without explicit confirmation.
- Do not implement large features before module docs and task breakdown are updated.
- Keep changes scoped to the requested module.
- After code changes, run validation and update `ROADMAP.md`.

## Main Docs

- Project overview: `docs/00_PROJECT_CONTEXT.md`
- Module docs: `docs/modules/*.md`
- Data model index: `docs/90_DATA_MODEL.md`
- Navigation: `docs/91_UI_NAVIGATION.md`
- Cloud-ready architecture: `docs/92_CLOUD_READY_ARCHITECTURE.md`
- Current tasks: `docs/99_TASK_BREAKDOWN.md`
- Historical docs: `docs/01_PRD.md` to `docs/05_TASK_BREAKDOWN.md`

## Current Recommended Version Order

1. V2.1 Architecture governance and second-version acceptance fixes.
2. V2.5 Asset Overview. Implemented locally.
3. V2.6 Goal Management. Implemented locally.
4. V3.0 Cloud version.
