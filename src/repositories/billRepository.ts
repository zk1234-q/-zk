import type { MonthlyBill } from '../types/bill';
import { localBillRepository } from './local/localBillRepository';

export interface BillRepository {
  getAllMonthlyBills(): Promise<MonthlyBill[]>;
  replaceAllMonthlyBills(bills: MonthlyBill[]): Promise<void>;
  getMonthlyBill(month: string): Promise<MonthlyBill | undefined>;
  saveMonthlyBill(bill: MonthlyBill): Promise<void>;
  deleteMonthlyBill(month: string): Promise<void>;
  checkMonthlyBillExists(month: string): Promise<boolean>;
}

export const billRepository: BillRepository = localBillRepository;
