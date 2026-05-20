import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
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

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    public i18n: I18nService,
    private toast: ToastService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const u = this.auth.currentUser;
    if (u) this.profile = { name: u.name, email: u.email, currency: u.currency, language: u.language || this.i18n.currentLang };
  }

  saveProfile(): void {
    this.profile.language = this.i18n.currentLang;
    this.auth.updateProfile(this.profile).subscribe({
      next: () => this.toast.success(this.i18n.t('toast.saved')),
      error: () => this.toast.error(this.i18n.t('toast.error'))
    });
  }

  changePassword(): void {
    if (this.passwords.new_password !== this.passwords.confirm) {
      this.toast.warning(this.i18n.t('toast.pw_mismatch'));
      return;
    }
    this.auth.updatePassword({ current_password: this.passwords.current_password, new_password: this.passwords.new_password }).subscribe({
      next: () => { this.toast.success(this.i18n.t('toast.pw_changed')); this.passwords = { current_password: '', new_password: '', confirm: '' }; },
      error: (e: any) => this.toast.error(e.error?.message || this.i18n.t('toast.error'))
    });
  }
}
