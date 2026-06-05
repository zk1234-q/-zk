import { DEFAULT_MONTHLY_INCOME } from '../constants/bill';
import type {
  CombinedCategoryRow,
  MonthlyBill,
  MonthlySummaryRow,
  PrimaryCategoryRow,
  SecondaryCategoryRow,
  StandardBillRecord,
} from '../types/bill';

export function getExpenseRecords(records: StandardBillRecord[], month?: string): StandardBillRecord[] {
  return records.filter((record) => record.isIncludedInExpense && (!month || record.month === month));
}

export function calculateMonthlySummary(monthlyBills: MonthlyBill[], income = DEFAULT_MONTHLY_INCOME): MonthlySummaryRow[] {
  return monthlyBills
    .map((bill) => {
      const expenseRecords = getExpenseRecords(bill.records);
      const totalExpense = sumAmount(expenseRecords);
      const balance = income - totalExpense;

      return {
        month: bill.month,
        income,
        totalExpense,
        balance,
        balanceRate: income === 0 ? 0 : balance / income,
        expenseCount: expenseRecords.length,
        abnormalCount: bill.abnormalRecords.length,
        isPartialMonth: isPartialMonth(bill.month, expenseRecords),
        remark: isPartialMonth(bill.month, expenseRecords) ? '非完整月，仅参考' : '',
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function calculatePrimaryCategoryRows(records: StandardBillRecord[], month: string, income = DEFAULT_MONTHLY_INCOME): PrimaryCategoryRow[] {
  const expenseRecords = getExpenseRecords(records, month);
  const totalExpense = sumAmount(expenseRecords);
  const grouped = groupBy(expenseRecords, (record) => record.primaryCategory);

  return Array.from(grouped.entries())
    .map(([primaryCategory, items]) => {
      const primaryAmount = sumAmount(items);
      return {
        primaryCategory,
        primaryAmount,
        primaryExpenseRatio: totalExpense === 0 ? 0 : primaryAmount / totalExpense,
        primaryIncomeRatio: income === 0 ? 0 : primaryAmount / income,
        count: items.length,
        remark: '',
      };
    })
    .sort((a, b) => b.primaryAmount - a.primaryAmount);
}

export function calculateSecondaryCategoryRows(records: StandardBillRecord[], month: string, income = DEFAULT_MONTHLY_INCOME): SecondaryCategoryRow[] {
  const expenseRecords = getExpenseRecords(records, month);
  const totalExpense = sumAmount(expenseRecords);
  const primaryRows = calculatePrimaryCategoryRows(records, month, income);
  const primaryRankMap = new Map(primaryRows.map((row, index) => [row.primaryCategory, index]));
  const grouped = groupBy(expenseRecords, (record) => `${record.primaryCategory}||${record.secondaryCategory}`);

  return Array.from(grouped.entries())
    .map(([key, items]) => {
      const [primaryCategory, secondaryCategory] = key.split('||');
      const secondaryAmount = sumAmount(items);
      return {
        primaryCategory,
        secondaryCategory,
        secondaryAmount,
        secondaryExpenseRatio: totalExpense === 0 ? 0 : secondaryAmount / totalExpense,
        secondaryIncomeRatio: income === 0 ? 0 : secondaryAmount / income,
        count: items.length,
        remark: '',
      };
    })
    .sort((a, b) => {
      const primaryDiff = (primaryRankMap.get(a.primaryCategory) ?? Number.MAX_SAFE_INTEGER) - (primaryRankMap.get(b.primaryCategory) ?? Number.MAX_SAFE_INTEGER);

      if (primaryDiff !== 0) {
        return primaryDiff;
      }

      return b.secondaryAmount - a.secondaryAmount;
    });
}

export function calculateCombinedCategoryRows(records: StandardBillRecord[], month: string, income = DEFAULT_MONTHLY_INCOME): CombinedCategoryRow[] {
  const primaryRows = calculatePrimaryCategoryRows(records, month, income);
  const secondaryRows = calculateSecondaryCategoryRows(records, month, income);

  return primaryRows.flatMap((primaryRow) =>
    secondaryRows
      .filter((secondaryRow) => secondaryRow.primaryCategory === primaryRow.primaryCategory)
      .map((secondaryRow) => ({
        primaryCategory: secondaryRow.primaryCategory,
        secondaryCategory: secondaryRow.secondaryCategory,
        primaryAmount: primaryRow.primaryAmount,
        primaryExpenseRatio: primaryRow.primaryExpenseRatio,
        secondaryAmount: secondaryRow.secondaryAmount,
        secondaryExpenseRatio: secondaryRow.secondaryExpenseRatio,
        secondaryPrimaryRatio: primaryRow.primaryAmount === 0 ? 0 : secondaryRow.secondaryAmount / primaryRow.primaryAmount,
        primaryIncomeRatio: primaryRow.primaryIncomeRatio,
        secondaryIncomeRatio: secondaryRow.secondaryIncomeRatio,
        secondaryCount: secondaryRow.count,
      })),
  );
}

export function filterDetailRecords(records: StandardBillRecord[], month: string, primaryCategory?: string, secondaryCategory?: string): StandardBillRecord[] {
  return getExpenseRecords(records, month).filter((record) => {
    if (primaryCategory && record.primaryCategory !== primaryCategory) {
      return false;
    }

    if (secondaryCategory && record.secondaryCategory !== secondaryCategory) {
      return false;
    }

    return true;
  });
}

export function sumAmount(records: StandardBillRecord[]): number {
  return roundMoney(records.reduce((sum, record) => sum + record.expenseAmount, 0));
}

function groupBy<T>(items: T[], getKey: (item: T) => string): Map<string, T[]> {
  return items.reduce((map, item) => {
    const key = getKey(item);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
    return map;
  }, new Map<string, T[]>());
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function isPartialMonth(month: string, records: StandardBillRecord[]): boolean {
  if (records.length === 0) {
    return false;
  }

  const [year, monthNumber] = month.split('-').map(Number);

  if (!year || !monthNumber) {
    return false;
  }

  const billMonthStart = new Date(year, monthNumber - 1, 1);
  const currentDate = new Date();
  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  return billMonthStart >= currentMonthStart;
}
