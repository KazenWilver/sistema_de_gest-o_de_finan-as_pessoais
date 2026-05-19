import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { I18nService } from '../../core/i18n.service';
import { ConfirmService } from '../../core/confirm.service';
import { ToastComponent } from '../toast/toast.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ToastComponent, ConfirmDialogComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  menuOpen = false;

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    public i18n: I18nService,
    private confirmService: ConfirmService,
    private router: Router
  ) {}

  async onLogout(): Promise<void> {
    const confirmed = await this.confirmService.confirm({
      title: this.i18n.t('confirm.logout_title'),
      message: this.i18n.t('confirm.logout_msg'),
      confirmText: this.i18n.t('common.yes'),
      cancelText: this.i18n.t('common.no'),
      type: 'info'
    });
    if (confirmed) {
      this.auth.logout();
      this.router.navigate(['/auth/login']);
    }
  }
}
