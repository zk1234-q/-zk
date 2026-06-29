import { useEffect, useMemo, useState } from 'react';
import { Button, Select, Tabs, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import type { CombinedCategoryRow, MonthlySummaryRow, PrimaryCategoryRow, SecondaryCategoryRow } from '../../types/bill';
import { formatAmount, formatPercent } from '../../utils/format';

interface AnalysisTablesProps {
  monthlyRows: MonthlySummaryRow[];
  primaryRows: PrimaryCategoryRow[];
  secondaryRows: SecondaryCategoryRow[];
  combinedRows: CombinedCategoryRow[];
  onOpenMonthlyDetail: (row: MonthlySummaryRow) => void;
  onOpenPrimaryDetail: (primaryCategory: string, amount: number, budgetInfo: NonNullable<PrimaryCategoryRow['budgetStatus']> extends never ? never : DetailBudgetInfo) => void;
  onOpenSecondaryDetail: (primaryCategory: string, secondaryCategory: string, amount: number) => void;
}

interface DetailBudgetInfo {
  categoryName: string;
  budgetAmount?: number;
  spentAmount: number;
  remainingAmount?: number;
  overBudgetAmount?: number;
  usageRate?: number;
  status: 'none' | 'normal' | 'warning' | 'over' | 'unmatched';
  overBudgetNote?: string;
}

export default function AnalysisTables({
  monthlyRows,
  primaryRows,
  secondaryRows,
  combinedRows,
  onOpenMonthlyDetail,
  onOpenPrimaryDetail,
  onOpenSecondaryDetail,
}: AnalysisTablesProps) {
  const yearOptions = useMemo(() => Array.from(new Set(monthlyRows.map((row) => row.month.slice(0, 4)))).sort((a, b) => b.localeCompare(a)), [monthlyRows]);
  const [selectedYear, setSelectedYear] = useState<string>();
  const currentYear = selectedYear ?? yearOptions[0];
  const filteredMonthlyRows = currentYear ? monthlyRows.filter((row) => row.month.startsWith(`${currentYear}-`)) : monthlyRows;

  useEffect(() => {
    if (yearOptions.length === 0) {
      setSelectedYear(undefined);
      return;
    }

    if (!selectedYear || !yearOptions.includes(selectedYear)) {
      setSelectedYear(yearOptions[0]);
    }
  }, [selectedYear, yearOptions]);

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
      render: (value: number, row) => (
        <Button className={getBudgetAmountClass(row.budgetStatus)} type="link" onClick={() => onOpenPrimaryDetail(row.primaryCategory, value, buildBudgetInfo(row.primaryCategory, value, row))}>
          {formatAmount(value)}
        </Button>
      ),
    },
    { title: '预算', dataIndex: 'budgetAmount', key: 'budgetAmount', align: 'right', render: (value?: number) => (typeof value === 'number' ? formatAmount(value) : '-') },
    { title: '剩余预算', dataIndex: 'remainingBudgetAmount', key: 'remainingBudgetAmount', align: 'right', render: (value?: number) => (typeof value === 'number' ? <span className={value < 0 ? 'amount-danger' : ''}>{formatAmount(value)}</span> : '-') },
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
        children: (
          <Button className={getBudgetAmountClass(row.budgetStatus)} type="link" onClick={() => onOpenPrimaryDetail(row.primaryCategory, value, buildBudgetInfo(row.primaryCategory, value, row))}>
            {formatAmount(value)}
          </Button>
        ),
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
          children: (
            <>
              <div className="table-toolbar">
                <span>年份</span>
                <Select
                  value={currentYear}
                  style={{ width: 120 }}
                  options={yearOptions.map((year) => ({ value: year, label: year }))}
                  onChange={setSelectedYear}
                />
              </div>
              <Table
                rowKey="month"
                columns={monthlyColumns}
                dataSource={filteredMonthlyRows}
                pagination={{ pageSize: 12, showSizeChanger: false }}
                scroll={{ x: 980 }}
              />
            </>
          ),
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

function getBudgetAmountClass(status?: string): string {
  if (status === 'over') {
    return 'amount-danger';
  }

  if (status === 'warning') {
    return 'amount-warning';
  }

  return '';
}

function buildBudgetInfo(primaryCategory: string, amount: number, row: PrimaryCategoryRow | CombinedCategoryRow): DetailBudgetInfo {
  return {
    categoryName: primaryCategory,
    budgetAmount: row.budgetAmount,
    spentAmount: amount,
    remainingAmount: row.remainingBudgetAmount,
    overBudgetAmount: row.overBudgetAmount,
    usageRate: row.budgetUsageRate,
    status: row.budgetStatus ?? 'none',
    overBudgetNote: row.overBudgetNote,
  };
}
