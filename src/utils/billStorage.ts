import { openDB, type DBSchema } from 'idb';
import type { MonthlyBill } from '../types/bill';

interface ExpenseBillDb extends DBSchema {
  monthlyBills: {
    key: string;
    value: MonthlyBill;
    indexes: {
      month: string;
    };
  };
}

const DB_NAME = 'expense-bill-analyzer';
const DB_VERSION = 1;
const MONTHLY_BILL_STORE = 'monthlyBills';

async function getDb() {
  return openDB<ExpenseBillDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(MONTHLY_BILL_STORE, { keyPath: 'id' });
      store.createIndex('month', 'month', { unique: true });
    },
  });
}

export async function getAllMonthlyBills(): Promise<MonthlyBill[]> {
  const db = await getDb();
  const bills = await db.getAll(MONTHLY_BILL_STORE);
  return bills.sort((a, b) => a.month.localeCompare(b.month));
}

export async function getMonthlyBill(month: string): Promise<MonthlyBill | undefined> {
  const db = await getDb();
  return db.get(MONTHLY_BILL_STORE, month);
}

export async function saveMonthlyBill(bill: MonthlyBill): Promise<void> {
  const db = await getDb();
  await db.put(MONTHLY_BILL_STORE, bill);
}

export async function deleteMonthlyBill(month: string): Promise<void> {
  const db = await getDb();
  await db.delete(MONTHLY_BILL_STORE, month);
}

export async function checkMonthlyBillExists(month: string): Promise<boolean> {
  const db = await getDb();
  const bill = await db.get(MONTHLY_BILL_STORE, month);
  return Boolean(bill);
}
