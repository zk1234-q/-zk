import type { Goal } from '../types/goal';
import { getDb, GOAL_STORE } from './db';

export async function getGoals(): Promise<Goal[]> {
  const db = await getDb();
  const goals = await db.getAll(GOAL_STORE);
  return goals.sort((a, b) => {
    const statusDiff = getStatusRank(a.status) - getStatusRank(b.status);
    return statusDiff !== 0 ? statusDiff : a.targetDate.localeCompare(b.targetDate);
  });
}

export async function saveGoal(goal: Goal): Promise<void> {
  const db = await getDb();
  await db.put(GOAL_STORE, { ...goal, updatedAt: new Date().toISOString() });
}

export async function replaceAllGoals(goals: Goal[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(GOAL_STORE, 'readwrite');
  await tx.store.clear();
  await Promise.all(goals.map((goal) => tx.store.put(goal)));
  await tx.done;
}

function getStatusRank(status: Goal['status']): number {
  if (status === 'active') {
    return 0;
  }

  if (status === 'paused') {
    return 1;
  }

  return 2;
}
