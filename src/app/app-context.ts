// @ts-nocheck
import type { NewsItem, Monitor, PanelConfig, MapLayers, InternetOutage, SocialUnrestEvent, MilitaryFlight, MilitaryFlightCluster, MilitaryVessel, MilitaryVesselCluster, CyberThreat, USNIFleetReport } from '@/types';

import type { } from '@/components';
import type { MarketData, ClusteredEvent } from '@/types';
import type { PredictionMarket } from '@/services/prediction';
import type { } from '@/components';
import type { Earthquake } from '@/services/earthquakes';
import type { CountryBriefPage } from '@/components/CountryBriefPage';
import type { CountryTimeline } from '@/components/CountryTimeline';
import type { } from '@/components';
import type { ExportPanel } from '@/utils';
import type { UnifiedSettings } from '@/components/UnifiedSettings';
import type { } from '@/components';
import type { ParsedMapUrlState } from '@/utils';








import type { TvModeController } from '@/services/tv-mode';

export interface CountryBriefSignals {
  protests: number;
  militaryFlights: number;
  militaryVessels: number;
  outages: number;
  earthquakes: number;
  displacementOutflow: number;
  climateStress: number;
  conflictEvents: number;
  isTier1: boolean;
}

export interface IntelligenceCache {
  outages?: InternetOutage[];
  protests?: { events: SocialUnrestEvent[]; sources: { acled: number; gdelt: number } };
  military?: { flights: MilitaryFlight[]; flightClusters: MilitaryFlightCluster[]; vessels: MilitaryVessel[]; vesselClusters: MilitaryVesselCluster[] };
  earthquakes?: Earthquake[];
  usniFleet?: USNIFleetReport;
}

export interface AppModule {
  init(): void | Promise<void>;
  destroy(): void;
}

export interface AppContext {
  map: MapContainer | null;
  readonly isMobile: boolean;
  readonly isDesktopApp: boolean;
  readonly container: HTMLElement;

  panels: Record<string, Panel>;
  newsPanels: Record<string, NewsPanel>;
  panelSettings: Record<string, PanelConfig>;

  mapLayers: MapLayers;

  allNews: NewsItem[];
  newsByCategory: Record<string, NewsItem[]>;
  latestMarkets: MarketData[];
  latestPredictions: PredictionMarket[];
  latestClusters: ClusteredEvent[];
  intelligenceCache: IntelligenceCache;
  cyberThreatsCache: CyberThreat[] | null;

  disabledSources: Set<string>;
  currentTimeRange: any;

  inFlight: Set<string>;
  seenGeoAlerts: Set<string>;
  monitors: Monitor[];

  signalModal: SignalModal | null;
  statusPanel: StatusPanel | null;
  searchModal: SearchModal | null;
  findingsBadge: | null;
  playbackControl: | null;
  exportPanel: ExportPanel | null;
  unifiedSettings: UnifiedSettings | null;
  mobileWarningModal: MobileWarningModal | null;
  pizzintIndicator: PizzIntIndicator | null;
  countryBriefPage: CountryBriefPage | null;
  countryTimeline: CountryTimeline | null;

  // Happy variant state
  positivePanel: any | null;
  countersPanel: any | null;
  progressPanel: any | null;
  breakthroughsPanel: any | null;
  heroPanel: any | null;
  digestPanel: any | null;
  speciesPanel: any | null;
  renewablePanel: any | null;
  tvMode: TvModeController | null;
  happyAllItems: NewsItem[];
  isDestroyed: boolean;
  isPlaybackMode: boolean;
  isIdle: boolean;
  initialLoadComplete: boolean;

  initialUrlState: ParsedMapUrlState | null;
  readonly PANEL_ORDER_KEY: string;
  readonly PANEL_SPANS_KEY: string;
}

export type MapContainer = any; export type Panel = any; export type NewsPanel = any; export type SignalModal = any; export type StatusPanel = any; export type SearchModal = any; export type IntelligenceGapBadge = any; export type TimeRange = any; export type PlaybackControl = any; export type MobileWarningModal = any; export type PizzIntIndicator = any; export type ClusteredEvent = any; export type StrategicPosturePanel = any;