import type { Goal, GoalOverview, GoalSummary } from '../types/goal';

export function calculateGoalSummary(goal: Goal, currentDate = new Date()): GoalSummary {
  const remainingAmount = Math.max(0, roundMoney(goal.targetAmount - goal.currentAmount));
  const progressRate = goal.targetAmount <= 0 ? 0 : clamp(goal.currentAmount / goal.targetAmount, 0, 1);
  const remainingMonths = calculateRemainingMonths(goal.targetDate, currentDate);

  return {
    ...goal,
    remainingAmount,
    progressRate,
    remainingMonths,
    requiredMonthlySaving: remainingAmount <= 0 ? 0 : roundMoney(remainingAmount / Math.max(remainingMonths, 1)),
  };
}

export function calculateGoalSummaries(goals: Goal[], currentDate = new Date()): GoalSummary[] {
  return goals.map((goal) => calculateGoalSummary(goal, currentDate));
}

export function calculateGoalOverview(goals: Goal[]): GoalOverview {
  const activeGoals = goals.filter((goal) => goal.status === 'active');
  const totalTargetAmount = roundMoney(activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0));
  const totalCurrentAmount = roundMoney(activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0));

  return {
    totalTargetAmount,
    totalCurrentAmount,
    totalRemainingAmount: Math.max(0, roundMoney(totalTargetAmount - totalCurrentAmount)),
    activeGoalCount: activeGoals.length,
  };
}

export function createGoalId(): string {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function calculateRemainingMonths(targetDate: string, currentDate: Date): number {
  const [targetYear, targetMonth] = targetDate.split('-').map(Number);

  if (!targetYear || !targetMonth) {
    return 0;
  }

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const diff = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);

  return Math.max(0, diff + 1);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
