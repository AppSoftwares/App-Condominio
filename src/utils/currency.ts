/**
 * Utilidad para conversión de moneda basada en la tasa oficial BCV
 */

// Tasa oficial de referencia (según captura: 560.37 Bs/$)
export const BCV_RATE = 560.3753

export const formatBs = (dollars: number) => {
  const amount = dollars * BCV_RATE
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
