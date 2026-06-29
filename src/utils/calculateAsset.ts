import type { AssetAccount, AssetSnapshot, AssetSnapshotItem, AssetSnapshotSummary } from '../types/asset';

export function calculateAssetSnapshotSummary(snapshot: AssetSnapshot): AssetSnapshotSummary {
  const totalAsset = roundMoney(sumItemsByType(snapshot.items, 'asset'));
  const totalLiability = roundMoney(sumItemsByType(snapshot.items, 'liability'));

  return {
    ...snapshot,
    totalAsset,
    totalLiability,
    netAsset: roundMoney(totalAsset - totalLiability),
  };
}

export function calculateAssetSnapshotSummaries(snapshots: AssetSnapshot[]): AssetSnapshotSummary[] {
  return snapshots.map(calculateAssetSnapshotSummary);
}

export function getLatestAssetSnapshot(snapshots: AssetSnapshot[]): AssetSnapshot | undefined {
  return [...snapshots].sort((a, b) => {
    const dateDiff = b.snapshotDate.localeCompare(a.snapshotDate);
    return dateDiff !== 0 ? dateDiff : b.createdAt.localeCompare(a.createdAt);
  })[0];
}

// 新增盘点时沿用最近一次金额，减少每月重复录入。
export function buildSnapshotItemsFromLatest(accounts: AssetAccount[], latestSnapshot?: AssetSnapshot): AssetSnapshotItem[] {
  const enabledAccounts = accounts.filter((account) => account.enabled);
  const latestAmountMap = new Map((latestSnapshot?.items ?? []).map((item) => [item.accountId, item.amount]));

  return enabledAccounts.map((account) => ({
    id: createLocalId('asset-snapshot-item'),
    accountId: account.id,
    accountName: account.name,
    accountType: account.type,
    amount: latestAmountMap.get(account.id) ?? 0,
    remark: '',
  }));
}

export function buildSnapshotItemFromAccount(account: AssetAccount): AssetSnapshotItem {
  return {
    id: createLocalId('asset-snapshot-item'),
    accountId: account.id,
    accountName: account.name,
    accountType: account.type,
    amount: 0,
    remark: '',
  };
}

export function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sumItemsByType(items: AssetSnapshotItem[], type: 'asset' | 'liability'): number {
  return items.filter((item) => item.accountType === type).reduce((sum, item) => sum + item.amount, 0);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
