import { isFeatureAvailable, type RuntimeFeatureId } from './runtime-config';

export type LocalityClass = 'fully-local' | 'api-key' | 'cloud-fallback';

export interface DesktopParityFeature {
  id: string;
  panel: string;
  serviceFiles: string[];
  apiRoutes: string[];
  apiHandlers: string[];
  locality: LocalityClass;
  fallback: string;
  priority: 1 | 2 | 3;
}

export interface DesktopReadinessCheck {
  id: string;
  label: string;
  ready: boolean;
}

const keyBackedFeatures: RuntimeFeatureId[] = [
  'aiOllama',
  'economicFred',
  'energyEia',
  'finnhubMarkets',
  'wtoTrade',
  'supplyChain',
];

export const DESKTOP_PARITY_FEATURES: DesktopParityFeature[] = [
  {
    id: 'live-news',
    panel: 'LiveNewsPanel',
    serviceFiles: ['src/services/live-news.ts'],
    apiRoutes: ['/api/youtube/live'],
    apiHandlers: ['api/youtube/live.js'],
    locality: 'fully-local',
    fallback: 'Channel fallback video IDs are used when live detection fails.',
    priority: 1,
  },
  {
    id: 'monitor',
    panel: 'MonitorPanel',
    serviceFiles: [],
    apiRoutes: [],
    apiHandlers: [],
    locality: 'fully-local',
    fallback: 'Keyword monitoring runs fully client-side on loaded news corpus.',
    priority: 1,
  },
  {
    id: 'summaries',
    panel: 'Summaries',
    serviceFiles: ['src/services/summarization.ts'],
    apiRoutes: ['/api/news/v1/summarize-article'],
    apiHandlers: ['server/worldmonitor/news/v1/handler.ts'],
    locality: 'api-key',
    fallback: 'Browser summarizer executes when hosted LLM providers are unavailable.',
    priority: 2,
  },
  {
    id: 'market-panel',
    panel: 'MarketPanel',
    serviceFiles: ['src/services/market/index.ts', 'src/services/prediction/index.ts'],
    apiRoutes: ['/api/market/v1/list-crypto-quotes', '/api/market/v1/list-stablecoin-markets', '/api/market/v1/list-etf-flows'],
    apiHandlers: ['server/worldmonitor/market/v1/handler.ts'],
    locality: 'fully-local',
    fallback: 'Multi-source market fetchers degrade to remaining providers and cached values.',
    priority: 2,
  },
];

export function getNonParityFeatures(): DesktopParityFeature[] {
  return DESKTOP_PARITY_FEATURES.filter(feature => feature.locality !== 'fully-local');
}

export function getDesktopReadinessChecks(localBackendEnabled: boolean): DesktopReadinessCheck[] {
  return [
    { id: 'startup', label: 'Desktop startup + sidecar API health', ready: localBackendEnabled },
    { id: 'map', label: 'Map rendering (local layers + static geo assets)', ready: true },
    { id: 'core-intel', label: 'Core intelligence panels (Live News, Monitor)', ready: true },
    { id: 'summaries', label: 'Summaries (provider-backed or browser fallback)', ready: isFeatureAvailable('aiOllama') },
    { id: 'market', label: 'Market panel live data paths', ready: true },
  ];
}

export function getKeyBackedAvailabilitySummary(): { available: number; total: number } {
  const available = keyBackedFeatures.filter(featureId => isFeatureAvailable(featureId)).length;
  return { available, total: keyBackedFeatures.length };
}
