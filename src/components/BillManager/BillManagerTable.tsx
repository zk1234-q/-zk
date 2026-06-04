import { Button, Space, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import type { MonthlyBill } from '../../types/bill';
import { formatAmount } from '../../utils/format';

interface BillManagerTableProps {
  data: MonthlyBill[];
  onOpenAnalysis: () => void;
}

export default function BillManagerTable({ data, onOpenAnalysis }: BillManagerTableProps) {
  const columns: TableColumnsType<MonthlyBill> = [
    { title: '月份', dataIndex: 'month', key: 'month' },
    { title: '文件名', dataIndex: 'fileName', key: 'fileName' },
    { title: '支出笔数', dataIndex: 'expenseCount', key: 'expenseCount', align: 'right' },
    {
      title: '月总支出',
      dataIndex: 'totalExpense',
      key: 'totalExpense',
      align: 'right',
      render: (value: number) => formatAmount(value),
    },
    {
      title: '异常记录',
      dataIndex: 'abnormalCount',
      key: 'abnormalCount',
      align: 'right',
      render: (value: number) => (value > 0 ? <Tag color="warning">{value}</Tag> : <Tag color="success">0</Tag>),
    },
    {
      title: '操作',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" type="link" onClick={onOpenAnalysis}>
            查看分析
          </Button>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={data} pagination={false} />;
}
