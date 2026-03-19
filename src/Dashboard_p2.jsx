// src/Dashboard_p2.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  Dashboard_p2.jsx  —  Assembleur MapSVG (nouvelle architecture hexagonale)
//
//  Responsabilités :
//  - Générer le monde (WorldEngine) au montage, stocker en state
//  - Régénérer si le seed change (nouveau nom de monde)
//  - Placer les pays à chaque mise à jour de countries
//  - Passer world + countries à HexGrid
//  - Ré-exporter MapSVG avec la même interface qu'avant
//    (worldData, countries, alliances, selectedCountry, onCountryClick, onCountryHover)
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { HexGrid } from './features/map/HexGrid';
import { generateWorld, placeCountries, strToSeed, MAP_W, MAP_H } from './features/world/services/WorldEngine';
import { loadLang, t } from './ariaI18n';

// ── Génération asynchrone (évite de bloquer le thread principal) ──────────
// Le monde (~3300 hex + FBM) prend ~20–60ms selon le device.
// On le calcule hors du cycle React via setTimeout(0).
function useWorldGeneration(seed) {
    const [world, setWorld] = useState(null);
    const [loading, setLoading] = useState(true);
    const lastSeed = useRef(null);

    useEffect(() => {
        const numSeed = typeof seed === 'string' ? strToSeed(seed) : (seed || 42);
        if (numSeed === lastSeed.current && world) return;
        lastSeed.current = numSeed;

        setLoading(true);
        setWorld(null);

        const id = setTimeout(() => {
            try {
                const w = generateWorld(numSeed);
                setWorld(w);
            } catch (e) {
                console.error('[WorldEngine] generateWorld error:', e);
            } finally {
                setLoading(false);
            }
        }, 0);

        return () => clearTimeout(id);
    }, [seed]);

    return { world, loading };
}

// ── Placement pays asynchrone ─────────────────────────────────────────────
function usePlacedWorld(baseWorld, countries) {
    const [placed, setPlaced] = useState(null);
    const prevCountryIds   = useRef('');
    const prevBaseWorldKey = useRef(null);  // track which world we last placed on

    useEffect(() => {
        if (!baseWorld || !countries?.length) { setPlaced(null); return; }

        const idStr    = countries.map(c => c.id).join(',');
        const worldKey = baseWorld.seed ?? 0;

        // Re-place if countries changed OR if baseWorld changed (new world generated)
        const sameCountries = idStr === prevCountryIds.current;
        const sameWorld     = worldKey === prevBaseWorldKey.current;
        if (sameCountries && sameWorld && placed) return;

        prevCountryIds.current   = idStr;
        prevBaseWorldKey.current = worldKey;

        const id = setTimeout(() => {
            try {
                // Cloner le monde pour ne pas muter l'original
                const clone = {
                    ...baseWorld,
                    grid:       baseWorld.grid,   // Map partagée (lecture seule dans placeCountries)
        masses:     [...baseWorld.masses],
        hulls:      new Map(baseWorld.hulls),
                              placements: [],
                };
                // Réinitialiser les countryId sur les hex
                for (const h of clone.grid.values()) h.countryId = null;

                const w = placeCountries(clone, countries);
                setPlaced(w);
            } catch (e) {
                console.error('[WorldEngine] placeCountries error:', e);
            }
        }, 0);

        return () => clearTimeout(id);
    }, [baseWorld, countries]);

    return placed;
}

// ── Composant MapSVG (interface publique, rétro-compatible) ───────────────
export function MapSVG({
    worldData,          // ignoré — seed extrait de worldData.seed ou du nom
    countries = [],
    alliances = [],
    selectedCountry,
    onCountryClick,
    onCountryHover,
    W = MAP_W,
    H = MAP_H,
}) {
    // Seed depuis worldData (passé par Dashboard_p1 / useARIA)
    const seed = worldData?.seed || worldData?.name || 'ARIA';

    const { world: baseWorld, loading } = useWorldGeneration(seed);
    const placedWorld = usePlacedWorld(baseWorld, countries);

    const displayWorld = placedWorld || baseWorld;

    return (
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
        {/* Indicateur de génération */}
        {loading && (
            <div style={{
                position:'absolute', inset:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'#030608', zIndex:10,
                fontFamily:"'Cinzel',serif", fontSize:'12px',
                letterSpacing:'0.30em', color:'rgba(200,164,74,0.40)',
            }}>
            {t('DASH_MAP_GENERATING', loadLang())}
            </div>
        )}

        <HexGrid
        world={displayWorld}
        countries={countries}
        selectedCountry={selectedCountry}
        alliances={alliances}
        onCountryClick={onCountryClick}
        onCountryHover={onCountryHover}
        />
        </div>
    );
}

export default MapSVG;
