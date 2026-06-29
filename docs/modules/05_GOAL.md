# Module: Goal Management

## 模块状态

已实现本地版，版本：V2.6。

## 模块目标

目标管理用于维护用户自定义财务目标。

示例目标：

- 年存款目标
- 买房首付目标
- 备用金目标
- 旅游基金

## 目标字段

| 字段 | 说明 |
| --- | --- |
| id | 唯一 ID |
| name | 目标名称 |
| targetAmount | 目标金额 |
| currentAmount | 当前已完成金额 |
| startDate | 开始日期 |
| targetDate | 目标日期 |
| status | `active`、`completed`、`paused` |
| remark | 备注 |
| createdAt | 创建时间 |
| updatedAt | 更新时间 |

## 计算字段

| 字段 | 公式 |
| --- | --- |
| remainingAmount | `targetAmount - currentAmount` |
| progressRate | `currentAmount / targetAmount` |
| remainingMonths | 从当前月份到目标月份的剩余月数 |
| requiredMonthlySaving | `remainingAmount / remainingMonths` |

## 页面建议

目标管理页面包含：

- 目标列表。
- 新增目标。
- 目标详情。
- 目标进度。
- 剩余金额。
- 每月需存金额。

## 边界

V2.6 目标金额先手工维护。

V2.6 不自动绑定资产账户。

V2.6 不自动从账单或资产快照反写目标进度。

## 实现状态

已实现：

- 目标管理导航。
- 目标档案新增和编辑。
- 目标金额、已完成金额、目标日期、状态、备注。
- 自动计算剩余金额、完成率、剩余月份、每月需存金额。
- 汇总进行中目标数量、目标总金额、已完成金额、剩余金额。
- 本地备份导出 / 导入包含目标数据。

## 后续云端预留

建议未来云端表：

- `goals`

后续如果需要绑定资产账户，再新增：

- `goal_asset_links`

页面通过 `goalRepository` 访问数据。
