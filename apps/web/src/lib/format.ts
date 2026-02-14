/**
 * Format a numeric string as GBP with thousands separators.
 * "25000000.00" → "£25,000,000.00"
 */
export function formatGBP(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return `£${value}`;
  return `£${num.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
