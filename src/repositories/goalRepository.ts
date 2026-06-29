import type { Goal } from '../types/goal';
import { localGoalRepository } from './local/localGoalRepository';

export interface GoalRepository {
  getGoals(): Promise<Goal[]>;
  saveGoal(goal: Goal): Promise<void>;
  replaceAllGoals(goals: Goal[]): Promise<void>;
}

export const goalRepository: GoalRepository = localGoalRepository;
