import type { BackupFile } from '../types/budget';
import { getAssetAccounts, getAssetSnapshots, replaceAllAssetAccounts, replaceAllAssetSnapshots } from './assetStorage';
import { getAllMonthlyBills, replaceAllMonthlyBills } from './billStorage';
import {
  getAllMonthlyCategoryBudgets,
  getShoppingBudgetCategories,
  getShoppingBudgetItems,
  getShoppingBudgetPlans,
  normalizeShoppingBudgetData,
  replaceAllMonthlyCategoryBudgets,
  replaceAllShoppingBudgetData,
} from './budgetStorage';
import { getGoals, replaceAllGoals } from './goalStorage';
import { getBudgetSettings, getUserSettings, saveBudgetSettings, saveUserSettings } from './settingsStorage';

export async function buildBackupFile(): Promise<BackupFile> {
  return {
    appName: 'expense-bill-analyzer',
    schemaVersion: 5,
    exportedAt: new Date().toISOString(),
    userSettings: await getUserSettings(),
    budgetSettings: await getBudgetSettings(),
    monthlyCategoryBudgets: await getAllMonthlyCategoryBudgets(),
    shoppingBudgetPlans: await getShoppingBudgetPlans(),
    shoppingBudgetCategories: await getShoppingBudgetCategories(),
    shoppingBudgetItems: await getShoppingBudgetItems(),
    monthlyBills: await getAllMonthlyBills(),
    assetAccounts: await getAssetAccounts(),
    assetSnapshots: await getAssetSnapshots(),
    goals: await getGoals(),
  };
}

export async function exportLocalData(): Promise<void> {
  const backup = await buildBackupFile();
  const content = JSON.stringify(backup, null, 2);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  const timestamp = formatBackupTimestamp(new Date());

  link.href = URL.createObjectURL(blob);
  link.download = `expense-bill-analyzer-backup-${timestamp}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function validateBackupFile(value: unknown): BackupFile {
  if (!isObject(value)) {
    throw new Error('备份文件格式不正确');
  }

  if (value.appName !== 'expense-bill-analyzer' || (value.schemaVersion !== 2 && value.schemaVersion !== 3 && value.schemaVersion !== 4 && value.schemaVersion !== 5)) {
    throw new Error('不是当前系统支持的备份文件');
  }

  if (!isObject(value.userSettings) || !isObject(value.budgetSettings)) {
    throw new Error('备份文件缺少设置数据');
  }

  if (!Array.isArray(value.monthlyCategoryBudgets) || !Array.isArray(value.shoppingBudgetItems) || !Array.isArray(value.monthlyBills)) {
    throw new Error('备份文件缺少预算或账单数据');
  }

  const backup = value as unknown as BackupFile;

  if (backup.schemaVersion === 3 && (!Array.isArray(backup.assetAccounts) || !Array.isArray(backup.assetSnapshots))) {
    throw new Error('备份文件缺少资产数据');
  }

  if (backup.schemaVersion === 4 && (!Array.isArray(backup.assetAccounts) || !Array.isArray(backup.assetSnapshots) || !Array.isArray(backup.goals))) {
    throw new Error('备份文件缺少资产或目标数据');
  }

  if (backup.schemaVersion === 5 && (!Array.isArray(backup.assetAccounts) || !Array.isArray(backup.assetSnapshots) || !Array.isArray(backup.goals) || !Array.isArray(backup.shoppingBudgetPlans) || !Array.isArray(backup.shoppingBudgetCategories))) {
    throw new Error('备份文件缺少预算、资产或目标数据');
  }

  return {
    ...backup,
    shoppingBudgetPlans: backup.shoppingBudgetPlans ?? [],
    shoppingBudgetCategories: backup.shoppingBudgetCategories ?? [],
    assetAccounts: backup.assetAccounts ?? [],
    assetSnapshots: backup.assetSnapshots ?? [],
    goals: backup.goals ?? [],
  };
}

export async function importLocalData(backup: BackupFile): Promise<void> {
  await saveUserSettings(backup.userSettings);
  await saveBudgetSettings(backup.budgetSettings);
  await replaceAllMonthlyCategoryBudgets(backup.monthlyCategoryBudgets);
  await replaceAllShoppingBudgetData(normalizeShoppingBudgetData(backup.shoppingBudgetPlans, backup.shoppingBudgetCategories, backup.shoppingBudgetItems));
  await replaceAllMonthlyBills(backup.monthlyBills);
  await replaceAllAssetAccounts(backup.assetAccounts ?? []);
  await replaceAllAssetSnapshots(backup.assetSnapshots ?? []);
  await replaceAllGoals(backup.goals ?? []);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function formatBackupTimestamp(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}
