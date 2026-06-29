import type { SettingsRepository } from '../settingsRepository';
import {
  createDefaultBudgetSettings,
  createDefaultUserSettings,
  getBudgetSettings,
  getUserSettings,
  saveBudgetSettings,
  saveUserSettings,
} from '../../utils/settingsStorage';

export const localSettingsRepository: SettingsRepository = {
  createDefaultBudgetSettings,
  createDefaultUserSettings,
  getBudgetSettings,
  getUserSettings,
  saveBudgetSettings,
  saveUserSettings,
};
