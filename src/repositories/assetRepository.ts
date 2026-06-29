import type { AssetAccount, AssetSnapshot } from '../types/asset';
import { localAssetRepository } from './local/localAssetRepository';

export interface AssetRepository {
  getAssetAccounts(): Promise<AssetAccount[]>;
  saveAssetAccount(account: AssetAccount): Promise<void>;
  replaceAllAssetAccounts(accounts: AssetAccount[]): Promise<void>;
  getAssetSnapshots(): Promise<AssetSnapshot[]>;
  saveAssetSnapshot(snapshot: AssetSnapshot): Promise<void>;
  deleteAssetSnapshot(id: string): Promise<void>;
  replaceAllAssetSnapshots(snapshots: AssetSnapshot[]): Promise<void>;
}

export const assetRepository: AssetRepository = localAssetRepository;
