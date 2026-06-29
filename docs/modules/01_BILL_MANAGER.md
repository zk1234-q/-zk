# Module: Bill Manager

## 模块目标

账单管理模块负责管理 iCost 账单导入和本地保存。

用户真实流程：

```text
账单管理 -> 上传账单 -> 数据预览 -> 保存 -> 月度分析
```

## V2.1 调整

- `上传账单` 不再作为左侧常驻菜单。
- `数据预览` 不再作为左侧常驻菜单。
- 上传入口保留在账单管理页和顶部主按钮。
- 数据预览只作为上传后的流程页。

## 当前能力

- 上传 Excel / CSV。
- 标准化账单记录。
- 展示异常记录。
- 按月份保存本地账单。
- 同月份重复上传时展示覆盖确认。

## 数据

主要数据类型：

- `MonthlyBill`
- `StandardBillRecord`
- `AbnormalBillRecord`
- `ParsedBillFile`

详见 `docs/90_DATA_MODEL.md`。

## 后续云端预留

账单管理以后应通过 `billRepository` 访问数据。

页面不应直接调用 IndexedDB 具体实现。

目标接口示例：

```text
billRepository.getAllMonthlyBills()
billRepository.getMonthlyBill(month)
billRepository.saveMonthlyBill(bill)
billRepository.deleteMonthlyBill(month)
```

本地版使用 `localBillRepository`，云端版可替换为 `remoteBillRepository`。

## 验收标准

- 左侧菜单只保留核心模块入口。
- 可以从账单管理进入上传流程。
- 上传后能进入数据预览。
- 保存后能进入对应月份月度分析。
- 重复月份仍然只能覆盖或取消，不做合并。
