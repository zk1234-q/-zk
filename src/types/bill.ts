export type RawBillRecord = Record<string, unknown>;

export interface StandardBillRecord {
  id: string;
  rawIndex: number;
  rawRecord?: RawBillRecord;
  date: string;
  month: string;
  type: string;
  amount: number;
  expenseAmount: number;
  incomeAmount: number;
  primaryCategory: string;
  secondaryCategory: string;
  merchant: string;
  paymentMethod: string;
  note: string;
  isIncludedInExpense: boolean;
  abnormalReason: string;
}

export interface AbnormalBillRecord {
  id: string;
  rawIndex: number;
  month?: string;
  reason: string;
  rawDate: string;
  rawType: string;
  rawAmount: string;
  rawPrimaryCategory: string;
  rawSecondaryCategory: string;
  rawNote: string;
  rawRecord: Record<string, unknown>;
}

export interface MonthlyBill {
  id: string;
  month: string;
  fileName: string;
  uploadedAt: string;
  records: StandardBillRecord[];
  abnormalRecords: AbnormalBillRecord[];
  totalExpense: number;
  expenseCount: number;
  abnormalCount: number;
  rawRowCount?: number;
  validExpenseRowCount?: number;
  abnormalRowCount?: number;
}

export interface ParsedBillFile {
  fileName: string;
  rawRecords: RawBillRecord[];
  records: StandardBillRecord[];
  abnormalRecords: AbnormalBillRecord[];
  months: string[];
}

export interface MonthlySummaryRow {
  month: string;
  income: number;
  totalExpense: number;
  balance: number;
  balanceRate: number;
  expenseCount: number;
  abnormalCount: number;
  isPartialMonth: boolean;
  remark: string;
}

export interface PrimaryCategoryRow {
  primaryCategory: string;
  primaryAmount: number;
  primaryExpenseRatio: number;
  primaryIncomeRatio: number;
  count: number;
  remark: string;
  budgetAmount?: number;
  remainingBudgetAmount?: number;
  budgetUsageRate?: number;
  budgetStatus?: 'none' | 'normal' | 'warning' | 'over' | 'unmatched';
  overBudgetAmount?: number;
  overBudgetNote?: string;
}

export interface SecondaryCategoryRow {
  primaryCategory: string;
  secondaryCategory: string;
  secondaryAmount: number;
  secondaryExpenseRatio: number;
  secondaryIncomeRatio: number;
  count: number;
  remark: string;
}

export interface CombinedCategoryRow {
  primaryCategory: string;
  secondaryCategory: string;
  primaryAmount: number;
  primaryExpenseRatio: number;
  secondaryAmount: number;
  secondaryExpenseRatio: number;
  secondaryPrimaryRatio: number;
  primaryIncomeRatio: number;
  secondaryIncomeRatio: number;
  secondaryCount: number;
  budgetAmount?: number;
  remainingBudgetAmount?: number;
  budgetUsageRate?: number;
  budgetStatus?: 'none' | 'normal' | 'warning' | 'over' | 'unmatched';
  overBudgetAmount?: number;
  overBudgetNote?: string;
}

export interface MonthlyExpenseTrendPoint {
  month: string;
  totalExpense: number;
}

export interface PrimaryCategoryChartPoint {
  name: string;
  amount: number;
  ratio: number;
}

export interface SecondaryCategoryRankingPoint {
  name: string;
  primaryCategory: string;
  secondaryCategory: string;
  amount: number;
  ratio: number;
}

export interface DetailFilter {
  month: string;
  primaryCategory?: string;
  secondaryCategory?: string;
  title: string;
  expectedAmount: number;
  budgetInfo?: {
    categoryName: string;
    budgetAmount?: number;
    spentAmount: number;
    remainingAmount?: number;
    overBudgetAmount?: number;
    usageRate?: number;
    status: 'none' | 'normal' | 'warning' | 'over' | 'unmatched';
    overBudgetNote?: string;
  };
}
