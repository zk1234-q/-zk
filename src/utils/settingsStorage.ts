import { DEFAULT_MONTHLY_INCOME } from '../constants/bill';
import type { BudgetSettings, UserSettings } from '../types/settings';
import { BUDGET_SETTINGS_STORE, getDb, USER_SETTINGS_STORE } from './db';

const USER_SETTINGS_ID = 'user-settings';
const BUDGET_SETTINGS_ID = 'budget-settings';

export function createDefaultUserSettings(): UserSettings {
  return {
    id: USER_SETTINGS_ID,
    defaultMonthlyIncome: DEFAULT_MONTHLY_INCOME,
    currency: 'CNY',
    updatedAt: new Date().toISOString(),
  };
}

export function createDefaultBudgetSettings(): BudgetSettings {
  return {
    id: BUDGET_SETTINGS_ID,
    annualExpenseBudget: 0,
    monthlySavingTarget: 0,
    monthlyExpenseBudget: 0,
    updatedAt: new Date().toISOString(),
  };
}

export async function getUserSettings(): Promise<UserSettings> {
  const db = await getDb();
  const settings = await db.get(USER_SETTINGS_STORE, USER_SETTINGS_ID);
  return settings ?? createDefaultUserSettings();
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  const db = await getDb();
  await db.put(USER_SETTINGS_STORE, { ...settings, updatedAt: new Date().toISOString() });
}

export async function getBudgetSettings(): Promise<BudgetSettings> {
  const db = await getDb();
  const settings = await db.get(BUDGET_SETTINGS_STORE, BUDGET_SETTINGS_ID);
  return settings ?? createDefaultBudgetSettings();
}

export async function saveBudgetSettings(settings: BudgetSettings): Promise<void> {
  const db = await getDb();
  await db.put(BUDGET_SETTINGS_STORE, { ...settings, updatedAt: new Date().toISOString() });
}
