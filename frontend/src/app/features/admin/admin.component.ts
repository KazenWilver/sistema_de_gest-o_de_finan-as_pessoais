import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgFor } from '@angular/common';
import { JsonPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.types';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgFor, JsonPipe, TranslateModule],
  template: `
    <h1>{{ 'ADM.TITLE' | translate }}</h1>
    <h3>{{ 'ADM.STATS' | translate }}</h3>
    <pre>{{ stats | json }}</pre>
    <h3>{{ 'ADM.USERS' | translate }}</h3>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>Papel</th>
          <th>Moeda</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of users">
          <td>{{ u.id }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ u.base_currency }}</td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [
    `
      pre {
        background: var(--surface-2);
        padding: 0.75rem;
        border-radius: 8px;
        border: 1px solid var(--border);
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        padding: 0.45rem;
        border-bottom: 1px solid var(--border);
        text-align: left;
      }
    `,
  ],
})
export class AdminComponent {
  private http = inject(HttpClient);
  users: any[] = [];
  stats: any;

  constructor() {
    this.http.get<ApiEnvelope<{ users: any[] }>>(`${environment.apiUrl}/admin/users`).subscribe((res) => {
      if (res.status === 'success') {
        this.users = res.data.users;
      }
    });
    this.http.get<ApiEnvelope<any>>(`${environment.apiUrl}/admin/stats`).subscribe((res) => {
      if (res.status === 'success') {
        this.stats = res.data;
      }
    });
  }
}
