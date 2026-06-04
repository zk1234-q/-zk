import { Modal, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { mockBills } from '../../mock/bills';
import type { StandardBillRecord } from '../../types/bill';
import { formatAmount } from '../../utils/format';

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DetailModal({ open, onClose }: DetailModalProps) {
  const columns: TableColumnsType<StandardBillRecord> = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '一级分类', dataIndex: 'primaryCategory', key: 'primaryCategory' },
    { title: '二级分类', dataIndex: 'secondaryCategory', key: 'secondaryCategory' },
    { title: '金额', dataIndex: 'expenseAmount', key: 'expenseAmount', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '商户', dataIndex: 'merchant', key: 'merchant' },
    { title: '支付方式', dataIndex: 'paymentMethod', key: 'paymentMethod' },
    { title: '备注', dataIndex: 'note', key: 'note' },
  ];

  const totalAmount = mockBills.reduce((sum, item) => sum + item.expenseAmount, 0);

  return (
    <Modal title="2026-05 全部支出明细" open={open} onCancel={onClose} onOk={onClose} width={920}>
      <Table rowKey="id" columns={columns} dataSource={mockBills} pagination={false} scroll={{ x: 820 }} />
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        明细笔数：{mockBills.length}，明细合计金额：{formatAmount(totalAmount)}
      </div>
    </Modal>
  );
}
