import type { AssetAccount, AssetSnapshot } from '../types/asset';
import { ASSET_ACCOUNT_STORE, ASSET_SNAPSHOT_STORE, getDb } from './db';

export async function getAssetAccounts(): Promise<AssetAccount[]> {
  const db = await getDb();
  const accounts = await db.getAll(ASSET_ACCOUNT_STORE);
  return accounts.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function saveAssetAccount(account: AssetAccount): Promise<void> {
  const db = await getDb();
  await db.put(ASSET_ACCOUNT_STORE, { ...account, updatedAt: new Date().toISOString() });
}

export async function replaceAllAssetAccounts(accounts: AssetAccount[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(ASSET_ACCOUNT_STORE, 'readwrite');
  await tx.store.clear();
  await Promise.all(accounts.map((account) => tx.store.put(account)));
  await tx.done;
}

export async function getAssetSnapshots(): Promise<AssetSnapshot[]> {
  const db = await getDb();
  const snapshots = await db.getAll(ASSET_SNAPSHOT_STORE);
  return snapshots.sort((a, b) => {
    const dateDiff = b.snapshotDate.localeCompare(a.snapshotDate);
    return dateDiff !== 0 ? dateDiff : b.createdAt.localeCompare(a.createdAt);
  });
}

export async function saveAssetSnapshot(snapshot: AssetSnapshot): Promise<void> {
  const db = await getDb();
  await db.put(ASSET_SNAPSHOT_STORE, { ...snapshot, updatedAt: new Date().toISOString() });
}

export async function deleteAssetSnapshot(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(ASSET_SNAPSHOT_STORE, id);
}

export async function replaceAllAssetSnapshots(snapshots: AssetSnapshot[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(ASSET_SNAPSHOT_STORE, 'readwrite');
  await tx.store.clear();
  await Promise.all(snapshots.map((snapshot) => tx.store.put(snapshot)));
  await tx.done;
}
