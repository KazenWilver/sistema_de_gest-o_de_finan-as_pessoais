import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Budget, Category } from '../../core/models';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title">Orçamentos</h1><p class="page-subtitle">Controlar limites de gastos</p></div>
        <button class="btn btn-primary" (click)="openCreate()">+ Novo Orçamento</button>
      </div>
      <div class="grid grid-2">
        @for (b of budgets; track b.id) {
          <div class="card budget-card">
            <div class="budget-top">
              <div>
                <h3 class="budget-name">{{ b.name }}</h3>
                <p class="budget-cat">{{ b.category_name || 'Geral' }} · {{ b.period }}</p>
              </div>
              <div class="budget-actions">
                <button class="btn btn-ghost btn-sm" (click)="openEdit(b)">✏️</button>
                <button class="btn btn-ghost btn-sm" (click)="delete(b)">🗑️</button>
              </div>
            </div>
            <div class="budget-amounts">
              <span class="spent">{{ formatCurrency(b.spent || 0) }}</span>
              <span class="limit">/ {{ formatCurrency(b.limit_amount) }}</span>
            </div>
            <div class="progress-bar" style="height:8px; border-radius:4px; margin:var(--space-sm) 0">
              <div class="progress-fill" [style.width.%]="Math.min(b.percentage || 0, 100)"
                   [style.background]="getColor(b.percentage || 0)" style="border-radius:4px"></div>
            </div>
            <div class="budget-meta" [style.color]="getColor(b.percentage || 0)">
              {{ b.percentage || 0 }}% utilizado · {{ b.start_date }} → {{ b.end_date }}
            </div>
          </div>
        }
      </div>
      <div *ngIf="budgets.length === 0" class="empty-state"><p class="empty-state-text">Nenhum orçamento</p></div>

      <div class="modal-backdrop" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header"><h3 class="modal-title">{{ editMode ? 'Editar' : 'Novo' }} Orçamento</h3><button class="modal-close" (click)="showModal = false">✕</button></div>
          <div class="form-group"><label class="form-label">Nome</label><input class="form-input" [(ngModel)]="form.name"></div>
          <div class="form-group"><label class="form-label">Limite</label><input class="form-input" type="number" [(ngModel)]="form.limit_amount" min="1"></div>
          <div class="form-group"><label class="form-label">Categoria</label>
            <select class="form-select" [(ngModel)]="form.category_id">
              <option [ngValue]="null">Geral (todas)</option>
              @for (c of categories; track c.id) { <option [value]="c.id">{{ c.name }}</option> }
            </select>
          </div>
          <div class="form-group"><label class="form-label">Período</label>
            <select class="form-select" [(ngModel)]="form.period"><option value="weekly">Semanal</option><option value="monthly">Mensal</option><option value="yearly">Anual</option></select>
          </div>
          <div class="form-group"><label class="form-label">Início</label><input class="form-input" type="date" [(ngModel)]="form.start_date"></div>
          <div class="form-group"><label class="form-label">Fim</label><input class="form-input" type="date" [(ngModel)]="form.end_date"></div>
          <div class="modal-actions"><button class="btn btn-secondary" (click)="showModal = false">Cancelar</button><button class="btn btn-primary" (click)="save()">{{ editMode ? 'Guardar' : 'Criar' }}</button></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .budget-card { padding: var(--space-lg); }
    .budget-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .budget-name { font-size: 17px; font-weight: 600; }
    .budget-cat { font-size: 13px; color: var(--color-text-tertiary); margin-top: 2px; }
    .budget-actions { display: flex; gap: var(--space-xs); }
    .budget-amounts { margin-top: var(--space-md); font-size: 20px; }
    .spent { font-weight: 700; }
    .limit { color: var(--color-text-tertiary); font-weight: 400; }
    .budget-meta { font-size: 12px; font-weight: 500; }
  `]
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  categories: Category[] = [];
  showModal = false; editMode = false;
  Math = Math;
  form: any = { name: '', limit_amount: null, category_id: null, period: 'monthly', start_date: '', end_date: '' };

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); this.api.getCategories('expense').subscribe(d => this.categories = d); }
  load(): void { this.api.getBudgets().subscribe(d => this.budgets = d); }

  openCreate(): void {
    const now = new Date();
    this.editMode = false;
    this.form = { name: '', limit_amount: null, category_id: null, period: 'monthly',
      start_date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    }; this.showModal = true;
  }
  openEdit(b: Budget): void { this.editMode = true; this.form = { ...b }; this.showModal = true; }
  save(): void {
    const obs = this.editMode ? this.api.updateBudget(this.form.id, this.form) : this.api.createBudget(this.form);
    obs.subscribe(() => { this.showModal = false; this.load(); });
  }
  delete(b: Budget): void { if (confirm(`Eliminar "${b.name}"?`)) this.api.deleteBudget(b.id).subscribe(() => this.load()); }
  getColor(p: number): string { if (p >= 90) return 'var(--color-danger)'; if (p >= 70) return 'var(--color-warning)'; return 'var(--color-success)'; }
  formatCurrency(v: number): string { return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(v); }
}
