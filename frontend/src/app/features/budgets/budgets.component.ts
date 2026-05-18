import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.types';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, TranslateModule, JsonPipe],
  template: `
    <h1>{{ 'BUD.TITLE' | translate }}</h1>
    <form class="row" (ngSubmit)="create()">
      <input type="number" step="0.01" [(ngModel)]="amount" name="a" placeholder="Limite" />
      <input type="date" [(ngModel)]="start" name="s" />
      <input type="date" [(ngModel)]="end" name="e" />
      <select [(ngModel)]="category_id" name="c">
        <option [ngValue]="null">Global</option>
        <option *ngFor="let c of expenseCats" [ngValue]="c.id">{{ c.name }}</option>
      </select>
      <button type="submit">{{ 'COMMON.SAVE' | translate }}</button>
    </form>
    <div class="list">
      <div class="card" *ngFor="let b of items">
        <div class="h">
          <strong>{{ b.category_name || 'Global' }}</strong>
          <span>{{ b.period_start }} → {{ b.period_end }}</span>
        </div>
        <div>Limite: {{ b.amount }}</div>
        <button type="button" (click)="loadProgress(b.id)">{{ 'BUD.PROGRESS' | translate }}</button>
        <pre *ngIf="progress[b.id] as pr">{{ pr | json }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      input,
      select,
      button {
        padding: 0.35rem 0.5rem;
        border-radius: 6px;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
      }
      .list {
        display: grid;
        gap: 0.75rem;
      }
      .card {
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 0.75rem;
        background: var(--surface-2);
      }
      .h {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.35rem;
      }
      pre {
        white-space: pre-wrap;
        font-size: 0.85rem;
      }
    `,
  ],
})
export class BudgetsComponent {
  private http = inject(HttpClient);
  items: any[] = [];
  expenseCats: any[] = [];
  amount = '';
  start = '';
  end = '';
  category_id: number | null = null;
  progress: Record<number, any> = {};

  constructor() {
    const d = new Date();
    this.start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
    this.end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
    this.loadCats();
    this.load();
  }

  loadCats(): void {
    this.http.get<ApiEnvelope<{ categories: any[] }>>(`${environment.apiUrl}/categories`).subscribe((res) => {
      if (res.status === 'success') {
        this.expenseCats = res.data.categories.filter((c) => c.type === 'expense');
      }
    });
  }

  load(): void {
    this.http.get<ApiEnvelope<{ budgets: any[] }>>(`${environment.apiUrl}/budgets`).subscribe((res) => {
      if (res.status === 'success') {
        this.items = res.data.budgets;
      }
    });
  }

  create(): void {
    const body: any = { amount: this.amount, period_start: this.start, period_end: this.end };
    if (this.category_id) {
      body.category_id = this.category_id;
    }
    this.http.post(`${environment.apiUrl}/budgets`, body).subscribe(() => this.load());
  }

  loadProgress(id: number): void {
    this.http.get<ApiEnvelope<any>>(`${environment.apiUrl}/budgets/${id}/progress`).subscribe((res) => {
      if (res.status === 'success') {
        this.progress[id] = res.data;
      }
    });
  }
}
