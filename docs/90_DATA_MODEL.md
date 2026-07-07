# Data Model Index

## 目标

本文档作为数据模型索引。具体字段先保持在对应模块文档和 `src/types/*.ts` 中，避免单个大文档无限膨胀。

## 当前类型文件

| 文件 | 说明 |
| --- | --- |
| `src/types/bill.ts` | 账单、月度汇总、分类分析、明细筛选 |
| `src/types/budget.ts` | 预算、购物预算、备份文件 |
| `src/types/settings.ts` | 用户设置、总预算设置 |

## 计划新增类型文件

暂无。后续云端版会按需要新增用户和接口相关类型。

## V2.5 已新增类型文件

| 文件 | 说明 | 版本 |
| --- | --- | --- |
| `src/types/asset.ts` | 资产负债档案、资产快照、资产明细 | V2.5 |
| `src/types/goal.ts` | 目标档案、目标计算结果 | V2.6 |

## V2.5.1 已扩展字段

资产总览轻量化改版扩展现有类型，不新增 IndexedDB store。

| 类型 | 字段 | 说明 | 兼容规则 |
| --- | --- | --- | --- |
| `AssetAccount` | `groupName` | 资产分组名称 | 旧数据为空分组 |
| `AssetSnapshotItem` | `includedInTotal` | 是否参与总资产 / 总负债统计 | 旧数据默认 `true` |

排序不新增字段，直接使用 `AssetSnapshot.items` 数组顺序。

## V2.7 已扩展字段

独立购物预算优化需要把当前单表明细结构拆为三层结构。

### 购物分类计划

建议类型名：`ShoppingBudgetPlan`

| 字段 | 说明 |
| --- | --- |
| `id` | 主键 |
| `name` | 分类计划名称，例如年度服装预算 |
| `totalBudgetAmount` | 分类计划总预算 |
| `sortOrder` | 页签排序 |
| `remark` | 备注 |
| `createdAt` | 创建时间 |
| `updatedAt` | 更新时间 |

计算字段不落库：

| 字段 | 说明 |
| --- | --- |
| `usedAmount` | 当前分类计划已占用预算 |
| `remainingAmount` | 当前分类计划剩余预算 |
| `isOverBudget` | 是否超出分类计划总预算 |

### 购物品类预算档案

建议类型名：`ShoppingBudgetCategory`

| 字段 | 说明 |
| --- | --- |
| `id` | 主键 |
| `planId` | 所属分类计划 ID |
| `name` | 品类名称，例如外套 |
| `budgetAmount` | 品类预算 |
| `sortOrder` | 当前分类计划内排序 |
| `remark` | 备注 |
| `createdAt` | 创建时间 |
| `updatedAt` | 更新时间 |

计算字段不落库：

| 字段 | 说明 |
| --- | --- |
| `plannedAmount` | 当前品类明细计划金额合计 |
| `actualAmount` | 当前品类明细实际金额合计 |
| `usedAmount` | 当前品类占用金额 |
| `remainingAmount` | 当前品类剩余预算 |
| `isPlanOverBudget` | 计划金额是否超过品类预算 |
| `isActualOverBudget` | 实际金额是否超过品类预算 |
| `isUsedOverBudget` | 占用金额是否超过品类预算 |

### 购物明细

建议继续使用类型名：`ShoppingBudgetItem`，但调整字段。

| 字段 | 说明 |
| --- | --- |
| `id` | 主键 |
| `planId` | 所属分类计划 ID |
| `categoryId` | 所属品类 ID |
| `itemName` | 具体项目 |
| `plannedQuantity` | 计划数量 |
| `plannedAmount` | 计划金额 |
| `actualAmount` | 实际金额 |
| `status` | 计划中 / 已购买 / 暂缓 / 放弃 |
| `sortOrder` | 当前分类计划内排序 |
| `remark` | 备注 |
| `createdAt` | 创建时间 |
| `updatedAt` | 更新时间 |

计划移除字段：

| 旧字段 | 处理方式 |
| --- | --- |
| `categoryName` | 迁移到 `ShoppingBudgetCategory.name` |
| `quantityUnit` | 不再维护 |
| `budgetAmount` | 迁移为明细 `plannedAmount` |
| `actualUnitAmount` | 与 `purchasedQuantity` 计算后迁移为 `actualAmount` |
| `purchasedQuantity` | 不再单独维护，旧数据仅用于迁移状态和实际金额 |
| `purchasedItem` | 合并到 `itemName` 或 `remark` |
| `recommendedPlan` | 合并到 `remark` |
| `priority` | 本次优化不保留，避免明细表继续复杂化 |

## 现有存储

当前 IndexedDB database:

```text
expense-bill-analyzer
```

当前 store:

| store | 说明 |
| --- | --- |
| `monthlyBills` | 每月账单 |
| `userSettings` | 用户设置 |
| `budgetSettings` | 总预算设置 |
| `monthlyCategoryBudgets` | 月度大类预算 |
| `shoppingBudgetItems` | 独立购物预算 |

## 计划新增本地 store

暂无。后续云端版优先新增后端表，不再继续扩大纯本地 store。

## V2.5 已新增本地 store

| store | 说明 | 版本 |
| --- | --- | --- |
| `assetAccounts` | 资产负债档案 | V2.5 |
| `assetSnapshots` | 资产盘点记录 | V2.5 |
| `goals` | 目标档案 | V2.6 |

## V2.7 已新增本地 store

| store | 说明 | 版本 |
| --- | --- | --- |
| `shoppingBudgetPlans` | 独立购物预算分类计划 | V2.7 |
| `shoppingBudgetCategories` | 独立购物预算品类档案 | V2.7 |

`shoppingBudgetItems` 继续保留，但字段按 V2.7 结构迁移。备份文件结构变化时需要提升 `schemaVersion`。

## 云端建议表

V3.0 云端版建议使用关系型数据库。

建议表：

```text
users
monthly_bills
bill_records
abnormal_records
budget_settings
monthly_category_budgets
shopping_budget_plans
shopping_budget_categories
shopping_budget_items
asset_accounts
asset_snapshots
asset_snapshot_items
goals
```

## 关键原则

- 业务数据必须能绑定 `userId`。
- 账单明细不要只存一个大 JSON，否则后续查询困难。
- 计算字段优先实时计算，不作为最终事实。
- 金额内部使用 number，展示时格式化。
- 日期字段使用 ISO 字符串或固定格式 `YYYY-MM`、`YYYY-MM-DD`。
- 备份文件每次结构变化必须提升 `schemaVersion`。
