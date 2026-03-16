import { useState, useEffect, useRef } from 'react';
import { useLocale, t } from '../../../ariaI18n';
import {
    FONT, CARD_STYLE, INPUT_STYLE, SELECT_STYLE,
    BTN_PRIMARY, BTN_SECONDARY, labelStyle,
    wrap, mCard, tag
} from '../../../shared/theme';
import { getTerrainLabels, getRegimeLabels, getPaysLocaux } from '../services/labels';
import { getRealCountries } from '../services/realCountries';
import CountryInfoCard from './CountryInfoCard';
import ContextPanel from './ContextPanel';

// ── Fonctions de validation (à déplacer plus tard dans services/) ──
const _norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
const _lev  = (a, b) => {
    if (Math.abs(a.length-b.length) > 4) return 99;
    const dp = Array.from({length:a.length+1},(_,i)=>Array.from({length:b.length+1},(_,j)=>i||j));
    for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++)
        dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
    return dp[a.length][b.length];
};
const _mapV = s => s.replace(/ou$/,'u').replace(/eau/g,'o').replace(/ai|ei/g,'e')
.replace(/ie$/,'i').replace(/ique$/,'ic').replace(/que$/,'c');

const rcMatch = (q, name) => {
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

const rcDisplayName = (rc, lang) =>
lang==='fr' ? (rc.translations?.fra?.common||rc.name?.common||'') : (rc.name?.common||'');

// Cache pour /all (évite les refetch)
let _allCountriesCache = null;
const getAllCountries = async () => {
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

const validateCountryWithAI = async (query, lang) => {
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


// ── Composant principal ─────────────────────────────────────────────────
export default function CountryConfig({ c, idx, mode, onChange, onRemove, canRemove }) {
    const { lang } = useLocale();
    const setField = (k, v) => onChange({ ...c, [k]: v });

    // ── Validation pays réel en ligne (RestCountries) ──────────────────────
    const [rcSearch, setRcSearch] = useState(c.nom || '');
    const [rcStatus,     setRcStatus]     = useState(null); // null|'searching'|'found'|'notfound'|'suggestion'|'error'
    const [rcSuggestion, setRcSuggestion] = useState(null);
    const rcTimer = useRef(null);
    const rcQueryRef = useRef('');

    const searchRestCountries = async (query) => {
        rcQueryRef.current = query;
        if (!query || query.length < 3) { setRcStatus(null); return; }
        // 1. Check local hardcoded list
        const local = getRealCountries().find(r =>
        r.nom.toLowerCase() === query.toLowerCase() ||
        r.id === query.toLowerCase().replace(/[^a-z]/g,'')
        );
        if (local) {
            onChange({ ...c, nom: local.nom, regime: local.regime, terrain: local.terrain, realData: local, _rcStatus: 'found' });
            setRcStatus('found'); return;
        }
        setRcStatus('searching');
        try {
            // 2. Ask Claude to validate + localize
            const ai = await validateCountryWithAI(query, lang);
            if (rcQueryRef.current !== query) return;
            if (ai.status === 'notfound' || !ai.displayName) {
                setRcStatus('notfound'); onChange({ ...c, _rcStatus: 'notfound', _rcSuggestion: null }); return;
            }
            if (ai.status === 'suggestion') {
                setRcStatus('suggestion'); setRcSuggestion(ai.displayName);
                onChange({ ...c, _rcStatus: 'suggestion', _rcSuggestion: ai.displayName }); return;
            }
            // found — fetch RestCountries for flag/population using canonical name
            const nom = ai.displayName;
            let flag = '🌐', population = 5_000_000, region = '';
            try {
                const rc = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(ai.canonicalName||nom)}?fields=name,flag,population,region`)
                .then(r => r.ok ? r.json() : []);
                if (rc[0]) { flag = rc[0].flag || '🌐'; population = rc[0].population || 5_000_000; region = rc[0].region || ''; }
            } catch(_) {}
            const synth = {
                id: nom.toLowerCase().replace(/[^a-z0-9]/g,'-'),
                nom, flag, regime: 'democratie_liberale', terrain: 'coastal', population, region, _fromApi: true,
            };
            onChange({ ...c, nom, realData: synth, _rcStatus: 'found' });
            setRcStatus('found');
        } catch(_) {
            setRcStatus('error');
        }
    };

    // Debounce auto-validation — mode AI uniquement
    useEffect(() => {
        if (c.type !== 'reel' || mode !== 'ai') return;
        // Réinitialise le statut dès que la saisie change
        rcQueryRef.current = '';
        setRcStatus(null);
        setRcSuggestion(null);
        clearTimeout(rcTimer.current);
        if (!rcSearch || rcSearch.length < 3) return;
        rcTimer.current = setTimeout(() => searchRestCountries(rcSearch), 700);
        return () => clearTimeout(rcTimer.current);
    }, [rcSearch, c.type, mode]);

    return (
        <div style={{ ...CARD_STYLE, padding:'0.9rem 1rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={labelStyle('0.44rem')}>NATION {idx + 1}</div>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
        {c.type === 'imaginaire' && <span style={{ ...tag, color:'rgba(100,180,255,0.60)', border:'1px solid rgba(100,180,255,0.22)', background:'rgba(100,180,255,0.05)' }}>{c.realData?.emoji || '🌐'} FICTIF</span>}
        {c.realData && c.type === 'reel' && <span style={tag}>{c.realData.flag} PAYS RÉEL</span>}
        {canRemove && (
            <button onClick={onRemove} style={{ background:'none', border:'none', color:'rgba(200,80,80,0.45)', cursor:'pointer', fontSize:'0.75rem' }}>✕</button>
        )}
        </div>
        </div>

        {/* Toggle fictif / réel */}
        <div style={{ display:'flex', gap:'0.4rem' }}>
        {[
            { v:'imaginaire', l: mode==='ai' ? (lang==='en'?'🌐 Fictional (AI)':'🌐 Fictif (IA)') : (lang==='en'?'🌐 Fictional':'🌐 Fictif') },
            { v:'reel',       l: mode==='ai' ? t('INIT_MODE_REAL_AI', lang) : t('INIT_MODE_REAL', lang) },
        ].map(t => (
            <button key={t.v}
            style={{ ...BTN_SECONDARY, flex:1, padding:'0.3rem', fontSize:'0.48rem',
                ...(c.type === t.v ? { border:'1px solid rgba(200,164,74,0.40)', color:'rgba(200,164,74,0.88)', background:'rgba(200,164,74,0.08)' } : {}) }}
                onClick={() => onChange({ ...c, type:t.v, realData:null, nom:'', terrain:'coastal', regime:'democratie_liberale' })}>
                {t.l}
                </button>
        ))}
        </div>

        {/* ── PAYS RÉEL EN LIGNE : saisie libre → IA génère, avec fiche si connu ── */}
        {c.type === 'reel' && mode === 'ai' && (() => {
            const nomLow = c.nom.toLowerCase().replace(/[^a-z]/g, '');
            const knownMatch = getRealCountries().find(r =>
            r.nom.toLowerCase() === c.nom.toLowerCase() ||
            r.id === nomLow
            );

            return (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                <div>
                <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('COUNTRY_NAME',lang)}</div>
                <select style={SELECT_STYLE} value={knownMatch?.id||'_free'}
                onChange={e => {
                    if (e.target.value === '_free') { setField('nom', ''); }
                    else {
                        const rc = getRealCountries().find(r => r.id === e.target.value);
                        if (rc) setField('nom', rc.nom);
                    }
                }}>
                <option value="_free">— Saisir librement —</option>
                {getRealCountries().map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
                </select>
                {(!knownMatch) && (
                    <div style={{ marginTop:'0.4rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.2rem' }}>
                    <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(100,120,160,0.45)' }}>VÉRIFICATION</span>
                    {rcStatus === 'searching'  && <span style={{ color:'rgba(200,164,74,0.55)', fontSize:'0.38rem' }}>⟳ vérification…</span>}
                    {rcStatus === 'found'      && <span style={{ color:'rgba(58,191,122,0.80)',  fontSize:'0.38rem' }}>✓ pays reconnu</span>}
                    {rcStatus === 'notfound'   && <span style={{ color:'rgba(200,80,80,0.70)',   fontSize:'0.38rem' }}>✗ pays inconnu</span>}
                    {rcStatus === 'error'      && <span style={{ color:'rgba(200,164,74,0.50)',  fontSize:'0.38rem' }}>⚠ hors ligne</span>}
                    {rcStatus === 'suggestion' && rcSuggestion && (
                        <button onClick={() => { setField('nom', rcSuggestion); setRcSearch(rcSuggestion); setRcStatus(null); setRcSuggestion(null); }}
                        style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(200,164,74,0.90)',
                            background:'rgba(200,164,74,0.10)', border:'1px solid rgba(200,164,74,0.30)',
                                                                   borderRadius:'2px', padding:'0.10rem 0.40rem', cursor:'pointer' }}>
                                                                   → {rcSuggestion} ?
                                                                   </button>
                    )}
                    </div>
                    <input style={{ ...INPUT_STYLE, fontSize:'0.54rem', width:'100%' }} value={c.nom}
                    onChange={e => { setField('nom', e.target.value); setRcSearch(e.target.value); }}
                    placeholder="Ex : Canada, Maroc, Singapour…" />
                    </div>
                )}
                </div>
                {knownMatch
                    ? <CountryInfoCard data={knownMatch} />
                    : c.nom && (
                        <div style={{ fontSize:'0.43rem', color:'rgba(100,120,160,0.50)', fontStyle:'italic', lineHeight:1.5 }}>
                        ⚡ L'IA génèrera <strong style={{ color:'rgba(200,164,74,0.60)' }}>{c.nom}</strong> basé sur sa situation politique actuelle.
                        </div>
                    )
                }
                </div>
            );
        })()}

        {/* ── PAYS RÉEL HORS LIGNE : dropdown uniquement (stats hardcodées) ── */}
        {c.type === 'reel' && mode === 'local' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            <div>
            <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('SELECT',lang)}</div>
            <select style={SELECT_STYLE} value={c.realData?.id||''}
            onChange={e => {
                const rc = getRealCountries().find(r => r.id === e.target.value);
                if (rc) onChange({ ...c, nom:rc.nom, regime:rc.regime, terrain:rc.terrain, realData:rc });
            }}>
            <option value="">— Choisir —</option>
            {getRealCountries().map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
            </select>
            </div>
            {c.realData && (
                <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                <div>
                <div style={{ ...labelStyle('0.42rem'), marginBottom:'0.25rem' }}>{t('TERRAIN',lang)}</div>
                <select style={SELECT_STYLE} value={c.terrain} onChange={e => setField('terrain', e.target.value)}>
                {Object.entries(getTerrainLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                </div>
                <div>
                <div style={{ ...labelStyle('0.42rem'), marginBottom:'0.25rem' }}>{t('REGIME',lang)}</div>
                <select style={SELECT_STYLE} value={c.regime} onChange={e => setField('regime', e.target.value)}>
                {Object.entries(getRegimeLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                </div>
                </div>
                <CountryInfoCard data={c.realData} />
                </>
            )}
            </div>
        )}

        {/* ── FICTIF : preset parmi les 3 locaux OU nouveau ── */}
        {c.type === 'imaginaire' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            {/* Sélecteur preset */}
            <div>
            <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>NATION PRÉDÉFINIE</div>
            <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap' }}>
            {getPaysLocaux().map(p => {
                const sel = c.realData?.id === p.id;
                return (
                    <button key={p.id}
                    style={{ flex:'1 1 80px', cursor:'pointer', padding:'0.28rem 0.4rem',
                        fontFamily:FONT.mono, fontSize:'0.46rem', letterSpacing:'0.06em',
                        borderRadius:'2px', transition:'all 0.13s',
                        border: sel ? `1px solid ${p.couleur}80` : '1px solid rgba(140,160,200,0.14)',
                        background: sel ? `${p.couleur}18` : 'rgba(8,14,26,0.75)',
                        color: sel ? p.couleur : 'rgba(180,200,230,0.60)',
                        boxShadow: sel ? `0 0 8px ${p.couleur}18` : 'none',
                    }}
                    onClick={() => onChange({ ...c, nom: p.nom, terrain: p.terrain, regime: p.regime, realData: p })}>
                    {p.emoji} {p.nom}
                    </button>
                );
            })}
            <button
            style={{ flex:'1 1 80px', cursor:'pointer', padding:'0.28rem 0.4rem',
                fontFamily:FONT.mono, fontSize:'0.46rem', letterSpacing:'0.06em',
                borderRadius:'2px', transition:'all 0.13s',
                border: (!c.realData) ? '1px solid rgba(200,164,74,0.45)' : '1px solid rgba(140,160,200,0.14)',
                                     background: (!c.realData) ? 'rgba(200,164,74,0.08)' : 'rgba(8,14,26,0.75)',
                                     color: (!c.realData) ? 'rgba(200,164,74,0.90)' : 'rgba(180,200,230,0.55)',
            }}
            onClick={() => onChange({ ...c, nom: '', realData: null })}>
            {lang==='en'?'✨ New':'✨ Nouveau'}
            </button>
            </div>
            </div>

            {/* Si preset local sélectionné : résumé */}
            {c.realData?.id && getPaysLocaux().find(p => p.id === c.realData.id) && (
                <div style={{ fontSize:'0.43rem', color:'rgba(140,160,200,0.55)', lineHeight:1.55,
                    padding:'0.35rem 0.5rem', background:'rgba(200,164,74,0.03)',
                                                                                     borderLeft:'2px solid rgba(200,164,74,0.15)', borderRadius:'2px' }}>
                                                                                     {c.realData.description}
                                                                                     <div style={{ marginTop:'0.3rem', display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
                                                                                     <span>👤 {typeof c.realData.leader === 'object' ? [c.realData.leader.titre, c.realData.leader.nom].filter(Boolean).join(' ') : c.realData.leader}</span>
                                                                                     <span>👥 {(c.realData.population/1e6).toFixed(1)} M hab.</span>
                                                                                     <span style={{ color: c.realData.couleur }}>■ {c.realData.terrain}</span>
                                                                                     </div>
                                                                                     </div>
            )}

            {/* Si "Nouveau" : champs libres + topo estimée */}
            {!c.realData && (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
                <div style={{ gridColumn:'1 / -1' }}>
                <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>NOM</div>
                <input style={{ ...INPUT_STYLE, fontSize:'0.54rem' }} value={c.nom}
                onChange={e => setField('nom', e.target.value)} placeholder={`Nation ${idx+1}…`} />
                </div>
                <div>
                <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('TERRAIN',lang)}</div>
                <select style={SELECT_STYLE} value={c.terrain} onChange={e => setField('terrain', e.target.value)}>
                {Object.entries(getTerrainLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                </div>
                <div>
                <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('REGIME',lang)}</div>
                <select style={SELECT_STYLE} value={c.regime} onChange={e => setField('regime', e.target.value)}>
                {Object.entries(getRegimeLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                </div>
                </div>
                {/* Topo estimée */}
                {(() => {
                    const ARIA_BASE = { republique_federale:44, democratie_liberale:48, monarchie_constitutionnelle:38, technocratie_ia:72, oligarchie:26, junte_militaire:16, regime_autoritaire:20, monarchie_absolue:28, theocracie:18, communisme:32 };
                    const POP_BASE  = { coastal:8_000_000, inland:5_000_000, highland:3_500_000, island:2_000_000, archipelago:1_500_000 };
                    const SAT_BASE  = { democratie_liberale:62, republique_federale:58, monarchie_constitutionnelle:55, technocratie_ia:60, oligarchie:40, junte_militaire:35, regime_autoritaire:38, theocracie:50, communisme:45 };
                    const irl = ARIA_BASE[c.regime] ?? 35;
                    const pop = POP_BASE[c.terrain]  ?? 5_000_000;
                    const sat = SAT_BASE[c.regime]   ?? 50;
                    const ariaCol = irl >= 60 ? 'rgba(140,100,220,0.80)' : irl >= 40 ? 'rgba(100,130,200,0.70)' : 'rgba(90,110,160,0.50)';
                    return (
                        <div style={{ padding:'0.4rem 0.6rem', background:'rgba(200,164,74,0.02)',
                            borderLeft:'2px solid rgba(200,164,74,0.12)', borderRadius:'2px',
                            display:'flex', gap:'0.8rem', flexWrap:'wrap', alignItems:'center' }}>
                            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.50)' }}>
                            👥 ~{(pop/1e6).toFixed(1)} M hab.
                            </span>
                            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.50)' }}>
                            😊 ~{sat}% sat.
                            </span>
                            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.50)' }}>
                            🌍 {getTerrainLabels()[c.terrain] || c.terrain}
                            </span>
                            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:ariaCol }}>
                            ◈ ARIA IRL ~{irl}%
                            </span>
                            <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(90,110,150,0.40)', fontStyle:'italic' }}>
                            — estimations
                            </span>
                            </div>
                    );
                })()}
                </div>
            )}
            </div>
        )}

        {/* ── CONTEXTE DÉLIBÉRATIONS par pays ─────────────────────────── */}
        <ContextPanel
        countryName={c.nom || c.realData?.nom || `Nation ${idx+1}`}
        open={!!c._ctxOpen}
        onToggle={() => setField('_ctxOpen', !c._ctxOpen)}
        mode={c.context_mode || ''}
        setMode={v => setField('context_mode', v || undefined)}
        override={c.contextOverride || ''}
        setOverride={v => setField('contextOverride', v || undefined)}
        />
        </div>
    );
}
