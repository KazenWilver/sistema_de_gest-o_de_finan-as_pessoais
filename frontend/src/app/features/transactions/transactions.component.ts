import { Component, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.types';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, TranslateModule],
  template: `
    <h1>{{ 'TX.TITLE' | translate }}</h1>
    <div class="filters">
      <input type="date" [(ngModel)]="from" />
      <input type="date" [(ngModel)]="to" />
      <select [(ngModel)]="type">
        <option value="">— tipo —</option>
        <option value="income">income</option>
        <option value="expense">expense</option>
      </select>
      <button type="button" (click)="load()">{{ 'COMMON.FILTER' | translate }}</button>
    </div>
    <form class="form" (ngSubmit)="create()">
      <h3>{{ 'TX.NEW' | translate }}</h3>
      <select [(ngModel)]="form.category_id" name="cat" required>
        <option *ngFor="let c of categories" [value]="c.id">{{ c.name }} ({{ c.type }})</option>
      </select>
      <select [(ngModel)]="form.type" name="ft">
        <option value="income">income</option>
        <option value="expense">expense</option>
      </select>
      <input type="number" step="0.01" [(ngModel)]="form.amount" name="amt" placeholder="Montante" />
      <input [(ngModel)]="form.currency_code" name="cur" maxlength="3" placeholder="EUR" />
      <input type="date" [(ngModel)]="form.trans_date" name="dt" />
      <input [(ngModel)]="form.description" name="desc" placeholder="Descrição" />
      <button type="submit">{{ 'COMMON.SAVE' | translate }}</button>
      <span class="warn" *ngIf="warn.length">{{ warn.join('; ') }}</span>
    </form>
    <table *ngIf="items.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Data</th>
          <th>Tipo</th>
          <th>Montante</th>
          <th>Base</th>
          <th>Categoria</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let t of items">
          <td>{{ t.id }}</td>
          <td>{{ t.trans_date }}</td>
          <td>{{ t.type }}</td>
          <td>{{ t.amount }} {{ t.currency_code }}</td>
          <td>{{ t.amount_base }}</td>
          <td>{{ t.category_name }}</td>
          <td><button type="button" (click)="remove(t.id)">{{ 'COMMON.DELETE' | translate }}</button></td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [
    `
      .filters,
      .form {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
        align-items: center;
      }
      input,
      select,
      button {
        padding: 0.4rem 0.55rem;
        border-radius: 6px;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        border-bottom: 1px solid var(--border);
        padding: 0.45rem;
        text-align: left;
      }
      .warn {
        color: var(--warn, #f59e0b);
      }
    `,
  ],
})
export class TransactionsComponent {
  private http = inject(HttpClient);
  items: any[] = [];
  categories: any[] = [];
  from = '';
  to = '';
  type = '';
  warn: string[] = [];
  form: any = {
    category_id: '',
    type: 'expense',
    amount: '',
    currency_code: 'EUR',
    trans_date: new Date().toISOString().slice(0, 10),
    description: '',
  };

  constructor() {
    const d = new Date();
    this.from = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
    this.to = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
    this.loadCategories();
    this.load();
  }

  loadCategories(): void {
    this.http.get<ApiEnvelope<{ categories: any[] }>>(`${environment.apiUrl}/categories`).subscribe((res) => {
      if (res.status === 'success') {
        this.categories = res.data.categories;
        if (!this.form.category_id && this.categories.length) {
          this.form.category_id = this.categories[0].id;
        }
      }
    });
  }

  load(): void {
    let p = new HttpParams().set('page', '1').set('per_page', '50');
    if (this.from) {
      p = p.set('from', this.from);
    }
    if (this.to) {
      p = p.set('to', this.to);
    }
    if (this.type) {
      p = p.set('type', this.type);
    }
    this.http.get<ApiEnvelope<any>>(`${environment.apiUrl}/transactions`, { params: p }).subscribe((res) => {
      if (res.status === 'success') {
        this.items = res.data.items;
      }
    });
  }

  create(): void {
    this.warn = [];
    const body = { ...this.form, category_id: Number(this.form.category_id) };
    this.http.post<ApiEnvelope<any>>(`${environment.apiUrl}/transactions`, body).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.warn = res.data.warnings ?? [];
          this.load();
        }
      },
      error: (e) => alert(e?.error?.message ?? 'Erro'),
    });
  }

  remove(id: number): void {
    if (!confirm('Apagar?')) {
      return;
    }
    this.http.delete<ApiEnvelope<null>>(`${environment.apiUrl}/transactions/${id}`).subscribe(() => this.load());
  }
}
