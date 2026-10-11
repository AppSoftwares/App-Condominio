// Creado por Jesús Pirela.
import React, { useState } from 'react';
import { parseFinanceExcel, FinanceReportData, FinanceLine } from '../../../shared/utils/parseFinanceExcel';
import { financialReportsApi } from '../../../shared/api/financialReports';
import { MdCloudUpload, MdCheckCircle, MdWarning, MdEdit, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { formatBs, formatUSD } from '../../../shared/utils/currency';

interface FinancialReportUploaderProps {
  cluster: string;
}

export const FinancialReportUploader: React.FC<FinancialReportUploaderProps> = ({ cluster }) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [reportData, setReportData] = useState<FinanceReportData | null>(null);
  const [editableLines, setEditableLines] = useState<FinanceLine[]>([]);
  const [mes, setMes] = useState('Septiembre 2026');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseFinanceExcel(buffer);
      parsed.cluster = cluster;
      setReportData(parsed);
      setEditableLines(parsed.lines);
    } catch (err: any) {
      setErrorMsg('Error al procesar el archivo Excel: ' + (err.message || 'Formato inválido'));
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPdfFile(file);
  };

  const handleLineChange = (index: number, field: keyof FinanceLine, value: any) => {
    const updated = [...editableLines];
    updated[index] = { ...updated[index], [field]: value };
    setEditableLines(updated);
  };

  const handlePublish = async () => {
    if (!reportData) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const finalReportData: FinanceReportData = {
        ...reportData,
        mes,
        lines: editableLines
      };

      await financialReportsApi.publishFinancialReport(cluster, mes, finalReportData, editableLines, pdfFile || undefined, excelFile || undefined);
      setSuccessMsg('¡Reporte financiero publicado con éxito para ' + cluster + '!');
    } catch (err: any) {
      setErrorMsg('Error al publicar reporte: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '25px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
      <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: '24px', color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
        Gestión de Reportes Financieros ({cluster})
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '20px' }}>
        Suba el archivo Excel oficial (.xlsx) y opcionalmente el PDF respaldatorio. El sistema auditará automáticamente las cifras, detectará datos personales para redacción y validará la consistencia matemática V1-V4.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Mes del Reporte</label>
          <input
            type="text"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', boxSizing: 'border-box' }}
            placeholder="Ej. Septiembre 2026"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Archivo Excel (.xlsx)</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            aria-label="Archivo Excel"
            style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>PDF Original de Respaldo (Opcional)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            aria-label="PDF Original"
            style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
          />
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--primary-color)' }}>Procesando archivo...</p>}

      {errorMsg && (
        <div role="alert" style={{ backgroundColor: 'rgba(186,26,26,0.1)', border: '1px solid #ba1a1a', color: '#ba1a1a', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MdWarning size={22} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div role="alert" style={{ backgroundColor: 'rgba(0,128,0,0.1)', border: '1px solid green', color: 'green', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MdCheckCircle size={22} />
          <span>{successMsg}</span>
        </div>
      )}

      {reportData && (
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '20px 0 15px' }}>Resumen Estructurado Auditado</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div style={{ padding: '15px', borderRadius: '16px', backgroundColor: 'var(--icon-bg)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)' }}>SALDO ANTERIOR</p>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Bs: {formatBs(reportData.openingBalance.bs)}</p>
              <p style={{ margin: '3px 0 0', fontSize: '13px', fontWeight: 600 }}>Zelle: ${formatUSD(reportData.openingBalance.zelle)}</p>
              <p style={{ margin: '3px 0 0', fontSize: '13px', fontWeight: 600 }}>Divisas: ${formatUSD(reportData.openingBalance.divisas)}</p>
            </div>
            <div style={{ padding: '15px', borderRadius: '16px', backgroundColor: 'var(--icon-bg)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)' }}>TOTAL INGRESOS</p>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'green' }}>Bs: {formatBs(reportData.totalIncome.bs)}</p>
              <p style={{ margin: '3px 0 0', fontSize: '13px', fontWeight: 600, color: 'green' }}>Zelle: ${formatUSD(reportData.totalIncome.zelle)}</p>
              <p style={{ margin: '3px 0 0', fontSize: '13px', fontWeight: 600, color: 'green' }}>Divisas: ${formatUSD(reportData.totalIncome.divisas)}</p>
            </div>
            <div style={{ padding: '15px', borderRadius: '16px', backgroundColor: 'var(--icon-bg)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)' }}>TOTAL EGRESOS</p>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#ba1a1a' }}>Bs: {formatBs(reportData.totalExpense.bs)}</p>
              <p style={{ margin: '3px 0 0', fontSize: '13px', fontWeight: 600, color: '#ba1a1a' }}>Zelle: ${formatUSD(reportData.totalExpense.zelle)}</p>
              <p style={{ margin: '3px 0 0', fontSize: '13px', fontWeight: 600, color: '#ba1a1a' }}>Divisas: ${formatUSD(reportData.totalExpense.divisas)}</p>
            </div>
            <div style={{ padding: '15px', borderRadius: '16px', backgroundColor: 'var(--icon-bg)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 5px', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)' }}>SALDO TOTAL</p>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)' }}>Bs: {formatBs(reportData.closingBalance.bs)}</p>
              <p style={{ margin: '3px 0 0', fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)' }}>Zelle: ${formatUSD(reportData.closingBalance.zelle)}</p>
              <p style={{ margin: '3px 0 0', fontSize: '13px', fontWeight: 600, color: 'var(--primary-color)' }}>Divisas: ${formatUSD(reportData.closingBalance.divisas)}</p>
            </div>
          </div>

          {reportData.warnings.length > 0 && (
            <div role="alert" style={{ backgroundColor: 'rgba(255,165,0,0.1)', border: '1px solid orange', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
              <h5 style={{ margin: '0 0 5px', color: '#b26a00', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MdWarning /> Advertencias de Validación V1-V4
              </h5>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text-color)' }}>
                {reportData.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '20px 0 15px' }}>Líneas del Reporte y Redacción de Datos Personales</h4>
          <div style={{ overflowX: 'auto', maxHeight: '400px', marginBottom: '20px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--icon-bg)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '10px' }}>Fecha</th>
                  <th style={{ padding: '10px' }}>Concepto Original / Redactado</th>
                  <th style={{ padding: '10px' }}>Categoría</th>
                  <th style={{ padding: '10px' }}>Bs (Transf.)</th>
                  <th style={{ padding: '10px' }}>Zelle ($)</th>
                  <th style={{ padding: '10px' }}>Divisas ($)</th>
                  <th style={{ padding: '10px' }}>Privacidad</th>
                </tr>
              </thead>
              <tbody>
                {editableLines.map((line, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: line.hasPersonalData ? 'rgba(255,165,0,0.05)' : 'transparent' }}>
                    <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{line.date}</td>
                    <td style={{ padding: '10px' }}>
                      <input
                        type="text"
                        value={line.redactedConcept || line.concept}
                        onChange={(e) => handleLineChange(idx, 'redactedConcept', e.target.value)}
                        style={{ width: '100%', padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '12px' }}
                      />
                      {line.hasPersonalData && (
                        <span style={{ fontSize: '10px', color: '#b26a00', fontWeight: 700, display: 'inline-block', marginTop: '3px' }}>
                          ⚠️ Datos personales detectados (redactados automáticamente)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <select
                        value={line.category}
                        onChange={(e) => handleLineChange(idx, 'category', e.target.value)}
                        style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '12px' }}
                      >
                        <option value="Nomina">Nómina</option>
                        <option value="Servicios">Servicios</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Comisiones">Comisiones</option>
                        <option value="Caja Chica">Caja Chica</option>
                        <option value="Compras">Compras</option>
                        <option value="Honorarios">Honorarios</option>
                        <option value="Saldo">Saldo</option>
                        <option value="Totales">Totales</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px' }}>{formatBs(line.transferenciaBs)}</td>
                    <td style={{ padding: '10px' }}>${formatUSD(line.zelleUsd)}</td>
                    <td style={{ padding: '10px' }}>${formatUSD(line.divisasUsd)}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {line.hasPersonalData ? (
                        <span style={{ color: '#b26a00', fontWeight: 700, fontSize: '11px' }}>Protegido</span>
                      ) : (
                        <span style={{ color: 'green', fontSize: '11px' }}>Público</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handlePublish}
            disabled={loading}
            style={{ width: '100%', padding: '16px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <MdCloudUpload size={22} />
            {loading ? 'Publicando...' : 'Publicar Reporte Financiero para Residentes'}
          </button>
        </div>
      )}
    </div>
  );
};
