import { Modal, Table } from 'antd';
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
      <Table rowKey="id" columns={columns} dataSource={detailRecords} pagination={false} scroll={{ x: 720 }} />
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        明细笔数：{detailRecords.length}，明细合计金额：{formatAmount(totalAmount)}
        {filter ? `，点击金额：${formatAmount(filter.expectedAmount)}` : ''}
      </div>
    </Modal>
  );
}

function formatSignedAmount(value: number): string {
  if (value < 0) {
    return `-${formatAmount(Math.abs(value))}`;
  }

  return formatAmount(value);
}
