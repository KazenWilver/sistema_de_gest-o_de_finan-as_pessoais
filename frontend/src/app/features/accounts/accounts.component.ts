import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Account } from '../../core/models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title">Contas</h1><p class="page-subtitle">Gerir contas financeiras</p></div>
        <button class="btn btn-primary" (click)="openCreate()">+ Nova Conta</button>
      </div>
      <div class="grid grid-3">
        @for (acc of accounts; track acc.id) {
          <div class="card card-hover account-card">
            <div class="account-type">{{ getTypeLabel(acc.type) }}</div>
            <h3 class="account-name">{{ acc.name }}</h3>
            <div class="account-balance" [class.positive]="(acc.balance||0) >= 0" [class.negative]="(acc.balance||0) < 0">
              {{ formatCurrency(acc.balance || 0) }}
            </div>
            <div class="account-meta">{{ acc.currency }}</div>
            <div class="account-actions">
              <button class="btn btn-ghost btn-sm" (click)="openEdit(acc)">✏️ Editar</button>
              <button class="btn btn-ghost btn-sm" (click)="delete(acc)">🗑️</button>
            </div>
          </div>
        }
      </div>
      <div *ngIf="accounts.length === 0" class="empty-state"><p class="empty-state-text">Nenhuma conta</p></div>

      <div class="modal-backdrop" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ editMode ? 'Editar' : 'Nova' }} Conta</h3>
            <button class="modal-close" (click)="showModal = false">✕</button>
          </div>
          <div class="form-group"><label class="form-label">Nome</label><input class="form-input" [(ngModel)]="form.name"></div>
          <div class="form-group"><label class="form-label">Tipo</label>
            <select class="form-select" [(ngModel)]="form.type">
              <option value="cash">Dinheiro</option><option value="bank">Banco</option>
              <option value="mobile_money">Mobile Money</option><option value="savings">Poupança</option><option value="other">Outro</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Moeda</label>
            <select class="form-select" [(ngModel)]="form.currency">
              <option value="AOA">AOA</option><option value="USD">USD</option><option value="EUR">EUR</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="showModal = false">Cancelar</button>
            <button class="btn btn-primary" (click)="save()">{{ editMode ? 'Guardar' : 'Criar' }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .account-card { text-align: center; }
    .account-type { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); font-weight: 600; }
    .account-name { font-size: 18px; font-weight: 600; margin: var(--space-sm) 0; }
    .account-balance { font-family: var(--font-display); font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
    .account-balance.positive { color: var(--color-success); }
    .account-balance.negative { color: var(--color-danger); }
    .account-meta { font-size: 13px; color: var(--color-text-tertiary); margin-top: 4px; }
    .account-actions { margin-top: var(--space-md); display: flex; justify-content: center; gap: var(--space-sm); }
  `]
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  showModal = false; editMode = false;
  form: any = { name: '', type: 'cash', currency: 'AOA' };

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }

  load(): void { this.api.getAccounts().subscribe(d => this.accounts = d); }

  openCreate(): void { this.editMode = false; this.form = { name: '', type: 'cash', currency: 'AOA' }; this.showModal = true; }
  openEdit(a: Account): void { this.editMode = true; this.form = { ...a }; this.showModal = true; }

  save(): void {
    const obs = this.editMode ? this.api.updateAccount(this.form.id, this.form) : this.api.createAccount(this.form);
    obs.subscribe(() => { this.showModal = false; this.load(); });
  }

  delete(a: Account): void { if (confirm(`Eliminar conta "${a.name}"?`)) this.api.deleteAccount(a.id).subscribe({ next: () => this.load(), error: (e) => alert(e.error?.message || 'Erro') }); }

  getTypeLabel(t: string): string {
    const m: any = { cash: 'Dinheiro', bank: 'Banco', mobile_money: 'Mobile Money', savings: 'Poupança', other: 'Outro' };
    return m[t] || t;
  }

  formatCurrency(v: number): string { return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v); }
}
