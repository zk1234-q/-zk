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
