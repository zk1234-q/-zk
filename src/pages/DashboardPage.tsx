import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  BankOutlined,
  CheckCircleFilled,
  FlagOutlined,
  NotificationOutlined,
  UploadOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Button, Empty, Progress, Select, Table, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AssetSnapshot } from '../types/asset';
import type { MonthlyBill } from '../types/bill';
import type { Goal } from '../types/goal';
import type { BudgetSettings, UserSettings } from '../types/settings';
import { assetRepository } from '../repositories/assetRepository';
import { goalRepository } from '../repositories/goalRepository';
import { settingsRepository } from '../repositories/settingsRepository';
import { calculateAssetSnapshotSummary, getLatestAssetSnapshot } from '../utils/calculateAsset';
import { calculateMonthlyExpenseTrend, calculatePrimaryCategoryChart } from '../utils/calculateCharts';
import { calculateGoalOverview } from '../utils/calculateGoal';
import { calculateMonthlySummary, calculatePrimaryCategoryRows } from '../utils/calculateSummary';
import { formatAmount, formatPercent } from '../utils/format';

const categoryColors = ['#496cff', '#8b5cf6', '#20bfa2', '#ff826f', '#f5bd4f', '#59a9ff'];

interface DashboardPageProps {
  monthlyBills: MonthlyBill[];
  selectedMonth?: string;
  onChangeMonth: (month: string) => void;
  onOpenAnalysis: (month: string) => void;
  onOpenBills: () => void;
  onUpload: () => void;
}

export default function DashboardPage({ monthlyBills, selectedMonth, onChangeMonth, onOpenAnalysis, onOpenBills, onUpload }: DashboardPageProps) {
  const [userSettings, setUserSettings] = useState<UserSettings>(() => settingsRepository.createDefaultUserSettings());
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(() => settingsRepository.createDefaultBudgetSettings());
  const [assetSnapshots, setAssetSnapshots] = useState<AssetSnapshot[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    void Promise.all([
      settingsRepository.getUserSettings(),
      settingsRepository.getBudgetSettings(),
      assetRepository.getAssetSnapshots(),
      goalRepository.getGoals(),
    ]).then(([nextUserSettings, nextBudgetSettings, nextAssetSnapshots, nextGoals]) => {
      setUserSettings(nextUserSettings);
      setBudgetSettings(nextBudgetSettings);
      setAssetSnapshots(nextAssetSnapshots);
      setGoals(nextGoals);
    });
  }, []);

  const monthlyRows = useMemo(
    () => calculateMonthlySummary(monthlyBills, userSettings.defaultMonthlyIncome),
    [monthlyBills, userSettings.defaultMonthlyIncome],
  );
  const currentMonth = selectedMonth ?? monthlyRows[0]?.month;
  const currentBill = monthlyBills.find((bill) => bill.month === currentMonth);
  const currentSummary = monthlyRows.find((row) => row.month === currentMonth);
  const previousSummary = monthlyRows.find((row) => row.month < (currentMonth ?? ''));
  const expenseChange = currentSummary && previousSummary && previousSummary.totalExpense > 0
    ? (currentSummary.totalExpense - previousSummary.totalExpense) / previousSummary.totalExpense
    : 0;
  const budgetUsageRate = budgetSettings.monthlyExpenseBudget > 0 && currentSummary
    ? currentSummary.totalExpense / budgetSettings.monthlyExpenseBudget
    : 0;
  const latestAssetSnapshot = getLatestAssetSnapshot(assetSnapshots);
  const latestAssetSummary = latestAssetSnapshot ? calculateAssetSnapshotSummary(latestAssetSnapshot) : undefined;
  const goalOverview = calculateGoalOverview(goals);
  const goalProgressRate = goalOverview.totalTargetAmount > 0 ? goalOverview.totalCurrentAmount / goalOverview.totalTargetAmount : 0;
  const trendData = calculateMonthlyExpenseTrend(monthlyBills).slice(-6);
  const primaryRows = currentBill && currentMonth
    ? calculatePrimaryCategoryRows(currentBill.records, currentMonth, userSettings.defaultMonthlyIncome)
    : [];
  const categoryData = calculatePrimaryCategoryChart(primaryRows).slice(0, 6);
  const abnormalCount = currentBill?.abnormalRecords.length ?? 0;

  const notices = [
    budgetUsageRate > 1
      ? { tone: 'danger', title: '预算已超支', detail: `当月支出超出预算 ${formatAmount((currentSummary?.totalExpense ?? 0) - budgetSettings.monthlyExpenseBudget)} 元` }
      : budgetUsageRate >= 0.8
        ? { tone: 'warning', title: '预算接近上限', detail: `本月预算已使用 ${formatPercent(budgetUsageRate)}` }
        : null,
    abnormalCount > 0
      ? { tone: 'warning', title: '发现异常记录', detail: `${currentMonth} 有 ${abnormalCount} 条记录需要核对` }
      : null,
    goals.filter((goal) => goal.status === 'active').length > 0
      ? { tone: 'info', title: '目标持续推进', detail: `当前有 ${goals.filter((goal) => goal.status === 'active').length} 个进行中目标` }
      : null,
  ].filter((item): item is { tone: string; title: string; detail: string } => Boolean(item));

  const billColumns: TableColumnsType<MonthlyBill> = [
    { title: '月份', dataIndex: 'month', key: 'month', render: (value: string, row) => <strong>{value}{row.month === currentMonth ? <Tag color="blue">当前</Tag> : null}</strong> },
    { title: '文件', dataIndex: 'fileName', key: 'fileName' },
    { title: '支出笔数', dataIndex: 'expenseCount', key: 'expenseCount', align: 'right' },
    { title: '支出（元）', dataIndex: 'totalExpense', key: 'totalExpense', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '异常', dataIndex: 'abnormalCount', key: 'abnormalCount', align: 'right', render: (value: number) => value > 0 ? <Tag color="warning">{value} 条</Tag> : <span className="status-ok"><CheckCircleFilled /> 正常</span> },
    { title: '操作', key: 'actions', align: 'right', render: (_, row) => <Button type="link" onClick={() => onOpenAnalysis(row.month)}>查看分析 <ArrowRightOutlined /></Button> },
  ];

  return (
    <div className="dashboard-page page-stack">
      <div className="dashboard-heading">
        <div>
          <Typography.Title level={2}>财务总览</Typography.Title>
          <Typography.Text type="secondary">把账单、预算、资产和目标放在同一张财务地图里</Typography.Text>
        </div>
        {monthlyRows.length ? (
          <Select
            value={currentMonth}
            options={monthlyRows.map((row) => ({ value: row.month, label: row.month }))}
            onChange={onChangeMonth}
            className="dashboard-month-select"
          />
        ) : null}
      </div>

      <div className="dashboard-kpi-grid">
        <section className="dashboard-hero-card">
          <div className="hero-summary">
            <span>本月结余</span>
            <strong>¥ {formatAmount(currentSummary?.balance ?? userSettings.defaultMonthlyIncome)}</strong>
            <div className={expenseChange > 0 ? 'hero-change hero-change-up' : 'hero-change'}>
              {expenseChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              较上月 {formatPercent(Math.abs(expenseChange))}
            </div>
            <Button onClick={() => currentMonth ? onOpenAnalysis(currentMonth) : onUpload()}>{currentMonth ? '查看明细' : '导入账单'} <ArrowRightOutlined /></Button>
          </div>
          <div className="hero-breakdown">
            <div><span>收入</span><strong>¥ {formatAmount(currentSummary?.income ?? userSettings.defaultMonthlyIncome)}</strong></div>
            <div><span>支出</span><strong>¥ {formatAmount(currentSummary?.totalExpense ?? 0)}</strong></div>
            <div><span>结余率</span><strong>{formatPercent(currentSummary?.balanceRate ?? 1)}</strong></div>
          </div>
          <div className="hero-chart">
            <span>近 6 月支出趋势</span>
            {trendData.length ? (
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="dashboardHeroArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.36} />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="totalExpense" stroke="#ffffff" strokeWidth={2.5} fill="url(#dashboardHeroArea)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="hero-chart-empty">导入账单后显示趋势</div>}
          </div>
        </section>

        <MetricCard icon={<WalletOutlined />} title="预算使用率" value={formatPercent(budgetUsageRate)} detail={`¥ ${formatAmount(currentSummary?.totalExpense ?? 0)} / ¥ ${formatAmount(budgetSettings.monthlyExpenseBudget)}`} progress={budgetUsageRate * 100} />
        <MetricCard icon={<BankOutlined />} title="净资产" value={`¥ ${formatAmount(latestAssetSummary?.netAsset ?? 0)}`} detail={latestAssetSnapshot ? `最新盘点 ${latestAssetSnapshot.snapshotDate}` : '还没有资产盘点'} />
        <MetricCard icon={<FlagOutlined />} title="目标进度" value={`${goalOverview.activeGoalCount} 个`} detail={`已完成 ${formatPercent(goalProgressRate)}`} progress={goalProgressRate * 100} />
      </div>

      <div className="dashboard-visual-grid">
        <section className="dashboard-panel dashboard-trend-panel">
          <PanelTitle title="近 6 月支出趋势" action="查看分析" onClick={() => currentMonth && onOpenAnalysis(currentMonth)} />
          {trendData.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData} margin={{ top: 18, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="dashboardTrendArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#496cff" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#496cff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eceef5" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a90a3', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a90a3', fontSize: 12 }} width={58} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e9f2', boxShadow: '0 12px 28px rgba(67, 76, 117, 0.12)' }} formatter={(value: number) => [`¥ ${formatAmount(value)}`, '支出']} />
                <Area type="monotone" dataKey="totalExpense" stroke="#496cff" strokeWidth={3} fill="url(#dashboardTrendArea)" activeDot={{ r: 5, fill: '#496cff', stroke: '#fff', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <DashboardEmpty onUpload={onUpload} />}
        </section>

        <section className="dashboard-panel dashboard-category-panel">
          <PanelTitle title="支出类别分布" action="查看全部" onClick={() => currentMonth && onOpenAnalysis(currentMonth)} />
          {categoryData.length ? (
            <div className="category-chart-wrap">
              <ResponsiveContainer width="56%" height={230}>
                <PieChart>
                  <Pie data={categoryData} dataKey="amount" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={3}>
                    {categoryData.map((entry, index) => <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`¥ ${formatAmount(value)}`, '支出']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="category-legend">
                {categoryData.map((item, index) => (
                  <div key={item.name}><i style={{ background: categoryColors[index % categoryColors.length] }} /><span>{item.name}</span><strong>{formatPercent(item.ratio)}</strong></div>
                ))}
              </div>
            </div>
          ) : <DashboardEmpty onUpload={onUpload} />}
        </section>

        <section className="dashboard-panel dashboard-notice-panel">
          <PanelTitle title="提醒" />
          {notices.length ? notices.map((notice) => (
            <div key={notice.title} className={`notice-item notice-${notice.tone}`}>
              <NotificationOutlined />
              <div><strong>{notice.title}</strong><span>{notice.detail}</span></div>
            </div>
          )) : (
            <div className="notice-empty"><CheckCircleFilled /><strong>状态良好</strong><span>当前没有需要处理的提醒</span></div>
          )}
        </section>
      </div>

      <section className="dashboard-panel dashboard-bill-panel">
        <PanelTitle title="账单月份" action="管理全部账单" onClick={onOpenBills} />
        {monthlyBills.length ? (
          <Table rowKey="id" columns={billColumns} dataSource={monthlyBills.slice(0, 6)} pagination={false} scroll={{ x: 860 }} />
        ) : (
          <div className="dashboard-upload-empty">
            <UploadOutlined />
            <div><strong>导入第一份账单</strong><span>支持 Excel 和 CSV，数据仅保存在当前浏览器</span></div>
            <Button type="primary" onClick={onUpload}>导入账单</Button>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ icon, title, value, detail, progress }: { icon: React.ReactNode; title: string; value: string; detail: string; progress?: number }) {
  return (
    <section className="dashboard-metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{title}</span>
      <strong>{value}</strong>
      {typeof progress === 'number' ? <Progress percent={Math.max(0, Math.min(100, progress))} showInfo={false} strokeColor="#496cff" trailColor="#eceef5" /> : null}
      <small>{detail}</small>
    </section>
  );
}

function PanelTitle({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) {
  return (
    <div className="dashboard-panel-title">
      <h3>{title}</h3>
      {action ? <Button type="link" onClick={onClick}>{action} <ArrowRightOutlined /></Button> : null}
    </div>
  );
}

function DashboardEmpty({ onUpload }: { onUpload: () => void }) {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Button type="link" onClick={onUpload}>导入账单后查看数据</Button>} />;
}
