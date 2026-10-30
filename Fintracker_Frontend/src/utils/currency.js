const DEFAULT_CURRENCY = 'INR'

export const CURRENCY_CONFIG = {
  INR: { code: 'INR', locale: 'en-IN', symbol: '₹' },
  USD: { code: 'USD', locale: 'en-US', symbol: '$' },
  EUR: { code: 'EUR', locale: 'en-IE', symbol: '€' },
  GBP: { code: 'GBP', locale: 'en-GB', symbol: '£' },
  AED: { code: 'AED', locale: 'ar-AE', symbol: 'د.إ' },
  SGD: { code: 'SGD', locale: 'en-SG', symbol: 'S$' },
  CAD: { code: 'CAD', locale: 'en-CA', symbol: 'C$' },
  AUD: { code: 'AUD', locale: 'en-AU', symbol: 'A$' },
  JPY: { code: 'JPY', locale: 'ja-JP', symbol: '¥' },
  CNY: { code: 'CNY', locale: 'zh-CN', symbol: '¥' },
}

export const CURRENCY_OPTIONS = Object.entries(CURRENCY_CONFIG).map(([value, config]) => ({
  value,
  label: `${config.symbol} ${value}`,
}))

export const getStoredCurrency = () => {
  try {
    return localStorage.getItem('fintracker_currency') || DEFAULT_CURRENCY
  } catch {
    return DEFAULT_CURRENCY
  }
}

export const setStoredCurrency = (currency) => {
  try {
    localStorage.setItem('fintracker_currency', currency || DEFAULT_CURRENCY)
  } catch {
    // ignore storage errors
  }
}

export const formatCurrency = (amount, currencyCode = getStoredCurrency()) => {
  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG[DEFAULT_CURRENCY]
  const numericValue = Number(amount || 0)

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}
