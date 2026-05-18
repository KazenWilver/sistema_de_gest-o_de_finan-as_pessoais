import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

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
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.name || !this.email || !this.password) {
      this.error = 'Preencha todos os campos.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'A password deve ter pelo menos 6 caracteres.';
      return;
    }
    this.loading = true;
    this.error = '';

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erro ao criar conta.';
      }
    });
  }
}
