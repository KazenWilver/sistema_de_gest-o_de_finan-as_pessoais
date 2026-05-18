import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, NgIf],
  template: `
    <div class="layout">
      <aside class="side">
        <div class="brand">SGFP</div>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active">{{ 'NAV.DASHBOARD' | translate }}</a>
          <a routerLink="/transactions" routerLinkActive="active">{{ 'NAV.TRANSACTIONS' | translate }}</a>
          <a routerLink="/categories" routerLinkActive="active">{{ 'NAV.CATEGORIES' | translate }}</a>
          <a routerLink="/budgets" routerLinkActive="active">{{ 'NAV.BUDGETS' | translate }}</a>
          <a routerLink="/goals" routerLinkActive="active">{{ 'NAV.GOALS' | translate }}</a>
          <a routerLink="/reports" routerLinkActive="active">{{ 'NAV.REPORTS' | translate }}</a>
          <a routerLink="/settings" routerLinkActive="active">{{ 'NAV.SETTINGS' | translate }}</a>
          <a routerLink="/admin" routerLinkActive="active" *ngIf="auth.isAdmin()">{{ 'NAV.ADMIN' | translate }}</a>
        </nav>
      </aside>
      <div class="main">
        <header class="top">
          <span class="user">{{ auth.user()?.email }}</span>
          <button type="button" (click)="toggleTheme()">{{ 'COMMON.THEME' | translate }}</button>
          <button type="button" (click)="useLang('pt')">PT</button>
          <button type="button" (click)="useLang('en')">EN</button>
          <button type="button" (click)="auth.logout()">{{ 'AUTH.LOGOUT' | translate }}</button>
        </header>
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: 220px 1fr;
        min-height: 100vh;
      }
      .side {
        background: var(--surface-2);
        border-right: 1px solid var(--border);
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .brand {
        font-weight: 700;
        letter-spacing: 0.05em;
      }
      nav {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      nav a {
        color: var(--text);
        text-decoration: none;
        padding: 0.35rem 0.5rem;
        border-radius: 6px;
      }
      nav a.active {
        background: var(--accent-muted);
        color: var(--accent);
      }
      .top {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        justify-content: flex-end;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border);
      }
      .content {
        padding: 1rem;
      }
      .user {
        margin-right: auto;
        opacity: 0.85;
        font-size: 0.9rem;
      }
      button {
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--text);
        border-radius: 6px;
        padding: 0.35rem 0.6rem;
        cursor: pointer;
      }
      @media (max-width: 768px) {
        .layout {
          grid-template-columns: 1fr;
        }
        .side {
          flex-direction: row;
          flex-wrap: wrap;
        }
        nav {
          flex-direction: row;
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class ShellComponent {
  auth = inject(AuthService);
  private theme = inject(ThemeService);
  private translate = inject(TranslateService);

  constructor() {
    const saved = localStorage.getItem('sgfp_lang');
    if (saved) {
      this.translate.use(saved);
    }
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  useLang(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('sgfp_lang', lang);
  }
}
