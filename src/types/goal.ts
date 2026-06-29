export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  status: GoalStatus;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalSummary extends Goal {
  remainingAmount: number;
  progressRate: number;
  remainingMonths: number;
  requiredMonthlySaving: number;
}

export interface GoalOverview {
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalRemainingAmount: number;
  activeGoalCount: number;
}
