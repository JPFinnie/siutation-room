import './styles/base-layer.css';
import './styles/modern-ui.css';
import { App } from './App';
import { inject as injectAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

injectAnalytics();
injectSpeedInsights();

// Suppress unhandled rejections from autoplay policy etc.
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.name === 'NotAllowedError') e.preventDefault();
});

import { debugInjectTestEvents, debugGetCells, getCellCount } from '@/services/geo-convergence';
import { initMetaTags } from '@/services/meta-tags';
import { installRuntimeFetchPatch } from '@/services/runtime';
import { loadDesktopSecrets } from '@/services/runtime-config';
import { applyStoredTheme } from '@/utils/theme-manager';
import { SITE_VARIANT } from '@/config/variant';
import { clearChunkReloadGuard, installChunkReloadGuard } from '@/bootstrap/chunk-reload';

// Auto-reload on stale chunk 404s after deployment
const chunkReloadStorageKey = installChunkReloadGuard(__APP_VERSION__);

// Initialize dynamic meta tags for sharing
initMetaTags();

// In desktop mode, route /api/* calls to the local Tauri sidecar backend.
installRuntimeFetchPatch();
loadDesktopSecrets().catch(() => {});

// Apply stored theme preference before app initialization
applyStoredTheme();

// Set data-variant on <html> for CSS theme overrides
document.documentElement.dataset.variant = SITE_VARIANT;

// Remove no-transition class after first paint
requestAnimationFrame(() => {
  document.documentElement.classList.remove('no-transition');
});

// Clear stale settings-open flag
localStorage.removeItem('wm-settings-open');

// Standalone windows
const urlParams = new URL(location.href).searchParams;
if (urlParams.get('settings') === '1') {
  void Promise.all([import('./services/i18n'), import('./settings-window')]).then(
    async ([i18n, m]) => {
      await i18n.initI18n();
      m.initSettingsWindow();
    }
  );
} else if (urlParams.get('live-channels') === '1') {
  void Promise.all([import('./services/i18n'), import('./live-channels-window')]).then(
    async ([i18n, m]) => {
      await i18n.initI18n();
      m.initLiveChannelsWindow();
    }
  );
} else {
  const app = new App('app');
  app
    .init()
    .then(() => {
      clearChunkReloadGuard(chunkReloadStorageKey);
    })
    .catch(console.error);
}

// Debug helpers for geo-convergence testing
(window as unknown as Record<string, unknown>).geoDebug = {
  inject: debugInjectTestEvents,
  cells: debugGetCells,
  count: getCellCount,
};

// Suppress native WKWebView context menu in Tauri
if ('__TAURI_INTERNALS__' in window || '__TAURI__' in window) {
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
    e.preventDefault();
  });
}

