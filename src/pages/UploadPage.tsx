import { Typography } from 'antd';
import UploadBillPanel from '../components/UploadBill/UploadBillPanel';

interface UploadPageProps {
  onGoPreview: () => void;
}

export default function UploadPage({ onGoPreview }: UploadPageProps) {
  return (
    <div className="page-stack">
      <div>
        <Typography.Title level={4}>上传账单</Typography.Title>
        <Typography.Text type="secondary">iCost Excel / CSV</Typography.Text>
      </div>
      <UploadBillPanel onGoPreview={onGoPreview} />
    </div>
  );
}
