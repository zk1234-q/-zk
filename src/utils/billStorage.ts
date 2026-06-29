import type { MonthlyBill } from '../types/bill';
import { getDb, MONTHLY_BILL_STORE } from './db';

export async function getAllMonthlyBills(): Promise<MonthlyBill[]> {
  const db = await getDb();
  const bills = await db.getAll(MONTHLY_BILL_STORE);
  return bills.sort((a, b) => b.month.localeCompare(a.month));
}

export async function replaceAllMonthlyBills(bills: MonthlyBill[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(MONTHLY_BILL_STORE, 'readwrite');
  await tx.store.clear();
  await Promise.all(bills.map((bill) => tx.store.put(bill)));
  await tx.done;
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
