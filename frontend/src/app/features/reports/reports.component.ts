import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

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

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getReportSummary(this.month).subscribe(d => this.summary = d);
    const from = this.month + '-01';
    const y = parseInt(this.month.split('-')[0]);
    const m = parseInt(this.month.split('-')[1]);
    const to = new Date(y, m, 0).toISOString().split('T')[0];
    this.api.getReportByCategory(from, to).subscribe(d => {
      this.categoryData = d;
      const vals = d.filter((i: any) => i.type === 'expense').map((i: any) => i.total);
      this.maxCatValue = Math.max(...vals, 1);
    });
  }

  getBarWidth(val: number): number { return (val / this.maxCatValue) * 100; }
  formatCurrency(v: number): string {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v);
  }

  exportCsv(): void {
    this.api.exportCsv({ from: this.month + '-01' }).subscribe(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'relatorio.csv';
      a.click();
    });
  }

  exportPdf(): void {
    this.api.exportPdf({ month: this.month }).subscribe(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'relatorio.pdf';
      a.click();
    });
  }
}
