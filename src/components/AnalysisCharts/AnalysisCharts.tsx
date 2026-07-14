import { Empty } from 'antd';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyExpenseTrendPoint, PrimaryCategoryChartPoint, SecondaryCategoryRankingPoint } from '../../types/bill';

const chartColors = ['#496cff', '#8b5cf6', '#20bfa2', '#ff826f', '#f5bd4f', '#59a9ff', '#b38cff'];
const tooltipStyle = { borderRadius: 12, border: '1px solid #e7e9f2', boxShadow: '0 12px 28px rgba(67, 76, 117, 0.12)' };

interface AnalysisChartsProps {
  trendData: MonthlyExpenseTrendPoint[];
  primaryData: PrimaryCategoryChartPoint[];
  secondaryData: SecondaryCategoryRankingPoint[];
}

export default function AnalysisCharts({ trendData, primaryData, secondaryData }: AnalysisChartsProps) {
  return (
    <div className="chart-grid">
      <div className="chart-panel chart-panel-wide">
        <div className="section-header">
          <h4>月度总支出趋势</h4>
        </div>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={trendData} margin={{ top: 18, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="analysisTrendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#496cff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#496cff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eceef5" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#8a90a3', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#8a90a3', fontSize: 12 }} width={58} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`¥ ${value.toFixed(2)}`, '月总支出']} />
              <Area type="monotone" dataKey="totalExpense" name="月总支出" stroke="#496cff" strokeWidth={3} fill="url(#analysisTrendArea)" activeDot={{ r: 5, fill: '#496cff', stroke: '#ffffff', strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="暂无趋势数据" />
        )}
      </div>
      <div className="chart-panel">
        <div className="section-header">
          <h4>一级分类支出占比</h4>
        </div>
        {primaryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie data={primaryData} dataKey="amount" nameKey="name" outerRadius={92} innerRadius={58} paddingAngle={3} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {primaryData.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`¥ ${value.toFixed(2)}`, '支出']} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="暂无一级分类数据" />
        )}
      </div>
      <div className="chart-panel">
        <div className="section-header">
          <h4>二级分类支出排行</h4>
        </div>
        {secondaryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={secondaryData.slice(0, 8)} layout="vertical" margin={{ left: 78, right: 16 }}>
              <CartesianGrid stroke="#eceef5" strokeDasharray="4 4" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#8a90a3', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: '#5f6578', fontSize: 12 }} width={116} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`¥ ${value.toFixed(2)}`, '二级金额']} />
              <Bar dataKey="amount" name="二级金额" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="暂无二级分类数据" />
        )}
      </div>
    </div>
  );
}
