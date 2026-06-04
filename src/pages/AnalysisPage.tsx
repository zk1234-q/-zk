import { useState } from 'react';
import { Select, Typography } from 'antd';
import AnalysisCharts from '../components/AnalysisCharts/AnalysisCharts';
import AnalysisTables from '../components/AnalysisTables/AnalysisTables';
import DetailModal from '../components/DetailModal/DetailModal';
import { mockMonthlySummary } from '../mock/bills';
import { formatAmount, formatPercent } from '../utils/format';

export default function AnalysisPage() {
  const [detailOpen, setDetailOpen] = useState(false);
  const summary = mockMonthlySummary[0];

  return (
    <div className="page-stack">
      <div className="section-header">
        <div>
          <Typography.Title level={4}>月度分析</Typography.Title>
          <Typography.Text type="secondary">当前月份：{summary.month}</Typography.Text>
        </div>
        <Select value={summary.month} style={{ width: 160 }} options={[{ value: summary.month, label: summary.month }]} />
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
      <AnalysisCharts />
      <div className="page-section">
        <AnalysisTables onOpenDetail={() => setDetailOpen(true)} />
      </div>
      <DetailModal open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  );
}
