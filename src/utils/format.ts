/** 金额统一保留 2 位小数，避免各个页面重复处理格式。 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/** 百分比统一保留 1 位小数，输入值按 0-1 的比例处理。 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
