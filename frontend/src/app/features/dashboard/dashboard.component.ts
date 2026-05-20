import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { DashboardSummary, Transaction, Budget } from '../../core/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  summary: DashboardSummary = { income: 0, expense: 0, balance: 0, savings_rate: 0 };
  recentTransactions: Transaction[] = [];
  budgets: Budget[] = [];
  chartData: any = null;
  userName = '';
  currentMonth = '';
  loading = true;
  private langSub: any;

  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  private trendChartInstance: Chart | null = null;
  private categoryChartInstance: Chart | null = null;

  constructor(private api: ApiService, private auth: AuthService, public i18n: I18nService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.userName = this.auth.currentUser?.name?.split(' ')[0] || this.i18n.t('dash.user_fallback');
    this.currentMonth = new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

    forkJoin({
      summary: this.api.getDashboardSummary(),
      recent: this.api.getRecentTransactions(),
      budgets: this.api.getBudgetProgress(),
      charts: this.api.getChartData(6)
    }).subscribe({
      next: (data) => {
        this.summary = data.summary;
        this.recentTransactions = data.recent;
        this.budgets = data.budgets;
        this.chartData = data.charts;
        this.loading = false;
        this.cdr.detectChanges();
        this.renderCharts();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });

    this.langSub = this.i18n.lang$.subscribe(() => {
      this.userName = this.auth.currentUser?.name?.split(' ')[0] || this.i18n.t('dash.user_fallback');
      const langCode = this.i18n.currentLang;
      const locale = langCode === 'pt' ? 'pt-PT' : langCode === 'en' ? 'en-US' : langCode;
      this.currentMonth = new Date().toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      this.cdr.detectChanges();
      if (!this.loading) {
        this.renderCharts();
      }
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  private renderCharts(): void {
    setTimeout(() => {
      this.renderTrendChart();
      this.renderCategoryChart();
    }, 100);
  }

  private renderTrendChart(): void {
    if (!this.trendChartRef?.nativeElement || !this.chartData?.trend) return;
    if (this.trendChartInstance) this.trendChartInstance.destroy();

    const trend = this.chartData.trend;
    const labels = trend.map((t: any) => t.month || t.period);
    const incomeData = trend.map((t: any) => parseFloat(t.income || 0));
    const expenseData = trend.map((t: any) => parseFloat(t.expense || 0));

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

    this.trendChartInstance = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: this.i18n.t('dash.income'),
            data: incomeData,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.12)',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#22c55e',
            pointHoverRadius: 6
          },
          {
            label: this.i18n.t('dash.expense'),
            data: expenseData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.12)',
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointBackgroundColor: '#ef4444',
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: textColor, usePointStyle: true, padding: 16, font: { size: 12, weight: 'bold' } } },
          tooltip: { backgroundColor: isDark ? '#1e293b' : '#fff', titleColor: isDark ? '#fff' : '#0f172a', bodyColor: isDark ? '#94a3b8' : '#475569', borderColor: isDark ? '#334155' : '#e2e8f0', borderWidth: 1, padding: 12, cornerRadius: 8 }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } }
        }
      }
    });
  }

  private renderCategoryChart(): void {
    if (!this.categoryChartRef?.nativeElement || !this.chartData?.byCategory) return;
    if (this.categoryChartInstance) this.categoryChartInstance.destroy();

    const catData = this.chartData.byCategory.filter((c: any) => c.type === 'expense' && parseFloat(c.total) > 0);
    if (catData.length === 0) return;

    const labels = catData.map((c: any) => this.i18n.translateCategory(c.category_name) || this.i18n.t('report.no_category'));
    const values = catData.map((c: any) => parseFloat(c.total));
    const colors = [
      '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#64748b'
    ];

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

    this.categoryChartInstance = new Chart(this.categoryChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, values.length),
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: textColor, usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 12 } }
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#fff',
            titleColor: isDark ? '#fff' : '#0f172a',
            bodyColor: isDark ? '#94a3b8' : '#475569',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1, padding: 12, cornerRadius: 8
          }
        }
      }
    });
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(val);
  }

  getBudgetColor(pct: number): string {
    if (pct >= 90) return 'var(--color-error)';
    if (pct >= 70) return 'var(--color-warning)';
    return 'var(--color-success)';
  }

  Math = Math;
}
