// src/features/world/modals/AddCountryModal.jsx
import { useState, useEffect, useRef } from 'react';
import { useLocale } from '../../../ariaI18n';
import { REAL_COUNTRIES_DATA, REAL_COUNTRIES_DATA_EN } from '../../../shared/data/ariaData';
import { getTerrainLabel, getRegimeLabel } from '../../../shared/data/worldLabels';
import { getStats, getApiKeys } from '../../../Dashboard_p1';
import { S } from './modalStyles';

// ── Helpers fuzzy-match pays réels ────────────────────────────────────────────
const _p3norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,' ').replace(/\s+/g,' ').trim();
const _p3lev = (a, b) => {
  const m = a.length, n = b.length;
  const d = Array.from({length:m+1}, (_,i) => Array.from({length:n+1},(_,j) => i===0?j:j===0?i:0));
  for (let i=1;i<=m;i++) for(let j=1;j<=n;j++) d[i][j] = a[i-1]===b[j-1] ? d[i-1][j-1] : 1+Math.min(d[i-1][j],d[i][j-1],d[i-1][j-1]);
  return d[m][n];
};
const _p3rcMatch = (q, name) => {
  const nq = _p3norm(q), nr = _p3norm(name);
  const parts = [nr, ...nr.split(/[\s-]+/)];
  for (const r of parts) {
    if (!r || r.length < 2) continue;
    const ratio = Math.min(nq.length,r.length)/Math.max(nq.length,r.length);
    if (nq === r) return 'found';
    if (r.startsWith(nq) && nq.length >= r.length*0.85) return 'found';
    if (nq.replace(/ou$/,'u').replace(/eau/g,'o') === r.replace(/ou$/,'u').replace(/eau/g,'o') && nq.length >= 3) return 'found';
    if (_p3lev(nq,r) <= 2 && ratio >= 0.70 && nq.length >= 3) return 'suggestion';
    const ph = s => s.replace(/ph/g,'f').replace(/qu/g,'k').replace(/w/g,'v').replace(/[aeiou]/g,'').replace(/[^a-z]/g,'');
    if (ph(nq)===ph(r) && ph(nq).length>=3 && ratio>=0.70) return 'suggestion';
  }
  return null;
};
let _p3AllCache = null;
const _p3getAllCountries = async () => {
  if (_p3AllCache) return _p3AllCache;
  try {
    const r = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,translations',
      { signal: AbortSignal.timeout(6000) });
    if (r.ok) _p3AllCache = await r.json();
  } catch(_) {}
  return _p3AllCache || [];
};
const _p3rcDisplayName = (rc, lang) =>
  lang==='fr' ? (rc.translations?.fra?.common||rc.name?.common||'') : (rc.name?.common||'');

const _p3validateCountry = async (query, lang) => {
  if (!query || query.length < 2) return { status:'notfound', displayName:null, canonicalName:null };
  const apiQuery = _p3norm(query);
  let data = [];
  try {
    const r = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(apiQuery)}?fields=name,flags,population,translations`,
      { signal: AbortSignal.timeout(4000) });
    if (r.ok) data = await r.json();
  } catch(_) { return { status:'error', displayName:null, canonicalName:null }; }

  let bestStatus = null, bestRc = null;
  for (const rc of (Array.isArray(data)?data:[]).slice(0,8)) {
    const names = [rc.name?.common,rc.name?.official,rc.translations?.fra?.common].filter(Boolean);
    for (const name of names) {
      const m = _p3rcMatch(query, name);
      if (m==='found') { bestStatus='found'; bestRc=rc; break; }
      if (m==='suggestion' && bestStatus!=='found') { bestStatus='suggestion'; bestRc=rc; }
    }
    if (bestStatus==='found') break;
  }
  if (bestStatus && bestRc)
    return { status:bestStatus, displayName:_p3rcDisplayName(bestRc,lang), canonicalName:bestRc.name?.common||query };

  // Pass 2 : fuzzy sur /all
  const all = await _p3getAllCountries();
  let bestScore=99, best2Rc=null;
  for (const rc of all) {
    const names = [rc.name?.common,rc.name?.official,rc.translations?.fra?.common].filter(Boolean);
    for (const name of names) {
      const nq=_p3norm(query), nr=_p3norm(name);
      const d=_p3lev(nq, nr.slice(0,nq.length+3));
      const ratio=Math.min(nq.length,nr.length)/Math.max(nq.length,nr.length);
      if (d<bestScore && d<=3 && ratio>=0.60 && nq.length>=3) { bestScore=d; best2Rc=rc; }
    }
  }
  if (best2Rc && bestScore<=3) {
    const names2=[best2Rc.name?.common,best2Rc.name?.official,best2Rc.translations?.fra?.common].filter(Boolean);
    let st2=null;
    for (const name of names2) { const m=_p3rcMatch(query,name); if(m&&!st2) st2=m; }
    const status=st2||(bestScore<=1?'found':'suggestion');
    return { status, displayName:_p3rcDisplayName(best2Rc,lang), canonicalName:best2Rc.name?.common||query };
  }
  return { status:'notfound', displayName:null, canonicalName:null };
};

// ── CountryInfoCard ───────────────────────────────────────────────────────────
export function P3CountryInfoCard({ data }) {
  const { lang } = useLocale();
  const [open, setOpen] = useState(false);
  if (!data) return null;
  const fmtPop = n => n>=1e9?(n/1e9).toFixed(1)+' Md':n>=1e6?(n/1e6).toFixed(1)+' M':n>=1e3?Math.round(n/1e3)+' k':String(n);
  const ariaCol = (data.aria_acceptance_irl||0)>=60?'rgba(140,100,220,0.80)':(data.aria_acceptance_irl||0)>=40?'rgba(100,130,200,0.70)':'rgba(90,110,160,0.50)';
  const MONO = "'JetBrains Mono',monospace";
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
      <div style={{ display:'flex', gap:'0.8rem', alignItems:'flex-start' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.25rem' }}>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <span style={{ fontFamily:MONO, fontSize:'0.43rem', color:'rgba(140,160,200,0.55)' }}>POP.</span>
            <span style={{ fontFamily:MONO, fontSize:'0.46rem', color:'rgba(200,215,240,0.75)', fontWeight:600 }}>{fmtPop(data.population||0)}</span>
          </div>
          {data.pib_index && <div style={{ display:'flex', gap:'0.5rem' }}>
            <span style={{ fontFamily:MONO, fontSize:'0.43rem', color:'rgba(140,160,200,0.55)' }}>PIB</span>
            <span style={{ fontFamily:MONO, fontSize:'0.46rem', color:'rgba(200,215,240,0.75)' }}>Indice {data.pib_index}</span>
          </div>}
        </div>
        {data.aria_acceptance_irl !== undefined && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.2rem' }}>
            <div style={{ fontFamily:MONO, fontSize:'0.41rem', letterSpacing:'0.10em', color:ariaCol }}>ARIA IRL</div>
            <div style={{ fontFamily:MONO, fontSize:'0.90rem', fontWeight:700, color:ariaCol, lineHeight:1 }}>{data.aria_acceptance_irl}%</div>
            <div style={{ width:60, height:4, background:'rgba(14,20,36,0.9)', borderRadius:'2px', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${data.aria_acceptance_irl}%`, background:ariaCol, borderRadius:'2px' }} />
            </div>
          </div>
        )}
      </div>
      {data.aria_sociology_logic && (
        <div style={{ fontSize:'0.44rem', color:'rgba(120,140,180,0.55)', lineHeight:1.55, fontStyle:'italic', padding:'0.35rem 0.5rem', background:'rgba(200,164,74,0.03)', borderRadius:'2px', borderLeft:'2px solid rgba(200,164,74,0.15)' }}>
          {data.aria_sociology_logic}
        </div>
      )}
      {data.triple_combo && (
        <button onClick={() => setOpen(o=>!o)}
          style={{ background:'none', border:'1px solid rgba(90,110,160,0.20)', borderRadius:'2px', padding:'0.28rem 0.55rem', cursor:'pointer', fontFamily:MONO, fontSize:'0.42rem', color:'rgba(90,110,160,0.55)', textAlign:'left', letterSpacing:'0.08em' }}>
          {open ? (lang==='en'?'▲ Hide geopolitical context':'▲ Masquer le contexte géopolitique') : (lang==='en'?'▼ Show geopolitical context':'▼ Voir le contexte géopolitique')}
        </button>
      )}
      {open && data.triple_combo && (
        <div style={{ fontSize:'0.44rem', color:'rgba(140,160,200,0.58)', lineHeight:1.65, padding:'0.4rem 0.5rem', background:'rgba(90,110,160,0.04)', borderRadius:'2px', border:'1px solid rgba(90,110,160,0.12)' }}>
          {data.triple_combo}
        </div>
      )}
    </div>
  );
}

// ── Modal "Ajouter un pays" ───────────────────────────────────────────────────
export default function AddCountryModal({ onConfirm, onClose }) {
  const { lang: uiLang } = useLocale();
  const MONO = "'JetBrains Mono', monospace";

  const isOnline = (() => { try { const k=getApiKeys(); return !!(k.claude||k.gemini||k.grok||k.openai); } catch{return false;} })();

  const [step, setStep] = useState(1);

  const realCountries = uiLang === 'en' ? REAL_COUNTRIES_DATA_EN : REAL_COUNTRIES_DATA;

  const [type, setType]       = useState('imaginaire');
  const [nom,     setNom]     = useState('');
  const [terrain, setTerrain] = useState('coastal');
  const [regime,  setRegime]  = useState('democratie_liberale');
  const [selReal, setSelReal] = useState('');
  const [rcSearch,     setRcSearch]     = useState('');
  const [rcStatus,     setRcStatus]     = useState(null);
  const [rcSuggestion, setRcSuggestion] = useState(null);
  const [rcRealData,   setRcRealData]   = useState(null);
  const rcTimer   = useRef(null);
  const rcQueryRef = useRef('');

  const TERRAIN_OPTS = Object.keys(getStats().terrains || {}).map(k => [k, getTerrainLabel(k, uiLang)]);
  const REGIME_OPTS  = Object.keys(getStats().regimes  || {}).map(k => [k, getRegimeLabel(k, uiLang)]);

  const { regimes: regSim, terrains: terSim } = getStats();

  const searchReal = async (query) => {
    rcQueryRef.current = query;
    if (!query || query.length < 3) { setRcStatus(null); return; }
    const local = realCountries.find(r =>
      r.nom.toLowerCase() === query.toLowerCase() || r.id === query.toLowerCase().replace(/[^a-z]/g,'')
    );
    if (local) { setRcStatus('found'); setRcRealData(local); return; }
    setRcStatus('searching');
    try {
      const ai = await _p3validateCountry(query, uiLang);
      if (rcQueryRef.current !== query) return;
      if (ai.status === 'notfound' || !ai.displayName) { setRcStatus('notfound'); return; }
      if (ai.status === 'suggestion') {
        setRcStatus('suggestion'); setRcSuggestion(ai.displayName); return;
      }
      const nomFinal = ai.displayName;
      let flag='🌐', population=5_000_000;
      try {
        const rc = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(ai.canonicalName||nomFinal)}?fields=name,flag,population`)
          .then(r => r.ok ? r.json() : []);
        if (rc[0]) { flag=rc[0].flag||'🌐'; population=rc[0].population||5_000_000; }
      } catch(_) {}
      setRcRealData({ id:nomFinal.toLowerCase().replace(/[^a-z0-9]/g,'-'), nom:nomFinal, flag, regime:'democratie_liberale', terrain:'coastal', population, _fromApi:true });
      setRcStatus('found');
    } catch(_) { setRcStatus('error'); }
  };

  useEffect(() => {
    if (type !== 'reel' || !isOnline) return;
    setRcStatus(null); setRcSuggestion(null); setRcRealData(null);
    rcQueryRef.current = '';
    clearTimeout(rcTimer.current);
    if (!rcSearch || rcSearch.length < 3) return;
    rcTimer.current = setTimeout(() => searchReal(rcSearch), 700);
    return () => clearTimeout(rcTimer.current);
  }, [rcSearch, type]);

  const canConfirm = type === 'imaginaire'
    ? nom.trim().length > 0
    : type === 'reel' && !isOnline
      ? !!selReal
      : type === 'reel' && isOnline
        ? rcStatus === 'found'
        : false;

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (type === 'imaginaire') {
      onConfirm({ type:'imaginaire', nom:nom.trim(), terrain, regime, realData:null });
    } else if (type === 'reel' && !isOnline) {
      const rc = realCountries.find(r => r.id === selReal);
      if (rc) onConfirm({ type:'reel', nom:rc.nom, terrain:rc.terrain||'coastal', regime:rc.regime||'democratie_liberale', realData:rc });
    } else if (type === 'reel' && isOnline && rcRealData) {
      onConfirm({ type:'reel', nom:rcRealData.nom, terrain:rcRealData.terrain||'coastal', regime:rcRealData.regime||'democratie_liberale', realData:rcRealData });
    }
  };

  const fieldStyle = {
    background:'rgba(8,13,22,0.95)', border:'1px solid rgba(200,164,74,0.20)',
    borderRadius:'2px', padding:'0.45rem 0.65rem',
    color:'rgba(220,228,240,0.85)', fontFamily:MONO, fontSize:'0.54rem',
    outline:'none', width:'100%', boxSizing:'border-box',
  };
  const labelSt = { fontFamily:MONO, fontSize:'0.40rem', letterSpacing:'0.16em', color:'rgba(200,164,74,0.50)', marginBottom:'0.3rem' };
  const activeToggle = { border:'1px solid rgba(200,164,74,0.40)', color:'rgba(200,164,74,0.88)', background:'rgba(200,164,74,0.08)' };
  const baseToggle   = { background:'rgba(255,255,255,0.02)', border:'1px solid rgba(200,164,74,0.12)', color:'rgba(140,160,200,0.55)', borderRadius:'2px', padding:'0.30rem 0.5rem', fontFamily:MONO, fontSize:'0.48rem', cursor:'pointer', flex:1 };
  const titleColor = type === 'reel' ? 'rgba(100,160,240,0.85)' : 'rgba(58,191,122,0.80)';
  const titleIcon  = type === 'reel' ? '🌍' : '✦';
  const titleLabel = type === 'reel'
    ? (uiLang==='en'?'ADD A REAL COUNTRY':'AJOUTER UN PAYS RÉEL')
    : (uiLang==='en'?'ADD A FICTIONAL NATION':'NOUVELLE NATION FICTIVE');

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width:'440px', maxHeight:'85vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>

        <div style={S.modalHeader}>
          <span style={{ ...S.modalTitle, color:titleColor }}>{titleIcon} {titleLabel}</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding:'0.85rem 1rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>

          <div style={{ display:'flex', gap:'0.4rem' }}>
            {[
              { v:'imaginaire', l: isOnline ? (uiLang==='en'?'🌐 Fictional (AI)':'🌐 Fictif (IA)') : (uiLang==='en'?'🌐 Fictional':'🌐 Fictif') },
              { v:'reel',       l: isOnline ? (uiLang==='en'?'🗺 Real country (AI)':'🗺 Pays réel (IA)') : (uiLang==='en'?'🗺 Real country':'🗺 Pays réel') },
            ].map(opt => (
              <button key={opt.v}
                style={{ ...baseToggle, ...(type===opt.v ? activeToggle : {}) }}
                onClick={() => { setType(opt.v); setRcStatus(null); setRcSuggestion(null); setRcRealData(null); setRcSearch(''); setSelReal(''); }}>
                {opt.l}
              </button>
            ))}
          </div>

          {/* ══ PAYS FICTIF ══ */}
          {type === 'imaginaire' && (
            <>
              <div>
                <div style={labelSt}>NOM</div>
                <input style={fieldStyle} value={nom} autoFocus
                  onChange={e => setNom(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && canConfirm && handleConfirm()}
                  placeholder={uiLang==='en'?'Ex: Arvalia, Morvaine, Zephoria…':'Ex : Arvalia, Morvaine, Zephoria…'} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
                <div>
                  <div style={labelSt}>{uiLang==='en'?'TERRAIN':'TERRAIN'}</div>
                  <select style={fieldStyle} value={terrain} onChange={e => setTerrain(e.target.value)}>
                    {TERRAIN_OPTS.map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <div style={labelSt}>{uiLang==='en'?'REGIME':'RÉGIME'}</div>
                  <select style={fieldStyle} value={regime} onChange={e => setRegime(e.target.value)}>
                    {REGIME_OPTS.map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', padding:'0.4rem 0.6rem', background:'rgba(58,191,122,0.04)', borderLeft:'2px solid rgba(58,191,122,0.18)', borderRadius:'2px' }}>
                <span style={{ fontFamily:MONO, fontSize:'0.42rem', color:'rgba(140,160,200,0.55)' }}>👥 ~{(((terSim[terrain]?.pop_base)||5e6)/1e6).toFixed(1)} M</span>
                <span style={{ fontFamily:MONO, fontSize:'0.42rem', color:'rgba(140,160,200,0.55)' }}>😊 ~{regSim[regime]?.sat_base||50}%</span>
                <span style={{ fontFamily:MONO, fontSize:'0.42rem', color:'rgba(100,130,200,0.70)' }}>◈ ARIA IRL ~{regSim[regime]?.aria_irl_base||35}%</span>
              </div>
            </>
          )}

          {/* ══ PAYS RÉEL — HORS LIGNE ══ */}
          {type === 'reel' && !isOnline && (
            <>
              <div>
                <div style={labelSt}>{uiLang==='en'?'SELECT':'SÉLECTIONNER'}</div>
                <select style={fieldStyle} value={selReal}
                  onChange={e => setSelReal(e.target.value)}>
                  <option value="">{uiLang==='en'?'— Choose —':'— Choisir —'}</option>
                  {realCountries.map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
                </select>
              </div>
              {selReal && (() => {
                const rc = realCountries.find(r => r.id === selReal);
                return rc ? (
                  <>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
                      <div>
                        <div style={labelSt}>TERRAIN</div>
                        <div style={{ ...fieldStyle, opacity:0.55, fontSize:'0.48rem' }}>{getTerrainLabel(rc.terrain, uiLang)}</div>
                      </div>
                      <div>
                        <div style={labelSt}>RÉGIME</div>
                        <div style={{ ...fieldStyle, opacity:0.55, fontSize:'0.48rem' }}>{getRegimeLabel(rc.regime, uiLang)}</div>
                      </div>
                    </div>
                    <P3CountryInfoCard data={rc} />
                  </>
                ) : null;
              })()}
              {!selReal && (
                <div style={{ fontSize:'0.42rem', color:'rgba(90,110,160,0.45)', fontStyle:'italic', textAlign:'center', padding:'0.5rem 0' }}>
                  {uiLang==='en'?'10 preset real countries available offline.':'10 pays réels disponibles hors ligne.'}
                </div>
              )}
            </>
          )}

          {/* ══ PAYS RÉEL — EN LIGNE ══ */}
          {type === 'reel' && isOnline && (
            <>
              <div>
                <div style={labelSt}>{uiLang==='en'?'COUNTRY NAME':'NOM DU PAYS'}</div>
                <select style={{ ...fieldStyle, marginBottom:'0.35rem' }}
                  value={realCountries.find(r=>r.nom.toLowerCase()===rcSearch.toLowerCase())?.id||'_free'}
                  onChange={e => {
                    if (e.target.value==='_free') { setRcSearch(''); setRcStatus(null); setRcRealData(null); }
                    else {
                      const rc = realCountries.find(r=>r.id===e.target.value);
                      if (rc) { setRcSearch(rc.nom); setRcStatus('found'); setRcRealData(rc); }
                    }
                  }}>
                  <option value="_free">{uiLang==='en'?'— Type freely —':'— Saisir librement —'}</option>
                  {realCountries.map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
                </select>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <input style={{ ...fieldStyle, flex:1 }} value={rcSearch}
                      placeholder={uiLang==='en'?'Ex: Canada, Morocco, Singapore…':'Ex : Canada, Maroc, Singapour…'}
                      onChange={e => { setRcSearch(e.target.value); setRcStatus(null); setRcRealData(null); setRcSuggestion(null); }} />
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', minHeight:'1.1rem' }}>
                    <span style={{ fontFamily:MONO, fontSize:'0.40rem', color:'rgba(100,120,160,0.45)' }}>VÉRIFICATION</span>
                    {rcStatus==='searching'  && <span style={{ color:'rgba(200,164,74,0.55)',  fontSize:'0.38rem' }}>⟳ {uiLang==='en'?'checking…':'vérification…'}</span>}
                    {rcStatus==='found'      && <span style={{ color:'rgba(58,191,122,0.80)', fontSize:'0.38rem' }}>✓ {uiLang==='en'?'country recognised':'pays reconnu'}</span>}
                    {rcStatus==='notfound'   && <span style={{ color:'rgba(200,80,80,0.70)',  fontSize:'0.38rem' }}>✗ {uiLang==='en'?'unknown country':'pays inconnu'}</span>}
                    {rcStatus==='error'      && <span style={{ color:'rgba(200,164,74,0.50)', fontSize:'0.38rem' }}>⚠ {uiLang==='en'?'offline':'hors ligne'}</span>}
                    {rcStatus==='suggestion' && rcSuggestion && (
                      <button
                        onClick={() => { setRcSearch(rcSuggestion); setRcStatus(null); setRcSuggestion(null); setRcRealData(null); }}
                        style={{ fontFamily:MONO, fontSize:'0.38rem', color:'rgba(200,164,74,0.90)', background:'rgba(200,164,74,0.10)', border:'1px solid rgba(200,164,74,0.30)', borderRadius:'2px', padding:'0.10rem 0.40rem', cursor:'pointer' }}>
                        → {rcSuggestion} ?
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {rcStatus==='found' && rcRealData && <P3CountryInfoCard data={rcRealData} />}
              {rcStatus!=='found' && rcSearch.length>2 && rcStatus!=='notfound' && (
                <div style={{ fontSize:'0.43rem', color:'rgba(100,120,160,0.50)', fontStyle:'italic', lineHeight:1.5 }}>
                  ⚡ {uiLang==='en'?'AI will generate':'L\'IA génèrera'} <strong style={{ color:'rgba(200,164,74,0.60)' }}>{rcSearch}</strong> {uiLang==='en'?'based on current geopolitical data.':'basé sur sa situation politique actuelle.'}
                </div>
              )}
            </>
          )}

        </div>

        {/* ── Footer étape 1 ── */}
        {step === 1 && (
          <div style={S.modalFooter}>
            <button style={S.cancelBtn} onClick={onClose}>{uiLang==='en'?'CANCEL':'ANNULER'}</button>
            <button
              style={{ ...S.saveBtn, opacity:canConfirm?1:0.35, color:titleColor, borderColor:type==='reel'?'rgba(100,160,240,0.40)':'rgba(58,191,122,0.40)', background:canConfirm?(type==='reel'?'rgba(100,160,240,0.08)':'rgba(58,191,122,0.10)'):'transparent' }}
              disabled={!canConfirm}
              onClick={() => setStep(2)}>
              {uiLang==='en'?'NEXT →':'SUIVANT →'}
            </button>
          </div>
        )}

        {/* ── Étape 2 : choix hériter / personnaliser ── */}
        {step === 2 && (() => {
          const defObj = type === 'imaginaire'
            ? { nom: nom.trim(), terrain, regime, realData: null }
            : type === 'reel' && !isOnline
              ? (() => { const rc = realCountries.find(r => r.id === selReal); return rc ? { nom: rc.nom, terrain: rc.terrain||'coastal', regime: rc.regime||'democratie_liberale', realData: rc } : null; })()
              : rcRealData ? { nom: rcRealData.nom, terrain: rcRealData.terrain||'coastal', regime: rcRealData.regime||'democratie_liberale', realData: rcRealData } : null;
          if (!defObj) return null;
          const accentColor = type === 'reel' ? 'rgba(100,160,240,0.80)' : 'rgba(58,191,122,0.80)';
          return (
            <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(200,164,74,0.05)', border: '1px solid rgba(200,164,74,0.15)', borderRadius: '2px' }}>
                <div style={{ fontFamily: MONO, fontSize: '0.38rem', letterSpacing: '0.14em', color: 'rgba(200,164,74,0.50)', marginBottom: '0.35rem' }}>
                  {uiLang==='en'?'WILL INHERIT':'HÉRITERA DE'}
                </div>
                <div style={{ fontFamily: MONO, fontSize: '0.42rem', color: 'rgba(180,200,230,0.70)', lineHeight: 1.6 }}>
                  {uiLang==='en'?'The common governance (aria_options):':'La gouvernance commune (aria_options) :'}
                </div>
                <div style={{ fontFamily: MONO, fontSize: '0.40rem', color: 'rgba(140,160,200,0.55)', lineHeight: 1.6, marginTop: '0.2rem' }}>
                  🏛️ {uiLang==='en'?'Active ministers — default config':'Ministres actifs — config par défaut'}<br/>
                  ⚖️ {uiLang==='en'?'Presidency mode — common':'Mode de présidence — commun'}<br/>
                  🌐 {uiLang==='en'?'Context mode — global':'Mode contexte — global'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  style={{ flex: 1, fontFamily: MONO, fontSize: '0.46rem', padding: '0.55rem 0.5rem', background: 'rgba(200,164,74,0.07)', border: '1px solid rgba(200,164,74,0.25)', borderRadius: '2px', color: 'rgba(200,164,74,0.85)', cursor: 'pointer' }}
                  onClick={() => onConfirm(defObj, false)}>
                  {uiLang==='en'?'Inherit →':'Hériter →'}
                </button>
                <button
                  style={{ flex: 1, fontFamily: MONO, fontSize: '0.46rem', padding: '0.55rem 0.5rem', background: `rgba(${type==='reel'?'100,160,240':'58,191,122'},0.08)`, border: `1px solid ${accentColor.replace('0.80','0.35')}`, borderRadius: '2px', color: accentColor, cursor: 'pointer' }}
                  onClick={() => onConfirm(defObj, true)}>
                  {uiLang==='en'?'Customise →':'Personnaliser →'}
                </button>
              </div>
              <button style={{ ...S.cancelBtn, alignSelf: 'center' }} onClick={() => setStep(1)}>← {uiLang==='en'?'Back':'Retour'}</button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
