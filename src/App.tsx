import { useMemo, useState } from 'react';
import { BarChartOutlined, FileSearchOutlined, FolderOpenOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import AnalysisPage from './pages/AnalysisPage';
import BillManagerPage from './pages/BillManagerPage';
import PreviewPage from './pages/PreviewPage';
import UploadPage from './pages/UploadPage';

type PageKey = 'manager' | 'upload' | 'preview' | 'analysis';

const pageItems: MenuProps['items'] = [
  { key: 'manager', icon: <FolderOpenOutlined />, label: '账单管理' },
  { key: 'upload', icon: <UploadOutlined />, label: '上传账单' },
  { key: 'preview', icon: <FileSearchOutlined />, label: '数据预览' },
  { key: 'analysis', icon: <BarChartOutlined />, label: '月度分析' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('manager');

  const pageContent = useMemo(() => {
    if (currentPage === 'upload') {
      return <UploadPage onGoPreview={() => setCurrentPage('preview')} />;
    }

    if (currentPage === 'preview') {
      return <PreviewPage onGoAnalysis={() => setCurrentPage('analysis')} />;
    }

    if (currentPage === 'analysis') {
      return <AnalysisPage />;
    }

    return <BillManagerPage onUpload={() => setCurrentPage('upload')} onOpenAnalysis={() => setCurrentPage('analysis')} />;
  }, [currentPage]);

  return (
    <Layout className="app-shell">
      <Layout.Sider width={224} className="app-sider">
        <div className="app-brand">
          <Typography.Title level={4}>账单分析</Typography.Title>
          <Typography.Text type="secondary">Expense Bill Analyzer</Typography.Text>
        </div>
        <Menu
          selectedKeys={[currentPage]}
          mode="inline"
          items={pageItems}
          onClick={({ key }) => setCurrentPage(key as PageKey)}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header className="app-header">
          <Typography.Title level={3}>消费账单分析工具</Typography.Title>
          <Button icon={<UploadOutlined />} type="primary" onClick={() => setCurrentPage('upload')}>
            上传账单
          </Button>
        </Layout.Header>
        <Layout.Content className="app-content">{pageContent}</Layout.Content>
      </Layout>
    </Layout>
  );
}
