# Expense Bill Analyzer

消费账单分析工具。

用户上传 iCost 导出的 Excel 或 CSV 账单后，系统解析账单数据，并生成月度汇总、一级分类、二级分类、一级 + 二级综合分析表。

## 当前阶段

当前项目已完成设计文档确认和前端基础框架搭建。

当前已经具备：

- React + TypeScript + Vite 基础项目
- Ant Design 页面壳子
- 账单管理页
- 上传页
- 数据预览页
- 月度分析页
- 图表、表格、异常数据、明细弹框静态组件

账单解析、标准化、统计计算、IndexedDB 保存等业务功能尚未实现。

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

构建检查：

```bash
npm run build
```

## 目录结构

```text
expense-bill-analyzer/
├─ AGENTS.md
├─ index.html
├─ package.json
├─ docs/
│  ├─ 01_PRD.md
│  ├─ 02_DATA_MODEL.md
│  ├─ 03_UI_FLOW.md
│  ├─ 04_TECH_PLAN.md
│  └─ 05_TASK_BREAKDOWN.md
├─ src/
│  ├─ components/
│  ├─ constants/
│  ├─ mock/
│  ├─ pages/
│  ├─ types/
│  ├─ utils/
│  ├─ App.tsx
│  └─ main.tsx
└─ README.md
```

## 文档说明

- `docs/01_PRD.md`：产品需求文档
- `docs/02_DATA_MODEL.md`：数据模型与统计口径
- `docs/03_UI_FLOW.md`：页面与交互流程
- `docs/04_TECH_PLAN.md`：技术方案
- `docs/05_TASK_BREAKDOWN.md`：任务拆解
