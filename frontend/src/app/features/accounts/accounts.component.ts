import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';
import { Account } from '../../core/models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title">{{ i18n.t('acc.title') }}</h1><p class="page-subtitle">{{ i18n.t('acc.subtitle') }}</p></div>
        <button class="btn btn-primary" (click)="openCreate()">+ {{ i18n.t('acc.new') }}</button>
      </div>

      <div class="grid grid-4" *ngIf="!loading">
        @for (acc of accounts; track acc.id; let i = $index) {
          <div class="card card-hover acc-card" [style.animation-delay]="i * 50 + 'ms'">
            <div class="acc-type">{{ getTypeLabel(acc.type) }}</div>
            <h3 class="acc-name">{{ acc.name }}</h3>
            <div class="acc-balance" [class.text-success]="(acc.balance||0) >= 0" [class.text-error]="(acc.balance||0) < 0">
              {{ formatCurrency(acc.balance || 0) }}
            </div>
            <div class="acc-currency">{{ acc.currency }}</div>
            <div class="acc-actions">
              <button class="btn btn-ghost btn-sm" (click)="openEdit(acc)">✏️</button>
              <button class="btn btn-ghost btn-sm" (click)="delete(acc)">🗑️</button>
            </div>
          </div>
        }
      </div>

      <div class="grid grid-4" *ngIf="loading">
        <div class="card" *ngFor="let i of [1,2,3]"><div class="skeleton" style="height:120px"></div></div>
      </div>

      <div *ngIf="!loading && accounts.length === 0" class="empty-state">
        <div class="empty-state-icon">🏦</div>
        <p class="empty-state-text">{{ i18n.t('acc.empty') }}</p>
        <p class="empty-state-hint">{{ i18n.t('acc.empty_hint') }}</p>
      </div>

      <div class="modal-backdrop" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ editMode ? i18n.t('common.edit') : i18n.t('acc.new') }}</h3>
            <button class="modal-close" (click)="showModal = false">✕</button>
          </div>
          <div class="form-group"><label class="form-label" for="acc-name">{{ i18n.t('acc.name') }}</label><input class="form-input" id="acc-name" name="name" [(ngModel)]="form.name"></div>
          <div class="form-group"><label class="form-label">{{ i18n.t('acc.type') }}</label>
            <select class="form-select" id="acc-type" name="type" [(ngModel)]="form.type">
              <option value="cash">{{ i18n.t('acc.cash') }}</option><option value="bank">{{ i18n.t('acc.bank') }}</option>
              <option value="mobile_money">{{ i18n.t('acc.mobile') }}</option><option value="savings">{{ i18n.t('acc.savings') }}</option>
              <option value="other">{{ i18n.t('acc.other') }}</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">{{ i18n.t('acc.currency') }}</label>
            <select class="form-select" id="acc-currency" name="currency" [(ngModel)]="form.currency">
              <option value="AOA">AOA</option><option value="USD">USD</option><option value="EUR">EUR</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="showModal = false">{{ i18n.t('common.cancel') }}</button>
            <button class="btn btn-primary" (click)="save()">{{ editMode ? i18n.t('common.save') : i18n.t('common.create') }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .acc-card { text-align: center; padding: var(--sp-lg); animation: fadeSlideUp 0.3s ease backwards; }
    .acc-type { font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--color-muted); }
    .acc-name { font-size: 18px; font-weight: 700; margin: var(--sp-sm) 0; color: var(--color-ink); }
    .acc-balance { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
    .acc-currency { font-size: 13px; color: var(--color-muted); margin-top: 4px; }
    .acc-actions { margin-top: var(--sp-md); display: flex; justify-content: center; gap: var(--sp-xs); }
  `]
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  showModal = false; editMode = false; loading = true;
  form: any = { name: '', type: 'cash', currency: 'AOA' };

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService, private confirm: ConfirmService) {}
  ngOnInit(): void { this.load(); }

  load(): void { this.loading = true; this.api.getAccounts().subscribe({ next: d => { this.accounts = d; this.loading = false; }, error: () => { this.loading = false; } }); }

  openCreate(): void { this.editMode = false; this.form = { name: '', type: 'cash', currency: 'AOA' }; this.showModal = true; }
  openEdit(a: Account): void { this.editMode = true; this.form = { ...a }; this.showModal = true; }

  save(): void {
    const obs = this.editMode ? this.api.updateAccount(this.form.id, this.form) : this.api.createAccount(this.form);
    obs.subscribe({ next: () => { this.showModal = false; this.load(); this.toast.success(this.i18n.t('toast.saved')); }, error: () => this.toast.error(this.i18n.t('toast.error')) });
  }

  async delete(a: Account): Promise<void> {
    const ok = await this.confirm.confirm({ title: this.i18n.t('confirm.delete_title'), message: this.i18n.t('acc.delete_confirm'), type: 'danger', confirmText: this.i18n.t('common.delete') });
    if (ok) this.api.deleteAccount(a.id).subscribe({ next: () => { this.load(); this.toast.success(this.i18n.t('toast.deleted')); }, error: (e) => this.toast.error(e.error?.message || this.i18n.t('toast.error')) });
  }

  getTypeLabel(t: string): string {
    const k: Record<string, string> = { cash: 'acc.cash', bank: 'acc.bank', mobile_money: 'acc.mobile', savings: 'acc.savings', other: 'acc.other' };
    return this.i18n.t(k[t] || t);
  }

  formatCurrency(v: number): string { return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v); }
}
