import type { MonthlyCategoryBudget, ShoppingBudgetItem } from '../types/budget';
import { getDb, MONTHLY_CATEGORY_BUDGET_STORE, SHOPPING_BUDGET_STORE } from './db';

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getAllMonthlyCategoryBudgets(): Promise<MonthlyCategoryBudget[]> {
  const db = await getDb();
  return db.getAll(MONTHLY_CATEGORY_BUDGET_STORE);
}

export async function getMonthlyCategoryBudgets(month: string): Promise<MonthlyCategoryBudget[]> {
  const db = await getDb();
  return db.getAllFromIndex(MONTHLY_CATEGORY_BUDGET_STORE, 'month', month);
}

export async function saveMonthlyCategoryBudget(budget: MonthlyCategoryBudget): Promise<void> {
  const db = await getDb();
  await db.put(MONTHLY_CATEGORY_BUDGET_STORE, { ...budget, updatedAt: new Date().toISOString() });
}

export async function saveMonthlyCategoryBudgets(budgets: MonthlyCategoryBudget[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(MONTHLY_CATEGORY_BUDGET_STORE, 'readwrite');
  await Promise.all(budgets.map((budget) => tx.store.put({ ...budget, updatedAt: new Date().toISOString() })));
  await tx.done;
}

export async function deleteMonthlyCategoryBudget(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(MONTHLY_CATEGORY_BUDGET_STORE, id);
}

export async function replaceMonthlyCategoryBudgets(month: string, budgets: MonthlyCategoryBudget[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(MONTHLY_CATEGORY_BUDGET_STORE, 'readwrite');
  const existing = await tx.store.index('month').getAll(month);
  await Promise.all(existing.map((item) => tx.store.delete(item.id)));
  await Promise.all(budgets.map((budget) => tx.store.put(budget)));
  await tx.done;
}

export async function replaceAllMonthlyCategoryBudgets(budgets: MonthlyCategoryBudget[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(MONTHLY_CATEGORY_BUDGET_STORE, 'readwrite');
  await tx.store.clear();
  await Promise.all(budgets.map((budget) => tx.store.put(budget)));
  await tx.done;
}

export async function getShoppingBudgetItems(): Promise<ShoppingBudgetItem[]> {
  const db = await getDb();
  const items = await db.getAll(SHOPPING_BUDGET_STORE);
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function saveShoppingBudgetItem(item: ShoppingBudgetItem): Promise<void> {
  const db = await getDb();
  await db.put(SHOPPING_BUDGET_STORE, { ...item, updatedAt: new Date().toISOString() });
}

export async function deleteShoppingBudgetItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(SHOPPING_BUDGET_STORE, id);
}

export async function replaceAllShoppingBudgetItems(items: ShoppingBudgetItem[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(SHOPPING_BUDGET_STORE, 'readwrite');
  await tx.store.clear();
  await Promise.all(items.map((item) => tx.store.put(item)));
  await tx.done;
}
