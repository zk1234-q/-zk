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
  const columns: TableColumnsType<StandardBillRecord> = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '一级分类', dataIndex: 'primaryCategory', key: 'primaryCategory' },
    { title: '二级分类', dataIndex: 'secondaryCategory', key: 'secondaryCategory' },
    { title: '金额', dataIndex: 'expenseAmount', key: 'expenseAmount', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '商户', dataIndex: 'merchant', key: 'merchant' },
    { title: '支付方式', dataIndex: 'paymentMethod', key: 'paymentMethod' },
    { title: '备注', dataIndex: 'note', key: 'note' },
  ];

  const detailRecords = filter ? filterDetailRecords(records, filter.month, filter.primaryCategory, filter.secondaryCategory) : [];
  const totalAmount = sumAmount(detailRecords);

  return (
    <Modal title={filter?.title ?? '消费明细'} open={open} onCancel={onClose} onOk={onClose} width={920}>
      <Table rowKey="id" columns={columns} dataSource={detailRecords} pagination={false} scroll={{ x: 820 }} />
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        明细笔数：{detailRecords.length}，明细合计金额：{formatAmount(totalAmount)}
        {filter ? `，点击金额：${formatAmount(filter.expectedAmount)}` : ''}
      </div>
    </Modal>
  );
}
