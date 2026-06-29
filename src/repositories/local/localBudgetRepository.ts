import type { BudgetRepository } from '../budgetRepository';
import {
  createId,
  deleteMonthlyCategoryBudget,
  deleteShoppingBudgetItem,
  getAllMonthlyCategoryBudgets,
  getMonthlyCategoryBudgets,
  getShoppingBudgetItems,
  replaceAllMonthlyCategoryBudgets,
  replaceAllShoppingBudgetItems,
  replaceMonthlyCategoryBudgets,
  saveMonthlyCategoryBudget,
  saveMonthlyCategoryBudgets,
  saveShoppingBudgetItem,
} from '../../utils/budgetStorage';

export const localBudgetRepository: BudgetRepository = {
  createId,
  deleteMonthlyCategoryBudget,
  deleteShoppingBudgetItem,
  getAllMonthlyCategoryBudgets,
  getMonthlyCategoryBudgets,
  getShoppingBudgetItems,
  replaceAllMonthlyCategoryBudgets,
  replaceAllShoppingBudgetItems,
  replaceMonthlyCategoryBudgets,
  saveMonthlyCategoryBudget,
  saveMonthlyCategoryBudgets,
  saveShoppingBudgetItem,
};
