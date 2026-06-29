import type { BillRepository } from '../billRepository';
import {
  checkMonthlyBillExists,
  deleteMonthlyBill,
  getAllMonthlyBills,
  getMonthlyBill,
  replaceAllMonthlyBills,
  saveMonthlyBill,
} from '../../utils/billStorage';

export const localBillRepository: BillRepository = {
  checkMonthlyBillExists,
  deleteMonthlyBill,
  getAllMonthlyBills,
  getMonthlyBill,
  replaceAllMonthlyBills,
  saveMonthlyBill,
};
