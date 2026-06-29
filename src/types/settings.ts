export interface UserSettings {
  id: 'user-settings';
  defaultMonthlyIncome: number;
  currency: 'CNY';
  updatedAt: string;
}

export interface BudgetSettings {
  id: 'budget-settings';
  annualExpenseBudget: number;
  monthlySavingTarget: number;
  monthlyExpenseBudget: number;
  updatedAt: string;
}
