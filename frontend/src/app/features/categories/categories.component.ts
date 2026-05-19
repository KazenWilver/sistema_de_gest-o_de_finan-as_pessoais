import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';
import { Category } from '../../core/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title">{{ i18n.t('cat.title') }}</h1><p class="page-subtitle">{{ i18n.t('cat.subtitle') }}</p></div>
        <button class="btn btn-primary" (click)="openCreate()">+ {{ i18n.t('cat.new') }}</button>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab==='income'" (click)="activeTab='income'">{{ i18n.t('cat.incomes') }}</button>
        <button class="tab" [class.active]="activeTab==='expense'" (click)="activeTab='expense'">{{ i18n.t('cat.expenses') }}</button>
      </div>

      <div class="grid grid-4" *ngIf="!loading">
        @for (cat of filtered; track cat.id; let i = $index) {
          <div class="card card-hover cat-card" [style.animation-delay]="i * 40 + 'ms'">
            <div class="cat-icon" [style.background]="cat.color + '18'" [style.color]="cat.color">{{ cat.icon }}</div>
            <h3 class="cat-name">{{ cat.name }}</h3>
            <span class="badge" [ngClass]="cat.type === 'income' ? 'badge-income' : 'badge-expense'">
              {{ cat.type === 'income' ? i18n.t('tx.income') : i18n.t('tx.expense') }}
            </span>
            <div class="cat-actions" *ngIf="!cat.is_default">
              <button class="btn btn-ghost btn-sm" (click)="openEdit(cat)">✏️</button>
              <button class="btn btn-ghost btn-sm" (click)="delete(cat)">🗑️</button>
            </div>
            <div class="cat-default" *ngIf="cat.is_default">{{ i18n.t('cat.default') }}</div>
          </div>
        }
      </div>

      <div class="grid grid-4" *ngIf="loading">
        <div class="card" *ngFor="let i of [1,2,3,4]"><div class="skeleton" style="height:100px"></div></div>
      </div>

      <div class="modal-backdrop" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ editMode ? i18n.t('common.edit') : i18n.t('cat.new') }}</h3>
            <button class="modal-close" (click)="showModal = false">✕</button>
          </div>
          <div class="form-group"><label class="form-label">{{ i18n.t('acc.name') }}</label><input class="form-input" [(ngModel)]="form.name"></div>
          <div class="form-group"><label class="form-label">{{ i18n.t('tx.type') }}</label>
            <select class="form-select" [(ngModel)]="form.type"><option value="income">{{ i18n.t('tx.income') }}</option><option value="expense">{{ i18n.t('tx.expense') }}</option></select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ i18n.t('cat.color') }}</label>
            <div class="color-picker-row">
              <div class="color-swatch" *ngFor="let c of presetColors" [style.background]="c"
                   [class.selected]="form.color === c" (click)="form.color = c"></div>
              <input type="color" [(ngModel)]="form.color" class="color-input-native">
            </div>
          </div>
          <div class="form-group"><label class="form-label">{{ i18n.t('cat.icon') }}</label>
            <div class="icon-picker-row">
              <button class="icon-btn" *ngFor="let ic of presetIcons" [class.selected]="form.icon === ic" (click)="form.icon = ic">{{ ic }}</button>
            </div>
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
    .cat-card { text-align: center; padding: var(--sp-lg); animation: fadeSlideUp 0.3s ease backwards; }
    .cat-icon { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto var(--sp-sm); }
    .cat-name { font-size: 16px; font-weight: 700; margin-bottom: var(--sp-xs); color: var(--color-ink); }
    .cat-actions { margin-top: var(--sp-sm); display: flex; justify-content: center; gap: var(--sp-xs); }
    .cat-default { font-size: 11px; color: var(--color-muted); margin-top: var(--sp-sm); font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .color-picker-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .color-swatch { width: 32px; height: 32px; cursor: pointer; border: 2px solid transparent; transition: all var(--ease-fast); }
    .color-swatch.selected { border-color: var(--color-ink); transform: scale(1.15); }
    .color-swatch:hover { transform: scale(1.1); }
    .color-input-native { width: 32px; height: 32px; border: 1px solid var(--color-hairline); cursor: pointer; padding: 0; }
    .icon-picker-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .icon-btn { width: 40px; height: 40px; border: 1px solid var(--color-hairline); background: var(--color-canvas); cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: all var(--ease-fast); }
    .icon-btn.selected { border-color: var(--color-ink); background: var(--color-surface-soft); }
    .icon-btn:hover { border-color: var(--color-ink); }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  activeTab: 'income' | 'expense' = 'expense';
  showModal = false; editMode = false; loading = true;
  form: any = { name: '', type: 'expense', icon: '📦', color: '#1c69d4' };

  presetColors = ['#1c69d4', '#22c55e', '#f59e0b', '#dc2626', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#64748b'];
  presetIcons = ['💰', '🏠', '🚗', '🍔', '🎓', '💊', '🎮', '✈️', '👕', '📱', '🛒', '📦', '💼', '🎁', '⚡', '💧'];

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService, private confirm: ConfirmService) {}
  ngOnInit(): void { this.load(); }

  load(): void { this.loading = true; this.api.getCategories().subscribe({ next: d => { this.categories = d; this.loading = false; }, error: () => { this.loading = false; } }); }
  get filtered(): Category[] { return this.categories.filter(c => c.type === this.activeTab); }

  openCreate(): void { this.editMode = false; this.form = { name: '', type: this.activeTab, icon: '📦', color: '#1c69d4' }; this.showModal = true; }
  openEdit(c: Category): void { this.editMode = true; this.form = { ...c }; this.showModal = true; }

  save(): void {
    const obs = this.editMode ? this.api.updateCategory(this.form.id, this.form) : this.api.createCategory(this.form);
    obs.subscribe({ next: () => { this.showModal = false; this.load(); this.toast.success(this.i18n.t('toast.saved')); }, error: () => this.toast.error(this.i18n.t('toast.error')) });
  }

  async delete(c: Category): Promise<void> {
    const ok = await this.confirm.confirm({ title: this.i18n.t('confirm.delete_title'), message: this.i18n.t('cat.delete_confirm'), type: 'danger', confirmText: this.i18n.t('common.delete') });
    if (ok) this.api.deleteCategory(c.id).subscribe({ next: () => { this.load(); this.toast.success(this.i18n.t('toast.deleted')); }, error: (e) => this.toast.error(e.error?.message || this.i18n.t('toast.error')) });
  }
}
