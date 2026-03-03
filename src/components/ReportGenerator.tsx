import React from 'react';
import { FileDown, ShieldCheck, Zap, Target } from 'lucide-react';
import { AnalysisResults, BusinessData } from '../types';
import { generatePDFReport } from '../utils/pdfGenerator';
import { cn } from '../utils/helpers';
import { motion } from 'motion/react';

interface ReportGeneratorProps {
  data: BusinessData[];
  results: AnalysisResults;
  isDarkMode: boolean;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ data, results, isDarkMode }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      generatePDFReport(data, results);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 mb-4">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">AI Executive Report</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">
          Our analysis engine has processed your data. Generate a comprehensive PDF report including growth strategies, risk assessments, and financial forecasts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn("p-6 rounded-3xl border", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
          <Zap className="w-6 h-6 text-amber-500 mb-4" />
          <h4 className="font-bold mb-2">Growth Prediction</h4>
          <p className="text-sm text-zinc-500">Based on linear regression models, your revenue is expected to reach {Math.round(results.forecast[2]?.revenue).toLocaleString()} by {results.forecast[2]?.date}.</p>
        </div>
        <div className={cn("p-6 rounded-3xl border", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
          <Target className="w-6 h-6 text-emerald-500 mb-4" />
          <h4 className="font-bold mb-2">Strategic Goal</h4>
          <p className="text-sm text-zinc-500">Focus on maintaining the current {results.avgProfitMargin.toFixed(1)}% profit margin while scaling customer acquisition efforts.</p>
        </div>
        <div className={cn("p-6 rounded-3xl border", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
          <ShieldCheck className="w-6 h-6 text-blue-500 mb-4" />
          <h4 className="font-bold mb-2">Risk Status</h4>
          <p className="text-sm text-zinc-500">{results.anomalies.length > 0 ? `Attention required: ${results.anomalies.length} anomalies detected.` : "Operational health is optimal with no major risks detected."}</p>
        </div>
      </div>

      <div className={cn("p-8 rounded-3xl border text-center", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
        <h3 className="text-xl font-bold mb-6">Ready to Export?</h3>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className={cn(
            "inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300",
            isGenerating 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
              : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
          )}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <FileDown className="w-5 h-5" />
              Download PDF Executive Report
            </>
          )}
        </button>
        <p className="text-xs text-zinc-500 mt-4">Report includes charts, tables, and AI-generated strategic recommendations.</p>
      </div>
    </div>
  );
};
