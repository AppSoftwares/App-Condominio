// Creado por Jesús Pirela.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../app/store/useAuthStore';
import { financialReportsApi, FinancialReportRecord } from '../../../shared/api/financialReports';
import { formatBs, formatUSD } from '../../../shared/utils/currency';
import { MdAccountBalance, MdChevronRight, MdTrendingUp } from 'react-icons/md';

export const FinancialSummaryCard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [latestReport, setLatestReport] = useState<FinancialReportRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const reports = await financialReportsApi.listPublishedReports(user?.residential_cluster);
        if (reports && reports.length > 0) {
          setLatestReport(reports[0]);
        }
      } catch (err) {
        console.error('Error loading latest financial summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [user?.residential_cluster]);

  if (loading) return null;
  if (!latestReport) return null;

  return (
    <div
      onClick={() => navigate('/requests/finanzas')}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '20px',
        marginBottom: '25px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        transition: 'transform 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--icon-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
            <MdAccountBalance size={22} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--primary-color)' }}>Finanzas de la Comunidad</h4>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>Reporte oficial • {latestReport.mes}</p>
          </div>
        </div>
        <MdChevronRight size={24} style={{ color: 'var(--text-sub)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', backgroundColor: 'var(--icon-bg)', padding: '12px', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-sub)', display: 'block' }}>BOLÍVARES</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-color)' }}>{formatBs(latestReport.closing_bs)}</span>
        </div>
        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-sub)', display: 'block' }}>ZELLE ($)</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981' }}>${formatUSD(latestReport.closing_zelle)}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-sub)', display: 'block' }}>DIVISAS ($)</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#3b82f6' }}>${formatUSD(latestReport.closing_divisas)}</span>
        </div>
      </div>
    </div>
  );
};
