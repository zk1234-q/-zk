import { Button, Popconfirm, Space, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import type { MonthlyBill } from '../../types/bill';
import { formatAmount } from '../../utils/format';

interface BillManagerTableProps {
  data: MonthlyBill[];
  onOpenAnalysis: (month: string) => void;
  onDeleteMonth: (month: string) => void;
}

export default function BillManagerTable({ data, onOpenAnalysis, onDeleteMonth }: BillManagerTableProps) {
  const columns: TableColumnsType<MonthlyBill> = [
    { title: '月份', dataIndex: 'month', key: 'month' },
    { title: '文件名', dataIndex: 'fileName', key: 'fileName' },
    { title: '原始行数', dataIndex: 'rawRowCount', key: 'rawRowCount', align: 'right', render: (_value, row) => row.rawRowCount ?? row.records.length },
    { title: '支出笔数', dataIndex: 'expenseCount', key: 'expenseCount', align: 'right' },
    { title: '有效支出行', dataIndex: 'validExpenseRowCount', key: 'validExpenseRowCount', align: 'right', render: (_value, row) => row.validExpenseRowCount ?? row.expenseCount },
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
      render: (value: number, row) => {
        const count = row.abnormalRowCount ?? value;
        return count > 0 ? <Tag color="warning">{count}</Tag> : <Tag color="success">0</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => onOpenAnalysis(record.month)}>
            查看分析
          </Button>
          <Popconfirm title={`删除 ${record.month} 的本地账单？`} onConfirm={() => onDeleteMonth(record.month)}>
            <Button size="small" danger type="link">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={columns} dataSource={data} pagination={false} locale={{ emptyText: '暂无已保存月份，请先上传账单' }} />;
}
