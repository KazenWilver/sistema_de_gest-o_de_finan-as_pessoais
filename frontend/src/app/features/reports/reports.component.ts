import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.types';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [FormsModule, NgIf, TranslateModule],
  template: `
    <h1>{{ 'REP.TITLE' | translate }}</h1>
    <div class="row">
      <input type="date" [(ngModel)]="from" />
      <input type="date" [(ngModel)]="to" />
      <button type="button" (click)="load()">{{ 'COMMON.FILTER' | translate }}</button>
    </div>
    <div class="grid" *ngIf="summary">
      <div class="card">
        <div>Receitas</div>
        <strong>{{ summary.totals.income }}</strong>
      </div>
      <div class="card">
        <div>Despesas</div>
        <strong>{{ summary.totals.expense }}</strong>
      </div>
      <div class="card">
        <div>Saldo</div>
        <strong>{{ summary.totals.balance }}</strong>
      </div>
    </div>
    <div class="charts">
      <canvas #trendEl height="140"></canvas>
      <canvas #catEl height="140"></canvas>
    </div>
    <div class="export">
      <button type="button" (click)="download('csv')">CSV</button>
      <button type="button" (click)="download('pdf')">PDF</button>
    </div>
  `,
  styles: [
    `
      .row {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin: 1rem 0;
      }
      input,
      button {
        padding: 0.35rem 0.5rem;
        border-radius: 6px;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.75rem;
      }
      .card {
        padding: 0.75rem;
        border-radius: 10px;
        border: 1px solid var(--border);
        background: var(--surface-2);
      }
      .charts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1rem;
      }
      .export {
        margin-top: 1rem;
        display: flex;
        gap: 0.75rem;
      }
    `,
  ],
})
export class ReportsComponent implements AfterViewInit {
  private http = inject(HttpClient);
  from = '';
  to = '';
  summary: any;
  trend: any;
  byCat: any;
  @ViewChild('trendEl') trendEl?: ElementRef<HTMLCanvasElement>;
  @ViewChild('catEl') catEl?: ElementRef<HTMLCanvasElement>;
  private trendChart?: Chart;
  private catChart?: Chart;

  constructor() {
    Chart.register(...registerables);
    const d = new Date();
    this.from = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
    this.to = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
    this.load();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.draw(), 0);
  }

  download(kind: 'csv' | 'pdf'): void {
    const params: any = { from: this.from, to: this.to };
    const ext = kind === 'csv' ? 'csv' : 'pdf';
    const mime = kind === 'csv' ? 'text/csv' : 'application/pdf';
    this.http
      .get(`${environment.apiUrl}/export/${kind}`, { params, responseType: 'blob', observe: 'response' })
      .subscribe({
        next: (resp) => {
          const blob = new Blob([resp.body as BlobPart], { type: mime });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `sgfp.${ext}`;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: () => alert('Falha na exportação'),
      });
  }

  load(): void {
    const q = { from: this.from, to: this.to };
    this.http.get<ApiEnvelope<any>>(`${environment.apiUrl}/reports/summary`, { params: q }).subscribe((res) => {
      if (res.status === 'success') {
        this.summary = res.data;
      }
    });
    this.http.get<ApiEnvelope<any>>(`${environment.apiUrl}/reports/trend`, { params: q }).subscribe((res) => {
      if (res.status === 'success') {
        this.trend = res.data;
        setTimeout(() => this.draw(), 0);
      }
    });
    this.http.get<ApiEnvelope<any>>(`${environment.apiUrl}/reports/by-category`, { params: q }).subscribe((res) => {
      if (res.status === 'success') {
        this.byCat = res.data;
        setTimeout(() => this.draw(), 0);
      }
    });
  }

  private draw(): void {
    const s = this.trend?.series ?? [];
    if (this.trendEl?.nativeElement && s.length) {
      this.trendChart?.destroy();
      this.trendChart = new Chart(this.trendEl.nativeElement, {
        type: 'line',
        data: {
          labels: s.map((x: any) => x.day),
          datasets: [
            { label: 'Receitas', data: s.map((x: any) => parseFloat(x.income)), tension: 0.25 },
            { label: 'Despesas', data: s.map((x: any) => parseFloat(x.expense)), tension: 0.25 },
          ],
        },
        options: { responsive: true },
      });
    }
    const br = this.byCat?.breakdown ?? [];
    if (this.catEl?.nativeElement && br.length) {
      this.catChart?.destroy();
      this.catChart = new Chart(this.catEl.nativeElement, {
        type: 'bar',
        data: {
          labels: br.map((x: any) => x.name),
          datasets: [{ label: 'Total', data: br.map((x: any) => parseFloat(x.total)) }],
        },
        options: { responsive: true, plugins: { legend: { display: false } } },
      });
    }
  }
}
