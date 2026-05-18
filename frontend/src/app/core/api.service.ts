import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Account, Category, Transaction, Budget,
  ApiResponse, PaginatedTransactions, DashboardSummary, ChartData
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Accounts ──
  getAccounts(): Observable<Account[]> {
    return this.http.get<ApiResponse<Account[]>>(`${this.url}/accounts`).pipe(map(r => r.data));
  }
  createAccount(data: Partial<Account>): Observable<Account> {
    return this.http.post<ApiResponse<Account>>(`${this.url}/accounts`, data).pipe(map(r => r.data));
  }
  updateAccount(id: number, data: Partial<Account>): Observable<Account> {
    return this.http.put<ApiResponse<Account>>(`${this.url}/accounts/${id}`, data).pipe(map(r => r.data));
  }
  deleteAccount(id: number): Observable<any> {
    return this.http.delete(`${this.url}/accounts/${id}`);
  }

  // ── Categories ──
  getCategories(type?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    return this.http.get<ApiResponse<Category[]>>(`${this.url}/categories`, { params }).pipe(map(r => r.data));
  }
  createCategory(data: Partial<Category>): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(`${this.url}/categories`, data).pipe(map(r => r.data));
  }
  updateCategory(id: number, data: Partial<Category>): Observable<Category> {
    return this.http.put<ApiResponse<Category>>(`${this.url}/categories/${id}`, data).pipe(map(r => r.data));
  }
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.url}/categories/${id}`);
  }

  // ── Transactions ──
  getTransactions(filters?: any): Observable<PaginatedTransactions> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<ApiResponse<PaginatedTransactions>>(`${this.url}/transactions`, { params }).pipe(map(r => r.data));
  }
  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<ApiResponse<Transaction>>(`${this.url}/transactions/${id}`).pipe(map(r => r.data));
  }
  createTransaction(data: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<ApiResponse<Transaction>>(`${this.url}/transactions`, data).pipe(map(r => r.data));
  }
  updateTransaction(id: number, data: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<ApiResponse<Transaction>>(`${this.url}/transactions/${id}`, data).pipe(map(r => r.data));
  }
  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.url}/transactions/${id}`);
  }

  // ── Budgets ──
  getBudgets(): Observable<Budget[]> {
    return this.http.get<ApiResponse<Budget[]>>(`${this.url}/budgets`).pipe(map(r => r.data));
  }
  getBudgetProgress(): Observable<Budget[]> {
    return this.http.get<ApiResponse<Budget[]>>(`${this.url}/budgets/progress`).pipe(map(r => r.data));
  }
  createBudget(data: Partial<Budget>): Observable<Budget> {
    return this.http.post<ApiResponse<Budget>>(`${this.url}/budgets`, data).pipe(map(r => r.data));
  }
  updateBudget(id: number, data: Partial<Budget>): Observable<Budget> {
    return this.http.put<ApiResponse<Budget>>(`${this.url}/budgets/${id}`, data).pipe(map(r => r.data));
  }
  deleteBudget(id: number): Observable<any> {
    return this.http.delete(`${this.url}/budgets/${id}`);
  }

  // ── Dashboard ──
  getDashboardSummary(month?: string): Observable<DashboardSummary> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.url}/dashboard/summary`, { params }).pipe(map(r => r.data));
  }
  getRecentTransactions(): Observable<Transaction[]> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.url}/dashboard/recent`).pipe(map(r => r.data));
  }
  getChartData(months?: number): Observable<ChartData> {
    let params = new HttpParams();
    if (months) params = params.set('months', months.toString());
    return this.http.get<ApiResponse<ChartData>>(`${this.url}/dashboard/charts`, { params }).pipe(map(r => r.data));
  }

  // ── Reports ──
  getReportSummary(month?: string): Observable<any> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    return this.http.get<ApiResponse<any>>(`${this.url}/reports/summary`, { params }).pipe(map(r => r.data));
  }
  getReportByCategory(from?: string, to?: string): Observable<any[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<ApiResponse<any[]>>(`${this.url}/reports/category`, { params }).pipe(map(r => r.data));
  }
  getReportTrend(months?: number): Observable<any[]> {
    let params = new HttpParams();
    if (months) params = params.set('months', months.toString());
    return this.http.get<ApiResponse<any[]>>(`${this.url}/reports/trend`, { params }).pipe(map(r => r.data));
  }

  // ── Currency ──
  getCurrencyRates(base?: string): Observable<any> {
    let params = new HttpParams();
    if (base) params = params.set('base', base);
    return this.http.get<ApiResponse<any>>(`${this.url}/currency/rates`, { params }).pipe(map(r => r.data));
  }

  // ── Settings ──
  updateSettings(data: any): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.url}/settings/profile`, data).pipe(map(r => r.data));
  }
  updateTheme(theme: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.url}/settings/theme`, { theme }).pipe(map(r => r.data));
  }

  // ── Export ──
  exportCsv(filters?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filters) Object.keys(filters).forEach(k => { if (filters[k]) params = params.set(k, filters[k]); });
    return this.http.get(`${this.url}/export/csv`, { params, responseType: 'blob' });
  }
  exportPdf(filters?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filters) Object.keys(filters).forEach(k => { if (filters[k]) params = params.set(k, filters[k]); });
    return this.http.get(`${this.url}/export/pdf`, { params, responseType: 'blob' });
  }

  // ── Admin ──
  getAdminUsers(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.url}/admin/users`).pipe(map(r => r.data));
  }
  getAdminStats(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.url}/admin/stats`).pipe(map(r => r.data));
  }
}
