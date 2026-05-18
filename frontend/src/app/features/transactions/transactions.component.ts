import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
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
  loading = false;

  // Filters
  filterType = '';
  filterCategory = '';
  filterFrom = '';
  filterTo = '';

  // Form
  form: any = { type: 'expense', amount: null, description: '', transaction_date: '', account_id: null, category_id: null, payment_method: '', notes: '' };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
    this.api.getAccounts().subscribe(d => this.accounts = d);
    this.api.getCategories().subscribe(d => this.categories = d);
  }

  loadData(): void {
    this.loading = true;
    const filters: any = { page: this.page, limit: this.limit };
    if (this.filterType) filters.type = this.filterType;
    if (this.filterCategory) filters.category_id = this.filterCategory;
    if (this.filterFrom) filters.from = this.filterFrom;
    if (this.filterTo) filters.to = this.filterTo;

    this.api.getTransactions(filters).subscribe(res => {
      this.transactions = res.transactions;
      this.total = res.total;
      this.loading = false;
    });
  }

  applyFilter(): void { this.page = 1; this.loadData(); }

  openCreate(): void {
    this.editMode = false;
    this.form = { type: 'expense', amount: null, description: '', transaction_date: new Date().toISOString().split('T')[0], account_id: this.accounts[0]?.id, category_id: null, payment_method: '', notes: '' };
    this.showModal = true;
  }

  openEdit(tx: Transaction): void {
    this.editMode = true;
    this.form = { ...tx, id: tx.id };
    this.showModal = true;
  }

  save(): void {
    if (this.editMode) {
      this.api.updateTransaction(this.form.id, this.form).subscribe(() => { this.showModal = false; this.loadData(); });
    } else {
      this.api.createTransaction(this.form).subscribe(() => { this.showModal = false; this.loadData(); });
    }
  }

  delete(id: number): void {
    if (confirm('Eliminar esta transação?')) {
      this.api.deleteTransaction(id).subscribe(() => this.loadData());
    }
  }

  get filteredCategories(): Category[] {
    return this.categories.filter(c => !this.form.type || c.type === this.form.type);
  }

  get totalPages(): number { return Math.ceil(this.total / this.limit); }

  nextPage(): void { if (this.page < this.totalPages) { this.page++; this.loadData(); } }
  prevPage(): void { if (this.page > 1) { this.page--; this.loadData(); } }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(val);
  }

  exportCsv(): void {
    this.api.exportCsv({ from: this.filterFrom, to: this.filterTo, type: this.filterType }).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'transacoes.csv'; a.click();
      URL.revokeObjectURL(url);
    });
  }
}
