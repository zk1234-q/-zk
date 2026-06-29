# Module: Budget Management

## 模块目标

预算管理模块负责：

- 总预算设置。
- 月度账单大类预算。
- 月度预算总览。
- 月度结算。
- 独立购物预算。

## 当前边界

账单大类预算联动账单。

独立购物预算不联动账单，只做手工维护。

## 当前能力

- 设置年支出总预算。
- 设置月攒钱预算。
- 设置月总支出预算。
- 按月维护大类预算。
- 从当月账单一级分类中选择预算大类。
- 自动计算已支出、剩余、使用率、状态。
- 复制月份预算。
- 维护独立购物预算表。

## 后续优化原则

预算管理不要和资产总览混在一个页面。

预算回答的是：

```text
这个月计划花多少，实际花了多少，是否超支？
```

资产总览回答的是：

```text
我现在一共有多少钱，欠多少钱，净资产是多少？
```

目标管理回答的是：

```text
我离目标还差多少，每月还需要存多少？
```

## 后续云端预留

预算模块以后应通过 `budgetRepository` 访问数据。

建议接口：

```text
budgetRepository.getBudgetSettings()
budgetRepository.saveBudgetSettings(settings)
budgetRepository.getMonthlyCategoryBudgets(month)
budgetRepository.saveMonthlyCategoryBudget(budget)
budgetRepository.deleteMonthlyCategoryBudget(id)
budgetRepository.getShoppingBudgetItems()
budgetRepository.saveShoppingBudgetItem(item)
budgetRepository.deleteShoppingBudgetItem(id)
```

## 验收标准

- 不影响账单管理和月度分析的已有数据。
- 预算计算字段从账单和预算实时计算，不把计算结果作为最终事实。
- 金额展示保留 2 位小数。
- 百分比展示保留 1 位小数。
