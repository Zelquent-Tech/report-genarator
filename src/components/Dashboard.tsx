import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, Brush, ReferenceLine 
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, AlertTriangle, Lightbulb, ArrowUpRight, ArrowDownRight, Maximize2 } from 'lucide-react';
import { AnalysisResults, BusinessData } from '../types';
import { formatCurrency, formatPercent, cn } from '../utils/helpers';
import { motion } from 'motion/react';

interface DashboardProps {
  data: BusinessData[];
  results: AnalysisResults;
  isDarkMode: boolean;
}

const CustomTooltip = ({ active, payload, label, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={cn(
        "p-4 rounded-2xl border shadow-xl backdrop-blur-md",
        isDarkMode ? "bg-zinc-900/90 border-zinc-800" : "bg-white/90 border-zinc-200"
      )}>
        <p className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">
          {new Date(label).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm font-medium text-zinc-400 capitalize">{entry.name}</span>
              </div>
              <span className="text-sm font-bold">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ data, results, isDarkMode }) => {
  const chartColor = "#10b981"; // emerald-500
  const secondaryColor = "#3b82f6"; // blue-500

  const StatCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 rounded-3xl border group hover:border-emerald-500/50 transition-all duration-300",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-2xl transition-colors group-hover:bg-emerald-500/10", isDarkMode ? "bg-zinc-800" : "bg-zinc-100")}>
          <Icon className="w-6 h-6 text-emerald-500" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          )}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
      <p className="text-xs text-zinc-400 mt-2">{subValue}</p>
    </motion.div>
  );

  const lastPoint = data[data.length - 1];
  const combinedChartData = [
    ...data.map(d => ({ ...d, revenue: d.revenue })),
    { ...lastPoint, date: lastPoint.date, forecast: lastPoint.revenue },
    ...results.forecast.map(f => ({ date: f.date, forecast: f.revenue }))
  ];

  const avgRevenue = results.totalRevenue / data.length;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(results.totalRevenue)} 
          subValue="Cumulative revenue for period"
          icon={DollarSign}
          trend={results.monthlyGrowth}
        />
        <StatCard 
          title="Total Profit" 
          value={formatCurrency(results.totalProfit)} 
          subValue={`Avg Margin: ${results.avgProfitMargin.toFixed(1)}%`}
          icon={TrendingUp}
        />
        <StatCard 
          title="Active Customers" 
          value={results.totalCustomers.toLocaleString()} 
          subValue="Current customer base"
          icon={Users}
          trend={results.customerGrowthRate}
        />
        <StatCard 
          title="Anomalies" 
          value={results.anomalies.length} 
          subValue="Detected operational risks"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "lg:col-span-2 p-6 rounded-3xl border",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
          )}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Revenue & Forecast</h3>
              <p className="text-sm text-zinc-500">Historical performance with 3-month AI prediction</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-zinc-500">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border border-emerald-500 border-dashed" />
                <span className="text-xs font-medium text-zinc-500">Forecast</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] sm:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedChartData} syncId="businessMetrics">
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#27272a" : "#f4f4f5"} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={30}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                <ReferenceLine y={avgRevenue} label={{ value: 'Avg', position: 'right', fill: '#71717a', fontSize: 10 }} stroke="#71717a" strokeDasharray="3 3" />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenue"
                  stroke={chartColor} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: chartColor }}
                />
                <Area 
                  type="monotone" 
                  dataKey="forecast" 
                  name="Forecasted Revenue"
                  stroke={chartColor} 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fillOpacity={0} 
                  fill="transparent"
                  activeDot={{ r: 4, strokeWidth: 0, fill: chartColor }}
                />
                <Brush 
                  dataKey="date" 
                  height={30} 
                  stroke={chartColor} 
                  fill={isDarkMode ? "#18181b" : "#fff"}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short' })}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Insights Panel */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "p-6 rounded-3xl border h-full",
              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
            )}
          >
            <div className="flex items-center gap-2 mb-6">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold">AI Insights</h3>
            </div>
            <div className="space-y-4">
              {results.insights.map((insight, i) => (
                <div key={i} className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed border border-transparent hover:border-emerald-500/20 transition-all duration-300",
                  isDarkMode ? "bg-zinc-800/50 text-zinc-300" : "bg-zinc-50 text-zinc-600"
                )}>
                  {insight}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profitability Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-3xl border",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
          )}
        >
          <h3 className="text-lg font-bold mb-6">Profit vs Expenses</h3>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} syncId="businessMetrics">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#27272a" : "#f4f4f5"} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={20}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip content={<CustomTooltip isDarkMode={isDarkMode} />} />
                <Legend iconType="circle" />
                <Bar dataKey="profit" name="Profit" fill={chartColor} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Anomalies & Risks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-3xl border",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
          )}
        >
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold">Operational Risks</h3>
          </div>
          <div className="space-y-4">
            {results.anomalies.length > 0 ? (
              results.anomalies.map((anomaly, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-4 p-4 rounded-2xl border",
                  isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
                )}>
                  <div className={cn(
                    "w-2 h-2 mt-1.5 rounded-full shrink-0",
                    anomaly.severity === 'high' ? "bg-red-500" : "bg-amber-500"
                  )} />
                  <div>
                    <p className="text-sm font-bold mb-1">{anomaly.description}</p>
                    <p className="text-xs text-zinc-500">Detected on {anomaly.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mb-4" />
                <p>No significant risks detected</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);
