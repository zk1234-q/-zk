import type { AssetAccount, AssetSnapshot } from './asset';
import type { MonthlyBill } from './bill';
import type { Goal } from './goal';
import type { BudgetSettings, UserSettings } from './settings';

export type CategoryBudgetStatus = 'normal' | 'warning' | 'over' | 'unmatched';
export type AnalysisBudgetStatus = CategoryBudgetStatus | 'none';

export interface MonthlyCategoryBudget {
  id: string;
  month: string;
  categoryName: string;
  budgetAmount: number;
  overBudgetNote: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyCategoryBudgetRow extends MonthlyCategoryBudget {
  spentAmount: number;
  remainingAmount: number;
  usageRate: number;
  status: CategoryBudgetStatus;
  matched: boolean;
}

export interface CategoryOption {
  month: string;
  categoryName: string;
  spentAmount: number;
  count: number;
}

export interface MonthlyBudgetOverview {
  month: string;
  monthlyIncome: number;
  monthlyExpenseBudget: number;
  currentExpense: number;
  remainingExpenseBudget: number;
  monthlySavingTarget: number;
  expectedSaving: number;
  isSavingTargetMet: boolean;
  budgetUsageRate: number;
  hasBill: boolean;
}

export interface MonthlyBudgetSettlement {
  month: string;
  isTotalBudgetOver: boolean;
  isSavingTargetMet: boolean;
  overBudgetCategories: MonthlyCategoryBudgetRow[];
  topRemainingCategories: MonthlyCategoryBudgetRow[];
  categoryRows: MonthlyCategoryBudgetRow[];
}

export type ShoppingBudgetStatus = 'planned' | 'purchased' | 'paused' | 'abandoned';
export type ShoppingBudgetPriority = 'must' | 'should' | 'optional' | 'not_now';

export interface ShoppingBudgetItem {
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

export interface ShoppingBudgetRow extends ShoppingBudgetItem {
  actualTotalAmount: number;
  categoryRemainingAmount: number;
  isOverBudget: boolean;
}

export interface ShoppingBudgetSummary {
  totalBudgetAmount: number;
  totalActualAmount: number;
  totalRemainingAmount: number;
  isOverBudget: boolean;
}

export interface BackupFile {
  appName: 'expense-bill-analyzer';
  schemaVersion: 2 | 3 | 4;
  exportedAt: string;
  userSettings: UserSettings;
  budgetSettings: BudgetSettings;
  monthlyCategoryBudgets: MonthlyCategoryBudget[];
  shoppingBudgetItems: ShoppingBudgetItem[];
  monthlyBills: MonthlyBill[];
  assetAccounts?: AssetAccount[];
  assetSnapshots?: AssetSnapshot[];
  goals?: Goal[];
}
