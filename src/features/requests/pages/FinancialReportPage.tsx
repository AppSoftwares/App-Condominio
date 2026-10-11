// Creado por Jesús Pirela.
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { financialReportsApi, FinancialReportRecord, FinancialReportLineRecord } from '../../../shared/api/financialReports';
import { formatBs, formatUSD } from '../../../shared/utils/currency';
import { generateAndExportFinancialReportPdf } from '../../../shared/utils/financialReportPdf';
import { Browser } from '@capacitor/browser';
import { MdArrowBack, MdDownload, MdPictureAsPdf, MdSearch, MdFilterList, MdVisibility } from 'react-icons/md';

export const FinancialReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [reports, setReports] = useState<FinancialReportRecord[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [currentReport, setCurrentReport] = useState<FinancialReportRecord | null>(null);
  const [lines, setLines] = useState<FinancialReportLineRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchConcept, setSearchConcept] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [hideZeroMovement, setHideZeroMovement] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const list = await financialReportsApi.listPublishedReports(user?.residential_cluster);
        setReports(list);
        if (list.length > 0) {
          setSelectedReportId(list[0].id);
        }
      } catch (err) {
        console.error('Error loading reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [user?.residential_cluster]);

  useEffect(() => {
    if (!selectedReportId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const { report, lines: fetchedLines } = await financialReportsApi.getReportWithLines(selectedReportId);
        setCurrentReport(report);
        setLines(fetchedLines);
      } catch (err) {
        console.error('Error loading report detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [selectedReportId]);

  const filteredLines = useMemo(() => {
    return lines.filter(l => {
      const matchSearch = (l.redacted_concept || l.concept).toLowerCase().includes(searchConcept.toLowerCase());
      const matchCategory = selectedCategory === 'ALL' || l.category === selectedCategory;
      const matchZero = hideZeroMovement ? (l.transferencia_bs !== 0 || l.zelle_usd !== 0 || l.divisas_usd !== 0) : true;
      return matchSearch && matchCategory && matchZero;
    });
  }, [lines, searchConcept, selectedCategory, hideZeroMovement]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, { bs: number; zelle: number; divisas: number }> = {};
    for (const l of lines) {
      if (l.is_key_row) continue;
      const cat = l.category || 'Otros';
      if (!totals[cat]) totals[cat] = { bs: 0, zelle: 0, divisas: 0 };
      totals[cat].bs += l.transferencia_bs;
      totals[cat].zelle += l.zelle_usd;
      totals[cat].divisas += l.divisas_usd;
    }
    return totals;
  }, [lines]);

  const handleOpenOriginalPdf = async () => {
    if (!currentReport?.pdf_path) return;
    try {
      const url = await financialReportsApi.getOriginalPdfUrl(currentReport.pdf_path);
      if (url) {
        await Browser.open({ url });
      } else {
        alert('No se pudo obtener el enlace del PDF original.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadPdf = async () => {
    if (!currentReport) return;
    try {
      await generateAndExportFinancialReportPdf(currentReport, lines);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error al generar el documento PDF.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', minHeight: '100vh', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
          <button
            onClick={() => navigate('/requests')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', display: 'flex', alignItems: 'center' }}
            aria-label="Volver"
          >
            <MdArrowBack size={24} />
          </button>
          <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '28px', color: 'var(--primary-color)', margin: 0 }}>
            Reporte Financiero Oficial
          </h2>
        </div>

        {reports.length > 1 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Seleccionar Período</label>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', fontSize: '14px' }}
            >
              {reports.map(r => (
                <option key={r.id} value={r.id}>{r.mes} ({r.cluster})</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px' }}>Cargando reporte financiero...</p>
        ) : currentReport ? (
          <div>
            {/* Summary Cards with Currency-separated columns - NEVER MIXED */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px', marginBottom: '25px' }}>
              <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)' }}>SALDO ANTERIOR</p>
                <p style={{ margin: '3px 0', fontSize: '14px', fontWeight: 700 }}>Bs: {formatBs(currentReport.opening_bs)}</p>
                <p style={{ margin: '3px 0', fontSize: '14px', fontWeight: 700, color: '#10b981' }}>Zelle: ${formatUSD(currentReport.opening_zelle)}</p>
                <p style={{ margin: '3px 0', fontSize: '14px', fontWeight: 700, color: '#3b82f6' }}>Divisas: ${formatUSD(currentReport.opening_divisas)}</p>
              </div>

              <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)' }}>TOTAL INGRESOS</p>
                <p style={{ margin: '3px 0', fontSize: '14px', fontWeight: 700, color: 'green' }}>Bs: {formatBs(currentReport.total_income_bs)}</p>
                <p style={{ margin: '3px 0', fontSize: '14px', fontWeight: 700, color: 'green' }}>Zelle: ${formatUSD(currentReport.total_income_zelle)}</p>
                <p style={{ margin: '3px 0', fontSize: '14px', fontWeight: 700, color: 'green' }}>Divisas: ${formatUSD(currentReport.total_income_divisas)}</p>
              </div>

              <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)' }}>TOTAL EGRESOS</p>
                <p style={{ margin: '3px 0', fontSize: '14px', fontWeight: 700, color: '#ba1a1a' }}>Bs: {formatBs(currentReport.total_expense_bs)}</p>
                <p style={{ margin: '3px 0', fontSize: '14px', fontWeight: 700, color: '#ba1a1a' }}>Zelle: ${formatUSD(currentReport.total_expense_zelle)}</p>
                <p style={{ margin: '3px 0', fontSize: '14px', fontWeight: 700, color: '#ba1a1a' }}>Divisas: ${formatUSD(currentReport.total_expense_divisas)}</p>
              </div>

              <div style={{ backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 700, opacity: 0.9 }}>SALDO TOTAL (CIERRE)</p>
                <p style={{ margin: '3px 0', fontSize: '15px', fontWeight: 800 }}>Bs: {formatBs(currentReport.closing_bs)}</p>
                <p style={{ margin: '3px 0', fontSize: '15px', fontWeight: 800 }}>Zelle: ${formatUSD(currentReport.closing_zelle)}</p>
                <p style={{ margin: '3px 0', fontSize: '15px', fontWeight: 800 }}>Divisas: ${formatUSD(currentReport.closing_divisas)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
              <button
                onClick={handleDownloadPdf}
                style={{ flex: 1, padding: '14px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <MdDownload size={20} /> Descargar / Compartir PDF
              </button>
              {currentReport.pdf_path && (
                <button
                  onClick={handleOpenOriginalPdf}
                  style={{ padding: '14px', backgroundColor: 'var(--icon-bg)', color: 'var(--primary-color)', border: '1px solid var(--border-color)', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <MdPictureAsPdf size={20} /> Ver PDF Original
                </button>
              )}
            </div>

            {/* Category Breakdown Breakdown Bars */}
            <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 15px' }}>Desglose por Categorías</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(categoryTotals).map(([cat, vals]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{cat}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontWeight: 600 }}>Bs: {formatBs(vals.bs)}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>Zelle: ${formatUSD(vals.zelle)} | Divisas: ${formatUSD(vals.divisas)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', marginBottom: '25px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <MdSearch size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-sub)' }} />
                <input
                  type="text"
                  placeholder="Buscar por concepto..."
                  value={searchConcept}
                  onChange={(e) => setSearchConcept(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
                >
                  <option value="ALL">Todas las Categorías</option>
                  <option value="Nomina">Nómina</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Comisiones">Comisiones</option>
                  <option value="Caja Chica">Caja Chica</option>
                  <option value="Compras">Compras</option>
                  <option value="Honorarios">Honorarios</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hideZeroMovement}
                  onChange={(e) => setHideZeroMovement(e.target.checked)}
                />
                Ocultar saldo cero
              </label>
            </div>

            {/* Detailed Table */}
            <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', overflowX: 'auto', marginBottom: '40px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--icon-bg)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px' }}>Fecha</th>
                    <th style={{ padding: '12px' }}>Concepto</th>
                    <th style={{ padding: '12px' }}>Categoría</th>
                    <th style={{ padding: '12px' }}>Bs (Transf.)</th>
                    <th style={{ padding: '12px' }}>Zelle ($)</th>
                    <th style={{ padding: '12px' }}>Divisas ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLines.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-sub)' }}>No se encontraron movimientos con los filtros seleccionados.</td>
                    </tr>
                  ) : filteredLines.map((l, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: l.is_key_row ? 'var(--icon-bg)' : 'transparent' }}>
                      <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{l.date}</td>
                      <td style={{ padding: '12px', fontWeight: l.is_key_row ? 700 : 400 }}>{l.redacted_concept || l.concept}</td>
                      <td style={{ padding: '12px' }}>{l.category}</td>
                      <td style={{ padding: '12px', fontWeight: l.is_key_row ? 700 : 400 }}>{l.transferencia_bs !== 0 ? formatBs(l.transferencia_bs) : '-'}</td>
                      <td style={{ padding: '12px', fontWeight: l.is_key_row ? 700 : 400 }}>{l.zelle_usd !== 0 ? `$${formatUSD(l.zelle_usd)}` : '-'}</td>
                      <td style={{ padding: '12px', fontWeight: l.is_key_row ? 700 : 400 }}>{l.divisas_usd !== 0 ? `$${formatUSD(l.divisas_usd)}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-sub)' }}>No hay reportes financieros publicados disponibles.</p>
        )}
      </div>
    </div>
  );
};
