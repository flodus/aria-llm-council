// src/features/init/services/labels.js

// ── labels.js ─────────────────────────────────────────────────────────────
// Délègue vers shared/data/worldLabels (source canonique).
// Conserve getPaysLocaux() qui reste propre à init/.
// ─────────────────────────────────────────────────────────────────────────
import { PAYS_LOCAUX } from '../../../Dashboard_p1';
import { getStats }    from '../../../Dashboard_p1';

export { getTerrainLabel, getRegimeLabel, getTerrainLabelMap, getRegimeLabelMap }
    from '../../../shared/data/worldLabels';

export function getPaysLocaux() {
    return getStats().pays_locaux || PAYS_LOCAUX;
}
