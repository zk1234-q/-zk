import { Button, Tabs, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import type { CombinedCategoryRow, MonthlySummaryRow, PrimaryCategoryRow, SecondaryCategoryRow } from '../../types/bill';
import { mockCombinedRows, mockMonthlySummary, mockPrimaryRows, mockSecondaryRows } from '../../mock/bills';
import { formatAmount, formatPercent } from '../../utils/format';

interface AnalysisTablesProps {
  onOpenDetail: () => void;
}

export default function AnalysisTables({ onOpenDetail }: AnalysisTablesProps) {
  const monthlyColumns: TableColumnsType<MonthlySummaryRow> = [
    { title: '月份', dataIndex: 'month', key: 'month' },
    { title: '月收入', dataIndex: 'income', key: 'income', align: 'right', render: (value: number) => formatAmount(value) },
    {
      title: '月总支出',
      dataIndex: 'totalExpense',
      key: 'totalExpense',
      align: 'right',
      render: (value: number) => (
        <Button type="link" onClick={onOpenDetail}>
          {formatAmount(value)}
        </Button>
      ),
    },
    { title: '月结余', dataIndex: 'balance', key: 'balance', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '结余率', dataIndex: 'balanceRate', key: 'balanceRate', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '支出笔数', dataIndex: 'expenseCount', key: 'expenseCount', align: 'right' },
    { title: '异常数', dataIndex: 'abnormalCount', key: 'abnormalCount', align: 'right' },
  ];

  const primaryColumns: TableColumnsType<PrimaryCategoryRow> = [
    { title: '一级分类', dataIndex: 'primaryCategory', key: 'primaryCategory' },
    {
      title: '一级金额',
      dataIndex: 'primaryAmount',
      key: 'primaryAmount',
      align: 'right',
      sorter: (a, b) => a.primaryAmount - b.primaryAmount,
      render: (value: number) => (
        <Button type="link" onClick={onOpenDetail}>
          {formatAmount(value)}
        </Button>
      ),
    },
    { title: '一级占总支出', dataIndex: 'primaryExpenseRatio', key: 'primaryExpenseRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '一级占收入', dataIndex: 'primaryIncomeRatio', key: 'primaryIncomeRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '笔数', dataIndex: 'count', key: 'count', align: 'right' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  const secondaryColumns: TableColumnsType<SecondaryCategoryRow> = [
    { title: '一级分类', dataIndex: 'primaryCategory', key: 'primaryCategory' },
    { title: '二级分类', dataIndex: 'secondaryCategory', key: 'secondaryCategory' },
    {
      title: '二级金额',
      dataIndex: 'secondaryAmount',
      key: 'secondaryAmount',
      align: 'right',
      sorter: (a, b) => a.secondaryAmount - b.secondaryAmount,
      render: (value: number) => (
        <Button type="link" onClick={onOpenDetail}>
          {formatAmount(value)}
        </Button>
      ),
    },
    { title: '二级占总支出', dataIndex: 'secondaryExpenseRatio', key: 'secondaryExpenseRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '二级占收入', dataIndex: 'secondaryIncomeRatio', key: 'secondaryIncomeRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '笔数', dataIndex: 'count', key: 'count', align: 'right' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  const combinedColumns: TableColumnsType<CombinedCategoryRow> = [
    { title: '一级分类', dataIndex: 'primaryCategory', key: 'primaryCategory' },
    { title: '二级分类', dataIndex: 'secondaryCategory', key: 'secondaryCategory' },
    {
      title: '一级金额',
      dataIndex: 'primaryAmount',
      key: 'primaryAmount',
      align: 'right',
      sorter: (a, b) => a.primaryAmount - b.primaryAmount,
      render: (value: number) => (
        <Button type="link" onClick={onOpenDetail}>
          {formatAmount(value)}
        </Button>
      ),
    },
    { title: '一级占总支出', dataIndex: 'primaryExpenseRatio', key: 'primaryExpenseRatio', align: 'right', render: (value: number) => formatPercent(value) },
    {
      title: '二级金额',
      dataIndex: 'secondaryAmount',
      key: 'secondaryAmount',
      align: 'right',
      sorter: (a, b) => a.secondaryAmount - b.secondaryAmount,
      render: (value: number) => (
        <Button type="link" onClick={onOpenDetail}>
          {formatAmount(value)}
        </Button>
      ),
    },
    { title: '二级占总支出', dataIndex: 'secondaryExpenseRatio', key: 'secondaryExpenseRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '二级占一级', dataIndex: 'secondaryPrimaryRatio', key: 'secondaryPrimaryRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '一级占收入', dataIndex: 'primaryIncomeRatio', key: 'primaryIncomeRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '二级占收入', dataIndex: 'secondaryIncomeRatio', key: 'secondaryIncomeRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '二级笔数', dataIndex: 'secondaryCount', key: 'secondaryCount', align: 'right' },
  ];

  return (
    <Tabs
      items={[
        {
          key: 'monthly',
          label: '月度汇总',
          children: <Table rowKey="month" columns={monthlyColumns} dataSource={mockMonthlySummary} pagination={false} scroll={{ x: 980 }} />,
        },
        {
          key: 'primary',
          label: '一级分类',
          children: <Table rowKey="primaryCategory" columns={primaryColumns} dataSource={mockPrimaryRows} pagination={false} />,
        },
        {
          key: 'secondary',
          label: '二级分类',
          children: <Table rowKey={(row) => `${row.primaryCategory}-${row.secondaryCategory}`} columns={secondaryColumns} dataSource={mockSecondaryRows} pagination={false} scroll={{ x: 920 }} />,
        },
        {
          key: 'combined',
          label: '一级 + 二级综合',
          children: <Table rowKey={(row) => `${row.primaryCategory}-${row.secondaryCategory}`} columns={combinedColumns} dataSource={mockCombinedRows} pagination={false} scroll={{ x: 1280 }} />,
        },
      ]}
    />
  );
}
