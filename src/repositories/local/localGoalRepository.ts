import type { GoalRepository } from '../goalRepository';
import { getGoals, replaceAllGoals, saveGoal } from '../../utils/goalStorage';

export const localGoalRepository: GoalRepository = {
  getGoals,
  replaceAllGoals,
  saveGoal,
};
