import * as XLSX from 'xlsx';
import type { RawBillRecord } from '../types/bill';

export async function parseBillFile(file: File): Promise<RawBillRecord[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('文件中没有可读取的工作表');
  }

  const worksheet = workbook.Sheets[firstSheetName];

  return XLSX.utils.sheet_to_json<RawBillRecord>(worksheet, {
    defval: '',
    raw: false,
  });
}
