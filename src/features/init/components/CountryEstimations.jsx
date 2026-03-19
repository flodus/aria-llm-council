// src/features/init/components/CountryEstimations.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  CountryEstimations.jsx — Estimations pop / satisfaction / ARIA IRL
//
//  Calcule des valeurs indicatives selon régime + terrain à partir de
//  tables locales (ARIA_BASE, POP_BASE, SAT_BASE). Ces données sont des
//  estimations de départ — elles évoluent en cours de partie.
//
//  Dépendances : ariaI18n, shared/theme, features/init/services/labels
// ═══════════════════════════════════════════════════════════════════════════

import { useLocale } from '../../../ariaI18n';
import { FONT } from '../../../shared/theme';
import { getTerrainLabelMap } from '../services/labels';

// Constantes (pourraient être déplacées plus tard dans shared/constants/)
const ARIA_BASE = {
    republique_federale: 44,
    democratie_liberale: 48,
    monarchie_constitutionnelle: 38,
    technocratie_ia: 72,
    oligarchie: 26,
    junte_militaire: 16,
    regime_autoritaire: 20,
    monarchie_absolue: 28,
    theocracie: 18,
    communisme: 32
};

const POP_BASE = {
    coastal: 8_000_000,
    inland: 5_000_000,
    highland: 3_500_000,
    island: 2_000_000,
    archipelago: 1_500_000
};

const SAT_BASE = {
    democratie_liberale: 62,
    republique_federale: 58,
    monarchie_constitutionnelle: 55,
    technocratie_ia: 60,
    oligarchie: 40,
    junte_militaire: 35,
    regime_autoritaire: 38,
    theocracie: 50,
    communisme: 45
};

export default function CountryEstimations({ regime, terrain }) {
    const { lang } = useLocale();

    const irl = ARIA_BASE[regime] ?? 35;
    const pop = POP_BASE[terrain] ?? 5_000_000;
    const sat = SAT_BASE[regime] ?? 50;
    const ariaCol = irl >= 60 ? 'rgba(140,100,220,0.80)' : irl >= 40 ? 'rgba(100,130,200,0.70)' : 'rgba(90,110,160,0.50)';

    return (
        <div style={{
            padding: '0.4rem 0.6rem',
            background: 'rgba(200,164,74,0.02)',
            borderLeft: '2px solid rgba(200,164,74,0.12)',
            borderRadius: '2px',
            display: 'flex',
            gap: '0.8rem',
            flexWrap: 'wrap',
            alignItems: 'center'
        }}>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(140,160,200,0.50)' }}>
        👥 ~{(pop / 1e6).toFixed(1)} M hab.
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(140,160,200,0.50)' }}>
        😊 ~{sat}% sat.
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: 'rgba(140,160,200,0.50)' }}>
        🌍 {getTerrainLabelMap(lang)[terrain] || terrain}
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.43rem', color: ariaCol }}>
        ◈ ARIA IRL ~{irl}%
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize: '0.40rem', color: 'rgba(90,110,150,0.40)', fontStyle: 'italic' }}>
        — {lang === 'en' ? 'estimates' : 'estimations'}
        </span>
        </div>
    );
}
