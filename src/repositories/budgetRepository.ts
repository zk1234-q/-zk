import type { MonthlyCategoryBudget, ShoppingBudgetItem } from '../types/budget';
import { localBudgetRepository } from './local/localBudgetRepository';

export interface BudgetRepository {
  createId(prefix: string): string;
  getAllMonthlyCategoryBudgets(): Promise<MonthlyCategoryBudget[]>;
  getMonthlyCategoryBudgets(month: string): Promise<MonthlyCategoryBudget[]>;
  saveMonthlyCategoryBudget(budget: MonthlyCategoryBudget): Promise<void>;
  saveMonthlyCategoryBudgets(budgets: MonthlyCategoryBudget[]): Promise<void>;
  deleteMonthlyCategoryBudget(id: string): Promise<void>;
  replaceMonthlyCategoryBudgets(month: string, budgets: MonthlyCategoryBudget[]): Promise<void>;
  replaceAllMonthlyCategoryBudgets(budgets: MonthlyCategoryBudget[]): Promise<void>;
  getShoppingBudgetItems(): Promise<ShoppingBudgetItem[]>;
  saveShoppingBudgetItem(item: ShoppingBudgetItem): Promise<void>;
  deleteShoppingBudgetItem(id: string): Promise<void>;
  replaceAllShoppingBudgetItems(items: ShoppingBudgetItem[]): Promise<void>;
}

export const budgetRepository: BudgetRepository = localBudgetRepository;
