import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { Button, Empty, Input, InputNumber, Modal, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { TableColumnsType } from 'antd';
import type { MonthlyBill } from '../types/bill';
import type {
  MonthlyCategoryBudget,
  MonthlyCategoryBudgetRow,
  ShoppingBudgetCategory,
  ShoppingBudgetCategoryRow,
  ShoppingBudgetItem,
  ShoppingBudgetItemRow,
  ShoppingBudgetPlan,
  ShoppingBudgetPlanRow,
} from '../types/budget';
import type { BudgetSettings, UserSettings } from '../types/settings';
import {
  calculateMonthlyBudgetOverview,
  calculateMonthlyBudgetSettlement,
  calculateMonthlyCategoryBudgetRows,
  calculateShoppingBudgetCategoryRows,
  calculateShoppingBudgetItemRows,
  calculateShoppingBudgetPlanRows,
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

const SHOPPING_STATUS_LABELS: Record<ShoppingBudgetItem['status'], { text: string; color: string }> = {
  planned: { text: '计划中', color: 'blue' },
  purchased: { text: '已购买', color: 'green' },
  paused: { text: '暂缓', color: 'gold' },
  abandoned: { text: '放弃', color: 'default' },
};

const SHOPPING_DETAIL_STATUS_SORT_ORDER: Record<ShoppingBudgetItem['status'], number> = {
  purchased: 1,
  planned: 2,
  paused: 3,
  abandoned: 4,
};

type ShoppingDetailStatusFilter = ShoppingBudgetItem['status'] | 'all';

export default function BudgetPage({ monthlyBills }: BudgetPageProps) {
  const [userSettings, setUserSettings] = useState<UserSettings>(settingsRepository.createDefaultUserSettings());
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(settingsRepository.createDefaultBudgetSettings());
  const [selectedMonth, setSelectedMonth] = useState<string>(monthlyBills[0]?.month ?? getCurrentMonth());
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyCategoryBudget[]>([]);
  const [shoppingPlans, setShoppingPlans] = useState<ShoppingBudgetPlan[]>([]);
  const [shoppingCategories, setShoppingCategories] = useState<ShoppingBudgetCategory[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingBudgetItem[]>([]);
  const [activeShoppingPlanId, setActiveShoppingPlanId] = useState('');
  const [planSortMode, setPlanSortMode] = useState(false);
  const [categorySortMode, setCategorySortMode] = useState(false);
  const [itemSortMode, setItemSortMode] = useState(false);
  const [planSortDraft, setPlanSortDraft] = useState<ShoppingBudgetPlan[]>([]);
  const [categorySortDraft, setCategorySortDraft] = useState<ShoppingBudgetCategory[]>([]);
  const [itemSortDraft, setItemSortDraft] = useState<ShoppingBudgetItem[]>([]);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copySourceMonth, setCopySourceMonth] = useState<string>();
  const [copyTargetMonth, setCopyTargetMonth] = useState<string>(getCurrentMonth());
  const [shoppingCategoryDetail, setShoppingCategoryDetail] = useState<ShoppingBudgetCategoryRow | null>(null);

  const currentBill = monthlyBills.find((bill) => bill.month === selectedMonth);
  const monthOptions = useMemo(() => buildMonthOptions(monthlyBills, monthlyBudgets), [monthlyBills, monthlyBudgets]);
  const categoryOptions = getCategoryOptionsFromMonthlyBill(currentBill);
  const budgetRows = calculateMonthlyCategoryBudgetRows(monthlyBudgets, currentBill);
  const overview = calculateMonthlyBudgetOverview(selectedMonth, currentBill, userSettings, budgetSettings);
  const settlement = calculateMonthlyBudgetSettlement(selectedMonth, budgetRows, overview);
  const shoppingCategoryRows = calculateShoppingBudgetCategoryRows(shoppingCategories, shoppingItems);
  const shoppingPlanRows = calculateShoppingBudgetPlanRows(shoppingPlans, shoppingCategoryRows);
  const shoppingSummary = calculateShoppingBudgetSummary(shoppingPlanRows);
  const activeShoppingPlan = shoppingPlanRows.find((plan) => plan.id === activeShoppingPlanId) ?? shoppingPlanRows[0];
  const currentShoppingPlanId = activeShoppingPlan?.id ?? '';
  const currentShoppingCategories = shoppingCategories.filter((category) => category.planId === currentShoppingPlanId);
  const currentShoppingItems = shoppingItems.filter((item) => item.planId === currentShoppingPlanId);
  const currentShoppingCategoryRows = calculateShoppingBudgetCategoryRows(categorySortMode ? categorySortDraft : currentShoppingCategories, currentShoppingItems);
  const currentShoppingItemRows = calculateShoppingBudgetItemRows(itemSortMode ? itemSortDraft : currentShoppingItems, currentShoppingCategories);
  const displayedShoppingPlanRows = calculateShoppingBudgetPlanRows(planSortMode ? planSortDraft : shoppingPlans, shoppingCategoryRows);
  const shoppingCategoryDetailRows = shoppingCategoryDetail
    ? currentShoppingItemRows
        .filter((item) => item.categoryId === shoppingCategoryDetail.id)
        .sort((a, b) => SHOPPING_DETAIL_STATUS_SORT_ORDER[a.status] - SHOPPING_DETAIL_STATUS_SORT_ORDER[b.status])
    : [];

  useEffect(() => {
    void Promise.all([settingsRepository.getUserSettings(), settingsRepository.getBudgetSettings()]).then(([nextUserSettings, nextBudgetSettings]) => {
      setUserSettings(nextUserSettings);
      setBudgetSettings(nextBudgetSettings);
    });
    void refreshShoppingBudgets();
  }, []);

  useEffect(() => {
    void budgetRepository.getMonthlyCategoryBudgets(selectedMonth).then(setMonthlyBudgets);
  }, [selectedMonth]);

  useEffect(() => {
    if (!activeShoppingPlanId && shoppingPlans.length > 0) {
      setActiveShoppingPlanId(shoppingPlans[0].id);
    }

    if (activeShoppingPlanId && shoppingPlans.length > 0 && !shoppingPlans.some((plan) => plan.id === activeShoppingPlanId)) {
      setActiveShoppingPlanId(shoppingPlans[0].id);
    }
  }, [activeShoppingPlanId, shoppingPlans]);

  const refreshShoppingBudgets = async () => {
    const [nextPlans, nextCategories, nextItems] = await Promise.all([budgetRepository.getShoppingBudgetPlans(), budgetRepository.getShoppingBudgetCategories(), budgetRepository.getShoppingBudgetItems()]);
    setShoppingPlans(nextPlans);
    setShoppingCategories(nextCategories);
    setShoppingItems(nextItems);
  };

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

  const upsertShoppingPlan = async (plan: ShoppingBudgetPlan) => {
    const nextPlan: ShoppingBudgetPlan = {
      id: plan.id,
      name: plan.name,
      totalBudgetAmount: Number(plan.totalBudgetAmount || 0),
      sortOrder: plan.sortOrder,
      remark: plan.remark,
      createdAt: plan.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await budgetRepository.saveShoppingBudgetPlan(nextPlan);
    setShoppingPlans((plans) => (plans.some((current) => current.id === nextPlan.id) ? plans.map((current) => (current.id === nextPlan.id ? nextPlan : current)) : [...plans, nextPlan]));
  };

  const addShoppingPlan = async () => {
    const now = new Date().toISOString();
    const nextPlan = {
      id: budgetRepository.createId('shopping-plan'),
      name: '新购物预算',
      totalBudgetAmount: 0,
      sortOrder: getNextSortOrder(shoppingPlans),
      remark: '',
      createdAt: now,
      updatedAt: now,
    };
    await upsertShoppingPlan(nextPlan);
    setActiveShoppingPlanId(nextPlan.id);
  };

  const removeShoppingPlan = (id: string) => {
    Modal.confirm({
      title: '删除这个分类计划？',
      content: '删除后该分类计划下的品类档案和购物明细会一起移除。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await budgetRepository.deleteShoppingBudgetPlan(id);
        await refreshShoppingBudgets();
      },
    });
  };

  const upsertShoppingCategory = async (category: ShoppingBudgetCategory) => {
    const nextCategory: ShoppingBudgetCategory = {
      id: category.id,
      planId: category.planId,
      name: category.name.trim(),
      budgetAmount: Number(category.budgetAmount || 0),
      sortOrder: category.sortOrder,
      remark: category.remark,
      createdAt: category.createdAt,
      updatedAt: new Date().toISOString(),
    };
    const duplicate = shoppingCategories.find((item) => item.id !== nextCategory.id && item.planId === nextCategory.planId && item.name === nextCategory.name);

    if (duplicate && nextCategory.name) {
      message.warning('同一个分类计划内，同一个品类只能保留一条预算');
      return;
    }

    await budgetRepository.saveShoppingBudgetCategory(nextCategory);
    setShoppingCategories((categories) =>
      categories.some((current) => current.id === nextCategory.id) ? categories.map((current) => (current.id === nextCategory.id ? nextCategory : current)) : [...categories, nextCategory],
    );
  };

  const addShoppingCategory = async () => {
    if (!currentShoppingPlanId) {
      message.warning('请先新增分类计划');
      return;
    }

    const now = new Date().toISOString();
    await upsertShoppingCategory({
      id: budgetRepository.createId('shopping-category'),
      planId: currentShoppingPlanId,
      name: '',
      budgetAmount: 0,
      sortOrder: getNextSortOrder(currentShoppingCategories),
      remark: '',
      createdAt: now,
      updatedAt: now,
    });
  };

  const removeShoppingCategory = (id: string) => {
    Modal.confirm({
      title: '删除这个品类？',
      content: '删除后该品类下的购物明细会一起移除。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await budgetRepository.deleteShoppingBudgetCategory(id);
        await refreshShoppingBudgets();
      },
    });
  };

  const upsertShoppingItem = async (item: ShoppingBudgetItem) => {
    const nextItem: ShoppingBudgetItem = {
      id: item.id,
      planId: item.planId,
      categoryId: item.categoryId,
      itemName: item.itemName,
      plannedQuantity: Number(item.plannedQuantity || 0),
      actualQuantity: Number(item.actualQuantity || 0),
      plannedAmount: Number(item.plannedAmount || 0),
      actualAmount: Number(item.actualAmount || 0),
      status: item.status,
      sortOrder: item.sortOrder,
      remark: item.remark,
      createdAt: item.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await budgetRepository.saveShoppingBudgetItem(nextItem);
    setShoppingItems((items) => (items.some((current) => current.id === nextItem.id) ? items.map((current) => (current.id === nextItem.id ? nextItem : current)) : [...items, nextItem]));
  };

  const addShoppingItem = async () => {
    if (!currentShoppingPlanId) {
      message.warning('请先新增分类计划');
      return;
    }

    if (currentShoppingCategories.length === 0) {
      message.warning('请先新增品类预算档案');
      return;
    }

    const now = new Date().toISOString();
    await upsertShoppingItem({
      id: budgetRepository.createId('shopping-budget'),
      planId: currentShoppingPlanId,
      categoryId: currentShoppingCategories[0].id,
      itemName: '',
      plannedQuantity: 0,
      actualQuantity: 0,
      plannedAmount: 0,
      actualAmount: 0,
      status: 'planned',
      sortOrder: getNextSortOrder(currentShoppingItems),
      remark: '',
      createdAt: now,
      updatedAt: now,
    });
  };

  const removeShoppingItem = (id: string) => {
    Modal.confirm({
      title: '删除这条购物明细？',
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

  const startPlanSort = () => {
    setPlanSortDraft(shoppingPlans);
    setPlanSortMode(true);
  };

  const savePlanSort = async () => {
    const sortedPlans = applySortOrder(planSortDraft);
    setShoppingPlans(sortedPlans);
    await budgetRepository.saveShoppingBudgetPlans(sortedPlans);
    setPlanSortMode(false);
    setPlanSortDraft([]);
  };

  const cancelPlanSort = () => {
    setPlanSortMode(false);
    setPlanSortDraft([]);
  };

  const startCategorySort = () => {
    setCategorySortDraft(currentShoppingCategories);
    setCategorySortMode(true);
  };

  const saveCategorySort = async () => {
    const sortedCategories = applySortOrder(categorySortDraft);
    setShoppingCategories((categories) => categories.map((category) => sortedCategories.find((item) => item.id === category.id) ?? category));
    await budgetRepository.saveShoppingBudgetCategories(sortedCategories);
    setCategorySortMode(false);
    setCategorySortDraft([]);
  };

  const cancelCategorySort = () => {
    setCategorySortMode(false);
    setCategorySortDraft([]);
  };

  const startItemSort = () => {
    setItemSortDraft(currentShoppingItems);
    setItemSortMode(true);
  };

  const saveItemSort = async () => {
    const sortedItems = applySortOrder(itemSortDraft);
    setShoppingItems((items) => items.map((item) => sortedItems.find((current) => current.id === item.id) ?? item));
    await budgetRepository.saveShoppingBudgetItems(sortedItems);
    setItemSortMode(false);
    setItemSortDraft([]);
  };

  const cancelItemSort = () => {
    setItemSortMode(false);
    setItemSortDraft([]);
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
          <DeferredNumberInput
            min={0}
            precision={2}
            value={budgetSettings.annualExpenseBudget}
            addonBefore="年支出总预算"
            addonAfter="元"
            onCommit={(value) => void saveBudgetSettingsAndState({ ...budgetSettings, annualExpenseBudget: value })}
          />
          <DeferredNumberInput
            min={0}
            precision={2}
            value={budgetSettings.monthlySavingTarget}
            addonBefore="月攒钱预算"
            addonAfter="元"
            onCommit={(value) => void saveBudgetSettingsAndState({ ...budgetSettings, monthlySavingTarget: value })}
          />
          <DeferredNumberInput
            min={0}
            precision={2}
            value={budgetSettings.monthlyExpenseBudget}
            addonBefore="月总支出预算"
            addonAfter="元"
            onCommit={(value) => void saveBudgetSettingsAndState({ ...budgetSettings, monthlyExpenseBudget: value })}
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
            <Typography.Text type="secondary">按分类计划、品类预算档案、购物明细三层手工维护，不和导入账单联动</Typography.Text>
          </div>
          <Button type="primary" onClick={() => void addShoppingPlan()}>
            新增分类计划
          </Button>
        </div>
        <div className="summary-grid shopping-summary-grid">
          <div className="summary-tile">
            <div className="summary-label">购物总预算</div>
            <div className="summary-value">{formatAmount(shoppingSummary.totalBudgetAmount)}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">已占用预算</div>
            <div className="summary-value">{formatAmount(shoppingSummary.totalUsedAmount)}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">剩余预算</div>
            <div className={shoppingSummary.isOverBudget ? 'summary-value amount-danger' : 'summary-value'}>{formatAmount(shoppingSummary.totalRemainingAmount)}</div>
          </div>
          <div className="summary-tile">
            <div className="summary-label">分类计划数</div>
            <div className="summary-value">{shoppingPlanRows.length}</div>
          </div>
        </div>

        <ShoppingPlanTable
          rows={displayedShoppingPlanRows}
          activePlanId={currentShoppingPlanId}
          sortMode={planSortMode}
          onStartSort={startPlanSort}
          onSaveSort={() => void savePlanSort()}
          onCancelSort={cancelPlanSort}
          onReorder={(orderedIds) => setPlanSortDraft(reorderByIds(planSortDraft, orderedIds))}
          onSelect={(planId) => {
            setActiveShoppingPlanId(planId);
            cancelCategorySort();
            cancelItemSort();
          }}
          onChange={upsertShoppingPlan}
          onDelete={removeShoppingPlan}
        />

        {shoppingPlanRows.length ? (
          <div className="shopping-budget-layout">
            <ShoppingCategoryTable
              rows={currentShoppingCategoryRows}
              sortMode={categorySortMode}
              onStartSort={startCategorySort}
              onSaveSort={() => void saveCategorySort()}
              onCancelSort={cancelCategorySort}
              onReorder={(orderedIds) => setCategorySortDraft(reorderByIds(categorySortDraft, orderedIds))}
              onAdd={() => void addShoppingCategory()}
              onOpenActualDetail={setShoppingCategoryDetail}
              onChange={upsertShoppingCategory}
              onDelete={removeShoppingCategory}
            />
            <ShoppingBudgetTable
              rows={currentShoppingItemRows}
              categories={currentShoppingCategories}
              sortMode={itemSortMode}
              onStartSort={startItemSort}
              onSaveSort={() => void saveItemSort()}
              onCancelSort={cancelItemSort}
              onReorder={(orderedIds) => setItemSortDraft(reorderByIds(itemSortDraft, orderedIds))}
              onAdd={() => void addShoppingItem()}
              onChange={upsertShoppingItem}
              onDelete={removeShoppingItem}
            />
          </div>
        ) : (
          <Empty description="还没有分类计划">
            <Button type="primary" onClick={() => void addShoppingPlan()}>
              新增第一个分类计划
            </Button>
          </Empty>
        )}
      </div>

      <ShoppingCategoryDetailModal
        category={shoppingCategoryDetail}
        rows={shoppingCategoryDetailRows}
        onClose={() => setShoppingCategoryDetail(null)}
      />

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
        <DeferredSearchSelect
          value={row.categoryName}
          placeholder="选择或输入"
          style={{ width: 160 }}
          options={categoryOptions.map((option) => ({ value: option.categoryName, label: `${option.categoryName}（${formatAmount(option.spentAmount)}）` }))}
          onCommit={(categoryName) => onChange({ ...row, categoryName })}
        />
      ),
    },
    {
      title: '预算金额',
      dataIndex: 'budgetAmount',
      key: 'budgetAmount',
      align: 'right',
      render: (_value, row) => <DeferredNumberInput min={0} precision={2} value={row.budgetAmount} onCommit={(budgetAmount) => onChange({ ...row, budgetAmount })} />,
    },
    { title: '已支出', dataIndex: 'spentAmount', key: 'spentAmount', align: 'right', render: (value, row) => <span className={row.status === 'over' ? 'amount-danger' : ''}>{formatAmount(value)}</span> },
    { title: '剩余', dataIndex: 'remainingAmount', key: 'remainingAmount', align: 'right', render: (value: number) => <span className={value < 0 ? 'amount-danger' : ''}>{formatAmount(value)}</span> },
    { title: '使用率', dataIndex: 'usageRate', key: 'usageRate', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '状态', dataIndex: 'status', key: 'status', render: (value: MonthlyCategoryBudgetRow['status']) => <Tag color={STATUS_LABELS[value].color}>{STATUS_LABELS[value].text}</Tag> },
    { title: '超支备注', dataIndex: 'overBudgetNote', key: 'overBudgetNote', render: (_value, row) => <DeferredTextInput value={row.overBudgetNote} onCommit={(overBudgetNote) => onChange({ ...row, overBudgetNote })} /> },
    { title: '备注', dataIndex: 'remark', key: 'remark', render: (_value, row) => <DeferredTextInput value={row.remark} onCommit={(remark) => onChange({ ...row, remark })} /> },
    { title: '操作', key: 'action', render: (_value, row) => <Button danger type="link" onClick={() => onDelete(row.id)}>删除</Button> },
  ];

  return rows.length ? <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 1180 }} /> : <Empty description="还没有大类预算" />;
}

interface SortableTableActions {
  sortMode: boolean;
  onStartSort: () => void;
  onSaveSort: () => void;
  onCancelSort: () => void;
  onReorder: (orderedIds: string[]) => void;
}

interface ShoppingPlanTableProps extends SortableTableActions {
  rows: ShoppingBudgetPlanRow[];
  activePlanId: string;
  onSelect: (planId: string) => void;
  onChange: (plan: ShoppingBudgetPlan) => void;
  onDelete: (id: string) => void;
}

function ShoppingPlanTable({ rows, activePlanId, sortMode, onStartSort, onSaveSort, onCancelSort, onReorder, onSelect, onChange, onDelete }: ShoppingPlanTableProps) {
  const columns: TableColumnsType<ShoppingBudgetPlanRow> = [
    ...buildDragColumn(rows, sortMode, onReorder),
    { title: '分类计划', dataIndex: 'name', key: 'name', width: 180, render: (_value, row) => <DeferredTextInput value={row.name} disabled={sortMode} onCommit={(name) => onChange({ ...row, name })} /> },
    { title: '总预算', dataIndex: 'totalBudgetAmount', key: 'totalBudgetAmount', width: 140, align: 'right', render: (value: number) => formatAmount(value) },
    { title: '已占用', dataIndex: 'usedAmount', key: 'usedAmount', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '剩余', dataIndex: 'remainingAmount', key: 'remainingAmount', align: 'right', render: (value: number) => <span className={value < 0 ? 'amount-danger' : ''}>{formatAmount(value)}</span> },
    { title: '备注', dataIndex: 'remark', key: 'remark', render: (_value, row) => <DeferredTextInput value={row.remark} disabled={sortMode} onCommit={(remark) => onChange({ ...row, remark })} /> },
    { title: '操作', key: 'action', width: 90, render: (_value, row) => <Button danger type="link" disabled={sortMode} onClick={() => onDelete(row.id)}>删除</Button> },
  ];

  return (
    <div className="shopping-subsection">
      <div className="table-toolbar">
        {sortMode ? (
          <Space>
            <Button type="primary" onClick={onSaveSort}>保存排序</Button>
            <Button onClick={onCancelSort}>取消</Button>
          </Space>
        ) : (
          <Button disabled={rows.length < 2} onClick={onStartSort}>排序</Button>
        )}
      </div>
      {rows.length ? (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 860 }}
          rowClassName={(row) => (row.id === activePlanId ? 'shopping-plan-row-active' : 'shopping-plan-row')}
          onRow={(row) => ({
            onClick: () => onSelect(row.id),
          })}
        />
      ) : null}
    </div>
  );
}

interface DeferredTextInputProps {
  value: string;
  disabled?: boolean;
  onCommit: (value: string) => void;
}

function DeferredTextInput({ value, disabled, onCommit }: DeferredTextInputProps) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [editing, value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) {
      onCommit(draft);
    }
  };

  return (
    <Input
      value={editing ? draft : value}
      disabled={disabled}
      onFocus={() => {
        setDraft(value);
        setEditing(true);
      }}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onPressEnter={(event) => event.currentTarget.blur()}
    />
  );
}

interface DeferredNumberInputProps {
  value: number;
  disabled?: boolean;
  min?: number;
  max?: number;
  precision?: number;
  addonBefore?: ReactNode;
  addonAfter?: ReactNode;
  style?: CSSProperties;
  onCommit: (value: number) => void;
}

function DeferredNumberInput({ value, disabled, min, max, precision, addonBefore, addonAfter, style, onCommit }: DeferredNumberInputProps) {
  const [draft, setDraft] = useState<number | null>(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [editing, value]);

  const commit = () => {
    setEditing(false);
    const nextValue = Number(draft ?? 0);
    if (nextValue !== value) {
      onCommit(nextValue);
    }
  };

  return (
    <InputNumber
      min={min}
      max={max}
      precision={precision}
      value={editing ? draft : value}
      disabled={disabled}
      addonBefore={addonBefore}
      addonAfter={addonAfter}
      style={style}
      onFocus={() => {
        setDraft(value);
        setEditing(true);
      }}
      onClick={(event) => event.stopPropagation()}
      onChange={(nextValue) => setDraft(nextValue)}
      onBlur={commit}
      onPressEnter={(event) => event.currentTarget.blur()}
    />
  );
}

interface DeferredSearchSelectProps {
  value: string;
  placeholder?: string;
  style?: CSSProperties;
  options: { value: string; label: string }[];
  onCommit: (value: string) => void;
}

function DeferredSearchSelect({ value, placeholder, style, options, onCommit }: DeferredSearchSelectProps) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) {
      setDraft(value);
    }
  }, [editing, value]);

  const commit = (nextValue = draft) => {
    setEditing(false);
    if (nextValue !== value) {
      onCommit(nextValue);
    }
  };

  return (
    <Select
      showSearch
      value={value || undefined}
      searchValue={editing ? draft : undefined}
      placeholder={placeholder}
      style={style}
      options={options}
      filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
      onFocus={() => {
        setDraft(value);
        setEditing(true);
      }}
      onClick={(event) => event.stopPropagation()}
      onSearch={setDraft}
      onChange={(nextValue) => {
        setDraft(nextValue);
        commit(nextValue);
      }}
      onBlur={() => commit()}
      onInputKeyDown={(event) => {
        if (event.key === 'Enter') {
          (event.target as HTMLElement).blur();
        }
      }}
    />
  );
}

interface ShoppingCategoryTableProps extends SortableTableActions {
  rows: ShoppingBudgetCategoryRow[];
  onAdd: () => void;
  onOpenActualDetail: (category: ShoppingBudgetCategoryRow) => void;
  onChange: (category: ShoppingBudgetCategory) => void;
  onDelete: (id: string) => void;
}

function ShoppingCategoryTable({ rows, sortMode, onStartSort, onSaveSort, onCancelSort, onReorder, onAdd, onOpenActualDetail, onChange, onDelete }: ShoppingCategoryTableProps) {
  const columns: TableColumnsType<ShoppingBudgetCategoryRow> = [
    ...buildDragColumn(rows, sortMode, onReorder),
    { title: '品类', dataIndex: 'name', key: 'name', width: 150, render: (_value, row) => <DeferredTextInput value={row.name} disabled={sortMode} onCommit={(name) => onChange({ ...row, name })} /> },
    { title: '品类预算', dataIndex: 'budgetAmount', key: 'budgetAmount', width: 130, align: 'right', render: (_value, row) => <DeferredNumberInput min={0} precision={2} disabled={sortMode} value={row.budgetAmount} onCommit={(budgetAmount) => onChange({ ...row, budgetAmount })} /> },
    { title: '计划合计', dataIndex: 'plannedAmount', key: 'plannedAmount', align: 'right', render: (value: number, row) => <span className={row.isPlanOverBudget ? 'amount-danger' : ''}>{formatAmount(value)}</span> },
    {
      title: '实际合计',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      align: 'right',
      render: (value: number, row) => (
        <Button className={row.isActualOverBudget ? 'amount-danger' : ''} type="link" disabled={sortMode} onClick={() => onOpenActualDetail(row)}>
          {formatAmount(value)}
        </Button>
      ),
    },
    { title: '占用', dataIndex: 'usedAmount', key: 'usedAmount', align: 'right', render: (value: number) => formatAmount(value) },
    {
      title: '剩余',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      align: 'right',
      render: (value: number, row) => value < 0 ? (
        <Button className="amount-danger" type="link" disabled={sortMode} onClick={() => onOpenActualDetail(row)}>
          {formatAmount(value)}
        </Button>
      ) : formatAmount(value),
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', render: (_value, row) => <DeferredTextInput value={row.remark} disabled={sortMode} onCommit={(remark) => onChange({ ...row, remark })} /> },
    { title: '操作', key: 'action', width: 90, render: (_value, row) => <Button danger type="link" disabled={sortMode} onClick={() => onDelete(row.id)}>删除</Button> },
  ];

  return (
    <div className="page-section shopping-nested-section">
      <div className="section-header">
        <div>
          <Typography.Title level={4}>品类预算档案</Typography.Title>
          <Typography.Text type="secondary">在这里看品类剩余预算，明细行不再重复展示</Typography.Text>
        </div>
        <Space>
          {sortMode ? (
            <>
              <Button type="primary" onClick={onSaveSort}>保存排序</Button>
              <Button onClick={onCancelSort}>取消</Button>
            </>
          ) : (
            <Button disabled={rows.length < 2} onClick={onStartSort}>排序</Button>
          )}
          <Button type="primary" disabled={sortMode} onClick={onAdd}>新增品类</Button>
        </Space>
      </div>
      {rows.length ? <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 1080 }} /> : <Empty description="当前分类计划还没有品类预算档案" />}
    </div>
  );
}

interface ShoppingCategoryDetailModalProps {
  category: ShoppingBudgetCategoryRow | null;
  rows: ShoppingBudgetItemRow[];
  onClose: () => void;
}

function ShoppingCategoryDetailModal({ category, rows, onClose }: ShoppingCategoryDetailModalProps) {
  const purchasedRows = rows.filter((row) => row.status === 'purchased');
  const plannedRows = rows.filter((row) => row.status === 'planned');
  const purchasedQuantity = purchasedRows.reduce((sum, row) => sum + row.actualQuantity, 0);
  const purchasedAmount = purchasedRows.reduce((sum, row) => sum + row.actualAmount, 0);
  const plannedQuantity = plannedRows.reduce((sum, row) => sum + row.plannedQuantity, 0);
  const plannedAmount = plannedRows.reduce((sum, row) => sum + row.plannedAmount, 0);
  const overBudgetAmount = category ? Math.max(0, category.actualAmount - category.budgetAmount) : 0;
  const columns: TableColumnsType<ShoppingBudgetItemRow> = [
    { title: '具体项目', dataIndex: 'itemName', key: 'itemName', render: (value: string) => value || '-' },
    { title: '计划数量', dataIndex: 'plannedQuantity', key: 'plannedQuantity', align: 'right' },
    { title: '实际数量', dataIndex: 'actualQuantity', key: 'actualQuantity', align: 'right' },
    { title: '计划金额', dataIndex: 'plannedAmount', key: 'plannedAmount', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '实际金额', dataIndex: 'actualAmount', key: 'actualAmount', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '占用金额', dataIndex: 'usedAmount', key: 'usedAmount', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '状态', dataIndex: 'status', key: 'status', render: (value: ShoppingBudgetItem['status']) => SHOPPING_STATUS_LABELS[value].text },
    { title: '备注', dataIndex: 'remark', key: 'remark', render: (value: string) => value || '-' },
  ];

  return (
    <Modal centered title={category ? `${category.name || '未命名品类'} 明细` : '品类明细'} open={Boolean(category)} footer={null} width={860} onCancel={onClose}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {category ? (
          <Space wrap>
            <Tag>品类预算：{formatAmount(category.budgetAmount)}</Tag>
            <Tag color="green">已购买：{purchasedQuantity} 件 / {formatAmount(purchasedAmount)}</Tag>
            <Tag color="blue">计划中：{plannedQuantity} 件 / {formatAmount(plannedAmount)}</Tag>
            <Tag color={overBudgetAmount > 0 ? 'red' : 'default'}>{overBudgetAmount > 0 ? `超预算：${formatAmount(overBudgetAmount)}` : `剩余：${formatAmount(category.remainingAmount)}`}</Tag>
          </Space>
        ) : null}
        <Table rowKey="id" columns={columns} dataSource={rows} pagination={false} scroll={{ x: 860 }} />
      </Space>
    </Modal>
  );
}

interface ShoppingBudgetTableProps extends SortableTableActions {
  rows: ShoppingBudgetItemRow[];
  categories: ShoppingBudgetCategory[];
  onAdd: () => void;
  onChange: (item: ShoppingBudgetItem) => void;
  onDelete: (id: string) => void;
}

function ShoppingBudgetTable({ rows, categories, sortMode, onStartSort, onSaveSort, onCancelSort, onReorder, onAdd, onChange, onDelete }: ShoppingBudgetTableProps) {
  const [statusFilter, setStatusFilter] = useState<ShoppingDetailStatusFilter>('all');
  const categoryOptions = categories.map((category) => ({ value: category.id, label: `${category.name || '未命名品类'}（${formatAmount(category.budgetAmount)}）` }));
  const filteredRows = statusFilter === 'all' ? rows : rows.filter((row) => row.status === statusFilter);
  const displayedRows = sortMode ? rows : filteredRows;
  const columns: TableColumnsType<ShoppingBudgetItemRow> = [
    ...buildDragColumn(displayedRows, sortMode, onReorder),
    { title: '品类', dataIndex: 'categoryId', key: 'categoryId', width: 180, render: (_value, row) => <Select value={row.categoryId || undefined} disabled={sortMode} style={{ width: 160 }} options={categoryOptions} onChange={(categoryId) => onChange({ ...row, categoryId })} /> },
    { title: '具体项目', dataIndex: 'itemName', key: 'itemName', width: 160, render: (_value, row) => <DeferredTextInput value={row.itemName} disabled={sortMode} onCommit={(itemName) => onChange({ ...row, itemName })} /> },
    { title: '计划数量', dataIndex: 'plannedQuantity', key: 'plannedQuantity', width: 110, render: (_value, row) => <DeferredNumberInput min={0} disabled={sortMode} value={row.plannedQuantity} onCommit={(plannedQuantity) => onChange({ ...row, plannedQuantity })} /> },
    { title: '实际数量', dataIndex: 'actualQuantity', key: 'actualQuantity', width: 110, render: (_value, row) => <DeferredNumberInput min={0} disabled={sortMode} value={row.actualQuantity} onCommit={(actualQuantity) => onChange({ ...row, actualQuantity })} /> },
    { title: '计划金额', dataIndex: 'plannedAmount', key: 'plannedAmount', width: 130, align: 'right', render: (_value, row) => <DeferredNumberInput min={0} precision={2} disabled={sortMode} value={row.plannedAmount} onCommit={(plannedAmount) => onChange({ ...row, plannedAmount })} /> },
    { title: '实际金额', dataIndex: 'actualAmount', key: 'actualAmount', width: 130, align: 'right', render: (_value, row) => <DeferredNumberInput min={0} precision={2} disabled={sortMode} value={row.actualAmount} onCommit={(actualAmount) => onChange({ ...row, actualAmount })} /> },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (_value, row) => (
        <Select
          value={row.status}
          disabled={sortMode}
          style={{ width: 105 }}
          options={Object.entries(SHOPPING_STATUS_LABELS).map(([value, option]) => ({ value, label: option.text }))}
          onChange={(status) => onChange({ ...row, status })}
        />
      ),
    },
    { title: '占用金额', dataIndex: 'usedAmount', key: 'usedAmount', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '备注', dataIndex: 'remark', key: 'remark', width: 180, render: (_value, row) => <DeferredTextInput value={row.remark} disabled={sortMode} onCommit={(remark) => onChange({ ...row, remark })} /> },
    { title: '操作', key: 'action', fixed: 'right', width: 90, render: (_value, row) => <Button danger type="link" disabled={sortMode} onClick={() => onDelete(row.id)}>删除</Button> },
  ];

  return (
    <div className="page-section shopping-nested-section">
      <div className="section-header">
        <div>
          <Typography.Title level={4}>购物明细</Typography.Title>
          <Typography.Text type="secondary">选择品类后，品类预算以档案为准实时联动</Typography.Text>
        </div>
        <Space>
          <Select
            value={statusFilter}
            disabled={sortMode}
            style={{ width: 110 }}
            options={[
              { value: 'all', label: '全部' },
              ...Object.entries(SHOPPING_STATUS_LABELS).map(([value, option]) => ({ value, label: option.text })),
            ]}
            onChange={setStatusFilter}
          />
          {sortMode ? (
            <>
              <Button type="primary" onClick={onSaveSort}>保存排序</Button>
              <Button onClick={onCancelSort}>取消</Button>
            </>
          ) : (
            <Button disabled={rows.length < 2} onClick={onStartSort}>排序</Button>
          )}
          <Button type="primary" disabled={sortMode || categories.length === 0} onClick={onAdd}>新增明细</Button>
        </Space>
      </div>
      <div style={{ minHeight: rows.length ? getShoppingBudgetTableMinHeight(rows.length) : undefined }}>
        {rows.length ? <Table rowKey="id" columns={columns} dataSource={displayedRows} pagination={false} scroll={{ x: 1350 }} /> : <Empty description={categories.length ? '当前分类计划还没有购物明细' : '请先新增品类预算档案'} />}
      </div>
    </div>
  );
}

function getShoppingBudgetTableMinHeight(rowCount: number): number {
  return 56 + rowCount * 73;
}

function buildDragColumn<T extends { id: string }>(rows: T[], sortMode: boolean, onReorder: (orderedIds: string[]) => void): TableColumnsType<T> {
  if (!sortMode) {
    return [];
  }

  return [
    {
      title: '',
      key: 'drag',
      width: 58,
      align: 'center',
      render: (_value, row) => (
        <button
          type="button"
          className="asset-drag-handle"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', row.id);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(event) => {
            event.preventDefault();
            const sourceId = event.dataTransfer.getData('text/plain');
            if (!sourceId || sourceId === row.id) {
              return;
            }
            onReorder(moveId(rows.map((item) => item.id), sourceId, row.id));
          }}
          aria-label="拖拽排序"
        >
          <MenuOutlined />
        </button>
      ),
    },
  ];
}

function moveId(ids: string[], sourceId: string, targetId: string): string[] {
  const fromIndex = ids.indexOf(sourceId);
  const toIndex = ids.indexOf(targetId);

  if (fromIndex < 0 || toIndex < 0) {
    return ids;
  }

  const nextIds = [...ids];
  const [movedId] = nextIds.splice(fromIndex, 1);
  nextIds.splice(toIndex, 0, movedId);
  return nextIds;
}

function reorderByIds<T extends { id: string }>(items: T[], orderedIds: string[]): T[] {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  return orderedIds.map((id) => itemMap.get(id)).filter((item): item is T => Boolean(item));
}

function applySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

function getNextSortOrder(items: Array<{ sortOrder: number }>): number {
  return Math.max(0, ...items.map((item) => item.sortOrder || 0)) + 1;
}

function buildMonthOptions(monthlyBills: MonthlyBill[], monthlyBudgets: MonthlyCategoryBudget[]): string[] {
  return Array.from(new Set([...monthlyBills.map((bill) => bill.month), ...monthlyBudgets.map((budget) => budget.month), getCurrentMonth()])).sort((a, b) => b.localeCompare(a));
}

function getCurrentMonth(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
