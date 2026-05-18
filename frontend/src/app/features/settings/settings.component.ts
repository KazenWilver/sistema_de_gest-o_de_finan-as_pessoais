import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  profile = { name: '', email: '', currency: 'AOA', language: 'pt' };
  passwords = { current_password: '', new_password: '', confirm: '' };
  message = '';
  pwMessage = '';

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const u = this.auth.currentUser;
    if (u) {
      this.profile = { name: u.name, email: u.email, currency: u.currency, language: u.language };
    }
  }

  saveProfile(): void {
    this.auth.updateProfile(this.profile).subscribe({
      next: () => this.message = 'Perfil atualizado com sucesso!',
      error: () => this.message = 'Erro ao atualizar perfil.'
    });
  }

  changePassword(): void {
    if (this.passwords.new_password !== this.passwords.confirm) {
      this.pwMessage = 'As passwords não coincidem.';
      return;
    }
    this.auth.updatePassword({
      current_password: this.passwords.current_password,
      new_password: this.passwords.new_password
    }).subscribe({
      next: () => {
        this.pwMessage = 'Password alterada!';
        this.passwords = { current_password: '', new_password: '', confirm: '' };
      },
      error: (e: any) => this.pwMessage = e.error?.message || 'Erro.'
    });
  }

  toggleTheme(): void { this.theme.toggleTheme(); }
}
