/**
 * Utilidad para conversión de moneda basada en la tasa oficial BCV
 */

// Tasa estática de respaldo (se actualiza dinámicamente en los componentes)
export const BCV_RATE_DEFAULT = 567.68

export const formatBs = (dollars: number, customRate?: number) => {
  const rate = customRate || BCV_RATE_DEFAULT
  const amount = dollars * rate
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2
  }).format(amount)
}

export const formatUSD = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
