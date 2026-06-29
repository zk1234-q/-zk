# 02 Data Model

## 数据设计目标

数据模型需要把 iCost 原始账单统一转换成系统内部标准账单，再基于标准账单计算月度汇总、分类统计、图表数据和明细弹框数据。

核心原则：

- 原始数据和标准化数据分开
- 只统计明确属于“支出”的记录
- 异常记录单独保留，不直接参与消费统计
- 所有统计金额都必须能追溯到原始账单明细
- 按月份保存历史账单，方便后续做月份对比

## 原始账单字段

从 iCost 导出的 Excel 或 CSV 中尽量识别以下字段：

- 消费日期
- 类型
- 金额
- 一级分类
- 二级分类
- 商户
- 支付方式
- 备注

如果导出文件的字段名和以上名称不完全一致，需要在解析阶段做字段映射。

## 标准化账单字段

标准化后的单条账单建议包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 系统生成的唯一 ID |
| rawIndex | number | 原始文件中的行号 |
| date | string | 消费日期，格式 YYYY-MM-DD |
| month | string | 所属月份，格式 YYYY-MM |
| type | string | 记录类型，如支出、收入、退款、转账 |
| amount | number | 原始金额 |
| expenseAmount | number | 支出金额，只在支出记录中有值 |
| incomeAmount | number | 收入金额，只在收入记录中有值 |
| primaryCategory | string | 一级分类 |
| secondaryCategory | string | 二级分类 |
| merchant | string | 商户 |
| paymentMethod | string | 支付方式 |
| note | string | 备注 |
| isIncludedInExpense | boolean | 是否计入消费支出 |
| abnormalReason | string | 异常或不计入统计的原因 |

说明：

- `isIncludedInExpense = true` 的记录才参与消费支出统计。
- `abnormalReason` 不为空时，需要在异常数据列表中展示。
- “收入、退款、转账、借入”等明确不计入消费支出的记录，可以保留原因，但不一定算作解析异常。

## 异常记录字段

异常记录用于预览阶段提醒用户哪些数据未进入统计。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 系统生成的唯一 ID |
| rawIndex | number | 原始文件中的行号 |
| reason | string | 异常原因 |
| rawDate | string | 原始日期 |
| rawType | string | 原始类型 |
| rawAmount | string | 原始金额 |
| rawPrimaryCategory | string | 原始一级分类 |
| rawSecondaryCategory | string | 原始二级分类 |
| rawNote | string | 原始备注 |
| rawRecord | object | 原始行完整数据 |

第一版建议进入异常列表的情况：

- 日期为空或无法解析
- 金额为空或无法解析为数字
- 类型为空
- 类型无法识别
- 金额为负数

## 字段口径

### 月份字段

- 根据消费日期生成
- 格式为 `YYYY-MM`
- 月份归属以消费日期为准

### 一级分类字段

- 来自 iCost 一级分类
- 为空时标记为“未分类”

### 二级分类字段

- 来自 iCost 二级分类
- 为空时标记为“未分类”

### 金额字段

- 内部计算使用 `number`
- 展示时保留 2 位小数
- 不在计算阶段提前格式化成字符串

### 收入字段

- 第一版默认月收入为 9000 元
- 后续可扩展为用户自定义收入

### 支出字段

- 只统计类型为“支出”的记录
- 不统计收入、退款、转账、借入等记录

### 支付方式字段

- 用于明细展示
- 第一版不作为统计维度

### 备注字段

- 用于明细展示
- 第一版不参与计算

## 本地历史账单字段

确认上传后，每个月账单保存为一条月份记录。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 月份记录 ID，建议使用月份作为主键 |
| month | string | 月份，格式 YYYY-MM |
| fileName | string | 上传文件名 |
| uploadedAt | string | 上传时间，ISO 字符串 |
| records | StandardBillRecord[] | 标准化账单记录 |
| abnormalRecords | AbnormalBillRecord[] | 异常记录 |
| totalExpense | number | 月总支出 |
| expenseCount | number | 支出笔数 |
| abnormalCount | number | 异常记录数 |

如果同一个月份重复上传，第一版采用覆盖策略，但覆盖前必须提示用户确认。

本地历史账单保存在 IndexedDB 中。

## 特殊记录处理

| 类型 | 是否计入消费支出 | 处理规则 |
| --- | --- | --- |
| 支出 | 是 | 计入支出统计 |
| 收入 | 否 | 不计入支出，可用于未来收入统计 |
| 退款 | 否 | 第一版不直接抵扣支出，单独标记 |
| 转账 | 否 | 不计入消费支出 |
| 借入 | 否 | 不计入消费支出 |
| 支出负数金额 | 是 | iCost 导出的支出常见为负数，按绝对值计入支出 |
| 非支出负数金额 | 待确认 | 标记为异常，不擅自混入支出 |
| 类型为空 | 否 | 标记为异常 |
| 日期无法识别 | 否 | 标记为异常 |
| 金额无法识别 | 否 | 标记为异常 |
| 类型无法识别 | 否 | 标记为异常 |

## 月度汇总表口径

每个月生成一行汇总数据：

| 字段 | 说明 |
| --- | --- |
| month | 月份 |
| income | 月收入，第一版默认 9000 |
| totalExpense | 月总支出 |
| balance | 月结余 |
| balanceRate | 结余率 |
| expenseCount | 支出笔数 |
| abnormalCount | 异常记录数 |
| isPartialMonth | 是否非完整月份 |
| remark | 备注 |

## 图表数据口径

图表数据基于已经计算好的汇总结果生成，不单独定义新的统计口径。

### 月度总支出趋势图

| 字段 | 说明 |
| --- | --- |
| month | 月份 |
| totalExpense | 月总支出 |

数据来源：所有已保存月份的月度汇总数据。

### 一级分类支出占比图

| 字段 | 说明 |
| --- | --- |
| primaryCategory | 一级分类 |
| amount | 一级金额 |
| ratio | 一级占总支出 |

数据来源：当前选择月份的一级分类表。

### 二级分类支出排行图

| 字段 | 说明 |
| --- | --- |
| primaryCategory | 一级分类 |
| secondaryCategory | 二级分类 |
| amount | 二级金额 |
| ratio | 二级占总支出 |

数据来源：当前选择月份的二级分类表。
第一版默认按金额从高到低展示。

## 一级分类表口径

| 字段 | 说明 |
| --- | --- |
| primaryCategory | 一级分类 |
| primaryAmount | 一级金额 |
| primaryExpenseRatio | 一级占总支出 |
| primaryIncomeRatio | 一级占收入 |
| count | 笔数 |
| remark | 备注 |

## 二级分类表口径

| 字段 | 说明 |
| --- | --- |
| primaryCategory | 一级分类 |
| secondaryCategory | 二级分类 |
| secondaryAmount | 二级金额 |
| secondaryExpenseRatio | 二级占总支出 |
| secondaryIncomeRatio | 二级占收入 |
| count | 笔数 |
| remark | 备注 |

## 一级 + 二级综合表口径

字段顺序必须为：

1. 一级分类
2. 二级分类
3. 一级金额
4. 一级占总支出
5. 二级金额
6. 二级占总支出
7. 二级占一级
8. 一级占收入
9. 二级占收入
10. 二级笔数

注意：一级占总支出必须紧跟在一级金额后面。

## 核心计算公式

```text
一级分类占总支出 = 一级分类金额 / 当月总支出
二级分类占总支出 = 二级分类金额 / 当月总支出
二级分类占一级分类 = 二级分类金额 / 所属一级分类金额
一级分类占收入 = 一级分类金额 / 月收入
二级分类占收入 = 二级分类金额 / 月收入
月结余 = 月收入 - 月总支出
结余率 = 月结余 / 月收入
```

## 计算边界

- 当月总支出为 0 时，占总支出比例显示为 0
- 月收入为 0 时，占收入比例和结余率显示为 0
- 所有百分比展示时保留 1 位小数
- 所有金额展示时保留 2 位小数

---

# 第二版数据模型：本地增强版（待确认）

## 第二版数据设计目标

第二版在第一版账单数据模型基础上，新增以下本地数据：

1. 用户设置
2. 账单大类预算
3. 独立购物预算
4. 本地数据导出 / 导入备份
5. 重复月份账单覆盖确认所需的账单摘要字段

第二版仍然是纯本地版本，不引入账号、后端和云端数据库。

## 第二版数据边界

第二版有两类预算，必须分开建模：

| 预算类型 | 是否联动账单 | 说明 |
| --- | --- | --- |
| 账单大类预算 | 是 | 按月份和一级分类名称匹配账单支出 |
| 独立购物预算 | 否 | 用户手工维护购物计划，不读取账单支出 |

账单大类预算用于控制每月实际账单支出。

独立购物预算用于记录用户手工规划的购买清单，例如衣服、鞋子、装备等。

## 用户设置字段

用户设置保存全局默认值。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 固定值，建议使用 `user-settings` |
| defaultMonthlyIncome | number | 默认月收入，未设置时使用 9000 |
| currency | string | 货币单位，第二版固定为 `CNY` |
| updatedAt | string | 最后更新时间，ISO 字符串 |

### 默认月收入口径

- 月度汇总中的 `income` 从 `defaultMonthlyIncome` 读取。
- 如果 `defaultMonthlyIncome` 为空或无效，使用 9000。
- 第二版先不做不同月份不同收入。

## 总预算设置字段

总预算设置保存用户的年度和月度总预算目标。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 固定值，建议使用 `budget-settings` |
| annualExpenseBudget | number | 年支出总预算 |
| monthlySavingTarget | number | 月攒钱预算金额 |
| monthlyExpenseBudget | number | 月总支出预算 |
| updatedAt | string | 最后更新时间，ISO 字符串 |

### 总预算设置口径

- `annualExpenseBudget` 用于展示全年支出目标，第二版先不强制校验每月预算之和。
- `monthlySavingTarget` 用于月度预算总览和月度结算视图。
- `monthlyExpenseBudget` 用于月度预算总览。

## 月度大类预算字段

月度大类预算按月份和一级分类管理。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 系统生成的唯一 ID |
| month | string | 月份，格式 YYYY-MM |
| categoryName | string | 大类名称，需要和账单一级分类名称匹配 |
| budgetAmount | number | 该月份该大类预算金额 |
| spentAmount | number | 已支出金额，根据账单自动计算，不手工保存为最终事实 |
| remainingAmount | number | 剩余预算金额，计算字段 |
| usageRate | number | 预算使用率，计算字段 |
| status | string | `normal`、`warning`、`over`、`unmatched` |
| overBudgetNote | string | 超支备注 |
| remark | string | 普通备注 |
| createdAt | string | 创建时间，ISO 字符串 |
| updatedAt | string | 更新时间，ISO 字符串 |

### 唯一性规则

同一个月份内，同一个大类名称只能有一条预算记录。

建议唯一键：

```text
month + normalizedCategoryName
```

`normalizedCategoryName` 只做去除前后空格，不做模糊匹配。

## 月度大类预算计算字段

`spentAmount`、`remainingAmount`、`usageRate` 和 `status` 可以存储用于页面展示，但计算时需要以当前账单数据重新计算，避免旧数据残留。

### 已支出金额

```text
已支出金额 = 当前月份内，primaryCategory 等于 categoryName 的支出记录 expenseAmount 合计
```

匹配规则：

```text
trim(预算大类名称) = trim(账单一级分类名称)
```

### 剩余预算金额

```text
剩余预算金额 = 大类预算金额 - 已支出金额
```

### 预算使用率

```text
预算使用率 = 已支出金额 / 大类预算金额
```

### 状态

| 条件 | status | 说明 |
| --- | --- | --- |
| 匹配不到账单分类 | unmatched | 已支出按 0 处理 |
| 大类预算金额为 0 且已支出金额大于 0 | over | 直接超支 |
| 预算使用率 < 0.8 | normal | 正常 |
| 0.8 <= 预算使用率 <= 1 | warning | 接近预算 |
| 预算使用率 > 1 | over | 已超支 |

## 从账单分类选择大类

当某个月账单已导入时，可以从该月账单数据中提取一级分类选项。

分类选项字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| month | string | 月份 |
| categoryName | string | 一级分类名称 |
| spentAmount | number | 该分类已支出金额 |
| count | number | 支出笔数 |

分类选项不需要单独长期保存，可以从当月账单记录实时计算。

## 复制月份预算数据规则

复制月份预算时，只复制用户手工维护字段：

| 字段 | 是否复制 |
| --- | --- |
| categoryName | 是 |
| budgetAmount | 是 |
| overBudgetNote | 否 |
| remark | 是 |
| spentAmount | 否 |
| remainingAmount | 否 |
| usageRate | 否 |
| status | 否 |

复制后：

- `month` 改为目标月份
- `id` 重新生成
- `createdAt` 和 `updatedAt` 使用当前时间
- 目标月份的计算字段按目标月份账单重新计算

如果目标月份已有预算记录，第二版采用整月覆盖策略，覆盖前必须二次确认。

## 月度预算总览字段

月度预算总览是计算结果，不需要作为独立记录保存。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| month | string | 当前月份 |
| monthlyIncome | number | 默认月收入 |
| monthlyExpenseBudget | number | 月总支出预算 |
| currentExpense | number | 当月账单总支出 |
| remainingExpenseBudget | number | 月总支出预算 - 当前已支出 |
| monthlySavingTarget | number | 月攒钱预算金额 |
| expectedSaving | number | 月收入 - 当前已支出 |
| isSavingTargetMet | boolean | 是否达到月攒钱目标 |
| budgetUsageRate | number | 当前已支出 / 月总支出预算 |

公式：

```text
当前剩余预算 = 月总支出预算 - 当前已支出
预计可攒金额 = 月收入 - 当前已支出
攒钱目标是否达成 = 预计可攒金额 >= 月攒钱预算金额
月总预算使用率 = 当前已支出 / 月总支出预算
```

## 月度结算视图字段

月度结算视图也是计算结果，不单独保存。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| month | string | 当前月份 |
| isTotalBudgetOver | boolean | 月总支出是否超过月总支出预算 |
| isSavingTargetMet | boolean | 月攒钱目标是否达成 |
| overBudgetCategories | MonthlyCategoryBudget[] | 超支大类 |
| topRemainingCategories | MonthlyCategoryBudget[] | 剩余预算最多的大类 |
| categoryRows | MonthlyCategoryBudget[] | 全部大类预算结果 |

## 一级分类表预算扩展字段

第二版需要在一级分类统计结果中增加预算状态字段。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| budgetAmount | number | 当前月份该一级分类预算金额 |
| remainingBudgetAmount | number | 当前月份该一级分类剩余预算 |
| budgetUsageRate | number | 已支出 / 预算金额 |
| budgetStatus | string | `none`、`normal`、`warning`、`over` |
| overBudgetAmount | number | 超出预算金额，未超支时为 0 |
| overBudgetNote | string | 超支备注 |

说明：

- 未设置预算时，`budgetStatus = none`。
- 超支时，一级分类金额字段需要标红。
- 点击一级分类金额时，预算提示信息从这些字段生成。

## 购物预算明细字段

购物预算不和账单联动。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 系统生成的唯一 ID |
| categoryName | string | 品类，例如裤子、鞋子 |
| itemName | string | 具体项目，例如冬天厚裤、通勤鞋 |
| plannedQuantity | number | 计划数量 |
| purchasedQuantity | number | 已购买数量 |
| quantityUnit | string | 单位，例如件、条、双 |
| budgetAmount | number | 该行预算金额 |
| actualUnitAmount | number | 单件单品实际购买金额 |
| actualTotalAmount | number | 实际购买小计，计算字段 |
| categoryRemainingAmount | number | 所属品类剩余预算，计算字段 |
| purchasedItem | string | 实际购买内容 |
| recommendedPlan | string | 推荐方案 |
| status | string | `planned`、`purchased`、`paused`、`abandoned` |
| priority | string | `must`、`should`、`optional`、`not_now` |
| remark | string | 备注 |
| createdAt | string | 创建时间，ISO 字符串 |
| updatedAt | string | 更新时间，ISO 字符串 |

## 购物预算计算字段

### 实际购买小计

```text
实际购买小计 = 已购买数量 * 单件单品实际购买金额
```

### 行是否超支

```text
行是否超支 = 实际购买小计 > 预算金额
```

### 品类剩余预算

```text
品类剩余预算 = 同品类所有行预算金额合计 - 同品类所有行实际购买小计合计
```

购物预算表每一行显示该行所属品类的剩余预算。

## 购物预算合计字段

购物预算合计是计算结果，不单独保存。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| totalBudgetAmount | number | 总预算金额 |
| totalActualAmount | number | 总实际购买金额 |
| totalRemainingAmount | number | 总剩余预算金额 |
| isOverBudget | boolean | 是否整体超支 |

公式：

```text
总预算金额 = 所有购物预算行 budgetAmount 合计
总实际购买金额 = 所有购物预算行 actualTotalAmount 合计
总剩余预算金额 = 总预算金额 - 总实际购买金额
```

## 本地历史账单字段扩展

第二版为了支持重复月份覆盖确认，需要在每月账单记录中补充摘要字段。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| rawRowCount | number | 原始文件识别出的总行数 |
| validExpenseRowCount | number | 计入支出的有效行数 |
| abnormalRowCount | number | 异常行数 |

说明：

- `validExpenseRowCount` 可以和第一版 `expenseCount` 保持一致。
- `abnormalRowCount` 可以和第一版 `abnormalCount` 保持一致。
- 保留这些字段是为了覆盖确认弹窗中对比已保存账单和本次上传账单。

## 本地数据备份文件结构

导出文件建议使用 JSON。

根结构：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| appName | string | 固定为 `expense-bill-analyzer` |
| schemaVersion | number | 备份结构版本，第二版使用 2 |
| exportedAt | string | 导出时间，ISO 字符串 |
| userSettings | UserSettings | 用户设置 |
| budgetSettings | BudgetSettings | 总预算设置 |
| monthlyCategoryBudgets | MonthlyCategoryBudget[] | 月度大类预算 |
| shoppingBudgetItems | ShoppingBudgetItem[] | 购物预算明细 |
| monthlyBills | MonthlyBill[] | 本地历史账单 |

## 导入校验规则

导入前必须校验：

- `appName` 必须等于 `expense-bill-analyzer`
- `schemaVersion` 必须存在
- `userSettings`、`budgetSettings`、`monthlyCategoryBudgets`、`shoppingBudgetItems`、`monthlyBills` 字段必须存在
- 金额字段必须能解析为数字
- 月份字段必须符合 `YYYY-MM`

校验失败时，不允许覆盖当前本地数据。

第二版导入采用整包覆盖：

```text
导入后当前本地数据 = 导入文件中的数据
```

## 第二版本地存储建议

第二版仍然使用 IndexedDB。

建议新增或扩展以下对象仓库：

| 存储 | 主键 | 说明 |
| --- | --- | --- |
| userSettings | id | 默认月收入等用户设置 |
| budgetSettings | id | 总预算设置 |
| monthlyCategoryBudgets | id | 月度大类预算 |
| shoppingBudgetItems | id | 购物预算明细 |
| monthlyBills | month | 每月账单 |

## 第二版计算边界

- 所有金额内部使用 `number`。
- 金额展示保留 2 位小数。
- 百分比展示保留 1 位小数。
- 预算金额为空时按 0 处理。
- 已购买数量为空时按 0 处理。
- 单件实际购买金额为空时按 0 处理。
- 大类预算金额为 0 且已支出大于 0 时，视为超支。
- 月总支出预算为 0 时，月总预算使用率显示为 0，避免除以 0。
- 默认月收入为 0 时，结余率和占收入比例显示为 0。
