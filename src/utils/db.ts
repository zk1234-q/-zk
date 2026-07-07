import { openDB, type DBSchema } from 'idb';
import type { AssetAccount, AssetSnapshot } from '../types/asset';
import type { MonthlyBill } from '../types/bill';
import type { MonthlyCategoryBudget, ShoppingBudgetCategory, ShoppingBudgetItem, ShoppingBudgetPlan } from '../types/budget';
import type { Goal } from '../types/goal';
import type { BudgetSettings, UserSettings } from '../types/settings';

export interface ExpenseBillDb extends DBSchema {
  monthlyBills: {
    key: string;
    value: MonthlyBill;
    indexes: {
      month: string;
    };
  };
  userSettings: {
    key: string;
    value: UserSettings;
  };
  budgetSettings: {
    key: string;
    value: BudgetSettings;
  };
  monthlyCategoryBudgets: {
    key: string;
    value: MonthlyCategoryBudget;
    indexes: {
      month: string;
    };
  };
  shoppingBudgetItems: {
    key: string;
    value: ShoppingBudgetItem;
    indexes: {
      planId: string;
      categoryId: string;
    };
  };
  shoppingBudgetPlans: {
    key: string;
    value: ShoppingBudgetPlan;
  };
  shoppingBudgetCategories: {
    key: string;
    value: ShoppingBudgetCategory;
    indexes: {
      planId: string;
    };
  };
  assetAccounts: {
    key: string;
    value: AssetAccount;
  };
  assetSnapshots: {
    key: string;
    value: AssetSnapshot;
    indexes: {
      snapshotDate: string;
    };
  };
  goals: {
    key: string;
    value: Goal;
    indexes: {
      status: string;
    };
  };
}

export const DB_NAME = 'expense-bill-analyzer';
export const DB_VERSION = 5;
export const MONTHLY_BILL_STORE = 'monthlyBills';
export const USER_SETTINGS_STORE = 'userSettings';
export const BUDGET_SETTINGS_STORE = 'budgetSettings';
export const MONTHLY_CATEGORY_BUDGET_STORE = 'monthlyCategoryBudgets';
export const SHOPPING_BUDGET_STORE = 'shoppingBudgetItems';
export const SHOPPING_BUDGET_PLAN_STORE = 'shoppingBudgetPlans';
export const SHOPPING_BUDGET_CATEGORY_STORE = 'shoppingBudgetCategories';
export const ASSET_ACCOUNT_STORE = 'assetAccounts';
export const ASSET_SNAPSHOT_STORE = 'assetSnapshots';
export const GOAL_STORE = 'goals';

export async function getDb() {
  return openDB<ExpenseBillDb>(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion, transaction) {
      if (!db.objectStoreNames.contains(MONTHLY_BILL_STORE)) {
        const store = db.createObjectStore(MONTHLY_BILL_STORE, { keyPath: 'id' });
        store.createIndex('month', 'month', { unique: true });
      }

      if (!db.objectStoreNames.contains(USER_SETTINGS_STORE)) {
        db.createObjectStore(USER_SETTINGS_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(BUDGET_SETTINGS_STORE)) {
        db.createObjectStore(BUDGET_SETTINGS_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(MONTHLY_CATEGORY_BUDGET_STORE)) {
        const store = db.createObjectStore(MONTHLY_CATEGORY_BUDGET_STORE, { keyPath: 'id' });
        store.createIndex('month', 'month', { unique: false });
      }

      if (!db.objectStoreNames.contains(SHOPPING_BUDGET_STORE)) {
        const store = db.createObjectStore(SHOPPING_BUDGET_STORE, { keyPath: 'id' });
        store.createIndex('planId', 'planId', { unique: false });
        store.createIndex('categoryId', 'categoryId', { unique: false });
      } else {
        const store = transaction.objectStore(SHOPPING_BUDGET_STORE);
        if (!store.indexNames.contains('planId')) {
          store.createIndex('planId', 'planId', { unique: false });
        }
        if (!store.indexNames.contains('categoryId')) {
          store.createIndex('categoryId', 'categoryId', { unique: false });
        }
      }

      if (!db.objectStoreNames.contains(SHOPPING_BUDGET_PLAN_STORE)) {
        db.createObjectStore(SHOPPING_BUDGET_PLAN_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(SHOPPING_BUDGET_CATEGORY_STORE)) {
        const store = db.createObjectStore(SHOPPING_BUDGET_CATEGORY_STORE, { keyPath: 'id' });
        store.createIndex('planId', 'planId', { unique: false });
      }

      if (!db.objectStoreNames.contains(ASSET_ACCOUNT_STORE)) {
        db.createObjectStore(ASSET_ACCOUNT_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(ASSET_SNAPSHOT_STORE)) {
        const store = db.createObjectStore(ASSET_SNAPSHOT_STORE, { keyPath: 'id' });
        store.createIndex('snapshotDate', 'snapshotDate', { unique: false });
      }

      if (!db.objectStoreNames.contains(GOAL_STORE)) {
        const store = db.createObjectStore(GOAL_STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
      }
    },
  });
}
