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
import ARIAHeader from './features/init/components/ARIAHeader';
import CountryInfoCard from './features/init/components/CountryInfoCard';
import APIKeyInline from './features/init/components/APIKeyInline';
import ContextPanel from './features/init/components/ContextPanel';
import BASE_AGENTS    from '../templates/base_agents.json';
import BASE_AGENTS_EN from '../templates/base_agents_en.json';
import { REAL_COUNTRIES_DATA, REAL_COUNTRIES_DATA_EN } from './ariaData';

function getRealCountries() {
  return loadLang() === 'en' ? REAL_COUNTRIES_DATA_EN : REAL_COUNTRIES_DATA;
}
import { PAYS_LOCAUX, getStats, isValidKeyFormat, isFakeKey } from './Dashboard_p1';

// ── Getters localisés — labels terrain/régime/pays depuis JSON ────────────
function getTerrainLabels() {
  const t = getStats().terrains;
  return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.name]));
}
function getRegimeLabels() {
  const r = getStats().regimes;
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.name]));
}
function getPaysLocaux() {
  return getStats().pays_locaux || PAYS_LOCAUX;
}
import {
  FONT, COLOR, CARD_STYLE, INPUT_STYLE, SELECT_STYLE,
  BTN_PRIMARY, BTN_SECONDARY, labelStyle,
} from './ariaTheme';

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
// ── Modèles LLM disponibles (fallback si registry offline) ───────────────────
const ARIA_REGISTRY_URL = 'https://gist.githubusercontent.com/flodus/REPLACE_WITH_YOUR_GIST_ID/raw/llm-registry.json';
const ARIA_FALLBACK_MODELS = {
  openrouter: [
    { id:'anthropic/claude-sonnet-4-5',     label:'Claude Sonnet 4.5 ★' },
    { id:'anthropic/claude-haiku-4-5',      label:'Claude Haiku 4.5' },
    { id:'google/gemini-2.0-flash',         label:'Gemini 2.0 Flash ★' },
    { id:'google/gemini-2.5-pro-preview',   label:'Gemini 2.5 Pro' },
    { id:'x-ai/grok-3-mini',               label:'Grok 3 Mini ★' },
    { id:'openai/gpt-4.1-mini',             label:'GPT-4.1 Mini ★' },
    { id:'meta-llama/llama-4-scout',        label:'Llama 4 Scout' },
    { id:'mistralai/mistral-small-3.1',     label:'Mistral Small 3.1' },
  ],
  claude: [
    { id:'claude-sonnet-4-6',              label:'Sonnet 4.6 ★' },
    { id:'claude-haiku-4-5-20251001',      label:'Haiku 4.5' },
    { id:'claude-opus-4-6',               label:'Opus 4.6' },
  ],
  gemini: [
    { id:'gemini-2.0-flash',               label:'2.0 Flash ★' },
    { id:'gemini-2.5-pro-preview-05-06',   label:'2.5 Pro Preview' },
    { id:'gemini-1.5-pro',                 label:'1.5 Pro' },
  ],
  grok:   [{ id:'grok-3-mini', label:'Grok 3 Mini ★' }, { id:'grok-3', label:'Grok 3' }],
  openai: [{ id:'gpt-4.1-mini', label:'GPT-4.1 Mini ★' }, { id:'gpt-4.1', label:'GPT-4.1' }, { id:'o4-mini', label:'o4-mini' }],
};




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

// ── Composant principal ───────────────────────────────────────────────────
// ── RecapAccordion — accordéon constitution dans le dialog récap ─────────────
function RecapAccordion({ pendingDefs, perGov, commonAgents, commonMins, commonPres, commonMinsters, lang, ctxModes, ctxOvrs }) {
  const [openIdx, setOpenIdx] = useState(null); // index pays ouvert

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.45rem', maxHeight:'55vh', overflowY:'auto' }}>
      {(pendingDefs||[]).map((d, i) => {
        const nom     = d.nom?.trim() || d.realData?.nom || `Nation ${i+1}`;
        const flag    = d.realData?.flag || d.realData?.emoji || d.emoji || '🌐';
        const isReel  = d.type === 'reel';
        const regime  = d.regime || d.realData?.regime || '—';
        const terrain = d.terrain || d.realData?.terrain || '—';
        const hasGov  = !!perGov[i];
        const open    = openIdx === i;

        // Constitution effective pour ce pays
        const gov         = perGov[i];
        const effAgents   = gov?.agents   || commonAgents;
        const effMins     = gov?.activeMins    ?? commonMins;      // null = tous actifs
        const effPres     = gov?.activePres    ?? commonPres;
        const effMinsters = gov?.activeMinsters ?? commonMinsters;  // null = tous actifs

        // Données constitution
        const allMins     = effAgents?.ministries || [];
        const allMinsters = effAgents?.ministers   || {};
        const allPres     = effAgents?.presidency  || {};

        const activeMins     = effMins     ? allMins.filter(m => effMins.includes(m.id))     : allMins;
        const activeMinsters = effMinsters ? Object.entries(allMinsters).filter(([k]) => effMinsters.includes(k)) : Object.entries(allMinsters);
        const activePres     = effPres     ? Object.entries(allPres).filter(([k]) => effPres.includes(k))         : Object.entries(allPres);

        return (
          <div key={i} style={{ borderRadius:'3px', overflow:'hidden',
            border: hasGov ? '1px solid rgba(100,180,255,0.22)' : '1px solid rgba(200,164,74,0.16)',
            background:'rgba(8,14,26,0.60)' }}>

            {/* Header cliquable */}
            <div onClick={() => setOpenIdx(open ? null : i)}
              style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.50rem 0.70rem', cursor:'pointer',
                background: open ? 'rgba(200,164,74,0.05)' : 'transparent', transition:'background 0.15s' }}>
              <span style={{ fontSize:'0.82rem' }}>{flag}</span>
              <span style={{ fontFamily:FONT.mono, fontSize:'0.50rem', color:'rgba(215,225,240,0.92)', fontWeight:600, flex:1 }}>{nom}</span>
              {hasGov && <span style={{ fontFamily:FONT.mono, fontSize:'0.30rem', color:'rgba(100,180,255,0.70)' }}>✦</span>}
              <span style={{ fontFamily:FONT.mono, fontSize:'0.33rem', color:'rgba(140,160,200,0.40)' }}>
                {isReel ? (lang==='en'?'Real':'Réel') : (lang==='en'?'Fictional':'Fictif')}
              </span>
              <div style={{ display:'flex', gap:'0.5rem', marginLeft:'0.3rem' }}>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.34rem', color:'rgba(140,160,200,0.45)' }}>
                  {getRegimeLabels()[regime] || regime}
                </span>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.34rem', color:'rgba(140,160,200,0.30)' }}>·</span>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.34rem', color:'rgba(140,160,200,0.45)' }}>
                  {getTerrainLabels()[terrain] || terrain}
                </span>
              </div>
              <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(200,164,74,0.55)', marginLeft:'0.2rem' }}>
                {open ? '▲' : '▼'}
              </span>
            </div>

            {/* Corps accordéon */}
            {open && (
              <div style={{ padding:'0.55rem 0.75rem', display:'flex', flexDirection:'column', gap:'0.55rem',
                borderTop:'1px solid rgba(200,164,74,0.08)' }}>

                {/* Présidence */}
                <div>
                  <div style={{ fontFamily:FONT.mono, fontSize:'0.36rem', letterSpacing:'0.14em',
                    color:'rgba(200,164,74,0.50)', marginBottom:'0.25rem' }}>
                    {lang==='en' ? 'PRESIDENCY' : 'PRÉSIDENCE'}
                  </div>
                  <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap' }}>
                    {activePres.length > 0 ? activePres.map(([k, p]) => (
                      <span key={k} style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                        color: k==='phare' ? 'rgba(255,210,80,0.85)' : 'rgba(160,180,255,0.85)',
                        background: k==='phare' ? 'rgba(255,200,50,0.07)' : 'rgba(100,140,255,0.07)',
                        border: k==='phare' ? '1px solid rgba(255,200,50,0.20)' : '1px solid rgba(100,140,255,0.20)',
                        borderRadius:'2px', padding:'0.15rem 0.40rem' }}>
                        {k==='phare' ? '☉' : '☽'} {p.name || (k==='phare' ? 'Le Phare' : 'La Boussole')}
                      </span>
                    )) : <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(140,160,200,0.35)' }}>—</span>}
                  </div>
                </div>

                {/* Ministères */}
                <div>
                  <div style={{ fontFamily:FONT.mono, fontSize:'0.36rem', letterSpacing:'0.14em',
                    color:'rgba(200,164,74,0.50)', marginBottom:'0.25rem' }}>
                    {lang==='en' ? 'MINISTRIES' : 'MINISTÈRES'} ({activeMins.length})
                  </div>
                  <div style={{ display:'flex', gap:'0.25rem', flexWrap:'wrap' }}>
                    {activeMins.map(m => (
                      <span key={m.id} style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                        color: m.color || 'rgba(140,180,255,0.75)',
                        background: (m.color || '#8090C0')+'12',
                        border: `1px solid ${(m.color || '#8090C0')}30`,
                        borderRadius:'2px', padding:'0.13rem 0.35rem' }}>
                        {m.emoji || '🏛'} {m.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ministres */}
                <div>
                  <div style={{ fontFamily:FONT.mono, fontSize:'0.36rem', letterSpacing:'0.14em',
                    color:'rgba(200,164,74,0.50)', marginBottom:'0.25rem' }}>
                    {lang==='en' ? 'MINISTERS' : 'MINISTRES'} ({activeMinsters.length})
                  </div>
                  <div style={{ display:'flex', gap:'0.22rem', flexWrap:'wrap' }}>
                    {activeMinsters.map(([k, m]) => (
                      <span key={k} title={m.name} style={{ fontFamily:FONT.mono, fontSize:'0.44rem',
                        filter: `drop-shadow(0 0 3px ${m.color}66)`,
                        cursor:'default' }}>
                        {m.emoji}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contexte délibérations */}
                {(() => {
                  const CTX_LABELS = { '':'⚙️ '+(lang==='en'?'Inherit global':'Hérite du global'), auto:'🤖 Auto', rich:lang==='en'?'📖 Enriched':'📖 Enrichi', stats_only:lang==='en'?'📊 Stats only':'📊 Stats seules', off:lang==='en'?'🚫 Disabled':'🚫 Désactivé' };
                  const mode = ctxModes?.[i] || '';
                  const ovr  = ctxOvrs?.[i]  || '';
                  return (
                    <div>
                      <div style={{ fontFamily:FONT.mono, fontSize:'0.36rem', letterSpacing:'0.14em',
                        color:'rgba(200,164,74,0.50)', marginBottom:'0.25rem' }}>
                        {lang==='en' ? 'DELIBERATION CONTEXT' : 'CONTEXTE DÉLIBÉRATIONS'}
                      </div>
                      <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap', alignItems:'center' }}>
                        <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                          color:'rgba(160,180,220,0.75)', background:'rgba(100,120,180,0.08)',
                          border:'1px solid rgba(100,120,180,0.20)', borderRadius:'2px', padding:'0.13rem 0.40rem' }}>
                          {CTX_LABELS[mode] || CTX_LABELS['']}
                        </span>
                        {ovr && (
                          <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(200,164,74,0.60)',
                            fontStyle:'italic' }}>✎ override</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── PreLaunchScreen — constitution editor before world generation ────────────
function PreLaunchScreen({ worldName, pendingPreset, pendingDefs, onBack, onLaunch }) {
  const { lang } = useLocale();
  const [plLoading,    setPlLoading]    = useState(true);
  const [plTab,        setPlTab]        = useState('resume');
  const [plCountry,    setPlCountry]    = useState(0);
  const [confirmLaunch, setConfirmLaunch] = useState(false); // dialog récap final

  // ── Constitution commune (base partagée par tous les pays) ────────────────
  const [commonAgents,  setCommonAgents]  = useState(null);
  const [commonMins,    setCommonMins]    = useState(null);             // null = tous actifs
  const [commonPres,    setCommonPres]    = useState(['phare','boussole']);
  const [commonMinsters,setCommonMinsters]= useState(null);             // null = tous actifs

  // ── Overrides par pays : perGov[i] = null (hérite) | { agents, activeMins, activePres, activeMinsters }
  const [perGov, setPerGov] = useState(() => (pendingDefs||[]).map(() => null));

  // ── Getters/setters courants (agissent sur plCountry) ────────────────────
  const curGov = perGov[plCountry];
  const hasOverride = !!curGov;

  // Valeurs effectives pour le pays courant
  const plAgents       = curGov?.agents       ?? commonAgents;
  const activeMins     = curGov?.activeMins    ?? commonMins;
  const activePres     = curGov?.activePres    ?? commonPres;
  const activeMinsters = curGov?.activeMinsters ?? commonMinsters;

  // Setters qui écrivent dans le bon endroit (override si exists, sinon commun)
  const setPlAgents = (fn) => {
    if (hasOverride) setPerGov(p => { const a=[...p]; a[plCountry]={...a[plCountry], agents: typeof fn==='function' ? fn(a[plCountry].agents) : fn}; return a; });
    else setCommonAgents(fn);
  };
  const setActiveMins = (v) => {
    if (hasOverride) setPerGov(p => { const a=[...p]; a[plCountry]={...a[plCountry], activeMins:typeof v==='function'?v(a[plCountry].activeMins):v}; return a; });
    else setCommonMins(v);
  };
  const setActivePres = (v) => {
    if (hasOverride) setPerGov(p => { const a=[...p]; a[plCountry]={...a[plCountry], activePres:typeof v==='function'?v(a[plCountry].activePres):v}; return a; });
    else setCommonPres(v);
  };
  const setActiveMinsters = (v) => {
    if (hasOverride) setPerGov(p => { const a=[...p]; a[plCountry]={...a[plCountry], activeMinsters:typeof v==='function'?v(a[plCountry].activeMinsters):v}; return a; });
    else setCommonMinsters(v);
  };

  // Fork : crée un override pour le pays courant à partir de la constitution commune
  const forkCountry = () => {
    setPerGov(p => {
      if (p[plCountry]) return p; // déjà un override
      const a = [...p];
      a[plCountry] = {
        agents:        JSON.parse(JSON.stringify(commonAgents)),
        activeMins:    commonMins,
        activePres:    [...commonPres],
        activeMinsters: commonMinsters,
      };
      return a;
    });
  };

  // Reset override d'un pays → revient à la commune
  const resetCountryOverride = (i) => {
    setPerGov(p => { const a=[...p]; a[i]=null; return a; });
    setSelectedMinistry(null);
    setSelectedMinister(null);
  };

  // New minister/ministry forms
  const [newMinForm,   setNewMinForm]   = useState(false);
  const [newMinData,   setNewMinData]   = useState({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'', annotation:'' });
  const [newMinistryForm, setNewMinistryForm] = useState(false);
  const [newMinistryData, setNewMinistryData] = useState({ id:'', name:'', emoji:'🏛', color:'#8090C0', mission:'', ministers:[] });
  const [selectedMinistry, setSelectedMinistry] = useState(null);
  const [selectedMinister, setSelectedMinister] = useState(null);
  const scrollRef = useRef(null);
  // Contexte délibérations par pays (index = index dans pendingDefs)
  const [plCtxOpen,  setPlCtxOpen]  = useState(null); // index du pays ouvert, ou null
  const [plCtxModes, setPlCtxModes] = useState(() => (pendingDefs||[]).map(d => d.context_mode || ''));
  const [plCtxOvrs,  setPlCtxOvrs]  = useState(() => (pendingDefs||[]).map(d => d.contextOverride || ''));
  // ── Config IA (onglet CONFIG) ─────────────────────────────────────────
  const loadOpts = () => { try { return JSON.parse(localStorage.getItem('aria_options')||'{}'); } catch { return {}; } };
  const loadPreferredModels = () => { try { return JSON.parse(localStorage.getItem('aria_preferred_models')||'{}'); } catch { return {}; } };
  const loadIARoles = () => { try { const r = (JSON.parse(localStorage.getItem('aria_options')||'{}')).ia_roles || {}; return r; } catch { return {}; } };
  const loadKeys = () => { try { return JSON.parse(localStorage.getItem('aria_api_keys')||'{}'); } catch { return {}; } };
  const loadKeyStatus = () => { try { return JSON.parse(localStorage.getItem('aria_api_keys_status')||'{}'); } catch { return {}; } };
  const PROV_LABELS = { openrouter:'OpenRouter', claude:'Claude', gemini:'Gemini', grok:'Grok', openai:'OpenAI' };
  const [modelReg,    setModelReg]    = useState(ARIA_FALLBACK_MODELS);
  const [regStatus,   setRegStatus]   = useState('idle');
  const apiKeys = loadKeys();
  const savedKeyStatus = loadKeyStatus();
  const availProviders = ['openrouter','claude','gemini','grok','openai'].filter(id => {
    const v = apiKeys[id];
    const hasKey = Array.isArray(v)
      ? v.some(k => (typeof k === 'string' ? k : k?.key)?.trim()?.length > 0)
      : typeof v === 'string' && v.trim().length > 0;
    return hasKey && savedKeyStatus[id] !== 'error';
  });
  const [ariaMode,    setAriaMode]    = useState(() => {
    const saved = loadOpts().ia_mode;
    const keys = loadKeys();
    const ks = loadKeyStatus();
    const provCount = ['openrouter','claude','gemini','grok','openai'].filter(id => {
      const v = keys[id];
      const hasKey = Array.isArray(v)
        ? v.some(k => (typeof k === 'string' ? k : k?.key)?.trim()?.length > 0)
        : typeof v === 'string' && v.trim().length > 0;
      return hasKey && ks[id] !== 'error';
    }).length;
    if (provCount === 0) return 'none';
    if (!saved || saved === 'none') return provCount === 1 ? 'solo' : 'aria'; // défaut intelligent selon les clés valides
    if (provCount === 1 && (saved === 'aria' || saved === 'custom')) return 'solo';
    return saved;
  });
  const p0 = availProviders[0] || 'openrouter';
  const p1 = availProviders[1] || p0;
  const prefModels = loadPreferredModels();
  const initRoles = () => {
    const r = loadIARoles();
    const opts = loadOpts();
    const modelOf = (prov) => prefModels[prov] || ARIA_FALLBACK_MODELS[prov]?.find(m=>m.label.includes('★'))?.id || ARIA_FALLBACK_MODELS[prov]?.[0]?.id || '';
    // Solo : un seul provider pour tous les rôles
    if (opts.ia_mode === 'solo') {
      const soloProv  = opts.solo_model || p0;
      const soloModel = modelOf(soloProv);
      return {
        ministre_provider:  soloProv, ministre_model:      soloModel,
        synthese_min_prov:  soloProv, synthese_min_model:  soloModel,
        phare_provider:     soloProv, phare_model:         soloModel,
        boussole_provider:  soloProv, boussole_model:      soloModel,
        synthese_pres_prov: soloProv, synthese_pres_model: soloModel,
      };
    }
    // Aria/custom : lire les providers par rôle (format Settings : ministre_model = provider)
    const vp = (p) => availProviders.includes(p) ? p : (availProviders[0] || p); // valide vs providers dispo
    const ministerProv  = vp(r.ministre_provider  || r.ministre_model || p0);
    const synthMinProv  = vp(r.synthese_min_prov  || r.synthese_min   || p1);
    const phareProv     = vp(r.phare_provider     || r.phare_model    || p0);
    const boussoleProv  = vp(r.boussole_provider  || r.boussole_model || p0);
    const synthPresProv = vp(r.synthese_pres_prov || r.synthese_pres  || p1);
    return {
      ministre_provider:   ministerProv,  ministre_model:      modelOf(ministerProv),
      synthese_min_prov:   synthMinProv,  synthese_min_model:  modelOf(synthMinProv),
      phare_provider:      phareProv,     phare_model:         modelOf(phareProv),
      boussole_provider:   boussoleProv,  boussole_model:      modelOf(boussoleProv),
      synthese_pres_prov:  synthPresProv, synthese_pres_model: modelOf(synthPresProv),
    };
  };
  const [roles, setRoles] = useState(initRoles);
  // Accordéons CONFIG
  const [cfgOpen, setCfgOpen] = useState(''); // '' = fermé par défaut
  // Registry fetch on mount
  useEffect(() => {
    if (ARIA_REGISTRY_URL.includes('REPLACE_WITH')) { setRegStatus('error'); return; }
    setRegStatus('loading');
    fetch(ARIA_REGISTRY_URL).then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setModelReg({...ARIA_FALLBACK_MODELS, ...data}); setRegStatus('ok'); })
      .catch(() => setRegStatus('error'));
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const ov = JSON.parse(localStorage.getItem('aria_agents_override')||'null');
        if (ov) {
          setCommonAgents(ov);
          if (ov.active_ministries) setCommonMins(ov.active_ministries);
          if (ov.active_presidency) setCommonPres(ov.active_presidency);
          if (ov.active_ministers)  setCommonMinsters(ov.active_ministers);
          setPlLoading(false); return;
        }
        const BASE = loadLang() === 'en' ? BASE_AGENTS_EN : BASE_AGENTS;
        setCommonAgents(JSON.parse(JSON.stringify(BASE)));
      } catch { setCommonAgents(null); }
      setPlLoading(false);
    };
    load();
  }, []);

  // Rattraper ariaMode 'none' si des clés deviennent disponibles après le premier rendu
  useEffect(() => {
    if (ariaMode === 'none' && availProviders.length > 0) {
      setAriaMode(availProviders.length === 1 ? 'solo' : 'aria');
    }
  }, [availProviders.length]);

  const toggleMinster = (key) => {
    setActiveMinsters(prev => {
      const all = Object.keys(plAgents?.ministers || {});
      const cur = prev || all;
      const on = cur.includes(key);
      const next = on ? cur.filter(k => k !== key) : [...cur, key];
      return next.length === all.length ? null : next;
    });
  };

  const saveAndLaunch = () => {
    // Sauvegarde constitution commune comme fallback global
    if (commonAgents) {
      try {
        localStorage.setItem('aria_agents_override', JSON.stringify({
          ...commonAgents,
          active_ministries: commonMins,
          active_presidency: commonPres,
          active_ministers:  commonMinsters,
        }));
      } catch {}
    }
    // Save IA config
    try {
      const opts = loadOpts();
      opts.ia_mode = ariaMode;
      opts.solo_model = roles.ministre_provider || availProviders[0] || 'claude';
      // ia_roles (format Settings : clé = provider) — seulement pour aria/custom
      if (ariaMode === 'aria' || ariaMode === 'custom') {
        opts.ia_roles = {
          ...(opts.ia_roles || {}),
          ministre_model:  roles.ministre_provider  || availProviders[0] || 'claude',
          synthese_min:    roles.synthese_min_prov  || availProviders[0] || 'claude',
          phare_model:     roles.phare_provider     || availProviders[0] || 'claude',
          boussole_model:  roles.boussole_provider  || availProviders[0] || 'claude',
          synthese_pres:   roles.synthese_pres_prov || availProviders[0] || 'claude',
        };
      }
      // Modèles par provider dans ia_models (lu par Settings pour le sélecteur solo)
      if (!opts.ia_models) opts.ia_models = {};
      if (roles.ministre_provider  && roles.ministre_model)      opts.ia_models[roles.ministre_provider]  = roles.ministre_model;
      if (roles.synthese_min_prov  && roles.synthese_min_model)  opts.ia_models[roles.synthese_min_prov]  = roles.synthese_min_model;
      if (roles.phare_provider     && roles.phare_model)         opts.ia_models[roles.phare_provider]     = roles.phare_model;
      if (roles.boussole_provider  && roles.boussole_model)      opts.ia_models[roles.boussole_provider]  = roles.boussole_model;
      if (roles.synthese_pres_prov && roles.synthese_pres_model) opts.ia_models[roles.synthese_pres_prov] = roles.synthese_pres_model;
      localStorage.setItem('aria_options', JSON.stringify(opts));
      localStorage.setItem('aria_preferred_models', JSON.stringify({...loadPreferredModels(),
        ...Object.fromEntries([[roles.ministre_provider, roles.ministre_model],[roles.synthese_min_prov, roles.synthese_min_model],[roles.phare_provider, roles.phare_model],[roles.boussole_provider, roles.boussole_model],[roles.synthese_pres_prov, roles.synthese_pres_model]].filter(([k,v])=>k&&v))
      }));
    } catch {}
    // Merge ctx overrides + perGov overrides dans chaque pendingDef
    const defs = (pendingDefs || []).map((d, i) => {
      const gov = perGov[i];
      return {
        ...d,
        context_mode:    plCtxModes[i] || undefined,
        contextOverride: plCtxOvrs[i]  || undefined,
        // Override gouvernance par pays si défini
        ...(gov ? {
          governanceOverride: {
            agents:           gov.agents,
            active_ministries: gov.activeMins,
            active_presidency: gov.activePres,
            active_ministers:  gov.activeMinsters,
          }
        } : {}),
      };
    });
    onLaunch(pendingPreset, defs);
  };

  const resetAgents = () => {
    localStorage.removeItem('aria_agents_override');
    setCommonMins(null); setCommonPres(['phare','boussole']); setCommonMinsters(null);
    setCommonAgents(null); setPlLoading(true);
    try { const BASE = loadLang() === 'en' ? BASE_AGENTS_EN : BASE_AGENTS; setCommonAgents(JSON.parse(JSON.stringify(BASE))); } catch {} setPlLoading(false);
    // Reset tous les overrides pays aussi
    setPerGov((pendingDefs||[]).map(() => null));
  };

  const addMinister = () => {
    if (!newMinData.id || !newMinData.name) return;
    const id = newMinData.id.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z_]/g,'');
    if (!id) return;
    setPlAgents(a => ({ ...a, ministers: { ...a.ministers, [id]: { ...newMinData, id, sign:'Custom', weight:1 } } }));
    setNewMinData({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'', annotation:'' });
    setNewMinForm(false);
  };

  const addMinistry = () => {
    if (!newMinistryData.id || !newMinistryData.name) return;
    const id = newMinistryData.id.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z_]/g,'');
    if (!id) return;
    setPlAgents(a => ({ ...a, ministries: [...a.ministries,
      { ...newMinistryData, id, keywords:[], questions:[], ministerPrompts:{} }
    ]}));
    setNewMinistryData({ id:'', name:'', emoji:'🏛', color:'#8090C0', mission:'', ministers:[] });
    setNewMinistryForm(false);
  };

  const tabStyle = (active) => ({
    fontFamily:FONT.mono, fontSize:'0.46rem', letterSpacing:'0.10em',
    padding:'0.35rem 0.75rem', cursor:'pointer', background:'transparent', border:'none',
    borderBottom: active ? '2px solid rgba(200,164,74,0.70)' : '2px solid transparent',
    color: active ? 'rgba(200,164,74,0.90)' : 'rgba(140,160,200,0.35)',
  });

  const countries = pendingDefs || [];
  const hasMulti  = countries.length > 1;
  const GOLD = 'rgba(200,164,74,0.88)';

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      gap:'1.2rem', width:'100%', maxWidth:680, padding:'2rem',
      overflowY:'auto', maxHeight:'calc(100vh - 2rem)', boxSizing:'border-box' }}>
      <ARIAHeader showQuote={false} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', width:'100%', flexWrap:'wrap', gap:'0.4rem' }}>
        <div style={labelStyle()}>CONSTITUTION — {worldName}</div>
        {hasMulti && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.35rem' }}>
            {/* Badges pays */}
            <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap', justifyContent:'flex-end' }}>
              {countries.map((c, i) => {
                const isCustom = !!perGov[i];
                const nom = c.nom || c.realData?.nom || `Nation ${i+1}`;
                const flag = c.realData?.flag || c.realData?.emoji || '🌐';
                return (
                  <button key={i}
                    style={{ ...BTN_SECONDARY, padding:'0.26rem 0.60rem', fontSize:'0.48rem', position:'relative',
                      ...(plCountry===i ? { border:'1px solid rgba(200,164,74,0.55)',
                        color:'rgba(200,164,74,0.95)', background:'rgba(200,164,74,0.10)' } : {
                        color:'rgba(180,190,210,0.70)' }) }}
                    onClick={() => { setPlCountry(i); setSelectedMinistry(null); setSelectedMinister(null); }}>
                    <span style={{ fontSize:'0.65rem', marginRight:'0.25rem' }}>{flag}</span>
                    {nom}
                    {isCustom && (
                      <span style={{ marginLeft:'0.3rem', fontSize:'0.32rem', fontFamily:FONT.mono,
                        color:'rgba(100,180,255,0.80)', letterSpacing:'0.05em' }}>✦</span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Bouton Personnaliser / ↺ Constitution Commune — sous les badges, aligné à droite */}
            {!hasOverride ? (
              <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.50rem',
                color:'rgba(100,180,255,0.70)', border:'1px solid rgba(100,180,255,0.22)' }}
                onClick={forkCountry}>
                ✦ {lang==='en' ? 'Customize this country' : 'Personnaliser ce pays'}
              </button>
            ) : (
              <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.50rem',
                color:'rgba(200,80,80,0.55)', border:'1px solid rgba(200,80,80,0.22)' }}
                onClick={() => resetCountryOverride(plCountry)}>
                ↺ {lang==='en' ? 'Common Constitution' : 'Constitution Commune'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs + bandeau statut inline */}
      <div style={{ display:'flex', alignItems:'center', gap:0, borderBottom:'1px solid rgba(200,164,74,0.10)', width:'100%' }}>
        {[
          {id:'resume',     fr:'RÉSUMÉ',     en:'SUMMARY'   },
          {id:'presidency', fr:'PRÉSIDENCE', en:'PRESIDENCY'},
          {id:'ministries', fr:'MINISTÈRES', en:'MINISTRIES'},
          {id:'ministers',  fr:'MINISTRES',  en:'MINISTERS' },
        ].map(tab => (
          <button key={tab.id} style={tabStyle(plTab===tab.id)}
            onClick={() => { setPlTab(tab.id); if(scrollRef.current) scrollRef.current.scrollTop=0; }}>
            {tab[lang] || tab.fr}
          </button>
        ))}
        {/* Statut constitution — décalé après les onglets */}
        {(() => {
          const countryName = countries[plCountry]?.nom || countries[plCountry]?.realData?.nom || `Nation ${plCountry + 1}`;
          return hasOverride ? (
            <span style={{ marginLeft:'2.5rem', fontFamily:FONT.mono, fontSize:'0.40rem',
              letterSpacing:'0.10em', color:'rgba(100,180,255,0.90)', whiteSpace:'nowrap',
              fontWeight:600 }}>
              ✦ {lang==='en' ? `INDEPENDENT — ${countryName.toUpperCase()}` : `CONSTITUTION INDÉPENDANTE — ${countryName.toUpperCase()}`}
            </span>
          ) : (
            <span style={{ marginLeft:'2.5rem', fontFamily:FONT.mono, fontSize:'0.40rem',
              letterSpacing:'0.10em', color:'rgba(200,164,74,0.60)', whiteSpace:'nowrap' }}>
              ◈ {lang==='en' ? 'COMMON CONSTITUTION' : 'CONSTITUTION COMMUNE'}
            </span>
          );
        })()}
      </div>

      {plLoading && <div style={{ fontFamily:FONT.mono, fontSize:'0.48rem',
        color:'rgba(200,164,74,0.50)', padding:'1.5rem', textAlign:'center' }}>{lang==='en'?'Loading…':'Chargement…'}</div>}

      {!plLoading && plAgents && (
        <div ref={scrollRef} style={{ width:'100%', overflowY:'auto', maxHeight:'64vh',
          display:'flex', flexDirection:'column', gap:'0.55rem' }}>

          {/* ── RÉSUMÉ ──────────────────────────────────────────────── */}
          {plTab === 'resume' && (<>
            {/* Contexte délibérations — 1 accordéon groupé */}
            {(pendingDefs||[]).length > 0 && (
              <div className={`aria-accordion${plCtxOpen!=null ? ' open' : ''}`}>
                {/* Header groupe */}
                <button className="aria-accordion__hdr"
                  onClick={() => setPlCtxOpen(p => p!=null ? null : 0)}>
                  <span className="aria-accordion__arrow">{plCtxOpen!=null ? '▾' : '▸'}</span>
                  <span className="aria-accordion__label">{t('CONTEXT', lang)}</span>
                  <span className="aria-accordion__badge">{pendingDefs.length} {lang==='en'?'countries':'pays'}</span>
                </button>
                {/* Onglets pays + contenu */}
                {plCtxOpen != null && (
                  <div style={{ padding:'0 0.65rem 0.6rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                    {pendingDefs.length > 1 && (
                      <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap' }}>
                        {pendingDefs.map((def, i) => (
                          <button key={i}
                            style={{ ...BTN_SECONDARY, fontSize:'0.40rem', padding:'0.16rem 0.45rem',
                              ...(plCtxOpen===i ? { border:'1px solid rgba(200,164,74,0.40)',
                                color:'rgba(200,164,74,0.85)', background:'rgba(200,164,74,0.08)' } : {}) }}
                            onClick={() => setPlCtxOpen(i)}>
                            {def.realData?.flag || def.realData?.emoji || '🌐'} {def.nom || def.realData?.nom || `Nation ${i+1}`}
                          </button>
                        ))}
                      </div>
                    )}
                    {pendingDefs.map((def, i) => plCtxOpen === i && (
                      <ContextPanel key={i}
                        countryName={def.nom || def.realData?.nom || `Nation ${i+1}`}
                        open={true}
                        onToggle={() => {}}
                        mode={plCtxModes[i] || ''}
                        setMode={v => setPlCtxModes(p => { const a=[...p]; a[i]=v; return a; })}
                        override={plCtxOvrs[i] || ''}
                        setOverride={v => setPlCtxOvrs(p => { const a=[...p]; a[i]=v; return a; })}
                        embedded={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MODE IA (accordéon) ──────────────────────────────────── */}
            {[
              { id:'ia', label:'⚡ MODE IA',
                badge: ariaMode === 'none' ? 'BOARD GAME' : ariaMode === 'solo' ? 'SOLO' : ariaMode === 'custom' ? 'CUSTOM' : 'ARIA',
                content: (
                  <div style={{ padding:'0.5rem 0.6rem', display:'flex', flexDirection:'column', gap:'0.55rem' }}>
                    {availProviders.length === 0 && (
                      <div style={{ fontSize:'0.40rem', color:'rgba(200,100,60,0.70)',
                        fontFamily:FONT.mono, padding:'0.10rem 0.1rem', lineHeight:1.5 }}>
                        {lang==='en'
                          ? '⚠ No API key configured — only Board Game mode available'
                          : '⚠ Aucune clé API configurée — seul le mode Board Game est disponible'}
                      </div>
                    )}
                    <div style={{ display:'flex', gap:'0.35rem' }}>
                      {[
                        { id:'aria',   label:'ARIA — Multi-agent complet' },
                        { id:'solo',   label: t('INIT_SOLO_LABEL', lang) },
                        { id:'custom', label: t('INIT_CUSTOM_LABEL', lang) },
                        { id:'none',   label:'🎲 Board Game' },
                      ].filter(m => {
                        if (availProviders.length === 0) return m.id === 'none';
                        if (ariaMode === 'none') return m.id === 'none';
                        if (availProviders.length === 1) return m.id === 'solo' || m.id === 'none';
                        return true;
                      }).map(m => (
                        <button key={m.id}
                          style={{ ...BTN_SECONDARY, flex:1, fontSize:'0.40rem', padding:'0.28rem 0.4rem',
                            ...(ariaMode===m.id ? { border:'1px solid rgba(200,164,74,0.50)',
                              color:'rgba(200,164,74,0.90)', background:'rgba(200,164,74,0.08)' } : {}) }}
                          onClick={() => setAriaMode(m.id)}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                    {ariaMode === 'none' && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem' }}>
                        <div style={{ fontSize:'0.40rem', color:'rgba(140,160,200,0.40)',
                          fontFamily:FONT.mono, padding:'0.10rem 0.1rem', lineHeight:1.5 }}>
                          {lang==='en'
                            ? 'Pre-written local responses — no API key needed'
                            : 'Réponses locales pré-écrites — sans clé API'}
                        </div>
                        {availProviders.length > 0 && (
                          <button onClick={() => setAriaMode(availProviders.length === 1 ? 'solo' : 'aria')}
                            style={{ background:'none', border:'none', cursor:'pointer', padding:0,
                              fontFamily:FONT.mono, fontSize:'0.40rem',
                              color:'rgba(140,160,200,0.45)', textDecoration:'underline', textAlign:'left' }}>
                            {lang==='en' ? '↺ Enable AI mode' : '↺ Activer le mode IA'}
                          </button>
                        )}
                      </div>
                    )}
                    {(ariaMode === 'aria' || ariaMode === 'custom') && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                        {[
                          { provKey:'ministre_provider',  modelKey:'ministre_model',  label:'Ministre' },
                          { provKey:'synthese_min_prov',  modelKey:'synthese_min_model', label: t('INIT_SYNTH_MIN', lang) },
                          { provKey:'phare_provider',     modelKey:'phare_model',     label:'Phare ☉' },
                          { provKey:'boussole_provider',  modelKey:'boussole_model',  label:'Boussole ☽' },
                          { provKey:'synthese_pres_prov', modelKey:'synthese_pres_model', label: t('INIT_SYNTH_PRES', lang) },
                        ].map(({ provKey, modelKey, label }) => {
                          const prov = roles[provKey] || availProviders[0] || 'openrouter';
                          const models = modelReg[prov] || ARIA_FALLBACK_MODELS[prov] || [];
                          return (
                            <div key={provKey} style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr', gap:'0.3rem', alignItems:'center' }}>
                              <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(140,160,200,0.50)' }}>{label}</span>
                              <select style={{ ...SELECT_STYLE, fontSize:'0.40rem', padding:'0.2rem 0.4rem' }}
                                value={prov}
                                onChange={e => setRoles(r => ({ ...r, [provKey]: e.target.value,
                                  [modelKey]: modelReg[e.target.value]?.[0]?.id || '' }))}>
                                {availProviders.map(p => <option key={p} value={p}>{PROV_LABELS[p]||p}</option>)}
                              </select>
                              <select style={{ ...SELECT_STYLE, fontSize:'0.40rem', padding:'0.2rem 0.4rem' }}
                                value={roles[modelKey] || ''}
                                onChange={e => setRoles(r => ({ ...r, [modelKey]: e.target.value }))}>
                                {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {ariaMode === 'solo' && (
                      availProviders.length === 1 ? (
                        // Un seul provider : cartouche provider + cartouche buttons modèle
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem' }}>
                          <div style={{ display:'flex', gap:'0.3rem', alignItems:'center', flexWrap:'wrap' }}>
                            <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                              color:'rgba(200,164,74,0.70)', letterSpacing:'0.10em',
                              borderLeft:'2px solid rgba(200,164,74,0.35)', paddingLeft:'0.4rem',
                              textTransform:'uppercase' }}>
                              {PROV_LABELS[p0] || p0}
                            </span>
                            {(modelReg[p0] || []).map(m => {
                              const chosen = (roles.ministre_model || '') === m.id;
                              return (
                                <button key={m.id}
                                  style={{ ...BTN_SECONDARY, padding:'0.18rem 0.45rem', fontSize:'0.40rem',
                                    ...(chosen ? { border:'1px solid rgba(200,164,74,0.45)', color:'rgba(200,164,74,0.88)', background:'rgba(200,164,74,0.08)' } : { opacity:0.50 }) }}
                                  onClick={() => setRoles(r => ({ ...r,
                                    ministre_model: m.id, synthese_min_model: m.id,
                                    phare_model: m.id, boussole_model: m.id, synthese_pres_model: m.id,
                                  }))}>
                                  {m.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        // Multi-provider : selects provider + modèle
                        <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr', gap:'0.3rem', alignItems:'center' }}>
                          <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(140,160,200,0.50)' }}>{t('INIT_MODEL_LABEL', lang)}</span>
                          <select style={{ ...SELECT_STYLE, fontSize:'0.40rem', padding:'0.2rem 0.4rem' }}
                            value={roles.ministre_provider || availProviders[0] || 'openrouter'}
                            onChange={e => setRoles(r => ({ ...r,
                              ministre_provider: e.target.value, synthese_min_prov: e.target.value,
                              phare_provider: e.target.value, boussole_provider: e.target.value, synthese_pres_prov: e.target.value,
                              ministre_model: modelReg[e.target.value]?.[0]?.id || '',
                            }))}>
                            {availProviders.map(p => <option key={p} value={p}>{PROV_LABELS[p]||p}</option>)}
                          </select>
                          <select style={{ ...SELECT_STYLE, fontSize:'0.40rem', padding:'0.2rem 0.4rem' }}
                            value={roles.ministre_model || ''}
                            onChange={e => setRoles(r => ({ ...r,
                              ministre_model: e.target.value, synthese_min_model: e.target.value,
                              phare_model: e.target.value, boussole_model: e.target.value, synthese_pres_model: e.target.value,
                            }))}>
                            {(modelReg[roles.ministre_provider] || []).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                          </select>
                        </div>
                      )
                    )}
                  </div>
                )
              },
            ].map(acc => (
              <div key={acc.id} className={`aria-accordion${cfgOpen===acc.id ? ' open' : ''}`}>
                <button className="aria-accordion__hdr"
                  onClick={() => setCfgOpen(p => p===acc.id ? '' : acc.id)}>
                  <span className="aria-accordion__arrow">{cfgOpen===acc.id ? '▾' : '▸'}</span>
                  <span className="aria-accordion__label">{acc.label}</span>
                  {acc.badge && <span className="aria-accordion__badge">{acc.badge}</span>}
                </button>
                {cfgOpen===acc.id && (
                  <div className="aria-accordion__body">
                    {acc.content}
                  </div>
                )}
              </div>
            ))}

            {/* Présidence active */}
            <div style={{ ...CARD_STYLE }}>
              <div style={{ ...labelStyle('0.42rem'), marginBottom:'0.5rem' }}>{t('ACTIVE_PRESIDENCY',lang)}</div>
              <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.5rem' }}>
                {['phare','boussole'].map(key => {
                  const p = plAgents.presidency?.[key]; if (!p) return null;
                  const on = activePres.includes(key);
                  return (
                    <button key={key}
                      style={{ flex:1, padding:'0.5rem 0.6rem', cursor:'pointer', borderRadius:'2px',
                        background: on ? 'rgba(200,164,74,0.06)' : 'rgba(255,255,255,0.01)',
                        border: `1px solid ${on ? 'rgba(200,164,74,0.40)' : 'rgba(255,255,255,0.06)'}`,
                        display:'flex', flexDirection:'column', gap:'0.15rem', textAlign:'left' }}
                      onClick={() => setActivePres(prev =>
                        on ? prev.filter(k=>k!==key) : [...prev, key])}>
                      <div style={{ fontFamily:FONT.mono, fontSize:'0.44rem',
                        color: on ? 'rgba(200,164,74,0.85)' : 'rgba(140,160,200,0.35)' }}>
                        {p.symbol} {p.name} {on ? '✓' : '○'}
                      </div>
                      <div style={{ fontSize:'0.40rem',
                        color: on ? 'rgba(140,160,200,0.55)' : 'rgba(100,120,160,0.30)',
                        lineHeight:1.4 }}>{p.subtitle}</div>
                    </button>
                  );
                })}
              </div>
              {activePres.length === 0 && (
                <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                  color:'rgba(200,100,60,0.55)', padding:'0.3rem' }}>
                  ⚠ Aucun président actif — le Conseil délibère sans arbitrage présidentiel
                </div>
              )}
            </div>

            {/* Ministères actifs */}
            <div style={{ ...CARD_STYLE }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                <div style={labelStyle('0.42rem')}>{t('ACTIVE_MINISTRIES',lang)}</div>
                <button style={{ ...BTN_SECONDARY, fontSize:'0.40rem', padding:'0.18rem 0.5rem' }}
                  onClick={() => setActiveMins(null)}>
                  Tous
                </button>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.28rem' }}>
                {plAgents.ministries.map(m => {
                  const on = activeMins === null || activeMins.includes(m.id);
                  return (
                    <button key={m.id}
                      style={{ ...BTN_SECONDARY, padding:'0.22rem 0.55rem', fontSize:'0.42rem',
                        ...(on ? { border:'1px solid '+m.color+'77', color:m.color, background:m.color+'14' } : {}) }}
                      onClick={() => {
                        const all = plAgents.ministries.map(x=>x.id);
                        const cur = activeMins || all;
                        const next = on ? cur.filter(id=>id!==m.id) : [...cur, m.id];
                        setActiveMins(next.length === all.length ? null : next);
                      }}>
                      {m.emoji} {m.name}
                    </button>
                  );
                })}
              </div>
              {(activeMins && activeMins.length === 0) && (
                <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                  color:'rgba(200,100,60,0.55)', marginTop:'0.3rem' }}>
                  ⚠ Aucun ministère actif — seule la présidence arbitrera
                </div>
              )}
            </div>

            {/* Ministres toggleables dans résumé */}
            <div style={{ ...CARD_STYLE }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.40rem' }}>
                <div style={labelStyle('0.42rem')}>MINISTRES ACTIFS</div>
                <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.38rem' }}
                  onClick={() => setActiveMinsters(null)}>Tous</button>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.25rem' }}>
                {Object.entries(plAgents.ministers).map(([key, min]) => {
                  const allKeys = Object.keys(plAgents.ministers);
                  const on = activeMinsters === null || activeMinsters.includes(key);
                  return (
                    <button key={key}
                      style={{ ...BTN_SECONDARY, padding:'0.18rem 0.46rem', fontSize:'0.40rem',
                        ...(on ? { border:'1px solid '+min.color+'88', color:min.color, background:min.color+'14' } : { opacity:0.40 }) }}
                      onClick={() => toggleMinster(key)}>
                      {min.emoji} {min.name} {on ? '' : '○'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ fontSize:'0.40rem', color:'rgba(140,160,200,0.28)',
              fontFamily:FONT.mono, textAlign:'center' }}>
              {t('HINT_TABS',lang)}
            </div>
          </>)}

          {/* ── PRÉSIDENCE ──────────────────────────────────────────── */}
          {plTab === 'presidency' && (
            <div style={{ ...CARD_STYLE }}>
              {/* Active toggles en haut */}
              <div style={{ display:'flex', gap:'0.4rem', marginBottom:'0.7rem' }}>
                {['phare','boussole'].map(key => {
                  const p = plAgents.presidency?.[key]; if (!p) return null;
                  const on = activePres.includes(key);
                  return (
                    <button key={key}
                      style={{ ...BTN_SECONDARY, flex:1, padding:'0.28rem 0.6rem', fontSize:'0.44rem',
                        ...(on ? { border:'1px solid rgba(200,164,74,0.50)', color:GOLD,
                          background:'rgba(200,164,74,0.08)' } : {}) }}
                      onClick={() => setActivePres(prev => on ? prev.filter(k=>k!==key) : [...prev, key])}>
                      {p.symbol} {p.name} {on ? '● ACTIF' : '○ INACTIF'}
                    </button>
                  );
                })}
              </div>
              {['phare','boussole'].map(key => {
                const p = plAgents.presidency?.[key]; if (!p) return null;
                const on = activePres.includes(key);
                return (
                  <div key={key} style={{ marginBottom:'0.9rem', opacity: on ? 1 : 0.45 }}>
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.44rem',
                      color:'rgba(200,164,74,0.72)', marginBottom:'0.3rem' }}>
                      {p.symbol} {p.name.toUpperCase()} — {p.subtitle}
                    </div>
                    {/* Nom custom */}
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                      color:'rgba(90,110,150,0.42)', marginBottom:'0.15rem' }}>NOM</div>
                    <input style={{ ...INPUT_STYLE, fontSize:'0.46rem', marginBottom:'0.35rem' }}
                      value={p.name}
                      onChange={e => setPlAgents(a => ({...a, presidency:{...a.presidency,
                        [key]:{...a.presidency[key], name:e.target.value}}}))}
                    />
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                      color:'rgba(90,110,150,0.42)', marginBottom:'0.15rem' }}>ESSENCE</div>
                    <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'48px',
                      resize:'vertical', fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5 }}
                      value={p.essence}
                      onChange={e => setPlAgents(a => ({...a, presidency:{...a.presidency,
                        [key]:{...a.presidency[key], essence:e.target.value}}}))}
                    />
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                      color:'rgba(90,110,150,0.42)', margin:'0.28rem 0 0.15rem' }}>RÔLE ÉTENDU</div>
                    <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'48px',
                      resize:'vertical', fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5 }}
                      value={p.role_long}
                      onChange={e => setPlAgents(a => ({...a, presidency:{...a.presidency,
                        [key]:{...a.presidency[key], role_long:e.target.value}}}))}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* ── MINISTÈRES ──────────────────────────────────────────── */}
          {plTab === 'ministries' && (() => {
            const BASE_IDS = ['justice','economie','defense','sante','education','ecologie','chance'];
            const toggleMinById = (id) => {
              const all = plAgents.ministries.map(x=>x.id);
              const cur = activeMins || all;
              const on  = cur.includes(id);
              const next = on ? cur.filter(x=>x!==id) : [...cur, id];
              setActiveMins(next.length === all.length ? null : next);
            };
            const handleGridClickMin = (id) => {
              if (selectedMinistry !== id) {
                setSelectedMinistry(id); // 1er clic : focus, ordre inchangé
              } else {
                const on = activeMins===null || activeMins.includes(id);
                if (on) { toggleMinById(id); setSelectedMinistry(null); }
                else    { toggleMinById(id); }
              }
            };
            const isMinOn = (id) => activeMins===null || activeMins.includes(id);
            // Grille : actifs d'abord, inactifs en bas — focus ne déplace PAS dans la grille
            const gridMins = [
              ...plAgents.ministries.filter(m => isMinOn(m.id)),
              ...plAgents.ministries.filter(m => !isMinOn(m.id)),
            ];
            // Liste détaillée : focused en tête, puis le reste (actifs, puis inactifs)
            const sortedMins = [
              ...plAgents.ministries.filter(m => m.id === selectedMinistry),
              ...plAgents.ministries.filter(m => m.id !== selectedMinistry && isMinOn(m.id)),
              ...plAgents.ministries.filter(m => m.id !== selectedMinistry && !isMinOn(m.id)),
            ];
            return (<>
            {/* 1. Hint */}
            <p style={{ fontFamily:FONT.mono, fontSize:'0.36rem', fontStyle:'italic',
              color:'rgba(100,120,165,0.28)', margin:'0 0 0.05rem', lineHeight:1.9,
              letterSpacing:'0.06em', textAlign:'center', userSelect:'none',
              borderBottom:'1px solid rgba(255,255,255,0.03)', paddingBottom:'0.35rem' }}>
              {lang==='en'
                ? '↑ click to focus · click active again to deactivate · click inactive again to activate'
                : '↑ cliquer pour cibler · recliquer un actif pour désactiver · recliquer un inactif pour activer'}
            </p>

            {/* 2. Grille */}
            <div style={{ ...CARD_STYLE }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.45rem' }}>
            <div style={labelStyle('0.42rem')}>{plAgents.ministries.length} {lang==='en'?'MINISTRIES':'MINISTÈRES'}</div>
            <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.38rem' }}
            onClick={() => { setActiveMins(null); setSelectedMinistry(null); }}>
            {lang==='en'?'All active':'Tous actifs'}
            </button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.28rem' }}>
            {gridMins.map(m => {
              const on  = isMinOn(m.id);
              const sel = selectedMinistry === m.id;
              return (
                <div key={m.id}
                onClick={() => handleGridClickMin(m.id)}
                style={{ display:'flex', alignItems:'center', gap:'0.28rem',
                  padding:'0.26rem 0.50rem', borderRadius:'3px', cursor:'pointer',
                  background: sel ? m.color+'38' : on ? m.color+'18' : 'rgba(8,14,26,0.60)',
                  border: sel ? `2px solid ${m.color}EE` : on ? `1px solid ${m.color}70` : '1px solid rgba(140,160,200,0.10)',
                  transition:'all 0.13s',
                  boxShadow: sel ? `0 0 12px ${m.color}44, inset 0 0 6px ${m.color}10` : on ? `0 0 6px ${m.color}22` : 'none' }}>
                  <span style={{ fontSize:'0.85rem', filter: on ? `drop-shadow(0 0 4px ${m.color}88)` : 'grayscale(1)', opacity: on ? 1 : 0.28, transition:'all 0.13s' }}>{m.emoji}</span>
                  <span style={{ fontFamily:FONT.mono, fontSize:'0.41rem',
                    color: sel ? m.color : on ? m.color+'CC' : 'rgba(140,160,200,0.28)', transition:'all 0.13s',
                    textShadow: (sel || on) ? `0 0 8px ${m.color}66` : 'none' }}>{m.name}</span>
                </div>
              );
            })}
            </div>
            {(activeMins?.length === 0) && (
              <p style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(200,100,60,0.55)', margin:'0.3rem 0 0' }}>
              ⚠ {lang==='en'?'No active ministry — presidency only':'Aucun ministère actif — seule la présidence arbitrera'}
              </p>
            )}
            </div>

            {/* 3. Bloc + Nouveau ministère */}
            {newMinistryForm ? (
              <div style={{ ...CARD_STYLE, border:'1px solid rgba(100,160,255,0.22)' }}>
              <div style={{ ...labelStyle('0.42rem'), color:'rgba(100,160,255,0.70)', marginBottom:'0.5rem' }}>
              + {lang==='en'?'NEW MINISTRY':'NOUVEAU MINISTÈRE'}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr', gap:'0.5rem', marginBottom:'0.4rem' }}>
              <input style={{ ...INPUT_STYLE, width:'2.5rem', textAlign:'center', fontSize:'1rem' }}
              value={newMinistryData.emoji} onChange={e => setNewMinistryData(d=>({...d,emoji:e.target.value}))} placeholder="🏛" />
              <input style={{ ...INPUT_STYLE, fontSize:'0.50rem' }}
              value={newMinistryData.name} onChange={e => setNewMinistryData(d=>({...d,name:e.target.value}))}
              placeholder={t('MINISTRY_NAME', lang)} />
              <input style={{ ...INPUT_STYLE, fontSize:'0.50rem' }}
              value={newMinistryData.id} onChange={e => setNewMinistryData(d=>({...d,id:e.target.value}))}
              placeholder="id_unique" />
              </div>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.4rem' }}>
              <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(140,160,200,0.45)' }}>{lang==='en'?'Color':'Couleur'}</span>
              <input type="color" value={newMinistryData.color}
              style={{ width:'2rem', height:'1.4rem', border:'none', background:'none', cursor:'pointer' }}
              onChange={e => setNewMinistryData(d=>({...d,color:e.target.value}))} />
              </div>
              <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'40px', resize:'vertical',
                fontSize:'0.42rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.4rem' }}
                value={newMinistryData.mission} onChange={e => setNewMinistryData(d=>({...d,mission:e.target.value}))}
                placeholder={t('MINISTRY_MISSION', lang)} />
                <div style={{ display:'flex', gap:'0.4rem', justifyContent:'flex-end' }}>
                <button style={BTN_SECONDARY} onClick={() => setNewMinistryForm(false)}>{lang==='en'?'Cancel':'Annuler'}</button>
                <button style={{ ...BTN_PRIMARY, opacity: newMinistryData.name&&newMinistryData.id ? 1 : 0.35 }}
                disabled={!newMinistryData.name||!newMinistryData.id} onClick={addMinistry}>
                {lang==='en'?'Add →':'Ajouter →'}
                </button>
                </div>
                </div>
            ) : (
              <button style={{ ...BTN_SECONDARY, width:'100%', fontSize:'0.44rem',
                color:'rgba(100,160,255,0.55)', border:'1px solid rgba(100,160,255,0.20)' }}
                onClick={() => setNewMinistryForm(true)}>
                + {lang==='en'?'New ministry':'Nouveau ministère'}
                </button>
            )}

            {/* 4. Liste détaillée — toujours toutes visibles */}
            {sortedMins.map(ministry => {
              const mi   = plAgents.ministries.findIndex(x=>x.id===ministry.id);
              const on   = isMinOn(ministry.id);
              const sel  = selectedMinistry === ministry.id;
              const allMinKeys = Object.keys(plAgents.ministers);
              return (
                <div key={ministry.id} style={{ ...CARD_STYLE,
                  border: sel
                    ? `1px solid ${ministry.color}55`
                    : `1px solid rgba(255,255,255,0.07)`,
                  transition:'border 0.15s, box-shadow 0.15s',
                  boxShadow: sel ? `0 0 12px ${ministry.color}14` : 'none' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.45rem' }}>
                      <span style={{ fontSize:'0.9rem' }}>{ministry.emoji}</span>
                      <div style={{ fontFamily:FONT.mono, fontSize:'0.45rem',
                        letterSpacing:'0.09em', color: on ? ministry.color+'CC' : 'rgba(140,160,200,0.35)', flex:1 }}>
                        {ministry.name.toUpperCase()}
                        </div>
                        {/* Cartouche actif/inactif */}
                        <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.42rem',
                          ...(on ? { border:'1px solid '+ministry.color+'55', color:ministry.color, background:ministry.color+'0E' }
                          : { border:'1px solid rgba(200,80,80,0.25)', color:'rgba(200,80,80,0.55)' }) }}
                          onClick={() => toggleMinById(ministry.id)}>
                          {on ? '● actif' : '○ inactif'}
                          </button>
                          {!BASE_IDS.includes(ministry.id) && (
                            <button style={{ background:'none', border:'none', cursor:'pointer',
                              color:'rgba(200,80,80,0.35)', fontSize:'0.75rem', lineHeight:1, padding:0 }}
                              onClick={() => { setPlAgents(a=>({...a, ministries:a.ministries.filter((_,i)=>i!==mi)})); setSelectedMinistry(null); }}>✕</button>
                          )}
                          </div>
                          <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)', marginBottom:'0.14rem' }}>MISSION</div>
                          <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'34px', resize:'vertical',
                            fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.40rem',
                            ...(!on ? { opacity:0.35, cursor:'not-allowed' } : {}) }}
                            readOnly={!on} value={ministry.mission}
                            onChange={e => on && setPlAgents(a=>({...a,
                              ministries:a.ministries.map((m,i)=>i===mi?{...m,mission:e.target.value}:m)}))} />
                              <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)', marginBottom:'0.20rem' }}>MINISTRES</div>
                              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.24rem', marginBottom:'0.40rem' }}>
                              {allMinKeys.map(mkey => {
                                const min = plAgents.ministers[mkey];
                                const isIn = ministry.ministers.includes(mkey);
                                return (
                                  <button key={mkey} disabled={!on}
                                  style={{ ...BTN_SECONDARY, padding:'0.17rem 0.44rem', fontSize:'0.39rem',
                                    ...(!on ? { opacity:0.25, cursor:'not-allowed' } : {}),
                                        ...(isIn&&on ? { border:'1px solid '+min.color+'88', color:min.color, background:min.color+'16' } : {}) }}
                                        onClick={() => on && setPlAgents(a=>({...a,
                                          ministries:a.ministries.map((m,i)=>i!==mi?m:{
                                            ...m, ministers:isIn?m.ministers.filter(k=>k!==mkey):[...m.ministers,mkey]
                                          })}))}>
                                          {min.emoji} {min.name}
                                          </button>
                                );
                              })}
                              </div>
                              {ministry.ministers.length > 0 && (<>
                                <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)', marginBottom:'0.20rem' }}>PROMPTS MINISTÉRIELS</div>
                                {ministry.ministers.map(mkey => {
                                  const min = plAgents.ministers[mkey];
                                  return (
                                    <div key={mkey} style={{ marginBottom:'0.30rem' }}>
                                    <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:min.color+'AA', marginBottom:'0.10rem' }}>
                                    {min.emoji} {min.name}
                                    </div>
                                    <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'30px', resize:'vertical',
                                      fontSize:'0.39rem', fontFamily:FONT.mono, lineHeight:1.48,
                                      ...(!on ? { opacity:0.25, cursor:'not-allowed' } : {}) }}
                                      readOnly={!on} value={ministry.ministerPrompts?.[mkey]||''}
                                      onChange={e => on && setPlAgents(a=>({...a,
                                        ministries:a.ministries.map((m,i)=>i!==mi?m:{
                                          ...m, ministerPrompts:{...(m.ministerPrompts||{}),[mkey]:e.target.value}
                                        })}))} />
                                        </div>
                                  );
                                })}
                                </>)}
                                </div>
              );
            })}
            </>);
          })()}

          {/* ── MINISTRES ───────────────────────────────────────────── */}
          {plTab === 'ministers' && (() => {
            const allEntries = Object.entries(plAgents.ministers);
            const isMinsterOn = (k) => activeMinsters===null || activeMinsters.includes(k);
            const handleGridClickMinster = (key) => {
              if (selectedMinister !== key) {
                setSelectedMinister(key); // 1er clic : focus, ordre inchangé
              } else {
                const on = isMinsterOn(key);
                if (on) { toggleMinster(key); setSelectedMinister(null); }
                else    { toggleMinster(key); }
              }
            };
            // Grille : actifs d'abord, inactifs en bas — focus ne déplace PAS dans la grille
            const gridMinsters = [
              ...allEntries.filter(([k]) => isMinsterOn(k)),
              ...allEntries.filter(([k]) => !isMinsterOn(k)),
            ];
            // Liste détaillée : focused en tête, puis le reste (actifs, puis inactifs)
            const sortedMinsters = [
              ...allEntries.filter(([k]) => k === selectedMinister),
              ...allEntries.filter(([k]) => k !== selectedMinister && isMinsterOn(k)),
              ...allEntries.filter(([k]) => k !== selectedMinister && !isMinsterOn(k)),
            ];
            return (<>
            {/* 1. Hint */}
            <p style={{ fontFamily:FONT.mono, fontSize:'0.36rem', fontStyle:'italic',
              color:'rgba(100,120,165,0.28)', margin:'0 0 0.05rem', lineHeight:1.9,
              letterSpacing:'0.06em', textAlign:'center', userSelect:'none',
              borderBottom:'1px solid rgba(255,255,255,0.03)', paddingBottom:'0.35rem' }}>
              {lang==='en'
                ? '↑ click to focus · click active again to deactivate · click inactive again to activate'
                : '↑ cliquer pour cibler · recliquer un actif pour désactiver · recliquer un inactif pour activer'}
            </p>

            {/* 2. Grille */}
            <div style={{ ...CARD_STYLE }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.45rem' }}>
            <div style={labelStyle('0.42rem')}>{allEntries.length} {lang==='en'?'MINISTERS':'MINISTRES'}</div>
            <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.38rem' }}
            onClick={() => { setActiveMinsters(null); setSelectedMinister(null); }}>
            {lang==='en'?'All active':'Tous actifs'}
            </button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.28rem' }}>
            {gridMinsters.map(([key, min]) => {
              const on  = isMinsterOn(key);
              const sel = selectedMinister === key;
              return (
                <div key={key}
                onClick={() => handleGridClickMinster(key)}
                style={{ display:'flex', alignItems:'center', gap:'0.28rem',
                  padding:'0.26rem 0.50rem', borderRadius:'3px', cursor:'pointer',
                  background: sel ? min.color+'38' : on ? min.color+'18' : 'rgba(8,14,26,0.60)',
                  border: sel ? `2px solid ${min.color}EE` : on ? `1px solid ${min.color}70` : '1px solid rgba(140,160,200,0.10)',
                  transition:'all 0.13s',
                  boxShadow: sel ? `0 0 8px ${min.color}33` : on ? `0 0 4px ${min.color}18` : 'none' }}>
                  <span style={{ fontSize:'0.85rem', filter: on ? `drop-shadow(0 0 3px ${min.color}66)` : 'grayscale(1)', opacity: on ? 1 : 0.28, transition:'all 0.13s' }}>{min.emoji}</span>
                  <span style={{ fontFamily:FONT.mono, fontSize:'0.41rem',
                    color: sel ? min.color : on ? min.color+'CC' : 'rgba(140,160,200,0.28)', transition:'all 0.13s',
                    textShadow: sel ? `0 0 6px ${min.color}55` : 'none' }}>{min.name}</span>
                  {min.sign === 'Custom' && (
                    <span style={{ fontFamily:FONT.mono, fontSize:'0.28rem',
                      color:'rgba(140,160,200,0.22)', marginLeft:'0.1rem' }}>custom</span>
                  )}
                </div>
              );
            })}
            </div>
            </div>

            {/* 3. Bloc + Nouveau ministre */}
            {newMinForm ? (
              <div style={{ ...CARD_STYLE, border:'1px solid rgba(100,200,120,0.22)' }}>
              <div style={{ ...labelStyle('0.42rem'), color:'rgba(100,200,120,0.70)', marginBottom:'0.5rem' }}>
              + {lang==='en'?'NEW MINISTER':'NOUVEAU MINISTRE'}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr auto', gap:'0.45rem',
                marginBottom:'0.4rem', alignItems:'center' }}>
                <input style={{ ...INPUT_STYLE, width:'2.2rem', textAlign:'center', fontSize:'1rem' }}
                value={newMinData.emoji} onChange={e => setNewMinData(d=>({...d,emoji:e.target.value}))} placeholder="🌟" />
                <input style={{ ...INPUT_STYLE, fontSize:'0.48rem' }}
                value={newMinData.name} onChange={e => setNewMinData(d=>({...d,name:e.target.value}))}
                placeholder={lang==='en'?'Minister name':'Nom du ministre'} />
                <input style={{ ...INPUT_STYLE, fontSize:'0.48rem' }}
                value={newMinData.id} onChange={e => setNewMinData(d=>({...d,id:e.target.value}))}
                placeholder="id_unique" />
                <input type="color" value={newMinData.color}
                style={{ width:'2rem', height:'1.8rem', border:'none', background:'none', cursor:'pointer' }}
                onChange={e => setNewMinData(d=>({...d,color:e.target.value}))} />
                </div>
                <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'36px', resize:'vertical',
                  fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.35rem' }}
                  value={newMinData.essence} onChange={e => setNewMinData(d=>({...d,essence:e.target.value}))}
                  placeholder={t('CONST_ESSENCE_PH', lang)} />
                  <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'28px', resize:'vertical',
                    fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.4rem' }}
                    value={newMinData.comm} onChange={e => setNewMinData(d=>({...d,comm:e.target.value}))}
                    placeholder={lang==='en'?'Communication style…':'Style de communication…'} />
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(90,110,150,0.42)', marginBottom:'0.12rem' }}>
                    {lang==='en'?'ANNOTATION ANGLE':'ANGLE D\'ANNOTATION'}
                    <span style={{ fontWeight:'normal', color:'rgba(90,110,150,0.32)' }}> — {lang==='en'?'inter-ministerial question':'question posée lors des annotations inter-ministérielles'}</span>
                    </div>
                    <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'26px', resize:'vertical',
                      fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.4rem' }}
                      value={newMinData.annotation} onChange={e => setNewMinData(d=>({...d,annotation:e.target.value}))}
                      placeholder={lang==='en'?"E.g. What is the minister's position on…":"Ex : Quelle est la position du ministre sur l'équilibre entre…"} />
                      <div style={{ display:'flex', gap:'0.4rem', justifyContent:'flex-end' }}>
                      <button style={BTN_SECONDARY} onClick={() => setNewMinForm(false)}>{lang==='en'?'Cancel':'Annuler'}</button>
                      <button style={{ ...BTN_PRIMARY, opacity: newMinData.name&&newMinData.id ? 1 : 0.35 }}
                      disabled={!newMinData.name||!newMinData.id} onClick={addMinister}>
                      {lang==='en'?'Add →':'Ajouter →'}
                      </button>
                      </div>
                      </div>
            ) : (
              <button style={{ ...BTN_SECONDARY, width:'100%', fontSize:'0.44rem',
                color:'rgba(100,200,120,0.50)', border:'1px solid rgba(100,200,120,0.18)' }}
                onClick={() => setNewMinForm(true)}>
                + {lang==='en'?'New minister':'Nouveau ministre'}
                </button>
            )}

            {/* 4. Liste détaillée — toujours toutes visibles */}
            {sortedMinsters.map(([key, min]) => {
              const on  = isMinsterOn(key);
              const sel = selectedMinister === key;
              return (
                <div key={key} style={{ ...CARD_STYLE,
                  border: sel
                    ? `1px solid ${min.color}55`
                    : `1px solid rgba(255,255,255,0.07)`,
                  transition:'border 0.15s, box-shadow 0.15s',
                  boxShadow: sel ? `0 0 12px ${min.color}14` : 'none' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem' }}>
                      <input style={{ ...INPUT_STYLE, width:'2.2rem', textAlign:'center', fontSize:'1rem',
                        ...(!on ? { opacity:0.35, cursor:'not-allowed' } : {}) }}
                        readOnly={!on} value={min.emoji}
                        onChange={e => on && setPlAgents(a=>({...a,
                          ministers:{...a.ministers,[key]:{...a.ministers[key],emoji:e.target.value}}}))} />
                          <input style={{ ...INPUT_STYLE, flex:1, fontSize:'0.48rem',
                            ...(!on ? { opacity:0.35, cursor:'not-allowed' } : {}) }}
                            readOnly={!on} value={min.name}
                            onChange={e => on && setPlAgents(a=>({...a,
                              ministers:{...a.ministers,[key]:{...a.ministers[key],name:e.target.value}}}))} />
                              <input type="color" value={min.color} disabled={!on}
                              style={{ width:'1.8rem', height:'1.6rem', border:'none', background:'none',
                                cursor: on ? 'pointer' : 'not-allowed', opacity: on ? 1 : 0.3 }}
                                onChange={e => on && setPlAgents(a=>({...a,
                                  ministers:{...a.ministers,[key]:{...a.ministers[key],color:e.target.value}}}))} />
                                  {/* Cartouche actif/inactif */}
                                  <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.42rem', flexShrink:0,
                                    ...(on ? { border:'1px solid '+min.color+'55', color:min.color, background:min.color+'0E' }
                                    : { border:'1px solid rgba(200,80,80,0.25)', color:'rgba(200,80,80,0.55)' }) }}
                                    onClick={() => toggleMinster(key)}>
                                    {on ? '● actif' : '○ inactif'}
                                    </button>
                                    {min.sign === 'Custom' && (
                                      <button style={{ background:'none', border:'none', cursor:'pointer',
                                        color:'rgba(200,80,80,0.35)', fontSize:'0.75rem', lineHeight:1, padding:0 }}
                                        onClick={() => { setPlAgents(a => { const m={...a.ministers}; delete m[key]; return {...a,ministers:m}; });
                                        setSelectedMinister(null); }}>✕</button>
                                    )}
                                    </div>
                                    <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)', marginBottom:'0.14rem' }}>ESSENCE</div>
                                    <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'36px', resize:'vertical',
                                      fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.28rem',
                                      ...(!on ? { opacity:0.25, cursor:'not-allowed' } : {}) }}
                                      readOnly={!on} value={min.essence||''}
                                      onChange={e => on && setPlAgents(a=>({...a,
                                        ministers:{...a.ministers,[key]:{...a.ministers[key],essence:e.target.value}}}))} />
                                        <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)', marginBottom:'0.14rem' }}>
                                        {lang==='en'?'COMMUNICATION STYLE':'STYLE DE COMMUNICATION'}
                                        </div>
                                        <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'28px', resize:'vertical',
                                          fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.5,
                                          ...(!on ? { opacity:0.25, cursor:'not-allowed' } : {}) }}
                                          readOnly={!on} value={min.comm||''}
                                          onChange={e => on && setPlAgents(a=>({...a,
                                            ministers:{...a.ministers,[key]:{...a.ministers[key],comm:e.target.value}}}))} />
                                            <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:'rgba(90,110,150,0.38)',
                                              marginBottom:'0.14rem', marginTop:'0.22rem' }}>
                                              {lang==='en'?'ANNOTATION ANGLE':'ANGLE D\'ANNOTATION'}
                                              <span style={{ fontWeight:'normal', opacity:0.55 }}> — {lang==='en'?'inter-ministerial question':'question inter-ministérielle'}</span>
                                              </div>
                                              <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'26px', resize:'vertical',
                                                fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.5,
                                                ...(!on ? { opacity:0.25, cursor:'not-allowed' } : {}) }}
                                                readOnly={!on} value={min.annotation||''}
                                                onChange={e => on && setPlAgents(a=>({...a,
                                                  ministers:{...a.ministers,[key]:{...a.ministers[key],annotation:e.target.value}}}))} />
                                                  </div>
              );
            })}
            </>);
          })()}
        </div>
      )}

      {!plLoading && !plAgents && (
        <div style={{ fontFamily:FONT.mono, fontSize:'0.46rem',
          color:'rgba(200,80,80,0.55)', textAlign:'center', padding:'1rem' }}>
          ⚠ Impossible de charger les agents. Lancement avec les défauts du moteur.
        </div>
      )}

      <div style={{ display:'flex', gap:'0.6rem', width:'100%', justifyContent:'space-between' }}>
        <button style={BTN_SECONDARY} onClick={onBack}>{t('BACK',lang)}</button>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button style={{ ...BTN_SECONDARY, fontSize:'0.44rem',
            color:'rgba(200,80,80,0.50)', border:'1px solid rgba(200,80,80,0.20)' }}
            onClick={resetAgents}>{lang==='en'?'↺ Default':'↺ Défaut'}</button>
          <button style={BTN_PRIMARY} onClick={() => setConfirmLaunch(true)}>
            {t('GENERATE',lang)}
          </button>
        </div>
      </div>

      {/* ── Dialog récap final avant génération ── */}
      {confirmLaunch && (
        <div style={{ position:'fixed', inset:0, background:'rgba(4,8,18,0.92)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}
          onClick={() => setConfirmLaunch(false)}>
          <div style={{ background:'rgba(8,14,26,0.98)', border:'1px solid rgba(200,164,74,0.30)',
            borderRadius:'4px', maxWidth:480, width:'92%', display:'flex', flexDirection:'column',
            gap:'1.1rem', padding:'1.8rem', boxShadow:'0 8px 40px rgba(0,0,0,0.7)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily:FONT.mono, fontSize:'0.58rem', letterSpacing:'0.18em', color:'rgba(200,164,74,0.90)' }}>
              ⚖ {lang==='en' ? 'WORLD SUMMARY' : 'RÉCAPITULATIF DU MONDE'}
            </div>
            <RecapAccordion
              pendingDefs={pendingDefs}
              perGov={perGov}
              commonAgents={commonAgents}
              commonMins={commonMins}
              commonPres={commonPres}
              commonMinsters={commonMinsters}
              lang={lang}
              ctxModes={plCtxModes}
              ctxOvrs={plCtxOvrs}
            />
            <div style={{ display:'flex', gap:'0.6rem', justifyContent:'flex-end' }}>
              <button style={{ ...BTN_SECONDARY, fontSize:'0.46rem' }} onClick={() => setConfirmLaunch(false)}>
                {lang==='en' ? '← Edit' : '← Modifier'}
              </button>
              <button style={{ ...BTN_PRIMARY, fontSize:'0.46rem' }} onClick={() => { setConfirmLaunch(false); saveAndLaunch(); }}>
                {lang==='en' ? 'GENERATE WORLD →' : 'GÉNÉRER LE MONDE →'}
              </button>
            </div>
          </div>
        </div>
      )}
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
