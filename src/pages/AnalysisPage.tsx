import { useEffect, useState } from 'react';
import { Empty, Select, Tag, Typography } from 'antd';
import AnalysisCharts from '../components/AnalysisCharts/AnalysisCharts';
import AnalysisTables from '../components/AnalysisTables/AnalysisTables';
import DetailModal from '../components/DetailModal/DetailModal';
import type { DetailFilter, MonthlyBill, MonthlySummaryRow } from '../types/bill';
import type { MonthlyCategoryBudget } from '../types/budget';
import { calculateMonthlyExpenseTrend, calculatePrimaryCategoryChart, calculateSecondaryCategoryRanking } from '../utils/calculateCharts';
import { calculateMonthlyCategoryBudgetRows, mergeBudgetStatusIntoCombinedRows, mergeBudgetStatusIntoPrimaryRows } from '../utils/calculateBudget';
import {
  calculateCombinedCategoryRows,
  calculateMonthlySummary,
  calculatePrimaryCategoryRows,
  calculateSecondaryCategoryRows,
} from '../utils/calculateSummary';
import { budgetRepository } from '../repositories/budgetRepository';
import { formatAmount, formatPercent } from '../utils/format';
import { settingsRepository } from '../repositories/settingsRepository';

interface AnalysisPageProps {
  monthlyBills: MonthlyBill[];
  selectedMonth?: string;
  onChangeMonth: (month: string) => void;
}

export default function AnalysisPage({ monthlyBills, selectedMonth, onChangeMonth }: AnalysisPageProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailFilter, setDetailFilter] = useState<DetailFilter | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState(9000);
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyCategoryBudget[]>([]);
  const monthlyRows = calculateMonthlySummary(monthlyBills, monthlyIncome);
  const currentMonth = selectedMonth ?? monthlyRows[0]?.month;
  const currentBill = monthlyBills.find((bill) => bill.month === currentMonth);
  const summary = monthlyRows.find((row) => row.month === currentMonth);
  const currentRecords = currentBill?.records ?? [];
  const allRecords = monthlyBills.flatMap((bill) => bill.records);
  const budgetRows = calculateMonthlyCategoryBudgetRows(monthlyBudgets, currentBill);
  const primaryRows = currentMonth ? mergeBudgetStatusIntoPrimaryRows(calculatePrimaryCategoryRows(currentRecords, currentMonth, monthlyIncome), budgetRows) : [];
  const secondaryRows = currentMonth ? calculateSecondaryCategoryRows(currentRecords, currentMonth, monthlyIncome) : [];
  const combinedRows = currentMonth ? mergeBudgetStatusIntoCombinedRows(calculateCombinedCategoryRows(currentRecords, currentMonth, monthlyIncome), budgetRows) : [];
  const trendData = calculateMonthlyExpenseTrend(monthlyBills);
  const primaryChartData = calculatePrimaryCategoryChart(primaryRows);
  const secondaryRankingData = calculateSecondaryCategoryRanking(secondaryRows);

  const openDetail = (filter: DetailFilter) => {
    setDetailFilter(filter);
    setDetailOpen(true);
  };

  useEffect(() => {
    void settingsRepository.getUserSettings().then((settings) => setMonthlyIncome(settings.defaultMonthlyIncome));
  }, []);

  useEffect(() => {
    if (!currentMonth) {
      setMonthlyBudgets([]);
      return;
    }

    void budgetRepository.getMonthlyCategoryBudgets(currentMonth).then(setMonthlyBudgets);
  }, [currentMonth]);

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
      <div className="page-title-row">
        <div>
          <Typography.Title level={3}>月度分析</Typography.Title>
          <Typography.Text type="secondary">表格用于核对金额，图表用于观察结构和趋势</Typography.Text>
        </div>
        <div className="month-switcher">
          <span>当前月份</span>
          <Select
            value={summary.month}
            style={{ width: 160 }}
            options={monthlyRows.map((row) => ({ value: row.month, label: row.month }))}
            onChange={onChangeMonth}
          />
          {summary.isPartialMonth ? <Tag color="warning">非完整月</Tag> : null}
        </div>
      </div>
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
      <div className="visual-section analysis-visual-section">
        <div className="section-header">
          <div>
            <Typography.Title level={4}>可视化分析</Typography.Title>
            <Typography.Text type="secondary">辅助查看月份趋势、一级占比和二级排行</Typography.Text>
          </div>
        </div>
        <AnalysisCharts trendData={trendData} primaryData={primaryChartData} secondaryData={secondaryRankingData} />
      </div>
      <div className="page-section analysis-table-section">
        <div className="section-header">
          <div>
            <Typography.Title level={4}>明细分析表</Typography.Title>
            <Typography.Text type="secondary">点击二级支出金额可查看对应消费明细</Typography.Text>
          </div>
        </div>
        <AnalysisTables
          monthlyRows={monthlyRows}
          primaryRows={primaryRows}
          secondaryRows={secondaryRows}
          combinedRows={combinedRows}
          onOpenMonthlyDetail={openMonthlyDetail}
          onOpenPrimaryDetail={(primaryCategory, amount, budgetInfo) =>
            openDetail({
              month: currentMonth,
              primaryCategory,
              title: `${currentMonth} ${primaryCategory}消费明细`,
              expectedAmount: amount,
              budgetInfo,
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
