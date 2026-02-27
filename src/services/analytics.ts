/**
 * Analytics Service — All no-ops for local-only Finance Monitor
 */

export async function initAnalytics(): Promise<void> {}
export function trackEvent(_name: string, _props?: Record<string, unknown>): void {}
export function trackEventBeforeUnload(_name: string, _props?: Record<string, unknown>): void {}
export function trackPanelView(_panelId: string): void {}
export function trackApiKeysSnapshot(): void {}
export function trackLLMUsage(_provider: string, _model: string, _cached: boolean): void {}
export function trackLLMFailure(_lastProvider: string): void {}
export function trackPanelResized(_panelId: string, _newSpan: number): void {}
export function trackVariantSwitch(_from: string, _to: string): void {}
export function trackMapLayerToggle(_layerId: string, _enabled: boolean, _source: 'user' | 'programmatic'): void {}
export function trackCountryBriefOpened(_countryCode: string): void {}
export function trackThemeChanged(_theme: string): void {}
export function trackLanguageChange(_language: string): void {}
export function trackFeatureToggle(_featureId: string, _enabled: boolean): void {}
export function trackSearchUsed(_queryLength: number, _resultCount: number): void {}
export function trackMapViewChange(_view: string): void {}
export function trackCountrySelected(_code: string, _name: string, _source: string): void {}
export function trackSearchResultSelected(_resultType: string): void {}
export function trackPanelToggled(_panelId: string, _enabled: boolean): void {}
export function trackFindingClicked(_id: string, _source: string, _type: string, _priority: string): void {}
export function trackUpdateShown(_current: string, _remote: string): void {}
export function trackUpdateClicked(_version: string): void {}
export function trackUpdateDismissed(_version: string): void {}
export function trackCriticalBannerAction(_action: string, _theaterId: string): void {}
export function trackDownloadClicked(_platform: string): void {}
export function trackDownloadBannerDismissed(): void {}
export function trackWebcamSelected(_webcamId: string, _city: string, _viewMode: string): void {}
export function trackWebcamRegionFiltered(_region: string): void {}
export function trackDeeplinkOpened(_type: string, _target: string): void {}
