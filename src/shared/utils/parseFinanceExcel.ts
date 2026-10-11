// Creado por Jesús Pirela.
import * as XLSX from 'xlsx';
import { detectPersonalData, redactPersonalData } from './detectPersonalData';

export interface FinanceLine {
  id?: string;
  date: string;
  concept: string;
  category: string;
  transferenciaBs: number;
  zelleUsd: number;
  divisasUsd: number;
  isKeyRow?: boolean;
  keyRowType?: 'opening' | 'income' | 'expense' | 'total' | 'closing' | 'realizado_por';
  hasPersonalData?: boolean;
  redactedConcept?: string;
}

export interface FinanceReportData {
  mes: string;
  cluster?: string;
  openingBalance: { bs: number; zelle: number; divisas: number };
  totalIncome: { bs: number; zelle: number; divisas: number };
  totalExpense: { bs: number; zelle: number; divisas: number };
  closingBalance: { bs: number; zelle: number; divisas: number };
  lines: FinanceLine[];
  warnings: string[];
}

export function parseVE(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let str = String(val).trim();
  // Remove currency symbols if any
  str = str.replace(/[Bs$US]/gi, '').trim();
  // If format is 1.234.567,89 -> remove dots, replace comma with dot
  if (str.includes(',') && str.includes('.')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function autoAssignCategory(concept: string): string {
  const upper = concept.toUpperCase();
  if (/N[ÓO]MINA|SUELDO|SALARIO|VIGILANCIA|PERSONAL|HONORARIOS/i.test(upper)) return 'Nomina';
  if (/SERVICIO|LUZ|AGUA|GAS|INTERNET|ELECTRICIDAD|CORPOELEC|HIDROCAPITAL/i.test(upper)) return 'Servicios';
  if (/MANTENIMIENTO|REPARACI[ÓO]N|PLOMER[ÍI]A|PINTURA|JARDINER[ÍI]A|LIMPIEZA/i.test(upper)) return 'Mantenimiento';
  if (/COMISI[ÓO]N|BANCO|BANCARIAS|GASTOS BANCARIOS/i.test(upper)) return 'Comisiones';
  if (/CAJA CHICA|MENUDOS/i.test(upper)) return 'Caja Chica';
  if (/COMPRA|INSUMOS|MATERIALES/i.test(upper)) return 'Compras';
  if (/SALDO ANTERIOR/i.test(upper)) return 'Saldo';
  if (/TOTAL|SALDO TOTAL/i.test(upper)) return 'Totales';
  return 'Otros';
}

export function parseFinanceExcel(arrayBuffer: ArrayBuffer): FinanceReportData {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  let headerRowIndex = -1;
  let dateColIdx = -1;
  let conceptColIdx = -1;
  let transBsColIdx = -1;
  let zelleColIdx = -1;
  let divisasColIdx = -1;

  // Find header row with "FECHA" and "CONCEPTO"
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    for (let j = 0; j < row.length; j++) {
      const cellStr = String(row[j] || '').trim().toUpperCase();
      if (cellStr.includes('FECHA')) dateColIdx = j;
      if (cellStr.includes('CONCEPTO')) conceptColIdx = j;
      if (/TRANSFERENCIA|BS|BOLIVARES/i.test(cellStr)) transBsColIdx = j;
      if (/ZELLE/i.test(cellStr)) zelleColIdx = j;
      if (/DIVISAS|USD|\$/i.test(cellStr) && j !== zelleColIdx) divisasColIdx = j;
    }
    if (dateColIdx !== -1 && conceptColIdx !== -1) {
      headerRowIndex = i;
      break;
    }
  }

  const warnings: string[] = [];

  // V2 validation: mandatory headers
  if (headerRowIndex === -1 || dateColIdx === -1 || conceptColIdx === -1) {
    warnings.push('V2: No se encontraron las cabeceras obligatorias (FECHA, CONCEPTO) en el archivo Excel.');
  }

  // Fallback default column indices if not found precisely
  if (dateColIdx === -1) dateColIdx = 0;
  if (conceptColIdx === -1) conceptColIdx = 1;
  if (transBsColIdx === -1) transBsColIdx = 2;
  if (zelleColIdx === -1) zelleColIdx = 3;
  if (divisasColIdx === -1) divisasColIdx = 4;

  const lines: FinanceLine[] = [];
  let openingBalance = { bs: 0, zelle: 0, divisas: 0 };
  let totalIncome = { bs: 0, zelle: 0, divisas: 0 };
  let totalExpense = { bs: 0, zelle: 0, divisas: 0 };
  let closingBalance = { bs: 0, zelle: 0, divisas: 0 };

  const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 1;

  for (let i = startRow; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const dateVal = String(row[dateColIdx] || '').trim();
    const conceptVal = String(row[conceptColIdx] || '').trim();
    if (!conceptVal && !dateVal) continue;

    const bsVal = parseVE(row[transBsColIdx]);
    const zelleVal = parseVE(row[zelleColIdx]);
    const divVal = parseVE(row[divisasColIdx]);

    const upperConcept = conceptVal.toUpperCase();
    let isKeyRow = false;
    let keyRowType: FinanceLine['keyRowType'] = undefined;

    if (/SALDO ANTERIOR/i.test(upperConcept)) {
      isKeyRow = true;
      keyRowType = 'opening';
      openingBalance = { bs: bsVal, zelle: zelleVal, divisas: divVal };
    } else if (/INGRESOS TOTALES|TOTAL INGRESOS|INGRESOS/i.test(upperConcept) && !/NETO/i.test(upperConcept)) {
      isKeyRow = true;
      keyRowType = 'income';
      totalIncome = { bs: bsVal, zelle: zelleVal, divisas: divVal };
    } else if (/EGRESOS|GASTOS|TOTAL EGRESOS|TOTAL GASTOS/i.test(upperConcept)) {
      isKeyRow = true;
      keyRowType = 'expense';
      totalExpense = { bs: bsVal, zelle: zelleVal, divisas: divVal };
    } else if (/TOTALES|TOTAL GENERAL/i.test(upperConcept)) {
      isKeyRow = true;
      keyRowType = 'total';
    } else if (/SALDO TOTAL|SALDO FINAL|TOTAL SALDO/i.test(upperConcept)) {
      isKeyRow = true;
      keyRowType = 'closing';
      closingBalance = { bs: bsVal, zelle: zelleVal, divisas: divVal };
    } else if (/REALIZADO POR/i.test(upperConcept)) {
      isKeyRow = true;
      keyRowType = 'realizado_por';
    }

    const hasPD = detectPersonalData(conceptVal);
    const redConcept = hasPD ? redactPersonalData(conceptVal) : conceptVal;

    lines.push({
      date: dateVal,
      concept: conceptVal,
      category: autoAssignCategory(conceptVal),
      transferenciaBs: bsVal,
      zelleUsd: zelleVal,
      divisasUsd: divVal,
      isKeyRow,
      keyRowType,
      hasPersonalData: hasPD,
      redactedConcept: redConcept
    });
  }

  // If opening balance wasn't explicitly found in a row, take first line or default
  if (openingBalance.bs === 0 && lines.length > 0) {
    const firstOpening = lines.find(l => l.keyRowType === 'opening');
    if (firstOpening) {
      openingBalance = { bs: firstOpening.transferenciaBs, zelle: firstOpening.zelleUsd, divisas: firstOpening.divisasUsd };
    }
  }

  // If total income wasn't found, calculate sum of non-key income rows
  if (totalIncome.bs === 0) {
    const incomeLines = lines.filter(l => !l.isKeyRow && (l.transferenciaBs > 0 || l.zelleUsd > 0 || l.divisasUsd > 0));
    totalIncome = {
      bs: incomeLines.reduce((acc, l) => acc + l.transferenciaBs, 0),
      zelle: incomeLines.reduce((acc, l) => acc + l.zelleUsd, 0),
      divisas: incomeLines.reduce((acc, l) => acc + l.divisasUsd, 0)
    };
  }

  // If closing balance wasn't found, calculate: Opening + Income - Expense
  if (closingBalance.bs === 0) {
    closingBalance = {
      bs: Number((openingBalance.bs + totalIncome.bs - totalExpense.bs).toFixed(2)),
      zelle: Number((openingBalance.zelle + totalIncome.zelle - totalExpense.zelle).toFixed(2)),
      divisas: Number((openingBalance.divisas + totalIncome.divisas - totalExpense.divisas).toFixed(2))
    };
  }

  // V1 Validation: Opening + Income - Expense = Closing check
  const expectedBs = Number((openingBalance.bs + totalIncome.bs - totalExpense.bs).toFixed(2));
  const diffBs = Math.abs(expectedBs - closingBalance.bs);
  if (diffBs > 1.0) {
    warnings.push(`V1 Advertencia: Descuadre en Bolívares. Apertura (${openingBalance.bs}) + Ingresos (${totalIncome.bs}) - Egresos (${totalExpense.bs}) = ${expectedBs}, pero el cierre indica ${closingBalance.bs}.`);
  }

  const expectedZelle = Number((openingBalance.zelle + totalIncome.zelle - totalExpense.zelle).toFixed(2));
  const diffZelle = Math.abs(expectedZelle - closingBalance.zelle);
  if (diffZelle > 1.0) {
    warnings.push(`V1 Advertencia: Descuadre en Zelle. Apertura (${openingBalance.zelle}) + Ingresos (${totalIncome.zelle}) - Egresos (${totalExpense.zelle}) = ${expectedZelle}, pero el cierre indica ${closingBalance.zelle}.`);
  }

  const expectedDivisas = Number((openingBalance.divisas + totalIncome.divisas - totalExpense.divisas).toFixed(2));
  const diffDiv = Math.abs(expectedDivisas - closingBalance.divisas);
  if (diffDiv > 1.0) {
    warnings.push(`V1 Advertencia: Descuadre en Divisas. Apertura (${openingBalance.divisas}) + Ingresos (${totalIncome.divisas}) - Egresos (${totalExpense.divisas}) = ${expectedDivisas}, pero el cierre indica ${closingBalance.divisas}.`);
  }

  return {
    mes: 'Septiembre 2026',
    openingBalance,
    totalIncome,
    totalExpense,
    closingBalance,
    lines,
    warnings
  };
}
