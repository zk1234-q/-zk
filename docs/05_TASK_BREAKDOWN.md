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
