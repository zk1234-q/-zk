import type { BudgetSettings, UserSettings } from '../types/settings';
import { localSettingsRepository } from './local/localSettingsRepository';

export interface SettingsRepository {
  createDefaultUserSettings(): UserSettings;
  createDefaultBudgetSettings(): BudgetSettings;
  getUserSettings(): Promise<UserSettings>;
  saveUserSettings(settings: UserSettings): Promise<void>;
  getBudgetSettings(): Promise<BudgetSettings>;
  saveBudgetSettings(settings: BudgetSettings): Promise<void>;
}

export const settingsRepository: SettingsRepository = localSettingsRepository;
