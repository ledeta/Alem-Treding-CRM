import { useState } from 'react';

interface ExportOptions {
  filename?: string;
  type: 'excel' | 'pdf';
}

export function useExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportToExcel = async (data: any[], filename: string = 'export.xlsx') => {
    setExporting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const endpointMap: { [key: string]: string } = {
        transactions: '/export/transactions-excel',
        customers: '/export/customers-excel',
        payments: '/export/payments-excel',
      };

      const endpoint = Object.keys(endpointMap).find((key) =>
        filename.toLowerCase().includes(key)
      );
      const url = endpoint ? endpointMap[endpoint] : '/export/transactions-excel';

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [endpoint || 'transactions']: data }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async (data: any, filename: string = 'export.pdf') => {
    setExporting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/export/dashboard-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('PDF export failed');
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err: any) {
      setError(err.message || 'PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  return {
    exportToExcel,
    exportToPDF,
    exporting,
    error,
  };
}
