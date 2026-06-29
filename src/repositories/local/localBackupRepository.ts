import type { BackupRepository } from '../backupRepository';
import { buildBackupFile, exportLocalData, importLocalData, validateBackupFile } from '../../utils/backupStorage';

export const localBackupRepository: BackupRepository = {
  buildBackupFile,
  exportLocalData,
  importLocalData,
  validateBackupFile,
};
