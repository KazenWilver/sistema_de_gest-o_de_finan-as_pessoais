import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';
import { Budget, Category } from '../../core/models';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title">{{ i18n.t('budget.title') }}</h1><p class="page-subtitle">{{ i18n.t('budget.subtitle') }}</p></div>
        <button class="btn btn-primary" (click)="openCreate()">+ {{ i18n.t('budget.new') }}</button>
      </div>

      <div class="grid grid-2" *ngIf="!loading">
        @for (b of budgets; track b.id; let i = $index) {
          <div class="card budget-card" [style.animation-delay]="i * 50 + 'ms'">
            <div class="budget-top">
              <div>
                <h3 class="budget-name">{{ b.name }}</h3>
                <p class="budget-cat">{{ b.category_name || i18n.t('budget.general') }} · {{ getPeriodLabel(b.period) }}</p>
              </div>
              <div class="flex gap-xs">
                <button class="btn btn-ghost btn-sm" (click)="openEdit(b)">✏️</button>
                <button class="btn btn-ghost btn-sm" (click)="delete(b)">🗑️</button>
              </div>
            </div>
            <div class="budget-amounts">
              <span class="spent">{{ formatCurrency(b.spent || 0) }}</span>
              <span class="limit">/ {{ formatCurrency(b.limit_amount) }}</span>
            </div>
            <div class="progress-bar" style="height:6px; margin:var(--sp-sm) 0">
              <div class="progress-fill" [style.width.%]="Math.min(b.percentage || 0, 100)" [style.background]="getColor(b.percentage || 0)"></div>
            </div>
            <div class="budget-meta" [style.color]="getColor(b.percentage || 0)">
              {{ b.percentage || 0 }}% {{ i18n.t('budget.used') }} · {{ b.start_date }} → {{ b.end_date }}
            </div>
          </div>
        }
      </div>

      <div class="grid grid-2" *ngIf="loading">
        <div class="card" *ngFor="let i of [1,2]"><div class="skeleton" style="height:120px"></div></div>
      </div>

      <div *ngIf="!loading && budgets.length === 0" class="empty-state">
        <div class="empty-state-icon">📊</div>
        <p class="empty-state-text">{{ i18n.t('budget.empty') }}</p>
        <p class="empty-state-hint">{{ i18n.t('budget.empty_hint') }}</p>
      </div>

      <div class="modal-backdrop" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header"><h3 class="modal-title">{{ editMode ? i18n.t('common.edit') : i18n.t('budget.new') }}</h3><button class="modal-close" (click)="showModal = false">✕</button></div>
          <div class="form-group"><label class="form-label">{{ i18n.t('acc.name') }}</label><input class="form-input" [(ngModel)]="form.name"></div>
          <div class="form-group"><label class="form-label">{{ i18n.t('budget.limit') }}</label><input class="form-input" type="number" [(ngModel)]="form.limit_amount" min="1"></div>
          <div class="form-group"><label class="form-label">{{ i18n.t('tx.category') }}</label>
            <select class="form-select" [(ngModel)]="form.category_id">
              <option [ngValue]="null">{{ i18n.t('budget.general') }}</option>
              @for (c of categories; track c.id) { <option [value]="c.id">{{ c.name }}</option> }
            </select>
          </div>
          <div class="form-group"><label class="form-label">{{ i18n.t('budget.period') }}</label>
            <select class="form-select" [(ngModel)]="form.period">
              <option value="weekly">{{ i18n.t('budget.weekly') }}</option>
              <option value="monthly">{{ i18n.t('budget.monthly') }}</option>
              <option value="yearly">{{ i18n.t('budget.yearly') }}</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">{{ i18n.t('budget.start') }}</label><input class="form-input" type="date" [(ngModel)]="form.start_date"></div>
          <div class="form-group"><label class="form-label">{{ i18n.t('budget.end') }}</label><input class="form-input" type="date" [(ngModel)]="form.end_date"></div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="showModal = false">{{ i18n.t('common.cancel') }}</button>
            <button class="btn btn-primary" (click)="save()">{{ editMode ? i18n.t('common.save') : i18n.t('common.create') }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .budget-card { padding: var(--sp-lg); animation: fadeSlideUp 0.3s ease backwards; }
    .budget-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .budget-name { font-size: 18px; font-weight: 700; color: var(--color-ink); }
    .budget-cat { font-size: 13px; color: var(--color-muted); margin-top: 2px; }
    .budget-amounts { margin-top: var(--sp-md); font-size: 22px; }
    .spent { font-weight: 700; color: var(--color-ink); }
    .limit { color: var(--color-muted); font-weight: 300; }
    .budget-meta { font-size: 12px; font-weight: 700; letter-spacing: 0.3px; }
  `]
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  categories: Category[] = [];
  showModal = false; editMode = false; loading = true;
  Math = Math;
  form: any = { name: '', limit_amount: null, category_id: null, period: 'monthly', start_date: '', end_date: '' };

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService, private confirm: ConfirmService) {}

  ngOnInit(): void { this.load(); this.api.getCategories('expense').subscribe(d => this.categories = d); }

  load(): void { this.loading = true; this.api.getBudgets().subscribe({ next: d => { this.budgets = d; this.loading = false; }, error: () => { this.loading = false; } }); }

  openCreate(): void {
    const now = new Date(); this.editMode = false;
    this.form = { name: '', limit_amount: null, category_id: null, period: 'monthly',
      start_date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    }; this.showModal = true;
  }

  openEdit(b: Budget): void { this.editMode = true; this.form = { ...b }; this.showModal = true; }

  save(): void {
    const obs = this.editMode ? this.api.updateBudget(this.form.id, this.form) : this.api.createBudget(this.form);
    obs.subscribe({ next: () => { this.showModal = false; this.load(); this.toast.success(this.i18n.t('toast.saved')); }, error: () => this.toast.error(this.i18n.t('toast.error')) });
  }

  async delete(b: Budget): Promise<void> {
    const ok = await this.confirm.confirm({ title: this.i18n.t('confirm.delete_title'), message: this.i18n.t('budget.delete_confirm'), type: 'danger', confirmText: this.i18n.t('common.delete') });
    if (ok) this.api.deleteBudget(b.id).subscribe({ next: () => { this.load(); this.toast.success(this.i18n.t('toast.deleted')); }, error: () => this.toast.error(this.i18n.t('toast.error')) });
  }

  getColor(p: number): string { if (p >= 90) return 'var(--color-error)'; if (p >= 70) return 'var(--color-warning)'; return 'var(--color-success)'; }
  getPeriodLabel(p: string): string { const k: Record<string, string> = { weekly: 'budget.weekly', monthly: 'budget.monthly', yearly: 'budget.yearly' }; return this.i18n.t(k[p] || p); }
  formatCurrency(v: number): string { return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v); }
}
