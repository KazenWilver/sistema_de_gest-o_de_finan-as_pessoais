import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { AuthService } from '../../core/auth.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit, OnDestroy {
  month = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })();
  summary: any = {};
  categoryData: any[] = [];
  trendData: any[] = [];
  maxCatValue = 1;
  loading = true;
  private langSub: any;

  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendLineChart') trendLineChartRef!: ElementRef<HTMLCanvasElement>;
  private pieChartInstance: Chart | null = null;
  private trendChartInstance: Chart | null = null;

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService, private cdr: ChangeDetectorRef, private auth: AuthService) {}
  
  ngOnInit(): void {
    this.load();
    this.langSub = this.i18n.lang$.subscribe(() => {
      this.cdr.detectChanges();
      if (!this.loading) {
        this.renderPieChart();
        this.renderTrendChart();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  load(): void {
    this.loading = true;
    this.api.getReportSummary(this.month).subscribe({ next: d => { this.summary = d; this.cdr.detectChanges(); }, error: () => {} });

    const from = this.month + '-01';
    const y = parseInt(this.month.split('-')[0]);
    const m = parseInt(this.month.split('-')[1]);
    const lastDay = new Date(y, m, 0).getDate();
    const to = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

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

      const labels = expenseData.map((c: any) => this.i18n.translateCategory(c.category_name) || this.i18n.t('report.no_category'));
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
    const from = this.month + '-01';
    const y = parseInt(this.month.split('-')[0]);
    const m = parseInt(this.month.split('-')[1]);
    const lastDay = new Date(y, m, 0).getDate();
    const to = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    this.toast.info(this.i18n.t('report.pdf_generating') || 'A gerar relatório PDF...');

    this.api.getTransactions({ from, to, limit: 1000 }).subscribe({
      next: (res) => {
        const transactions = res.transactions || [];
        this.generatePrintReport(transactions);
      },
      error: () => {
        this.toast.error(this.i18n.t('toast.error'));
      }
    });
  }

  generatePrintReport(transactions: any[]): void {
    const user = this.auth.currentUser;
    const userName = user ? user.name : 'Utilizador SGFP';
    const userEmail = user ? user.email : '';
    const activeCurrency = user ? user.currency : 'AOA';

    // Format numbers
    const formatValue = (v: number) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: activeCurrency, minimumFractionDigits: 2 }).format(v);

    // Translations
    const tDate = this.i18n.t('tx.date') || 'Data';
    const tType = this.i18n.t('tx.type') || 'Tipo';
    const tCategory = this.i18n.t('tx.category') || 'Categoria';
    const tDescription = this.i18n.t('tx.description') || 'Descrição';
    const tValue = this.i18n.t('tx.amount') || 'Valor';
    
    const tIncome = this.i18n.t('dash.income') || 'Receitas';
    const tExpense = this.i18n.t('dash.expense') || 'Despesas';
    const tBalance = this.i18n.t('dash.balance') || 'Saldo';
    
    const pieImg = this.pieChartInstance ? this.pieChartInstance.toBase64Image() : '';
    const trendImg = this.trendChartInstance ? this.trendChartInstance.toBase64Image() : '';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.toast.error('Popup bloqueado! Por favor permita popups para este site.');
      return;
    }

    const monthParts = this.month.split('-');
    const formattedMonth = `${monthParts[1]}/${monthParts[0]}`;

    let transactionsHtml = '';
    if (transactions.length === 0) {
      transactionsHtml = `<tr><td colspan="5" class="empty-row">${this.i18n.t('report.no_data_period') || 'Sem transações neste período.'}</td></tr>`;
    } else {
      transactions.forEach(tx => {
        const typeClass = tx.type === 'income' ? 'text-success' : 'text-error';
        const typeLabel = tx.type === 'income' ? (this.i18n.t('tx.income') || 'Receita') : (this.i18n.t('tx.expense') || 'Despesa');
        const catName = this.i18n.translateCategory(tx.category_name) || tx.category_name || (this.i18n.t('report.no_category') || 'Sem Categoria');
        const formattedDate = new Date(tx.transaction_date).toLocaleDateString('pt-AO');

        transactionsHtml += `
          <tr>
            <td>${formattedDate}</td>
            <td class="${typeClass} fw-600">${typeLabel}</td>
            <td><span class="badge badge-outline">${catName}</span></td>
            <td class="text-description" title="${tx.description}">${tx.description}</td>
            <td class="${typeClass} fw-700 text-right">${formatValue(tx.amount)}</td>
          </tr>
        `;
      });
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>SGFP - Relatório Financeiro ${formattedMonth}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #6366f1;
            --primary-light: #e0e7ff;
            --success: #10b981;
            --success-bg: #ecfdf5;
            --error: #ef4444;
            --error-bg: #fef2f2;
            --dark: #0f172a;
            --muted: #64748b;
            --light-bg: #f8fafc;
            --border: #e2e8f0;
          }
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: var(--dark);
            background: #ffffff;
            line-height: 1.5;
            padding: 40px;
            font-size: 14px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid var(--primary);
            padding-bottom: 24px;
            margin-bottom: 30px;
          }

          .logo-container h1 {
            font-size: 24px;
            font-weight: 800;
            color: var(--dark);
            letter-spacing: -0.5px;
          }

          .logo-container h1 span {
            color: var(--primary);
          }

          .logo-container p {
            font-size: 13px;
            color: var(--muted);
            margin-top: 4px;
          }

          .report-meta {
            text-align: right;
          }

          .report-meta h2 {
            font-size: 16px;
            font-weight: 700;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .report-meta p {
            font-size: 13px;
            color: var(--muted);
            margin-top: 4px;
          }

          .user-badge {
            margin-top: 15px;
            background: var(--light-bg);
            border: 1px solid var(--border);
            padding: 10px 16px;
            border-radius: 8px;
            display: inline-block;
            text-align: left;
          }

          .user-badge div {
            font-size: 13px;
            font-weight: 600;
            color: var(--dark);
          }

          .user-badge span {
            font-size: 11px;
            color: var(--muted);
          }

          /* KPI Dashboard Grid */
          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }

          .kpi-card {
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            background: var(--light-bg);
            position: relative;
            overflow: hidden;
          }

          .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
          }

          .kpi-card.income::before { background: var(--success); }
          .kpi-card.expense::before { background: var(--error); }
          .kpi-card.balance::before { background: var(--primary); }

          .kpi-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--muted);
            letter-spacing: 0.5px;
          }

          .kpi-value {
            font-size: 22px;
            font-weight: 700;
            margin-top: 8px;
            color: var(--dark);
          }

          .text-success { color: var(--success) !important; }
          .text-error { color: var(--error) !important; }
          .text-primary { color: var(--primary) !important; }

          /* Charts Section */
          .charts-container {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 24px;
            margin-bottom: 35px;
            page-break-inside: avoid;
          }

          .chart-box {
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
          }

          .chart-box h3 {
            font-size: 14px;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 15px;
            text-align: left;
            border-left: 3px solid var(--primary);
            padding-left: 8px;
          }

          .chart-img {
            max-width: 100%;
            max-height: 200px;
            object-fit: contain;
          }

          /* Tables Section */
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 16px;
            border-left: 4px solid var(--primary);
            padding-left: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .table-container {
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 30px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }

          th {
            background: var(--light-bg);
            color: var(--dark);
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            padding: 12px 16px;
            border-bottom: 2px solid var(--border);
          }

          td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border);
            font-size: 13px;
            color: #334155;
          }

          tr:last-child td {
            border-bottom: none;
          }

          .text-right { text-align: right; }
          .fw-600 { font-weight: 600; }
          .fw-700 { font-weight: 700; }

          .badge {
            display: inline-block;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 100px;
            background: var(--primary-light);
            color: var(--primary);
          }

          .badge-outline {
            background: transparent;
            border: 1px solid var(--primary);
            color: var(--primary);
          }

          .empty-row {
            text-align: center;
            color: var(--muted);
            padding: 30px;
            font-style: italic;
          }

          .text-description {
            max-width: 250px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* Footer */
          .footer {
            margin-top: 50px;
            border-top: 1px solid var(--border);
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: var(--muted);
          }

          @media print {
            body {
              padding: 0;
              background: transparent;
            }
            .page-break {
              page-break-before: always;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div class="logo-container">
            <h1>SGFP<span>.</span></h1>
            <p>Sistema de Gestão Financeira Pessoal</p>
          </div>
          <div class="report-meta">
            <h2>Relatório Financeiro</h2>
            <p>Período: <strong>${formattedMonth}</strong></p>
            <p>Exportado em: ${new Date().toLocaleDateString('pt-AO')} ${new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}</p>
            
            <div class="user-badge">
              <div>${userName}</div>
              <span>${userEmail}</span>
            </div>
          </div>
        </div>

        <!-- Dashboard Summary Grid -->
        <div class="grid-3">
          <div class="kpi-card income">
            <div class="kpi-label">${tIncome}</div>
            <div class="kpi-value text-success">${formatValue(this.summary.income || 0)}</div>
          </div>
          <div class="kpi-card expense">
            <div class="kpi-label">${tExpense}</div>
            <div class="kpi-value text-error">${formatValue(this.summary.expense || 0)}</div>
          </div>
          <div class="kpi-card balance">
            <div class="kpi-label">${tBalance}</div>
            <div class="kpi-value ${this.summary.balance >= 0 ? 'text-success' : 'text-error'}">${formatValue(this.summary.balance || 0)}</div>
          </div>
        </div>

        <!-- Charts side-by-side -->
        <div class="charts-container">
          ${pieImg ? `
            <div class="chart-box">
              <h3>${this.i18n.t('chart.by_category') || 'Despesas por Categoria'}</h3>
              <img class="chart-img" src="${pieImg}" alt="Pie Chart">
            </div>
          ` : ''}

          ${trendImg ? `
            <div class="chart-box">
              <h3>${this.i18n.t('chart.trend') || 'Tendência Mensal'}</h3>
              <img class="chart-img" src="${trendImg}" alt="Trend Chart">
            </div>
          ` : ''}
        </div>

        <div class="page-break"></div>

        <!-- Detailed Transactions Section -->
        <h2 class="section-title">${this.i18n.t('dash.recent_transactions') || 'Detalhamento das Transações'}</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>${tDate}</th>
                <th>${tType}</th>
                <th>${tCategory}</th>
                <th>${tDescription}</th>
                <th class="text-right">${tValue}</th>
              </tr>
            </thead>
            <tbody>
              ${transactionsHtml}
            </tbody>
          </table>
        </div>

        <!-- Print Page Footer -->
        <div class="footer">
          <div>SGFP — Relatório Financeiro Inteligente</div>
          <div>Gerado automaticamente em ${new Date().toLocaleDateString('pt-AO')}</div>
        </div>

        <script>
          window.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
              window.print();
            }, 600);
          });
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
    this.toast.success(this.i18n.t('report.pdf_exported'));
  }
}
