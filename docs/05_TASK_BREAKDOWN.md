# 05 Task Breakdown

## 拆解原则

任务必须拆小，不允许一次性大改。

每个任务需要说明：

- 任务编号
- 任务名称
- 目标
- 影响文件
- 验收标准
- 是否需要用户确认

## Phase 1：设计文档确认

### T001：确认 PRD

- 目标：确认产品目标、核心流程、验收标准
- 影响文件：`docs/01_PRD.md`
- 验收标准：用户确认 PRD 内容无明显遗漏
- 是否需要确认：是

### T002：确认数据模型

- 目标：确认字段、统计口径、公式和异常数据处理方式
- 影响文件：`docs/02_DATA_MODEL.md`
- 验收标准：用户确认统计口径和公式正确
- 是否需要确认：是

### T003：确认 UI 流程

- 目标：确认页面、表格字段、点击金额查看明细流程
- 影响文件：`docs/03_UI_FLOW.md`
- 验收标准：用户确认页面和交互流程符合预期
- 是否需要确认：是

### T004：确认技术方案

- 目标：确认技术栈、目录结构和数据流转方式
- 影响文件：`docs/04_TECH_PLAN.md`
- 验收标准：用户确认技术方案可以进入框架搭建
- 是否需要确认：是

## Phase 2：框架搭建

只有用户明确说“开始搭建框架”后才执行。

### T005：初始化 Vite 项目

- 目标：创建 React + TypeScript 项目基础
- 影响文件：`package.json`、`src/main.tsx`、`src/App.tsx`
- 验收标准：项目可以本地启动
- 是否需要确认：是

### T006：安装基础依赖

- 目标：安装表格、文件解析、图表、本地存储等依赖
- 影响文件：`package.json`
- 验收标准：依赖安装成功，无明显版本冲突
- 是否需要确认：是

### T007：创建基础目录结构

- 目标：创建组件、页面、类型、工具函数目录
- 影响文件：`src/components`、`src/pages`、`src/types`、`src/utils`
- 验收标准：目录结构和技术方案一致
- 是否需要确认：否

### T008：创建空页面和基础路由

- 目标：创建上传页、账单管理页、预览页、分析页壳子
- 影响文件：`src/pages/*`、`src/App.tsx`
- 验收标准：页面能切换，暂不实现业务逻辑
- 是否需要确认：是

### T009：创建基础类型定义和 mock 数据

- 目标：先用假数据支撑页面和表格壳子
- 影响文件：`src/types/bill.ts`、`src/mock/bills.ts`
- 验收标准：类型清晰，mock 数据能覆盖主要字段
- 是否需要确认：否

### T010：创建基础表格和弹框壳子

- 目标：先搭建表格组件和明细弹框组件结构
- 影响文件：`src/components/AnalysisTables/*`、`src/components/DetailModal/*`
- 验收标准：页面能显示静态表格和空弹框
- 是否需要确认：是

### T011：创建账单管理、图表和异常表壳子

- 目标：创建账单管理列表、图表区域、异常数据表的静态组件结构
- 影响文件：`src/components/BillManager/*`、`src/components/AnalysisCharts/*`、`src/components/AbnormalTable/*`
- 验收标准：页面能显示静态账单管理列表、图表占位和异常数据表
- 是否需要确认：是

## Phase 3：业务功能实现

只有用户明确说“开始实现业务功能”后才执行。

### T012：Excel 上传与解析

- 目标：支持上传 iCost Excel 或 CSV 并读取数据
- 影响文件：`src/components/UploadBill/*`、`src/utils/parseBillFile.ts`
- 验收标准：能读取文件并展示原始数据预览
- 是否需要确认：是

### T013：原始账单标准化

- 目标：把原始账单转换成标准账单结构
- 影响文件：`src/utils/normalizeBill.ts`、`src/types/bill.ts`
- 验收标准：能识别日期、金额、分类、类型等字段
- 是否需要确认：是

### T014：异常数据识别和展示

- 目标：识别日期、金额、类型等异常数据，并在预览页单独展示
- 影响文件：`src/utils/normalizeBill.ts`、`src/components/AbnormalTable/*`、`src/pages/PreviewPage.tsx`
- 验收标准：异常数据能显示原因，且不参与支出统计
- 是否需要确认：是

### T015：IndexedDB 本地账单保存

- 目标：把确认后的月份账单保存到浏览器本地
- 影响文件：`src/utils/billStorage.ts`、`src/pages/PreviewPage.tsx`、`src/pages/BillManagerPage.tsx`
- 验收标准：刷新页面后仍能看到已保存月份，同月份重复上传会提示覆盖
- 是否需要确认：是

### T016：月度汇总计算

- 目标：计算月收入、月总支出、结余、结余率
- 影响文件：`src/utils/calculateSummary.ts`
- 验收标准：月度合计和原始支出明细能对上
- 是否需要确认：是

### T017：一级分类表计算

- 目标：按一级分类统计金额、占比、笔数
- 影响文件：`src/utils/calculateSummary.ts`
- 验收标准：一级分类金额合计等于月总支出
- 是否需要确认：是

### T018：二级分类表计算

- 目标：按一级 + 二级分类统计金额、占比、笔数
- 影响文件：`src/utils/calculateSummary.ts`
- 验收标准：二级分类金额合计等于月总支出
- 是否需要确认：是

### T019：一级 + 二级综合表计算

- 目标：生成综合表，并保证字段顺序符合要求
- 影响文件：`src/utils/calculateSummary.ts`、`src/components/AnalysisTables/*`
- 验收标准：字段顺序正确，占比公式正确
- 是否需要确认：是

### T020：图表数据计算和展示

- 目标：生成月度总支出趋势图、一级分类占比图、二级分类排行图
- 影响文件：`src/utils/calculateCharts.ts`、`src/components/AnalysisCharts/*`、`src/pages/AnalysisPage.tsx`
- 验收标准：图表数据和表格统计金额一致
- 是否需要确认：是

### T021：点击金额弹出明细

- 目标：点击总支出、一级金额、二级金额时展示对应明细
- 影响文件：`src/components/DetailModal/*`、`src/pages/AnalysisPage.tsx`
- 验收标准：弹框合计金额和点击金额一致
- 是否需要确认：是

### T022：表格排序和筛选

- 目标：支持按金额排序和月份切换
- 影响文件：`src/components/AnalysisTables/*`、`src/pages/AnalysisPage.tsx`
- 验收标准：排序正确，切换月份后数据正确
- 是否需要确认：是

### T023：页面美化

- 目标：让页面更清晰易用
- 影响文件：页面和组件样式相关文件
- 验收标准：核心信息清楚，操作入口明显
- 是否需要确认：是

### T024：测试和修复

- 目标：使用样例账单验证计算结果
- 影响文件：按问题实际涉及文件
- 验收标准：金额合计、占比、明细弹框、异常列表、本地保存、图表都正确
- 是否需要确认：是

---

# 第二版任务拆解：本地增强版（待确认）

## 第二版拆解原则

第二版不一次性大改。

实现顺序建议：

1. 先补类型和存储
2. 再补计算函数
3. 再做设置页
4. 再做预算管理页
5. 再联动月度分析
6. 最后做导出导入和整体验证

## Phase 4：第二版设计确认

### T025：确认第二版 PRD

- 目标：确认第二版本地增强版范围
- 影响文件：`docs/01_PRD.md`
- 验收标准：用户确认默认月收入、账单大类预算、购物预算、导出导入、重复上传优化都符合预期
- 是否需要确认：是

### T026：确认第二版数据模型

- 目标：确认用户设置、预算设置、大类预算、购物预算、导出导入结构
- 影响文件：`docs/02_DATA_MODEL.md`
- 验收标准：用户确认账单大类预算和购物预算的数据边界正确
- 是否需要确认：是

### T027：确认第二版页面与交互

- 目标：确认设置页、预算管理页、月度结算视图、覆盖确认弹窗等交互
- 影响文件：`docs/03_UI_FLOW.md`
- 验收标准：用户确认页面流程符合使用习惯
- 是否需要确认：是

### T028：确认第二版技术方案

- 目标：确认技术拆分、目录结构、存储方案、计算函数和验证方案
- 影响文件：`docs/04_TECH_PLAN.md`
- 验收标准：用户确认可以进入实现准备
- 是否需要确认：是

### T029：确认第二版任务拆解

- 目标：确认第二版实现任务顺序和验收口径
- 影响文件：`docs/05_TASK_BREAKDOWN.md`
- 验收标准：用户确认后，才进入代码实现
- 是否需要确认：是

## Phase 5：第二版实现准备

只有用户明确说“开始实现业务功能”后才执行。

### T030：创建第二版开发分支

- 目标：避免直接在正式版 `main` 上开发
- 影响文件：Git 分支
- 验收标准：当前分支切换到第二版功能分支
- 是否需要确认：是

### T031：补充第二版类型定义

- 目标：新增设置、预算、购物预算、导出备份相关类型
- 影响文件：`src/types/budget.ts`、`src/types/settings.ts`、`src/types/bill.ts`
- 验收标准：类型能覆盖第二版数据模型，不破坏第一版类型
- 是否需要确认：否

### T032：扩展 IndexedDB 存储结构

- 目标：新增用户设置、总预算设置、月度大类预算、购物预算 store
- 影响文件：`src/utils/billStorage.ts`、`src/utils/settingsStorage.ts`、`src/utils/budgetStorage.ts`
- 验收标准：旧账单数据仍可读取，新 store 可正常读写
- 是否需要确认：是

### T033：实现默认数据初始化

- 目标：没有设置数据时自动创建默认月收入 9000 和空预算设置
- 影响文件：`src/utils/settingsStorage.ts`、`src/utils/budgetStorage.ts`
- 验收标准：新浏览器首次打开不会报错，默认月收入为 9000
- 是否需要确认：否

## Phase 6：第二版计算逻辑

### T034：实现预算计算函数

- 目标：实现大类预算已支出、剩余、使用率、状态计算
- 影响文件：`src/utils/calculateBudget.ts`
- 验收标准：给定账单和预算，能正确算出 normal、warning、over、unmatched
- 是否需要确认：是

### T035：实现购物预算计算函数

- 目标：实现实际购买小计、品类剩余预算、购物预算合计
- 影响文件：`src/utils/calculateBudget.ts`
- 验收标准：同品类多行时，品类剩余预算计算正确
- 是否需要确认：是

### T036：实现月度预算总览计算

- 目标：计算月收入、月总支出预算、当前已支出、剩余预算、预计可攒金额
- 影响文件：`src/utils/calculateBudget.ts`
- 验收标准：有账单和无账单两种状态都能正确显示
- 是否需要确认：是

### T037：实现月度结算计算

- 目标：计算总预算是否超支、攒钱目标是否达成、超支大类、剩余最多大类
- 影响文件：`src/utils/calculateBudget.ts`
- 验收标准：月度结算数据和大类预算表一致
- 是否需要确认：是

### T038：实现预算状态合并到分析表

- 目标：把大类预算状态合并到一级分类表和一级 + 二级综合表
- 影响文件：`src/utils/calculateBudget.ts`、`src/utils/calculateSummary.ts`
- 验收标准：未设置预算不标红，超预算分类金额标红
- 是否需要确认：是

## Phase 7：设置页和导入导出

### T039：创建设置页

- 目标：新增设置页入口和页面结构
- 影响文件：`src/pages/SettingsPage.tsx`、`src/App.tsx`、样式文件
- 验收标准：可以从导航进入设置页
- 是否需要确认：是

### T040：实现默认月收入设置

- 目标：设置页可以保存默认月收入
- 影响文件：`src/components/Settings/IncomeSettingsPanel.tsx`、`src/utils/settingsStorage.ts`
- 验收标准：刷新后默认月收入不丢失
- 是否需要确认：是

### T041：实现本地数据导出

- 目标：导出设置、预算、购物预算、账单为 JSON 文件
- 影响文件：`src/components/Settings/DataExportPanel.tsx`、`src/utils/backupStorage.ts`
- 验收标准：可以下载 JSON 备份文件，内容包含第二版要求的数据
- 是否需要确认：是

### T042：实现本地数据导入

- 目标：导入 JSON 备份文件并整包覆盖本地数据
- 影响文件：`src/components/Settings/DataImportPanel.tsx`、`src/components/Settings/ImportConfirmModal.tsx`、`src/utils/backupStorage.ts`
- 验收标准：正确文件可导入，错误文件不破坏当前数据
- 是否需要确认：是

## Phase 8：预算管理页

### T043：创建预算管理页

- 目标：新增预算管理页入口和页面结构
- 影响文件：`src/pages/BudgetPage.tsx`、`src/App.tsx`、样式文件
- 验收标准：可以从导航进入预算管理页
- 是否需要确认：是

### T044：实现总预算设置区

- 目标：维护年支出总预算、月攒钱预算、月总支出预算
- 影响文件：`src/components/BudgetManager/BudgetSettingsPanel.tsx`、`src/utils/settingsStorage.ts`
- 验收标准：刷新后设置不丢失
- 是否需要确认：是

### T045：实现月份选择和月度预算总览

- 目标：展示月收入、月总支出预算、当前已支出、剩余预算、攒钱目标状态
- 影响文件：`src/components/BudgetManager/MonthlyBudgetOverview.tsx`、`src/pages/BudgetPage.tsx`
- 验收标准：切换月份后总览数据正确变化
- 是否需要确认：是

### T046：实现月度大类预算表

- 目标：新增、修改、删除每月大类预算
- 影响文件：`src/components/BudgetManager/MonthlyCategoryBudgetTable.tsx`、`src/utils/budgetStorage.ts`
- 验收标准：预算行可增删改，删除前二次确认
- 是否需要确认：是

### T047：实现从账单一级分类选择大类

- 目标：大类名称支持从当月账单一级分类中选择
- 影响文件：`src/components/BudgetManager/MonthlyCategoryBudgetTable.tsx`、`src/utils/calculateBudget.ts`
- 验收标准：选择账单分类后能自动反写已支出和剩余预算
- 是否需要确认：是

### T048：实现复制月份预算

- 目标：把某月预算复制到另一月份
- 影响文件：`src/components/BudgetManager/CopyBudgetModal.tsx`、`src/utils/budgetStorage.ts`
- 验收标准：复制后目标月份按目标账单重新计算，不复制旧月份已支出
- 是否需要确认：是

### T049：实现月度结算视图

- 目标：展示总预算状态、攒钱目标、超支大类、剩余最多大类
- 影响文件：`src/components/BudgetManager/MonthlyBudgetSettlement.tsx`
- 验收标准：结算视图和大类预算表数据一致
- 是否需要确认：是

### T050：实现独立购物预算表

- 目标：新增、修改、删除购物预算明细
- 影响文件：`src/components/BudgetManager/ShoppingBudgetTable.tsx`、`src/utils/budgetStorage.ts`
- 验收标准：购物预算不读取账单，计算小计、剩余和合计正确
- 是否需要确认：是

## Phase 9：账单保存和月度分析联动

### T051：优化重复月份覆盖确认

- 目标：保存同月份账单前展示旧账单和新账单摘要对比
- 影响文件：`src/pages/PreviewPage.tsx`、`src/components/UploadBill/OverwriteBillModal.tsx`、`src/utils/billStorage.ts`
- 验收标准：重复月份只能覆盖或取消，不提供合并
- 是否需要确认：是

### T052：扩展账单管理页摘要字段

- 目标：展示原始行数、有效支出行数、异常行数
- 影响文件：`src/pages/BillManagerPage.tsx`、`src/components/BillManager/*`
- 验收标准：账单管理页能看到新增摘要字段
- 是否需要确认：是

### T053：月度分析读取默认月收入

- 目标：月度分析不再固定使用 9000，而是读取用户设置
- 影响文件：`src/pages/AnalysisPage.tsx`、`src/utils/calculateSummary.ts`
- 验收标准：修改默认月收入后，结余和占收入比例变化
- 是否需要确认：是

### T054：一级分类金额预算状态显示

- 目标：一级分类金额根据预算状态显示正常、提醒、标红
- 影响文件：`src/components/AnalysisTables/*`、`src/pages/AnalysisPage.tsx`
- 验收标准：超预算大类金额标红，未设置预算不标红
- 是否需要确认：是

### T055：消费明细弹框增加预算信息

- 目标：点击一级分类金额时，在明细弹框显示预算、已支出、剩余或超出金额
- 影响文件：`src/components/DetailModal/*`、`src/pages/AnalysisPage.tsx`
- 验收标准：弹框预算信息和预算管理页一致
- 是否需要确认：是

## Phase 10：第二版整体验证

### T056：验证默认月收入

- 目标：确认默认月收入设置影响月度分析
- 影响文件：按问题实际涉及文件
- 验收标准：设置不同收入后，占收入比例、结余、结余率正确
- 是否需要确认：是

### T057：验证账单大类预算

- 目标：确认预算和账单按月份 + 一级分类名称正确匹配
- 影响文件：按问题实际涉及文件
- 验收标准：已支出、剩余、使用率、超支状态正确
- 是否需要确认：是

### T058：验证独立购物预算

- 目标：确认购物预算独立计算，不受账单影响
- 影响文件：按问题实际涉及文件
- 验收标准：小计、品类剩余、合计行正确
- 是否需要确认：是

### T059：验证导出 / 导入

- 目标：确认导出文件可恢复当前本地数据
- 影响文件：按问题实际涉及文件
- 验收标准：导入后设置、预算、账单恢复一致；错误文件不覆盖数据
- 是否需要确认：是

### T060：运行构建验证

- 目标：确认第二版代码能正常构建
- 影响文件：无固定文件
- 验收标准：`npm run build` 通过
- 是否需要确认：否

### T061：更新 ROADMAP

- 目标：实现和验证完成后同步项目真实进度
- 影响文件：`ROADMAP.md`
- 验收标准：只把已实现且验证通过的事项写入已完成
- 是否需要确认：否
