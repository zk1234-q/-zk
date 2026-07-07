export type AssetAccountType = 'asset' | 'liability';

export interface AssetAccount {
  id: string;
  name: string;
  type: AssetAccountType;
  groupName?: string;
  remark: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetSnapshotItem {
  id: string;
  accountId: string;
  accountName: string;
  accountType: AssetAccountType;
  amount: number;
  includedInTotal?: boolean;
  remark: string;
}

export interface AssetSnapshot {
  id: string;
  snapshotDate: string;
  items: AssetSnapshotItem[];
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetSnapshotSummary extends AssetSnapshot {
  totalAsset: number;
  totalLiability: number;
  netAsset: number;
}
