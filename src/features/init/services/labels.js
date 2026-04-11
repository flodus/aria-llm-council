// src/features/init/services/labels.js

// ── labels.js ─────────────────────────────────────────────────────────────
// Délègue vers shared/data/worldLabels (source canonique).
// Conserve getPaysLocaux() qui reste propre à init/.
// ─────────────────────────────────────────────────────────────────────────
import { PAYS_LOCAUX } from '../../../shared/data/gameData';
import { getStats }    from '../../../shared/data/gameData';

export { getTerrainLabel, getRegimeLabel, getTerrainLabelMap, getRegimeLabelMap, getTerrainIcon, getRegimeIcon }
    from '../../../shared/data/worldLabels';

export function getPaysLocaux() {
    return getStats().pays_locaux || PAYS_LOCAUX;
}
