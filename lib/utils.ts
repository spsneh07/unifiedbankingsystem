/**
 * Format a number as Indian Rupee currency
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Mask account number for display (show last 4 digits)
 */
export function maskAccountNo(accountNo: string): string {
  if (!accountNo || accountNo.length <= 4) return accountNo || '';
  return '•••• ' + accountNo.slice(-4);
}
