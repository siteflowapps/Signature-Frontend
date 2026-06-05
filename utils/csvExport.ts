/**
 * Shared CSV export utility — generates and downloads a .csv file from tabular data.
 * CSV opens natively in Excel, Google Sheets, etc.
 */

const escapeCSV = (val: string): string => {
  // Prevent Excel scientific notation for long number strings (like phone numbers)
  if (/^\+?\d{10,15}$/.test(val)) {
    return `="${val}"`;
  }

  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
};

interface ExportOptions {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}

export function downloadCSV({ filename, headers, rows }: ExportOptions): void {
  const headerLine = headers.map(h => escapeCSV(h)).join(',');
  const dataLines = rows.map(row =>
    row.map(cell => escapeCSV(String(cell ?? '—'))).join(','),
  );
  const csvContent = [headerLine, ...dataLines].join('\n');
  // BOM prefix so Excel correctly reads UTF-8 (₹ symbol etc.)
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
