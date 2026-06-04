import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import type { AbnormalBillRecord } from '../../types/bill';

interface AbnormalTableProps {
  data: AbnormalBillRecord[];
}

export default function AbnormalTable({ data }: AbnormalTableProps) {
  const columns: TableColumnsType<AbnormalBillRecord> = [
    { title: '原始行号', dataIndex: 'rawIndex', key: 'rawIndex', width: 96 },
    { title: '异常原因', dataIndex: 'reason', key: 'reason' },
    { title: '原始日期', dataIndex: 'rawDate', key: 'rawDate' },
    { title: '原始类型', dataIndex: 'rawType', key: 'rawType' },
    { title: '原始金额', dataIndex: 'rawAmount', key: 'rawAmount' },
    { title: '一级分类', dataIndex: 'rawPrimaryCategory', key: 'rawPrimaryCategory' },
    { title: '二级分类', dataIndex: 'rawSecondaryCategory', key: 'rawSecondaryCategory' },
    { title: '备注', dataIndex: 'rawNote', key: 'rawNote' },
  ];

  return <Table rowKey="id" columns={columns} dataSource={data} pagination={false} scroll={{ x: 920 }} />;
}
