import type { BackupFile } from '../types/budget';
import { localBackupRepository } from './local/localBackupRepository';

export interface BackupRepository {
  buildBackupFile(): Promise<BackupFile>;
  exportLocalData(): Promise<void>;
  validateBackupFile(value: unknown): BackupFile;
  importLocalData(backup: BackupFile): Promise<void>;
}

export const backupRepository: BackupRepository = localBackupRepository;
