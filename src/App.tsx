import { useCallback, useEffect, useState } from 'react';
import { BarChartOutlined, FileSearchOutlined, FolderOpenOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import AnalysisPage from './pages/AnalysisPage';
import BillManagerPage from './pages/BillManagerPage';
import PreviewPage from './pages/PreviewPage';
import UploadPage from './pages/UploadPage';
import type { MonthlyBill, ParsedBillFile } from './types/bill';
import { deleteMonthlyBill, getAllMonthlyBills } from './utils/billStorage';

type PageKey = 'manager' | 'upload' | 'preview' | 'analysis';

const pageItems: MenuProps['items'] = [
  { key: 'manager', icon: <FolderOpenOutlined />, label: '账单管理' },
  { key: 'upload', icon: <UploadOutlined />, label: '上传账单' },
  { key: 'preview', icon: <FileSearchOutlined />, label: '数据预览' },
  { key: 'analysis', icon: <BarChartOutlined />, label: '月度分析' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('manager');
  const [previewFile, setPreviewFile] = useState<ParsedBillFile | null>(null);
  const [monthlyBills, setMonthlyBills] = useState<MonthlyBill[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>();

  const refreshMonthlyBills = useCallback(async () => {
    const bills = await getAllMonthlyBills();
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
    await deleteMonthlyBill(month);
    const bills = await getAllMonthlyBills();
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
            <div className="brand-mark">账</div>
            <div>
              <Typography.Title level={4}>账单分析</Typography.Title>
              <Typography.Text type="secondary">Expense Bill Analyzer</Typography.Text>
            </div>
          </div>
          <Menu
            className="app-menu"
            selectedKeys={[currentPage]}
            mode="inline"
            items={pageItems}
            onClick={({ key }) => setCurrentPage(key as PageKey)}
          />
        </Layout.Sider>
        <Layout>
          <Layout.Header className="app-header">
            <div>
              <Typography.Title level={3}>消费账单分析工具</Typography.Title>
              <Typography.Text type="secondary">本地解析、按月保存、表格核对、图表辅助</Typography.Text>
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
