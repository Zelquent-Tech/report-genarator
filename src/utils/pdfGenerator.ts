import { jsPDF } from 'jspdf';
import { AnalysisResults, BusinessData } from '../types';

export const generatePDFReport = (data: BusinessData[], results: AnalysisResults) => {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text('VisionDesk Lite - Executive Report', margin, y);
  y += 15;

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
  y += 20;

  // Executive Summary
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Executive Summary', margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.text(`Total Revenue: $${results.totalRevenue.toLocaleString()}`, margin, y);
  y += 7;
  doc.text(`Total Profit: $${results.totalProfit.toLocaleString()}`, margin, y);
  y += 7;
  doc.text(`Average Profit Margin: ${results.avgProfitMargin.toFixed(1)}%`, margin, y);
  y += 15;

  // Insights
  doc.setFontSize(16);
  doc.text('Key Insights', margin, y);
  y += 10;
  doc.setFontSize(11);
  results.insights.forEach(insight => {
    const lines = doc.splitTextToSize(`• ${insight}`, 170);
    doc.text(lines, margin, y);
    y += (lines.length * 7);
  });
  y += 10;

  // Risk Analysis
  doc.setFontSize(16);
  doc.text('Risk Analysis', margin, y);
  y += 10;
  doc.setFontSize(11);
  if (results.anomalies.length > 0) {
    results.anomalies.forEach(anomaly => {
      const lines = doc.splitTextToSize(`[${anomaly.severity.toUpperCase()}] ${anomaly.description}`, 170);
      doc.text(lines, margin, y);
      y += (lines.length * 7);
    });
  } else {
    doc.text('No significant operational risks detected during this period.', margin, y);
    y += 7;
  }
  y += 15;

  // Forecast
  doc.setFontSize(16);
  doc.text('3-Month Revenue Forecast', margin, y);
  y += 10;
  doc.setFontSize(11);
  results.forecast.forEach(f => {
    doc.text(`${f.date}: $${f.revenue.toLocaleString()}`, margin, y);
    y += 7;
  });

  doc.save('VisionDesk_Executive_Report.pdf');
};
