import { InboxOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';

interface UploadBillPanelProps {
  onGoPreview: () => void;
}

export default function UploadBillPanel({ onGoPreview }: UploadBillPanelProps) {
  return (
    <div className="page-section upload-panel">
      <Upload.Dragger accept=".xlsx,.xls,.csv" beforeUpload={() => false} maxCount={1}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">选择或拖入 iCost 账单文件</p>
        <p className="ant-upload-hint">支持 Excel 和 CSV</p>
      </Upload.Dragger>
      <div style={{ marginTop: 16 }}>
        <Button type="primary" onClick={onGoPreview}>
          进入数据预览
        </Button>
      </div>
    </div>
  );
}
