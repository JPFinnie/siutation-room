import type { PanelConfig, MapLayers } from '@/types';
import type { DataSourceId } from '@/services/data-freshness';

// ============================================
// FINANCE MONITOR — Panel Configuration
// ============================================
export const DEFAULT_PANELS: Record<string, PanelConfig> = {
  'live-news': { name: 'Market Headlines', enabled: true, priority: 1 },
  insights: { name: 'AI Market Insights', enabled: true, priority: 1 },
  markets: { name: 'Live Markets', enabled: true, priority: 1 },
  'markets-news': { name: 'Markets News', enabled: true, priority: 2 },
  forex: { name: 'Forex & Currencies', enabled: true, priority: 1 },
  bonds: { name: 'Fixed Income', enabled: true, priority: 1 },
  commodities: { name: 'Commodities & Futures', enabled: true, priority: 1 },
  'commodities-news': { name: 'Commodities News', enabled: true, priority: 2 },
  crypto: { name: 'Crypto & Digital Assets', enabled: true, priority: 1 },
  'crypto-news': { name: 'Crypto News', enabled: true, priority: 2 },
  centralbanks: { name: 'Central Bank Watch', enabled: true, priority: 1 },
  economic: { name: 'Economic Data', enabled: true, priority: 1 },
  'trade-policy': { name: 'Trade Policy', enabled: true, priority: 1 },
  'supply-chain': { name: 'Supply Chain', enabled: true, priority: 1 },
  'economic-news': { name: 'Economic News', enabled: true, priority: 2 },
  ipo: { name: 'IPOs, Earnings & M&A', enabled: true, priority: 1 },
  heatmap: { name: 'Sector Heatmap', enabled: true, priority: 1 },
  'macro-signals': { name: 'Market Radar', enabled: true, priority: 1 },
  derivatives: { name: 'Derivatives & Options', enabled: true, priority: 2 },
  fintech: { name: 'Fintech & Trading Tech', enabled: true, priority: 2 },
  regulation: { name: 'Financial Regulation', enabled: true, priority: 2 },
  institutional: { name: 'Hedge Funds & PE', enabled: true, priority: 2 },
  analysis: { name: 'Market Analysis', enabled: true, priority: 2 },
  'etf-flows': { name: 'BTC ETF Tracker', enabled: true, priority: 2 },
  stablecoins: { name: 'Stablecoins', enabled: true, priority: 2 },
  'gcc-investments': { name: 'GCC Investments', enabled: true, priority: 2 },
  gccNews: { name: 'GCC Business News', enabled: true, priority: 2 },
  polymarket: { name: 'Predictions', enabled: true, priority: 2 },
  monitors: { name: 'My Monitors', enabled: true, priority: 2 },
};

// Map layers are unused since we removed the globe, but keep the type for compatibility
export const DEFAULT_MAP_LAYERS: MapLayers = {} as MapLayers;
export const MOBILE_DEFAULT_MAP_LAYERS: MapLayers = {} as MapLayers;

export const LAYER_TO_SOURCE: Partial<Record<keyof MapLayers, DataSourceId[]>> = {};

// ============================================
// PANEL CATEGORY MAP
// ============================================
export const PANEL_CATEGORY_MAP: Record<string, { labelKey: string; panelKeys: string[] }> = {
  core: {
    labelKey: 'header.panelCatCore',
    panelKeys: ['live-news', 'insights'],
  },
  finMarkets: {
    labelKey: 'header.panelCatMarkets',
    panelKeys: ['markets', 'markets-news', 'heatmap', 'macro-signals', 'analysis', 'polymarket'],
  },
  fixedIncomeFx: {
    labelKey: 'header.panelCatFixedIncomeFx',
    panelKeys: ['forex', 'bonds'],
  },
  finCommodities: {
    labelKey: 'header.panelCatCommodities',
    panelKeys: ['commodities', 'commodities-news'],
  },
  cryptoDigital: {
    labelKey: 'header.panelCatCryptoDigital',
    panelKeys: ['crypto', 'crypto-news', 'etf-flows', 'stablecoins', 'fintech'],
  },
  centralBanksEcon: {
    labelKey: 'header.panelCatCentralBanks',
    panelKeys: ['centralbanks', 'economic', 'trade-policy', 'supply-chain', 'economic-news'],
  },
  dealsInstitutional: {
    labelKey: 'header.panelCatDeals',
    panelKeys: ['ipo', 'derivatives', 'institutional', 'regulation'],
  },
  gulfMena: {
    labelKey: 'header.panelCatGulfMena',
    panelKeys: ['gcc-investments', 'gccNews', 'monitors'],
  },
};

export const MONITOR_COLORS = [
  '#44ff88',
  '#ff8844',
  '#4488ff',
  '#ff44ff',
  '#ffff44',
  '#ff4444',
  '#44ffff',
  '#88ff44',
  '#ff88ff',
  '#88ffff',
];

export const STORAGE_KEYS = {
  panels: 'worldmonitor-panels',
  monitors: 'worldmonitor-monitors',
  mapLayers: 'worldmonitor-layers',
  disabledFeeds: 'worldmonitor-disabled-feeds',
} as const;
