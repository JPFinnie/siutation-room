const fs = require('fs');
const file = 'src/app/data-loader.ts';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/import type \{ TimeRange \} from '@\/components';/g, "export type TimeRange = '1h' | '6h' | '24h' | '48h' | '7d' | 'all';");
c = c.replace(/fetchMilitaryFlights,\s*/g, '');
c = c.replace(/fetchUSNIFleetReport,\s*/g, '');
c = c.replace(/import \{ maybeShowDownloadBanner \} from '@\/components\/DownloadBanner';\s*/g, '');
c = c.replace(/import \{ mountCommunityWidget \} from '@\/components\/CommunityWidget';\s*/g, '');
c = c.replace(/StrategicPosturePanel,\s*/g, '');
c = c.replace(/as (UcdpEvents|Displacement|ClimateAnomaly|PopulationExposure|CII|Giving|TechReadiness)Panel/g, 'as any');
c = c.replace(/SITE_VARIANT === '(happy|tech|full)'/g, "(SITE_VARIANT as string) === '$1'");
c = c.replace(/return ranges\[range\];/g, 'return ranges[range] as number;');
c = c.replace(/return labels\[range\];/g, 'return labels[range] as string;');
c = c.replace(/fetchUSNIFleetReport\(\)\.then\(\(report\)/g, 'fetchUSNIFleetReport().then((report: any)');
c = c.replace(/ucdpEvts\.slice\(0, 10\)\.map\(\(e\)/g, 'ucdpEvts.slice(0, 10).map((e: any)');
c = c.replace(/maybeShowDownloadBanner\(\);/g, '');
c = c.replace(/mountCommunityWidget\(document\.getElementById\('community-widget-container'\)\);/g, '');

const stubs = `const fetchMilitaryFlights = async () => ({ flights: [], clusters: [] });
const fetchUSNIFleetReport = async () => null;
`;

if (!c.includes('fetchMilitaryFlights = async')) {
    c = stubs + c;
}

fs.writeFileSync(file, c);
