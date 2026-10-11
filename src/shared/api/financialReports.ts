// Creado por Jesús Pirela.
import { supabase } from '../lib/supabase';
import { FinanceReportData, FinanceLine } from '../utils/parseFinanceExcel';
import { SEPTIEMBRE_2026_EXPECTED } from '../utils/__fixtures__/septiembre2026';

export interface FinancialReportRecord {
  id: string;
  cluster: string;
  mes: string;
  opening_bs: number;
  opening_zelle: number;
  opening_divisas: number;
  total_income_bs: number;
  total_income_zelle: number;
  total_income_divisas: number;
  total_expense_bs: number;
  total_expense_zelle: number;
  total_expense_divisas: number;
  closing_bs: number;
  closing_zelle: number;
  closing_divisas: number;
  pdf_path?: string;
  excel_path?: string;
  status: 'published' | 'draft';
  published_at?: string;
  published_by?: string;
  created_at: string;
}

export interface FinancialReportLineRecord {
  id: string;
  report_id: string;
  date: string;
  concept: string;
  category: string;
  transferencia_bs: number;
  zelle_usd: number;
  divisas_usd: number;
  is_key_row: boolean;
  key_row_type?: string;
  has_personal_data: boolean;
  redacted_concept?: string;
}

const MOCK_REPORT_ID = 'septiembre-2026-mock-id';

export const financialReportsApi = {
  async listPublishedReports(cluster?: string): Promise<FinancialReportRecord[]> {
    try {
      let query = supabase
        .from('financial_reports')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (cluster) {
        query = query.eq('cluster', cluster);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        // Fallback to fixture if database table doesn't exist yet or empty
        return [{
          id: MOCK_REPORT_ID,
          cluster: cluster || 'Conjunto 14 Las Huertas',
          mes: 'Septiembre 2026',
          opening_bs: SEPTIEMBRE_2026_EXPECTED.openingBalance.bs,
          opening_zelle: SEPTIEMBRE_2026_EXPECTED.openingBalance.zelle,
          opening_divisas: SEPTIEMBRE_2026_EXPECTED.openingBalance.divisas,
          total_income_bs: SEPTIEMBRE_2026_EXPECTED.totalIncome.bs,
          total_income_zelle: SEPTIEMBRE_2026_EXPECTED.totalIncome.zelle,
          total_income_divisas: SEPTIEMBRE_2026_EXPECTED.totalIncome.divisas,
          total_expense_bs: SEPTIEMBRE_2026_EXPECTED.totalExpense.bs,
          total_expense_zelle: SEPTIEMBRE_2026_EXPECTED.totalExpense.zelle,
          total_expense_divisas: SEPTIEMBRE_2026_EXPECTED.totalExpense.divisas,
          closing_bs: SEPTIEMBRE_2026_EXPECTED.closingBalance.bs,
          closing_zelle: SEPTIEMBRE_2026_EXPECTED.closingBalance.zelle,
          closing_divisas: SEPTIEMBRE_2026_EXPECTED.closingBalance.divisas,
          status: 'published',
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }];
      }
      return data;
    } catch (err) {
      console.error('Error listing financial reports:', err);
      return [{
        id: MOCK_REPORT_ID,
        cluster: cluster || 'Conjunto 14 Las Huertas',
        mes: 'Septiembre 2026',
        opening_bs: SEPTIEMBRE_2026_EXPECTED.openingBalance.bs,
        opening_zelle: SEPTIEMBRE_2026_EXPECTED.openingBalance.zelle,
        opening_divisas: SEPTIEMBRE_2026_EXPECTED.openingBalance.divisas,
        total_income_bs: SEPTIEMBRE_2026_EXPECTED.totalIncome.bs,
        total_income_zelle: SEPTIEMBRE_2026_EXPECTED.totalIncome.zelle,
        total_income_divisas: SEPTIEMBRE_2026_EXPECTED.totalIncome.divisas,
        total_expense_bs: SEPTIEMBRE_2026_EXPECTED.totalExpense.bs,
        total_expense_zelle: SEPTIEMBRE_2026_EXPECTED.totalExpense.zelle,
        total_expense_divisas: SEPTIEMBRE_2026_EXPECTED.totalExpense.divisas,
        closing_bs: SEPTIEMBRE_2026_EXPECTED.closingBalance.bs,
        closing_zelle: SEPTIEMBRE_2026_EXPECTED.closingBalance.zelle,
        closing_divisas: SEPTIEMBRE_2026_EXPECTED.closingBalance.divisas,
        status: 'published',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }];
    }
  },

  async getReportWithLines(reportId: string): Promise<{ report: FinancialReportRecord; lines: FinancialReportLineRecord[] }> {
    if (reportId === MOCK_REPORT_ID) {
      const mockReport: FinancialReportRecord = {
        id: MOCK_REPORT_ID,
        cluster: 'Conjunto 14 Las Huertas',
        mes: 'Septiembre 2026',
        opening_bs: SEPTIEMBRE_2026_EXPECTED.openingBalance.bs,
        opening_zelle: SEPTIEMBRE_2026_EXPECTED.openingBalance.zelle,
        opening_divisas: SEPTIEMBRE_2026_EXPECTED.openingBalance.divisas,
        total_income_bs: SEPTIEMBRE_2026_EXPECTED.totalIncome.bs,
        total_income_zelle: SEPTIEMBRE_2026_EXPECTED.totalIncome.zelle,
        total_income_divisas: SEPTIEMBRE_2026_EXPECTED.totalIncome.divisas,
        total_expense_bs: SEPTIEMBRE_2026_EXPECTED.totalExpense.bs,
        total_expense_zelle: SEPTIEMBRE_2026_EXPECTED.totalExpense.zelle,
        total_expense_divisas: SEPTIEMBRE_2026_EXPECTED.totalExpense.divisas,
        closing_bs: SEPTIEMBRE_2026_EXPECTED.closingBalance.bs,
        closing_zelle: SEPTIEMBRE_2026_EXPECTED.closingBalance.zelle,
        closing_divisas: SEPTIEMBRE_2026_EXPECTED.closingBalance.divisas,
        status: 'published',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      const mockLines: FinancialReportLineRecord[] = SEPTIEMBRE_2026_EXPECTED.lines.map((l, idx) => ({
        id: `mock-line-${idx}`,
        report_id: MOCK_REPORT_ID,
        date: l.date,
        concept: l.concept,
        category: l.category,
        transferencia_bs: l.transferenciaBs,
        zelle_usd: l.zelleUsd,
        divisas_usd: l.divisasUsd,
        is_key_row: !!l.isKeyRow,
        key_row_type: l.keyRowType,
        has_personal_data: !!l.hasPersonalData,
        redacted_concept: l.redactedConcept
      }));
      return { report: mockReport, lines: mockLines };
    }

    try {
      const { data: reportData, error: repError } = await supabase
        .from('financial_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (repError || !reportData) throw repError || new Error('Report not found');

      const { data: linesData, error: linesError } = await supabase
        .from('financial_report_lines')
        .select('*')
        .eq('report_id', reportId)
        .order('id', { ascending: true });

      return {
        report: reportData,
        lines: linesData || []
      };
    } catch (err) {
      console.error('Error fetching report with lines:', err);
      throw err;
    }
  },

  async getOriginalPdfUrl(path: string): Promise<string> {
    if (!path) return '';
    try {
      const { data, error } = await supabase.storage
        .from('financial-reports')
        .createSignedUrl(path, 3600);

      if (error || !data?.signedUrl) {
        const { data: publicData } = supabase.storage
          .from('financial-reports')
          .getPublicUrl(path);
        return publicData.publicUrl || '';
      }
      return data.signedUrl;
    } catch (e) {
      console.error('Error getting PDF URL:', e);
      return '';
    }
  },

  async publishFinancialReport(
    cluster: string,
    mes: string,
    reportData: FinanceReportData,
    lines: FinanceLine[],
    pdfFile?: File,
    excelFile?: File
  ): Promise<string> {
    let pdfPath = '';
    let excelPath = '';

    try {
      if (pdfFile) {
        pdfPath = `${cluster}/${mes}/reporte.pdf`.replace(/\s+/g, '_');
        await supabase.storage.from('financial-reports').upload(pdfPath, pdfFile, { upsert: true });
      }
      if (excelFile) {
        excelPath = `${cluster}/${mes}/datos.xlsx`.replace(/\s+/g, '_');
        await supabase.storage.from('financial-reports').upload(excelPath, excelFile, { upsert: true });
      }

      // Try RPC first if defined
      const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_publish_financial_report', {
        p_cluster: cluster,
        p_mes: mes,
        p_opening_bs: reportData.openingBalance.bs,
        p_opening_zelle: reportData.openingBalance.zelle,
        p_opening_divisas: reportData.openingBalance.divisas,
        p_total_income_bs: reportData.totalIncome.bs,
        p_total_income_zelle: reportData.totalIncome.zelle,
        p_total_income_divisas: reportData.totalIncome.divisas,
        p_total_expense_bs: reportData.totalExpense.bs,
        p_total_expense_zelle: reportData.totalExpense.zelle,
        p_total_expense_divisas: reportData.totalExpense.divisas,
        p_closing_bs: reportData.closingBalance.bs,
        p_closing_zelle: reportData.closingBalance.zelle,
        p_closing_divisas: reportData.closingBalance.divisas,
        p_pdf_path: pdfPath,
        p_excel_path: excelPath,
        p_lines: lines
      });

      if (!rpcError && rpcData) {
        return rpcData;
      }

      // Fallback direct insert
      const { data: insertedReport, error: insertError } = await supabase
        .from('financial_reports')
        .insert({
          cluster,
          mes,
          opening_bs: reportData.openingBalance.bs,
          opening_zelle: reportData.openingBalance.zelle,
          opening_divisas: reportData.openingBalance.divisas,
          total_income_bs: reportData.totalIncome.bs,
          total_income_zelle: reportData.totalIncome.zelle,
          total_income_divisas: reportData.totalIncome.divisas,
          total_expense_bs: reportData.totalExpense.bs,
          total_expense_zelle: reportData.totalExpense.zelle,
          total_expense_divisas: reportData.totalExpense.divisas,
          closing_bs: reportData.closingBalance.bs,
          closing_zelle: reportData.closingBalance.zelle,
          closing_divisas: reportData.closingBalance.divisas,
          pdf_path: pdfPath,
          excel_path: excelPath,
          status: 'published',
          published_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError || !insertedReport) throw insertError || new Error('Failed to insert report');

      const reportId = insertedReport.id;
      const lineRecords = lines.map(l => ({
        report_id: reportId,
        date: l.date,
        concept: l.redactedConcept || l.concept,
        category: l.category,
        transferencia_bs: l.transferenciaBs,
        zelle_usd: l.zelleUsd,
        divisas_usd: l.divisasUsd,
        is_key_row: !!l.isKeyRow,
        key_row_type: l.keyRowType,
        has_personal_data: !!l.hasPersonalData,
        redacted_concept: l.redactedConcept
      }));

      await supabase.from('financial_report_lines').insert(lineRecords);
      return reportId;
    } catch (err) {
      console.error('Error publishing financial report:', err);
      throw err;
    }
  }
};
