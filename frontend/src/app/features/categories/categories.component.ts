import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Category } from '../../core/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div><h1 class="page-title">Categorias</h1><p class="page-subtitle">Organizar receitas e despesas</p></div>
        <button class="btn btn-primary" (click)="openCreate()">+ Nova Categoria</button>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab==='income'" (click)="activeTab='income'">Receitas</button>
        <button class="tab" [class.active]="activeTab==='expense'" (click)="activeTab='expense'">Despesas</button>
      </div>

      <div class="grid grid-3">
        @for (cat of filtered; track cat.id) {
          <div class="card card-hover cat-card">
            <div class="cat-icon" [style.background]="cat.color + '18'" [style.color]="cat.color">{{ cat.icon }}</div>
            <h3 class="cat-name">{{ cat.name }}</h3>
            <span class="badge" [class.badge-income]="cat.type==='income'" [class.badge-expense]="cat.type==='expense'">
              {{ cat.type === 'income' ? 'Receita' : 'Despesa' }}
            </span>
            <div class="cat-actions" *ngIf="!cat.is_default">
              <button class="btn btn-ghost btn-sm" (click)="openEdit(cat)">✏️</button>
              <button class="btn btn-ghost btn-sm" (click)="delete(cat)">🗑️</button>
            </div>
            <div class="cat-default" *ngIf="cat.is_default">Padrão</div>
          </div>
        }
      </div>

      <div class="modal-backdrop" *ngIf="showModal" (click)="showModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">{{ editMode ? 'Editar' : 'Nova' }} Categoria</h3>
            <button class="modal-close" (click)="showModal = false">✕</button>
          </div>
          <div class="form-group"><label class="form-label">Nome</label><input class="form-input" [(ngModel)]="form.name"></div>
          <div class="form-group"><label class="form-label">Tipo</label>
            <select class="form-select" [(ngModel)]="form.type"><option value="income">Receita</option><option value="expense">Despesa</option></select>
          </div>
          <div class="form-group"><label class="form-label">Cor</label><input class="form-input" type="color" [(ngModel)]="form.color"></div>
          <div class="form-group"><label class="form-label">Ícone</label><input class="form-input" [(ngModel)]="form.icon" placeholder="emoji ou nome"></div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="showModal = false">Cancelar</button>
            <button class="btn btn-primary" (click)="save()">{{ editMode ? 'Guardar' : 'Criar' }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tabs { display: flex; gap: var(--space-xs); margin-bottom: var(--space-lg); }
    .tab { padding: 8px 20px; border-radius: var(--radius-pill); border: 1.5px solid var(--color-border); background: none; cursor: pointer; font-size: 14px; font-weight: 500; color: var(--color-text-secondary); transition: all var(--transition-fast); }
    .tab.active { background: var(--color-primary); color: #FFF; border-color: var(--color-primary); }
    .cat-card { text-align: center; padding: var(--space-lg); }
    .cat-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto var(--space-sm); }
    .cat-name { font-size: 16px; font-weight: 600; margin-bottom: var(--space-xs); }
    .cat-actions { margin-top: var(--space-sm); display: flex; justify-content: center; gap: var(--space-xs); }
    .cat-default { font-size: 11px; color: var(--color-text-tertiary); margin-top: var(--space-sm); }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  activeTab: 'income' | 'expense' = 'expense';
  showModal = false; editMode = false;
  form: any = { name: '', type: 'expense', icon: 'circle', color: '#6366f1' };

  constructor(private api: ApiService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.api.getCategories().subscribe(d => this.categories = d); }
  get filtered(): Category[] { return this.categories.filter(c => c.type === this.activeTab); }

  openCreate(): void { this.editMode = false; this.form = { name: '', type: this.activeTab, icon: 'circle', color: '#6366f1' }; this.showModal = true; }
  openEdit(c: Category): void { this.editMode = true; this.form = { ...c }; this.showModal = true; }
  save(): void {
    const obs = this.editMode ? this.api.updateCategory(this.form.id, this.form) : this.api.createCategory(this.form);
    obs.subscribe(() => { this.showModal = false; this.load(); });
  }
  delete(c: Category): void { if (confirm(`Eliminar "${c.name}"?`)) this.api.deleteCategory(c.id).subscribe({ next: () => this.load(), error: (e) => alert(e.error?.message || 'Erro') }); }
}
