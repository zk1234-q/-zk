import { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Input, InputNumber, Modal, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { TableColumnsType } from 'antd';
import type { AssetAccount, AssetAccountType, AssetSnapshot, AssetSnapshotItem, AssetSnapshotSummary } from '../types/asset';
import {
  buildSnapshotItemFromAccount,
  buildSnapshotItemsFromLatest,
  calculateAssetSnapshotSummaries,
  calculateAssetSnapshotSummary,
  createLocalId,
  getLatestAssetSnapshot,
} from '../utils/calculateAsset';
import { formatAmount } from '../utils/format';
import { assetRepository } from '../repositories/assetRepository';

const ACCOUNT_TYPE_LABELS: Record<AssetAccountType, { text: string; color: string }> = {
  asset: { text: '资产', color: 'green' },
  liability: { text: '负债', color: 'red' },
};

export default function AssetPage() {
  const [accounts, setAccounts] = useState<AssetAccount[]>([]);
  const [snapshots, setSnapshots] = useState<AssetSnapshot[]>([]);
  const [accountDraft, setAccountDraft] = useState<AssetAccount | null>(null);
  const [snapshotDraft, setSnapshotDraft] = useState<AssetSnapshot | null>(null);
  const snapshotRows = useMemo(() => calculateAssetSnapshotSummaries(snapshots), [snapshots]);
  const latestSummary = snapshotRows[0];

  const refreshAssets = async () => {
    const [nextAccounts, nextSnapshots] = await Promise.all([assetRepository.getAssetAccounts(), assetRepository.getAssetSnapshots()]);
    setAccounts(nextAccounts);
    setSnapshots(nextSnapshots);
  };

  useEffect(() => {
    void refreshAssets();
  }, []);

  const openAccountModal = (type: AssetAccountType) => {
    const now = new Date().toISOString();
    setAccountDraft({
      id: createLocalId('asset-account'),
      name: '',
      type,
      remark: '',
      enabled: true,
      createdAt: now,
      updatedAt: now,
    });
  };

  const saveAccount = async () => {
    if (!accountDraft) {
      return;
    }

    const nextAccount = { ...accountDraft, name: accountDraft.name.trim() };

    if (!nextAccount.name) {
      message.warning('请填写档案名称');
      return;
    }

    await assetRepository.saveAssetAccount(nextAccount);
    setAccountDraft(null);
    await refreshAssets();
    message.success('资产负债档案已保存');
  };

  const toggleAccountEnabled = (account: AssetAccount) => {
    Modal.confirm({
      title: account.enabled ? '停用这个档案？' : '启用这个档案？',
      content: account.enabled ? '停用后新增资产记录时不再默认选择，历史记录仍然保留。' : '启用后新增资产记录时可以继续选择。',
      okText: account.enabled ? '停用' : '启用',
      cancelText: '取消',
      onOk: async () => {
        await assetRepository.saveAssetAccount({ ...account, enabled: !account.enabled });
        await refreshAssets();
      },
    });
  };

  const openNewSnapshot = () => {
    const latestSnapshot = getLatestAssetSnapshot(snapshots);
    openSnapshotModal(buildSnapshotItemsFromLatest(accounts, latestSnapshot));
  };

  const openSnapshotModal = (items: AssetSnapshotItem[], snapshot?: AssetSnapshot) => {
    const now = new Date().toISOString();
    setSnapshotDraft({
      id: snapshot?.id ?? createLocalId('asset-snapshot'),
      snapshotDate: snapshot?.snapshotDate ?? getToday(),
      items,
      remark: snapshot?.remark ?? '',
      createdAt: snapshot?.createdAt ?? now,
      updatedAt: now,
    });
  };

  const copySnapshot = (snapshot: AssetSnapshot) => {
    openSnapshotModal(
      snapshot.items.map((item) => ({ ...item, id: createLocalId('asset-snapshot-item') })),
    );
  };

  const saveSnapshot = async () => {
    if (!snapshotDraft) {
      return;
    }

    if (!snapshotDraft.snapshotDate) {
      message.warning('请填写盘点日期');
      return;
    }

    if (snapshotDraft.items.length === 0) {
      message.warning('请至少新增一行资产或负债');
      return;
    }

    await assetRepository.saveAssetSnapshot({
      ...snapshotDraft,
      items: snapshotDraft.items.map((item) => ({ ...item, amount: Number(item.amount || 0) })),
    });
    setSnapshotDraft(null);
    await refreshAssets();
    message.success('资产记录已保存');
  };

  const deleteSnapshot = (snapshot: AssetSnapshotSummary) => {
    Modal.confirm({
      title: '删除这条资产记录？',
      content: `${snapshot.snapshotDate} 的资产记录会被删除。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        await assetRepository.deleteAssetSnapshot(snapshot.id);
        await refreshAssets();
      },
    });
  };

  const accountColumns: TableColumnsType<AssetAccount> = [
    { title: '档案名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (value: AssetAccountType) => <Tag color={ACCOUNT_TYPE_LABELS[value].color}>{ACCOUNT_TYPE_LABELS[value].text}</Tag>,
    },
    { title: '状态', dataIndex: 'enabled', key: 'enabled', render: (enabled: boolean) => <Tag color={enabled ? 'blue' : 'default'}>{enabled ? '启用' : '停用'}</Tag> },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
      title: '操作',
      key: 'action',
      render: (_value, row) => (
        <Space>
          <Button type="link" onClick={() => setAccountDraft(row)}>
            编辑
          </Button>
          <Button type="link" onClick={() => toggleAccountEnabled(row)}>
            {row.enabled ? '停用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  const snapshotColumns: TableColumnsType<AssetSnapshotSummary> = [
    { title: '日期', dataIndex: 'snapshotDate', key: 'snapshotDate' },
    { title: '总资产', dataIndex: 'totalAsset', key: 'totalAsset', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '总负债', dataIndex: 'totalLiability', key: 'totalLiability', align: 'right', render: (value: number) => formatAmount(value) },
    {
      title: '净资产',
      dataIndex: 'netAsset',
      key: 'netAsset',
      align: 'right',
      render: (value: number) => <span className={value < 0 ? 'amount-danger' : ''}>{formatAmount(value)}</span>,
    },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
      title: '操作',
      key: 'action',
      render: (_value, row) => (
        <Space>
          <Button type="link" onClick={() => openSnapshotModal(row.items, row)}>
            编辑
          </Button>
          <Button type="link" onClick={() => copySnapshot(row)}>
            复制新增
          </Button>
          <Button danger type="link" onClick={() => deleteSnapshot(row)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <Typography.Title level={3}>资产总览</Typography.Title>
          <Typography.Text type="secondary">维护资产负债档案，按日期保存每次盘点记录</Typography.Text>
        </div>
        <Button type="primary" onClick={openNewSnapshot}>
          新增
        </Button>
      </div>

      <div className="summary-grid">
        <div className="summary-tile">
          <div className="summary-label">总资产</div>
          <div className="summary-value">{formatAmount(latestSummary?.totalAsset ?? 0)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">总负债</div>
          <div className="summary-value">{formatAmount(latestSummary?.totalLiability ?? 0)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">净资产</div>
          <div className={latestSummary && latestSummary.netAsset < 0 ? 'summary-value amount-danger' : 'summary-value'}>{formatAmount(latestSummary?.netAsset ?? 0)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">最近盘点</div>
          <div className="summary-value summary-date">{latestSummary?.snapshotDate ?? '-'}</div>
        </div>
      </div>

      <div className="page-section">
        <div className="section-header">
          <Typography.Title level={4}>历史记录</Typography.Title>
        </div>
        {snapshotRows.length ? <Table rowKey="id" columns={snapshotColumns} dataSource={snapshotRows} pagination={{ pageSize: 8, showSizeChanger: false }} /> : <Empty description="还没有资产记录，点击右上角新增" />}
      </div>

      <div className="page-section">
        <div className="section-header">
          <div>
            <Typography.Title level={4}>资产负债档案</Typography.Title>
            <Typography.Text type="secondary">档案用于新增资产记录时选择字段，历史已使用档案建议停用而不是删除</Typography.Text>
          </div>
          <Space>
            <Button onClick={() => openAccountModal('asset')}>新增资产档案</Button>
            <Button onClick={() => openAccountModal('liability')}>新增负债档案</Button>
          </Space>
        </div>
        {accounts.length ? <Table rowKey="id" columns={accountColumns} dataSource={accounts} pagination={false} /> : <Empty description="还没有资产负债档案，请先新增" />}
      </div>

      <AccountModal account={accountDraft} onChange={setAccountDraft} onCancel={() => setAccountDraft(null)} onSave={saveAccount} />
      <SnapshotModal
        accounts={accounts}
        snapshot={snapshotDraft}
        onChange={setSnapshotDraft}
        onCancel={() => setSnapshotDraft(null)}
        onSave={saveSnapshot}
      />
    </div>
  );
}

interface AccountModalProps {
  account: AssetAccount | null;
  onChange: (account: AssetAccount | null) => void;
  onCancel: () => void;
  onSave: () => void;
}

function AccountModal({ account, onChange, onCancel, onSave }: AccountModalProps) {
  return (
    <Modal title="资产负债档案" open={Boolean(account)} onOk={onSave} onCancel={onCancel} okText="保存" cancelText="取消">
      {account ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input value={account.name} placeholder="档案名称，例如支付宝、房贷" onChange={(event) => onChange({ ...account, name: event.target.value })} />
          <Select
            value={account.type}
            options={[
              { value: 'asset', label: '资产' },
              { value: 'liability', label: '负债' },
            ]}
            onChange={(value) => onChange({ ...account, type: value })}
          />
          <Input value={account.remark} placeholder="备注" onChange={(event) => onChange({ ...account, remark: event.target.value })} />
        </Space>
      ) : null}
    </Modal>
  );
}

interface SnapshotModalProps {
  accounts: AssetAccount[];
  snapshot: AssetSnapshot | null;
  onChange: (snapshot: AssetSnapshot | null) => void;
  onCancel: () => void;
  onSave: () => void;
}

function SnapshotModal({ accounts, snapshot, onChange, onCancel, onSave }: SnapshotModalProps) {
  const summary = snapshot ? calculateAssetSnapshotSummary(snapshot) : undefined;

  const updateItem = (itemId: string, nextItem: AssetSnapshotItem) => {
    if (!snapshot) {
      return;
    }

    onChange({ ...snapshot, items: snapshot.items.map((item) => (item.id === itemId ? nextItem : item)) });
  };

  const addItem = () => {
    if (!snapshot) {
      return;
    }

    const firstAccount = accounts.find((account) => account.enabled && !snapshot.items.some((item) => item.accountId === account.id));

    if (!firstAccount) {
      message.warning('没有可新增的启用档案');
      return;
    }

    onChange({ ...snapshot, items: [...snapshot.items, buildSnapshotItemFromAccount(firstAccount)] });
  };

  const removeItem = (itemId: string) => {
    if (!snapshot) {
      return;
    }

    onChange({ ...snapshot, items: snapshot.items.filter((item) => item.id !== itemId) });
  };

  const columns: TableColumnsType<AssetSnapshotItem> = [
    {
      title: '档案字段',
      dataIndex: 'accountId',
      key: 'accountId',
      width: 220,
      render: (_value, row) => (
        <Select
          value={row.accountId}
          style={{ width: 200 }}
          options={accounts
            .filter((account) => account.enabled || account.id === row.accountId)
            .map((account) => ({
              value: account.id,
              label: `${account.name}（${ACCOUNT_TYPE_LABELS[account.type].text}）`,
              disabled: snapshot?.items.some((item) => item.id !== row.id && item.accountId === account.id),
            }))}
          onChange={(accountId) => {
            const account = accounts.find((item) => item.id === accountId);
            if (!account) {
              return;
            }

            updateItem(row.id, {
              ...row,
              accountId: account.id,
              accountName: account.name,
              accountType: account.type,
            });
          }}
        />
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (_value, row) => <InputNumber precision={2} value={row.amount} onChange={(value) => updateItem(row.id, { ...row, amount: Number(value ?? 0) })} />,
    },
    { title: '类型', dataIndex: 'accountType', key: 'accountType', render: (value: AssetAccountType) => <Tag color={ACCOUNT_TYPE_LABELS[value].color}>{ACCOUNT_TYPE_LABELS[value].text}</Tag> },
    { title: '备注', dataIndex: 'remark', key: 'remark', render: (_value, row) => <Input value={row.remark} onChange={(event) => updateItem(row.id, { ...row, remark: event.target.value })} /> },
    { title: '操作', key: 'action', render: (_value, row) => <Button danger type="link" onClick={() => removeItem(row.id)}>删除</Button> },
  ];

  return (
    <Modal width={920} title="资产记录" open={Boolean(snapshot)} onOk={onSave} onCancel={onCancel} okText="保存" cancelText="取消">
      {snapshot ? (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Input style={{ width: 180 }} value={snapshot.snapshotDate} placeholder="YYYY-MM-DD" onChange={(event) => onChange({ ...snapshot, snapshotDate: event.target.value })} />
            <Input style={{ width: 360 }} value={snapshot.remark} placeholder="备注" onChange={(event) => onChange({ ...snapshot, remark: event.target.value })} />
            <Button onClick={addItem}>新增行</Button>
          </Space>
          <Space wrap>
            <Tag color="green">总资产：{formatAmount(summary?.totalAsset ?? 0)}</Tag>
            <Tag color="red">总负债：{formatAmount(summary?.totalLiability ?? 0)}</Tag>
            <Tag color={(summary?.netAsset ?? 0) < 0 ? 'red' : 'blue'}>净资产：{formatAmount(summary?.netAsset ?? 0)}</Tag>
          </Space>
          <Table rowKey="id" columns={columns} dataSource={snapshot.items} pagination={false} scroll={{ x: 820 }} />
        </Space>
      ) : null}
    </Modal>
  );
}

function getToday(): string {
  const date = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
