import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  month = new Date().toISOString().slice(0, 7);
  summary: any = {};
  categoryData: any[] = [];
  trendData: any[] = [];
  maxCatValue = 1;
  loading = true;

  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendLineChart') trendLineChartRef!: ElementRef<HTMLCanvasElement>;
  private pieChartInstance: Chart | null = null;
  private trendChartInstance: Chart | null = null;

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getReportSummary(this.month).subscribe({ next: d => { this.summary = d; this.cdr.detectChanges(); }, error: () => {} });

    const from = this.month + '-01';
    const y = parseInt(this.month.split('-')[0]);
    const m = parseInt(this.month.split('-')[1]);
    const to = new Date(y, m, 0).toISOString().split('T')[0];

    this.api.getReportByCategory(from, to).subscribe({
      next: d => {
        this.categoryData = d;
        const vals = d.filter((i: any) => i.type === 'expense').map((i: any) => i.total);
        this.maxCatValue = Math.max(...vals, 1);
        this.loading = false;
        this.cdr.detectChanges();
        this.renderPieChart();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });

    this.api.getReportTrend(6).subscribe({
      next: d => {
        this.trendData = d;
        this.cdr.detectChanges();
        this.renderTrendChart();
      },
      error: () => {}
    });
  }

  private renderPieChart(): void {
    setTimeout(() => {
      if (!this.pieChartRef?.nativeElement) return;
      if (this.pieChartInstance) this.pieChartInstance.destroy();

      const expenseData = this.categoryData.filter((c: any) => c.type === 'expense' && parseFloat(c.total) > 0);
      if (expenseData.length === 0) return;

      const labels = expenseData.map((c: any) => c.category_name || this.i18n.t('report.no_category'));
      const values = expenseData.map((c: any) => parseFloat(c.total));
      const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#64748b'];

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const textColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

      this.pieChartInstance = new Chart(this.pieChartRef.nativeElement, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors.slice(0, values.length),
            borderWidth: 2,
            borderColor: isDark ? '#1e293b' : '#fff',
            hoverOffset: 12
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 12 } } },
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
    }, 150);
  }

  private renderTrendChart(): void {
    setTimeout(() => {
      if (!this.trendLineChartRef?.nativeElement || !this.trendData?.length) return;
      if (this.trendChartInstance) this.trendChartInstance.destroy();

      const labels = this.trendData.map((t: any) => t.month || t.period);
      const incomeData = this.trendData.map((t: any) => parseFloat(t.income || 0));
      const expenseData = this.trendData.map((t: any) => parseFloat(t.expense || 0));

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
      const textColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';

      this.trendChartInstance = new Chart(this.trendLineChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: this.i18n.t('dash.income'),
              data: incomeData,
              backgroundColor: 'rgba(34,197,94,0.7)',
              borderColor: '#22c55e',
              borderWidth: 1,
              borderRadius: 6,
              barPercentage: 0.6
            },
            {
              label: this.i18n.t('dash.expense'),
              data: expenseData,
              backgroundColor: 'rgba(239,68,68,0.7)',
              borderColor: '#ef4444',
              borderWidth: 1,
              borderRadius: 6,
              barPercentage: 0.6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: textColor, usePointStyle: true, padding: 16, font: { size: 12, weight: 'bold' } } },
            tooltip: {
              backgroundColor: isDark ? '#1e293b' : '#fff',
              titleColor: isDark ? '#fff' : '#0f172a',
              bodyColor: isDark ? '#94a3b8' : '#475569',
              borderColor: isDark ? '#334155' : '#e2e8f0',
              borderWidth: 1, padding: 12, cornerRadius: 8
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
            y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } }
          }
        }
      });
    }, 150);
  }

  getBarWidth(val: number): number { return (val / this.maxCatValue) * 100; }
  formatCurrency(v: number): string { return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v); }

  exportCsv(): void {
    this.api.exportCsv({ from: this.month + '-01' }).subscribe({
      next: blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'relatorio.csv'; a.click(); URL.revokeObjectURL(a.href); this.toast.success(this.i18n.t('report.csv_exported')); },
      error: () => this.toast.error(this.i18n.t('toast.error'))
    });
  }

  exportPdf(): void {
    this.api.exportPdf({ month: this.month }).subscribe({
      next: blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'relatorio.pdf'; a.click(); URL.revokeObjectURL(a.href); this.toast.success(this.i18n.t('report.pdf_exported')); },
      error: () => this.toast.error(this.i18n.t('toast.error'))
    });
  }
}
