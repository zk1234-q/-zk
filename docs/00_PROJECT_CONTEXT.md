# Project Context

## 项目定位

`账单管理分析系统` 是一个本地优先的个人账单与财务管理工具。

当前核心用途：

- 导入 iCost 导出的 Excel / CSV 账单。
- 按月份保存账单。
- 查看月度支出、分类占比、图表和消费明细。
- 管理月度预算和独立购物预算。
- 后续扩展资产总览和目标管理。

## 当前阶段

当前进入 `V2.1 架构治理 + 第二版验收修复` 文档整理阶段。

V2.1 目标：

- 把大文档拆成模块文档。
- 新增 AI 短上下文文件。
- 为后续云端化预留数据服务接口。
- 修复第二版测试反馈中的导航、命名、月度汇总排序和界面质感问题。

## 边界

V2.1 不直接做云端，不引入账号、登录、后端数据库。

V2.1 只做架构治理和当前已确认的验收修复。资产总览和目标管理属于后续版本。

## 文档规则

从 V2.1 开始，新需求优先写入模块文档：

- `docs/modules/01_BILL_MANAGER.md`
- `docs/modules/02_ANALYSIS.md`
- `docs/modules/03_BUDGET.md`
- `docs/modules/04_ASSET.md`
- `docs/modules/05_GOAL.md`
- `docs/modules/06_SETTINGS.md`

旧文档 `01_PRD.md` 到 `05_TASK_BREAKDOWN.md` 保留为历史资料。

如果新模块文档和旧文档冲突，以用户最新确认的模块文档为准。

## 技术原则

- 前端继续使用 React + TypeScript + Ant Design。
- 本地存储继续使用 IndexedDB。
- 计算逻辑必须独立在 `utils/calculate*.ts`。
- 存储逻辑必须通过 repository/service 封装，页面不直接关心 IndexedDB。
- 新模块必须先设计数据模型和页面流程，再实现代码。
