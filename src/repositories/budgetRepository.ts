import type { MonthlyCategoryBudget, ShoppingBudgetCategory, ShoppingBudgetItem, ShoppingBudgetPlan } from '../types/budget';
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
  getShoppingBudgetPlans(): Promise<ShoppingBudgetPlan[]>;
  saveShoppingBudgetPlan(plan: ShoppingBudgetPlan): Promise<void>;
  saveShoppingBudgetPlans(plans: ShoppingBudgetPlan[]): Promise<void>;
  deleteShoppingBudgetPlan(id: string): Promise<void>;
  replaceAllShoppingBudgetPlans(plans: ShoppingBudgetPlan[]): Promise<void>;
  getShoppingBudgetCategories(planId?: string): Promise<ShoppingBudgetCategory[]>;
  saveShoppingBudgetCategory(category: ShoppingBudgetCategory): Promise<void>;
  saveShoppingBudgetCategories(categories: ShoppingBudgetCategory[]): Promise<void>;
  deleteShoppingBudgetCategory(id: string): Promise<void>;
  replaceAllShoppingBudgetCategories(categories: ShoppingBudgetCategory[]): Promise<void>;
  getShoppingBudgetItems(planId?: string): Promise<ShoppingBudgetItem[]>;
  saveShoppingBudgetItem(item: ShoppingBudgetItem): Promise<void>;
  saveShoppingBudgetItems(items: ShoppingBudgetItem[]): Promise<void>;
  deleteShoppingBudgetItem(id: string): Promise<void>;
  replaceAllShoppingBudgetItems(items: ShoppingBudgetItem[]): Promise<void>;
}

export const budgetRepository: BudgetRepository = localBudgetRepository;
