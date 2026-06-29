import type { AssetRepository } from '../assetRepository';
import {
  deleteAssetSnapshot,
  getAssetAccounts,
  getAssetSnapshots,
  replaceAllAssetAccounts,
  replaceAllAssetSnapshots,
  saveAssetAccount,
  saveAssetSnapshot,
} from '../../utils/assetStorage';

export const localAssetRepository: AssetRepository = {
  deleteAssetSnapshot,
  getAssetAccounts,
  getAssetSnapshots,
  replaceAllAssetAccounts,
  replaceAllAssetSnapshots,
  saveAssetAccount,
  saveAssetSnapshot,
};
