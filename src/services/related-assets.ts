import type { ClusteredEvent, RelatedAsset, AssetType, RelatedAssetContext } from '@/types';
import { t } from '@/services/i18n';

/**
 * Related assets service -- stubbed.
 *
 * The geo-config data sources (INTEL_HOTSPOTS, CONFLICT_ZONES, MILITARY_BASES,
 * UNDERSEA_CABLES, NUCLEAR_FACILITIES, AI_DATA_CENTERS) have been removed as
 * part of the finance-only migration. All public functions now return empty/no-op
 * results so that callers continue to compile.
 */

const MAX_DISTANCE_KM = 600;

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const originLat = toRad(lat1);
  const destLat = toRad(lat2);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(originLat) * Math.cos(destLat) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

export function getClusterAssetContext(_cluster: ClusteredEvent): RelatedAssetContext | null {
  return null;
}

export function getAssetLabel(type: AssetType): string {
  return t(`components.relatedAssets.${type}`);
}

export function getNearbyInfrastructure(
  _lat: number, _lon: number, _types: AssetType[]
): RelatedAsset[] {
  return [];
}

export { haversineDistanceKm };

export { MAX_DISTANCE_KM };
