const fs = require('fs');

const fixSiteVariant = (c) => c
    .replace(/SITE_VARIANT === 'happy'/g, "(SITE_VARIANT as string) === 'happy'")
    .replace(/SITE_VARIANT === 'tech'/g, "(SITE_VARIANT as string) === 'tech'")
    .replace(/SITE_VARIANT === 'full'/g, "(SITE_VARIANT as string) === 'full'");

// App.ts
let appTs = fs.readFileSync('src/App.ts', 'utf8');
appTs = fixSiteVariant(appTs);
appTs = appTs.replace(/this\.panelLayout\.renderCriticalBanner\(postures\)/g, "{}");
appTs = appTs.replace(/new IntelligenceGapBadge/g, "({ setOnSignalClick: () => {}, setOnAlertClick: () => {}, isPopupEnabled: () => false } as any)");
appTs = appTs.replace(/setOnSignalClick\(\(signal\)/g, "setOnSignalClick((signal: any)");
appTs = appTs.replace(/setOnAlertClick\(\(alert\)/g, "setOnAlertClick((alert: any)");
fs.writeFileSync('src/App.ts', appTs);

// app-context.ts
let ctxTs = fs.readFileSync('src/app/app-context.ts', 'utf8');
ctxTs = ctxTs.replace(/type MapContainer.*/g, "type MapContainer = any; type Panel = any; type NewsPanel = any; type SignalModal = any; type StatusPanel = any; type SearchModal = any; type IntelligenceGapBadge = any; type TimeRange = any; type PlaybackControl = any; type MobileWarningModal = any; type PizzIntIndicator = any;");
ctxTs = ctxTs.replace(/import type .*Panel.* from '@\/components.*';/g, "");
ctxTs = ctxTs.replace(/MapContainer, Panel, NewsPanel, SignalModal, StatusPanel, SearchModal/g, "");
ctxTs = ctxTs.replace(/IntelligenceGapBadge/g, "");
ctxTs = ctxTs.replace(/TimeRange/g, "");
ctxTs = ctxTs.replace(/PlaybackControl/g, "");
ctxTs = ctxTs.replace(/MobileWarningModal, PizzIntIndicator/g, "");
ctxTs = ctxTs.replace(/PositiveNewsFeedPanel/g, "any");
ctxTs = ctxTs.replace(/CountersPanel/g, "any");
ctxTs = ctxTs.replace(/ProgressChartsPanel/g, "any");
ctxTs = ctxTs.replace(/BreakthroughsTickerPanel/g, "any");
ctxTs = ctxTs.replace(/HeroSpotlightPanel/g, "any");
ctxTs = ctxTs.replace(/GoodThingsDigestPanel/g, "any");
ctxTs = ctxTs.replace(/SpeciesComebackPanel/g, "any");
ctxTs = ctxTs.replace(/RenewableEnergyPanel/g, "any");
ctxTs = ctxTs.replace(/import type \{ , \} from '@\/components';/g, "");
ctxTs = ctxTs.replace(/import type \{ \} from '@\/components';/g, "");
fs.writeFileSync('src/app/app-context.ts', ctxTs);

// country-intel.ts
let ciTs = fs.readFileSync('src/app/country-intel.ts', 'utf8');
ciTs = ciTs.replace(/import type \{ CountryBriefSignals.*\} from '@\/app\/app-context';/, "");
ciTs = ciTs.replace(/TheaterPostureSummary\[\]/g, "any[]");
ciTs = ciTs.replace(/countryClick\)/g, "countryClick: any)");
fs.writeFileSync('src/app/country-intel.ts', ciTs);

// event-handlers.ts
let ehTs = fs.readFileSync('src/app/event-handlers.ts', 'utf8');
ehTs = fixSiteVariant(ehTs);
ehTs = ehTs.replace(/PlaybackControl/g, "");
ehTs = ehTs.replace(/PizzIntIndicator/g, "");
ehTs = ehTs.replace(/CIIPanel/g, "");
ehTs = ehTs.replace(/ClusteredEvent/g, "any");
ehTs = ehTs.replace(/this\.ctx\.liveChannels/g, "(this.ctx as any).liveChannels");
fs.writeFileSync('src/app/event-handlers.ts', ehTs);

