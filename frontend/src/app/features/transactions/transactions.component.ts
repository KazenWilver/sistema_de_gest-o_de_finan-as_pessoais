import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { ConfirmService } from '../../core/confirm.service';
import { Transaction, Account, Category } from '../../core/models';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  accounts: Account[] = [];
  categories: Category[] = [];
  total = 0;
  page = 1;
  limit = 15;
  showModal = false;
  editMode = false;
  loading = true;
  saving = false;

  filterType = '';
  filterCategory = '';
  filterFrom = '';
  filterTo = '';

  form: any = { type: 'expense', amount: null, description: '', transaction_date: '', account_id: null, category_id: null, payment_method: '', notes: '' };
  errors: Record<string, boolean> = {};

  constructor(private api: ApiService, public i18n: I18nService, private toast: ToastService, private confirm: ConfirmService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    forkJoin({
      accounts: this.api.getAccounts(),
      categories: this.api.getCategories()
    }).subscribe({
      next: data => { this.accounts = data.accounts; this.categories = data.categories; this.cdr.detectChanges(); this.loadData(); },
      error: () => { this.loading = false; }
    });
  }

  loadData(): void {
    this.loading = true;
    const filters: any = { page: this.page, limit: this.limit };
    if (this.filterType) filters.type = this.filterType;
    if (this.filterCategory) filters.category_id = this.filterCategory;
    if (this.filterFrom) filters.from = this.filterFrom;
    if (this.filterTo) filters.to = this.filterTo;

    this.api.getTransactions(filters).subscribe({
      next: res => { this.transactions = res.transactions; this.total = res.total; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyFilter(): void { this.page = 1; this.loadData(); }
  clearFilters(): void { this.filterType = ''; this.filterCategory = ''; this.filterFrom = ''; this.filterTo = ''; this.applyFilter(); }

  openCreate(): void {
    this.editMode = false;
    this.errors = {};
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.form = { type: 'expense', amount: null, description: '', transaction_date: today, account_id: this.accounts[0]?.id, category_id: null, payment_method: '', notes: '' };
    this.showModal = true;
  }

  openEdit(tx: Transaction): void {
    this.editMode = true;
    this.errors = {};
    this.form = { ...tx, id: tx.id };
    this.showModal = true;
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;
    if (!this.form.description || !this.form.description.trim()) {
      this.errors['description'] = true;
      isValid = false;
    }
    if (this.form.amount === null || this.form.amount === undefined || this.form.amount <= 0) {
      this.errors['amount'] = true;
      isValid = false;
    }
    if (!this.form.transaction_date) {
      this.errors['transaction_date'] = true;
      isValid = false;
    }
    if (!this.form.account_id) {
      this.errors['account_id'] = true;
      isValid = false;
    }
    if (!this.form.category_id) {
      this.errors['category_id'] = true;
      isValid = false;
    }
    return isValid;
  }

  save(): void {
    if (!this.validateForm()) {
      this.toast.error(this.i18n.t('validation.fix_errors'));
      return;
    }
    this.saving = true;
    const obs = this.editMode ? this.api.updateTransaction(this.form.id, this.form) : this.api.createTransaction(this.form);
    obs.subscribe({
      next: () => { this.saving = false; this.showModal = false; this.loadData(); this.toast.success(this.i18n.t('toast.saved')); },
      error: (err) => {
        this.saving = false;
        if (err.error?.errors) {
          this.errors = err.error.errors;
        }
        this.toast.error(err.error?.message || this.i18n.t('toast.error'));
      }
    });
  }

  async delete(id: number): Promise<void> {
    const ok = await this.confirm.confirm({ title: this.i18n.t('confirm.delete_title'), message: this.i18n.t('tx.delete_confirm'), type: 'danger', confirmText: this.i18n.t('common.delete') });
    if (ok) this.api.deleteTransaction(id).subscribe({ next: () => { this.loadData(); this.toast.success(this.i18n.t('toast.deleted')); }, error: () => this.toast.error(this.i18n.t('toast.error')) });
  }

  get filteredCategories(): Category[] { return this.categories.filter(c => !this.form.type || c.type === this.form.type); }
  get totalPages(): number { return Math.ceil(this.total / this.limit); }
  nextPage(): void { if (this.page < this.totalPages) { this.page++; this.loadData(); } }
  prevPage(): void { if (this.page > 1) { this.page--; this.loadData(); } }

  formatCurrency(val: number): string { return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(val); }

  exportCsv(): void {
    this.api.exportCsv({ from: this.filterFrom, to: this.filterTo, type: this.filterType }).subscribe(blob => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'transacoes.csv'; a.click(); URL.revokeObjectURL(a.href);
    });
  }
}
