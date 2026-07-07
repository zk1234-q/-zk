# Task Breakdown

## 当前版本节奏

```text
V2.1 架构治理 + 第二版验收修复（已完成）
V2.5 资产总览（已完成）
V2.5.1 资产看板轻量化优化（已完成）
V2.5.2 资产排序和历史统计优化（已完成）
V2.6 目标管理（已完成）
V2.7 独立购物预算优化（已完成）
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

## V2.5.1 资产看板轻量化优化任务

### V2.5.1-T001：资产数据字段扩展

- 目标：增加资产分组和明细参与统计字段。
- 影响文件：`src/types/asset.ts`、`src/utils/calculateAsset.ts`、备份结构相关类型。
- 验收标准：旧资产数据仍能正常显示；旧明细默认参与统计。
- 状态：已完成。

### V2.5.1-T002：资产看板主页重排

- 目标：主页只突出最新盘点，展示净资产、总资产、总负债、最新盘点日期和最新明细。
- 影响文件：`src/pages/AssetPage.tsx`、`src/styles.css`
- 验收标准：历史记录和档案管理不再占用主页大面积内容。
- 状态：已完成。

### V2.5.1-T003：最新明细排序和参与统计

- 目标：最新盘点明细支持上移 / 下移；每条明细支持“参与统计”开关。
- 影响文件：`src/pages/AssetPage.tsx`、`src/utils/calculateAsset.ts`
- 验收标准：调整排序和开关后，顶部总资产、总负债、净资产按当前口径实时更新，并可保存。
- 状态：已完成。

### V2.5.1-T004：档案管理和历史记录收纳

- 目标：资产负债档案、历史记录改为通过按钮打开弹窗或抽屉。
- 影响文件：`src/pages/AssetPage.tsx`
- 验收标准：首页第一屏聚焦当前资产看板；仍能编辑档案、查看历史、编辑历史记录、复制新增。
- 状态：已完成。

### V2.5.1-T005：构建验证和 ROADMAP 更新

- 目标：实现后运行构建验证并更新进度。
- 影响文件：`ROADMAP.md`
- 验收标准：`npm run build` 通过；已完成事项写入 ROADMAP。
- 状态：已完成。

## V2.5.2 资产排序和历史统计优化任务

### V2.5.2-T001：明细拖拽排序

- 目标：默认隐藏排序控件，点击排序后显示三条横线拖拽手柄。
- 影响文件：`src/pages/AssetPage.tsx`、`src/styles.css`
- 验收标准：拖拽后明细顺序保存；退出排序模式后回到普通查看状态。
- 状态：已完成。

### V2.5.2-T002：历史记录按天 / 月 / 年统计

- 目标：历史资产记录支持按天、按月、按年切换。
- 影响文件：`src/pages/AssetPage.tsx`
- 验收标准：按天默认最新月份；按月默认最新年份；按月取当月最后一条记录；按年取当年最后一条记录。
- 状态：已完成。

### V2.5.2-T003：历史净资产明细查看

- 目标：点击历史记录净资产金额后，显示对应盘点记录明细。
- 影响文件：`src/pages/AssetPage.tsx`
- 验收标准：按天、按月、按年三种模式均可查看来源明细。
- 状态：已完成。

### V2.5.2-T004：构建验证和 ROADMAP 更新

- 目标：实现后运行构建验证并更新进度。
- 影响文件：`ROADMAP.md`
- 验收标准：`npm run build` 通过；已完成事项写入 ROADMAP。
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

## V2.7 独立购物预算优化任务

### V2.7-T001：设计确认

- 目标：确认独立购物预算从单表明细改为“分类计划 -> 品类预算档案 -> 购物明细”三层结构。
- 影响文件：`docs/modules/03_BUDGET.md`、`docs/90_DATA_MODEL.md`、`docs/99_TASK_BREAKDOWN.md`
- 验收标准：分类计划、品类档案、明细字段和计算口径清晰；排序交互明确；旧数据迁移规则明确。
- 状态：已完成。

### V2.7-T002：购物预算数据模型

- 目标：新增购物分类计划和品类预算档案类型，调整购物明细字段。
- 影响文件：`src/types/budget.ts`
- 验收标准：类型能表达分类计划、品类档案、购物明细三层关系；计算字段不作为最终事实落库。
- 状态：已完成。

### V2.7-T003：IndexedDB 与备份结构升级

- 目标：新增 `shoppingBudgetPlans`、`shoppingBudgetCategories` store，升级备份 `schemaVersion`，兼容旧备份导入。
- 影响文件：`src/utils/db.ts`、`src/utils/backupStorage.ts`、`src/utils/budgetStorage.ts`
- 验收标准：旧本地购物预算可迁移到默认分类计划；旧备份仍能导入；新备份包含分类计划、品类档案和明细。
- 状态：已完成。

### V2.7-T004：Repository 接口扩展

- 目标：扩展预算 repository，页面不直接访问 IndexedDB 存储实现。
- 影响文件：`src/repositories/budgetRepository.ts`、`src/repositories/local/localBudgetRepository.ts`
- 验收标准：分类计划、品类档案、购物明细均通过 repository 读取、保存、排序。
- 状态：已完成。

### V2.7-T005：购物预算计算逻辑

- 目标：新增分类计划汇总、品类预算汇总、购物明细占用金额计算。
- 影响文件：`src/utils/calculateBudget.ts`
- 验收标准：已购买用实际金额占用预算，计划中用计划金额占用预算，暂缓和放弃不占用预算；计划金额、实际金额、剩余预算分别支持超预算判断。
- 状态：已完成。

### V2.7-T006：预算管理页面重排

- 目标：把独立购物预算页面区改为分类计划页签、品类预算档案、购物明细三块。
- 影响文件：`src/pages/BudgetPage.tsx`、`src/styles.css`
- 验收标准：服装、电子设备等分类计划可分开维护；新增购物明细时选择品类并带出品类预算参考；明细行不再显示品类剩余预算。
- 状态：已完成。

### V2.7-T007：拖动排序

- 目标：参考资产总览排序交互，实现分类计划、品类档案、购物明细拖动排序。
- 影响文件：`src/pages/BudgetPage.tsx`、`src/styles.css`
- 验收标准：默认隐藏拖拽手柄；点击“排序”后显示三横线拖拽手柄；拖动后点击“保存排序”写入本地数据；点击“取消”放弃；刷新页面后保持顺序。
- 状态：已完成。

### V2.7-T008：构建验证和 ROADMAP 更新

- 目标：实现后运行构建验证并更新进度。
- 影响文件：`ROADMAP.md`
- 验收标准：`npm run build` 通过；已完成事项写入 ROADMAP；未验证事项不标为已完成。
- 状态：已完成。

### V2.7-T009：分类计划主从联动

- 目标：分类计划表选中某一行后，下方品类预算档案和购物明细显示该分类计划对应数据，移除下方重复的分类计划页签。
- 影响文件：`src/pages/BudgetPage.tsx`、`src/styles.css`、`docs/modules/03_BUDGET.md`
- 验收标准：选中分类计划行高亮；切换选中行后下方品类和明细同步切换；分类计划改名正常保存且不把计算字段写入存储；构建通过。
- 状态：已完成。
