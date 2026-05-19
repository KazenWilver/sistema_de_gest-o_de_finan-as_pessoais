import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

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
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Preencha todos os campos.';
      return;
    }
    this.loading = true;
    this.error = '';

    console.log('[LOGIN] Enviando login...', this.email);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        console.log('[LOGIN] Sucesso! Resposta:', res);
        console.log('[LOGIN] Token guardado:', !!localStorage.getItem('sgfp_token'));
        this.router.navigate(['/dashboard']).then(
          (success) => console.log('[LOGIN] Navegação para dashboard:', success),
          (err) => console.error('[LOGIN] Erro na navegação:', err)
        );
      },
      error: (err) => {
        console.error('[LOGIN] Erro no login:', err);
        this.loading = false;
        this.error = err.error?.message || 'Erro ao fazer login. Verifique as credenciais.';
      },
      complete: () => {
        console.log('[LOGIN] Observable completo');
      }
    });
  }
}
