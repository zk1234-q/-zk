import type { CombinedCategoryRow, MonthlyBill, PrimaryCategoryRow, StandardBillRecord } from '../types/bill';
import type {
  AnalysisBudgetStatus,
  CategoryOption,
  MonthlyBudgetOverview,
  MonthlyBudgetSettlement,
  MonthlyCategoryBudget,
  MonthlyCategoryBudgetRow,
  ShoppingBudgetItem,
  ShoppingBudgetRow,
  ShoppingBudgetSummary,
} from '../types/budget';
import type { BudgetSettings, UserSettings } from '../types/settings';
import { getExpenseRecords } from './calculateSummary';

export function normalizeCategoryName(value: string): string {
  return value.trim();
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getCategoryOptionsFromMonthlyBill(bill?: MonthlyBill): CategoryOption[] {
  if (!bill) {
    return [];
  }

  const grouped = new Map<string, StandardBillRecord[]>();

  for (const record of getExpenseRecords(bill.records, bill.month)) {
    const key = normalizeCategoryName(record.primaryCategory);
    const items = grouped.get(key) ?? [];
    items.push(record);
    grouped.set(key, items);
  }

  return Array.from(grouped.entries())
    .map(([categoryName, records]) => ({
      month: bill.month,
      categoryName,
      spentAmount: roundMoney(records.reduce((sum, record) => sum + record.expenseAmount, 0)),
      count: records.length,
    }))
    .sort((a, b) => b.spentAmount - a.spentAmount);
}

export function calculateMonthlyCategoryBudgetRows(budgets: MonthlyCategoryBudget[], bill?: MonthlyBill): MonthlyCategoryBudgetRow[] {
  const categoryOptions = getCategoryOptionsFromMonthlyBill(bill);
  const spentMap = new Map(categoryOptions.map((option) => [normalizeCategoryName(option.categoryName), option.spentAmount]));

  return budgets
    .map((budget) => {
      const categoryName = normalizeCategoryName(budget.categoryName);
      const matched = spentMap.has(categoryName);
      const spentAmount = spentMap.get(categoryName) ?? 0;
      const remainingAmount = roundMoney(budget.budgetAmount - spentAmount);
      const usageRate = budget.budgetAmount === 0 ? 0 : spentAmount / budget.budgetAmount;

      return {
        ...budget,
        categoryName,
        spentAmount,
        remainingAmount,
        usageRate,
        status: getBudgetStatus(budget.budgetAmount, spentAmount, matched),
        matched,
      };
    })
    .sort((a, b) => b.budgetAmount - a.budgetAmount);
}

export function getBudgetStatus(budgetAmount: number, spentAmount: number, matched: boolean): MonthlyCategoryBudgetRow['status'] {
  if (!matched) {
    return 'unmatched';
  }

  if (budgetAmount === 0 && spentAmount > 0) {
    return 'over';
  }

  if (budgetAmount === 0) {
    return 'normal';
  }

  const usageRate = spentAmount / budgetAmount;

  if (usageRate > 1) {
    return 'over';
  }

  if (usageRate >= 0.8) {
    return 'warning';
  }

  return 'normal';
}

export function calculateMonthlyBudgetOverview(
  month: string,
  bill: MonthlyBill | undefined,
  userSettings: UserSettings,
  budgetSettings: BudgetSettings,
): MonthlyBudgetOverview {
  const currentExpense = bill?.totalExpense ?? 0;
  const monthlyIncome = userSettings.defaultMonthlyIncome;
  const remainingExpenseBudget = roundMoney(budgetSettings.monthlyExpenseBudget - currentExpense);
  const expectedSaving = roundMoney(monthlyIncome - currentExpense);

  return {
    month,
    monthlyIncome,
    monthlyExpenseBudget: budgetSettings.monthlyExpenseBudget,
    currentExpense,
    remainingExpenseBudget,
    monthlySavingTarget: budgetSettings.monthlySavingTarget,
    expectedSaving,
    isSavingTargetMet: expectedSaving >= budgetSettings.monthlySavingTarget,
    budgetUsageRate: budgetSettings.monthlyExpenseBudget === 0 ? 0 : currentExpense / budgetSettings.monthlyExpenseBudget,
    hasBill: Boolean(bill),
  };
}

export function calculateMonthlyBudgetSettlement(
  month: string,
  budgetRows: MonthlyCategoryBudgetRow[],
  overview: MonthlyBudgetOverview,
): MonthlyBudgetSettlement {
  return {
    month,
    isTotalBudgetOver: overview.remainingExpenseBudget < 0,
    isSavingTargetMet: overview.isSavingTargetMet,
    overBudgetCategories: budgetRows.filter((row) => row.status === 'over'),
    topRemainingCategories: [...budgetRows].sort((a, b) => b.remainingAmount - a.remainingAmount).slice(0, 5),
    categoryRows: budgetRows,
  };
}

export function calculateShoppingBudgetRows(items: ShoppingBudgetItem[]): ShoppingBudgetRow[] {
  const categoryTotals = new Map<string, { budget: number; actual: number }>();

  for (const item of items) {
    const categoryName = normalizeCategoryName(item.categoryName);
    const total = categoryTotals.get(categoryName) ?? { budget: 0, actual: 0 };
    total.budget += item.budgetAmount;
    total.actual += item.purchasedQuantity * item.actualUnitAmount;
    categoryTotals.set(categoryName, total);
  }

  return items.map((item) => {
    const categoryName = normalizeCategoryName(item.categoryName);
    const actualTotalAmount = roundMoney(item.purchasedQuantity * item.actualUnitAmount);
    const totals = categoryTotals.get(categoryName) ?? { budget: 0, actual: 0 };

    return {
      ...item,
      categoryName,
      actualTotalAmount,
      categoryRemainingAmount: roundMoney(totals.budget - totals.actual),
      isOverBudget: actualTotalAmount > item.budgetAmount,
    };
  });
}

export function calculateShoppingBudgetSummary(rows: ShoppingBudgetRow[]): ShoppingBudgetSummary {
  const totalBudgetAmount = roundMoney(rows.reduce((sum, row) => sum + row.budgetAmount, 0));
  const totalActualAmount = roundMoney(rows.reduce((sum, row) => sum + row.actualTotalAmount, 0));
  const totalRemainingAmount = roundMoney(totalBudgetAmount - totalActualAmount);

  return {
    totalBudgetAmount,
    totalActualAmount,
    totalRemainingAmount,
    isOverBudget: totalRemainingAmount < 0,
  };
}

export function mergeBudgetStatusIntoPrimaryRows(primaryRows: PrimaryCategoryRow[], budgetRows: MonthlyCategoryBudgetRow[]): PrimaryCategoryRow[] {
  const budgetMap = new Map(budgetRows.map((row) => [normalizeCategoryName(row.categoryName), row]));

  return primaryRows.map((row) => {
    const budget = budgetMap.get(normalizeCategoryName(row.primaryCategory));

    if (!budget) {
      return { ...row, budgetStatus: 'none' as AnalysisBudgetStatus };
    }

    return {
      ...row,
      budgetAmount: budget.budgetAmount,
      remainingBudgetAmount: budget.remainingAmount,
      budgetUsageRate: budget.usageRate,
      budgetStatus: budget.status,
      overBudgetAmount: Math.max(0, roundMoney(budget.spentAmount - budget.budgetAmount)),
      overBudgetNote: budget.overBudgetNote,
    };
  });
}

export function mergeBudgetStatusIntoCombinedRows(combinedRows: CombinedCategoryRow[], budgetRows: MonthlyCategoryBudgetRow[]): CombinedCategoryRow[] {
  const budgetMap = new Map(budgetRows.map((row) => [normalizeCategoryName(row.categoryName), row]));

  return combinedRows.map((row) => {
    const budget = budgetMap.get(normalizeCategoryName(row.primaryCategory));

    if (!budget) {
      return { ...row, budgetStatus: 'none' as AnalysisBudgetStatus };
    }

    return {
      ...row,
      budgetAmount: budget.budgetAmount,
      remainingBudgetAmount: budget.remainingAmount,
      budgetUsageRate: budget.usageRate,
      budgetStatus: budget.status,
      overBudgetAmount: Math.max(0, roundMoney(budget.spentAmount - budget.budgetAmount)),
      overBudgetNote: budget.overBudgetNote,
    };
  });
}
