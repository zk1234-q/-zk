import type { LegacyShoppingBudgetItem, MonthlyCategoryBudget, ShoppingBudgetCategory, ShoppingBudgetItem, ShoppingBudgetPlan } from '../types/budget';
import { getDb, MONTHLY_CATEGORY_BUDGET_STORE, SHOPPING_BUDGET_CATEGORY_STORE, SHOPPING_BUDGET_PLAN_STORE, SHOPPING_BUDGET_STORE } from './db';

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

export async function getShoppingBudgetPlans(): Promise<ShoppingBudgetPlan[]> {
  await ensureShoppingBudgetMigration();
  const db = await getDb();
  const plans = await db.getAll(SHOPPING_BUDGET_PLAN_STORE);
  return sortByOrder(plans);
}

export async function saveShoppingBudgetPlan(plan: ShoppingBudgetPlan): Promise<void> {
  const db = await getDb();
  await db.put(SHOPPING_BUDGET_PLAN_STORE, { ...plan, updatedAt: new Date().toISOString() });
}

export async function deleteShoppingBudgetPlan(id: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction([SHOPPING_BUDGET_PLAN_STORE, SHOPPING_BUDGET_CATEGORY_STORE, SHOPPING_BUDGET_STORE], 'readwrite');
  const categories = await tx.objectStore(SHOPPING_BUDGET_CATEGORY_STORE).index('planId').getAll(id);
  const items = await tx.objectStore(SHOPPING_BUDGET_STORE).index('planId').getAll(id);
  await Promise.all([
    tx.objectStore(SHOPPING_BUDGET_PLAN_STORE).delete(id),
    ...categories.map((category) => tx.objectStore(SHOPPING_BUDGET_CATEGORY_STORE).delete(category.id)),
    ...items.map((item) => tx.objectStore(SHOPPING_BUDGET_STORE).delete(item.id)),
  ]);
  await tx.done;
}

export async function replaceAllShoppingBudgetPlans(plans: ShoppingBudgetPlan[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(SHOPPING_BUDGET_PLAN_STORE, 'readwrite');
  await tx.store.clear();
  await Promise.all(plans.map((plan) => tx.store.put(plan)));
  await tx.done;
}

export async function saveShoppingBudgetPlans(plans: ShoppingBudgetPlan[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(SHOPPING_BUDGET_PLAN_STORE, 'readwrite');
  await Promise.all(plans.map((plan) => tx.store.put({ ...plan, updatedAt: new Date().toISOString() })));
  await tx.done;
}

export async function getShoppingBudgetCategories(planId?: string): Promise<ShoppingBudgetCategory[]> {
  await ensureShoppingBudgetMigration();
  const db = await getDb();
  const categories = planId ? await db.getAllFromIndex(SHOPPING_BUDGET_CATEGORY_STORE, 'planId', planId) : await db.getAll(SHOPPING_BUDGET_CATEGORY_STORE);
  return sortByOrder(categories);
}

export async function saveShoppingBudgetCategory(category: ShoppingBudgetCategory): Promise<void> {
  const db = await getDb();
  await db.put(SHOPPING_BUDGET_CATEGORY_STORE, { ...category, updatedAt: new Date().toISOString() });
}

export async function deleteShoppingBudgetCategory(id: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction([SHOPPING_BUDGET_CATEGORY_STORE, SHOPPING_BUDGET_STORE], 'readwrite');
  const items = await tx.objectStore(SHOPPING_BUDGET_STORE).index('categoryId').getAll(id);
  await Promise.all([
    tx.objectStore(SHOPPING_BUDGET_CATEGORY_STORE).delete(id),
    ...items.map((item) => tx.objectStore(SHOPPING_BUDGET_STORE).delete(item.id)),
  ]);
  await tx.done;
}

export async function replaceAllShoppingBudgetCategories(categories: ShoppingBudgetCategory[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(SHOPPING_BUDGET_CATEGORY_STORE, 'readwrite');
  await tx.store.clear();
  await Promise.all(categories.map((category) => tx.store.put(category)));
  await tx.done;
}

export async function saveShoppingBudgetCategories(categories: ShoppingBudgetCategory[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(SHOPPING_BUDGET_CATEGORY_STORE, 'readwrite');
  await Promise.all(categories.map((category) => tx.store.put({ ...category, updatedAt: new Date().toISOString() })));
  await tx.done;
}

export async function getShoppingBudgetItems(planId?: string): Promise<ShoppingBudgetItem[]> {
  await ensureShoppingBudgetMigration();
  const db = await getDb();
  const items = planId ? await db.getAllFromIndex(SHOPPING_BUDGET_STORE, 'planId', planId) : await db.getAll(SHOPPING_BUDGET_STORE);
  return sortByOrder(items.map(normalizeShoppingBudgetItem));
}

export async function saveShoppingBudgetItem(item: ShoppingBudgetItem): Promise<void> {
  const db = await getDb();
  await db.put(SHOPPING_BUDGET_STORE, { ...normalizeShoppingBudgetItem(item), updatedAt: new Date().toISOString() });
}

export async function deleteShoppingBudgetItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(SHOPPING_BUDGET_STORE, id);
}

export async function replaceAllShoppingBudgetItems(items: ShoppingBudgetItem[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(SHOPPING_BUDGET_STORE, 'readwrite');
  await tx.store.clear();
  await Promise.all(items.map((item) => tx.store.put(normalizeShoppingBudgetItem(item))));
  await tx.done;
}

export async function saveShoppingBudgetItems(items: ShoppingBudgetItem[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(SHOPPING_BUDGET_STORE, 'readwrite');
  await Promise.all(items.map((item) => tx.store.put({ ...normalizeShoppingBudgetItem(item), updatedAt: new Date().toISOString() })));
  await tx.done;
}

export async function replaceAllShoppingBudgetData(data: {
  plans: ShoppingBudgetPlan[];
  categories: ShoppingBudgetCategory[];
  items: ShoppingBudgetItem[];
}): Promise<void> {
  const db = await getDb();
  const tx = db.transaction([SHOPPING_BUDGET_PLAN_STORE, SHOPPING_BUDGET_CATEGORY_STORE, SHOPPING_BUDGET_STORE], 'readwrite');
  await Promise.all([tx.objectStore(SHOPPING_BUDGET_PLAN_STORE).clear(), tx.objectStore(SHOPPING_BUDGET_CATEGORY_STORE).clear(), tx.objectStore(SHOPPING_BUDGET_STORE).clear()]);
  await Promise.all([
    ...data.plans.map((plan) => tx.objectStore(SHOPPING_BUDGET_PLAN_STORE).put(plan)),
    ...data.categories.map((category) => tx.objectStore(SHOPPING_BUDGET_CATEGORY_STORE).put(category)),
    ...data.items.map((item) => tx.objectStore(SHOPPING_BUDGET_STORE).put(normalizeShoppingBudgetItem(item))),
  ]);
  await tx.done;
}

export function normalizeShoppingBudgetData(
  plans: ShoppingBudgetPlan[] | undefined,
  categories: ShoppingBudgetCategory[] | undefined,
  items: Array<ShoppingBudgetItem | LegacyShoppingBudgetItem>,
): { plans: ShoppingBudgetPlan[]; categories: ShoppingBudgetCategory[]; items: ShoppingBudgetItem[] } {
  if (plans?.length || categories?.length || items.every(isShoppingBudgetItem)) {
    return {
      plans: sortByOrder(plans ?? []),
      categories: sortByOrder(categories ?? []),
      items: sortByOrder(items.filter(isShoppingBudgetItem).map(normalizeShoppingBudgetItem)),
    };
  }

  return migrateLegacyShoppingBudgetItems(items.filter(isLegacyShoppingBudgetItem));
}

async function ensureShoppingBudgetMigration(): Promise<void> {
  const db = await getDb();
  const [plans, rawItems] = await Promise.all([db.getAll(SHOPPING_BUDGET_PLAN_STORE), db.getAll(SHOPPING_BUDGET_STORE) as Promise<unknown[]>]);

  if (plans.length > 0 || rawItems.length === 0 || rawItems.every(isShoppingBudgetItem)) {
    return;
  }

  const migrated = migrateLegacyShoppingBudgetItems(rawItems.filter(isLegacyShoppingBudgetItem));
  await replaceAllShoppingBudgetData(migrated);
}

function migrateLegacyShoppingBudgetItems(legacyItems: LegacyShoppingBudgetItem[]): {
  plans: ShoppingBudgetPlan[];
  categories: ShoppingBudgetCategory[];
  items: ShoppingBudgetItem[];
} {
  if (legacyItems.length === 0) {
    return { plans: [], categories: [], items: [] };
  }

  const now = new Date().toISOString();
  const planId = createId('shopping-plan');
  const categoryMap = new Map<string, ShoppingBudgetCategory>();
  const categoryBudgetMap = new Map<string, number>();

  legacyItems.forEach((item) => {
    const categoryName = normalizeText(item.categoryName) || '未分类';
    categoryBudgetMap.set(categoryName, roundMoney((categoryBudgetMap.get(categoryName) ?? 0) + Number(item.budgetAmount || 0)));
  });

  Array.from(categoryBudgetMap.entries()).forEach(([categoryName, budgetAmount], index) => {
    categoryMap.set(categoryName, {
      id: createId('shopping-category'),
      planId,
      name: categoryName,
      budgetAmount,
      sortOrder: index + 1,
      remark: '',
      createdAt: now,
      updatedAt: now,
    });
  });

  const items = legacyItems.map((item, index) => {
    const categoryName = normalizeText(item.categoryName) || '未分类';
    const category = categoryMap.get(categoryName);
    const actualAmount = roundMoney(Number(item.purchasedQuantity || 0) * Number(item.actualUnitAmount || 0));
    const remarkParts = [item.remark, item.purchasedItem ? `购买内容：${item.purchasedItem}` : '', item.recommendedPlan ? `推荐方案：${item.recommendedPlan}` : ''].filter(Boolean);

    return {
      id: item.id || createId('shopping-budget'),
      planId,
      categoryId: category?.id ?? '',
      itemName: normalizeText(item.itemName || item.purchasedItem) || categoryName,
      plannedQuantity: Number(item.plannedQuantity || 0),
      actualQuantity: Number(item.purchasedQuantity || 0),
      plannedAmount: roundMoney(Number(item.budgetAmount || 0)),
      actualAmount,
      status: Number(item.purchasedQuantity || 0) > 0 ? 'purchased' : normalizeShoppingStatus(item.status),
      sortOrder: index + 1,
      remark: remarkParts.join('；'),
      createdAt: item.createdAt || now,
      updatedAt: now,
    };
  });

  const totalBudgetAmount = roundMoney(Array.from(categoryBudgetMap.values()).reduce((sum, value) => sum + value, 0));
  const plan: ShoppingBudgetPlan = {
    id: planId,
    name: '默认购物预算',
    totalBudgetAmount,
    sortOrder: 1,
    remark: '由旧版独立购物预算自动迁移',
    createdAt: now,
    updatedAt: now,
  };

  return {
    plans: [plan],
    categories: sortByOrder(Array.from(categoryMap.values())),
    items,
  };
}

function sortByOrder<T extends { sortOrder?: number; createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER) || a.createdAt.localeCompare(b.createdAt));
}

function isShoppingBudgetItem(value: unknown): value is ShoppingBudgetItem {
  return isObject(value) && typeof value.planId === 'string' && typeof value.categoryId === 'string' && typeof value.plannedAmount === 'number';
}

function normalizeShoppingBudgetItem(item: ShoppingBudgetItem): ShoppingBudgetItem {
  return {
    ...item,
    plannedQuantity: Number(item.plannedQuantity || 0),
    actualQuantity: Number(item.actualQuantity || 0),
    plannedAmount: roundMoney(Number(item.plannedAmount || 0)),
    actualAmount: roundMoney(Number(item.actualAmount || 0)),
    status: normalizeShoppingStatus(item.status),
  };
}

function isLegacyShoppingBudgetItem(value: unknown): value is LegacyShoppingBudgetItem {
  return isObject(value) && typeof value.categoryName === 'string' && typeof value.budgetAmount === 'number';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeShoppingStatus(status: string): ShoppingBudgetItem['status'] {
  return status === 'purchased' || status === 'paused' || status === 'abandoned' ? status : 'planned';
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
