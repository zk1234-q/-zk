import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import { useState } from 'react';
import type { ParsedBillFile } from '../../types/bill';
import { normalizeBillFile } from '../../utils/normalizeBill';
import { parseBillFile } from '../../utils/parseBillFile';

interface UploadBillPanelProps {
  onParsed: (parsedFile: ParsedBillFile) => void;
}

export default function UploadBillPanel({ onParsed }: UploadBillPanelProps) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);

    try {
      const rawRecords = await parseBillFile(file);
      const parsedFile = normalizeBillFile(file.name, rawRecords);
      message.success(`已解析 ${rawRecords.length} 行数据`);
      onParsed(parsedFile);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '账单解析失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-section upload-panel">
      <Upload.Dragger
        accept=".xlsx,.xls,.csv"
        beforeUpload={(file) => {
          void handleFile(file);
          return false;
        }}
        disabled={loading}
        maxCount={1}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{loading ? '正在解析账单...' : '选择或拖入 iCost 账单文件'}</p>
        <p className="ant-upload-hint">支持 Excel 和 CSV，解析成功后进入数据预览</p>
      </Upload.Dragger>
    </div>
  );
}
