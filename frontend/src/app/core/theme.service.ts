import { Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly key = 'sgfp_theme';

  init(): void {
    const saved = localStorage.getItem(this.key) as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const mode = saved ?? (prefersDark ? 'dark' : 'light');
    this.apply(mode);
  }

  toggle(): void {
    const root = this.doc.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    this.apply(next);
  }

  private apply(mode: 'light' | 'dark'): void {
    this.doc.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(this.key, mode);
  }
}
