import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, NgIf],
  template: `
    <div class="card">
      <h1>{{ 'AUTH.FORGOT_TITLE' | translate }}</h1>
      <label>{{ 'AUTH.EMAIL' | translate }}</label>
      <input type="email" [(ngModel)]="email" />
      <button class="primary" type="button" (click)="submit()" [disabled]="loading">{{ 'AUTH.SEND' | translate }}</button>
      <p class="ok" *ngIf="ok">{{ ok }}</p>
      <p class="error" *ngIf="error">{{ error }}</p>
      <p class="muted"><a routerLink="/auth/login">{{ 'AUTH.BACK_LOGIN' | translate }}</a></p>
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
      .ok {
        color: var(--accent);
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
export class ForgotComponent {
  private auth = inject(AuthService);
  email = '';
  loading = false;
  ok = '';
  error = '';

  submit(): void {
    this.ok = '';
    this.error = '';
    this.loading = true;
    this.auth.forgot(this.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.ok = res.data?.message ?? res.message ?? 'OK';
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.message ?? 'Erro';
      },
    });
  }
}
