import type { AppContext, AppModule } from '@/app/app-context';
import { SearchModal, type SearchResult } from '@/components/SearchModal';
import type { NewsItem } from '@/types';
import type { Command } from '@/config/commands';
import { TIER1_COUNTRIES } from '@/services/country-instability';
import { CURATED_COUNTRIES } from '@/config/countries';
import { PIPELINES } from '@/config/pipelines';
import { STOCK_EXCHANGES, FINANCIAL_CENTERS, CENTRAL_BANKS, COMMODITY_HUBS } from '@/config/finance-geo';
import { trackSearchResultSelected, trackCountrySelected } from '@/services/analytics';
import { t } from '@/services/i18n';
import { setTheme } from '@/utils';
import { CountryIntelManager } from '@/app/country-intel';

export interface SearchManagerCallbacks {
  openCountryBriefByCode: (code: string, country: string) => void;
}

export class SearchManager implements AppModule {
  private ctx: AppContext;
  private callbacks: SearchManagerCallbacks;
  private boundKeydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(ctx: AppContext, callbacks: SearchManagerCallbacks) {
    this.ctx = ctx;
    this.callbacks = callbacks;
  }

  init(): void {
    this.setupSearchModal();
  }

  destroy(): void {
    if (this.boundKeydownHandler) {
      document.removeEventListener('keydown', this.boundKeydownHandler);
      this.boundKeydownHandler = null;
    }
  }

  private setupSearchModal(): void {
    const searchOptions = {
      placeholder: t('modals.search.placeholderFinance'),
      hint: t('modals.search.hintFinance'),
    };
    const searchModal = new SearchModal(this.ctx.container, searchOptions);
    this.ctx.searchModal = searchModal;

    // Finance search sources
    searchModal.registerSource('exchange', STOCK_EXCHANGES.map(e => ({
      id: e.id,
      title: `${e.shortName} - ${e.name}`,
      subtitle: `${e.tier} • ${e.city}, ${e.country}${e.marketCap ? ` • $${e.marketCap}T` : ''}`,
      data: e,
    })));

    searchModal.registerSource('financialcenter', FINANCIAL_CENTERS.map(f => ({
      id: f.id,
      title: f.name,
      subtitle: `${f.type} financial center${f.gfciRank ? ` • GFCI #${f.gfciRank}` : ''}${f.specialties ? ` • ${f.specialties.slice(0, 3).join(', ')}` : ''}`,
      data: f,
    })));

    searchModal.registerSource('centralbank', CENTRAL_BANKS.map(b => ({
      id: b.id,
      title: `${b.shortName} - ${b.name}`,
      subtitle: `${b.type}${b.currency ? ` • ${b.currency}` : ''} • ${b.city}, ${b.country}`,
      data: b,
    })));

    searchModal.registerSource('commodityhub', COMMODITY_HUBS.map(h => ({
      id: h.id,
      title: h.name,
      subtitle: `${h.type} • ${h.city}, ${h.country}${h.commodities ? ` • ${h.commodities.slice(0, 3).join(', ')}` : ''}`,
      data: h,
    })));

    searchModal.registerSource('pipeline', PIPELINES.map(p => ({
      id: p.id,
      title: p.name,
      subtitle: `${p.type} ${p.operator || ''} ${p.countries?.join(' ') || ''}`.trim(),
      data: p,
    })));

    searchModal.registerSource('country', this.buildCountrySearchItems());

    searchModal.setActivePanels(Object.keys(this.ctx.panels));
    searchModal.setOnSelect((result) => this.handleSearchResult(result));
    searchModal.setOnCommand((cmd) => this.handleCommand(cmd));

    this.boundKeydownHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (this.ctx.searchModal?.isOpen()) {
          this.ctx.searchModal.close();
        } else {
          this.updateSearchIndex();
          this.ctx.searchModal?.open();
        }
      }
    };
    document.addEventListener('keydown', this.boundKeydownHandler);
  }

  private handleSearchResult(result: SearchResult): void {
    trackSearchResultSelected(result.type);
    switch (result.type) {
      case 'news': {
        const item = result.data as NewsItem;
        this.scrollToPanel('live-news');
        this.highlightNewsItem(item.link);
        break;
      }
      case 'market':
        this.scrollToPanel('markets');
        break;
      case 'prediction':
        this.scrollToPanel('polymarket');
        break;
      case 'exchange':
      case 'financialcenter':
      case 'centralbank':
      case 'commodityhub':
      case 'pipeline':
        // No map to navigate to — just scroll to relevant panel
        this.scrollToPanel('markets');
        break;
      case 'country': {
        const { code, name } = result.data as { code: string; name: string };
        trackCountrySelected(code, name, 'search');
        this.callbacks.openCountryBriefByCode(code, name);
        break;
      }
    }
  }

  private handleCommand(cmd: Command): void {
    const colonIdx = cmd.id.indexOf(':');
    if (colonIdx === -1) return;
    const category = cmd.id.slice(0, colonIdx);
    const action = cmd.id.slice(colonIdx + 1);

    switch (category) {
      case 'panel':
        this.scrollToPanel(action);
        break;

      case 'view':
        if (action === 'dark' || action === 'light') {
          setTheme(action);
        } else if (action === 'fullscreen') {
          if (document.fullscreenElement) {
            try { void document.exitFullscreen()?.catch(() => { }); } catch { }
          } else {
            const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
            if (el.requestFullscreen) {
              try { void el.requestFullscreen()?.catch(() => { }); } catch { }
            } else if (el.webkitRequestFullscreen) {
              try { el.webkitRequestFullscreen(); } catch { }
            }
          }
        } else if (action === 'settings') {
          this.ctx.unifiedSettings?.open();
        } else if (action === 'refresh') {
          window.location.reload();
        }
        break;

      case 'country': {
        const name = TIER1_COUNTRIES[action]
          || CURATED_COUNTRIES[action]?.name
          || new Intl.DisplayNames(['en'], { type: 'region' }).of(action)
          || action;
        trackCountrySelected(action, name, 'command');
        this.callbacks.openCountryBriefByCode(action, name);
        break;
      }
    }
  }

  private scrollToPanel(panelId: string): void {
    const panel = document.querySelector(`[data-panel="${panelId}"]`);
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      panel.classList.add('flash-highlight');
      setTimeout(() => panel.classList.remove('flash-highlight'), 1500);
    }
  }

  private highlightNewsItem(itemId: string): void {
    setTimeout(() => {
      const item = document.querySelector(`[data-news-id="${CSS.escape(itemId)}"]`);
      if (item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        item.classList.add('flash-highlight');
        setTimeout(() => item.classList.remove('flash-highlight'), 1500);
      }
    }, 100);
  }

  updateSearchIndex(): void {
    const sm = this.ctx.searchModal;
    if (!sm) return;

    sm.registerSource('country', this.buildCountrySearchItems());

    const newsItems = this.ctx.allNews.slice(0, 500).map(n => ({
      id: n.link,
      title: n.title,
      subtitle: n.source,
      data: n,
    }));
    sm.registerSource('news', newsItems);

    if (this.ctx.latestPredictions.length > 0) {
      sm.registerSource('prediction', this.ctx.latestPredictions.map(p => ({
        id: p.title,
        title: p.title,
        subtitle: `${Math.round(p.yesPrice)}% probability`,
        data: p,
      })));
    }

    if (this.ctx.latestMarkets.length > 0) {
      sm.registerSource('market', this.ctx.latestMarkets.map(m => ({
        id: m.symbol,
        title: `${m.symbol} - ${m.name}`,
        subtitle: `$${m.price?.toFixed(2) || 'N/A'}`,
        data: m,
      })));
    }
  }

  private buildCountrySearchItems(): { id: string; title: string; subtitle: string; data: { code: string; name: string } }[] {
    return Object.entries(TIER1_COUNTRIES).map(([code, name]) => ({
      id: code,
      title: `${CountryIntelManager.toFlagEmoji(code)} ${name}`,
      subtitle: 'Country Brief',
      data: { code, name },
    }));
  }
}
