import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.types';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule, NgFor, TranslateModule],
  template: `
    <h1>{{ 'CAT.TITLE' | translate }}</h1>
    <form class="row" (ngSubmit)="add()">
      <input [(ngModel)]="name" name="n" placeholder="Nome" />
      <select [(ngModel)]="type" name="t">
        <option value="income">income</option>
        <option value="expense">expense</option>
      </select>
      <input [(ngModel)]="color" name="c" placeholder="#hex cor" />
      <button type="submit">{{ 'COMMON.SAVE' | translate }}</button>
    </form>
    <table>
      <tr *ngFor="let c of items">
        <td>{{ c.name }}</td>
        <td>{{ c.type }}</td>
        <td><span class="swatch" [style.background]="c.color"></span></td>
        <td><button type="button" (click)="del(c.id)">{{ 'COMMON.DELETE' | translate }}</button></td>
      </tr>
    </table>
  `,
  styles: [
    `
      .row {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
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
      table {
        width: 100%;
        border-collapse: collapse;
      }
      td {
        border-bottom: 1px solid var(--border);
        padding: 0.4rem;
      }
      .swatch {
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        border: 1px solid var(--border);
      }
    `,
  ],
})
export class CategoriesComponent {
  private http = inject(HttpClient);
  items: any[] = [];
  name = '';
  type: 'income' | 'expense' = 'expense';
  color = '#3b82f6';

  constructor() {
    this.load();
  }

  load(): void {
    this.http.get<ApiEnvelope<{ categories: any[] }>>(`${environment.apiUrl}/categories`).subscribe((res) => {
      if (res.status === 'success') {
        this.items = res.data.categories;
      }
    });
  }

  add(): void {
    this.http
      .post<ApiEnvelope<any>>(`${environment.apiUrl}/categories`, {
        name: this.name,
        type: this.type,
        color: this.color,
      })
      .subscribe(() => {
        this.name = '';
        this.load();
      });
  }

  del(id: number): void {
    if (!confirm('Apagar?')) {
      return;
    }
    this.http.delete(`${environment.apiUrl}/categories/${id}`).subscribe(() => this.load());
  }
}
