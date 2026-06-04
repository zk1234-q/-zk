import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { mockPrimaryRows, mockSecondaryRows, mockMonthlyBills } from '../../mock/bills';

const chartColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];

export default function AnalysisCharts() {
  const trendData = mockMonthlyBills.map((item) => ({
    month: item.month,
    totalExpense: item.totalExpense,
  }));

  const primaryData = mockPrimaryRows.map((item) => ({
    name: item.primaryCategory,
    value: item.primaryAmount,
  }));

  const secondaryData = mockSecondaryRows.map((item) => ({
    name: `${item.primaryCategory}-${item.secondaryCategory}`,
    amount: item.secondaryAmount,
  }));

  return (
    <div className="chart-grid">
      <div className="chart-panel chart-panel-wide">
        <div className="section-header">
          <h4>月度总支出趋势</h4>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalExpense" name="月总支出" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-panel">
        <div className="section-header">
          <h4>一级分类支出占比</h4>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={primaryData} dataKey="value" nameKey="name" outerRadius={90} label>
              {primaryData.map((entry, index) => (
                <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-panel">
        <div className="section-header">
          <h4>二级分类支出排行</h4>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={secondaryData} layout="vertical" margin={{ left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="amount" name="二级金额" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
