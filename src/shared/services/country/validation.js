// ═══════════════════════════════════════════════════════════════════════════
//  validation.js — Validation et matching de noms de pays
//
//  Stratégie en 3 passes :
//    1. Recherche directe RestCountries (/name/)
//    1b. Endpoint /translation/ pour les noms français
//    2. Fuzzy local sur /all (Levenshtein + phonétique)
//
//  Dépendances : RestCountries API (externe)
//  Exporté via : shared/services/country/index.js
// ═══════════════════════════════════════════════════════════════════════════

// ── Utilitaires de normalisation ─────────────────────────────────────────

/** Normalise une chaîne : minuscules, sans accents, sans espaces en bordure */
const _norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();

/** Distance de Levenshtein — retourne 99 si les longueurs diffèrent de plus de 4 */
const _lev = (a, b) => {
    if (Math.abs(a.length-b.length) > 4) return 99;
    const dp = Array.from({length:a.length+1},(_,i)=>Array.from({length:b.length+1},(_,j)=>i||j));
    for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++)
        dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    return dp[a.length][b.length];
};

/** Normalisation vocalique FR → forme phonétique simplifiée (ex: "eau" → "o") */
const _mapV = s => s.replace(/ou$/,'u').replace(/eau/g,'o').replace(/ai|ei/g,'e')
.replace(/ie$/,'i').replace(/ique$/,'ic').replace(/que$/,'c');

// ── Fonctions exportées ───────────────────────────────────────────────────

/**
 * Compare une requête utilisateur à un nom de pays.
 * Teste : égalité exacte, préfixe, phonétique vocalique, Levenshtein, squelette consonantique.
 * @returns {'found'|'suggestion'|null}
 */
export const rcMatch = (q, name) => {
    const nq = _norm(q), nr = _norm(name);
    const parts = [nr, ...nr.split(/[\s-]+/)];
    for (const r of parts) {
        if (!r || r.length < 2) continue;
        const ratio = Math.min(nq.length,r.length)/Math.max(nq.length,r.length);
        if (nq === r) return 'found';
        if (r.startsWith(nq) && nq.length >= r.length*0.85) return 'found';
        if (_mapV(nq) === _mapV(r) && nq.length >= 3) return 'found';
        if (_lev(nq,r) <= 2 && ratio >= 0.70 && nq.length >= 3) return 'suggestion';
        const ph = s => s.replace(/ph/g,'f').replace(/qu/g,'k').replace(/w/g,'v')
        .replace(/[aeiou]/g,'').replace(/[^a-z]/g,'');
        if (ph(nq)===ph(r) && ph(nq).length>=3 && ratio>=0.70) return 'suggestion';
    }
    return null;
};

/** Retourne le nom d'affichage localisé d'un résultat RestCountries */
export const rcDisplayName = (rc, lang) =>
lang==='fr' ? (rc.translations?.fra?.common||rc.name?.common||'') : (rc.name?.common||'');

// Cache pour /all
let _allCountriesCache = null;

/** Charge et met en cache la liste complète RestCountries (/all) pour le fuzzy pass 2 */
export const getAllCountries = async () => {
    if (_allCountriesCache) return _allCountriesCache;
    try {
        const r = await fetch(
            'https://restcountries.com/v3.1/all?fields=name,flags,population,translations',
            { signal: AbortSignal.timeout(6000) }
        );
        if (r.ok) _allCountriesCache = await r.json();
    } catch(_) {}
    return _allCountriesCache || [];
};

/**
 * Valide un nom de pays saisi librement via RestCountries (sans appel LLM).
 * @param {string} query - Saisie utilisateur
 * @param {string} lang  - Langue courante ('fr'|'en')
 * @returns {Promise<{status:'found'|'suggestion'|'notfound'|'error', displayName:string|null, canonicalName:string|null}>}
 */
export const validateCountryWithAI = async (query, lang) => {
    if (!query || query.length < 2) return { status:'notfound', displayName:null, canonicalName:null };

    const apiQuery = _norm(query);

    // PASS 1 : recherche directe RestCountries
    let data = [];
    try {
        const r = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(apiQuery)}?fields=name,flags,population,translations`,
                              { signal: AbortSignal.timeout(4000) }
        );
        if (r.ok) data = await r.json();
    } catch(_) { return { status:'error', displayName:null, canonicalName:null }; }

    let bestStatus = null, bestRc = null;
    for (const rc of (Array.isArray(data)?data:[]).slice(0,8)) {
        const names = [rc.name?.common,rc.name?.official,rc.translations?.fra?.common].filter(Boolean);
        for (const name of names) {
            const m = rcMatch(query, name);
            if (m==='found') { bestStatus='found'; bestRc=rc; break; }
            if (m==='suggestion' && bestStatus!=='found') { bestStatus='suggestion'; bestRc=rc; }
        }
        if (bestStatus==='found') break;
    }
    if (bestStatus && bestRc) {
        return { status:bestStatus, displayName:rcDisplayName(bestRc,lang), canonicalName:bestRc.name?.common||query };
    }

    // PASS 1b (FR) : endpoint /translation/
    if (lang === 'fr' && !data.length) {
        try {
            const r2 = await fetch(
                `https://restcountries.com/v3.1/translation/${encodeURIComponent(apiQuery)}?fields=name,flags,population,translations`,
                                   { signal: AbortSignal.timeout(4000) }
            );
            if (r2.ok) {
                const data2 = await r2.json();
                let st2 = null, rc2 = null;
                for (const rc of (Array.isArray(data2)?data2:[]).slice(0,8)) {
                    const names = [rc.name?.common,rc.name?.official,rc.translations?.fra?.common].filter(Boolean);
                    for (const name of names) {
                        const m = rcMatch(query, name);
                        if (m==='found') { st2='found'; rc2=rc; break; }
                        if (m==='suggestion' && st2!=='found') { st2='suggestion'; rc2=rc; }
                    }
                    if (st2==='found') break;
                }
                if (!st2 && data2[0]) { st2='found'; rc2=data2[0]; }
                if (st2 && rc2) {
                    return { status:st2, displayName:rcDisplayName(rc2,lang), canonicalName:rc2.name?.common||query };
                }
            }
        } catch(_) {}
    }

    // PASS 2 : fuzzy local sur /all
    const all = await getAllCountries();
    let bestScore = 99, best2Rc = null;
    for (const rc of all) {
        const names = [rc.name?.common,rc.name?.official,rc.translations?.fra?.common].filter(Boolean);
        for (const name of names) {
            const nq = _norm(query), nr = _norm(name);
            const d  = _lev(nq, nr.slice(0, nq.length+3));
            const ratio = Math.min(nq.length,nr.length)/Math.max(nq.length,nr.length);
            if (d < bestScore && d <= 3 && ratio >= 0.60 && nq.length >= 3) {
                bestScore = d; best2Rc = rc;
            }
        }
    }
    if (best2Rc && bestScore <= 3) {
        const names2 = [best2Rc.name?.common,best2Rc.name?.official,best2Rc.translations?.fra?.common].filter(Boolean);
        let st2 = null;
        for (const name of names2) { const m=rcMatch(query,name); if(m&&!st2) st2=m; }
        const status = st2 || (bestScore<=1?'found':'suggestion');
        return { status, displayName:rcDisplayName(best2Rc,lang), canonicalName:best2Rc.name?.common||query };
    }

    return { status:'notfound', displayName:null, canonicalName:null };
};
