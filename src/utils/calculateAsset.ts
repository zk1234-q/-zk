import type { AssetAccount, AssetAccountType, AssetSnapshot, AssetSnapshotItem, AssetSnapshotSummary } from '../types/asset';

export function calculateAssetSnapshotSummary(snapshot: AssetSnapshot): AssetSnapshotSummary {
  const includedItems = snapshot.items.filter(isAssetSnapshotItemIncluded);
  const totalAsset = roundMoney(sumItemsByType(includedItems, 'asset'));
  const totalLiability = roundMoney(sumItemsByType(includedItems, 'liability'));

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
  const latestItemMap = new Map((latestSnapshot?.items ?? []).map((item) => [item.accountId, item]));
  const latestAccountOrder = latestSnapshot?.items.map((item) => item.accountId) ?? [];
  const enabledAccountMap = new Map(enabledAccounts.map((account) => [account.id, account]));
  const orderedAccounts = [
    ...latestAccountOrder.map((accountId) => enabledAccountMap.get(accountId)).filter((account): account is AssetAccount => Boolean(account)),
    ...enabledAccounts.filter((account) => !latestItemMap.has(account.id)),
  ];

  return orderedAccounts.map((account) => ({
    id: createLocalId('asset-snapshot-item'),
    accountId: account.id,
    accountName: account.name,
    accountType: account.type,
    amount: latestItemMap.get(account.id)?.amount ?? 0,
    includedInTotal: latestItemMap.get(account.id)?.includedInTotal ?? true,
    remark: latestItemMap.get(account.id)?.remark ?? '',
  }));
}

export function buildSnapshotItemFromAccount(account: AssetAccount): AssetSnapshotItem {
  return {
    id: createLocalId('asset-snapshot-item'),
    accountId: account.id,
    accountName: account.name,
    accountType: account.type,
    amount: 0,
    includedInTotal: true,
    remark: '',
  };
}

export function isAssetSnapshotItemIncluded(item: AssetSnapshotItem): boolean {
  return item.includedInTotal !== false;
}

export function getAssetAccountGroupName(accounts: AssetAccount[], item: AssetSnapshotItem): string {
  const account = accounts.find((currentAccount) => currentAccount.id === item.accountId);
  return account?.groupName?.trim() || '未分组';
}

export function createLocalId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sumItemsByType(items: AssetSnapshotItem[], type: AssetAccountType): number {
  return items.filter((item) => item.accountType === type).reduce((sum, item) => sum + item.amount, 0);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
