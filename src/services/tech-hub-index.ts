/**
 * Tech Hub Index service -- stubbed.
 *
 * The config data sources (startup-ecosystems, tech-companies, tech-geo) have
 * been removed as part of the finance-only migration.  All public functions now
 * return empty results so that callers continue to compile.
 */

export interface TechHubLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  type: 'ecosystem' | 'company' | 'hub';
  tier: 'mega' | 'major' | 'emerging';
  keywords: string[];
}

export interface HubMatch {
  hubId: string;
  hub: TechHubLocation;
  confidence: number;
  matchedKeyword: string;
}

export function inferHubsFromTitle(_title: string): HubMatch[] {
  return [];
}

export function getHubById(_hubId: string): TechHubLocation | undefined {
  return undefined;
}

export function getAllHubs(): TechHubLocation[] {
  return [];
}

export function getHubsByTier(_tier: 'mega' | 'major' | 'emerging'): TechHubLocation[] {
  return [];
}
