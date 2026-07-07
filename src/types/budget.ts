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

export interface ShoppingBudgetPlan {
  id: string;
  name: string;
  totalBudgetAmount: number;
  sortOrder: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingBudgetCategory {
  id: string;
  planId: string;
  name: string;
  budgetAmount: number;
  sortOrder: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingBudgetItem {
  id: string;
  planId: string;
  categoryId: string;
  itemName: string;
  plannedQuantity: number;
  actualQuantity: number;
  plannedAmount: number;
  actualAmount: number;
  status: ShoppingBudgetStatus;
  sortOrder: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface LegacyShoppingBudgetItem {
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
  priority?: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingBudgetPlanRow extends ShoppingBudgetPlan {
  usedAmount: number;
  remainingAmount: number;
  isOverBudget: boolean;
}

export interface ShoppingBudgetCategoryRow extends ShoppingBudgetCategory {
  plannedAmount: number;
  actualAmount: number;
  usedAmount: number;
  remainingAmount: number;
  isPlanOverBudget: boolean;
  isActualOverBudget: boolean;
  isUsedOverBudget: boolean;
}

export interface ShoppingBudgetItemRow extends ShoppingBudgetItem {
  categoryName: string;
  categoryBudgetAmount: number;
  usedAmount: number;
}

export interface ShoppingBudgetSummary {
  totalBudgetAmount: number;
  totalUsedAmount: number;
  totalRemainingAmount: number;
  isOverBudget: boolean;
}

export interface BackupFile {
  appName: 'expense-bill-analyzer';
  schemaVersion: 2 | 3 | 4 | 5;
  exportedAt: string;
  userSettings: UserSettings;
  budgetSettings: BudgetSettings;
  monthlyCategoryBudgets: MonthlyCategoryBudget[];
  shoppingBudgetPlans?: ShoppingBudgetPlan[];
  shoppingBudgetCategories?: ShoppingBudgetCategory[];
  shoppingBudgetItems: Array<ShoppingBudgetItem | LegacyShoppingBudgetItem>;
  monthlyBills: MonthlyBill[];
  assetAccounts?: AssetAccount[];
  assetSnapshots?: AssetSnapshot[];
  goals?: Goal[];
}
