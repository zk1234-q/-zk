import type {
  MonthlyBill,
  MonthlyExpenseTrendPoint,
  PrimaryCategoryChartPoint,
  PrimaryCategoryRow,
  SecondaryCategoryRankingPoint,
  SecondaryCategoryRow,
} from '../types/bill';
import { calculateMonthlySummary } from './calculateSummary';

export function calculateMonthlyExpenseTrend(monthlyBills: MonthlyBill[]): MonthlyExpenseTrendPoint[] {
  return calculateMonthlySummary(monthlyBills).map((item) => ({
    month: item.month,
    totalExpense: item.totalExpense,
  }));
}

export function calculatePrimaryCategoryChart(rows: PrimaryCategoryRow[]): PrimaryCategoryChartPoint[] {
  return rows.map((row) => ({
    name: row.primaryCategory,
    amount: row.primaryAmount,
    ratio: row.primaryExpenseRatio,
  }));
}

export function calculateSecondaryCategoryRanking(rows: SecondaryCategoryRow[]): SecondaryCategoryRankingPoint[] {
  return [...rows]
    .sort((a, b) => b.secondaryAmount - a.secondaryAmount)
    .map((row) => ({
      name: `${row.primaryCategory}-${row.secondaryCategory}`,
      primaryCategory: row.primaryCategory,
      secondaryCategory: row.secondaryCategory,
      amount: row.secondaryAmount,
      ratio: row.secondaryExpenseRatio,
    }));
}
