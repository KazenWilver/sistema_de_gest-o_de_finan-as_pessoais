import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-hero">
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">SGFP</h1>
            <p class="auth-subtitle">{{ step === 'email' ? 'Recuperar palavra-passe' : 'Definir nova palavra-passe' }}</p>
          </div>

          <!-- Step 1: Email -->
          <form *ngIf="step === 'email'" (ngSubmit)="sendReset()" class="auth-form">
            <div class="form-group">
              <label class="form-label">{{ i18n.t('auth.email') }}</label>
              <input class="form-input" type="email" [(ngModel)]="email" name="email" placeholder="exemplo@email.com">
            </div>
            <div class="form-error auth-error" *ngIf="error">{{ error }}</div>
            <div class="toast toast-success" style="margin-bottom:12px" *ngIf="tokenMessage">{{ tokenMessage }}</div>
            <button class="btn btn-primary btn-lg auth-submit" type="submit" [disabled]="loading">
              {{ loading ? i18n.t('common.loading') : 'Enviar' }}
            </button>
            <div class="auth-links"><a routerLink="/auth/login" class="auth-link">← Voltar ao login</a></div>
          </form>

          <!-- Step 2: Reset with token -->
          <form *ngIf="step === 'reset'" (ngSubmit)="resetPassword()" class="auth-form">
            <div class="form-group">
              <label class="form-label">Token</label>
              <input class="form-input" [(ngModel)]="token" name="token" placeholder="Cole o token aqui">
            </div>
            <div class="form-group">
              <label class="form-label">Nova palavra-passe</label>
              <input class="form-input" type="password" [(ngModel)]="newPassword" name="newPassword" placeholder="••••••">
            </div>
            <div class="form-error auth-error" *ngIf="error">{{ error }}</div>
            <div class="toast toast-success" style="margin-bottom:12px" *ngIf="successMessage">{{ successMessage }}</div>
            <button class="btn btn-primary btn-lg auth-submit" type="submit" [disabled]="loading">
              {{ loading ? i18n.t('common.loading') : 'Redefinir' }}
            </button>
            <div class="auth-links"><a routerLink="/auth/login" class="auth-link">← Voltar ao login</a></div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss'
})
export class ForgotPasswordComponent {
  step: 'email' | 'reset' = 'email';
  email = '';
  token = '';
  newPassword = '';
  loading = false;
  error = '';
  tokenMessage = '';
  successMessage = '';

  constructor(private auth: AuthService, public i18n: I18nService) {}

  sendReset(): void {
    this.loading = true;
    this.error = '';
    this.tokenMessage = '';
    this.auth.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.tokenMessage = 'Token: ' + (res?.data?.token || res?.token || 'Verifique o seu email');
        this.step = 'reset';
      },
      error: (e) => { this.loading = false; this.error = e.error?.message || 'Erro'; }
    });
  }

  resetPassword(): void {
    this.loading = true;
    this.error = '';
    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => { this.loading = false; this.successMessage = 'Palavra-passe redefinida com sucesso!'; },
      error: (e) => { this.loading = false; this.error = e.error?.message || 'Erro'; }
    });
  }
}
