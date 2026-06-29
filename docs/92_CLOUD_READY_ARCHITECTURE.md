# Cloud Ready Architecture

## 结论

当前系统不需要立刻上云，但从 V2.1 开始必须按云端可迁移的方式继续开发。

目标不是现在引入后端，而是先把数据访问边界整理清楚。

## 当前问题

当前 IndexedDB 已经封装在 `utils/*Storage.ts` 中，这是优点。

但页面仍然直接调用具体存储函数，例如：

- `getAllMonthlyBills`
- `getMonthlyCategoryBudgets`
- `saveShoppingBudgetItem`
- `getUserSettings`

以后切云端时，页面会受到影响。

## V2.1 改造目标

新增 repository/service 层。

目标结构：

```text
src/
  repositories/
    billRepository.ts
    budgetRepository.ts
    settingsRepository.ts
    local/
      localBillRepository.ts
      localBudgetRepository.ts
      localSettingsRepository.ts
```

后续新增模块时直接使用：

```text
assetRepository.ts
goalRepository.ts
local/localAssetRepository.ts
local/localGoalRepository.ts
```

## 调用规则

页面只调用 repository 接口。

```text
Page -> repository interface -> local repository -> IndexedDB
```

未来云端：

```text
Page -> repository interface -> remote repository -> HTTP API -> database
```

页面不直接关心数据来自 IndexedDB 还是云端。

## 推荐接口

### billRepository

```text
getAllMonthlyBills()
getMonthlyBill(month)
saveMonthlyBill(bill)
deleteMonthlyBill(month)
replaceAllMonthlyBills(bills)
```

### budgetRepository

```text
getBudgetSettings()
saveBudgetSettings(settings)
getMonthlyCategoryBudgets(month)
saveMonthlyCategoryBudget(budget)
deleteMonthlyCategoryBudget(id)
replaceMonthlyCategoryBudgets(month, budgets)
getShoppingBudgetItems()
saveShoppingBudgetItem(item)
deleteShoppingBudgetItem(id)
```

### settingsRepository

```text
getUserSettings()
saveUserSettings(settings)
```

### backupRepository

本地备份暂时可以保留浏览器文件下载逻辑。

云端版需要新增：

```text
migrateLocalBackupToCloud(backup)
```

## 数据读取原则

本地版可以读取全部数据。

云端版必须按需读取：

- 账单管理读取月份摘要。
- 月度分析读取当前年份摘要和当前月份明细。
- 预算管理读取当前月份预算。
- 资产总览读取最近快照和分页历史。
- 目标管理读取目标列表。

## 云端版本边界

V3.0 才考虑：

- 登录注册。
- 用户身份。
- API 鉴权。
- 后端数据库。
- 本地数据迁移到云端。

V2.1 不做这些，只做代码边界预留。
