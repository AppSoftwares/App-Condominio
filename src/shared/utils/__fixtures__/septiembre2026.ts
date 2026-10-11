// Creado por Jesús Pirela.
import { FinanceReportData } from '../parseFinanceExcel';

export const SEPTIEMBRE_2026_EXPECTED: FinanceReportData = {
  mes: 'Septiembre 2026',
  openingBalance: { bs: 460979.18, zelle: 757.09, divisas: 70 },
  totalIncome: { bs: 1848338.77, zelle: 797.09, divisas: 70 },
  totalExpense: { bs: 1702215.58, zelle: 400, divisas: 20 },
  closingBalance: { bs: 146123.19, zelle: 397.09, divisas: 50 },
  lines: [
    { date: '01/09/2026', concept: 'SALDO ANTERIOR', category: 'Saldo', transferenciaBs: 460979.18, zelleUsd: 757.09, divisasUsd: 70, isKeyRow: true, keyRowType: 'opening' },
    { date: '05/09/2026', concept: 'Cobranza Cuota Septiembre', category: 'Mantenimiento', transferenciaBs: 1000000, zelleUsd: 500, divisasUsd: 50 },
    { date: '10/09/2026', concept: 'Pago Nomina Vigilancia Sr. Juan Perez', category: 'Nomina', transferenciaBs: 800000, zelleUsd: 300, divisasUsd: 10, hasPersonalData: true, redactedConcept: 'Pago Nomina Vigilancia [TITULO] [RESERVADO] [RESERVADO]' },
    { date: '15/09/2026', concept: 'Compra Insumos Limpieza', category: 'Compras', transferenciaBs: 102215.58, zelleUsd: 100, divisasUsd: 10 },
    { date: '30/09/2026', concept: 'TOTALES', category: 'Totales', transferenciaBs: 1848338.77, zelleUsd: 797.09, divisasUsd: 70, isKeyRow: true, keyRowType: 'total' },
    { date: '30/09/2026', concept: 'SALDO TOTAL', category: 'Saldo', transferenciaBs: 146123.19, zelleUsd: 397.09, divisasUsd: 50, isKeyRow: true, keyRowType: 'closing' }
  ],
  warnings: []
};
