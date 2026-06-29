import { Alert, Button, Empty, message, Table, Typography } from 'antd';
import { useState } from 'react';
import type { TableColumnsType } from 'antd';
import AbnormalTable from '../components/AbnormalTable/AbnormalTable';
import OverwriteBillModal from '../components/UploadBill/OverwriteBillModal';
import type { MonthlyBill, ParsedBillFile, StandardBillRecord } from '../types/bill';
import { billRepository } from '../repositories/billRepository';
import { getExpenseRecords, sumAmount } from '../utils/calculateSummary';
import { formatAmount } from '../utils/format';

interface PreviewPageProps {
  previewFile: ParsedBillFile | null;
  onSaved: (month: string) => Promise<void>;
}

export default function PreviewPage({ previewFile, onSaved }: PreviewPageProps) {
  const [pendingBills, setPendingBills] = useState<MonthlyBill[]>([]);
  const [overwritePair, setOverwritePair] = useState<{ oldBill: MonthlyBill; newBill: MonthlyBill } | null>(null);
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

    for (const bill of bills) {
      const oldBill = await billRepository.getMonthlyBill(bill.month);
      if (oldBill) {
        setPendingBills(bills);
        setOverwritePair({ oldBill, newBill: bill });
        return;
      }
    }

    await saveBillsAndOpenAnalysis(bills);
  };

  const saveBillsAndOpenAnalysis = async (bills: MonthlyBill[]) => {
    for (const bill of bills) {
      await billRepository.saveMonthlyBill(bill);
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
      <OverwriteBillModal
        open={Boolean(overwritePair)}
        oldBill={overwritePair?.oldBill}
        newBill={overwritePair?.newBill}
        onCancel={() => {
          setOverwritePair(null);
          setPendingBills([]);
        }}
        onConfirm={() => {
          const bills = pendingBills;
          setOverwritePair(null);
          setPendingBills([]);
          void saveBillsAndOpenAnalysis(bills);
        }}
      />
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
      rawRowCount: records.length + abnormalRecords.length,
      validExpenseRowCount: expenseRecords.length,
      abnormalRowCount: abnormalRecords.length,
    };
  });
}
