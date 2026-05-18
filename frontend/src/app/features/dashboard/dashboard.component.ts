import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule],
  template: `
    <h1>{{ 'DASHBOARD.TITLE' | translate }}</h1>
    <div class="grid" *ngIf="data">
      <div class="card">
        <div class="label">{{ 'DASHBOARD.INCOME' | translate }}</div>
        <div class="value">{{ data!.totals.income }} {{ data!.base_currency }}</div>
      </div>
      <div class="card">
        <div class="label">{{ 'DASHBOARD.EXPENSE' | translate }}</div>
        <div class="value">{{ data!.totals.expense }} {{ data!.base_currency }}</div>
      </div>
      <div class="card">
        <div class="label">{{ 'DASHBOARD.BALANCE' | translate }}</div>
        <div class="value">{{ data!.totals.balance }} {{ data!.base_currency }}</div>
      </div>
    </div>
    <section *ngIf="data">
      <h2>{{ 'DASHBOARD.RECENT' | translate }}</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Montante</th>
            <th>Categoria</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of data!.recent">
            <td>{{ r.trans_date }}</td>
            <td>{{ r.type }}</td>
            <td>{{ r.amount }} {{ r.currency_code }}</td>
            <td>{{ r.category_name }}</td>
          </tr>
        </tbody>
      </table>
    </section>
    <div class="charts">
      <canvas #lineCanvas height="120"></canvas>
      <canvas #pieCanvas height="120"></canvas>
    </div>
  `,
  styles: [
    `
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
        margin: 1rem 0;
      }
      .card {
        padding: 1rem;
        border-radius: 12px;
        background: var(--surface-2);
        border: 1px solid var(--border);
      }
      .label {
        font-size: 0.85rem;
        opacity: 0.8;
      }
      .value {
        font-size: 1.4rem;
        font-weight: 600;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        padding: 0.5rem;
        border-bottom: 1px solid var(--border);
        text-align: left;
      }
      .charts {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1.5rem;
      }
      @media (max-width: 900px) {
        .charts {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements AfterViewInit {
  private http = inject(HttpClient);
  data: any;
  @ViewChild('lineCanvas') lineCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas') pieCanvas?: ElementRef<HTMLCanvasElement>;
  private lineChart?: Chart;
  private pieChart?: Chart;

  constructor() {
    Chart.register(...registerables);
    this.http.get<ApiEnvelope<any>>(`${environment.apiUrl}/dashboard`).subscribe((res) => {
      if (res.status === 'success') {
        this.data = res.data;
        setTimeout(() => this.renderCharts(), 0);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderCharts(), 0);
  }

  private renderCharts(): void {
    if (!this.data?.recent?.length) {
      return;
    }
    const recent = this.data.recent as any[];
    if (this.lineCanvas?.nativeElement) {
      this.lineChart?.destroy();
      this.lineChart = new Chart(this.lineCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: recent.map((r) => r.trans_date).reverse(),
          datasets: [
            {
              label: 'Montante base',
              data: recent.map((r) => parseFloat(r.amount_base)).reverse(),
              tension: 0.3,
            },
          ],
        },
        options: { responsive: true, plugins: { legend: { display: false } } },
      });
    }
    const byCat: Record<string, number> = {};
    for (const r of recent) {
      const k = r.category_name ?? '—';
      byCat[k] = (byCat[k] ?? 0) + Math.abs(parseFloat(r.amount_base));
    }
    if (this.pieCanvas?.nativeElement) {
      this.pieChart?.destroy();
      this.pieChart = new Chart(this.pieCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(byCat),
          datasets: [{ data: Object.values(byCat) }],
        },
        options: { responsive: true },
      });
    }
  }
}
