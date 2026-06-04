import { Button, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import BillManagerTable from '../components/BillManager/BillManagerTable';
import { mockMonthlyBills } from '../mock/bills';

interface BillManagerPageProps {
  onUpload: () => void;
  onOpenAnalysis: () => void;
}

export default function BillManagerPage({ onUpload, onOpenAnalysis }: BillManagerPageProps) {
  return (
    <div className="page-stack">
      <div className="section-header">
        <div>
          <Typography.Title level={4}>账单管理</Typography.Title>
          <Typography.Text type="secondary">本地已保存月份</Typography.Text>
        </div>
        <Button icon={<UploadOutlined />} type="primary" onClick={onUpload}>
          上传新账单
        </Button>
      </div>
      <div className="page-section">
        <BillManagerTable data={mockMonthlyBills} onOpenAnalysis={onOpenAnalysis} />
      </div>
    </div>
  );
}
