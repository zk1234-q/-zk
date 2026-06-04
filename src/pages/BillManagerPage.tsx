import { Button, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import BillManagerTable from '../components/BillManager/BillManagerTable';
import type { MonthlyBill } from '../types/bill';

interface BillManagerPageProps {
  monthlyBills: MonthlyBill[];
  onUpload: () => void;
  onOpenAnalysis: (month: string) => void;
  onDeleteMonth: (month: string) => void;
}

export default function BillManagerPage({ monthlyBills, onUpload, onOpenAnalysis, onDeleteMonth }: BillManagerPageProps) {
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
        <BillManagerTable data={monthlyBills} onOpenAnalysis={onOpenAnalysis} onDeleteMonth={onDeleteMonth} />
      </div>
    </div>
  );
}
