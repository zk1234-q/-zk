import { Empty } from 'antd';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyExpenseTrendPoint, PrimaryCategoryChartPoint, SecondaryCategoryRankingPoint } from '../../types/bill';

const chartColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];

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
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalExpense" name="月总支出" fill="#2563eb" />
            </BarChart>
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
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={primaryData} dataKey="amount" nameKey="name" outerRadius={90} label>
                {primaryData.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
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
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={secondaryData} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="amount" name="二级金额" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="暂无二级分类数据" />
        )}
      </div>
    </div>
  );
}
