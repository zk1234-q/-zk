import { Button, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import AbnormalTable from '../components/AbnormalTable/AbnormalTable';
import { mockAbnormalRecords, mockBills } from '../mock/bills';
import type { StandardBillRecord } from '../types/bill';
import { formatAmount } from '../utils/format';

interface PreviewPageProps {
  onGoAnalysis: () => void;
}

export default function PreviewPage({ onGoAnalysis }: PreviewPageProps) {
  const columns: TableColumnsType<StandardBillRecord> = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '金额', dataIndex: 'amount', key: 'amount', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '一级分类', dataIndex: 'primaryCategory', key: 'primaryCategory' },
    { title: '二级分类', dataIndex: 'secondaryCategory', key: 'secondaryCategory' },
    { title: '商户', dataIndex: 'merchant', key: 'merchant' },
  ];

  return (
    <div className="page-stack">
      <div className="section-header">
        <div>
          <Typography.Title level={4}>数据预览</Typography.Title>
          <Typography.Text type="secondary">字段识别结果</Typography.Text>
        </div>
        <Button type="primary" onClick={onGoAnalysis}>
          保存并查看分析
        </Button>
      </div>
      <div className="page-section">
        <div className="section-header">
          <Typography.Title level={5}>标准化账单预览</Typography.Title>
        </div>
        <Table rowKey="id" columns={columns} dataSource={mockBills} pagination={false} scroll={{ x: 820 }} />
      </div>
      <div className="page-section">
        <div className="section-header">
          <Typography.Title level={5}>异常数据</Typography.Title>
        </div>
        <AbnormalTable data={mockAbnormalRecords} />
      </div>
    </div>
  );
}
