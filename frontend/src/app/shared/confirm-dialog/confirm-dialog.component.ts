import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmOptions } from '../../core/confirm.service';
import { I18nService } from '../../core/i18n.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="confirm-overlay" (click)="onCancel()">
        <div class="confirm-card" (click)="$event.stopPropagation()">
          <div class="confirm-icon">{{ typeIcon }}</div>
          <div class="confirm-title">{{ options.title }}</div>
          <div class="confirm-message">{{ options.message }}</div>
          <div class="confirm-actions">
            <button class="btn btn-secondary" (click)="onCancel()">{{ options.cancelText || i18n.t('common.cancel') }}</button>
            <button class="btn" [ngClass]="options.type === 'danger' ? 'btn-danger' : 'btn-primary'" (click)="onConfirm()">
              {{ options.confirmText || i18n.t('common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  visible = false;
  options: ConfirmOptions = { title: '', message: '' };
  private resolve!: (v: boolean) => void;
  private sub!: Subscription;

  get typeIcon(): string {
    const m: Record<string, string> = { danger: '⚠️', warning: '⚡', info: 'ℹ️' };
    return m[this.options.type || 'danger'] || '⚠️';
  }

  constructor(private confirmService: ConfirmService, public i18n: I18nService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.sub = this.confirmService.confirm$.subscribe(({ options, resolve }) => {
      this.options = options;
      this.resolve = resolve;
      this.visible = true;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  onConfirm(): void { this.visible = false; this.resolve(true); this.cdr.detectChanges(); }
  onCancel(): void { this.visible = false; this.resolve(false); this.cdr.detectChanges(); }
}
