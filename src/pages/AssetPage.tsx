import { useEffect, useMemo, useState } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { Button, Empty, Input, InputNumber, Modal, Select, Space, Switch, Table, Tag, Typography, message } from 'antd';
import type { TableColumnsType } from 'antd';
import type { AssetAccount, AssetAccountType, AssetSnapshot, AssetSnapshotItem, AssetSnapshotSummary } from '../types/asset';
import {
  buildSnapshotItemFromAccount,
  buildSnapshotItemsFromLatest,
  calculateAssetSnapshotSummaries,
  calculateAssetSnapshotSummary,
  createLocalId,
  getAssetAccountGroupName,
  getLatestAssetSnapshot,
  isAssetSnapshotItemIncluded,
} from '../utils/calculateAsset';
import { formatAmount } from '../utils/format';
import { assetRepository } from '../repositories/assetRepository';

const ACCOUNT_TYPE_LABELS: Record<AssetAccountType, { text: string; color: string }> = {
  asset: { text: '资产', color: 'green' },
  liability: { text: '负债', color: 'red' },
};

type AssetHistoryMode = 'day' | 'month' | 'year';

interface AssetHistoryRow {
  id: string;
  period: string;
  sourceDate: string;
  totalAsset: number;
  totalLiability: number;
  netAsset: number;
  remark: string;
  sourceSnapshot: AssetSnapshotSummary;
}

export default function AssetPage() {
  const [accounts, setAccounts] = useState<AssetAccount[]>([]);
  const [snapshots, setSnapshots] = useState<AssetSnapshot[]>([]);
  const [accountDraft, setAccountDraft] = useState<AssetAccount | null>(null);
  const [snapshotDraft, setSnapshotDraft] = useState<AssetSnapshot | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [sortMode, setSortMode] = useState(false);
  const [historyMode, setHistoryMode] = useState<AssetHistoryMode>('day');
  const [historyMonth, setHistoryMonth] = useState('');
  const [historyYear, setHistoryYear] = useState('');
  const [historyDetail, setHistoryDetail] = useState<AssetSnapshotSummary | null>(null);

  const snapshotRows = useMemo(() => calculateAssetSnapshotSummaries(snapshots), [snapshots]);
  const latestSnapshot = useMemo(() => getLatestAssetSnapshot(snapshots), [snapshots]);
  const latestSummary = useMemo(() => (latestSnapshot ? calculateAssetSnapshotSummary(latestSnapshot) : undefined), [latestSnapshot]);
  const latestAssetItems = latestSnapshot?.items.filter((item) => item.accountType === 'asset') ?? [];
  const latestLiabilityItems = latestSnapshot?.items.filter((item) => item.accountType === 'liability') ?? [];
  const latestHistoryMonth = snapshotRows[0]?.snapshotDate.slice(0, 7) ?? getCurrentMonth();
  const latestHistoryYear = snapshotRows[0]?.snapshotDate.slice(0, 4) ?? getCurrentYear();
  const historyRows = useMemo(
    () => buildAssetHistoryRows(snapshotRows, historyMode, historyMonth || latestHistoryMonth, historyYear || latestHistoryYear),
    [historyMode, historyMonth, historyYear, latestHistoryMonth, latestHistoryYear, snapshotRows],
  );

  useEffect(() => {
    if (!historyMonth) {
      setHistoryMonth(latestHistoryMonth);
    }

    if (!historyYear) {
      setHistoryYear(latestHistoryYear);
    }
  }, [historyMonth, historyYear, latestHistoryMonth, latestHistoryYear]);

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
      groupName: '',
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

    const nextAccount = {
      ...accountDraft,
      name: accountDraft.name.trim(),
      groupName: accountDraft.groupName?.trim() ?? '',
    };

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
    const currentLatestSnapshot = getLatestAssetSnapshot(snapshots);
    openSnapshotModal(buildSnapshotItemsFromLatest(accounts, currentLatestSnapshot));
  };

  const openSnapshotModal = (items: AssetSnapshotItem[], snapshot?: AssetSnapshot) => {
    const now = new Date().toISOString();
    setSnapshotDraft({
      id: snapshot?.id ?? createLocalId('asset-snapshot'),
      snapshotDate: snapshot?.snapshotDate ?? getToday(),
      items: items.map(normalizeSnapshotItem),
      remark: snapshot?.remark ?? '',
      createdAt: snapshot?.createdAt ?? now,
      updatedAt: now,
    });
  };

  const copySnapshot = (snapshot: AssetSnapshot) => {
    openSnapshotModal(
      snapshot.items.map((item) => ({ ...normalizeSnapshotItem(item), id: createLocalId('asset-snapshot-item') })),
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
      items: snapshotDraft.items.map(normalizeSnapshotItem),
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

  const persistLatestSnapshot = async (nextSnapshot: AssetSnapshot) => {
    setSnapshots((currentSnapshots) => currentSnapshots.map((snapshot) => (snapshot.id === nextSnapshot.id ? nextSnapshot : snapshot)));
    await assetRepository.saveAssetSnapshot(nextSnapshot);
    await refreshAssets();
  };

  const toggleLatestItemIncluded = async (itemId: string, includedInTotal: boolean) => {
    if (!latestSnapshot) {
      return;
    }

    await persistLatestSnapshot({
      ...latestSnapshot,
      items: latestSnapshot.items.map((item) => (item.id === itemId ? { ...item, includedInTotal } : item)),
    });
  };

  const reorderLatestItems = async (type: AssetAccountType, orderedItemIds: string[]) => {
    if (!latestSnapshot) {
      return;
    }

    if (orderedItemIds.length === 0) {
      return;
    }

    const orderedItems = orderedItemIds
      .map((itemId) => latestSnapshot.items.find((item) => item.id === itemId))
      .filter((item): item is AssetSnapshotItem => Boolean(item));
    let sameTypeIndex = 0;
    const nextItems = latestSnapshot.items.map((item) => {
      if (item.accountType !== type) {
        return item;
      }

      const nextItem = orderedItems[sameTypeIndex];
      sameTypeIndex += 1;
      return nextItem ?? item;
    });

    await persistLatestSnapshot({ ...latestSnapshot, items: nextItems });
  };

  const historyColumns: TableColumnsType<AssetHistoryRow> = [
    { title: historyMode === 'day' ? '日期' : historyMode === 'month' ? '月份' : '年份', dataIndex: 'period', key: 'period' },
    { title: '总资产', dataIndex: 'totalAsset', key: 'totalAsset', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '总负债', dataIndex: 'totalLiability', key: 'totalLiability', align: 'right', render: (value: number) => formatAmount(value) },
    {
      title: '净资产',
      dataIndex: 'netAsset',
      key: 'netAsset',
      align: 'right',
      render: (value: number, row) => (
        <Button type="link" className={value < 0 ? 'amount-danger' : ''} onClick={() => setHistoryDetail(row.sourceSnapshot)}>
          {formatAmount(value)}
        </Button>
      ),
    },
    ...(historyMode === 'day' ? [] : ([{ title: '来源日期', dataIndex: 'sourceDate', key: 'sourceDate' }] as TableColumnsType<AssetHistoryRow>)),
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
      title: '操作',
      key: 'action',
      render: (_value, row) => (
        <Space>
          <Button type="link" onClick={() => openSnapshotModal(row.sourceSnapshot.items, row.sourceSnapshot)}>
            编辑
          </Button>
          <Button type="link" onClick={() => copySnapshot(row.sourceSnapshot)}>
            复制新增
          </Button>
          <Button danger type="link" onClick={() => deleteSnapshot(row.sourceSnapshot)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const accountColumns: TableColumnsType<AssetAccount> = [
    { title: '档案名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (value: AssetAccountType) => <Tag color={ACCOUNT_TYPE_LABELS[value].color}>{ACCOUNT_TYPE_LABELS[value].text}</Tag>,
    },
    { title: '分组', dataIndex: 'groupName', key: 'groupName', render: (value?: string) => value || '未分组' },
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

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <Typography.Title level={3}>资产总览</Typography.Title>
          <Typography.Text type="secondary">查看当前资产负债明细，按需要切换统计口径</Typography.Text>
        </div>
        <Space wrap>
          <Button type="primary" onClick={openNewSnapshot}>
            更新资产盘点
          </Button>
          {latestSnapshot ? <Button onClick={() => setSortMode((current) => !current)}>{sortMode ? '完成排序' : '排序'}</Button> : null}
          <Button onClick={() => setHistoryOpen(true)}>查看历史记录</Button>
          <Button onClick={() => setAccountsOpen(true)}>管理档案</Button>
        </Space>
      </div>

      {latestSnapshot ? (
        <>
          <div className="asset-overview-grid">
            <div className="asset-net-tile">
              <div className="summary-label">净资产</div>
              <div className={latestSummary && latestSummary.netAsset < 0 ? 'asset-net-value amount-danger' : 'asset-net-value'}>{formatAmount(latestSummary?.netAsset ?? 0)}</div>
              <div className="asset-net-meta">最新盘点：{latestSnapshot.snapshotDate}</div>
            </div>
            <div className="summary-tile">
              <div className="summary-label">总资产</div>
              <div className="summary-value">{formatAmount(latestSummary?.totalAsset ?? 0)}</div>
            </div>
            <div className="summary-tile">
              <div className="summary-label">总负债</div>
              <div className="summary-value">{formatAmount(latestSummary?.totalLiability ?? 0)}</div>
            </div>
          </div>

          <div className="asset-detail-grid">
            <AssetDetailTable
              accounts={accounts}
              items={latestAssetItems}
              title="资产明细"
              type="asset"
              sortMode={sortMode}
              onReorder={reorderLatestItems}
              onToggleIncluded={toggleLatestItemIncluded}
            />
            <AssetDetailTable
              accounts={accounts}
              items={latestLiabilityItems}
              title="负债明细"
              type="liability"
              sortMode={sortMode}
              onReorder={reorderLatestItems}
              onToggleIncluded={toggleLatestItemIncluded}
            />
          </div>
        </>
      ) : (
        <div className="page-section">
          <Empty description="还没有资产盘点记录">
            <Button type="primary" onClick={openNewSnapshot}>
              新增第一条资产盘点
            </Button>
          </Empty>
        </div>
      )}

      <Modal width={1040} title="历史资产记录" open={historyOpen} footer={null} onCancel={() => setHistoryOpen(false)}>
        <div className="asset-history-toolbar">
          <Space wrap>
            <Select
              value={historyMode}
              style={{ width: 120 }}
              options={[
                { value: 'day', label: '按天' },
                { value: 'month', label: '按月' },
                { value: 'year', label: '按年' },
              ]}
              onChange={setHistoryMode}
            />
            {historyMode === 'day' ? <Input type="month" value={historyMonth || latestHistoryMonth} onChange={(event) => setHistoryMonth(event.target.value)} /> : null}
            {historyMode === 'month' ? <Input type="number" min={1900} max={2999} value={historyYear || latestHistoryYear} onChange={(event) => setHistoryYear(event.target.value)} /> : null}
          </Space>
          <Typography.Text type="secondary">{historyMode === 'day' ? '按所选月份查看每日盘点' : historyMode === 'month' ? '每月取当月最后一条盘点作为月结' : '每年取当年最后一条盘点作为年结'}</Typography.Text>
        </div>
        {historyRows.length ? <Table rowKey="id" columns={historyColumns} dataSource={historyRows} pagination={{ pageSize: 12, showSizeChanger: false }} scroll={{ x: 920 }} /> : <Empty description="当前范围内没有资产记录" />}
      </Modal>

      <Modal width={820} title={historyDetail ? `${historyDetail.snapshotDate} 资产明细` : '资产明细'} open={Boolean(historyDetail)} footer={null} onCancel={() => setHistoryDetail(null)}>
        {historyDetail ? <HistoryDetail accounts={accounts} snapshot={historyDetail} /> : null}
      </Modal>

      <Modal width={1040} title="资产负债档案" open={accountsOpen} footer={null} onCancel={() => setAccountsOpen(false)}>
        <div className="asset-modal-toolbar">
          <Typography.Text type="secondary">档案用于维护资产盘点里的字段，历史已使用档案建议停用而不是删除。</Typography.Text>
          <Space>
            <Button onClick={() => openAccountModal('asset')}>新增资产档案</Button>
            <Button onClick={() => openAccountModal('liability')}>新增负债档案</Button>
          </Space>
        </div>
        {accounts.length ? <Table rowKey="id" columns={accountColumns} dataSource={accounts} pagination={false} scroll={{ x: 900 }} /> : <Empty description="还没有资产负债档案，请先新增" />}
      </Modal>

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

interface AssetDetailTableProps {
  accounts: AssetAccount[];
  items: AssetSnapshotItem[];
  title: string;
  type: AssetAccountType;
  sortMode: boolean;
  onReorder: (type: AssetAccountType, orderedItemIds: string[]) => void;
  onToggleIncluded: (itemId: string, includedInTotal: boolean) => void;
}

function AssetDetailTable({ accounts, items, title, type, sortMode, onReorder, onToggleIncluded }: AssetDetailTableProps) {
  const [draggingItemId, setDraggingItemId] = useState('');
  const total = calculateAssetSnapshotSummary({
    id: 'current-detail',
    snapshotDate: '',
    items,
    remark: '',
    createdAt: '',
    updatedAt: '',
  });
  const currentTotal = type === 'asset' ? total.totalAsset : total.totalLiability;

  const reorderByDrop = (targetItemId: string) => {
    if (!draggingItemId || draggingItemId === targetItemId) {
      setDraggingItemId('');
      return;
    }

    const orderedIds = items.map((item) => item.id);
    const fromIndex = orderedIds.indexOf(draggingItemId);
    const toIndex = orderedIds.indexOf(targetItemId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggingItemId('');
      return;
    }

    const [movedItemId] = orderedIds.splice(fromIndex, 1);
    orderedIds.splice(toIndex, 0, movedItemId);
    onReorder(type, orderedIds);
    setDraggingItemId('');
  };

  const columns: TableColumnsType<AssetSnapshotItem> = [
    { title: '名称', dataIndex: 'accountName', key: 'accountName' },
    { title: '分组', key: 'groupName', render: (_value, row) => getAssetAccountGroupName(accounts, row) },
    { title: '金额', dataIndex: 'amount', key: 'amount', align: 'right', render: (value: number) => formatAmount(value) },
    {
      title: '参与统计',
      key: 'includedInTotal',
      width: 110,
      render: (_value, row) => <Switch checked={isAssetSnapshotItemIncluded(row)} onChange={(checked) => onToggleIncluded(row.id, checked)} />,
    },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  if (sortMode) {
    columns.push({
      title: '',
      key: 'drag',
      width: 58,
      align: 'center',
      render: (_value, row) => (
        <button
          type="button"
          className="asset-drag-handle"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', row.id);
            setDraggingItemId(row.id);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(event) => {
            event.preventDefault();
            reorderByDrop(row.id);
          }}
          onDragEnd={() => setDraggingItemId('')}
          aria-label="拖拽排序"
        >
          <MenuOutlined />
        </button>
      ),
    });
  }

  return (
    <div className="page-section asset-detail-section">
      <div className="section-header">
        <div>
          <Typography.Title level={4}>{title}</Typography.Title>
          <Typography.Text type="secondary">当前参与统计：{formatAmount(currentTotal)}</Typography.Text>
        </div>
        <Tag color={ACCOUNT_TYPE_LABELS[type].color}>{ACCOUNT_TYPE_LABELS[type].text}</Tag>
      </div>
      {items.length ? (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={items}
          pagination={false}
          rowClassName={(row) => {
            const classNames = [];
            if (!isAssetSnapshotItemIncluded(row)) {
              classNames.push('asset-detail-row-muted');
            }
            if (row.id === draggingItemId) {
              classNames.push('asset-detail-row-dragging');
            }
            return classNames.join(' ');
          }}
          scroll={{ x: 680 }}
        />
      ) : (
        <Empty description={`暂无${ACCOUNT_TYPE_LABELS[type].text}明细`} />
      )}
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
          <Input value={account.groupName ?? ''} placeholder="分组，例如现金、投资、长期负债" onChange={(event) => onChange({ ...account, groupName: event.target.value })} />
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
    { title: '分组', key: 'groupName', render: (_value, row) => getAssetAccountGroupName(accounts, row) },
    {
      title: '参与统计',
      key: 'includedInTotal',
      render: (_value, row) => <Switch checked={isAssetSnapshotItemIncluded(row)} onChange={(checked) => updateItem(row.id, { ...row, includedInTotal: checked })} />,
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', render: (_value, row) => <Input value={row.remark} onChange={(event) => updateItem(row.id, { ...row, remark: event.target.value })} /> },
    {
      title: '操作',
      key: 'action',
      render: (_value, row) => (
        <Button danger type="link" onClick={() => removeItem(row.id)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <Modal width={1040} title="资产记录" open={Boolean(snapshot)} onOk={onSave} onCancel={onCancel} okText="保存" cancelText="取消">
      {snapshot ? (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Input style={{ width: 180 }} type="date" value={snapshot.snapshotDate} placeholder="YYYY-MM-DD" onChange={(event) => onChange({ ...snapshot, snapshotDate: event.target.value })} />
            <Input style={{ width: 360 }} value={snapshot.remark} placeholder="备注" onChange={(event) => onChange({ ...snapshot, remark: event.target.value })} />
            <Button onClick={addItem}>新增行</Button>
          </Space>
          <Space wrap>
            <Tag color="green">总资产：{formatAmount(summary?.totalAsset ?? 0)}</Tag>
            <Tag color="red">总负债：{formatAmount(summary?.totalLiability ?? 0)}</Tag>
            <Tag color={(summary?.netAsset ?? 0) < 0 ? 'red' : 'blue'}>净资产：{formatAmount(summary?.netAsset ?? 0)}</Tag>
          </Space>
          <Table rowKey="id" columns={columns} dataSource={snapshot.items} pagination={false} scroll={{ x: 980 }} />
        </Space>
      ) : null}
    </Modal>
  );
}

interface HistoryDetailProps {
  accounts: AssetAccount[];
  snapshot: AssetSnapshotSummary;
}

function HistoryDetail({ accounts, snapshot }: HistoryDetailProps) {
  const columns: TableColumnsType<AssetSnapshotItem> = [
    { title: '名称', dataIndex: 'accountName', key: 'accountName' },
    { title: '类型', dataIndex: 'accountType', key: 'accountType', render: (value: AssetAccountType) => <Tag color={ACCOUNT_TYPE_LABELS[value].color}>{ACCOUNT_TYPE_LABELS[value].text}</Tag> },
    { title: '分组', key: 'groupName', render: (_value, row) => getAssetAccountGroupName(accounts, row) },
    { title: '金额', dataIndex: 'amount', key: 'amount', align: 'right', render: (value: number) => formatAmount(value) },
    {
      title: '参与统计',
      key: 'includedInTotal',
      render: (_value, row) => <Tag color={isAssetSnapshotItemIncluded(row) ? 'blue' : 'default'}>{isAssetSnapshotItemIncluded(row) ? '计入' : '不计入'}</Tag>,
    },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Space wrap>
        <Tag color="green">总资产：{formatAmount(snapshot.totalAsset)}</Tag>
        <Tag color="red">总负债：{formatAmount(snapshot.totalLiability)}</Tag>
        <Tag color={snapshot.netAsset < 0 ? 'red' : 'blue'}>净资产：{formatAmount(snapshot.netAsset)}</Tag>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={snapshot.items} pagination={false} scroll={{ x: 760 }} />
    </Space>
  );
}

function buildAssetHistoryRows(snapshots: AssetSnapshotSummary[], mode: AssetHistoryMode, month: string, year: string): AssetHistoryRow[] {
  if (mode === 'day') {
    return snapshots.filter((snapshot) => snapshot.snapshotDate.startsWith(month)).map((snapshot) => buildAssetHistoryRow(snapshot.snapshotDate, snapshot));
  }

  if (mode === 'month') {
    return buildLatestRowsByPeriod(
      snapshots.filter((snapshot) => snapshot.snapshotDate.startsWith(year)),
      (snapshot) => snapshot.snapshotDate.slice(0, 7),
    );
  }

  return buildLatestRowsByPeriod(snapshots, (snapshot) => snapshot.snapshotDate.slice(0, 4));
}

function buildLatestRowsByPeriod(snapshots: AssetSnapshotSummary[], getPeriod: (snapshot: AssetSnapshotSummary) => string): AssetHistoryRow[] {
  const periodMap = new Map<string, AssetSnapshotSummary>();

  snapshots.forEach((snapshot) => {
    const period = getPeriod(snapshot);
    if (!periodMap.has(period)) {
      periodMap.set(period, snapshot);
    }
  });

  return Array.from(periodMap.entries()).map(([period, snapshot]) => buildAssetHistoryRow(period, snapshot));
}

function buildAssetHistoryRow(period: string, snapshot: AssetSnapshotSummary): AssetHistoryRow {
  return {
    id: `${period}-${snapshot.id}`,
    period,
    sourceDate: snapshot.snapshotDate,
    totalAsset: snapshot.totalAsset,
    totalLiability: snapshot.totalLiability,
    netAsset: snapshot.netAsset,
    remark: snapshot.remark,
    sourceSnapshot: snapshot,
  };
}

function normalizeSnapshotItem(item: AssetSnapshotItem): AssetSnapshotItem {
  return {
    ...item,
    amount: Number(item.amount || 0),
    includedInTotal: item.includedInTotal ?? true,
  };
}

function getToday(): string {
  const date = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getCurrentMonth(): string {
  return getToday().slice(0, 7);
}

function getCurrentYear(): string {
  return getToday().slice(0, 4);
}
