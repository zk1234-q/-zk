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
| 图表 | Recharts 或 ECharts | 后续增加图表时使用，第一版可先不接入 |
| 本地存储 | localStorage 或 IndexedDB | 第一版数据量小可用 localStorage，后续大数据量再换 IndexedDB |
| 样式 | Ant Design | 和表格、弹框组件一致，降低样式成本 |

## 推荐选择

第一版建议使用：

- React + TypeScript
- Vite
- Ant Design
- xlsx
- React Context
- localStorage

原因：

- 对新手更友好
- 组件开箱即用
- 不需要自己写复杂表格和弹框样式
- 后续如果数据量变大，再切换 IndexedDB 和更强状态管理

## 项目目录结构

```text
expense-bill-analyzer/
├─ docs/
├─ src/
│  ├─ components/
│  │  ├─ UploadBill/
│  │  ├─ DataPreview/
│  │  ├─ AnalysisTables/
│  │  └─ DetailModal/
│  ├─ pages/
│  │  ├─ UploadPage.tsx
│  │  ├─ PreviewPage.tsx
│  │  └─ AnalysisPage.tsx
│  ├─ types/
│  │  └─ bill.ts
│  ├─ utils/
│  │  ├─ parseBillFile.ts
│  │  ├─ normalizeBill.ts
│  │  ├─ calculateSummary.ts
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
5. 过滤出计入统计的支出记录
6. 根据月份、一级分类、二级分类计算表格数据
7. 页面展示分析结果
8. 点击金额时，根据当前月份和分类条件筛选明细

## 文件上传解析流程

1. 读取用户选择的文件
2. 判断文件类型
3. 使用 `xlsx` 解析第一张表
4. 转换为 JSON 数组
5. 识别字段名
6. 生成原始账单预览
7. 转换为标准账单
8. 标记异常记录

## 表格计算逻辑

计算逻辑必须放在独立函数中，不直接写在页面组件里。

建议拆分为：

- `calculateMonthlySummary`
- `calculatePrimaryCategoryRows`
- `calculateSecondaryCategoryRows`
- `calculateCombinedCategoryRows`

页面只负责：

- 接收数据
- 调用计算函数
- 渲染表格
- 处理点击事件

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
