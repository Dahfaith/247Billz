export const CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
]

export function getCurrencySymbol(currencyCode: string = 'NGN'): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode)
  return currency?.symbol || '₦'
}

export function formatCurrency(amount: number, currencyCode: string = 'NGN'): string {
  const symbol = getCurrencySymbol(currencyCode)
  
  // Format with commas, handling decimals
  // For standard currencies we'll use toLocaleString without the native currency formatting
  // to ensure our custom symbols always show up correctly.
  
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  return `${symbol}${formattedAmount}`
}
