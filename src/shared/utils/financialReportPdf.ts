// Creado por Jesús Pirela.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialReportRecord, FinancialReportLineRecord } from '../api/financialReports';
import { formatBs, formatUSD } from './currency';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export async function generateAndExportFinancialReportPdf(
  report: FinancialReportRecord,
  lines: FinancialReportLineRecord[]
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 85, 81);
  doc.text('CAMINOS APP - REPORTE FINANCIERO OFICIAL', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Conjunto / Cluster: ${report.cluster}`, pageWidth / 2, 25, { align: 'center' });
  doc.text(`Período: ${report.mes}`, pageWidth / 2, 31, { align: 'center' });

  // Summary Table (Bs / Zelle / Divisas separated)
  const summaryData = [
    ['Saldo Anterior', formatBs(report.opening_bs), `$${formatUSD(report.opening_zelle)}`, `$${formatUSD(report.opening_divisas)}`],
    ['Total Ingresos', formatBs(report.total_income_bs), `$${formatUSD(report.total_income_zelle)}`, `$${formatUSD(report.total_income_divisas)}`],
    ['Total Egresos', formatBs(report.total_expense_bs), `$${formatUSD(report.total_expense_zelle)}`, `$${formatUSD(report.total_expense_divisas)}`],
    ['Saldo Total (Cierre)', formatBs(report.closing_bs), `$${formatUSD(report.closing_zelle)}`, `$${formatUSD(report.closing_divisas)}`]
  ];

  autoTable(doc, {
    startY: 38,
    head: [['Concepto / Cifra', 'Bolívares (Bs.)', 'Zelle (US$)', 'Divisas (US$)']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [15, 85, 81], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 }
  });

  // Lines Table
  const linesBody = lines.map(l => [
    l.date,
    l.redacted_concept || l.concept,
    l.category,
    l.transferencia_bs > 0 ? formatBs(l.transferencia_bs) : '-',
    l.zelle_usd > 0 ? `$${formatUSD(l.zelle_usd)}` : '-',
    l.divisas_usd > 0 ? `$${formatUSD(l.divisas_usd)}` : '-'
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Fecha', 'Concepto', 'Categoría', 'Bs. (Transf.)', 'Zelle ($)', 'Divisas ($)']],
    body: linesBody,
    theme: 'striped',
    headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 65 },
      2: { cellWidth: 28 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 }
    }
  });

  // Footer / Audit stamp
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Documento auditado y publicado digitalmente a través de CaminosApp el ${new Date().toLocaleDateString()}.`, pageWidth / 2, finalY, { align: 'center' });

  const fileName = `Reporte_Financiero_${report.mes.replace(/\s+/g, '_')}.pdf`;

  if (Capacitor.isNativePlatform()) {
    const pdfOutput = doc.output('datauristring');
    const base64Data = pdfOutput.split(',')[1];
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache
    });
    await Share.share({
      title: `Reporte Financiero ${report.mes}`,
      text: `Reporte financiero oficial de ${report.cluster} - ${report.mes}`,
      url: savedFile.uri,
      dialogTitle: 'Compartir Reporte Financiero'
    });
  } else {
    doc.save(fileName);
  }
}
