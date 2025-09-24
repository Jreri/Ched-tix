import { useState } from "react";
import jsPDF from "jspdf";
import 'jspdf-autotable';

export type ExportFormat = "csv" | "pdf";

interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
}

export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = <T extends Record<string, any>>(data: T[], options: ExportOptions) => {
    setIsExporting(true);
    try {
      if (!data || data.length === 0) throw new Error("No data to export");

      const headers = Object.keys(data[0]);
      let csvContent = headers.join(",") + "\n";

      data.forEach(item => {
        const row = headers.map(header => {
          const value = item[header];
          if (value === null || value === undefined) return "";
          if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
          return value;
        });
        csvContent += row.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${options.filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = <T extends Record<string, any>>(data: T[], options: ExportOptions) => {
    setIsExporting(true);
    try {
      if (!data || data.length === 0) throw new Error("No data to export");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      if (options.title) {
        pdf.setFontSize(18);
        pdf.text(options.title, 14, 20);
      }

      if (options.subtitle) {
        pdf.setFontSize(12);
        pdf.text(options.subtitle, 14, 30);
      }

      const headers = Object.keys(data[0]);
      const tableData = data.map(item => 
        headers.map(header => {
          const value = item[header];
          if (value === null || value === undefined) return "";
          return typeof value === "object" ? JSON.stringify(value) : String(value);
        })
      );

      // @ts-ignore - autotable plugin
      pdf.autoTable({
        head: [headers],
        body: tableData,
        startY: options.title ? 40 : 20,
        headStyles: { fillColor: [100, 100, 100] },
      });

      pdf.save(`${options.filename}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportData = <T extends Record<string, any>>(data: T[], format: ExportFormat, options: ExportOptions) => {
    if (format === "csv") exportToCSV(data, options);
    else if (format === "pdf") exportToPDF(data, options);
  };

  return { exportData, isExporting };
}
