import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../models/api.types';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  template: `
    <h1>{{ 'SET.TITLE' | translate }}</h1>
    <section>
      <h3>{{ 'SET.PROFILE' | translate }}</h3>
      <div class="row">
        <label>Idioma</label>
        <select [(ngModel)]="language" name="lang">
          <option value="pt">PT</option>
          <option value="en">EN</option>
        </select>
        <label>Moeda base</label>
        <input [(ngModel)]="currency" maxlength="3" name="cur" />
        <button type="button" (click)="saveProfile()">{{ 'COMMON.SAVE' | translate }}</button>
      </div>
    </section>
    <section>
      <h3>{{ 'SET.SECURITY' | translate }}</h3>
      <div class="row">
        <input type="password" [(ngModel)]="currentPw" placeholder="Password actual" />
        <input type="password" [(ngModel)]="newPw" placeholder="Nova password" />
        <button type="button" (click)="savePw()">{{ 'COMMON.SAVE' | translate }}</button>
      </div>
    </section>
    <section>
      <h3>{{ 'COMMON.THEME' | translate }}</h3>
      <button type="button" (click)="toggleTheme()">{{ 'SET.TOGGLE_THEME' | translate }}</button>
    </section>
  `,
  styles: [
    `
      section {
        margin-bottom: 1.5rem;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }
      input,
      select,
      button {
        padding: 0.35rem 0.5rem;
        border-radius: 6px;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
      }
    `,
  ],
})
export class SettingsComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private theme = inject(ThemeService);
  private translate = inject(TranslateService);

  language = 'pt';
  currency = 'EUR';
  currentPw = '';
  newPw = '';

  constructor() {
    const u = this.auth.user();
    this.language = u?.language ?? 'pt';
    this.currency = u?.base_currency ?? 'EUR';
  }

  saveProfile(): void {
    this.http
      .patch<ApiEnvelope<any>>(`${environment.apiUrl}/settings/profile`, {
        language: this.language,
        base_currency: this.currency.toUpperCase(),
      })
      .subscribe((res) => {
        if (res.status === 'success') {
          localStorage.setItem('sgfp_user', JSON.stringify(res.data));
          this.auth.user.set(res.data as any);
          this.translate.use(this.language);
          localStorage.setItem('sgfp_lang', this.language);
          alert('Guardado');
        }
      });
  }

  savePw(): void {
    this.http
      .patch<ApiEnvelope<any>>(`${environment.apiUrl}/settings/security`, {
        current_password: this.currentPw,
        new_password: this.newPw,
      })
      .subscribe({
        next: (res) => {
          if (res.status === 'success') {
            alert('Password atualizada');
            this.currentPw = '';
            this.newPw = '';
          } else {
            alert(res.message);
          }
        },
        error: (e) => alert(e?.error?.message ?? 'Erro'),
      });
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
