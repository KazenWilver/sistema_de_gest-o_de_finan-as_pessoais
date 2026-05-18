import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.types';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [FormsModule, NgFor, TranslateModule],
  template: `
    <h1>{{ 'GOALS.TITLE' | translate }}</h1>
    <form class="row" (ngSubmit)="create()">
      <input [(ngModel)]="name" placeholder="Nome" name="n" />
      <input type="number" step="0.01" [(ngModel)]="target" placeholder="Alvo" name="t" />
      <input type="date" [(ngModel)]="deadline" name="d" />
      <button type="submit">{{ 'COMMON.SAVE' | translate }}</button>
    </form>
    <table>
      <tr *ngFor="let g of items">
        <td>{{ g.name }}</td>
        <td>{{ g.current_amount }} / {{ g.target_amount }}</td>
        <td>{{ g.deadline }}</td>
        <td>
          <input type="number" step="0.01" #amt />
          <button type="button" (click)="add(g.id, amt.value)">{{ 'GOALS.ADD' | translate }}</button>
        </td>
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
        padding: 0.45rem;
      }
    `,
  ],
})
export class GoalsComponent {
  private http = inject(HttpClient);
  items: any[] = [];
  name = '';
  target = '';
  deadline = '';

  constructor() {
    this.load();
  }

  load(): void {
    this.http.get<ApiEnvelope<{ goals: any[] }>>(`${environment.apiUrl}/goals`).subscribe((res) => {
      if (res.status === 'success') {
        this.items = res.data.goals;
      }
    });
  }

  create(): void {
    this.http
      .post(`${environment.apiUrl}/goals`, {
        name: this.name,
        target_amount: this.target,
        deadline: this.deadline || null,
      })
      .subscribe(() => {
        this.name = '';
        this.target = '';
        this.deadline = '';
        this.load();
      });
  }

  add(id: number, amount: string): void {
    this.http.post(`${environment.apiUrl}/goals/${id}/contribute`, { amount }).subscribe(() => this.load());
  }
}
