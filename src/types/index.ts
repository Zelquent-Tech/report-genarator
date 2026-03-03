export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SignInCredentials {
  email: string;
  password?: string;
}

export interface SignUpCredentials {
  email: string;
  name: string;
  password?: string;
}

export interface BusinessData {
  date: string;
  revenue: number;
  expenses: number;
  customers: number;
  profit: number;
}

export interface AnalysisResults {
  totalRevenue: number;
  totalProfit: number;
  totalCustomers: number;
  avgProfitMargin: number;
  monthlyGrowth: number;
  customerGrowthRate: number;
  anomalies: Anomaly[];
  insights: string[];
  forecast: ForecastData[];
  trends: {
    revenue: 'up' | 'down' | 'stable';
    profit: 'up' | 'down' | 'stable';
  };
}

export interface Anomaly {
  date: string;
  type: 'revenue_drop' | 'spike' | 'expense_surge';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ForecastData {
  date: string;
  revenue: number;
  isForecast: boolean;
}
