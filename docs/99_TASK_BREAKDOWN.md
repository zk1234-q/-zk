# Task Breakdown

## 当前版本节奏

```text
V2.1 架构治理 + 第二版验收修复（已完成）
V2.5 资产总览（已完成）
V2.6 目标管理（已完成）
V3.0 云端版
```

## V2.1 任务

### V2.1-T001：模块化文档治理

- 目标：新增 AI 短上下文和模块化文档。
- 影响文件：`AI_CONTEXT.md`、`docs/00_PROJECT_CONTEXT.md`、`docs/modules/*`、`docs/90_DATA_MODEL.md`、`docs/91_UI_NAVIGATION.md`、`docs/92_CLOUD_READY_ARCHITECTURE.md`、`docs/99_TASK_BREAKDOWN.md`
- 验收标准：以后可以按模块读取文档，不需要全量读取旧 PRD。
- 状态：已完成。

### V2.1-T002：系统命名和导航修复

- 目标：系统名称改为“账单管理分析系统”，精简左侧导航。
- 影响文件：`src/App.tsx`、样式文件。
- 验收标准：左侧导航只保留核心模块；上传和预览作为流程页。
- 状态：已完成。

### V2.1-T003：月度汇总表优化

- 目标：年份筛选、默认最新年份、月份倒序、每页 12 条。
- 影响文件：`src/utils/calculateSummary.ts`、`src/components/AnalysisTables/AnalysisTables.tsx`、`src/pages/AnalysisPage.tsx`
- 验收标准：长期使用时可以按年份查看月度汇总。
- 状态：已完成。

### V2.1-T004：界面质感和遮挡修复

- 目标：优化顶部标题遮挡、品牌区图标和整体视觉质感。
- 影响文件：`src/App.tsx`、`src/styles.css`
- 验收标准：标题不遮挡，品牌区更完整，整体仍保持工具型界面。
- 状态：已完成。

### V2.1-T005：数据服务接口预留

- 目标：新增 repository/service 层，把页面和 IndexedDB 实现解耦。
- 影响文件：`src/repositories/*`、现有页面少量导入路径。
- 验收标准：页面不直接导入 `utils/*Storage.ts`，而是通过 repository 访问数据。
- 状态：已完成。

### V2.1-T006：构建验证和 ROADMAP 更新

- 目标：代码实现后运行构建验证并更新进度。
- 影响文件：`ROADMAP.md`
- 验收标准：`npm run build` 通过；已完成事项写入 ROADMAP。
- 状态：已完成。

## V2.5 资产总览任务

### V2.5-T001：资产数据模型

- 目标：新增资产负债档案、资产快照、资产快照明细类型。
- 影响文件：`src/types/asset.ts`
- 状态：已完成。

### V2.5-T002：资产本地 repository

- 目标：新增资产相关本地存储接口。
- 影响文件：`src/repositories/assetRepository.ts`、`src/repositories/local/localAssetRepository.ts`、IndexedDB store。
- 状态：已完成。

### V2.5-T003：资产总览页面

- 目标：实现资产总览、新增、历史记录、汇总计算。
- 影响文件：`src/pages/AssetPage.tsx`、`src/components/Asset/*`、`src/utils/calculateAsset.ts`
- 状态：已完成。

## V2.6 目标管理任务

### V2.6-T001：目标数据模型

- 目标：新增目标档案类型和计算字段。
- 影响文件：`src/types/goal.ts`
- 状态：已完成。

### V2.6-T002：目标本地 repository

- 目标：新增目标本地存储接口。
- 影响文件：`src/repositories/goalRepository.ts`、`src/repositories/local/localGoalRepository.ts`、IndexedDB store。
- 状态：已完成。

### V2.6-T003：目标管理页面

- 目标：实现目标列表、新增、编辑、进度和每月需存金额。
- 影响文件：`src/pages/GoalPage.tsx`、`src/components/Goal/*`、`src/utils/calculateGoal.ts`
- 状态：已完成。
