# 04 Tech Plan

## 技术方案目标

第一版做纯前端本地解析版本，重点是简单、稳定、适合小白维护。

暂不做后端、登录、多用户、云端同步和复杂权限。

## 推荐技术栈

| 模块 | 推荐方案 | 理由 |
| --- | --- | --- |
| 前端框架 | React + TypeScript | 社区成熟，类型约束清晰，适合后续维护 |
| 构建工具 | Vite | 启动快，配置简单 |
| 表格 | Ant Design Table | 开箱即用，排序、弹框、布局组件完整 |
| Excel 解析 | xlsx | 支持 Excel 和 CSV，使用广泛 |
| 状态管理 | React Context 或 Zustand | 第一版状态不复杂，避免过度设计 |
| 图表 | Recharts | React 项目里使用简单，适合做基础趋势图、占比图和排行图 |
| 本地存储 | IndexedDB | 适合保存每月账单明细，容量比 localStorage 更合适 |
| 样式 | Ant Design | 和表格、弹框组件一致，降低样式成本 |

## 推荐选择

第一版建议使用：

- React + TypeScript
- Vite
- Ant Design
- xlsx
- Recharts
- React Context
- IndexedDB

原因：

- 对新手更友好
- 组件开箱即用
- 不需要自己写复杂表格和弹框样式
- Recharts 能满足第一版基础图表需求，不需要引入复杂图表配置
- IndexedDB 更适合保存每月账单明细，方便后续做月份对比

## 项目目录结构

```text
expense-bill-analyzer/
├─ docs/
├─ src/
│  ├─ components/
│  │  ├─ UploadBill/
│  │  ├─ BillManager/
│  │  ├─ DataPreview/
│  │  ├─ AnalysisCharts/
│  │  ├─ AnalysisTables/
│  │  ├─ AbnormalTable/
│  │  └─ DetailModal/
│  ├─ pages/
│  │  ├─ UploadPage.tsx
│  │  ├─ BillManagerPage.tsx
│  │  ├─ PreviewPage.tsx
│  │  └─ AnalysisPage.tsx
│  ├─ types/
│  │  └─ bill.ts
│  ├─ utils/
│  │  ├─ parseBillFile.ts
│  │  ├─ normalizeBill.ts
│  │  ├─ calculateSummary.ts
│  │  ├─ calculateCharts.ts
│  │  ├─ billStorage.ts
│  │  └─ format.ts
│  ├─ constants/
│  │  └─ bill.ts
│  ├─ mock/
│  │  └─ bills.ts
│  ├─ App.tsx
│  └─ main.tsx
├─ AGENTS.md
└─ README.md
```

## 数据流转过程

1. 用户上传 Excel 或 CSV
2. `xlsx` 读取文件内容
3. 系统转换为原始账单数组
4. 字段映射为标准账单数组
5. 标记异常记录和不计入统计的记录
6. 用户确认后把该月份账单保存到 IndexedDB
7. 过滤出计入统计的支出记录
8. 根据月份、一级分类、二级分类计算表格数据
9. 根据汇总结果生成图表数据
10. 页面展示分析结果
11. 点击金额时，根据当前月份和分类条件筛选明细

## 文件上传解析流程

1. 读取用户选择的文件
2. 判断文件类型
3. 使用 `xlsx` 解析第一张表
4. 转换为 JSON 数组
5. 识别字段名
6. 生成原始账单预览
7. 转换为标准账单
8. 标记异常记录
9. 用户确认后保存到 IndexedDB
10. 同月份重复上传时提示是否覆盖

## 表格计算逻辑

计算逻辑必须放在独立函数中，不直接写在页面组件里。

建议拆分为：

- `calculateMonthlySummary`
- `calculatePrimaryCategoryRows`
- `calculateSecondaryCategoryRows`
- `calculateCombinedCategoryRows`
- `calculateMonthlyExpenseTrend`
- `calculatePrimaryCategoryChart`
- `calculateSecondaryCategoryRanking`

页面只负责：

- 接收数据
- 调用计算函数
- 渲染表格
- 渲染图表
- 处理点击事件

## IndexedDB 本地存储逻辑

本地历史账单保存到 IndexedDB。

建议拆分为：

- `saveMonthlyBill`
- `getMonthlyBill`
- `getAllMonthlyBills`
- `deleteMonthlyBill`
- `checkMonthlyBillExists`

存储规则：

- 以月份 `YYYY-MM` 作为主要查询字段
- 保存标准化账单和异常记录
- 保存上传文件名、上传时间、支出笔数、总支出、异常记录数
- 同月份重复保存前必须弹出覆盖确认

IndexedDB 只保存到当前浏览器，不上传服务器，不跨设备同步。

## 弹框明细筛选逻辑

点击金额时传入筛选条件：

| 点击位置 | 筛选条件 |
| --- | --- |
| 月总支出 | month |
| 一级金额 | month + primaryCategory |
| 二级金额 | month + primaryCategory + secondaryCategory |

筛选结果用于弹框展示，并计算：

- 明细笔数
- 明细合计金额

## 后续扩展到后端和数据库

后续如果需要云端能力，可以扩展为：

- 前端继续使用 React
- 后端新增 Node.js / NestJS 或 ASP.NET Core
- 数据库使用 PostgreSQL 或 MySQL
- 文件上传后由后端解析并保存
- 用户登录后按账号隔离账单数据
- 本地计算函数迁移或复用到后端服务

## 第一版暂不做内容

- 登录注册
- 多用户
- 云端同步
- 后端接口
- 权限系统
- 复杂图表
- 自动分类训练

---

# 第二版技术方案：本地增强版（待确认）

## 第二版技术方案目标

第二版继续使用纯前端本地方案，不引入后端、账号登录和云端数据库。

第二版重点是：

1. 新增设置能力
2. 新增账单大类预算
3. 新增独立购物预算
4. 新增本地数据导出 / 导入
5. 优化重复月份账单覆盖确认
6. 在月度分析页联动预算状态

## 第二版技术栈选择

继续沿用第一版技术栈：

| 模块 | 方案 | 第二版用途 |
| --- | --- | --- |
| React + TypeScript | 保持不变 | 页面和组件开发 |
| Vite | 保持不变 | 本地开发和构建 |
| Ant Design | 保持不变 | 表格、表单、弹框、按钮、提示 |
| xlsx | 保持不变 | 账单 Excel / CSV 解析 |
| Recharts | 保持不变 | 如后续需要预算图表可复用 |
| IndexedDB | 保持不变 | 保存账单、设置、预算、购物预算 |

第二版不新增后端技术栈。

## 新增目录结构建议

```text
src/
├─ components/
│  ├─ BudgetManager/
│  │  ├─ BudgetSettingsPanel.tsx
│  │  ├─ MonthlyBudgetOverview.tsx
│  │  ├─ MonthlyCategoryBudgetTable.tsx
│  │  ├─ CopyBudgetModal.tsx
│  │  ├─ MonthlyBudgetSettlement.tsx
│  │  └─ ShoppingBudgetTable.tsx
│  ├─ Settings/
│  │  ├─ IncomeSettingsPanel.tsx
│  │  ├─ DataExportPanel.tsx
│  │  ├─ DataImportPanel.tsx
│  │  └─ ImportConfirmModal.tsx
│  └─ UploadBill/
│     └─ OverwriteBillModal.tsx
├─ pages/
│  ├─ BudgetPage.tsx
│  └─ SettingsPage.tsx
├─ types/
│  ├─ budget.ts
│  └─ settings.ts
├─ utils/
│  ├─ budgetStorage.ts
│  ├─ settingsStorage.ts
│  ├─ backupStorage.ts
│  ├─ calculateBudget.ts
│  └─ budgetFormat.ts
```

说明：

- 预算相关类型放在 `types/budget.ts`。
- 设置相关类型放在 `types/settings.ts`。
- 预算计算逻辑放在 `utils/calculateBudget.ts`，不写进页面组件。
- 本地保存逻辑按业务拆成 `budgetStorage.ts`、`settingsStorage.ts`、`backupStorage.ts`。

## 第二版数据流转

### 默认月收入设置

1. 设置页读取 `userSettings`
2. 用户修改默认月收入
3. 保存到 IndexedDB
4. 月度分析页读取默认月收入
5. 月度汇总、占收入比例、结余率重新计算

### 账单大类预算

1. 预算管理页选择月份
2. 系统读取该月账单和该月大类预算
3. 系统根据一级分类名称计算已支出金额
4. 系统计算剩余预算、预算使用率、预算状态
5. 页面展示大类预算表和月度预算总览
6. 月度分析页读取同一套预算计算结果
7. 一级分类金额根据预算状态显示提醒色或标红

### 独立购物预算

1. 页面读取购物预算明细
2. 用户新增、修改、删除购物预算行
3. 保存到 IndexedDB
4. 系统计算实际购买小计、品类剩余预算、合计行
5. 页面展示计算结果

购物预算不读取账单数据。

### 导出 / 导入

导出：

1. 读取设置、总预算、大类预算、购物预算、月度账单
2. 组装成 JSON 备份对象
3. 生成本地下载文件

导入：

1. 用户选择 JSON 文件
2. 解析文件内容
3. 校验 `appName` 和 `schemaVersion`
4. 校验关键字段是否存在
5. 弹出导入确认
6. 用户确认后整包覆盖 IndexedDB 数据

## 新增类型建议

### UserSettings

```ts
interface UserSettings {
  id: 'user-settings';
  defaultMonthlyIncome: number;
  currency: 'CNY';
  updatedAt: string;
}
```

### BudgetSettings

```ts
interface BudgetSettings {
  id: 'budget-settings';
  annualExpenseBudget: number;
  monthlySavingTarget: number;
  monthlyExpenseBudget: number;
  updatedAt: string;
}
```

### MonthlyCategoryBudget

```ts
type BudgetStatus = 'normal' | 'warning' | 'over' | 'unmatched';

interface MonthlyCategoryBudget {
  id: string;
  month: string;
  categoryName: string;
  budgetAmount: number;
  overBudgetNote: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}
```

说明：

- `spentAmount`、`remainingAmount`、`usageRate`、`status` 建议作为计算结果，不直接作为用户编辑字段。
- 如果为了页面缓存可以临时存储，但最终展示前仍应重新计算。

### ShoppingBudgetItem

```ts
type ShoppingBudgetStatus = 'planned' | 'purchased' | 'paused' | 'abandoned';
type ShoppingBudgetPriority = 'must' | 'should' | 'optional' | 'not_now';

interface ShoppingBudgetItem {
  id: string;
  categoryName: string;
  itemName: string;
  plannedQuantity: number;
  purchasedQuantity: number;
  quantityUnit: string;
  budgetAmount: number;
  actualUnitAmount: number;
  purchasedItem: string;
  recommendedPlan: string;
  status: ShoppingBudgetStatus;
  priority: ShoppingBudgetPriority;
  remark: string;
  createdAt: string;
  updatedAt: string;
}
```

### BackupFile

```ts
interface BackupFile {
  appName: 'expense-bill-analyzer';
  schemaVersion: 2;
  exportedAt: string;
  userSettings: UserSettings;
  budgetSettings: BudgetSettings;
  monthlyCategoryBudgets: MonthlyCategoryBudget[];
  shoppingBudgetItems: ShoppingBudgetItem[];
  monthlyBills: MonthlyBill[];
}
```

## 新增计算函数建议

放在 `utils/calculateBudget.ts`。

```text
calculateMonthlyCategoryBudgetRows
calculateMonthlyBudgetOverview
calculateMonthlyBudgetSettlement
calculateShoppingBudgetRows
calculateShoppingBudgetSummary
getBudgetStatusByUsageRate
getCategoryOptionsFromMonthlyBill
mergeBudgetStatusIntoPrimaryRows
mergeBudgetStatusIntoCombinedRows
```

### 账单大类预算计算

输入：

- 当前月份
- 月度大类预算
- 当前月份账单记录

输出：

- 大类预算金额
- 已支出金额
- 剩余预算金额
- 预算使用率
- 状态

### 购物预算计算

输入：

- 购物预算明细

输出：

- 实际购买小计
- 品类剩余预算
- 行是否超支
- 合计行

## 新增存储函数建议

### settingsStorage.ts

```text
getUserSettings
saveUserSettings
getBudgetSettings
saveBudgetSettings
```

### budgetStorage.ts

```text
getMonthlyCategoryBudgets
saveMonthlyCategoryBudget
saveMonthlyCategoryBudgets
deleteMonthlyCategoryBudget
copyMonthlyCategoryBudgets
getShoppingBudgetItems
saveShoppingBudgetItem
saveShoppingBudgetItems
deleteShoppingBudgetItem
```

### backupStorage.ts

```text
exportLocalData
validateBackupFile
importLocalData
```

## IndexedDB 方案

继续使用 IndexedDB。

第二版建议新增对象仓库：

| store | keyPath | 说明 |
| --- | --- | --- |
| userSettings | id | 默认月收入 |
| budgetSettings | id | 总预算设置 |
| monthlyCategoryBudgets | id | 月度大类预算 |
| shoppingBudgetItems | id | 独立购物预算 |

已有 `monthlyBills` 继续保留，用于账单数据。

如果当前 `billStorage.ts` 已经封装数据库打开逻辑，第二版优先扩展现有封装，不重新写一套 IndexedDB 工具。

## 覆盖确认技术方案

在数据预览页保存账单前：

1. 调用 `checkMonthlyBillExists(month)`
2. 如果不存在，直接保存
3. 如果存在，读取旧账单摘要
4. 生成本次上传摘要
5. 打开 `OverwriteBillModal`
6. 用户确认后调用保存覆盖
7. 覆盖成功后重新计算该月大类预算

第二版不实现账单合并。

## 月度分析预算联动技术方案

月度分析页渲染表格前：

1. 读取当前月份账单
2. 读取当前月份大类预算
3. 计算一级分类表
4. 调用 `mergeBudgetStatusIntoPrimaryRows`
5. 调用 `mergeBudgetStatusIntoCombinedRows`
6. 表格根据 `budgetStatus` 控制金额颜色
7. 点击金额时，把预算信息传给明细弹框

弹框继续使用现有明细筛选逻辑，只新增预算信息展示区。

## 导出 / 导入技术方案

### 导出

使用浏览器原生能力生成文件：

1. `JSON.stringify` 备份对象
2. 创建 `Blob`
3. 创建下载链接
4. 触发下载

文件名建议：

```text
expense-bill-analyzer-backup-YYYYMMDD-HHmm.json
```

### 导入

1. 使用文件选择框读取 JSON
2. `JSON.parse`
3. 校验结构
4. 二次确认
5. 清空并写入相关 IndexedDB store

导入失败时不能清空旧数据。

## 兼容性和迁移

已有第一版本地账单数据需要继续可用。

第二版新增 store 后：

- 如果没有用户设置，创建默认设置，默认月收入 9000
- 如果没有总预算设置，创建默认总预算，金额为 0
- 如果没有预算数据，预算管理页显示空状态
- 第一版已保存账单不需要迁移，只需要补充摘要字段时可按现有记录计算

## 第二版验证方案

开发完成后需要验证：

1. `npm run build` 通过
2. 默认月收入修改后，月度分析计算变化
3. 新增大类预算后，能按账单一级分类反写已支出
4. 超支时一级分类金额标红
5. 复制月份预算后，目标月份按目标账单重新计算
6. 独立购物预算不读取账单数据
7. 导出 JSON 后能在同一浏览器导入恢复
8. 导入错误文件不会覆盖当前数据
9. 重复月份上传时显示覆盖确认

## 第二版暂不做内容

- 后端
- 登录
- 云端数据库
- 自动云端同步
- 账单合并
- 购物预算和账单自动匹配
- 未设置预算的大类提醒
