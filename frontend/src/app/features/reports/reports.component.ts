import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';

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
  maxCatValue = 1;
  loading = true;

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.getReportSummary(this.month).subscribe({ next: d => this.summary = d, error: () => {} });
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
      },
      error: () => { this.loading = false; }
    });
  }

  getBarWidth(val: number): number { return (val / this.maxCatValue) * 100; }
  formatCurrency(v: number): string { return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v); }

  exportCsv(): void {
    this.api.exportCsv({ from: this.month + '-01' }).subscribe({
      next: blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'relatorio.csv'; a.click(); URL.revokeObjectURL(a.href); this.toast.success('CSV exportado!'); },
      error: () => this.toast.error(this.i18n.t('toast.error'))
    });
  }

  exportPdf(): void {
    this.api.exportPdf({ month: this.month }).subscribe({
      next: blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'relatorio.pdf'; a.click(); URL.revokeObjectURL(a.href); this.toast.success('PDF exportado!'); },
      error: () => this.toast.error(this.i18n.t('toast.error'))
    });
  }
}
