import { Alert, Button, Empty, message, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import AbnormalTable from '../components/AbnormalTable/AbnormalTable';
import type { MonthlyBill, ParsedBillFile, StandardBillRecord } from '../types/bill';
import { checkMonthlyBillExists, saveMonthlyBill } from '../utils/billStorage';
import { getExpenseRecords, sumAmount } from '../utils/calculateSummary';
import { formatAmount } from '../utils/format';

interface PreviewPageProps {
  previewFile: ParsedBillFile | null;
  onSaved: (month: string) => Promise<void>;
}

export default function PreviewPage({ previewFile, onSaved }: PreviewPageProps) {
  const columns: TableColumnsType<StandardBillRecord> = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '金额', dataIndex: 'amount', key: 'amount', align: 'right', render: (value: number) => formatAmount(value) },
    { title: '一级分类', dataIndex: 'primaryCategory', key: 'primaryCategory' },
    { title: '二级分类', dataIndex: 'secondaryCategory', key: 'secondaryCategory' },
    { title: '商户', dataIndex: 'merchant', key: 'merchant' },
  ];

  const handleSave = async () => {
    if (!previewFile) {
      message.warning('请先上传账单');
      return;
    }

    if (previewFile.months.length === 0) {
      message.warning('没有可保存的有效月份，请检查异常数据');
      return;
    }

    const bills = buildMonthlyBills(previewFile);
    const existingMonths: string[] = [];

    for (const bill of bills) {
      if (await checkMonthlyBillExists(bill.month)) {
        existingMonths.push(bill.month);
      }
    }

    if (existingMonths.length > 0) {
      const confirmed = window.confirm(`${existingMonths.join('、')} 已存在，是否覆盖这些月份的本地账单？`);
      if (!confirmed) {
        return;
      }
    }

    for (const bill of bills) {
      await saveMonthlyBill(bill);
    }

    const defaultMonth = chooseDefaultAnalysisMonth(bills);
    message.success(`已保存 ${bills.length} 个月份账单，已进入 ${defaultMonth} 分析`);
    await onSaved(defaultMonth);
  };

  if (!previewFile) {
    return (
      <div className="page-section">
        <Empty description="请先上传账单文件" />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="section-header">
        <div>
          <Typography.Title level={4}>数据预览</Typography.Title>
          <Typography.Text type="secondary">{previewFile.fileName}</Typography.Text>
        </div>
        <Button type="primary" onClick={handleSave}>
          保存并查看分析
        </Button>
      </div>
      <Alert
        type="info"
        showIcon
        message={`识别到 ${previewFile.records.length} 条标准记录，${previewFile.abnormalRecords.length} 条异常记录，可保存月份：${previewFile.months.join('、') || '无'}`}
      />
      <div className="page-section">
        <div className="section-header">
          <Typography.Title level={5}>标准化账单预览</Typography.Title>
        </div>
        <Table rowKey="id" columns={columns} dataSource={previewFile.records.slice(0, 100)} pagination={false} scroll={{ x: 820 }} />
      </div>
      <div className="page-section">
        <div className="section-header">
          <Typography.Title level={5}>异常数据</Typography.Title>
        </div>
        <AbnormalTable data={previewFile.abnormalRecords} />
      </div>
    </div>
  );
}

function chooseDefaultAnalysisMonth(bills: MonthlyBill[]): string {
  return bills.reduce((best, current) => (current.totalExpense > best.totalExpense ? current : best), bills[0]).month;
}

function buildMonthlyBills(previewFile: ParsedBillFile): MonthlyBill[] {
  return previewFile.months.map((month) => {
    const records = previewFile.records.filter((record) => record.month === month);
    const abnormalRecords = previewFile.abnormalRecords.filter((record) => record.month === month || (!record.month && month === previewFile.months[0]));
    const expenseRecords = getExpenseRecords(records);

    return {
      id: month,
      month,
      fileName: previewFile.fileName,
      uploadedAt: new Date().toISOString(),
      records,
      abnormalRecords,
      totalExpense: sumAmount(expenseRecords),
      expenseCount: expenseRecords.length,
      abnormalCount: abnormalRecords.length,
    };
  });
}
