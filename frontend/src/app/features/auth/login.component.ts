import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  emailTouched = false;
  passwordTouched = false;

  constructor(private auth: AuthService, private router: Router, public i18n: I18nService) {}

  get emailValid(): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email); }
  get passwordValid(): boolean { return this.password.length >= 5; }
  get canSubmit(): boolean { return this.emailValid && this.passwordValid && !this.loading; }

  onSubmit(): void {
    this.emailTouched = true;
    this.passwordTouched = true;
    if (!this.canSubmit) return;
    this.loading = true;
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/dashboard']); },
      error: (e) => { this.loading = false; this.error = e.error?.message || 'Erro de autenticação'; }
    });
  }
}
