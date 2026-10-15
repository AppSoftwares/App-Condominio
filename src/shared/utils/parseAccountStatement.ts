import * as XLSX from 'xlsx'

export interface StatementLine {
  text: string
  amount: number
  isCheckpoint: boolean
}

export interface ParsedStatement {
  sourceType: 'xlsx' | 'pdf'
  condoName?: string
  rif?: string
  ownerName?: string
  houseNumber?: string
  asOfDate?: string
  issuedDate?: string
  finalBalance?: number
  finalBalanceDate?: string
  lines: StatementLine[]
  checks: {
    sumMatchesFinal: boolean
    checkpointsOk: number
    checkpointsBad: number
  }
  warnings: string[]
  fileName: string
  fileSha256?: string
}

export function parseVE(value: any): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value
  if (!value) return 0
  let str = String(value).trim()
  // Remove currency symbols, $ etc
  str = str.replace(/[$€Bs.]/g, '').trim()
  // Handle Venezuelan / European format: "1.384.799,40" or "-10,00"
  if (str.includes(',') && str.includes('.')) {
    // Determine which comes last to be sure
    const lastComma = str.lastIndexOf(',')
    const lastDot = str.lastIndexOf('.')
    if (lastComma > lastDot) {
      // 1.384.799,40 -> remove dots, replace comma with dot
      str = str.replace(/\./g, '').replace(',', '.')
    } else {
      // 1,384.799.40 -> remove commas
      str = str.replace(/,/g, '')
    }
  } else if (str.includes(',')) {
    str = str.replace(',', '.')
  }
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

export function normalizeHouse(s: string): string {
  if (!s) return ''
  let clean = s.toUpperCase().replace(/CASA/g, '').trim()
  clean = clean.replace(/[\/\s]+/g, '-')
  // Unify separators to '-'
  clean = clean.replace(/[^A-Z0-9-]/g, '')
  return clean
}

export function parseDateES(s: string): string | undefined {
  if (!s) return undefined
  // Matches dd/mm/yyyy, dd-mm-yyyy, dd/-mm-yyyy
  const match = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
  if (!match) return undefined
  const day = match[1].padStart(2, '0')
  const month = match[2].padStart(2, '0')
  let year = match[3]
  if (year.length === 2) year = '20' + year
  return `${year}-${month}-${day}`
}

async function computeSha256(file: File): Promise<string | undefined> {
  try {
    if (!window.crypto?.subtle) return undefined
    const buffer = await file.arrayBuffer()
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return undefined
  }
}

export async function parseStatementExcel(file: File | ArrayBuffer, fileName: string): Promise<ParsedStatement> {
  const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

  let condoName: string | undefined
  let rif: string | undefined
  let ownerName: string | undefined
  let houseNumber: string | undefined
  let asOfDate: string | undefined
  let issuedDate: string | undefined

  const lines: StatementLine[] = []
  const warnings: string[] = []

  for (const row of rows) {
    const colA = String(row[0] || '').trim()
    const colB = String(row[1] || '').trim()

    if (/CONDOMINIO/i.test(colA)) condoName = colA
    if (/RIF/i.test(colA)) rif = colA

    const asOfMatch = colA.match(/ESTADO DE CUENTA\s+(?:HASTA|AL)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
    if (asOfMatch) {
      asOfDate = parseDateES(asOfMatch[1])
    }

    const ownerMatch = colA.match(/PROPIETARIO\s*:\s*([^C]+?)(?:\s+CASA\s*:\s*(.*))?$/i)
    if (ownerMatch) {
      ownerName = ownerMatch[1].trim()
      if (ownerMatch[2]) houseNumber = normalizeHouse(ownerMatch[2])
    } else {
      const houseMatch = colA.match(/CASA\s*:\s*([^\s]+)/i)
      if (houseMatch && !houseNumber) houseNumber = normalizeHouse(houseMatch[1])
    }

    // Process multiline cell A and amounts in cell B
    if (colA) {
      const textLines = colA.split('\n').map(l => l.trim()).filter(Boolean)
      const bLines = colB ? colB.split('\n').map(l => l.trim()).filter(Boolean) : []

      if (bLines.length > 0 && textLines.length >= bLines.length) {
        // Pair last k lines of text with bLines
        const startIdx = textLines.length - bLines.length
        for (let i = 0; i < startIdx; i++) {
          const t = textLines[i]
          if (/SALD\w*\s+\S{0,3}NDIENTE/i.test(t)) {
            const dateMatch = t.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/)
            lines.push({ text: t, amount: 0, isCheckpoint: true })
          }
        }
        for (let i = 0; i < bLines.length; i++) {
          const t = textLines[startIdx + i]
          const amt = parseVE(bLines[i])
          const isCheck = /SALD\w*\s+\S{0,3}NDIENTE/i.test(t)
          lines.push({ text: t, amount: amt, isCheckpoint: isCheck })
        }
      } else {
        // Fallback single line or no B
        const amt = parseVE(colB)
        const isCheck = /SALD\w*\s+\S{0,3}NDIENTE/i.test(colA)
        lines.push({ text: colA, amount: amt, isCheckpoint: isCheck })
      }
    }
  }

  // Find final balance from last checkpoint
  let finalBalance: number | undefined
  let finalBalanceDate: string | undefined
  let runningSum = 0
  let checkpointsOk = 0
  let checkpointsBad = 0
  let initialBalance = 0
  let first = true

  for (const l of lines) {
    if (l.isCheckpoint) {
      if (first) {
        initialBalance = l.amount
        runningSum = initialBalance
        first = false
      } else {
        // Verify runningSum matches checkpoint
        const diff = Math.abs(runningSum - l.amount)
        if (diff < 0.05) {
          checkpointsOk++
        } else {
          checkpointsBad++
          warnings.push(`Descuadre en saldo intermedio: calculado ${runningSum.toFixed(2)} vs reportado ${l.amount.toFixed(2)}`)
        }
      }
      finalBalance = l.amount
      const dm = l.text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/)
      if (dm) finalBalanceDate = parseDateES(dm[1])
    } else {
      runningSum += l.amount
    }
  }

  const sumMatchesFinal = checkpointsBad === 0

  return {
    sourceType: 'xlsx',
    condoName,
    rif,
    ownerName,
    houseNumber,
    asOfDate: asOfDate || finalBalanceDate,
    issuedDate,
    finalBalance,
    finalBalanceDate: finalBalanceDate || asOfDate,
    lines,
    checks: { sumMatchesFinal, checkpointsOk, checkpointsBad },
    warnings,
    fileName,
    fileSha256: file instanceof File ? await computeSha256(file) : undefined
  }
}

export async function parseStatementPdf(file: File): Promise<ParsedStatement> {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf')
    const workerUrl = (await import('pdfjs-dist/legacy/build/pdf.worker.min.js?url')).default
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdfDoc = await loadingTask.promise

    let fullText = ''
    const lines: StatementLine[] = []
    const warnings: string[] = []

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i)
      const textContent = await page.getTextContent()

      // Reconstruct text lines by grouping Y coordinate
      const items = textContent.items as any[]
      items.sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5]
        if (Math.abs(yDiff) > 3) return yDiff
        return a.transform[4] - b.transform[4]
      })

      let lastY = -1
      let lineStr = ''
      for (const item of items) {
        const y = item.transform[5]
        if (lastY === -1 || Math.abs(y - lastY) > 3) {
          if (lineStr) fullText += lineStr + '\n'
          lineStr = item.str
          lastY = y
        } else {
          lineStr += ' ' + item.str
        }
      }
      if (lineStr) fullText += lineStr + '\n'
    }

    const rawLines = fullText.split('\n').map(l => l.trim()).filter(Boolean)
    let condoName: string | undefined
    let rif: string | undefined
    let ownerName: string | undefined
    let houseNumber: string | undefined
    let asOfDate: string | undefined

    for (const l of rawLines) {
      if (/CONDOMINIO/i.test(l)) condoName = l
      if (/RIF/i.test(l)) rif = l

      const asOfMatch = l.match(/ESTADO DE CUENTA\s+(?:HASTA|AL)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)
      if (asOfMatch) asOfDate = parseDateES(asOfMatch[1])

      const ownerMatch = l.match(/PROPIETARIO\s*:\s*([^C]+?)(?:\s+CASA\s*:\s*(.*))?$/i)
      if (ownerMatch) {
        ownerName = ownerMatch[1].trim()
        if (ownerMatch[2]) houseNumber = normalizeHouse(ownerMatch[2])
      }

      // Check if line has amount ending in $ or number
      const amtMatch = l.match(/(-?[\d.]+,\d{2})\s*\$?$/)
      if (amtMatch) {
        const amt = parseVE(amtMatch[1])
        const isCheck = /SALD\w*\s+\S{0,3}NDIENTE/i.test(l)
        lines.push({ text: l, amount: amt, isCheckpoint: isCheck })
      } else {
        const isCheck = /SALD\w*\s+\S{0,3}NDIENTE/i.test(l)
        if (isCheck || /\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/.test(l)) {
          lines.push({ text: l, amount: 0, isCheckpoint: isCheck })
        }
      }
    }

    let finalBalance: number | undefined
    let finalBalanceDate: string | undefined
    let runningSum = 0
    let checkpointsOk = 0
    let checkpointsBad = 0
    let first = true

    for (const l of lines) {
      if (l.isCheckpoint && l.amount !== 0) {
        if (first) {
          runningSum = l.amount
          first = false
        } else {
          const diff = Math.abs(runningSum - l.amount)
          if (diff < 0.05) checkpointsOk++
          else {
            checkpointsBad++
            warnings.push(`Descuadre en saldo intermedio PDF`)
          }
        }
        finalBalance = l.amount
        const dm = l.text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/)
        if (dm) finalBalanceDate = parseDateES(dm[1])
      } else if (!l.isCheckpoint) {
        runningSum += l.amount
      }
    }

    return {
      sourceType: 'pdf',
      condoName,
      rif,
      ownerName,
      houseNumber,
      asOfDate: asOfDate || finalBalanceDate,
      finalBalance,
      finalBalanceDate: finalBalanceDate || asOfDate,
      lines,
      checks: { sumMatchesFinal: checkpointsBad === 0, checkpointsOk, checkpointsBad },
      warnings,
      fileName: file.name,
      fileSha256: await computeSha256(file)
    }
  } catch (err: any) {
    throw new Error('PDF_NO_LEGIBLE: ' + (err?.message || 'Error procesando PDF'))
  }
}
