import React from 'react';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { BusinessData } from '../types';
import { cn } from '../utils/helpers';

interface FileUploadProps {
  onDataLoaded: (data: BusinessData[]) => void;
  isDarkMode: boolean;
  userId: string;
  onAuthError?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, isDarkMode, userId, onAuthError }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File is too large. Please upload a CSV smaller than 10MB.');
      return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setError(null);
    setFileName(file.name);
    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const mappedData: BusinessData[] = results.data
            .map((row: any) => {
              const dateKey = Object.keys(row).find(k => k.toLowerCase().includes('date')) || 'date';
              const revenueKey = Object.keys(row).find(k => k.toLowerCase().includes('revenue')) || 'revenue';
              const expenseKey = Object.keys(row).find(k => k.toLowerCase().includes('expense')) || 'expenses';
              const customerKey = Object.keys(row).find(k => k.toLowerCase().includes('customer')) || 'customers';

              const date = row[dateKey];
              const revenue = parseFloat(String(row[revenueKey]).replace(/[^0-9.-]+/g, "")) || 0;
              const expenses = parseFloat(String(row[expenseKey]).replace(/[^0-9.-]+/g, "")) || 0;
              const customers = parseInt(String(row[customerKey])) || 0;

              return {
                date,
                revenue,
                expenses,
                customers,
                profit: revenue - expenses
              };
            })
            .filter(row => row.date && typeof row.date === 'string' && row.date.trim() !== '');

          if (mappedData.length === 0) {
            throw new Error('No valid data found in CSV. Ensure it has a "Date" column and business metrics.');
          }
          
          // Sync with backend
          const response = await fetch('/api/data/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, data: mappedData }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401 && onAuthError) {
              onAuthError();
              return;
            }
            throw new Error(errorData.error || 'Failed to sync data with server');
          }

          onDataLoaded(mappedData);
        } catch (err: any) {
          setError(err.message || 'Failed to parse CSV. Ensure it has Date, Revenue, Expenses, and Customers columns.');
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  const downloadSample = () => {
    const csvContent = "Date,Revenue,Expenses,Customers\n2025-01-01,12000,8000,150\n2025-02-01,14500,8500,165\n2025-03-01,13200,9000,172\n2025-04-01,15800,9200,188\n2025-05-01,18000,9500,210\n2025-06-01,17500,10000,225";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_business_data.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Upload Business Data</h2>
        <p className="text-zinc-500 mb-8">Upload your monthly business metrics to generate AI insights and forecasts.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        className={cn(
          "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer",
          isDragging ? "border-emerald-500 bg-emerald-500/5" : (isDarkMode ? "border-zinc-800 hover:border-zinc-700" : "border-zinc-200 hover:border-zinc-300"),
          fileName && "border-emerald-500/50 bg-emerald-500/5"
        )}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-medium text-lg">Processing Data...</p>
            <p className="text-zinc-500 text-sm">Syncing with secure cloud storage</p>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 className="text-emerald-500 w-8 h-8" />
            </div>
            <p className="font-medium text-lg">{fileName}</p>
            <p className="text-emerald-500 text-sm">File uploaded successfully</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
              <Upload className="text-zinc-400 w-8 h-8" />
            </div>
            <p className="font-medium text-lg">Click or drag CSV file here</p>
            <p className="text-zinc-500 text-sm">Support for monthly business metrics (Date, Revenue, etc.)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={downloadSample}
          className="flex items-center gap-2 text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Download Sample CSV Template
        </button>
      </div>
    </div>
  );
};
