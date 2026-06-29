import { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Input, InputNumber, Modal, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { TableColumnsType } from 'antd';
import type { MonthlyBill } from '../types/bill';
import type { MonthlyCategoryBudget, MonthlyCategoryBudgetRow, ShoppingBudgetItem, ShoppingBudgetRow } from '../types/budget';
import type { BudgetSettings, UserSettings } from '../types/settings';
import {
  calculateMonthlyBudgetOverview,
  calculateMonthlyBudgetSettlement,
  calculateMonthlyCategoryBudgetRows,
  calculateShoppingBudgetRows,
  calculateShoppingBudgetSummary,
  getCategoryOptionsFromMonthlyBill,
  normalizeCategoryName,
} from '../utils/calculateBudget';
import { budgetRepository } from '../repositories/budgetRepository';
import { formatAmount, formatPercent } from '../utils/format';
import { settingsRepository } from '../repositories/settingsRepository';

interface BudgetPageProps {
  monthlyBills: MonthlyBill[];
}

const STATUS_LABELS: Record<MonthlyCategoryBudgetRow['status'], { text: string; color: string }> = {
  normal: { text: '正常', color: 'green' },
  warning: { text: '接近预算', color: 'gold' },
  over: { text: '已超支', color: 'red' },
  unmatched: { text: '未匹配', color: 'default' },
};

export default function BudgetPage({ monthlyBills }: BudgetPageProps) {
  const [userSettings, setUserSettings] = useState<UserSettings>(settingsRepository.createDefaultUserSettings());
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(settingsRepository.createDefaultBudgetSettings());
  const [selectedMonth, setSelectedMonth] = useState<string>(monthlyBills[0]?.month ?? getCurrentMonth());
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyCategoryBudget[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingBudgetItem[]>([]);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copySourceMonth, setCopySourceMonth] = useState<string>();
  const [copyTargetMonth, setCopyTargetMonth] = useState<string>(getCurrentMonth());

  const currentBill = monthlyBills.find((bill) => bill.month === selectedMonth);
  const monthOptions = useMemo(() => buildMonthOptions(monthlyBills, monthlyBudgets), [monthlyBills, monthlyBudgets]);
  const categoryOptions = getCategoryOptionsFromMonthlyBill(currentBill);
  const budgetRows = calculateMonthlyCategoryBudgetRows(monthlyBudgets, currentBill);
  const overview = calculateMonthlyBudgetOverview(selectedMonth, currentBill, userSettings, budgetSettings);
  const settlement = calculateMonthlyBudgetSettlement(selectedMonth, budgetRows, overview);
  const shoppingRows = calculateShoppingBudgetRows(shoppingItems);
  const shoppingSummary = calculateShoppingBudgetSummary(shoppingRows);

  useEffect(() => {
    void Promise.all([settingsRepository.getUserSettings(), settingsRepository.getBudgetSettings(), budgetRepository.getShoppingBudgetItems()]).then(([nextUserSettings, nextBudgetSettings, nextShoppingItems]) => {
      setUserSettings(nextUserSettings);
      setBudgetSettings(nextBudgetSettings);
      setShoppingItems(nextShoppingItems);
    });
  }, []);

  useEffect(() => {
    void budgetRepository.getMonthlyCategoryBudgets(selectedMonth).then(setMonthlyBudgets);
  }, [selectedMonth]);

  const saveBudgetSettingsAndState = async (nextSettings: BudgetSettings) => {
    setBudgetSettings(nextSettings);
    await settingsRepository.saveBudgetSettings(nextSettings);
  };

  const upsertMonthlyBudget = async (budget: MonthlyCategoryBudget) => {
    const nextBudget = { ...budget, categoryName: normalizeCategoryName(budget.categoryName), updatedAt: new Date().toISOString() };
    const duplicate = monthlyBudgets.find(
      (item) => item.id !== nextBudget.id && item.month === nextBudget.month && normalizeCategoryName(item.categoryName) === nextBudget.categoryName,
    );

    if (duplicate && nextBudget.categoryName) {
      message.warning('同一个月份内，同一个大类只能保留一条预算');
      return;
    }

    await budgetRepository.saveMonthlyCategoryBudget(nextBudget);
    setMonthlyBudgets((items) => {
      const exists = items.some((item) => item.id === nextBudget.id);
      return exists ? items.map((item) => (item.id === nextBudget.id ? nextBudget : item)) : [...items, nextBudget];
    });
  };

  const addMonthlyBudget = async () => {
    const now = new Date().toISOString();
    await upsertMonthlyBudget({
      id: budgetRepository.createId('category-budget'),
      month: selectedMonth,
      categoryName: '',
      budgetAmount: 0,
      overBudgetNote: '',
      remark: '',
      createdAt: now,
      updatedAt: now,
    });
  };

  const removeMonthlyBudget = (id: string) => {
    Modal.confirm({
      title: '删除这条大类预算？',
      content: '删除后该月份的大类预算设置会移除。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await budgetRepository.deleteMonthlyCategoryBudget(id);
        setMonthlyBudgets((items) => items.filter((item) => item.id !== id));
      },
    });
  };

  const copyMonthlyBudgets = async () => {
    if (!copySourceMonth || !copyTargetMonth) {
      message.warning('请选择来源月份和目标月份');
      return;
    }

    const sourceBudgets = await budgetRepository.getMonthlyCategoryBudgets(copySourceMonth);

    if (sourceBudgets.length === 0) {
      message.warning('来源月份没有可复制的预算');
      return;
    }

    const executeCopy = async () => {
      const now = new Date().toISOString();
      const copied = sourceBudgets.map((item) => ({
        ...item,
        id: budgetRepository.createId('category-budget'),
        month: copyTargetMonth,
        overBudgetNote: '',
        createdAt: now,
        updatedAt: now,
      }));
      await budgetRepository.replaceMonthlyCategoryBudgets(copyTargetMonth, copied);
      setSelectedMonth(copyTargetMonth);
      setCopyOpen(false);
      message.success('月份预算已复制');
    };

    const targetBudgets = await budgetRepository.getMonthlyCategoryBudgets(copyTargetMonth);

    if (targetBudgets.length > 0) {
      Modal.confirm({
        title: '覆盖目标月份预算？',
        content: `${copyTargetMonth} 已有 ${targetBudgets.length} 条预算，复制后会整月覆盖。`,
        okText: '覆盖',
        cancelText: '取消',
        onOk: executeCopy,
      });
      return;
    }

    await executeCopy();
  };

  const upsertShoppingItem = async (item: ShoppingBudgetItem) => {
    const nextItem = { ...item, updatedAt: new Date().toISOString() };
    await budgetRepository.saveShoppingBudgetItem(nextItem);
    setShoppingItems((items) => (items.some((current) => current.id === nextItem.id) ? items.map((current) => (current.id === nextItem.id ? nextItem : current)) : [...items, nextItem]));
  };

  const addShoppingItem = async () => {
    const now = new Date().toISOString();
    await upsertShoppingItem({
      id: budgetRepository.createId('shopping-budget'),
      categoryName: '',
      itemName: '',
      plannedQuantity: 0,
      purchasedQuantity: 0,
      quantityUnit: '件',
      budgetAmount: 0,
      actualUnitAmount: 0,
      purchasedItem: '',
      recommendedPlan: '',
      status: 'planned',
      priority: 'optional',
      remark: '',
      createdAt: now,
      updatedAt: now,
    });
  };

  const removeShoppingItem = (id: string) => {
    Modal.confirm({
      title: '删除这条购物预算？',
      content: '删除后该购物预算明细会移除。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await budgetRepository.deleteShoppingBudgetItem(id);
        setShoppingItems((items) => items.filter((item) => item.id !== id));
      },
    });
  };

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <Typography.Title level={3}>预算管理</Typography.Title>
          <Typography.Text type="secondary">账单大类预算联动账单，独立购物预算只做手工管理</Typography.Text>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-tile">
          <div className="summary-label">月总支出预算</div>
          <div className="summary-value">{formatAmount(overview.monthlyExpenseBudget)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">当前已支出</div>
          <div className="summary-value">{formatAmount(overview.currentExpense)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">当前剩余预算</div>
          <div className={overview.remainingExpenseBudget < 0 ? 'summary-value amount-danger' : 'summary-value'}>{formatAmount(overview.remainingExpenseBudget)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">预计可攒金额</div>
          <div className={overview.isSavingTargetMet ? 'summary-value' : 'summary-value amount-warning'}>{formatAmount(overview.expectedSaving)}</div>
        </div>
      </div>

      <div className="page-section">
        <div className="section-header">
          <Typography.Title level={4}>总预算设置</Typography.Title>
        </div>
        <Space wrap>
          <InputNumber
            min={0}
            precision={2}
            value={budgetSettings.annualExpenseBudget}
            addonBefore="年支出总预算"
            addonAfter="元"
            onChange={(value) => void saveBudgetSettingsAndState({ ...budgetSettings, annualExpenseBudget: Number(value ?? 0) })}
          />
          <InputNumber
            min={0}
            precision={2}
            value={budgetSettings.monthlySavingTarget}
            addonBefore="月攒钱预算"
            addonAfter="元"
            onChange={(value) => void saveBudgetSettingsAndState({ ...budgetSettings, monthlySavingTarget: Number(value ?? 0) })}
          />
          <InputNumber
            min={0}
            precision={2}
            value={budgetSettings.monthlyExpenseBudget}
            addonBefore="月总支出预算"
            addonAfter="元"
            onChange={(value) => void saveBudgetSettingsAndState({ ...budgetSettings, monthlyExpenseBudget: Number(value ?? 0) })}
          />
        </Space>
      </div>

      <div className="page-section">
        <div className="section-header">
          <div>
            <Typography.Title level={4}>月度账单大类预算</Typography.Title>
            <Typography.Text type="secondary">{overview.hasBill ? '已导入当月账单，可按一级分类反写已支出' : '当月账单未导入，已支出暂按 0 计算'}</Typography.Text>
          </div>
          <Space>
            <Select value={selectedMonth} style={{ width: 150 }} options={monthOptions.map((month) => ({ value: month, label: month }))} onChange={setSelectedMonth} />
            <Button onClick={() => setCopyOpen(true)}>复制月份预算</Button>
            <Button type="primary" onClick={() => void addMonthlyBudget()}>
              新增大类预算
            </Button>
          </Space>
        </div>
        <MonthlyCategoryBudgetTable
          rows={budgetRows}
          categoryOptions={categoryOptions}
          onChange={upsertMonthlyBudget}
          onDelete={removeMonthlyBudget}
        />
      </div>

      <div className="page-section">
        <div className="section-header">
          <Typography.Title level={4}>月度结算</Typography.Title>
        </div>
        <Space wrap>
          <Tag color={settlement.isTotalBudgetOver ? 'red' : 'green'}>{settlement.isTotalBudgetOver ? '总预算已超支' : '总预算未超支'}</Tag>
          <Tag color={settlement.isSavingTargetMet ? 'green' : 'gold'}>{settlement.isSavingTargetMet ? '攒钱目标已达成' : '攒钱目标未达成'}</Tag>
          <Tag>超支大类：{settlement.overBudgetCategories.length}</Tag>
        </Space>
      </div>

      <div className="page-section">
        <div className="section-header">
          <div>
            <Typography.Title level={4}>独立购物预算</Typography.Title>
            <Typography.Text type="secondary">这张表不和导入账单联动，只用于手工购物计划</Typography.Text>
          </div>
          <Button type="primary" onClick={() => void addShoppingItem()}>
            新增购物预算
          </Button>
        </div>
        <ShoppingBudgetTable rows={shoppingRows} summary={shoppingSummary} onChange={upsertShoppingItem} onDelete={removeShoppingItem} />
      </div>

      <Modal title="复制月份预算" open={copyOpen} onOk={() => void copyMonthlyBudgets()} onCancel={() => setCopyOpen(false)} okText="复制" cancelText="取消">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            placeholder="来源月份"
            value={copySourceMonth}
            style={{ width: '100%' }}
            options={monthOptions.map((month) => ({ value: month, label: month }))}
            onChange={setCopySourceMonth}
          />
          <Input value={copyTargetMonth} placeholder="目标月份，例如 2026-07" onChange={(event) => setCopyTargetMonth(event.target.value)} />
        </Space>
      </Modal>
    </div>
  );
}

interface MonthlyCategoryBudgetTableProps {
  rows: MonthlyCategoryBudgetRow[];
  categoryOptions: { categoryName: string; spentAmount: number }[];
  onChange: (budget: MonthlyCategoryBudget) => void;
  onDelete: (id: string) => void;
}

function MonthlyCategoryBudgetTable({ rows, categoryOptions, onChange, onDelete }: MonthlyCategoryBudgetTableProps) {
  const columns: TableColumnsType<MonthlyCategoryBudgetRow> = [
    {
      title: '大类名称',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 180,
      render: (_value, row) => (
        <Select
          showSearch
          value={row.categoryName || undefined}
          placeholder="选择或输入"
          style={{ width: 160 }}
          options={categoryOptions.map((option) => ({ value: option.categoryName, label: `${option.categoryName}（${formatAmount(option.spentAmount)}）` }))}
          onSearch={(value) => onChange({ ...row, categoryName: value })}
          onChange={(value) => onChange({ ...row, categoryName: value })}
        />
      ),
    },
    {
      title: '预算金额',
      dataIndex: 'budgetAmount',
      key: 'budgetAmount',
      align: 'right',
      render: (_value, row) => <InputNumber min={0} precision={2} value={row.budgetAmount} onChange={(value) => onChange({ ...row, budgetAmount: Number(value ?? 0) })} />,
    },
    { title: '已支出', dataIndex: 'spentAmount', key: 'spentAmount', align: 'right', render: (value, row) => <span className={row.status === 'over' ? 'amount-danger' : ''}>{formatAmount(value)}</span> },
    { title: '剩余', dataIndex: 'remainingAmount', key: 'remainingAmount', align: 'right', render: (value: number) => <span className={value < 0 ? 'amount-danger' : ''}>{formatAmount(value)}</span> },
    { title: '使用率', dataIndex: 'usageRate', key: 'usageRate', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '状态', dataIndex: 'status', key: 'status', render: (value: MonthlyCategoryBudgetRow['status']) => <Tag color={STATUS_LABELS[value].color}>{STATUS_LABELS[value].text}</Tag> },
    { title: '超支备注', dataIndex: 'overBudgetNote', key: 'overBudgetNote', render: (_value, row) => <Input value={row.overBudgetNote} onChange={(event) => onChange({ ...row, overBudgetNote: event.target.value })} /> },
    { title: '备注', dataIndex: 'remark', key: 'remark', render: (_value, row) => <Input value={row.remark} onChange={(event) => onChange({ ...row, remark: event.target.value })} /> },
    { title: '操作', key: 'action', render: (_value, row) => <Button danger type="link" onClick={() => onDelete(row.id)}>删除</Button> },
  ];

  return rows.length ? <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 1180 }} /> : <Empty description="还没有大类预算" />;
}

interface ShoppingBudgetTableProps {
  rows: ShoppingBudgetRow[];
  summary: { totalBudgetAmount: number; totalActualAmount: number; totalRemainingAmount: number };
  onChange: (item: ShoppingBudgetItem) => void;
  onDelete: (id: string) => void;
}

function ShoppingBudgetTable({ rows, summary, onChange, onDelete }: ShoppingBudgetTableProps) {
  const columns: TableColumnsType<ShoppingBudgetRow> = [
    { title: '品类', dataIndex: 'categoryName', key: 'categoryName', width: 130, render: (_value, row) => <Input value={row.categoryName} onChange={(event) => onChange({ ...row, categoryName: event.target.value })} /> },
    { title: '具体项目', dataIndex: 'itemName', key: 'itemName', width: 140, render: (_value, row) => <Input value={row.itemName} onChange={(event) => onChange({ ...row, itemName: event.target.value })} /> },
    { title: '计划数量', dataIndex: 'plannedQuantity', key: 'plannedQuantity', width: 110, render: (_value, row) => <InputNumber min={0} value={row.plannedQuantity} onChange={(value) => onChange({ ...row, plannedQuantity: Number(value ?? 0) })} /> },
    { title: '已购买', dataIndex: 'purchasedQuantity', key: 'purchasedQuantity', width: 110, render: (_value, row) => <InputNumber min={0} value={row.purchasedQuantity} onChange={(value) => onChange({ ...row, purchasedQuantity: Number(value ?? 0) })} /> },
    { title: '单位', dataIndex: 'quantityUnit', key: 'quantityUnit', width: 90, render: (_value, row) => <Input value={row.quantityUnit} onChange={(event) => onChange({ ...row, quantityUnit: event.target.value })} /> },
    { title: '预算金额', dataIndex: 'budgetAmount', key: 'budgetAmount', width: 130, align: 'right', render: (_value, row) => <InputNumber min={0} precision={2} value={row.budgetAmount} onChange={(value) => onChange({ ...row, budgetAmount: Number(value ?? 0) })} /> },
    { title: '实际单价', dataIndex: 'actualUnitAmount', key: 'actualUnitAmount', width: 130, align: 'right', render: (_value, row) => <InputNumber min={0} precision={2} value={row.actualUnitAmount} onChange={(value) => onChange({ ...row, actualUnitAmount: Number(value ?? 0) })} /> },
    { title: '实际小计', dataIndex: 'actualTotalAmount', key: 'actualTotalAmount', align: 'right', render: (value, row) => <span className={row.isOverBudget ? 'amount-danger' : ''}>{formatAmount(value)}</span> },
    { title: '品类剩余', dataIndex: 'categoryRemainingAmount', key: 'categoryRemainingAmount', align: 'right', render: (value: number) => <span className={value < 0 ? 'amount-danger' : ''}>{formatAmount(value)}</span> },
    { title: '购买内容', dataIndex: 'purchasedItem', key: 'purchasedItem', width: 160, render: (_value, row) => <Input value={row.purchasedItem} onChange={(event) => onChange({ ...row, purchasedItem: event.target.value })} /> },
    { title: '推荐方案', dataIndex: 'recommendedPlan', key: 'recommendedPlan', width: 160, render: (_value, row) => <Input value={row.recommendedPlan} onChange={(event) => onChange({ ...row, recommendedPlan: event.target.value })} /> },
    { title: '操作', key: 'action', fixed: 'right', render: (_value, row) => <Button danger type="link" onClick={() => onDelete(row.id)}>删除</Button> },
  ];

  return (
    <>
      {rows.length ? <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 1580 }} /> : <Empty description="还没有购物预算" />}
      <div className="table-total-row">
        总预算：{formatAmount(summary.totalBudgetAmount)}，总实际：{formatAmount(summary.totalActualAmount)}，总剩余：
        <span className={summary.totalRemainingAmount < 0 ? 'amount-danger' : ''}>{formatAmount(summary.totalRemainingAmount)}</span>
      </div>
    </>
  );
}

function buildMonthOptions(monthlyBills: MonthlyBill[], monthlyBudgets: MonthlyCategoryBudget[]): string[] {
  return Array.from(new Set([...monthlyBills.map((bill) => bill.month), ...monthlyBudgets.map((budget) => budget.month), getCurrentMonth()])).sort((a, b) => b.localeCompare(a));
}

function getCurrentMonth(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
