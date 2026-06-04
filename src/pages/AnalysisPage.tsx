import { useState } from 'react';
import { Alert, Empty, Select, Typography } from 'antd';
import AnalysisCharts from '../components/AnalysisCharts/AnalysisCharts';
import AnalysisTables from '../components/AnalysisTables/AnalysisTables';
import DetailModal from '../components/DetailModal/DetailModal';
import type { DetailFilter, MonthlyBill, MonthlySummaryRow } from '../types/bill';
import { calculateMonthlyExpenseTrend, calculatePrimaryCategoryChart, calculateSecondaryCategoryRanking } from '../utils/calculateCharts';
import {
  calculateCombinedCategoryRows,
  calculateMonthlySummary,
  calculatePrimaryCategoryRows,
  calculateSecondaryCategoryRows,
} from '../utils/calculateSummary';
import { formatAmount, formatPercent } from '../utils/format';

interface AnalysisPageProps {
  monthlyBills: MonthlyBill[];
  selectedMonth?: string;
  onChangeMonth: (month: string) => void;
}

export default function AnalysisPage({ monthlyBills, selectedMonth, onChangeMonth }: AnalysisPageProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailFilter, setDetailFilter] = useState<DetailFilter | null>(null);
  const monthlyRows = calculateMonthlySummary(monthlyBills);
  const currentMonth = selectedMonth ?? monthlyRows[monthlyRows.length - 1]?.month;
  const currentBill = monthlyBills.find((bill) => bill.month === currentMonth);
  const summary = monthlyRows.find((row) => row.month === currentMonth);
  const currentRecords = currentBill?.records ?? [];
  const allRecords = monthlyBills.flatMap((bill) => bill.records);
  const primaryRows = currentMonth ? calculatePrimaryCategoryRows(currentRecords, currentMonth) : [];
  const secondaryRows = currentMonth ? calculateSecondaryCategoryRows(currentRecords, currentMonth) : [];
  const combinedRows = currentMonth ? calculateCombinedCategoryRows(currentRecords, currentMonth) : [];
  const trendData = calculateMonthlyExpenseTrend(monthlyBills);
  const primaryChartData = calculatePrimaryCategoryChart(primaryRows);
  const secondaryRankingData = calculateSecondaryCategoryRanking(secondaryRows);

  const openDetail = (filter: DetailFilter) => {
    setDetailFilter(filter);
    setDetailOpen(true);
  };

  const openMonthlyDetail = (row: MonthlySummaryRow) => {
    openDetail({
      month: row.month,
      title: `${row.month} 全部支出明细`,
      expectedAmount: row.totalExpense,
    });
  };

  if (!summary || !currentMonth) {
    return (
      <div className="page-section">
        <Empty description="暂无可分析账单，请先上传并保存账单" />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="section-header">
        <div>
          <Typography.Title level={4}>月度分析</Typography.Title>
          <Typography.Text type="secondary">当前月份：{summary.month}</Typography.Text>
        </div>
        <Select
          value={summary.month}
          style={{ width: 160 }}
          options={monthlyRows.map((row) => ({ value: row.month, label: row.month }))}
          onChange={onChangeMonth}
        />
      </div>
      <Alert
        type={summary.isPartialMonth ? 'warning' : 'info'}
        showIcon
        message={
          summary.isPartialMonth
            ? `${summary.month} 是非完整月，仅参考。请用右上角月份切换查看其它月份。`
            : `当前展示 ${summary.month} 的统计数据，可用右上角月份切换。`
        }
      />
      <div className="summary-grid">
        <div className="summary-tile">
          <div className="summary-label">月收入</div>
          <div className="summary-value">{formatAmount(summary.income)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">月总支出</div>
          <div className="summary-value">{formatAmount(summary.totalExpense)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">月结余</div>
          <div className="summary-value">{formatAmount(summary.balance)}</div>
        </div>
        <div className="summary-tile">
          <div className="summary-label">结余率</div>
          <div className="summary-value">{formatPercent(summary.balanceRate)}</div>
        </div>
      </div>
      <AnalysisCharts trendData={trendData} primaryData={primaryChartData} secondaryData={secondaryRankingData} />
      <div className="page-section">
        <AnalysisTables
          monthlyRows={monthlyRows}
          primaryRows={primaryRows}
          secondaryRows={secondaryRows}
          combinedRows={combinedRows}
          onOpenMonthlyDetail={openMonthlyDetail}
          onOpenPrimaryDetail={(primaryCategory, amount) =>
            openDetail({
              month: currentMonth,
              primaryCategory,
              title: `${currentMonth} ${primaryCategory}消费明细`,
              expectedAmount: amount,
            })
          }
          onOpenSecondaryDetail={(primaryCategory, secondaryCategory, amount) =>
            openDetail({
              month: currentMonth,
              primaryCategory,
              secondaryCategory,
              title: `${currentMonth} ${primaryCategory}-${secondaryCategory}消费明细`,
              expectedAmount: amount,
            })
          }
        />
      </div>
      <DetailModal records={allRecords} filter={detailFilter} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  );
}
