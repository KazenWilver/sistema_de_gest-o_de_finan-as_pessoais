import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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
            <p class="auth-subtitle">{{ step === 'email' ? i18n.t('auth.forgot') : i18n.t('settings.new_pw') }}</p>
          </div>

          <!-- Step 1: Email -->
          <form *ngIf="step === 'email'" (ngSubmit)="sendReset()" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="forgot-email">{{ i18n.t('auth.email') }}</label>
              <input class="form-input" id="forgot-email" type="email" [(ngModel)]="email" name="email" placeholder="exemplo@email.com" required>
            </div>
            <div class="form-error auth-error" *ngIf="error">{{ error }}</div>
            <div class="toast toast-success" style="margin-bottom:12px" *ngIf="tokenMessage">{{ tokenMessage }}</div>
            <button class="btn btn-primary btn-lg auth-submit" type="submit" [disabled]="loading || !email">
              {{ loading ? i18n.t('common.loading') : i18n.t('common.confirm') }}
            </button>
            <div class="auth-links"><a routerLink="/auth/login" class="auth-link">← {{ i18n.t('auth.login') }}</a></div>
          </form>

          <!-- Step 2: Reset with token -->
          <form *ngIf="step === 'reset'" (ngSubmit)="resetPassword()" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="reset-token">Token</label>
              <input class="form-input" id="reset-token" [(ngModel)]="token" name="token" placeholder="Token" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="reset-pw">{{ i18n.t('settings.new_pw') }}</label>
              <input class="form-input" id="reset-pw" type="password" [(ngModel)]="newPassword" name="newPassword" placeholder="••••••" required>
            </div>
            <div class="form-error auth-error" *ngIf="error">{{ error }}</div>
            <div class="toast toast-success" style="margin-bottom:12px" *ngIf="successMessage">{{ successMessage }}</div>
            <button class="btn btn-primary btn-lg auth-submit" type="submit" [disabled]="loading || !token || !newPassword">
              {{ loading ? i18n.t('common.loading') : i18n.t('common.confirm') }}
            </button>
            <div class="auth-links"><a routerLink="/auth/login" class="auth-link">← {{ i18n.t('auth.login') }}</a></div>
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

  constructor(private auth: AuthService, public i18n: I18nService, private cdr: ChangeDetectorRef, private router: Router) {}

  sendReset(): void {
    this.loading = true;
    this.error = '';
    this.tokenMessage = '';
    this.auth.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.loading = false;
        // Backend returns { status: 'success', data: { reset_token: '...' } }
        const tkn = res?.data?.reset_token || res?.reset_token || '';
        this.tokenMessage = 'Token: ' + tkn;
        if (tkn) this.token = tkn; // Auto-fill token for convenience
        this.step = 'reset';
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.loading = false;
        this.error = e.error?.message || this.i18n.t('toast.error');
        this.cdr.detectChanges();
      }
    });
  }

  resetPassword(): void {
    this.loading = true;
    this.error = '';
    this.successMessage = '';
    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = this.i18n.t('toast.pw_changed');
        this.cdr.detectChanges();
        // Redirect to login after 2 seconds
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (e) => {
        this.loading = false;
        this.error = e.error?.message || this.i18n.t('toast.error');
        this.cdr.detectChanges();
      }
    });
  }
}
