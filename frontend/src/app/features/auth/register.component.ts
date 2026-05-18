import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, NgIf],
  template: `
    <div class="card">
      <h1>{{ 'AUTH.REGISTER' | translate }}</h1>
      <label>{{ 'AUTH.EMAIL' | translate }}</label>
      <input type="email" [(ngModel)]="email" />
      <label>{{ 'AUTH.PASSWORD' | translate }}</label>
      <input type="password" [(ngModel)]="password" />
      <button class="primary" type="button" (click)="submit()" [disabled]="loading">{{ 'AUTH.REGISTER' | translate }}</button>
      <p class="error" *ngIf="error">{{ error }}</p>
      <p class="muted"><a routerLink="/auth/login">{{ 'AUTH.HAS_ACCOUNT' | translate }}</a></p>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        padding: 2rem;
      }
      .card {
        width: min(400px, 100%);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      input {
        padding: 0.5rem;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
      }
      .primary {
        margin-top: 0.5rem;
        padding: 0.65rem;
        border: none;
        border-radius: 8px;
        background: var(--accent);
        color: var(--accent-contrast);
        cursor: pointer;
      }
      .primary:disabled {
        opacity: 0.6;
      }
      .error {
        color: var(--danger);
      }
      a {
        color: var(--accent);
      }
    `,
  ],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  error = '';

  submit(): void {
    this.loading = true;
    this.error = '';
    this.auth.register(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.status !== 'success') {
          this.error = res.message;
          return;
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Erro';
      },
    });
  }
}
