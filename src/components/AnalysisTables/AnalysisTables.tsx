import { Button, Tabs, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import type { CombinedCategoryRow, MonthlySummaryRow, PrimaryCategoryRow, SecondaryCategoryRow } from '../../types/bill';
import { formatAmount, formatPercent } from '../../utils/format';

interface AnalysisTablesProps {
  monthlyRows: MonthlySummaryRow[];
  primaryRows: PrimaryCategoryRow[];
  secondaryRows: SecondaryCategoryRow[];
  combinedRows: CombinedCategoryRow[];
  onOpenMonthlyDetail: (row: MonthlySummaryRow) => void;
  onOpenSecondaryDetail: (primaryCategory: string, secondaryCategory: string, amount: number) => void;
}

export default function AnalysisTables({
  monthlyRows,
  primaryRows,
  secondaryRows,
  combinedRows,
  onOpenMonthlyDetail,
  onOpenSecondaryDetail,
}: AnalysisTablesProps) {
  const getCombinedRowSpan = (index: number) => {
    const current = combinedRows[index];

    if (!current) {
      return 0;
    }

    const previous = combinedRows[index - 1];

    if (previous?.primaryCategory === current.primaryCategory) {
      return 0;
    }

    return combinedRows.filter((row) => row.primaryCategory === current.primaryCategory).length;
  };

  const monthlyColumns: TableColumnsType<MonthlySummaryRow> = [
    { title: '月份', dataIndex: 'month', key: 'month' },
    { title: '月收入', dataIndex: 'income', key: 'income', align: 'right', render: (value: number) => formatAmount(value) },
    {
      title: '月总支出',
      dataIndex: 'totalExpense',
      key: 'totalExpense',
      align: 'right',
      render: (value: number, row) => (
        <Button type="link" onClick={() => onOpenMonthlyDetail(row)}>
          {formatAmount(value)}
        </Button>
      ),
    },
    { title: '月结余', dataIndex: 'balance', key: 'balance', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '结余率', dataIndex: 'balanceRate', key: 'balanceRate', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '支出笔数', dataIndex: 'expenseCount', key: 'expenseCount', align: 'right' },
    { title: '异常笔数', dataIndex: 'abnormalCount', key: 'abnormalCount', align: 'right' },
  ];

  const primaryColumns: TableColumnsType<PrimaryCategoryRow> = [
    { title: '一级分类', dataIndex: 'primaryCategory', key: 'primaryCategory' },
    {
      title: '分类总支出',
      dataIndex: 'primaryAmount',
      key: 'primaryAmount',
      align: 'right',
      sorter: (a, b) => a.primaryAmount - b.primaryAmount,
      render: (value: number) => formatAmount(value),
    },
    { title: '占总支出', dataIndex: 'primaryExpenseRatio', key: 'primaryExpenseRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '占收入', dataIndex: 'primaryIncomeRatio', key: 'primaryIncomeRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '笔数', dataIndex: 'count', key: 'count', align: 'right' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  const secondaryColumns: TableColumnsType<SecondaryCategoryRow> = [
    { title: '一级分类', dataIndex: 'primaryCategory', key: 'primaryCategory' },
    { title: '二级分类', dataIndex: 'secondaryCategory', key: 'secondaryCategory' },
    {
      title: '二级支出',
      dataIndex: 'secondaryAmount',
      key: 'secondaryAmount',
      align: 'right',
      render: (value: number, row) => (
        <Button type="link" onClick={() => onOpenSecondaryDetail(row.primaryCategory, row.secondaryCategory, row.secondaryAmount)}>
          {formatAmount(value)}
        </Button>
      ),
    },
    { title: '占总支出', dataIndex: 'secondaryExpenseRatio', key: 'secondaryExpenseRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '占收入', dataIndex: 'secondaryIncomeRatio', key: 'secondaryIncomeRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '笔数', dataIndex: 'count', key: 'count', align: 'right' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  const combinedColumns: TableColumnsType<CombinedCategoryRow> = [
    {
      title: '一级分类',
      dataIndex: 'primaryCategory',
      key: 'primaryCategory',
      render: (value: string, _row, index) => ({
        children: value,
        props: { rowSpan: getCombinedRowSpan(index) },
      }),
    },
    { title: '二级分类', dataIndex: 'secondaryCategory', key: 'secondaryCategory' },
    {
      title: '一级总支出',
      dataIndex: 'primaryAmount',
      key: 'primaryAmount',
      align: 'right',
      render: (value: number, row, index) => ({
        children: formatAmount(value),
        props: { rowSpan: getCombinedRowSpan(index) },
      }),
    },
    {
      title: '一级占总支出',
      dataIndex: 'primaryExpenseRatio',
      key: 'primaryExpenseRatio',
      align: 'right',
      render: (value: number, _row, index) => ({
        children: formatPercent(value),
        props: { rowSpan: getCombinedRowSpan(index) },
      }),
    },
    {
      title: '二级支出',
      dataIndex: 'secondaryAmount',
      key: 'secondaryAmount',
      align: 'right',
      render: (value: number, row) => (
        <Button type="link" onClick={() => onOpenSecondaryDetail(row.primaryCategory, row.secondaryCategory, row.secondaryAmount)}>
          {formatAmount(value)}
        </Button>
      ),
    },
    { title: '二级占总支出', dataIndex: 'secondaryExpenseRatio', key: 'secondaryExpenseRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '二级占本类', dataIndex: 'secondaryPrimaryRatio', key: 'secondaryPrimaryRatio', align: 'right', render: (value: number) => formatPercent(value) },
    {
      title: '一级占收入',
      dataIndex: 'primaryIncomeRatio',
      key: 'primaryIncomeRatio',
      align: 'right',
      render: (value: number, _row, index) => ({
        children: formatPercent(value),
        props: { rowSpan: getCombinedRowSpan(index) },
      }),
    },
    { title: '二级占收入', dataIndex: 'secondaryIncomeRatio', key: 'secondaryIncomeRatio', align: 'right', render: (value: number) => formatPercent(value) },
    { title: '二级笔数', dataIndex: 'secondaryCount', key: 'secondaryCount', align: 'right' },
  ];

  return (
    <Tabs
      items={[
        {
          key: 'monthly',
          label: '月度汇总',
          children: <Table rowKey="month" columns={monthlyColumns} dataSource={monthlyRows} pagination={false} scroll={{ x: 980 }} />,
        },
        {
          key: 'primary',
          label: '一级分类占用',
          children: <Table rowKey="primaryCategory" columns={primaryColumns} dataSource={primaryRows} pagination={false} />,
        },
        {
          key: 'secondary',
          label: '二级分类占用',
          children: <Table rowKey={(row) => `${row.primaryCategory}-${row.secondaryCategory}`} columns={secondaryColumns} dataSource={secondaryRows} pagination={false} scroll={{ x: 920 }} />,
        },
        {
          key: 'combined',
          label: '分类占用明细',
          children: <Table rowKey={(row) => `${row.primaryCategory}-${row.secondaryCategory}`} columns={combinedColumns} dataSource={combinedRows} pagination={false} scroll={{ x: 1280 }} />,
        },
      ]}
    />
  );
}
