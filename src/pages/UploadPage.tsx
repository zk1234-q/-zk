import { Typography } from 'antd';
import UploadBillPanel from '../components/UploadBill/UploadBillPanel';
import type { ParsedBillFile } from '../types/bill';

interface UploadPageProps {
  onParsed: (parsedFile: ParsedBillFile) => void;
}

export default function UploadPage({ onParsed }: UploadPageProps) {
  return (
    <div className="page-stack">
      <div>
        <Typography.Title level={4}>上传账单</Typography.Title>
        <Typography.Text type="secondary">iCost Excel / CSV</Typography.Text>
      </div>
      <UploadBillPanel onParsed={onParsed} />
    </div>
  );
}
