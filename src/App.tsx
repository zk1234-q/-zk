import { useCallback, useEffect, useState } from 'react';
import {
  BankOutlined,
  BarChartOutlined,
  CheckCircleFilled,
  FlagOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  SettingOutlined,
  UploadOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Button, ConfigProvider, Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import AnalysisPage from './pages/AnalysisPage';
import AssetPage from './pages/AssetPage';
import BillManagerPage from './pages/BillManagerPage';
import BudgetPage from './pages/BudgetPage';
import DashboardPage from './pages/DashboardPage';
import GoalPage from './pages/GoalPage';
import PreviewPage from './pages/PreviewPage';
import SettingsPage from './pages/SettingsPage';
import UploadPage from './pages/UploadPage';
import type { MonthlyBill, ParsedBillFile } from './types/bill';
import { billRepository } from './repositories/billRepository';

type PageKey = 'overview' | 'manager' | 'upload' | 'preview' | 'analysis' | 'budget' | 'asset' | 'goal' | 'settings';

const pageItems: MenuProps['items'] = [
  { key: 'overview', icon: <HomeOutlined />, label: '总览' },
  { key: 'manager', icon: <FolderOpenOutlined />, label: '账单' },
  { key: 'analysis', icon: <BarChartOutlined />, label: '分析' },
  { key: 'budget', icon: <WalletOutlined />, label: '预算' },
  { key: 'asset', icon: <BankOutlined />, label: '资产' },
  { key: 'goal', icon: <FlagOutlined />, label: '目标' },
  { key: 'settings', icon: <SettingOutlined />, label: '设置' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('overview');
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
    if (currentPage === 'overview') {
      return (
        <DashboardPage
          monthlyBills={monthlyBills}
          selectedMonth={selectedMonth}
          onChangeMonth={setSelectedMonth}
          onOpenAnalysis={(month) => {
            setSelectedMonth(month);
            setCurrentPage('analysis');
          }}
          onOpenBills={() => setCurrentPage('manager')}
          onUpload={() => setCurrentPage('upload')}
        />
      );
    }

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
          colorPrimary: '#496cff',
          colorSuccess: '#20bfa2',
          colorWarning: '#f6a63b',
          colorError: '#ff646d',
          borderRadius: 12,
          colorBgLayout: '#f6f7fb',
          colorText: '#202337',
          colorTextSecondary: '#7b8193',
          colorBorderSecondary: '#eceef5',
          fontFamily: 'Inter, "Segoe UI", "Microsoft YaHei", Arial, sans-serif',
        },
        components: {
          Table: {
            headerBg: '#f8f9fd',
            headerColor: '#4d5367',
            rowHoverBg: '#f6f7ff',
            borderColor: '#eceef5',
          },
          Menu: {
            itemBorderRadius: 12,
            itemSelectedBg: '#eef0ff',
            itemSelectedColor: '#496cff',
          },
          Button: { borderRadius: 10 },
        },
      }}
    >
      <Layout className="app-shell">
        <Layout.Sider width={216} className="app-sider">
          <div className="app-brand">
            <div className="brand-mark">
              <BarChartOutlined />
            </div>
            <Typography.Title level={4}>账单管理分析系统</Typography.Title>
          </div>
          <Menu
            className="app-menu"
            selectedKeys={[selectedMenuKey]}
            mode="inline"
            items={pageItems}
            onClick={({ key }) => setCurrentPage(key as PageKey)}
          />
          <div className="local-data-card">
            <CheckCircleFilled />
            <div>
              <strong>数据本地保存</strong>
              <span>仅保存在当前浏览器</span>
            </div>
          </div>
        </Layout.Sider>
        <Layout>
          <Layout.Header className="app-header">
            <div className="topbar-status">
              <CheckCircleFilled />
              <span>本地存储 · 数据仅保存在本机</span>
            </div>
            <Button icon={<UploadOutlined />} type="primary" onClick={() => setCurrentPage('upload')}>
              导入账单
            </Button>
          </Layout.Header>
          <Layout.Content className="app-content">{renderPageContent()}</Layout.Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
