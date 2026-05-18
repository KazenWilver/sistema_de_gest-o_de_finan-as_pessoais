import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('light');
  public theme$ = this.themeSubject.asObservable();

  constructor(private authService: AuthService) {
    const stored = localStorage.getItem('sgfp_theme');
    const userTheme = this.authService.currentUser?.theme;
    this.setTheme(stored || userTheme || 'light');
  }

  get currentTheme(): string {
    return this.themeSubject.value;
  }

  setTheme(theme: string): void {
    this.themeSubject.next(theme);
    localStorage.setItem('sgfp_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }

  toggleTheme(): void {
    const next = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }
}
