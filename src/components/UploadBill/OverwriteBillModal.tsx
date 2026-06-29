import { Modal, Table } from 'antd';
import type { MonthlyBill } from '../../types/bill';
import { formatAmount } from '../../utils/format';

interface OverwriteBillModalProps {
  open: boolean;
  oldBill?: MonthlyBill;
  newBill?: MonthlyBill;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function OverwriteBillModal({ open, oldBill, newBill, onConfirm, onCancel }: OverwriteBillModalProps) {
  const rows = [
    { label: '月份', oldValue: oldBill?.month, newValue: newBill?.month },
    { label: '文件名', oldValue: oldBill?.fileName, newValue: newBill?.fileName },
    { label: '上传时间', oldValue: formatDate(oldBill?.uploadedAt), newValue: formatDate(newBill?.uploadedAt) },
    { label: '原始行数', oldValue: oldBill?.rawRowCount ?? oldBill?.records.length, newValue: newBill?.rawRowCount ?? newBill?.records.length },
    { label: '有效支出行数', oldValue: oldBill?.validExpenseRowCount ?? oldBill?.expenseCount, newValue: newBill?.validExpenseRowCount ?? newBill?.expenseCount },
    { label: '异常行数', oldValue: oldBill?.abnormalRowCount ?? oldBill?.abnormalCount, newValue: newBill?.abnormalRowCount ?? newBill?.abnormalCount },
    { label: '月总支出', oldValue: formatAmount(oldBill?.totalExpense ?? 0), newValue: formatAmount(newBill?.totalExpense ?? 0) },
  ];

  return (
    <Modal title="已存在同月份账单，是否覆盖？" open={open} onOk={onConfirm} onCancel={onCancel} okText="覆盖旧账单" cancelText="取消保存" width={760}>
      <Table
        rowKey="label"
        size="small"
        pagination={false}
        dataSource={rows}
        columns={[
          { title: '信息', dataIndex: 'label', key: 'label' },
          { title: '已保存账单', dataIndex: 'oldValue', key: 'oldValue' },
          { title: '本次上传账单', dataIndex: 'newValue', key: 'newValue' },
        ]}
      />
    </Modal>
  );
}

function formatDate(value?: string): string {
  return value ? new Date(value).toLocaleString() : '-';
}
