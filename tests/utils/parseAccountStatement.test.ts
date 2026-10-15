import { describe, it, expect } from 'vitest'
import { parseStatementExcel, parseVE, normalizeHouse, parseDateES } from '../../src/shared/utils/parseAccountStatement'
import * as XLSX from 'xlsx'

describe('parseAccountStatement utilities', () => {
  it('parses Venezuelan number format correctly', () => {
    expect(parseVE('1.384.799,40')).toBe(1384799.40)
    expect(parseVE('-10,00 $')).toBe(-10.00)
    expect(parseVE('625,00')).toBe(625.00)
    expect(parseVE('0')).toBe(0)
  })

  it('normalizes house numbers correctly', () => {
    expect(normalizeHouse('Casa 14-28')).toBe('14-28')
    expect(normalizeHouse('14/28')).toBe('14-28')
    expect(normalizeHouse('A-101')).toBe('A-101')
  })

  it('parses Spanish dates correctly', () => {
    expect(parseDateES('30/09/2026')).toBe('2026-09-30')
    expect(parseDateES('01-02-2024')).toBe('2024-02-01')
  })

  it('parses statement excel fixture successfully', async () => {
    // Create an anonymized mock excel workbook matching statement structure
    const wb = XLSX.utils.book_new()
    const wsData = [
      ['CONDOMINIO CONJUNTO 14 LAS HUERTAS', ''],
      ['RIF. J-29900732-3', ''],
      ['ESTADO DE CUENTA HASTA 30/09/2026', ''],
      ['PROPIETARIO: NOMBRE DE PRUEBA   CASA: 99-99', ''],
      ['SALDO PENDIENTE HASTA EL 31/08/2026', '445,00 $'],
      ['** MAS CARGO POR CUOTA MENSUAL', '200,00 $'],
      ['- ABONA PAGO MOVIL', '-20,00 $'],
      ['SALDO PENDIENTE HASTA EL 30/09/2026', '625,00 $']
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    XLSX.utils.book_append_sheet(wb, ws, 'EstadoCuenta')
    const excelBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })

    const result = await parseStatementExcel(excelBuffer, 'estado_cuenta_test.xlsx')

    expect(result.finalBalance).toBe(625.00)
    expect(result.asOfDate).toBe('2026-09-30')
    expect(result.houseNumber).toBe('99-99')
    expect(result.checks.sumMatchesFinal).toBe(true)
    expect(result.checks.checkpointsBad).toBe(0)
  })
})
