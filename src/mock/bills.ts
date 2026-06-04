import type {
  AbnormalBillRecord,
  CombinedCategoryRow,
  MonthlyBill,
  MonthlySummaryRow,
  PrimaryCategoryRow,
  SecondaryCategoryRow,
  StandardBillRecord,
} from '../types/bill';

export const mockBills: StandardBillRecord[] = [
  {
    id: 'bill-1',
    rawIndex: 2,
    date: '2026-05-03',
    month: '2026-05',
    type: '支出',
    amount: 128.6,
    expenseAmount: 128.6,
    incomeAmount: 0,
    primaryCategory: '餐饮',
    secondaryCategory: '正餐',
    merchant: '本地餐厅',
    paymentMethod: '支付宝',
    note: '晚餐',
    isIncludedInExpense: true,
    abnormalReason: '',
  },
  {
    id: 'bill-2',
    rawIndex: 3,
    date: '2026-05-08',
    month: '2026-05',
    type: '支出',
    amount: 320,
    expenseAmount: 320,
    incomeAmount: 0,
    primaryCategory: '交通',
    secondaryCategory: '加油',
    merchant: '加油站',
    paymentMethod: '微信',
    note: '',
    isIncludedInExpense: true,
    abnormalReason: '',
  },
];

export const mockAbnormalRecords: AbnormalBillRecord[] = [
  {
    id: 'abnormal-1',
    rawIndex: 8,
    reason: '金额无法识别',
    rawDate: '2026-05-12',
    rawType: '支出',
    rawAmount: 'abc',
    rawPrimaryCategory: '购物',
    rawSecondaryCategory: '日用品',
    rawNote: '样例异常',
    rawRecord: {},
  },
];

export const mockMonthlyBills: MonthlyBill[] = [
  {
    id: '2026-04',
    month: '2026-04',
    fileName: 'iCost-2026-04.xlsx',
    uploadedAt: '2026-06-04T08:20:00.000Z',
    records: mockBills,
    abnormalRecords: [],
    totalExpense: 2680.4,
    expenseCount: 42,
    abnormalCount: 0,
  },
  {
    id: '2026-05',
    month: '2026-05',
    fileName: 'iCost-2026-05.xlsx',
    uploadedAt: '2026-06-04T09:05:00.000Z',
    records: mockBills,
    abnormalRecords: mockAbnormalRecords,
    totalExpense: 3120.8,
    expenseCount: 58,
    abnormalCount: 1,
  },
];

export const mockMonthlySummary: MonthlySummaryRow[] = [
  {
    month: '2026-05',
    income: 9000,
    totalExpense: 3120.8,
    balance: 5879.2,
    balanceRate: 0.6532,
    expenseCount: 58,
    abnormalCount: 1,
    isPartialMonth: false,
    remark: '',
  },
];

export const mockPrimaryRows: PrimaryCategoryRow[] = [
  { primaryCategory: '餐饮', primaryAmount: 1260.5, primaryExpenseRatio: 0.404, primaryIncomeRatio: 0.14, count: 22, remark: '' },
  { primaryCategory: '交通', primaryAmount: 780.2, primaryExpenseRatio: 0.25, primaryIncomeRatio: 0.087, count: 9, remark: '' },
  { primaryCategory: '购物', primaryAmount: 560.1, primaryExpenseRatio: 0.179, primaryIncomeRatio: 0.062, count: 11, remark: '' },
];

export const mockSecondaryRows: SecondaryCategoryRow[] = [
  { primaryCategory: '餐饮', secondaryCategory: '正餐', secondaryAmount: 860.5, secondaryExpenseRatio: 0.276, secondaryIncomeRatio: 0.096, count: 14, remark: '' },
  { primaryCategory: '交通', secondaryCategory: '加油', secondaryAmount: 520, secondaryExpenseRatio: 0.167, secondaryIncomeRatio: 0.058, count: 4, remark: '' },
  { primaryCategory: '购物', secondaryCategory: '日用品', secondaryAmount: 360.1, secondaryExpenseRatio: 0.115, secondaryIncomeRatio: 0.04, count: 7, remark: '' },
];

export const mockCombinedRows: CombinedCategoryRow[] = [
  {
    primaryCategory: '餐饮',
    secondaryCategory: '正餐',
    primaryAmount: 1260.5,
    primaryExpenseRatio: 0.404,
    secondaryAmount: 860.5,
    secondaryExpenseRatio: 0.276,
    secondaryPrimaryRatio: 0.683,
    primaryIncomeRatio: 0.14,
    secondaryIncomeRatio: 0.096,
    secondaryCount: 14,
  },
  {
    primaryCategory: '交通',
    secondaryCategory: '加油',
    primaryAmount: 780.2,
    primaryExpenseRatio: 0.25,
    secondaryAmount: 520,
    secondaryExpenseRatio: 0.167,
    secondaryPrimaryRatio: 0.666,
    primaryIncomeRatio: 0.087,
    secondaryIncomeRatio: 0.058,
    secondaryCount: 4,
  },
];
