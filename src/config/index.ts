// Configuration exports — Finance Monitor

export { SITE_VARIANT } from './variant';

// Shared base configuration
export {
  REFRESH_INTERVALS,
} from './variants/base';

// Market data
export { SECTORS, COMMODITIES, MARKET_SYMBOLS, CRYPTO_MAP } from './markets';

// Feeds configuration
export {
  SOURCE_TIERS,
  getSourceTier,
  SOURCE_TYPES,
  getSourceType,
  getSourcePropagandaRisk,
  ALERT_KEYWORDS,
  ALERT_EXCLUSIONS,
  type SourceRiskProfile,
  type SourceType,
  FEEDS,
  INTEL_SOURCES,
} from './feeds';

// Panel configuration
export {
  DEFAULT_PANELS,
  DEFAULT_MAP_LAYERS,
  MOBILE_DEFAULT_MAP_LAYERS,
  LAYER_TO_SOURCE,
  PANEL_CATEGORY_MAP,
  MONITOR_COLORS,
  STORAGE_KEYS,
} from './panels';

// Entity registry
export {
  ENTITY_REGISTRY,
  getEntityById,
  type EntityType,
  type EntityEntry,
} from './entities';

// Finance-specific geo data
export {
  STOCK_EXCHANGES,
  FINANCIAL_CENTERS,
  CENTRAL_BANKS,
  COMMODITY_HUBS,
  type StockExchange,
  type FinancialCenter,
  type CentralBank,
  type CommodityHub,
} from './finance-geo';

// Gulf FDI investment database
export { GULF_INVESTMENTS } from './gulf-fdi';

// Pipelines (for energy finance context)
export { PIPELINES, PIPELINE_COLORS } from './pipelines';

// Trade routes
export { TRADE_ROUTES } from './trade-routes';
