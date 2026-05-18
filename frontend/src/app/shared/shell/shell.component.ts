import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent implements OnInit {
  sidebarCollapsed = false;
  mobileMenuOpen = false;
  userName = '';
  userInitials = '';

  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/transactions', label: 'Transações', icon: '💸' },
    { path: '/accounts', label: 'Contas', icon: '🏦' },
    { path: '/categories', label: 'Categorias', icon: '🏷️' },
    { path: '/budgets', label: 'Orçamentos', icon: '📋' },
    { path: '/reports', label: 'Relatórios', icon: '📈' },
    { path: '/settings', label: 'Definições', icon: '⚙️' },
  ];

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name;
        const parts = user.name.split(' ');
        this.userInitials = parts.length > 1
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : parts[0].substring(0, 2).toUpperCase();
      }
    });

    if (this.authService.currentUser?.role === 'admin') {
      this.navItems.push({ path: '/admin', label: 'Admin', icon: '🛡️' });
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobile(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
