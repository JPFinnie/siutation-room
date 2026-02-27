import { t } from '@/services/i18n';

/**
 * WorldMonitorTab - previously managed cloud API key registration.
 * The cloud API key feature has been removed; this stub renders a
 * simple "local-only mode" message so that any external references
 * to the class continue to work.
 */
export class WorldMonitorTab {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'wm-tab';
    this.render();
  }

  private render(): void {
    this.el.innerHTML = `
      <div class="wm-hero">
        <h2 class="wm-hero-title">${t('modals.settingsWindow.worldMonitor.heroTitle')}</h2>
        <p class="wm-hero-desc">Local-only mode &mdash; no cloud API key required.</p>
      </div>
    `;
  }

  hasPendingChanges(): boolean {
    return false;
  }

  async save(): Promise<void> {
    // No-op: nothing to persist in local-only mode
  }

  refresh(): void {
    this.render();
  }

  getElement(): HTMLElement {
    return this.el;
  }

  destroy(): void {
    this.el.innerHTML = '';
  }
}
