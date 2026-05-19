import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './login.component.scss'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = false;
  error = '';
  touched: Record<string, boolean> = {};
  shakeError = false;

  constructor(private auth: AuthService, private router: Router, public i18n: I18nService) {}

  get nameValid(): boolean { return this.name.trim().length >= 2; }
  get emailValid(): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email); }
  get passwordValid(): boolean { return this.password.length >= 5; }
  get canSubmit(): boolean { return this.nameValid && this.emailValid && this.passwordValid && !this.loading; }

  onSubmit(): void {
    this.touched = { name: true, email: true, password: true };
    if (!this.canSubmit) {
      this.triggerShake();
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/dashboard']); },
      error: (e) => {
        this.loading = false;
        this.error = e.error?.message || this.i18n.t('toast.error');
        this.triggerShake();
      }
    });
  }

  private triggerShake(): void {
    this.shakeError = true;
    setTimeout(() => this.shakeError = false, 600);
  }
}
