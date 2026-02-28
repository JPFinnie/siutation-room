import type { AppContext, AppModule } from '@/app/app-context';
import {
  NewsPanel,
  MarketPanel,
  HeatmapPanel,
  CommoditiesPanel,
  CryptoPanel,
  PredictionPanel,
  MonitorPanel,
  EconomicPanel,
  LiveNewsPanel,
  ServiceStatusPanel,
  RuntimeConfigPanel,
  InsightsPanel,
  MacroSignalsPanel,
  ETFFlowsPanel,
  StablecoinPanel,
  InvestmentsPanel,
  TradePolicyPanel,
  SupplyChainPanel,
} from '@/components';
import { debounce, saveToStorage } from '@/utils';
import {
  FEEDS,
  INTEL_SOURCES,
  DEFAULT_PANELS,
  STORAGE_KEYS,
  PANEL_CATEGORY_MAP,
} from '@/config';
import { t } from '@/services/i18n';
import { getCurrentTheme } from '@/utils';

export interface PanelLayoutCallbacks {
  openCountryStory: (code: string, name: string) => void;
  loadAllData: () => Promise<void>;
  updateMonitorResults: () => void;
}

export class PanelLayoutManager implements AppModule {
  private ctx: AppContext;
  private callbacks: PanelLayoutCallbacks;
  private panelDragCleanupHandlers: Array<() => void> = [];
  private readonly applyTimeRangeFilterDebounced: () => void;

  constructor(ctx: AppContext, callbacks: PanelLayoutCallbacks) {
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.applyTimeRangeFilterDebounced = debounce(() => {
      this.applyTimeRangeFilterToNewsPanels();
    }, 120);
    // Ignore unused var
    void this.applyTimeRangeFilterDebounced;
  }

  init(): void {
    this.renderLayout();
  }

  destroy(): void {
    this.panelDragCleanupHandlers.forEach((cleanup) => cleanup());
    this.panelDragCleanupHandlers = [];
  }

  renderLayout(): void {
    if (this.ctx.isMobile) {
      this.renderMobileLayout();
    } else {
      this.renderDesktopLayout();
    }
  }

  private renderDesktopLayout(): void {
    const hamburgerSvg = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 3h12M1.5 7.5h12M1.5 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

    this.ctx.container.innerHTML = `
      <div class="header">
        <div class="header-left">
          <button class="sidebar-toggle-btn" id="sidebarToggleBtn" title="Toggle panel sidebar" aria-label="Toggle sidebar">${hamburgerSvg}</button>
          <span class="logo">FinSitch</span><span class="version">v${__APP_VERSION__}</span>
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span>${t('header.live')}</span>
          </div>
          <div class="ollama-status" id="ollamaStatusBadge">
            <span class="ollama-dot"></span>
            <span class="ollama-label">OLLAMA</span>
          </div>
        </div>
        <div class="header-right">
          <button class="search-btn" id="searchBtn"><kbd>⌘K</kbd> ${t('header.search')}</button>
          <button class="theme-toggle-btn" id="headerThemeToggle" title="${t('header.toggleTheme')}">
            ${getCurrentTheme() === 'dark'
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'}
          </button>
          ${this.ctx.isDesktopApp ? '' : `<button class="fullscreen-btn" id="fullscreenBtn" title="${t('header.fullscreen')}">⛶</button>`}
          <span id="unifiedSettingsMount"></span>
        </div>
      </div>
      <div class="ticker-strip" id="tickerStrip">
        <div class="ticker-track" id="tickerTrack">
          ${this.buildTickerPlaceholder()}
        </div>
      </div>
      <div class="app-body">
        <aside class="sidebar" id="mainSidebar">
          <div class="sidebar-inner">
            <div class="sidebar-header">
              <span class="sidebar-title">Panels</span>
            </div>
            <div class="sidebar-body" id="sidebarBody"></div>
          </div>
        </aside>
        <div class="main-content">
          <div class="panels-grid" id="panelsGrid"></div>
        </div>
      </div>
    `;

    this.createPanels();
    this.initSidebar();
    void this.initTicker();
    void this.initOllamaStatus();
  }

  private renderMobileLayout(): void {
    const moonSvg = '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    const sunSvg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

    const mobileNavTabs = [
      { key: 'core',       label: 'News',    icon: '<svg viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>' },
      { key: 'markets',    label: 'Markets', icon: '<svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>' },
      { key: 'cryptoDigital', label: 'Crypto', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.5 9H13a2.5 2.5 0 010 5H9.5V9zM9.5 14H13.5a2.5 2.5 0 010 5H9.5v-5z"/><line x1="12" y1="6" x2="12" y2="9"/><line x1="12" y1="19" x2="12" y2="22"/></svg>' },
      { key: 'centralBanks', label: 'Macro', icon: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>' },
      { key: '__all__',    label: 'All',     icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
    ];

    const navHtml = mobileNavTabs.map((tab, i) =>
      `<button class="mobile-nav-tab${i === 0 ? ' active' : ''}" data-cat="${tab.key}" aria-label="${tab.label}">
        ${tab.icon}
        ${tab.label}
      </button>`
    ).join('');

    this.ctx.container.innerHTML = `
      <div class="header mobile-header">
        <div class="header-left">
          <span class="logo">FinSitch</span>
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span>${t('header.live')}</span>
          </div>
        </div>
        <div class="header-right">
          <button class="theme-toggle-btn" id="headerThemeToggle" title="${t('header.toggleTheme')}">
            ${getCurrentTheme() === 'dark' ? sunSvg : moonSvg}
          </button>
          <span id="unifiedSettingsMount"></span>
        </div>
      </div>
      <div class="mobile-body">
        <div class="panels-grid" id="panelsGrid"></div>
      </div>
      <nav class="mobile-bottom-nav" id="mobileBottomNav">
        ${navHtml}
      </nav>
    `;

    this.createPanels();
    this.initMobileNav(mobileNavTabs[0]!.key);
  }

  private initMobileNav(initialCat: string): void {
    const nav = document.getElementById('mobileBottomNav');
    if (!nav) return;

    const panelsGrid = document.getElementById('panelsGrid');
    if (!panelsGrid) return;

    const filterByCategory = (catKey: string) => {
      const panels = panelsGrid.querySelectorAll<HTMLElement>('.panel[data-panel-key]');
      if (catKey === '__all__') {
        panels.forEach(p => p.classList.remove('panel-cat-hidden'));
        return;
      }
      const catDef = PANEL_CATEGORY_MAP[catKey];
      const allowed = catDef ? new Set(catDef.panelKeys) : new Set<string>();
      panels.forEach(p => {
        const key = p.dataset.panelKey ?? '';
        p.classList.toggle('panel-cat-hidden', !allowed.has(key));
      });
    };

    nav.addEventListener('click', (e) => {
      const tab = (e.target as HTMLElement).closest<HTMLElement>('.mobile-nav-tab');
      if (!tab?.dataset.cat) return;
      nav.querySelectorAll('.mobile-nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterByCategory(tab.dataset.cat);
    });

    // Apply initial category filter
    filterByCategory(initialCat);
  }

  applyPanelSettings(): void {
    Object.entries(this.ctx.panelSettings).forEach(([key, config]) => {
      if (key === 'map') return;
      const panel = this.ctx.panels[key];
      panel?.toggle(config.enabled);
    });
  }

  private initSidebar(): void {
    const sidebarBody = document.getElementById('sidebarBody');
    const sidebar = document.getElementById('mainSidebar');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    if (!sidebarBody || !sidebar || !toggleBtn) return;

    // Restore collapsed state
    const SIDEBAR_KEY = 'wm-sidebar-collapsed';
    const isCollapsed = localStorage.getItem(SIDEBAR_KEY) === 'true';
    if (isCollapsed) sidebar.classList.add('sidebar-collapsed');

    toggleBtn.addEventListener('click', () => {
      const collapsed = sidebar.classList.toggle('sidebar-collapsed');
      localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    });

    // Build sidebar from PANEL_CATEGORY_MAP
    const chevronSvg = `<svg class="sidebar-category-chevron" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const COLLAPSED_CATS_KEY = 'wm-sidebar-cats';

    let collapsedCats: Set<string>;
    try {
      collapsedCats = new Set(JSON.parse(localStorage.getItem(COLLAPSED_CATS_KEY) || '[]'));
    } catch {
      collapsedCats = new Set();
    }

    const saveCollapsedCats = () => {
      localStorage.setItem(COLLAPSED_CATS_KEY, JSON.stringify([...collapsedCats]));
    };

    for (const [catKey, catDef] of Object.entries(PANEL_CATEGORY_MAP)) {
      // Resolve label — translate if possible, otherwise use the key
      const catLabel = t(catDef.labelKey as any) || catDef.labelKey;
      const isCatCollapsed = collapsedCats.has(catKey);

      const section = document.createElement('div');
      section.className = `sidebar-category${isCatCollapsed ? ' collapsed' : ''}`;
      section.dataset.cat = catKey;

      // Category label row (clickable to collapse/expand)
      const labelRow = document.createElement('div');
      labelRow.className = 'sidebar-category-label';
      labelRow.innerHTML = `<span>${catLabel}</span>${chevronSvg}`;
      labelRow.addEventListener('click', () => {
        const nowCollapsed = section.classList.toggle('collapsed');
        if (nowCollapsed) collapsedCats.add(catKey);
        else collapsedCats.delete(catKey);
        saveCollapsedCats();
      });
      section.appendChild(labelRow);

      // Items container
      const itemsEl = document.createElement('div');
      itemsEl.className = 'sidebar-category-items';

      // Calculate max-height for animation
      const panelCount = catDef.panelKeys.filter(k => this.ctx.panels[k]).length;
      itemsEl.style.maxHeight = `${panelCount * 30}px`;

      for (const panelKey of catDef.panelKeys) {
        const panel = this.ctx.panels[panelKey];
        if (!panel) continue;

        const config = this.ctx.panelSettings[panelKey];
        if (!config) continue;

        const name = config.name || panelKey;
        const enabled = config.enabled !== false;

        const item = document.createElement('div');
        item.className = `sidebar-panel-item${enabled ? '' : ' panel-disabled'}`;
        item.dataset.panelKey = panelKey;

        const switchId = `sidebar-sw-${panelKey}`;
        item.innerHTML = `
          <label class="sidebar-panel-label" for="${switchId}" title="${name}">${name}</label>
          <label class="sidebar-toggle-switch">
            <input type="checkbox" id="${switchId}"${enabled ? ' checked' : ''}>
            <span class="sidebar-toggle-track"></span>
          </label>
        `;

        const checkbox = item.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
        checkbox.addEventListener('change', () => {
          const nowEnabled = checkbox.checked;
          const cfg = this.ctx.panelSettings[panelKey];
          if (cfg) cfg.enabled = nowEnabled;
          this.ctx.panels[panelKey]?.toggle(nowEnabled);
          saveToStorage(STORAGE_KEYS.panels, this.ctx.panelSettings);
          item.classList.toggle('panel-disabled', !nowEnabled);
        });

        itemsEl.appendChild(item);
      }

      section.appendChild(itemsEl);

      if (isCatCollapsed) {
        itemsEl.style.maxHeight = '0';
      }

      sidebarBody.appendChild(section);
    }
  }

  private createPanels(): void {
    const panelsGrid = document.getElementById('panelsGrid')!;

    this.ctx.currentTimeRange = 'all';

    // News panels
    const newsPanelDefs: Array<[string, string]> = [
      ['politics', t('panels.politics')],
      ['tech', t('panels.tech')],
      ['finance', t('panels.finance')],
      ['gov', t('panels.gov')],
      ['intel', t('panels.intel')],
      ['middleeast', t('panels.middleeast')],
      ['layoffs', t('panels.layoffs')],
      ['ai', t('panels.ai')],
      ['startups', t('panels.startups')],
      ['vcblogs', t('panels.vcblogs')],
      ['regionalStartups', t('panels.regionalStartups')],
      ['unicorns', t('panels.unicorns')],
      ['accelerators', t('panels.accelerators')],
      ['funding', t('panels.funding')],
      ['producthunt', t('panels.producthunt')],
      ['security', t('panels.security')],
      ['policy', t('panels.policy')],
      ['hardware', t('panels.hardware')],
      ['cloud', t('panels.cloud')],
      ['dev', t('panels.dev')],
      ['github', t('panels.github')],
      ['ipo', t('panels.ipo')],
      ['thinktanks', t('panels.thinktanks')],
      ['africa', t('panels.africa')],
      ['latam', t('panels.latam')],
      ['asia', t('panels.asia')],
      ['energy', t('panels.energy')],
    ];

    for (const [key, label] of newsPanelDefs) {
      const panel = new NewsPanel(key, label);
      this.ctx.newsPanels[key] = panel;
      this.ctx.panels[key] = panel;
    }

    // Market panels
    this.ctx.panels['heatmap'] = new HeatmapPanel();
    this.ctx.panels['markets'] = new MarketPanel();
    this.ctx.panels['commodities'] = new CommoditiesPanel();
    this.ctx.panels['crypto'] = new CryptoPanel();
    this.ctx.panels['polymarket'] = new PredictionPanel();
    this.ctx.panels['economic'] = new EconomicPanel();
    this.ctx.panels['trade-policy'] = new TradePolicyPanel();
    this.ctx.panels['supply-chain'] = new SupplyChainPanel();
    this.ctx.panels['macro-signals'] = new MacroSignalsPanel();
    this.ctx.panels['etf-flows'] = new ETFFlowsPanel();
    this.ctx.panels['stablecoins'] = new StablecoinPanel();
    this.ctx.panels['insights'] = new InsightsPanel();

    // Investments panel (no map focus)
    const investmentsPanel = new InvestmentsPanel(() => { });
    this.ctx.panels['gcc-investments'] = investmentsPanel;

    // Monitor panel
    const monitorPanel = new MonitorPanel(this.ctx.monitors);
    this.ctx.panels['monitors'] = monitorPanel;
    monitorPanel.onChanged((monitors) => {
      this.ctx.monitors = monitors;
      saveToStorage(STORAGE_KEYS.monitors, monitors);
      this.callbacks.updateMonitorResults();
    });

    // Live news
    this.ctx.panels['live-news'] = new LiveNewsPanel();

    // Service status
    this.ctx.panels['service-status'] = new ServiceStatusPanel();

    // Runtime config (desktop only)
    if (this.ctx.isDesktopApp) {
      const runtimeConfigPanel = new RuntimeConfigPanel({ mode: 'alert' });
      this.ctx.panels['runtime-config'] = runtimeConfigPanel;
    }

    // Dynamic news panels from FEEDS config
    for (const key of Object.keys(FEEDS)) {
      if (this.ctx.newsPanels[key]) continue;
      if (!Array.isArray((FEEDS as Record<string, unknown>)[key])) continue;
      const panelKey = this.ctx.panels[key] && !this.ctx.newsPanels[key] ? `${key}-news` : key;
      if (this.ctx.panels[panelKey]) continue;
      const panelConfig = DEFAULT_PANELS[panelKey] ?? DEFAULT_PANELS[key];
      const label = panelConfig?.name ?? key.charAt(0).toUpperCase() + key.slice(1);
      const panel = new NewsPanel(panelKey, label);
      this.ctx.newsPanels[key] = panel;
      this.ctx.panels[panelKey] = panel;
    }

    // Panel ordering
    const defaultOrder = Object.keys(DEFAULT_PANELS).filter(k => k !== 'map');
    const savedOrder = this.getSavedPanelOrder();
    let panelOrder = defaultOrder;
    if (savedOrder.length > 0) {
      const missing = defaultOrder.filter(k => !savedOrder.includes(k));
      const valid = savedOrder.filter(k => defaultOrder.includes(k));
      const monitorsIdx = valid.indexOf('monitors');
      if (monitorsIdx !== -1) valid.splice(monitorsIdx, 1);
      const insertIdx = valid.indexOf('politics') + 1 || 0;
      const newPanels = missing.filter(k => k !== 'monitors');
      valid.splice(insertIdx, 0, ...newPanels);
      valid.push('monitors');
      panelOrder = valid;
    }

    // Ensure live-news is first
    const liveNewsIdx = panelOrder.indexOf('live-news');
    if (liveNewsIdx > 0) {
      panelOrder.splice(liveNewsIdx, 1);
      panelOrder.unshift('live-news');
    }

    if (this.ctx.isDesktopApp) {
      const runtimeIdx = panelOrder.indexOf('runtime-config');
      if (runtimeIdx > 1) {
        panelOrder.splice(runtimeIdx, 1);
        panelOrder.splice(1, 0, 'runtime-config');
      } else if (runtimeIdx === -1) {
        panelOrder.splice(1, 0, 'runtime-config');
      }
    }

    panelOrder.forEach((key: string) => {
      const panel = this.ctx.panels[key];
      if (panel) {
        const el = panel.getElement();
        el.dataset.panelKey = key;
        this.makeDraggable(el, key);
        panelsGrid.appendChild(el);
      }
    });

    this.applyPanelSettings();
  }

  private applyTimeRangeFilterToNewsPanels(): void {
    Object.entries(this.ctx.newsByCategory).forEach(([category, items]) => {
      const panel = this.ctx.newsPanels[category];
      if (!panel) return;
      const filtered = this.filterItemsByTimeRange(items);
      if (filtered.length === 0 && items.length > 0) {
        panel.renderFilteredEmpty(`No items in ${this.getTimeRangeLabel()}`);
        return;
      }
      panel.renderNews(filtered);
    });
  }

  private filterItemsByTimeRange(items: import('@/types').NewsItem[], range: any = this.ctx.currentTimeRange): import('@/types').NewsItem[] {
    if (range === 'all') return items;
    const ranges: Record<string, number> = {
      '1h': 60 * 60 * 1000, '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000, '48h': 48 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000, 'all': Infinity,
    };
    const cutoff = Date.now() - (ranges[range] ?? Infinity);
    return items.filter((item) => {
      const ts = item.pubDate instanceof Date ? item.pubDate.getTime() : new Date(item.pubDate).getTime();
      return Number.isFinite(ts) ? ts >= cutoff : true;
    });
  }

  private getTimeRangeLabel(): string {
    const labels: Record<string, string> = {
      '1h': 'the last hour', '6h': 'the last 6 hours',
      '24h': 'the last 24 hours', '48h': 'the last 48 hours',
      '7d': 'the last 7 days', 'all': 'all time',
    };
    return labels[this.ctx.currentTimeRange] ?? 'the last 7 days';
  }

  private getSavedPanelOrder(): string[] {
    try {
      const saved = localStorage.getItem(this.ctx.PANEL_ORDER_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  savePanelOrder(): void {
    const grid = document.getElementById('panelsGrid');
    if (!grid) return;
    const order = Array.from(grid.children)
      .map((el) => (el as HTMLElement).dataset.panel)
      .filter((key): key is string => !!key);
    localStorage.setItem(this.ctx.PANEL_ORDER_KEY, JSON.stringify(order));
  }

  private makeDraggable(el: HTMLElement, key: string): void {
    el.dataset.panel = key;
    let isDragging = false;
    let dragStarted = false;
    let startX = 0;
    let startY = 0;
    let rafId = 0;
    const DRAG_THRESHOLD = 8;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (el.dataset.resizing === 'true') return;
      if (target.classList?.contains('panel-resize-handle') || target.closest?.('.panel-resize-handle')) return;
      if (target.closest('button, a, input, select, textarea, .panel-content')) return;

      isDragging = true;
      dragStarted = false;
      startX = e.clientX;
      startY = e.clientY;
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      if (!dragStarted) {
        const dx = Math.abs(e.clientX - startX);
        const dy = Math.abs(e.clientY - startY);
        if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
        dragStarted = true;
        el.classList.add('dragging');
      }
      const cx = e.clientX;
      const cy = e.clientY;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        this.handlePanelDragMove(el, cx, cy);
        rafId = 0;
      });
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      if (dragStarted) {
        el.classList.remove('dragging');
        this.savePanelOrder();
      }
      dragStarted = false;
    };

    el.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    this.panelDragCleanupHandlers.push(() => {
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      isDragging = false;
      dragStarted = false;
      el.classList.remove('dragging');
    });
  }

  private handlePanelDragMove(dragging: HTMLElement, clientX: number, clientY: number): void {
    const grid = document.getElementById('panelsGrid');
    if (!grid) return;

    dragging.style.pointerEvents = 'none';
    const target = document.elementFromPoint(clientX, clientY);
    dragging.style.pointerEvents = '';

    if (!target) return;
    const targetPanel = target.closest('.panel') as HTMLElement | null;
    if (!targetPanel || targetPanel === dragging || targetPanel.classList.contains('hidden')) return;
    if (targetPanel.parentElement !== grid) return;

    const targetRect = targetPanel.getBoundingClientRect();
    const draggingRect = dragging.getBoundingClientRect();

    const children = Array.from(grid.children);
    const dragIdx = children.indexOf(dragging);
    const targetIdx = children.indexOf(targetPanel);
    if (dragIdx === -1 || targetIdx === -1) return;

    const sameRow = Math.abs(draggingRect.top - targetRect.top) < 30;
    const targetMid = sameRow
      ? targetRect.left + targetRect.width / 2
      : targetRect.top + targetRect.height / 2;
    const cursorPos = sameRow ? clientX : clientY;

    if (dragIdx < targetIdx) {
      if (cursorPos > targetMid) {
        grid.insertBefore(dragging, targetPanel.nextSibling);
      }
    } else {
      if (cursorPos < targetMid) {
        grid.insertBefore(dragging, targetPanel);
      }
    }
  }

  private async initOllamaStatus(): Promise<void> {
    const { getSecretState, getRuntimeConfigSnapshot } = await import('@/services/runtime-config');

    const badge = document.getElementById('ollamaStatusBadge');
    if (!badge) return;

    const labelEl = badge.querySelector('.ollama-label') as HTMLElement | null;

    const applyConnected = (modelName: string): void => {
      badge.classList.remove('ollama-disconnected');
      badge.classList.add('ollama-connected');
      if (labelEl) labelEl.textContent = modelName || 'OLLAMA';
    };

    const applyDisconnected = (): void => {
      badge.classList.remove('ollama-connected');
      badge.classList.add('ollama-disconnected');
      if (labelEl) labelEl.textContent = 'OLLAMA';
    };

    const checkStatus = async (): Promise<void> => {
      const urlState = getSecretState('OLLAMA_API_URL');
      if (!urlState.present) {
        applyDisconnected();
        return;
      }

      const snapshot = getRuntimeConfigSnapshot();
      const ollamaUrl = snapshot.secrets['OLLAMA_API_URL']?.value ?? '';
      const modelName = snapshot.secrets['OLLAMA_MODEL']?.value ?? 'OLLAMA';

      if (!ollamaUrl) {
        applyDisconnected();
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${ollamaUrl}/api/tags`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          applyConnected(modelName);
        } else {
          applyDisconnected();
        }
      } catch {
        applyDisconnected();
      }
    };

    await checkStatus();
    setInterval(() => { void checkStatus(); }, 30_000);
  }

  private buildTickerPlaceholder(): string {
    const items = [
      { symbol: 'S&P 500', price: '—', change: '' },
      { symbol: 'NASDAQ', price: '—', change: '' },
      { symbol: 'DOW', price: '—', change: '' },
      { symbol: 'BTC', price: '—', change: '' },
      { symbol: 'ETH', price: '—', change: '' },
      { symbol: 'GOLD', price: '—', change: '' },
      { symbol: 'WTI OIL', price: '—', change: '' },
      { symbol: 'EUR/USD', price: '—', change: '' },
      { symbol: 'GBP/USD', price: '—', change: '' },
      { symbol: '10Y UST', price: '—', change: '' },
    ];
    // Duplicate for seamless loop
    const all = [...items, ...items];
    return all.map(item => `
      <span class="ticker-item">
        <span class="ticker-symbol">${item.symbol}</span>
        <span class="ticker-price">${item.price}</span>
        ${item.change ? `<span class="ticker-change flat">${item.change}</span>` : ''}
      </span>
    `).join('');
  }

  private async initTicker(): Promise<void> {
    const track = document.getElementById('tickerTrack');
    if (!track) return;

    const TICKER_STOCKS = [
      { symbol: '^GSPC', name: 'S&P 500', display: 'S&P 500' },
      { symbol: '^IXIC', name: 'NASDAQ', display: 'NASDAQ' },
      { symbol: '^DJI', name: 'DOW', display: 'DOW' },
      { symbol: 'GC=F', name: 'GOLD', display: 'GOLD' },
      { symbol: 'CL=F', name: 'WTI OIL', display: 'WTI OIL' },
      { symbol: 'EURUSD=X', name: 'EUR/USD', display: 'EUR/USD' },
      { symbol: 'GBPUSD=X', name: 'GBP/USD', display: 'GBP/USD' },
      { symbol: '^TNX', name: '10Y UST', display: '10Y UST' },
    ];

    const fmt = (price: number | null, symbol: string): string => {
      if (price == null) return '—';
      if (symbol.includes('USD=X') || symbol === '^TNX') return price.toFixed(4);
      if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
      return price.toFixed(2);
    };

    const fmtChange = (change: number | null): { text: string; cls: string } => {
      if (change == null) return { text: '', cls: 'flat' };
      const sign = change > 0 ? '+' : '';
      return {
        text: `${sign}${change.toFixed(2)}%`,
        cls: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
      };
    };

    const renderTicker = (items: Array<{ symbol: string; display: string; price: number | null; change: number | null }>): void => {
      // Duplicate for seamless CSS scroll loop
      const all = [...items, ...items];
      track.innerHTML = all.map(item => {
        const { text: changeText, cls: changeCls } = fmtChange(item.change);
        return `
          <span class="ticker-item">
            <span class="ticker-symbol">${item.display}</span>
            <span class="ticker-price">${fmt(item.price, item.symbol)}</span>
            ${changeText ? `<span class="ticker-change ${changeCls}">${changeText}</span>` : ''}
          </span>
        `;
      }).join('');
    };

    const refresh = async (): Promise<void> => {
      try {
        const { fetchMultipleStocks, fetchCrypto } = await import('@/services/market');
        const [stockResult, cryptoResult] = await Promise.allSettled([
          fetchMultipleStocks(TICKER_STOCKS),
          fetchCrypto(),
        ]);

        const items: Array<{ symbol: string; display: string; price: number | null; change: number | null }> = [];

        if (stockResult.status === 'fulfilled') {
          for (const d of stockResult.value.data) {
            items.push({ symbol: d.symbol, display: d.display || d.name, price: d.price, change: d.change });
          }
        } else {
          TICKER_STOCKS.forEach(s => items.push({ symbol: s.symbol, display: s.display, price: null, change: null }));
        }

        if (cryptoResult.status === 'fulfilled') {
          const btc = cryptoResult.value.find(c => c.symbol.toLowerCase() === 'btc');
          const eth = cryptoResult.value.find(c => c.symbol.toLowerCase() === 'eth');
          if (btc) items.splice(3, 0, { symbol: 'BTC', display: 'BTC', price: btc.price, change: btc.change });
          if (eth) items.splice(btc ? 4 : 3, 0, { symbol: 'ETH', display: 'ETH', price: eth.price, change: eth.change });
        }

        if (items.length > 0) renderTicker(items);
      } catch {
        // Silently ignore — placeholder stays visible
      }
    };

    await refresh();
    setInterval(() => { void refresh(); }, 60_000);
  }

  getLocalizedPanelName(panelKey: string, fallback: string): string {
    if (panelKey === 'runtime-config') {
      return t('modals.runtimeConfig.title');
    }
    const key = panelKey.replace(/-([a-z])/g, (_match, group: string) => group.toUpperCase());
    const lookup = `panels.${key}`;
    const localized = t(lookup);
    return localized === lookup ? fallback : localized;
  }

  getAllSourceNames(): string[] {
    const sources = new Set<string>();
    Object.values(FEEDS).forEach(feeds => {
      if (feeds) feeds.forEach(f => sources.add(f.name));
    });
    INTEL_SOURCES.forEach(f => sources.add(f.name));
    return Array.from(sources).sort((a, b) => a.localeCompare(b));
  }
}
