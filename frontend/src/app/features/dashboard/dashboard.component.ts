import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { DashboardSummary, Transaction, Budget } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary = { income: 0, expense: 0, balance: 0, savings_rate: 0 };
  recentTransactions: Transaction[] = [];
  budgets: Budget[] = [];
  userName = '';
  currentMonth = '';
  loading = true;

  constructor(private api: ApiService, private auth: AuthService, public i18n: I18nService) {}

  ngOnInit(): void {
    this.userName = this.auth.currentUser?.name?.split(' ')[0] || 'Utilizador';
    this.currentMonth = new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

    forkJoin({
      summary: this.api.getDashboardSummary(),
      recent: this.api.getRecentTransactions(),
      budgets: this.api.getBudgetProgress()
    }).subscribe({
      next: (data) => {
        this.summary = data.summary;
        this.recentTransactions = data.recent;
        this.budgets = data.budgets;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(val);
  }

  getBudgetColor(pct: number): string {
    if (pct >= 90) return 'var(--color-error)';
    if (pct >= 70) return 'var(--color-warning)';
    return 'var(--color-success)';
  }

  Math = Math;
}
