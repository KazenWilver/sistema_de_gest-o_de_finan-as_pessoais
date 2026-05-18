export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  currency: string;
  language: string;
  theme: string;
  created_at: string;
}

export interface AuthResponse {
  status: string;
  message?: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: 'cash' | 'bank' | 'mobile_money' | 'savings' | 'other';
  currency: string;
  balance?: number;
  total_income?: number;
  total_expense?: number;
  created_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  description: string;
  transaction_date: string;
  payment_method?: string;
  notes?: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  account_name?: string;
  created_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id?: number;
  name: string;
  limit_amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  spent?: number;
  remaining?: number;
  percentage?: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardSummary {
  income: number;
  expense: number;
  balance: number;
  savings_rate: number;
}

export interface ChartData {
  trend: Array<{ month: string; type: string; total: number }>;
  byCategory: Array<{ name: string; color: string; icon: string; type: string; total: number }>;
  budgets: Budget[];
}
