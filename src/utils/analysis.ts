import { BusinessData, AnalysisResults, Anomaly, ForecastData } from '../types';

export const analyzeBusinessData = (data: BusinessData[]): AnalysisResults => {
  if (data.length === 0) {
    return {
      totalRevenue: 0,
      totalProfit: 0,
      totalCustomers: 0,
      avgProfitMargin: 0,
      monthlyGrowth: 0,
      customerGrowthRate: 0,
      anomalies: [],
      insights: [],
      forecast: [],
      trends: { revenue: 'stable', profit: 'stable' }
    };
  }

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const totalRevenue = sortedData.reduce((sum, d) => sum + d.revenue, 0);
  const totalProfit = sortedData.reduce((sum, d) => sum + d.profit, 0);
  const totalCustomers = sortedData[sortedData.length - 1].customers;
  
  const margins = sortedData.map(d => d.revenue > 0 ? (d.profit / d.revenue) * 100 : 0);
  const avgProfitMargin = margins.reduce((sum, m) => sum + m, 0) / margins.length;

  // Growth calculations
  let monthlyGrowth = 0;
  let customerGrowthRate = 0;
  if (sortedData.length > 1) {
    const last = sortedData[sortedData.length - 1];
    const prev = sortedData[sortedData.length - 2];
    monthlyGrowth = prev.revenue > 0 ? ((last.revenue - prev.revenue) / prev.revenue) * 100 : 0;
    customerGrowthRate = prev.customers > 0 ? ((last.customers - prev.customers) / prev.customers) * 100 : 0;
  }

  // Anomaly Detection
  const anomalies: Anomaly[] = [];
  for (let i = 1; i < sortedData.length; i++) {
    const curr = sortedData[i];
    const prev = sortedData[i - 1];
    
    // Revenue drop > 10%
    if (prev.revenue > 0 && (prev.revenue - curr.revenue) / prev.revenue > 0.1) {
      anomalies.push({
        date: curr.date,
        type: 'revenue_drop',
        severity: (prev.revenue - curr.revenue) / prev.revenue > 0.25 ? 'high' : 'medium',
        description: `Significant revenue drop detected on ${curr.date}.`
      });
    }

    // Expense surge
    if (prev.expenses > 0 && (curr.expenses - prev.expenses) / prev.expenses > 0.3) {
      anomalies.push({
        date: curr.date,
        type: 'expense_surge',
        severity: 'medium',
        description: `Unusual expense increase on ${curr.date}.`
      });
    }
  }

  // Trends
  const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
  const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
  const avgRev1 = firstHalf.reduce((s, d) => s + d.revenue, 0) / firstHalf.length;
  const avgRev2 = secondHalf.reduce((s, d) => s + d.revenue, 0) / secondHalf.length;
  
  const revenueTrend = avgRev2 > avgRev1 * 1.05 ? 'up' : avgRev2 < avgRev1 * 0.95 ? 'down' : 'stable';

  // Insights
  const insights: string[] = [];
  if (revenueTrend === 'up') insights.push("Business is showing a strong upward revenue trend.");
  if (avgProfitMargin > 30) insights.push("Healthy profit margins maintained throughout the period.");
  if (customerGrowthRate > 5) insights.push(`Customer base is expanding rapidly at ${customerGrowthRate.toFixed(1)}% monthly.`);
  if (anomalies.length > 0) insights.push(`Identified ${anomalies.length} operational anomalies that require attention.`);
  if (monthlyGrowth < 0) insights.push("Recent month-over-month revenue has declined; consider reviewing sales strategy.");

  // Simple Linear Regression for Forecast
  const forecast = generateForecast(sortedData);

  return {
    totalRevenue,
    totalProfit,
    totalCustomers,
    avgProfitMargin,
    monthlyGrowth,
    customerGrowthRate,
    anomalies,
    insights,
    forecast,
    trends: { revenue: revenueTrend, profit: 'stable' }
  };
};

const generateForecast = (data: BusinessData[]): ForecastData[] => {
  if (data.length < 3) return [];

  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data.map(d => d.revenue);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumXX = x.reduce((a, b) => a + b * b, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const lastDate = new Date(data[data.length - 1].date);
  const forecast: ForecastData[] = [];

  for (let i = 1; i <= 3; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setMonth(lastDate.getMonth() + i);
    forecast.push({
      date: nextDate.toISOString().split('T')[0],
      revenue: Math.max(0, slope * (n + i - 1) + intercept),
      isForecast: true
    });
  }

  return forecast;
};
