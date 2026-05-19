import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title">{{ i18n.t('admin.title') }}</h1><p class="page-subtitle">{{ i18n.t('admin.subtitle') }}</p></div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">{{ i18n.t('admin.users') }}</h2>
        </div>
        <div class="table-container" *ngIf="!loading && users.length > 0">
          <table>
            <thead><tr><th>ID</th><th>{{ i18n.t('auth.name') }}</th><th>{{ i18n.t('auth.email') }}</th><th>{{ i18n.t('admin.role') }}</th><th>{{ i18n.t('admin.status') }}</th><th></th></tr></thead>
            <tbody>
              @for (u of users; track u.id; let i = $index) {
                <tr class="row-animate" [style.animation-delay]="i * 30 + 'ms'">
                  <td class="caption">{{ u.id }}</td>
                  <td class="fw-700">{{ u.name }}</td>
                  <td>{{ u.email }}</td>
                  <td>
                    <select class="form-select" [ngModel]="u.role" (ngModelChange)="changeRole(u, $event)" style="width:auto;height:36px;font-size:12px;padding:6px 10px">
                      <option value="user">User</option><option value="admin">Admin</option>
                    </select>
                  </td>
                  <td><span class="badge" [ngClass]="u.is_active ? 'badge-income' : 'badge-expense'">{{ u.is_active ? 'Activo' : 'Inactivo' }}</span></td>
                  <td>
                    <button class="btn btn-ghost btn-sm" (click)="toggleActive(u)">{{ u.is_active ? '🔒' : '🔓' }}</button>
                    <button class="btn btn-ghost btn-sm" (click)="deleteUser(u)">🗑️</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div *ngIf="loading"><div class="skeleton" style="height:200px"></div></div>
      </div>
    </div>
  `,
  styles: [`.row-animate { animation: fadeSlideUp 0.3s ease backwards; }`]
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  loading = true;

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService, private confirm: ConfirmService) {}
  ngOnInit(): void { this.load(); }

  load(): void { this.loading = true; this.api.getUsers().subscribe({ next: d => { this.users = d; this.loading = false; }, error: () => { this.loading = false; } }); }

  changeRole(u: any, role: string): void {
    this.api.updateUserRole(u.id, role).subscribe({
      next: () => { u.role = role; this.toast.success('Role actualizado'); },
      error: () => this.toast.error(this.i18n.t('toast.error'))
    });
  }

  toggleActive(u: any): void {
    this.api.toggleUserActive(u.id).subscribe({
      next: () => { u.is_active = !u.is_active; this.toast.success('Estado actualizado'); },
      error: () => this.toast.error(this.i18n.t('toast.error'))
    });
  }

  async deleteUser(u: any): Promise<void> {
    const ok = await this.confirm.confirm({ title: this.i18n.t('confirm.delete_title'), message: 'Eliminar utilizador ' + u.name + '?', type: 'danger', confirmText: this.i18n.t('common.delete') });
    if (ok) this.api.deleteUser(u.id).subscribe({ next: () => { this.load(); this.toast.success(this.i18n.t('toast.deleted')); }, error: () => this.toast.error(this.i18n.t('toast.error')) });
  }
}
