// ═══════════════════════════════════════════════════════════════════════════
//  InitScreen.jsx — Écran de démarrage ARIA
//
//  Flux : Nom → Mode (local / IA) → Config → Génération
//
//  Mode PAR DÉFAUT (local) :
//    - Hors ligne : 1 pays fictif ou réel prédéfini)
//    - En ligne   : Dropdown pays réel → IA génère le portrait dynamiquement
//
//  Mode PERSONNALISÉ :
//    - Hors ligne : fictif ou pays réel depuis la liste REAL_COUNTRIES_DATA
//    - En ligne   : fictif nommé ou pays réel tapé librement (IA génère)
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { useLocale, t, loadLang } from './ariaI18n';
import { FONT, COLOR, CARD_STYLE, INPUT_STYLE, SELECT_STYLE, BTN_PRIMARY, BTN_SECONDARY, labelStyle } from './ariaTheme';
import { PAYS_LOCAUX, getStats, isValidKeyFormat, isFakeKey } from './Dashboard_p1';
import { REAL_COUNTRIES_DATA, REAL_COUNTRIES_DATA_EN } from './ariaData';
import BASE_AGENTS    from '../templates/base_agents.json';
import BASE_AGENTS_EN from '../templates/base_agents_en.json';
import ARIAHeader from './features/init/components/ARIAHeader';
import CountryInfoCard from './features/init/components/CountryInfoCard';
import APIKeyInline from './features/init/components/APIKeyInline';
import ContextPanel from './features/init/components/ContextPanel';
import RecapAccordion from './features/init/components/RecapAccordion';
import PreLaunchScreen from './features/init/components/PreLaunchScreen';
import { getTerrainLabels, getRegimeLabels, getPaysLocaux } from './features/init/services/labels';
import { ARIA_FALLBACK_MODELS, ARIA_REGISTRY_URL } from './shared/constants/llmRegistry';

function getRealCountries() {
  return loadLang() === 'en' ? REAL_COUNTRIES_DATA_EN : REAL_COUNTRIES_DATA;
}

// ── Getters localisés — labels terrain/régime/pays depuis JSON ────────────

// ── Styles locaux ─────────────────────────────────────────────────────────
const S = {
  wrap:  (wide) => ({
    display:'flex', flexDirection:'column', alignItems:'center',
    gap:'1.8rem', width:'100%', maxWidth: wide ? 700 : 460, padding:'2rem',
    overflowY:'auto', maxHeight:'calc(100vh - 2rem)', boxSizing:'border-box',
  }),
  mCard: {
    background:'rgba(8,14,26,0.80)', border:`1px solid rgba(140,160,200,0.15)`,
    borderRadius:'3px', padding:'0.85rem 1rem', cursor:'pointer',
    display:'flex', flexDirection:'column', gap:'0.35rem', flex:1,
    transition:'border-color 0.15s, background 0.15s',
  },
  tag: {
    fontFamily: FONT.mono, fontSize:'0.44rem', letterSpacing:'0.12em',
    padding:'0.2rem 0.5rem', borderRadius:'2px',
    border:'1px solid rgba(200,164,74,0.20)', color:'rgba(200,164,74,0.55)',
    background:'rgba(200,164,74,0.05)',
  },
};

const DEFAULT_COUNTRY = () => ({
  key: Math.random().toString(36).slice(2),
  type: 'imaginaire', nom: '', regime: 'democratie_liberale',
  terrain: 'coastal', realData: null,
});




// ── Sous-composant : Config d'un pays (mode personnalisé) ─────────────────
// ── Exonymes FR ↔ EN ─────────────────────────────────────────────────────────
// { fr: nom affiché en FR, en: nom affiché en EN, api: ce que RestCountries retourne }
// ── Validation pays réel via IA (Claude) ─────────────────────────────────────
// Envoie la saisie + lang à Claude qui vérifie l'existence et retourne le nom localisé
// Retourne Promise<{ status: 'found'|'suggestion'|'notfound', canonicalName: string|null, suggestion: string|null }>
// ── Validation pays réel via RestCountries ───────────────────────────────────
// Stratégie : RestCountries retourne jusqu'à 10 résultats pour une saisie.
// On teste chaque résultat avec rcMatch() pour décider found/suggestion/notfound.

// ── Validation pays via RestCountries (2 passes) ────────────────────────────
// Pass 1: recherche directe (fonctionne pour noms exacts, accents, traductions)
// Pass 2: si rien trouvé, fetch /all et fuzzy-match local (couvre les fautes)

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

// Retourne 'found'|'suggestion'|null pour une paire (query, nom)
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

  // Normalise avant envoi API (pérou → perou)
  const apiQuery = _norm(query);

  // ── PASS 1 : recherche directe RestCountries ──────────────────────────────
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

  // ── PASS 1b (FR) : endpoint /translation/ — pour les noms français ≠ anglais ──
  // (ex: "Allemagne" → Germany, "Espagne" → Spain, "Royaume-Uni" → United Kingdom)
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
        // Fallback : si l'endpoint a retourné un résultat sans match exact, on l'accepte comme trouvé
        if (!st2 && data2[0]) { st2='found'; rc2=data2[0]; }
        if (st2 && rc2) {
          return { status:st2, displayName:rcDisplayName(rc2,lang), canonicalName:rc2.name?.common||query };
        }
      }
    } catch(_) {} // silence — Pass 2 prend le relais
  }

  // ── PASS 2 : fuzzy local sur /all (couvre les fautes non trouvées par l'API) ──
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


function CountryConfig({ c, idx, mode, onChange, onRemove, canRemove }) {
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
          {c.type === 'imaginaire' && <span style={{ ...S.tag, color:'rgba(100,180,255,0.60)', border:'1px solid rgba(100,180,255,0.22)', background:'rgba(100,180,255,0.05)' }}>{c.realData?.emoji || '🌐'} FICTIF</span>}
          {c.realData && c.type === 'reel' && <span style={S.tag}>{c.realData.flag} PAYS RÉEL</span>}
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

        // Fuzzy match : trouve le pays le plus proche si saisie libre non reconnue


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



// ── Composant principal ─────────────────────────────────────────────────
export default function InitScreen({ worldName, setWorldName, onLaunchLocal, onLaunchAI, hasApiKeys, onRefreshKeys }) {
  const { lang, setLang } = useLocale();
  const [step,       setStep]      = useState('name');
  const [mode,       setMode]      = useState(null);
  const [preset,     setPreset]    = useState(null);
  const [countries,  setCountries] = useState([DEFAULT_COUNTRY()]);
  const [confirmOpen, setConfirmOpen] = useState(false); // dialog récap avant génération
  const [progress,   setProgress]  = useState(0);
  const [msg,        setMsg]       = useState('INITIALISATION…');
  const [showKeys,   setShowKeys]  = useState(false);

  // Sous-états navigation défaut
  const [defautType,        setDefautType]        = useState(null);  // 'fictif'|'reel'|'new'
  const [defautFictif,      setDefautFictif]      = useState(null);  // id PAYS_LOCAUX ou 'new'
  const [defautReel,        setDefautReel]        = useState('');    // id REAL_COUNTRIES_DATA ou terrain si isNew
  const [defautNom,         setDefautNom]         = useState('');    // nom libre
  // Validation pays réel défaut — état unique pour éviter les race conditions
  const [rcDefaut, setRcDefaut] = useState({ status: null, suggestion: null, canonical: '' });
  const [rcDefautData, setRcDefautData] = useState(null); // { flag, population, region } récupérés depuis restcountries
  const rcDefautTimer = useRef(null);
  const rcDefautQueryRef = useRef(''); // query en cours — pour ignorer les réponses obsolètes
  const searchDefautCountry = async (query) => {
    if (!query || query.length < 3) { setRcDefaut({ status: null, suggestion: null, canonical: '' }); return; }
    // Marque cette query comme courante — les réponses d'une ancienne query seront ignorées
    rcDefautQueryRef.current = query;
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    const local = getRealCountries().find(r => norm(r.nom) === norm(query));
    if (local) {
      if (rcDefautQueryRef.current !== query) return; // réponse obsolète
      setRcDefaut({ status: 'found', suggestion: null, canonical: local.nom });
      return;
    }
    setRcDefaut({ status: 'searching', suggestion: null, canonical: '' });
    try {
      const ai = await validateCountryWithAI(query, lang);
      if (rcDefautQueryRef.current !== query) return;
      if (ai.status === 'notfound' || !ai.displayName) {
        setRcDefaut({ status: 'notfound', suggestion: null, canonical: '' });
      } else if (ai.status === 'suggestion') {
        setRcDefaut({ status: 'suggestion', suggestion: ai.displayName, canonical: '' });
      } else {
        const canonical = ai.displayName || query;
        setRcDefaut({ status: 'found', suggestion: null, canonical });
        setDefautNom(canonical);
        // Fetch drapeau + population depuis restcountries
        try {
          const rc = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(ai.canonicalName||canonical)}?fields=name,flag,population,region`)
            .then(r => r.ok ? r.json() : []);
          if (rc[0]) setRcDefautData({
            id: canonical.toLowerCase().replace(/[^a-z0-9]/g,'-'),
            nom: canonical, flag: rc[0].flag || '🌐',
            regime: 'democratie_liberale', terrain: 'coastal',
            population: rc[0].population || 5_000_000,
            region: rc[0].region || '', _fromApi: true,
          });
        } catch(_) {}
      }
    } catch(_) {
      if (rcDefautQueryRef.current === query)
        setRcDefaut({ status: 'error', suggestion: null, canonical: '' });
    }
  };
  const [newFictifTerrain,  setNewFictifTerrain]  = useState('coastal');
  const [newFictifRegime,   setNewFictifRegime]   = useState('democratie_liberale');

  const resetDefaut = () => { setDefautType(null); setDefautFictif(null); setDefautReel(''); setDefautNom(''); };

  // ── Pre-launch : intercalé avant generating ───────────────────────────
  const [pendingPreset, setPendingPreset] = useState(null);
  const [pendingDefs,   setPendingDefs]   = useState(null);
  const preLaunch = (usePreset, customDefs = null) => {
    setPendingPreset(usePreset);
    setPendingDefs(customDefs);
    setStep('pre_launch');
  };

  const launch = (usePreset, customDefs = null) => {
    try {
      const opts = JSON.parse(localStorage.getItem('aria_options') || '{}');
      localStorage.setItem('aria_options', JSON.stringify(opts));
    } catch {}
    setStep('generating');
    const MSGS = [
      t('GEN_TOPO',lang),t('GEN_MASSES',lang),
      t('GEN_RESOURCES',lang),t('GEN_COUNCIL',lang),t('GEN_SIM',lang),
    ];
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setProgress(Math.round((step / 30) * 100));
      setMsg(MSGS[Math.floor(step / 6)] || MSGS[MSGS.length - 1]);
      if (step >= 30) {
        clearInterval(timer);
        if (usePreset === 'defaut_local') {
          onLaunchLocal(customDefs);
        } else if (usePreset === 'defaut_ai') {
          onLaunchAI(customDefs || [{ type:'reel', nom:'France' }]);
        } else if (mode === 'local') {
          onLaunchLocal(customDefs || countries);
        } else {
          const defs = (customDefs || countries).map(c => {
            const isReel = c.type === 'reel';
            return {
              type:     isReel ? 'reel' : 'imaginaire',
              nom:      c.nom || c.realData?.nom || 'Nation',
              regime:   c.regime   || c.realData?.regime,
              terrain:  c.terrain  || c.realData?.terrain,
              realData: c.realData || null,
              // Préserver les overrides passés par PreLaunchScreen
              ...(c.context_mode      ? { context_mode:      c.context_mode      } : {}),
              ...(c.contextOverride   ? { contextOverride:   c.contextOverride   } : {}),
              ...(c.governanceOverride? { governanceOverride: c.governanceOverride } : {}),
            };
          });
          onLaunchAI(defs);
        }
      }
    }, 60);
  };
  // ── Étape : pré-lancement (constitution rapide avant génération) ────────
  if (step === 'pre_launch') {
    return (
      <PreLaunchScreen
        worldName={worldName}
        pendingPreset={pendingPreset}
        pendingDefs={pendingDefs}
        onBack={() => setStep('config')}
        onLaunch={launch}
      />
    );
  }


  // ── Étape : génération ────────────────────────────────────────────────
  if (step === 'generating') return (
    <div style={S.wrap(false)}>
      <ARIAHeader showQuote={false} />
      <div style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.85rem' }}>
        <div style={{ fontFamily:FONT.mono, fontSize:'0.55rem', letterSpacing:'0.14em', color:'#C8A44A', animation:'pulse 1.2s ease-in-out infinite' }}>{msg}</div>
        <div className="worldgen-bar" style={{ width:'100%' }}><div className="worldgen-fill" style={{ width:`${progress}%` }} /></div>
        <div style={{ fontFamily:FONT.mono, fontSize:'0.52rem', color:'#3A4A62', letterSpacing:'0.10em' }}>{progress} %</div>
      </div>
    </div>
  );

  // ── Étape : nom ───────────────────────────────────────────────────────
  if (step === 'name') return (
    <div style={{ ...S.wrap(false), position:'relative' }}>
      {/* Lang switcher */}
      <div style={{ position:'absolute', top:'0.8rem', right:'0.8rem', display:'flex', gap:'0.3rem', zIndex:10 }}>
        {['fr','en'].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{
            background: lang===l ? 'rgba(200,164,74,0.15)' : 'transparent',
            border:`1px solid ${lang===l ? 'rgba(200,164,74,0.45)' : 'rgba(255,255,255,0.10)'}`,
            borderRadius:'2px', padding:'0.22rem 0.55rem',
            color: lang===l ? 'rgba(200,164,74,0.90)' : 'rgba(150,170,205,0.35)',
            fontFamily:"'JetBrains Mono',monospace", fontSize:'0.44rem',
            letterSpacing:'0.10em', cursor:'pointer', transition:'all 0.15s',
            display:'flex', alignItems:'center', gap:'0.25rem',
          }}>
            <span style={{fontSize:'0.85rem',lineHeight:1}}>{l==='fr'?'🇫🇷':'🇬🇧'}</span>
            <span>{l.toUpperCase()}</span>
          </button>
        ))}
      </div>
      {showKeys && <APIKeyInline onClose={() => { setShowKeys(false); onRefreshKeys?.(); }} />}
      <ARIAHeader showQuote={true} />

      <div style={{ ...CARD_STYLE, display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        <div style={labelStyle()}>{t('WORLD_NAME',lang)}</div>
        <input style={INPUT_STYLE} value={worldName}
          onChange={e => setWorldName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && worldName.trim() && setStep('mode')}
          {...{placeholder:t("WORLD_NAME_PH",lang)}} autoFocus />
        <div style={{ display:'flex', alignItems:'center', gap:'0.7rem' }}>
          <button
            style={{
              background:'rgba(200,164,74,0.06)', border:'1px solid rgba(200,164,74,0.30)',
              borderRadius:'2px', padding:'0.35rem 0.75rem', cursor:'pointer',
              fontFamily:FONT.mono, fontSize:'0.46rem', letterSpacing:'0.12em',
              color: hasApiKeys ? 'rgba(100,200,120,0.70)' : 'rgba(200,164,74,0.55)',
              whiteSpace:'nowrap', flexShrink:0,
            }}
            onClick={() => setShowKeys(true)}
            title={lang==='en'?'Configure API keys':'Configurer les clés API'}>
            {hasApiKeys ? `${lang==='en'?'🔑 API KEYS':'🔑 CLÉS API'} ✓` : (lang==='en'?'🔑 API KEYS':'🔑 CLÉS API')}
          </button>
          <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(200,100,74,0.55)',
            flex:1, textAlign:'center', lineHeight:1.6, visibility: hasApiKeys ? 'hidden' : 'visible' }}>
            {lang==='en' ? <>⚠ No key<br/>offline mode only</> : <>⚠ Pas de clé<br/>mode hors ligne uniquement</>}
          </span>
          <button style={{ ...BTN_PRIMARY, opacity: worldName.trim() ? 1 : 0.35, flexShrink:0, minWidth:'8rem', textAlign:'center' }}
            disabled={!worldName.trim()} onClick={() => setStep('mode')}>
            {t('CONTINUE',lang)}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Étape : mode ──────────────────────────────────────────────────────
  if (step === 'mode') return (
    <div style={S.wrap(false)}>
      <ARIAHeader showQuote={false} />
      <div style={{ width:'100%' }}>
        <div style={{ ...labelStyle(), marginBottom:'0.9rem' }}>{t('MODE_LABEL',lang)} — {worldName}</div>
        <div style={{ display:'flex', gap:'0.8rem' }}>
          {[
            { id:'local', icon:'🗺', title:t('MODE_LOCAL',lang), desc:t('MODE_LOCAL_DESC',lang) },
            { id:'ai',    icon:'⚡', title:t('MODE_AI',lang), desc:t('MODE_AI_DESC',lang), disabled:!hasApiKeys },
          ].map(m => (
            <div key={m.id}
              style={{ ...S.mCard, opacity: m.disabled ? 0.35 : 1, cursor: m.disabled ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if (m.disabled) return;
                setMode(m.id);
                try {
                  const opts = JSON.parse(localStorage.getItem('aria_options')||'{}');
                  if (m.id === 'local') opts.ia_mode = 'none';
                  else if (m.id === 'ai' && opts.ia_mode === 'none') opts.ia_mode = 'aria';
                  localStorage.setItem('aria_options', JSON.stringify(opts));
                } catch {}
                setStep('config');
              }}>
              <div style={{ fontSize:'1.4rem' }}>{m.icon}</div>
              <div style={{ fontFamily:FONT.cinzel, fontSize:'0.58rem', letterSpacing:'0.18em', color:'rgba(200,164,74,0.85)' }}>{m.title}</div>
              <div style={{ fontSize:'0.50rem', color:'rgba(140,160,200,0.55)', lineHeight:1.6 }}>{m.desc}</div>
              {m.disabled && <span style={{ ...S.tag, color:'rgba(200,80,80,0.55)', border:'1px solid rgba(200,80,80,0.20)' }}>{t('KEY_MISSING',lang)}</span>}
            </div>
          ))}
        </div>
      </div>
      <button style={BTN_SECONDARY} onClick={() => setStep('name')}>{t('BACK',lang)}</button>
    </div>
  );




  // ── Étape : config ────────────────────────────────────────────────────
  // ── Étape : config — helpers ──────────────────────────────────────────
  const BK = (fn) => <button style={BTN_SECONDARY} onClick={fn}>{t('BACK',lang)}</button>;
  const H  = (txt) => <div style={{ ...labelStyle(), alignSelf:'flex-start' }}>{txt} — {worldName}</div>;
  const MC = (props) => <div style={{ ...S.mCard, ...props.style }} onClick={props.onClick}>{props.children}</div>;
  const McTitle = ({ t }) => <div style={{ fontFamily:FONT.cinzel, fontSize:'0.54rem', letterSpacing:'0.14em', color:'rgba(200,164,74,0.88)' }}>{t}</div>;
  const McSub   = ({ t }) => <div style={{ fontSize:'0.47rem', color:'rgba(140,160,200,0.55)', lineHeight:1.55 }}>{t}</div>;
  const BtnRow  = ({ children }) => <div style={{ display:'flex', gap:'0.6rem', width:'100%', justifyContent:'space-between' }}>{children}</div>;

  if (step === 'config') {
    // ── Choix preset / custom ──────────────────────────────────────
    if (!preset) return (
      <div style={S.wrap(false)}>
        <ARIAHeader showQuote={false} />
        {H(t('CONFIG',lang))}
        <div style={{ display:'flex', gap:'0.8rem', width:'100%' }}>
          <MC onClick={() => { setPreset('defaut'); resetDefaut(); }}>
            <div style={{ fontSize:'1.3rem' }}>⚡</div>
            <McTitle t={t('PRESET_DEFAULT',lang)} />
            <McSub t={mode==='local' ? t('PRESET_DEFAULT_LOCAL',lang) : t('PRESET_DEFAULT_AI',lang)} />
          </MC>
          <MC onClick={() => setPreset('custom')}>
            <div style={{ fontSize:'1.3rem' }}>🛠</div>
            <McTitle t={t('PRESET_CUSTOM',lang)} />
            <McSub t={t('PRESET_CUSTOM_DESC',lang)} />
          </MC>
        </div>
        {BK(() => setStep('mode'))}
      </div>
    );

    // ══════════════════════════════════════════════════════════════════
    // PAR DÉFAUT HORS LIGNE
    // ══════════════════════════════════════════════════════════════════
    if (preset === 'defaut' && mode === 'local') {
      // A — Choisir le type
      if (!defautType) return (
        <div style={S.wrap(false)}>
          <ARIAHeader showQuote={false} />
          {H('NATION DE DÉPART')}
          <div style={{ display:'flex', gap:'0.8rem', width:'100%' }}>
            <MC onClick={() => setDefautType('fictif')}>
              <div style={{ fontSize:'1.3rem' }}>🌐</div>
              <McTitle t={t('FICTIONAL_NATION',lang)} />
              <McSub t={t('PRESET_NATION_DESC',lang)} />
            </MC>
            <MC onClick={() => setDefautType('reel')}>
              <div style={{ fontSize:'1.3rem' }}>🗺</div>
              <McTitle t={t('REAL_COUNTRY',lang)} />
              <McSub t={t('REAL_COUNTRY_DESC',lang)} />
            </MC>
          </div>
          {BK(() => setPreset(null))}
        </div>
      );

      // B — Choisir parmi les 3 fictifs ou en créer un nouveau
      if (defautType === 'fictif') {
        const chosen = defautFictif && defautFictif !== 'new'
          ? getPaysLocaux().find(p => p.id === defautFictif)
          : null;
        const isNew = defautFictif === 'new';

        // Estimations pour le formulaire nouveau fictif
        const ARIA_BASE = { republique_federale:44, democratie_liberale:48, monarchie_constitutionnelle:38, technocratie_ia:72, oligarchie:26, junte_militaire:16, regime_autoritaire:20, monarchie_absolue:28, theocracie:18, communisme:32 };
        const POP_BASE  = { coastal:8_000_000, inland:5_000_000, highland:3_500_000, island:2_000_000, archipelago:1_500_000 };
        const SAT_BASE  = { democratie_liberale:62, republique_federale:58, monarchie_constitutionnelle:55, technocratie_ia:60, oligarchie:40, junte_militaire:35, regime_autoritaire:38, theocracie:50, communisme:45 };

        const canPlay = (defautFictif && !isNew) || (isNew && defautNom.trim().length > 0);

        return (
          <div style={S.wrap(true)}>
            <ARIAHeader showQuote={false} />
            {H('NATION FICTIVE')}

            {/* Grille 2×2 : 3 presets + 1 créer */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'0.7rem', width:'100%' }}>
              {getPaysLocaux().map(p => (
                <MC key={p.id}
                  style={{
                    border: defautFictif===p.id ? `1px solid ${p.couleur}70` : undefined,
                    background:  defautFictif===p.id ? `${p.couleur}14` : undefined,
                    cursor:'pointer',
                  }}
                  onClick={() => setDefautFictif(p.id)}>
                  <div style={{ fontSize:'1.2rem' }}>{p.emoji}</div>
                  <McTitle t={p.nom} />
                  <McSub t={`${getTerrainLabels()[p.terrain] || p.terrain} · ${getRegimeLabels()[p.regime] || p.regime.replace(/_/g,' ')}`} />
                </MC>
              ))}

              {/* Carte + Créer */}
              <MC
                style={{
                  border: isNew ? '1px solid rgba(58,191,122,0.55)' : '1px solid rgba(58,191,122,0.18)',
                  background:  isNew ? 'rgba(58,191,122,0.07)' : undefined,
                  cursor:'pointer', justifyContent:'center', alignItems:'center',
                }}
                onClick={() => setDefautFictif('new')}>
                <div style={{ fontSize:'1.4rem' }}>🌍</div>
                <McTitle t={t('CREATE',lang)} />
                <McSub t={lang==='en'?'Custom fictional nation':'Nation fictive personnalisée'} />
              </MC>
            </div>

            {/* Détail preset choisi */}
            {chosen && (
              <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                <div style={{ fontSize:'0.44rem', color:'rgba(140,160,200,0.65)', lineHeight:1.6 }}>{chosen.description}</div>
                <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center' }}>
                  {[`👤 ${typeof chosen.leader === 'string' ? chosen.leader : (chosen.leader?.nom || chosen.leader?.name || '')}`, `👥 ${(chosen.population/1e6).toFixed(1)} M hab.`, `😊 Satisfaction ${chosen.satisfaction}%`].map(t => (
                    <span key={t} style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.50)' }}>{t}</span>
                  ))}
                  {(() => {
                    const irl = ARIA_BASE[chosen.regime] ?? 35;
                    const col = irl >= 60 ? 'rgba(140,100,220,0.80)' : irl >= 40 ? 'rgba(100,130,200,0.70)' : 'rgba(90,110,160,0.50)';
                    return <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:col }}>◈ ARIA IRL ~{irl}%</span>;
                  })()}
                </div>
              </div>
            )}

            {/* Formulaire nouveau pays fictif */}
            {isNew && (
              <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.65rem' }}>
                <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem', letterSpacing:'0.16em', color:'rgba(58,191,122,0.55)' }}>
                  {t('NEW_NATION',lang)}
                </div>
                <div>
                  <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>NOM</div>
                  <input
                    style={{ ...INPUT_STYLE, fontSize:'0.54rem', border:'1px solid rgba(58,191,122,0.25)' }}
                    value={defautNom}
                    onChange={e => setDefautNom(e.target.value)}
                    placeholder="Ex : Arvalia, Morvaine, Zephoria…"
                    autoFocus
                  />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
                  <div>
                    <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('TERRAIN',lang)}</div>
                    <select style={SELECT_STYLE} value={newFictifTerrain} onChange={e => setNewFictifTerrain(e.target.value)}>
                      {Object.entries(getTerrainLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('REGIME',lang)}</div>
                    <select style={SELECT_STYLE} value={newFictifRegime} onChange={e => setNewFictifRegime(e.target.value)}>
                      {Object.entries(getRegimeLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                {/* Estimations */}
                <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap', padding:'0.35rem 0.5rem', background:'rgba(58,191,122,0.03)', borderLeft:'2px solid rgba(58,191,122,0.15)', borderRadius:'2px' }}>
                  <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(140,160,200,0.50)' }}>👥 ~{((POP_BASE[newFictifTerrain]||5e6)/1e6).toFixed(1)} M hab.</span>
                  <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(140,160,200,0.50)' }}>😊 ~{SAT_BASE[newFictifRegime]||50}% sat.</span>
                  {(() => {
                    const irl = ARIA_BASE[newFictifRegime] ?? 35;
                    const col = irl >= 60 ? 'rgba(140,100,220,0.80)' : irl >= 40 ? 'rgba(100,130,200,0.70)' : 'rgba(90,110,160,0.50)';
                    return <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:col }}>◈ ARIA IRL ~{irl}%</span>;
                  })()}
                </div>

              </div>
            )}

            <BtnRow>
              {isNew
                ? BK(() => { setDefautFictif(null); setDefautNom(''); })
                : BK(() => { setDefautType(null); setDefautFictif(null); setDefautNom(''); })
              }
              {!isNew && (
                <button
                  style={{ ...BTN_PRIMARY, opacity: canPlay ? 1 : 0.35 }}
                  disabled={!canPlay}
                  onClick={() => preLaunch('defaut_local', [{ type:'imaginaire', realData: chosen }])}>
                  JOUER →
                </button>
              )}
              {isNew && (
                <button
                  style={{ ...BTN_PRIMARY, opacity: defautNom.trim() ? 1 : 0.35 }}
                  disabled={!defautNom.trim()}
                  onClick={() => preLaunch('defaut_local', [{
                    type:'imaginaire', nom:defautNom.trim(),
                    terrain:newFictifTerrain, regime:newFictifRegime, realData:null,
                  }])}>
                  JOUER →
                </button>
              )}
            </BtnRow>
          </div>
        );
      }

      // C — Choisir un pays réel hors ligne
      if (defautType === 'reel') {
        const chosen = getRealCountries().find(r => r.id === defautReel);
        return (
          <div style={S.wrap(false)}>
            <ARIAHeader showQuote={false} />
            {H('PAYS RÉEL')}
            <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.7rem' }}>
              <select style={SELECT_STYLE} value={defautReel}
                onChange={e => setDefautReel(e.target.value)}>
                <option value="">— Choisir un pays —</option>
                {getRealCountries().map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
              </select>
              {chosen && <CountryInfoCard data={chosen} />}
            </div>
            <BtnRow>
              {BK(() => setDefautType(null))}
              <button style={{ ...BTN_PRIMARY, opacity: defautReel ? 1 : 0.35 }}
                disabled={!defautReel}
                onClick={() => preLaunch('defaut_local', [{ type:'reel', realData: chosen }])}>
                JOUER →
              </button>
            </BtnRow>
          </div>
        );
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // PAR DÉFAUT EN LIGNE
    // ══════════════════════════════════════════════════════════════════
    if (preset === 'defaut' && mode === 'ai') {
      // A — Choisir le type
      if (!defautType) return (
        <div style={S.wrap(false)}>
          <ARIAHeader showQuote={false} />
          {H('NATION DE DÉPART')}
          <div style={{ display:'flex', gap:'0.8rem', width:'100%' }}>
            <MC onClick={() => setDefautType('fictif')}>
              <div style={{ fontSize:'1.3rem' }}>🌐</div>
              <McTitle t={t('FICTIONAL_NATION',lang)} />
              <McSub t={lang==='en'?"1 of 3 preset nations or 1 new one — AI enriches it.":"1 des 3 nations prédéfinies ou 1 nouvelle — l'IA l'enrichit."} />
            </MC>
            <MC onClick={() => setDefautType('reel')}>
              <div style={{ fontSize:'1.3rem' }}>🗺</div>
              <McTitle t={t('REAL_COUNTRY',lang)} />
              <McSub t={lang==='en'?"AI generates the portrait from its current situation.":"L'IA génère le portrait depuis sa situation actuelle."} />
            </MC>
          </div>
          {BK(() => setPreset(null))}
        </div>
      );

      // B — Pays réel en ligne
      if (defautType === 'reel') {
        const knownReel = getRealCountries().find(r => r.id === defautReel);
        const canLaunch = defautReel || (defautNom.trim() && rcDefaut.status === 'found');
        return (
          <div style={S.wrap(false)}>
            <ARIAHeader showQuote={false} />
            {H('PAYS RÉEL')}
            <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.7rem' }}>
              <select style={SELECT_STYLE} value={defautReel}
                onChange={e => { setDefautReel(e.target.value); setDefautNom(''); }}>
                <option value="">— ou tapez un nom ci-dessous —</option>
                {getRealCountries().map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
              </select>
              <div style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(140,160,200,0.35)', textAlign:'center' }}>— OU —</div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem' }}>
                  <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(100,120,160,0.45)' }}>SAISIE LIBRE</span>
                  {rcDefaut.status === 'searching'  && <span style={{ color:'rgba(200,164,74,0.55)', fontSize:'0.38rem' }}>⟳ vérification…</span>}
                  {rcDefaut.status === 'found'      && <span style={{ color:'rgba(58,191,122,0.80)',  fontSize:'0.38rem' }}>✓ pays reconnu</span>}
                  {rcDefaut.status === 'notfound'   && <span style={{ color:'rgba(200,80,80,0.70)',   fontSize:'0.38rem' }}>✗ pays inconnu</span>}
                  {rcDefaut.status === 'error'      && <span style={{ color:'rgba(200,164,74,0.50)',  fontSize:'0.38rem' }}>⚠ hors ligne</span>}
                  {rcDefaut.status === 'suggestion' && rcDefaut.suggestion && (
                    <button onClick={() => { const sug = rcDefaut.suggestion; setDefautNom(sug); setRcDefaut({ status: null, suggestion: null, canonical: '' }); clearTimeout(rcDefautTimer.current); setTimeout(() => searchDefautCountry(sug), 50); }}
                      style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(200,164,74,0.90)',
                        background:'rgba(200,164,74,0.10)', border:'1px solid rgba(200,164,74,0.30)',
                        borderRadius:'2px', padding:'0.10rem 0.40rem', cursor:'pointer' }}>
                      → {rcDefaut.suggestion} ?
                    </button>
                  )}
                </div>
                <input style={{ ...INPUT_STYLE, fontSize:'0.53rem', width:'100%' }}
                  value={defautNom}
                  onChange={e => {
                    setDefautNom(e.target.value);
                    setDefautReel('');
                    rcDefautQueryRef.current = ''; // invalide les réponses en vol
                    setRcDefaut({ status: null, suggestion: null, canonical: '' });
                    setRcDefautData(null);
                    clearTimeout(rcDefautTimer.current);
                    rcDefautTimer.current = setTimeout(() => searchDefautCountry(e.target.value), 700);
                  }}
                  placeholder={t('COUNTRY_NAME_PH',lang)} />
              </div>
              {knownReel
                ? <CountryInfoCard data={knownReel} />
                : defautNom && (
                  <div style={{ fontSize:'0.43rem', color:'rgba(100,120,160,0.55)', fontStyle:'italic', lineHeight:1.5 }}>
                    ⚡ L'IA génèrera <strong style={{ color:'rgba(200,164,74,0.65)' }}>{defautNom}</strong> depuis sa situation politique actuelle.
                  </div>
                )}
            </div>
            <BtnRow>
              {BK(() => setDefautType(null))}
              <button style={{ ...BTN_PRIMARY, opacity: canLaunch ? 1 : 0.35 }}
                disabled={!canLaunch}
                onClick={() => {
                  const nom = knownReel?.nom || rcDefaut.canonical || defautNom;
                  preLaunch('defaut_ai', [{ type:'reel', nom, realData: knownReel || rcDefautData || null }]);
                }}>
                {t('GENERATE_SHORT',lang)}
              </button>
            </BtnRow>
          </div>
        );
      }

      // C — Nation fictive en ligne (identique hors-ligne : grille 2×2 + bandeau + créer)
      if (defautType === 'fictif') {
        const chosen = defautFictif && defautFictif !== 'new'
          ? getPaysLocaux().find(p => p.id === defautFictif)
          : null;
        const isNew = defautFictif === 'new';
        const ARIA_BASE = { republique_federale:44, democratie_liberale:48, monarchie_constitutionnelle:38, technocratie_ia:72, oligarchie:26, junte_militaire:16, regime_autoritaire:20, monarchie_absolue:28, theocracie:18, communisme:32 };
        const POP_BASE  = { coastal:8_000_000, inland:5_000_000, highland:3_500_000, island:2_000_000, archipelago:1_500_000 };
        const SAT_BASE  = { democratie_liberale:62, republique_federale:58, monarchie_constitutionnelle:55, technocratie_ia:60, oligarchie:40, junte_militaire:35, regime_autoritaire:38, theocracie:50, communisme:45 };

        return (
          <div style={S.wrap(true)}>
            <ARIAHeader showQuote={false} />
            {H('NATION FICTIVE')}

            {/* Grille 2×2 identique hors-ligne */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'0.7rem', width:'100%' }}>
              {getPaysLocaux().map(p => (
                <MC key={p.id}
                  style={{
                    border: defautFictif===p.id ? `1px solid ${p.couleur}70` : undefined,
                    background:  defautFictif===p.id ? `${p.couleur}14` : undefined,
                    cursor:'pointer',
                  }}
                  onClick={() => { setDefautFictif(p.id); setDefautNom(''); }}>
                  <div style={{ fontSize:'1.2rem' }}>{p.emoji}</div>
                  <McTitle t={p.nom} />
                  <McSub t={`${getTerrainLabels()[p.terrain] || p.terrain} · ${getRegimeLabels()[p.regime] || p.regime.replace(/_/g,' ')}`} />
                </MC>
              ))}
              <MC
                style={{
                  border: isNew ? '1px solid rgba(58,191,122,0.55)' : '1px solid rgba(58,191,122,0.18)',
                  background:  isNew ? 'rgba(58,191,122,0.07)' : undefined,
                  cursor:'pointer', justifyContent:'center', alignItems:'center',
                }}
                onClick={() => { setDefautFictif('new'); setDefautNom(''); }}>
                <div style={{ fontSize:'1.4rem' }}>🌍</div>
                <McTitle t={t('CREATE',lang)} />
                <McSub t={lang==='en'?'Custom fictional nation':'Nation fictive personnalisée'} />
              </MC>
            </div>

            {/* Bandeau infos preset choisi — identique hors-ligne */}
            {chosen && (
              <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                <div style={{ fontSize:'0.44rem', color:'rgba(140,160,200,0.65)', lineHeight:1.6 }}>{chosen.description}</div>
                <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center' }}>
                  {[`👤 ${typeof chosen.leader === 'string' ? chosen.leader : (chosen.leader?.nom || chosen.leader?.name || '')}`, `👥 ${(chosen.population/1e6).toFixed(1)} M hab.`, `😊 Satisfaction ${chosen.satisfaction}%`].map(t => (
                    <span key={t} style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.50)' }}>{t}</span>
                  ))}
                  {(() => {
                    const irl = ARIA_BASE[chosen.regime] ?? 35;
                    const col = irl >= 60 ? 'rgba(140,100,220,0.80)' : irl >= 40 ? 'rgba(100,130,200,0.70)' : 'rgba(90,110,160,0.50)';
                    return <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:col }}>◈ ARIA IRL ~{irl}%</span>;
                  })()}
                </div>
              </div>
            )}

            {/* Formulaire nouveau pays fictif — identique hors-ligne */}
            {isNew && (
              <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.65rem' }}>
                <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem', letterSpacing:'0.16em', color:'rgba(58,191,122,0.55)' }}>
                  {t('NEW_NATION',lang)}
                </div>
                <div>
                  <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>NOM</div>
                  <input
                    style={{ ...INPUT_STYLE, fontSize:'0.54rem', border:'1px solid rgba(58,191,122,0.25)' }}
                    value={defautNom}
                    onChange={e => setDefautNom(e.target.value)}
                    placeholder="Ex : Arvalia, Morvaine, Zephoria…"
                    autoFocus
                  />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
                  <div>
                    <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('TERRAIN',lang)}</div>
                    <select style={SELECT_STYLE} value={newFictifTerrain} onChange={e => setNewFictifTerrain(e.target.value)}>
                      {Object.entries(getTerrainLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>{t('REGIME',lang)}</div>
                    <select style={SELECT_STYLE} value={newFictifRegime} onChange={e => setNewFictifRegime(e.target.value)}>
                      {Object.entries(getRegimeLabels()).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.8rem', flexWrap:'wrap', padding:'0.35rem 0.5rem', background:'rgba(58,191,122,0.03)', borderLeft:'2px solid rgba(58,191,122,0.15)', borderRadius:'2px' }}>
                  <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(140,160,200,0.50)' }}>👥 ~{((POP_BASE[newFictifTerrain]||5e6)/1e6).toFixed(1)} M hab.</span>
                  <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(140,160,200,0.50)' }}>😊 ~{SAT_BASE[newFictifRegime]||50}% sat.</span>
                  {(() => {
                    const irl = ARIA_BASE[newFictifRegime] ?? 35;
                    const col = irl >= 60 ? 'rgba(140,100,220,0.80)' : irl >= 40 ? 'rgba(100,130,200,0.70)' : 'rgba(90,110,160,0.50)';
                    return <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:col }}>◈ ARIA IRL ~{irl}%</span>;
                  })()}
                </div>
              </div>
            )}

            <BtnRow>
              {isNew
                ? BK(() => { setDefautFictif(null); setDefautNom(''); })
                : BK(() => { setDefautType(null); setDefautFictif(null); setDefautNom(''); })
              }
              {!isNew && chosen && (
                <button style={{ ...BTN_PRIMARY }}
                  onClick={() => preLaunch('defaut_ai', [{ type:'imaginaire', nom: chosen.nom, realData: chosen }])}>
                  {t('GENERATE_SHORT',lang)}
                </button>
              )}
              {isNew && (
                <button style={{ ...BTN_PRIMARY, opacity: defautNom.trim() ? 1 : 0.35 }}
                  disabled={!defautNom.trim()}
                  onClick={() => preLaunch('defaut_ai', [{
                    type:'imaginaire', nom:defautNom.trim(),
                    terrain:newFictifTerrain, regime:newFictifRegime, realData:null,
                  }])}>
                  {t('GENERATE_SHORT',lang)}
                </button>
              )}
            </BtnRow>
          </div>
        );
      }
    }

    // ══════════════════════════════════════════════════════════════════
    // PERSONNALISÉ (hors ligne ou en ligne)
    // ══════════════════════════════════════════════════════════════════
    if (preset === 'custom') return (
      <div style={S.wrap(true)}>
        <ARIAHeader showQuote={false} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%' }}>
          <div style={labelStyle()}>NATIONS — {countries.length}/6</div>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            {countries.length < 6 && (
              <button style={{ ...BTN_SECONDARY, padding:'0.3rem 0.7rem', fontSize:'0.48rem' }}
                onClick={() => setCountries(p => [...p, DEFAULT_COUNTRY()])}>
                + AJOUTER
              </button>
            )}
            {BK(() => setPreset(null))}
          </div>
        </div>
        <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'0.6rem', maxHeight:'52vh', overflowY:'auto' }}>
          {countries.map((c, idx) => (
            <CountryConfig key={c.key} c={c} idx={idx} mode={mode}
              onChange={updated => setCountries(p => p.map(x => x.key === c.key ? updated : x))}
              onRemove={() => setCountries(p => p.filter(x => x.key !== c.key))}
              canRemove={countries.length > 1}
            />
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', width:'100%' }}>
          {(() => {
            const unvalidated = countries.filter(c =>
              c.type === 'reel' && mode === 'ai' && !c.realData?.id && !c.nom.trim()
            );
            const hasNotFound = countries.some(c =>
              c.type === 'reel' && mode === 'ai' && !c.realData?.id &&
              (c._rcStatus === 'notfound' || c._rcStatus === 'suggestion')
            );
            const canGen = unvalidated.length === 0 && !hasNotFound;
            return (
              <button style={{ ...BTN_PRIMARY, opacity: canGen ? 1 : 0.40, cursor: canGen ? 'pointer' : 'not-allowed' }}
                disabled={!canGen}
                title={canGen ? '' : lang==='en'?`Check: ${unvalidated.map(c=>c.nom||'?').join(', ')}`:`Vérifiez : ${unvalidated.map(c=>c.nom||'?').join(', ')}`}
                onClick={() => {
                  if (!canGen) return;
                  const filled = countries.map((c, i) => ({ ...c, nom: c.nom.trim() || c.realData?.nom || `Nation ${i+1}` }));
                  setCountries(filled);
                  preLaunch('custom', filled);
                }}>
                {canGen ? (lang==='en'?'CONFIGURE GOVERNMENT →':'CONFIGURER LE GOUVERNEMENT →') : hasNotFound ? 'PAYS INTROUVABLES — CORRIGEZ' : `COMPLÉTER LES PAYS (${unvalidated.length})`}
              </button>
            );
          })()}
        </div>
      </div>
    );

    return null;
  }

  return null;
}
