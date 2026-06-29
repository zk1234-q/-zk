import { useCallback, useEffect, useState } from 'react';
import { BankOutlined, BarChartOutlined, FlagOutlined, FolderOpenOutlined, SettingOutlined, UploadOutlined, WalletOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import AnalysisPage from './pages/AnalysisPage';
import AssetPage from './pages/AssetPage';
import BillManagerPage from './pages/BillManagerPage';
import BudgetPage from './pages/BudgetPage';
import GoalPage from './pages/GoalPage';
import PreviewPage from './pages/PreviewPage';
import SettingsPage from './pages/SettingsPage';
import UploadPage from './pages/UploadPage';
import type { MonthlyBill, ParsedBillFile } from './types/bill';
import { billRepository } from './repositories/billRepository';

type PageKey = 'manager' | 'upload' | 'preview' | 'analysis' | 'budget' | 'asset' | 'goal' | 'settings';

const pageItems: MenuProps['items'] = [
  { key: 'manager', icon: <FolderOpenOutlined />, label: '账单管理' },
  { key: 'analysis', icon: <BarChartOutlined />, label: '月度分析' },
  { key: 'budget', icon: <WalletOutlined />, label: '预算管理' },
  { key: 'asset', icon: <BankOutlined />, label: '资产总览' },
  { key: 'goal', icon: <FlagOutlined />, label: '目标管理' },
  { key: 'settings', icon: <SettingOutlined />, label: '设置' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('manager');
  const [previewFile, setPreviewFile] = useState<ParsedBillFile | null>(null);
  const [monthlyBills, setMonthlyBills] = useState<MonthlyBill[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>();

  const refreshMonthlyBills = useCallback(async () => {
    const bills = await billRepository.getAllMonthlyBills();
    setMonthlyBills(bills);

    if (!selectedMonth && bills.length > 0) {
      setSelectedMonth(bills[0].month);
    }
  }, [selectedMonth]);

  useEffect(() => {
    void refreshMonthlyBills();
  }, [refreshMonthlyBills]);

  const handleParsed = (parsedFile: ParsedBillFile) => {
    setPreviewFile(parsedFile);
    setCurrentPage('preview');
  };

  const handleSaved = async (month: string) => {
    setSelectedMonth(month);
    await refreshMonthlyBills();
    setCurrentPage('analysis');
  };

  const handleDeleteMonth = async (month: string) => {
    await billRepository.deleteMonthlyBill(month);
    const bills = await billRepository.getAllMonthlyBills();
    setMonthlyBills(bills);

    if (selectedMonth === month) {
      setSelectedMonth(bills[0]?.month);
    }
  };

  const renderPageContent = () => {
    if (currentPage === 'upload') {
      return <UploadPage onParsed={handleParsed} />;
    }

    if (currentPage === 'preview') {
      return <PreviewPage previewFile={previewFile} onSaved={handleSaved} />;
    }

    if (currentPage === 'analysis') {
      return <AnalysisPage monthlyBills={monthlyBills} selectedMonth={selectedMonth} onChangeMonth={setSelectedMonth} />;
    }

    if (currentPage === 'budget') {
      return <BudgetPage monthlyBills={monthlyBills} />;
    }

    if (currentPage === 'asset') {
      return <AssetPage />;
    }

    if (currentPage === 'goal') {
      return <GoalPage />;
    }

    if (currentPage === 'settings') {
      return <SettingsPage onDataImported={refreshMonthlyBills} />;
    }

    return (
      <BillManagerPage
        monthlyBills={monthlyBills}
        onUpload={() => setCurrentPage('upload')}
        onDeleteMonth={handleDeleteMonth}
        onOpenAnalysis={(month) => {
          setSelectedMonth(month);
          setCurrentPage('analysis');
        }}
      />
    );
  };

  const selectedMenuKey = currentPage === 'upload' || currentPage === 'preview' ? 'manager' : currentPage;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1d5fd6',
          borderRadius: 8,
          colorBgLayout: '#f3f5f8',
          fontFamily: 'Inter, "Segoe UI", "Microsoft YaHei", Arial, sans-serif',
        },
        components: {
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#1f2937',
            rowHoverBg: '#f4f7fb',
          },
          Menu: {
            itemBorderRadius: 8,
          },
        },
      }}
    >
      <Layout className="app-shell">
        <Layout.Sider width={236} className="app-sider">
          <div className="app-brand">
            <div className="brand-mark">
              <BarChartOutlined />
            </div>
            <div>
              <Typography.Title level={4}>账单管理</Typography.Title>
              <Typography.Text type="secondary">分析系统</Typography.Text>
            </div>
          </div>
          <Menu
            className="app-menu"
            selectedKeys={[selectedMenuKey]}
            mode="inline"
            items={pageItems}
            onClick={({ key }) => setCurrentPage(key as PageKey)}
          />
        </Layout.Sider>
        <Layout>
          <Layout.Header className="app-header">
            <div>
              <Typography.Title level={3}>账单管理分析系统</Typography.Title>
              <Typography.Text type="secondary">账单分析 · 资产盘点 · 目标管理</Typography.Text>
            </div>
            <Button icon={<UploadOutlined />} type="primary" onClick={() => setCurrentPage('upload')}>
              上传账单
            </Button>
          </Layout.Header>
          <Layout.Content className="app-content">{renderPageContent()}</Layout.Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
