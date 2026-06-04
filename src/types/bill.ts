export interface StandardBillRecord {
  id: string;
  rawIndex: number;
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
}
