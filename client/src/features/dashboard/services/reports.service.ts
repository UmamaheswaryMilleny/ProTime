import { ProTimeBackend as api } from '../../../api/instance';
import { API_ROUTES }            from '../../../shared/constants/constants.routes';
import type { ProductivityReportData } from '../types/reports.types';

export type ReportRange = '7days' | '14days' | '30days' | '90days' | 'custom';

export const reportsService = {
  /** Fetch full productivity report for the authenticated user */
  getProductivityReport: async (range: string, month?: string): Promise<ProductivityReportData> => {
    const response = await api.get(API_ROUTES.PRODUCTIVITY_REPORT, { params: { range, month } });
    return response.data.data as ProductivityReportData;
  },

  /** Download a CSV export — returns a Blob so the client can create a download link */
  exportReportCsv: async (range: string, month?: string): Promise<Blob> => {
    const response = await api.get(API_ROUTES.PRODUCTIVITY_REPORT_EXPORT, {
      params:       { format: 'csv', range, month },
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
