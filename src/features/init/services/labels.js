import { getStats, PAYS_LOCAUX } from '../../../Dashboard_p1';

export function getTerrainLabels() {
    const t = getStats().terrains;
    return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.name]));
}

export function getRegimeLabels() {
    const r = getStats().regimes;
    return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.name]));
}

export function getPaysLocaux() {
    return getStats().pays_locaux || PAYS_LOCAUX;
}
