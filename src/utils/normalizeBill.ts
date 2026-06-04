import type { AbnormalBillRecord, ParsedBillFile, RawBillRecord, StandardBillRecord } from '../types/bill';

interface FieldMap {
  date?: string;
  type?: string;
  amount?: string;
  primaryCategory?: string;
  secondaryCategory?: string;
  merchant?: string;
  paymentMethod?: string;
  note?: string;
}

const fieldAliases: Record<keyof FieldMap, string[]> = {
  date: ['消费日期', '日期', '时间', '记账日期', '账单日期', '创建时间'],
  type: ['类型', '收支类型', '账单类型'],
  amount: ['金额', '消费金额', '支出金额', '收入金额'],
  primaryCategory: ['一级分类', '大类', '分类', '主分类'],
  secondaryCategory: ['二级分类', '小类', '子分类'],
  merchant: ['商户', '商家', '对象', '交易对象'],
  paymentMethod: ['支付方式', '账户', '支付账户', '账户1'],
  note: ['备注', '说明', '描述'],
};

const knownTypes = ['支出', '收入', '退款', '转账', '借入'];

export function normalizeBillFile(fileName: string, rawRecords: RawBillRecord[]): ParsedBillFile {
  const fieldMap = detectFieldMap(rawRecords);
  const records: StandardBillRecord[] = [];
  const abnormalRecords: AbnormalBillRecord[] = [];

  rawRecords.forEach((rawRecord, index) => {
    const rawIndex = index + 2;
    const rawDate = readRawValue(rawRecord, fieldMap.date);
    const rawType = readRawValue(rawRecord, fieldMap.type);
    const rawAmount = readRawValue(rawRecord, fieldMap.amount);
    const rawPrimaryCategory = readRawValue(rawRecord, fieldMap.primaryCategory);
    const rawSecondaryCategory = readRawValue(rawRecord, fieldMap.secondaryCategory);
    const rawMerchant = readRawValue(rawRecord, fieldMap.merchant);
    const rawPaymentMethod = readRawValue(rawRecord, fieldMap.paymentMethod);
    const rawNote = readRawValue(rawRecord, fieldMap.note);

    const date = parseDate(rawDate);
    const amount = parseAmount(rawAmount);
    const type = rawType.trim();
    const reasons: string[] = [];

    if (!date) {
      reasons.push('日期无法识别');
    }

    if (amount === null) {
      reasons.push('金额无法识别');
    }

    if (!type) {
      reasons.push('类型为空');
    } else if (!knownTypes.includes(type)) {
      reasons.push('类型无法识别');
    }

    if (amount !== null && amount < 0 && type !== '支出') {
      reasons.push('负数金额');
    }

    if (reasons.length > 0) {
      abnormalRecords.push({
        id: `abnormal-${rawIndex}`,
        rawIndex,
        month: date?.month,
        reason: reasons.join('，'),
        rawDate,
        rawType,
        rawAmount,
        rawPrimaryCategory,
        rawSecondaryCategory,
        rawNote,
        rawRecord,
      });
    }

    if (!date || amount === null || reasons.some((reason) => ['日期无法识别', '金额无法识别', '类型为空', '类型无法识别', '负数金额'].includes(reason))) {
      return;
    }

    const isExpense = type === '支出';
    const isIncome = type === '收入';
    const normalizedAmount = Math.abs(amount);
    const abnormalReason = isExpense ? '' : `${type}不计入消费支出`;

    records.push({
      id: `bill-${rawIndex}`,
      rawIndex,
      date: date.date,
      month: date.month,
      type,
      amount,
      expenseAmount: isExpense ? normalizedAmount : 0,
      incomeAmount: isIncome ? normalizedAmount : 0,
      primaryCategory: rawPrimaryCategory.trim() || '未分类',
      secondaryCategory: rawSecondaryCategory.trim() || '未分类',
      merchant: rawMerchant,
      paymentMethod: rawPaymentMethod,
      note: rawNote,
      isIncludedInExpense: isExpense,
      abnormalReason,
    });
  });

  const months = Array.from(new Set(records.map((record) => record.month))).sort();

  return {
    fileName,
    rawRecords,
    records,
    abnormalRecords,
    months,
  };
}

function detectFieldMap(rawRecords: RawBillRecord[]): FieldMap {
  const firstRecord = rawRecords[0] ?? {};
  const headers = Object.keys(firstRecord);

  return (Object.keys(fieldAliases) as Array<keyof FieldMap>).reduce<FieldMap>((map, key) => {
    map[key] = headers.find((header) => fieldAliases[key].some((alias) => normalizeHeader(header).includes(normalizeHeader(alias))));
    return map;
  }, {});
}

function normalizeHeader(value: string): string {
  return value.replace(/\s/g, '').toLowerCase();
}

function readRawValue(record: RawBillRecord, key?: string): string {
  if (!key) {
    return '';
  }

  const value = record[key];
  return value === null || value === undefined ? '' : String(value).trim();
}

function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[,\s￥¥]/g, '');

  if (!cleaned) {
    return null;
  }

  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : null;
}

function parseDate(value: string): { date: string; month: string } | null {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/\//g, '-').trim();
  const matched = normalized.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (!matched) {
    return null;
  }

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  const dateText = `${year}-${pad2(month)}-${pad2(day)}`;
  return {
    date: dateText,
    month: `${year}-${pad2(month)}`,
  };
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}
