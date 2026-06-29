import { Alert, Descriptions, Modal, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import type { DetailFilter, StandardBillRecord } from '../../types/bill';
import { filterDetailRecords, sumAmount } from '../../utils/calculateSummary';
import { formatAmount } from '../../utils/format';

interface DetailModalProps {
  open: boolean;
  records: StandardBillRecord[];
  filter: DetailFilter | null;
  onClose: () => void;
}

export default function DetailModal({ open, records, filter, onClose }: DetailModalProps) {
  const detailRecords = filter ? filterDetailRecords(records, filter.month, filter.primaryCategory, filter.secondaryCategory) : [];
  const totalAmount = sumAmount(detailRecords);
  const columns: TableColumnsType<StandardBillRecord> = [
    { title: '二级分类', dataIndex: 'secondaryCategory', key: 'secondaryCategory', width: 140 },
    { title: '日期', dataIndex: 'date', key: 'date', width: 180 },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 140,
      render: (value: number) => formatSignedAmount(value),
    },
    { title: '备注', dataIndex: 'note', key: 'note', ellipsis: true },
  ];

  return (
    <Modal title={filter?.title ?? '消费明细'} open={open} onCancel={onClose} onOk={onClose} width={860}>
      {filter?.budgetInfo ? <BudgetInfoPanel budgetInfo={filter.budgetInfo} /> : null}
      <Table rowKey="id" columns={columns} dataSource={detailRecords} pagination={false} scroll={{ x: 720 }} />
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        明细笔数：{detailRecords.length}，明细合计金额：{formatAmount(totalAmount)}
        {filter ? `，点击金额：${formatAmount(filter.expectedAmount)}` : ''}
      </div>
    </Modal>
  );
}

function BudgetInfoPanel({ budgetInfo }: { budgetInfo: NonNullable<DetailFilter['budgetInfo']> }) {
  if (budgetInfo.status === 'none') {
    return <Alert style={{ marginBottom: 12 }} type="info" showIcon message="该大类本月未设置预算" />;
  }

  const description = budgetInfo.status === 'over'
    ? `已超出 ${formatAmount(budgetInfo.overBudgetAmount ?? 0)} 预算`
    : `还剩 ${formatAmount(budgetInfo.remainingAmount ?? 0)} 预算`;

  return (
    <Descriptions bordered size="small" column={3} style={{ marginBottom: 12 }}>
      <Descriptions.Item label="本月预算">{formatAmount(budgetInfo.budgetAmount ?? 0)}</Descriptions.Item>
      <Descriptions.Item label="已支出">{formatAmount(budgetInfo.spentAmount)}</Descriptions.Item>
      <Descriptions.Item label="预算状态">{description}</Descriptions.Item>
      <Descriptions.Item label="使用率">{typeof budgetInfo.usageRate === 'number' ? `${(budgetInfo.usageRate * 100).toFixed(1)}%` : '-'}</Descriptions.Item>
      <Descriptions.Item label="超支备注" span={2}>{budgetInfo.overBudgetNote || '-'}</Descriptions.Item>
    </Descriptions>
  );
}

function formatSignedAmount(value: number): string {
  if (value < 0) {
    return `-${formatAmount(Math.abs(value))}`;
  }

  return formatAmount(value);
}
