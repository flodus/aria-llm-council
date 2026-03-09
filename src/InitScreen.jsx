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
import { REAL_COUNTRIES_DATA } from './ariaData';
import { PAYS_LOCAUX } from './Dashboard_p1';
import {
  FONT, COLOR, CARD_STYLE, INPUT_STYLE, SELECT_STYLE,
  BTN_PRIMARY, BTN_SECONDARY, TERRAIN_LABELS, REGIME_LABELS, labelStyle,
} from './ariaTheme';

// ── Styles locaux ─────────────────────────────────────────────────────────
const S = {
  wrap:  (wide) => ({
    display:'flex', flexDirection:'column', alignItems:'center',
    gap:'1.8rem', width:'100%', maxWidth: wide ? 700 : 460, padding:'2rem',
  }),
  mCard: {
    background:'rgba(255,255,255,0.02)', border:`1px solid ${COLOR.border}`,
    borderRadius:'2px', padding:'1rem 1.2rem', cursor:'pointer',
    display:'flex', flexDirection:'column', gap:'0.4rem', flex:1,
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

// ── Sous-composant : Header ARIA ──────────────────────────────────────────
function ARIAHeader({ showQuote }) {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{
        fontFamily: FONT.cinzel, fontSize:'clamp(2.4rem,6vw,4rem)', fontWeight:700,
        letterSpacing:'clamp(0.6rem,1.5vw,1.1rem)', color:'#C8A44A',
        textShadow:'0 0 60px rgba(200,164,74,0.45)', animation:'float 4s ease-in-out infinite',
      }}>ARIA</div>
      <div style={{
        fontFamily: FONT.cinzel, fontSize:'0.50rem', letterSpacing:'0.32em',
        color:'#3A4A62', marginTop:'0.4rem',
      }}>ARCHITECTURE DE RAISONNEMENT INSTITUTIONNEL PAR L'IA</div>
      {showQuote && (
        <p style={{
          fontSize:'0.75rem', color:'#5A6A8A', fontStyle:'italic',
          marginTop:'0.8rem', lineHeight:1.75, maxWidth:380, textAlign:'center',
        }}>
          "Et si les politiques d'un pays étaient soumises au peuple<br/>
          par l'intermédiaire d'un conseil des ministres IA ?"
        </p>
      )}
    </div>
  );
}

// ── Sous-composant : Saisie de clé API inline ─────────────────────────────
const KEY_STATUS_STYLE = (s) => ({
  fontFamily: FONT.mono, fontSize:'0.44rem', letterSpacing:'0.10em',
  color: s==='ok' ? 'rgba(100,200,120,0.85)' : s==='error' ? 'rgba(220,80,80,0.85)' : s==='testing' ? 'rgba(200,164,74,0.70)' : 'rgba(90,110,160,0.40)',
});

function APIKeyInline({ onClose }) {
  const loadKeys = () => {
    try { return JSON.parse(localStorage.getItem('aria_api_keys')||'{}'); } catch { return {}; }
  };
  const loadModels = () => { try { return JSON.parse(localStorage.getItem('aria_preferred_models')||'{}'); } catch { return {}; } };
  const [keys,   setKeys]   = useState(loadKeys);
  const [models, setModels] = useState(loadModels);
  const [status, setStatus] = useState({ claude:null, gemini:null, grok:null, openai:null });

  const PROVIDERS = [
    { id:'claude', label:'CLAUDE',  sub:'Anthropic',  ph:'sk-ant-…',
      versions:[
        { id:'claude-opus-4-6',           label:'Opus 4.6' },
        { id:'claude-sonnet-4-6',         label:'Sonnet 4.6 ★' },
        { id:'claude-haiku-4-5-20251001', label:'Haiku 4.5' },
      ],
      testUrl: async (k, model) => {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method:'POST', headers:{ 'Content-Type':'application/json','x-api-key':k,
            'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
          body: JSON.stringify({ model: model||'claude-haiku-4-5-20251001', max_tokens:10, messages:[{role:'user',content:'Hi'}] }),
        }); return r.ok;
    }},
    { id:'gemini', label:'GEMINI',  sub:'Google',     ph:'AIza…',
      versions:[
        { id:'gemini-2.5-pro-preview-05-06', label:'2.5 Pro Preview' },
        { id:'gemini-2.0-flash',             label:'2.0 Flash ★' },
        { id:'gemini-1.5-pro',               label:'1.5 Pro' },
        { id:'gemini-1.5-flash',             label:'1.5 Flash' },
      ],
      testUrl: async (k, model) => {
        const m = model||'gemini-2.0-flash';
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${k}`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents:[{parts:[{text:'Hi'}]}], generationConfig:{maxOutputTokens:10} }),
        }); return r.ok || r.status===429;
    }},
    { id:'grok',   label:'GROK',    sub:'xAI',        ph:'xai-…',
      versions:[
        { id:'grok-3',      label:'Grok 3' },
        { id:'grok-3-mini', label:'Grok 3 Mini ★' },
      ],
      testUrl: async (k, model) => {
        const r = await fetch('https://api.x.ai/v1/chat/completions', {
          method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${k}`},
          body: JSON.stringify({ model: model||'grok-3-mini', max_tokens:10, messages:[{role:'user',content:'Hi'}] }),
        }); return r.ok;
    }},
    { id:'openai', label:'OPENAI',  sub:'OpenAI',     ph:'sk-…',
      versions:[
        { id:'gpt-4.1',      label:'GPT-4.1' },
        { id:'gpt-4.1-mini', label:'GPT-4.1 Mini ★' },
        { id:'o4-mini',      label:'o4-mini' },
      ],
      testUrl: async (k, model) => {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${k}`},
          body: JSON.stringify({ model: model||'gpt-4.1-mini', max_tokens:10, messages:[{role:'user',content:'Hi'}] }),
        }); return r.ok;
    }},
  ];

  const testKey = async (id) => {
    if (!keys[id]) { setStatus(s=>({...s,[id]:'missing'})); return; }
    setStatus(s=>({...s,[id]:'testing'}));
    try {
      const prov = PROVIDERS.find(p=>p.id===id);
      const ok = await prov.testUrl(keys[id], models[id]);
      setStatus(s=>({...s,[id]: ok ? 'ok' : 'error'}));
    } catch { setStatus(s=>({...s,[id]:'error'})); }
  };

  const anyOk = Object.values(status).some(s=>s==='ok');

  const save = () => {
    try {
      const existing = loadKeys();
      const merged = { ...existing, ...keys };
      localStorage.setItem('aria_api_keys', JSON.stringify(merged));
      const st = {};
      PROVIDERS.forEach(p => { if (status[p.id]==='ok') st[p.id]='ok'; });
      localStorage.setItem('aria_api_keys_status', JSON.stringify(st));
      // Save preferred models per provider
      const existingModels = loadModels();
      localStorage.setItem('aria_preferred_models', JSON.stringify({...existingModels, ...models}));
    } catch {}
    onClose();
  };

  const stLabel = (s) => s==='ok'?'✅':s==='error'?'❌':s==='testing'?'⏳':s==='missing'?'⚠':'';

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(4,8,18,0.92)',
      backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ ...CARD_STYLE, width:480, display:'flex', flexDirection:'column', gap:'0.7rem' }}>
        <div style={{ ...labelStyle(), marginBottom:'0.1rem' }}>🔑 CLÉS API</div>
        <p style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.40)',
          margin:0, lineHeight:1.6 }}>
          Stockées localement — aucun serveur. Configurez au moins une clé.
        </p>

        {PROVIDERS.map(prov => {
          const val = keys[prov.id] || '';
          const s   = status[prov.id];
          return (
            <div key={prov.id} style={{ padding:'0.55rem 0.7rem',
              background: val ? 'rgba(200,164,74,0.03)' : 'rgba(255,255,255,0.015)',
              border:`1px solid ${s==='ok' ? 'rgba(58,191,122,0.28)' : val ? 'rgba(200,164,74,0.14)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius:'2px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem' }}>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.46rem', letterSpacing:'0.14em',
                  color:'rgba(200,215,240,0.75)', flex:1 }}>{prov.label}</span>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                  color:'rgba(100,120,160,0.40)' }}>{prov.sub}</span>
              </div>
              <div style={{ display:'flex', gap:'0.4rem', alignItems:'center', marginBottom:'0.3rem' }}>
                <input style={{ ...INPUT_STYLE, flex:1, fontSize:'0.48rem' }} type="password"
                  value={val}
                  onChange={e => { setKeys(k=>({...k,[prov.id]:e.target.value})); setStatus(s=>({...s,[prov.id]:null})); }}
                  placeholder={prov.ph} />
                <button style={{ ...BTN_SECONDARY, padding:'0.35rem 0.55rem', fontSize:'0.44rem', whiteSpace:'nowrap' }}
                  disabled={!val} onClick={()=>testKey(prov.id)}>Test</button>
                {s && <span style={{ fontFamily:FONT.mono, fontSize:'0.50rem', minWidth:'1rem' }}>{stLabel(s)}</span>}
              </div>
              {/* Version selector */}
              <div style={{ display:'flex', gap:'0.22rem', flexWrap:'wrap' }}>
                {prov.versions.map(v => {
                  const chosen = (models[prov.id] || prov.versions.find(x=>x.label.includes('★'))?.id || prov.versions[0]?.id) === v.id;
                  return (
                    <button key={v.id}
                      style={{ ...BTN_SECONDARY, padding:'0.18rem 0.45rem', fontSize:'0.40rem',
                        ...(chosen ? { borderColor:'rgba(200,164,74,0.45)', color:'rgba(200,164,74,0.88)', background:'rgba(200,164,74,0.08)' } : { opacity:0.55 }) }}
                      onClick={() => setModels(m => ({...m, [prov.id]: v.id}))}>
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!anyOk && Object.values(keys).some(v=>v) && (
          <div style={{ fontSize:'0.42rem', color:'rgba(200,164,74,0.45)', lineHeight:1.5 }}>
            ⚠ Testez au moins une clé pour activer la sauvegarde.
          </div>
        )}

        <div style={{ display:'flex', gap:'0.6rem', justifyContent:'flex-end', marginTop:'0.2rem' }}>
          <button style={BTN_SECONDARY} onClick={onClose}>ANNULER</button>
          <button style={{ ...BTN_PRIMARY, opacity: anyOk ? 1 : 0.35 }}
            disabled={!anyOk} onClick={save}>SAUVEGARDER</button>
        </div>
      </div>
    </div>
  );
}


// ── Sous-composant : Fiche info pays réel ────────────────────────────────
function CountryInfoCard({ data }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  const fmtPop = (n) => n >= 1e9 ? (n/1e9).toFixed(1)+' Md' : n >= 1e6 ? (n/1e6).toFixed(1)+' M' : n >= 1e3 ? Math.round(n/1e3)+' k' : String(n);
  const ariaCol = data.aria_acceptance_irl >= 60 ? 'rgba(140,100,220,0.80)'
                : data.aria_acceptance_irl >= 40 ? 'rgba(100,130,200,0.70)'
                :                                  'rgba(90,110,160,0.50)';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
      {/* Rangée principale */}
      <div style={{ display:'flex', gap:'0.8rem', alignItems:'flex-start' }}>
        {/* Population + régime */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.25rem' }}>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.55)', letterSpacing:'0.08em' }}>POP.</span>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.46rem', color:'rgba(200,215,240,0.75)', fontWeight:600 }}>{fmtPop(data.population)}</span>
          </div>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(140,160,200,0.55)', letterSpacing:'0.08em' }}>PIB</span>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.46rem', color:'rgba(200,215,240,0.75)' }}>Indice {data.pib_index}</span>
          </div>
        </div>
        {/* ARIA IRL */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.2rem' }}>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.41rem', letterSpacing:'0.10em', color:ariaCol }}>ARIA IRL</div>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.90rem', fontWeight:700, color:ariaCol, lineHeight:1 }}>{data.aria_acceptance_irl}%</div>
          <div style={{ width:60, height:4, background:'rgba(14,20,36,0.9)', borderRadius:'2px', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${data.aria_acceptance_irl}%`, background:ariaCol, borderRadius:'2px' }} />
          </div>
        </div>
      </div>
      {/* Sociologie ARIA */}
      <div style={{ fontSize:'0.44rem', color:'rgba(120,140,180,0.55)', lineHeight:1.55, fontStyle:'italic', padding:'0.35rem 0.5rem', background:'rgba(200,164,74,0.03)', borderRadius:'2px', borderLeft:'2px solid rgba(200,164,74,0.15)' }}>
        {data.aria_sociology_logic}
      </div>
      {/* Contexte géopolitique — expandable */}
      {data.triple_combo && (
        <button
          onClick={() => setOpen(o=>!o)}
          style={{ background:'none', border:'1px solid rgba(90,110,160,0.20)', borderRadius:'2px', padding:'0.28rem 0.55rem', cursor:'pointer', fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(90,110,160,0.55)', textAlign:'left', letterSpacing:'0.08em' }}>
          {open ? '▲ Masquer le contexte géopolitique' : '▼ Voir le contexte géopolitique'}
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

// ── Sous-composant : Config d'un pays (mode personnalisé) ─────────────────
function CountryConfig({ c, idx, mode, onChange, onRemove, canRemove }) {
  const setField = (k, v) => onChange({ ...c, [k]: v });

  return (
    <div style={{ ...CARD_STYLE, padding:'0.9rem 1rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={labelStyle('0.44rem')}>NATION {idx + 1}</div>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          {c.realData && <span style={S.tag}>{c.realData.flag} PAYS RÉEL</span>}
          {canRemove && (
            <button onClick={onRemove} style={{ background:'none', border:'none', color:'rgba(200,80,80,0.45)', cursor:'pointer', fontSize:'0.75rem' }}>✕</button>
          )}
        </div>
      </div>

      {/* Toggle fictif / réel */}
      <div style={{ display:'flex', gap:'0.4rem' }}>
        {[
          { v:'imaginaire', l: mode==='ai' ? '🌐 Fictif (IA)' : '🌐 Fictif' },
          { v:'reel',       l: mode==='ai' ? '🗺 Pays réel (IA)' : '🗺 Pays réel' },
        ].map(t => (
          <button key={t.v}
            style={{ ...BTN_SECONDARY, flex:1, padding:'0.3rem', fontSize:'0.48rem',
              ...(c.type === t.v ? { borderColor:'rgba(200,164,74,0.40)', color:'rgba(200,164,74,0.88)', background:'rgba(200,164,74,0.08)' } : {}) }}
            onClick={() => onChange({ ...c, type:t.v, realData:null, nom:'', terrain:'coastal', regime:'democratie_liberale' })}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── PAYS RÉEL EN LIGNE : saisie libre → IA génère, avec fiche si connu ── */}
      {c.type === 'reel' && mode === 'ai' && (() => {
        const nomLow = c.nom.toLowerCase().replace(/[^a-z]/g, '');
        const knownMatch = REAL_COUNTRIES_DATA.find(r =>
          r.nom.toLowerCase() === c.nom.toLowerCase() ||
          r.id === nomLow
        );

        // Fuzzy match : trouve le pays le plus proche si saisie libre non reconnue
        const fuzzyMatch = !knownMatch && c.nom.length >= 3 ? (() => {
          const needle = c.nom.toLowerCase();
          let best = null, bestScore = 0;
          for (const r of REAL_COUNTRIES_DATA) {
            const hay = r.nom.toLowerCase();
            // Score : inclusion + longueur commune
            let score = 0;
            if (hay.includes(needle) || needle.includes(hay.slice(0,4))) score += 2;
            // Levenshtein simplifié : nb de lettres en commun
            const common = [...needle].filter(ch => hay.includes(ch)).length;
            score += common / Math.max(needle.length, hay.length);
            if (score > bestScore && score > 0.6) { bestScore = score; best = r; }
          }
          return best;
        })() : null;

        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            <div>
              <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>NOM DU PAYS</div>
              <select style={SELECT_STYLE} value={knownMatch?.id||'_free'}
                onChange={e => {
                  if (e.target.value === '_free') { setField('nom', ''); }
                  else {
                    const rc = REAL_COUNTRIES_DATA.find(r => r.id === e.target.value);
                    if (rc) setField('nom', rc.nom);
                  }
                }}>
                <option value="_free">— Saisir librement —</option>
                {REAL_COUNTRIES_DATA.map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
              </select>
              {(!knownMatch) && (
                <input style={{ ...INPUT_STYLE, fontSize:'0.54rem', marginTop:'0.4rem' }} value={c.nom}
                  onChange={e => setField('nom', e.target.value)}
                  placeholder="Ex : Canada, Maroc, Singapour…" />
              )}
            </div>
            {/* Suggestion si faute de frappe probable */}
            {fuzzyMatch && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.35rem 0.5rem',
                background:'rgba(200,164,74,0.05)', border:'1px solid rgba(200,164,74,0.18)',
                borderRadius:'2px', flexWrap:'wrap' }}>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(200,164,74,0.55)' }}>
                  ❓ Vouliez-vous dire
                </span>
                <button
                  style={{ fontFamily:FONT.mono, fontSize:'0.46rem', color:'rgba(200,164,74,0.90)',
                    background:'rgba(200,164,74,0.10)', border:'1px solid rgba(200,164,74,0.30)',
                    borderRadius:'2px', padding:'0.15rem 0.5rem', cursor:'pointer' }}
                  onClick={() => setField('nom', fuzzyMatch.nom)}>
                  {fuzzyMatch.flag} {fuzzyMatch.nom} →
                </button>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(140,160,200,0.35)' }}>
                  (ou continuer avec "{c.nom}" si intentionnel)
                </span>
              </div>
            )}
            {knownMatch
              ? <CountryInfoCard data={knownMatch} />
              : c.nom && !fuzzyMatch && (
                <div style={{ fontSize:'0.43rem', color:'rgba(100,120,160,0.50)', fontStyle:'italic', lineHeight:1.5 }}>
                  ⚡ L'IA génèrera <strong style={{ color:'rgba(200,164,74,0.60)' }}>{c.nom}</strong> basé sur sa situation politique actuelle.
                </div>
              )
            }
          </div>
        );
      })()}

      {/* ── PAYS RÉEL HORS LIGNE : dropdown + terrain/régime éditables ── */}
      {c.type === 'reel' && mode === 'local' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          <div>
            <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>SÉLECTIONNER</div>
            <select style={SELECT_STYLE} value={c.realData?.id||''}
              onChange={e => {
                const rc = REAL_COUNTRIES_DATA.find(r => r.id === e.target.value);
                if (rc) onChange({ ...c, nom:rc.nom, regime:rc.regime, terrain:rc.terrain, realData:rc });
              }}>
              <option value="">— Choisir —</option>
              {REAL_COUNTRIES_DATA.map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
            </select>
          </div>
          {c.realData && (
            <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                <div>
                  <div style={{ ...labelStyle('0.42rem'), marginBottom:'0.25rem' }}>TERRAIN</div>
                  <select style={SELECT_STYLE} value={c.terrain} onChange={e => setField('terrain', e.target.value)}>
                    {Object.entries(TERRAIN_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ ...labelStyle('0.42rem'), marginBottom:'0.25rem' }}>RÉGIME</div>
                  <select style={SELECT_STYLE} value={c.regime} onChange={e => setField('regime', e.target.value)}>
                    {Object.entries(REGIME_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
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
              {PAYS_LOCAUX.map(p => (
                <button key={p.id}
                  style={{ ...SELECT_STYLE, flex:'1 1 80px', cursor:'pointer', padding:'0.28rem 0.4rem',
                    borderColor: c.realData?.id === p.id ? `${p.couleur}80` : undefined,
                    background:  c.realData?.id === p.id ? `${p.couleur}18` : undefined,
                    color: c.realData?.id === p.id ? p.couleur : 'rgba(180,200,230,0.60)',
                    fontSize:'0.46rem', letterSpacing:'0.06em',
                  }}
                  onClick={() => onChange({ ...c, nom: p.nom, terrain: p.terrain, regime: p.regime, realData: p })}>
                  {p.emoji} {p.nom}
                </button>
              ))}
              <button
                style={{ ...SELECT_STYLE, flex:'1 1 80px', cursor:'pointer', padding:'0.28rem 0.4rem',
                  borderColor: (!c.realData) ? 'rgba(200,164,74,0.45)' : 'rgba(255,255,255,0.06)',
                  background:  (!c.realData) ? 'rgba(200,164,74,0.08)' : 'rgba(255,255,255,0.01)',
                  color: (!c.realData) ? 'rgba(200,164,74,0.90)' : 'rgba(180,200,230,0.60)',
                  fontSize:'0.46rem', letterSpacing:'0.06em',
                }}
                onClick={() => onChange({ ...c, nom: '', realData: null })}>
                ✨ Nouveau
              </button>
            </div>
          </div>

          {/* Si preset local sélectionné : résumé */}
          {c.realData?.id && PAYS_LOCAUX.find(p => p.id === c.realData.id) && (
            <div style={{ fontSize:'0.43rem', color:'rgba(140,160,200,0.55)', lineHeight:1.55,
              padding:'0.35rem 0.5rem', background:'rgba(200,164,74,0.03)',
              borderLeft:'2px solid rgba(200,164,74,0.15)', borderRadius:'2px' }}>
              {c.realData.description}
              <div style={{ marginTop:'0.3rem', display:'flex', gap:'0.8rem', flexWrap:'wrap' }}>
                <span>👤 {c.realData.leader}</span>
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
                  <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>TERRAIN</div>
                  <select style={SELECT_STYLE} value={c.terrain} onChange={e => setField('terrain', e.target.value)}>
                    {Object.entries(TERRAIN_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>RÉGIME</div>
                  <select style={SELECT_STYLE} value={c.regime} onChange={e => setField('regime', e.target.value)}>
                    {Object.entries(REGIME_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
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
                      🌍 {TERRAIN_LABELS[c.terrain] || c.terrain}
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
// ── PreLaunchScreen — constitution editor before world generation ────────────
function PreLaunchScreen({ worldName, pendingPreset, pendingDefs, onBack, onLaunch }) {
  const [plAgents,     setPlAgents]     = useState(null);
  const [plLoading,    setPlLoading]    = useState(true);
  const [plTab,        setPlTab]        = useState('resume');
  const [plCountry,    setPlCountry]    = useState(0);
  // Active subsets
  const [activeMins,   setActiveMins]   = useState(null); // null = tous
  const [activePres,   setActivePres]   = useState(['phare','boussole']);
  // New minister/ministry forms
  const [newMinForm,   setNewMinForm]   = useState(false);
  const [newMinData,   setNewMinData]   = useState({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'' });
  const [newMinistryForm, setNewMinistryForm] = useState(false);
  const [newMinistryData, setNewMinistryData] = useState({ id:'', name:'', emoji:'🏛', color:'#8090C0', mission:'', ministers:[] });
  const [activeMinsters, setActiveMinsters] = useState(null); // null = tous actifs
  const scrollRef = useRef(null);
  // Contexte délibérations par pays (index = index dans pendingDefs)
  const [plCtxOpen,  setPlCtxOpen]  = useState(null); // index du pays ouvert, ou null
  const [plCtxModes, setPlCtxModes] = useState(() => (pendingDefs||[]).map(d => d.context_mode || ''));
  const [plCtxOvrs,  setPlCtxOvrs]  = useState(() => (pendingDefs||[]).map(d => d.contextOverride || ''));

  useEffect(() => {
    const load = async () => {
      try {
        const ov = JSON.parse(localStorage.getItem('aria_agents_override')||'null');
        if (ov) {
          setPlAgents(ov);
          if (ov.active_ministries) setActiveMins(ov.active_ministries);
          if (ov.active_presidency) setActivePres(ov.active_presidency);
          if (ov.active_ministers)  setActiveMinsters(ov.active_ministers);
          setPlLoading(false); return;
        }
        const mod = await import('../templates/base_agents.json');
        setPlAgents(JSON.parse(JSON.stringify(mod.default)));
      } catch { setPlAgents(null); }
      setPlLoading(false);
    };
    load();
  }, []);

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
    if (plAgents) {
      try {
        localStorage.setItem('aria_agents_override', JSON.stringify({
          ...plAgents,
          active_ministries: activeMins,
          active_presidency: activePres,
          active_ministers:  activeMinsters,
        }));
      } catch {}
    }
    // Merge ctx overrides back into pendingDefs
    const defs = (pendingDefs || []).map((d, i) => ({
      ...d,
      context_mode:    plCtxModes[i] || undefined,
      contextOverride: plCtxOvrs[i]  || undefined,
    }));
    onLaunch(pendingPreset, defs);
  };

  const resetAgents = () => {
    localStorage.removeItem('aria_agents_override');
    setActiveMins(null); setActivePres(['phare','boussole']);
    setPlAgents(null); setPlLoading(true);
    import('../templates/base_agents.json').then(mod => {
      setPlAgents(JSON.parse(JSON.stringify(mod.default)));
      setPlLoading(false);
    }).catch(() => setPlLoading(false));
  };

  const addMinister = () => {
    if (!newMinData.id || !newMinData.name) return;
    const id = newMinData.id.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z_]/g,'');
    if (!id) return;
    setPlAgents(a => ({ ...a, ministers: { ...a.ministers, [id]: { ...newMinData, id, sign:'Custom', weight:1 } } }));
    setNewMinData({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'' });
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
      gap:'1.2rem', width:'100%', maxWidth:680, padding:'2rem' }}>
      <ARIAHeader showQuote={false} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%' }}>
        <div style={labelStyle()}>CONSTITUTION — {worldName}</div>
        {hasMulti && (
          <div style={{ display:'flex', gap:'0.3rem', flexWrap:'wrap', justifyContent:'flex-end' }}>
            {countries.map((c, i) => (
              <button key={i}
                style={{ ...BTN_SECONDARY, padding:'0.22rem 0.50rem', fontSize:'0.42rem',
                  ...(plCountry===i ? { borderColor:'rgba(200,164,74,0.50)',
                    color:'rgba(200,164,74,0.90)', background:'rgba(200,164,74,0.08)' } : {}) }}
                onClick={() => setPlCountry(i)}>
                {c.realData?.flag||'🌐'} {c.nom||c.realData?.nom||`Nation ${i+1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(200,164,74,0.10)', width:'100%' }}>
        {['resume','presidency','ministries','ministers'].map(t => (
          <button key={t} style={tabStyle(plTab===t)}
            onClick={() => { setPlTab(t); if(scrollRef.current) scrollRef.current.scrollTop=0; }}>
            {t==='resume'?'RÉSUMÉ':t==='presidency'?'PRÉSIDENCE':t==='ministries'?'MINISTÈRES':'MINISTRES'}
          </button>
        ))}
      </div>

      {plLoading && <div style={{ fontFamily:FONT.mono, fontSize:'0.48rem',
        color:'rgba(200,164,74,0.50)', padding:'1.5rem', textAlign:'center' }}>Chargement…</div>}

      {!plLoading && plAgents && (
        <div ref={scrollRef} style={{ width:'100%', overflowY:'auto', maxHeight:'52vh',
          display:'flex', flexDirection:'column', gap:'0.55rem' }}>

          {/* ── RÉSUMÉ ──────────────────────────────────────────────── */}
          {plTab === 'resume' && (<>
            {/* Présidence active */}
            <div style={{ ...CARD_STYLE }}>
              <div style={{ ...labelStyle('0.42rem'), marginBottom:'0.5rem' }}>PRÉSIDENCE ACTIVE</div>
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
                <div style={labelStyle('0.42rem')}>MINISTÈRES ACTIFS</div>
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
                        ...(on ? { borderColor:m.color+'77', color:m.color, background:m.color+'14' } : {}) }}
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

            {/* Contexte délibérations par pays */}
            {(pendingDefs || []).map((def, i) => (
              <ContextPanel
                key={i}
                countryName={def.nom || def.realData?.nom || `Nation ${i+1}`}
                open={plCtxOpen === i}
                onToggle={() => setPlCtxOpen(p => p === i ? null : i)}
                mode={plCtxModes[i] || ''}
                setMode={v => setPlCtxModes(p => { const a=[...p]; a[i]=v; return a; })}
                override={plCtxOvrs[i] || ''}
                setOverride={v => setPlCtxOvrs(p => { const a=[...p]; a[i]=v; return a; })}
              />
            ))}

            {/* Ministères + Ministres résumé avec toggles */}
            <div style={{ ...CARD_STYLE }}>
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'0.35rem' }}>
                <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.38rem' }}
                  onClick={() => { setActiveMins(null); setActiveMinsters(null); }}>Tout activer</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(155px,1fr))', gap:'0.32rem' }}>
                {plAgents.ministries.map(m => {
                  const on = activeMins === null || activeMins.includes(m.id);
                  return (
                    <div key={m.id} style={{ padding:'0.38rem 0.48rem',
                      background: on ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.005)',
                      borderRadius:'2px', border:`1px solid ${on ? m.color+'33' : 'rgba(255,255,255,0.04)'}`,
                      opacity: on ? 1 : 0.4 }}>
                      <div style={{ fontFamily:FONT.mono, fontSize:'0.42rem',
                        color: on ? m.color+'CC' : 'rgba(140,160,200,0.35)', marginBottom:'0.12rem' }}>
                        {m.emoji} {m.name}
                      </div>
                      <div style={{ fontSize:'0.37rem', color:'rgba(140,160,200,0.35)', lineHeight:1.35 }}>
                        {m.ministers.map(mk => {
                          const min = plAgents.ministers[mk];
                          return min ? `${min.emoji}` : '';
                        }).join(' ')||'—'}
                      </div>
                    </div>
                  );
                })}
              </div>
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
                        ...(on ? { borderColor:min.color+'88', color:min.color, background:min.color+'14' } : { opacity:0.40 }) }}
                      onClick={() => toggleMinster(key)}>
                      {min.emoji} {min.name} {on ? '' : '○'}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ fontSize:'0.40rem', color:'rgba(140,160,200,0.28)',
              fontFamily:FONT.mono, textAlign:'center' }}>
              Onglets pour modifier · GÉNÉRER pour lancer tel quel
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
                        ...(on ? { borderColor:'rgba(200,164,74,0.50)', color:GOLD,
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
          {plTab === 'ministries' && (<>
            {plAgents.ministries.map((ministry, mi) => {
              const allMinKeys = Object.keys(plAgents.ministers);
              const on = activeMins === null || activeMins.includes(ministry.id);
              return (
                <div key={ministry.id} style={{ ...CARD_STYLE, opacity: on ? 1 : 0.5 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.45rem' }}>
                    <span style={{ fontSize:'0.9rem' }}>{ministry.emoji}</span>
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.45rem',
                      letterSpacing:'0.09em', color:ministry.color+'CC', flex:1 }}>
                      {ministry.name.toUpperCase()}
                    </div>
                    {/* Toggle actif */}
                    <button style={{ ...BTN_SECONDARY, fontSize:'0.40rem', padding:'0.16rem 0.45rem',
                      ...(on ? { borderColor:ministry.color+'66', color:ministry.color,
                        background:ministry.color+'10' } : {}) }}
                      onClick={() => {
                        const all = plAgents.ministries.map(x=>x.id);
                        const cur = activeMins || all;
                        const next = on ? cur.filter(id=>id!==ministry.id) : [...cur, ministry.id];
                        setActiveMins(next.length === all.length ? null : next);
                      }}>
                      {on ? '● actif' : '○ inactif'}
                    </button>
                    {/* Supprimer si custom */}
                    {!['justice','economie','defense','sante','education','ecologie','chance'].includes(ministry.id) && (
                      <button style={{ background:'none', border:'none', cursor:'pointer',
                        color:'rgba(200,80,80,0.40)', fontSize:'0.75rem' }}
                        onClick={() => setPlAgents(a => ({...a,
                          ministries: a.ministries.filter((_,i)=>i!==mi)
                        }))}>✕</button>
                    )}
                  </div>
                  <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem',
                    color:'rgba(90,110,150,0.38)', marginBottom:'0.14rem' }}>MISSION</div>
                  <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'34px',
                    resize:'vertical', fontSize:'0.40rem', fontFamily:FONT.mono,
                    lineHeight:1.5, marginBottom:'0.40rem' }}
                    value={ministry.mission}
                    onChange={e => setPlAgents(a => ({...a,
                      ministries:a.ministries.map((m,i)=>i===mi?{...m,mission:e.target.value}:m)
                    }))}
                  />
                  <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem',
                    color:'rgba(90,110,150,0.38)', marginBottom:'0.20rem' }}>MINISTRES</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.24rem', marginBottom:'0.40rem' }}>
                    {allMinKeys.map(mkey => {
                      const min = plAgents.ministers[mkey];
                      const isIn = ministry.ministers.includes(mkey);
                      return (
                        <button key={mkey}
                          style={{ ...BTN_SECONDARY, padding:'0.17rem 0.44rem', fontSize:'0.39rem',
                            ...(isIn?{borderColor:min.color+'88',color:min.color,
                              background:min.color+'16'}:{}) }}
                          onClick={() => setPlAgents(a => ({...a,
                            ministries:a.ministries.map((m,i)=>i!==mi?m:{
                              ...m, ministers:isIn
                                ?m.ministers.filter(k=>k!==mkey)
                                :[...m.ministers,mkey]
                            })
                          }))}>
                          {min.emoji} {min.name}
                        </button>
                      );
                    })}
                  </div>
                  {ministry.ministers.length > 0 && (<>
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem',
                      color:'rgba(90,110,150,0.38)', marginBottom:'0.20rem' }}>PROMPTS MINISTÉRIELS</div>
                    {ministry.ministers.map(mkey => {
                      const min = plAgents.ministers[mkey];
                      return (
                        <div key={mkey} style={{ marginBottom:'0.30rem' }}>
                          <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem',
                            color:min.color+'AA', marginBottom:'0.10rem' }}>
                            {min.emoji} {min.name}
                          </div>
                          <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'30px',
                            resize:'vertical', fontSize:'0.39rem', fontFamily:FONT.mono, lineHeight:1.48 }}
                            value={ministry.ministerPrompts?.[mkey]||''}
                            onChange={e => setPlAgents(a => ({...a,
                              ministries:a.ministries.map((m,i)=>i!==mi?m:{
                                ...m, ministerPrompts:{...(m.ministerPrompts||{}),[mkey]:e.target.value}
                              })
                            }))}
                          />
                        </div>
                      );
                    })}
                  </>)}
                </div>
              );
            })}

            {/* Formulaire nouveau ministère */}
            {newMinistryForm ? (
              <div style={{ ...CARD_STYLE, border:'1px solid rgba(100,160,255,0.25)' }}>
                <div style={{ ...labelStyle('0.42rem'), color:'rgba(100,160,255,0.70)',
                  marginBottom:'0.5rem' }}>+ NOUVEAU MINISTÈRE</div>
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr', gap:'0.5rem', marginBottom:'0.4rem' }}>
                  <input style={{ ...INPUT_STYLE, width:'2.5rem', textAlign:'center', fontSize:'1rem' }}
                    value={newMinistryData.emoji}
                    onChange={e => setNewMinistryData(d=>({...d,emoji:e.target.value}))}
                    placeholder="🏛" />
                  <input style={{ ...INPUT_STYLE, fontSize:'0.50rem' }}
                    value={newMinistryData.name}
                    onChange={e => setNewMinistryData(d=>({...d,name:e.target.value}))}
                    placeholder="Nom du ministère" />
                  <input style={{ ...INPUT_STYLE, fontSize:'0.50rem' }}
                    value={newMinistryData.id}
                    onChange={e => setNewMinistryData(d=>({...d,id:e.target.value}))}
                    placeholder="id_unique" />
                </div>
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.4rem' }}>
                  <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(140,160,200,0.45)' }}>Couleur</span>
                  <input type="color" value={newMinistryData.color}
                    style={{ width:'2rem', height:'1.4rem', border:'none', background:'none', cursor:'pointer' }}
                    onChange={e => setNewMinistryData(d=>({...d,color:e.target.value}))} />
                </div>
                <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'40px', resize:'vertical',
                  fontSize:'0.42rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.4rem' }}
                  value={newMinistryData.mission}
                  onChange={e => setNewMinistryData(d=>({...d,mission:e.target.value}))}
                  placeholder="Mission du ministère…" />
                <div style={{ display:'flex', gap:'0.4rem', justifyContent:'flex-end' }}>
                  <button style={BTN_SECONDARY} onClick={() => setNewMinistryForm(false)}>Annuler</button>
                  <button style={{ ...BTN_PRIMARY, opacity: newMinistryData.name&&newMinistryData.id ? 1 : 0.35 }}
                    disabled={!newMinistryData.name||!newMinistryData.id}
                    onClick={addMinistry}>Ajouter →</button>
                </div>
              </div>
            ) : (
              <button style={{ ...BTN_SECONDARY, alignSelf:'center', fontSize:'0.46rem',
                color:'rgba(100,160,255,0.60)', borderColor:'rgba(100,160,255,0.25)' }}
                onClick={() => setNewMinistryForm(true)}>
                + Nouveau ministère
              </button>
            )}
          </>)}

          {/* ── MINISTRES ───────────────────────────────────────────── */}
          {plTab === 'ministers' && (<>
            <div style={{ ...CARD_STYLE }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.45rem' }}>
                <div style={labelStyle('0.42rem')}>{Object.keys(plAgents.ministers).length} MINISTRES</div>
                <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.14rem 0.38rem' }}
                  onClick={() => setActiveMinsters(null)}>Tous actifs</button>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.28rem' }}>
                {Object.entries(plAgents.ministers).map(([key, min]) => {
                  const on = activeMinsters === null || activeMinsters.includes(key);
                  return (
                    <div key={key} style={{ display:'flex', alignItems:'center', gap:'0.28rem',
                      padding:'0.26rem 0.50rem', borderRadius:'2px', cursor:'pointer',
                      background: on ? min.color+'12' : 'rgba(255,255,255,0.02)',
                      border: on ? `1px solid ${min.color}55` : '1px solid rgba(255,255,255,0.05)',
                      opacity: on ? 1 : 0.45 }}
                      onClick={() => toggleMinster(key)}>
                      <span style={{ fontSize:'0.85rem' }}>{min.emoji}</span>
                      <span style={{ fontFamily:FONT.mono, fontSize:'0.42rem',
                        color: on ? min.color+'CC' : 'rgba(140,160,200,0.40)' }}>
                        {min.name}
                      </span>
                      {min.sign === 'Custom' && (
                        <button style={{ background:'none', border:'none', cursor:'pointer',
                          color:'rgba(200,80,80,0.40)', fontSize:'0.62rem', marginLeft:'0.1rem',
                          lineHeight:1, padding:0 }}
                          onClick={e => { e.stopPropagation(); setPlAgents(a => {
                            const mins = {...a.ministers}; delete mins[key];
                            return { ...a, ministers: mins };
                          }); }}>✕</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Détail + édition des ministres */}
            {Object.entries(plAgents.ministers).map(([key, min]) => (
              <div key={key} style={{ ...CARD_STYLE }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem' }}>
                  <input style={{ ...INPUT_STYLE, width:'2.2rem', textAlign:'center', fontSize:'1rem' }}
                    value={min.emoji}
                    onChange={e => setPlAgents(a => ({...a,
                      ministers:{...a.ministers,[key]:{...a.ministers[key],emoji:e.target.value}}}))}
                  />
                  <input style={{ ...INPUT_STYLE, flex:1, fontSize:'0.48rem' }}
                    value={min.name}
                    onChange={e => setPlAgents(a => ({...a,
                      ministers:{...a.ministers,[key]:{...a.ministers[key],name:e.target.value}}}))}
                  />
                  <input type="color" value={min.color}
                    style={{ width:'1.8rem', height:'1.6rem', border:'none', background:'none', cursor:'pointer' }}
                    onChange={e => setPlAgents(a => ({...a,
                      ministers:{...a.ministers,[key]:{...a.ministers[key],color:e.target.value}}}))}
                  />
                </div>
                <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem',
                  color:'rgba(90,110,150,0.38)', marginBottom:'0.14rem' }}>ESSENCE</div>
                <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'36px', resize:'vertical',
                  fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.28rem' }}
                  value={min.essence||''}
                  onChange={e => setPlAgents(a => ({...a,
                    ministers:{...a.ministers,[key]:{...a.ministers[key],essence:e.target.value}}}))}
                />
                <div style={{ fontFamily:FONT.mono, fontSize:'0.37rem',
                  color:'rgba(90,110,150,0.38)', marginBottom:'0.14rem' }}>STYLE DE COMMUNICATION</div>
                <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'28px', resize:'vertical',
                  fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.5 }}
                  value={min.comm||''}
                  onChange={e => setPlAgents(a => ({...a,
                    ministers:{...a.ministers,[key]:{...a.ministers[key],comm:e.target.value}}}))}
                />
              </div>
            ))}

            {/* Nouveau ministre */}
            {newMinForm ? (
              <div style={{ ...CARD_STYLE, border:'1px solid rgba(100,200,120,0.25)' }}>
                <div style={{ ...labelStyle('0.42rem'), color:'rgba(100,200,120,0.70)',
                  marginBottom:'0.5rem' }}>+ NOUVEAU MINISTRE</div>
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr auto', gap:'0.45rem',
                  marginBottom:'0.4rem', alignItems:'center' }}>
                  <input style={{ ...INPUT_STYLE, width:'2.2rem', textAlign:'center', fontSize:'1rem' }}
                    value={newMinData.emoji}
                    onChange={e => setNewMinData(d=>({...d,emoji:e.target.value}))}
                    placeholder="🌟" />
                  <input style={{ ...INPUT_STYLE, fontSize:'0.48rem' }}
                    value={newMinData.name}
                    onChange={e => setNewMinData(d=>({...d,name:e.target.value}))}
                    placeholder="Nom du ministre" />
                  <input style={{ ...INPUT_STYLE, fontSize:'0.48rem' }}
                    value={newMinData.id}
                    onChange={e => setNewMinData(d=>({...d,id:e.target.value}))}
                    placeholder="id_unique" />
                  <input type="color" value={newMinData.color}
                    style={{ width:'2rem', height:'1.8rem', border:'none', background:'none', cursor:'pointer' }}
                    onChange={e => setNewMinData(d=>({...d,color:e.target.value}))} />
                </div>
                <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'36px', resize:'vertical',
                  fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.35rem' }}
                  value={newMinData.essence}
                  onChange={e => setNewMinData(d=>({...d,essence:e.target.value}))}
                  placeholder="Essence — rôle et vision du ministre…" />
                <textarea style={{ ...INPUT_STYLE, width:'100%', minHeight:'28px', resize:'vertical',
                  fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.4rem' }}
                  value={newMinData.comm}
                  onChange={e => setNewMinData(d=>({...d,comm:e.target.value}))}
                  placeholder="Style de communication…" />
                <div style={{ display:'flex', gap:'0.4rem', justifyContent:'flex-end' }}>
                  <button style={BTN_SECONDARY} onClick={() => setNewMinForm(false)}>Annuler</button>
                  <button style={{ ...BTN_PRIMARY, opacity: newMinData.name&&newMinData.id ? 1 : 0.35 }}
                    disabled={!newMinData.name||!newMinData.id}
                    onClick={addMinister}>Ajouter →</button>
                </div>
              </div>
            ) : (
              <button style={{ ...BTN_SECONDARY, alignSelf:'center', fontSize:'0.46rem',
                color:'rgba(100,200,120,0.60)', borderColor:'rgba(100,200,120,0.25)' }}
                onClick={() => setNewMinForm(true)}>
                + Nouveau ministre
              </button>
            )}
          </>)}
        </div>
      )}

      {!plLoading && !plAgents && (
        <div style={{ fontFamily:FONT.mono, fontSize:'0.46rem',
          color:'rgba(200,80,80,0.55)', textAlign:'center', padding:'1rem' }}>
          ⚠ Impossible de charger les agents. Lancement avec les défauts du moteur.
        </div>
      )}

      <div style={{ display:'flex', gap:'0.6rem', width:'100%', justifyContent:'space-between' }}>
        <button style={BTN_SECONDARY} onClick={onBack}>← RETOUR</button>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button style={{ ...BTN_SECONDARY, fontSize:'0.44rem',
            color:'rgba(200,80,80,0.50)', borderColor:'rgba(200,80,80,0.20)' }}
            onClick={resetAgents}>↺ Défaut</button>
          <button style={BTN_PRIMARY} onClick={saveAndLaunch}>
            GÉNÉRER LE MONDE →
          </button>
        </div>
      </div>
    </div>
  );
}


// ── ContextPanel — accordéon contexte délibérations (réutilisé dans Init) ────
function ContextPanel({ countryName, open, onToggle, mode, setMode, override, setOverride }) {
  const GOLD = 'rgba(200,164,74,0.88)';
  const DIM  = 'rgba(140,160,200,0.46)';
  return (
    <div style={{ width:'100%', borderRadius:'2px',
      border:`1px solid ${open ? 'rgba(200,164,74,0.22)' : 'rgba(255,255,255,0.07)'}`,
      background: open ? 'rgba(200,164,74,0.03)' : 'transparent',
      transition:'all 0.2s' }}>
      {/* Header toggle */}
      <button style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.5rem',
        padding:'0.42rem 0.65rem', background:'none', border:'none', cursor:'pointer',
        textAlign:'left' }}
        onClick={onToggle}>
        <span style={{ fontSize:'0.75rem' }}>{open ? '▾' : '▸'}</span>
        <span style={{ fontFamily:FONT.mono, fontSize:'0.44rem', letterSpacing:'0.12em',
          color: open ? GOLD : 'rgba(140,160,200,0.55)' }}>
          CONTEXTE DÉLIBÉRATIONS
        </span>
        {(mode || override) && (
          <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem', marginLeft:'auto',
            color:'rgba(200,164,74,0.55)',
            background:'rgba(200,164,74,0.08)', border:'1px solid rgba(200,164,74,0.20)',
            borderRadius:'2px', padding:'0.10rem 0.35rem' }}>
            {override ? '✎ custom' : mode || 'auto'}
          </span>
        )}
      </button>

      {open && (
        <div style={{ padding:'0 0.65rem 0.6rem', display:'flex', flexDirection:'column', gap:'0.55rem' }}>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:DIM, lineHeight:1.5 }}>
            Contrôle ce qui est injecté dans chaque prompt de délibération pour {countryName || 'ce pays'}.
          </div>

          {/* Mode radio */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.26rem' }}>
            {[
              ['',           '⚙️ Hérite du global',     'Suit le réglage de Settings'],
              ['auto',       '🤖 Auto',                  'Stats + description si disponible'],
              ['rich',       '📖 Enrichi',               "Contexte complet — l'IA raisonne sur l'historique du régime"],
              ['stats_only', '📊 Stats seules',          'Chiffres uniquement — neutre'],
              ['off',        '🚫 Désactivé',             'Aucun contexte — délibération aveugle'],
            ].map(([val, lbl, hint]) => {
              const on = mode === val;
              return (
                <label key={val} style={{ display:'flex', alignItems:'flex-start', gap:'0.4rem',
                  cursor:'pointer', padding:'0.25rem 0.4rem', borderRadius:'2px',
                  background: on ? 'rgba(200,164,74,0.07)' : 'transparent',
                  border:`1px solid ${on ? 'rgba(200,164,74,0.25)' : 'transparent'}` }}>
                  <input type="radio" name="ctx_mode_init" value={val} checked={on}
                    onChange={() => setMode(val)}
                    style={{ marginTop:'0.06rem', accentColor:'#C8A44A' }} />
                  <div>
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.46rem',
                      color: on ? GOLD : 'rgba(200,215,240,0.78)' }}>{lbl}</div>
                    <div style={{ fontSize:'0.40rem', color:DIM, marginTop:'0.05rem', lineHeight:1.35 }}>{hint}</div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Textarea override */}
          <div>
            <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:DIM,
              marginBottom:'0.22rem' }}>
              CONTEXTE PERSONNALISÉ — remplace tout si renseigné
            </div>
            <textarea
              style={{ ...INPUT_STYLE, width:'100%', minHeight:'64px', resize:'vertical',
                fontSize:'0.40rem', fontFamily:FONT.mono, lineHeight:1.55,
                borderColor: override ? 'rgba(200,164,74,0.30)' : undefined }}
              value={override}
              onChange={e => setOverride(e.target.value)}
              placeholder={`Ex : ${countryName||'Ce pays'} est une ancienne colonie reconvertie en technocratie insulaire. Son conseil délibère selon la doctrine des Grands Algorithmes de 1978…`}
            />
            {override && (
              <button style={{ ...BTN_SECONDARY, fontSize:'0.38rem', padding:'0.12rem 0.38rem',
                marginTop:'0.2rem', color:'rgba(200,80,80,0.50)',
                borderColor:'rgba(200,80,80,0.20)', alignSelf:'flex-end' }}
                onClick={() => setOverride('')}>✕ Effacer</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AriaConfigScreen — standalone component (fixes conditional hooks crash) ──
function AriaConfigScreen({ worldName, onBack, onGoConfig }) {
  // ── Registry LLM dynamique ────────────────────────────────────────────
  // URL de ton Gist — mets à jour le JSON quand de nouveaux modèles sortent
  // Format: { claude:[{id,label},...], gemini:[...], grok:[...], openai:[...] }
  const REGISTRY_URL = 'https://gist.githubusercontent.com/flodus/REPLACE_WITH_YOUR_GIST_ID/raw/llm-registry.json';

  const FALLBACK_MODELS = {
    claude: [
      { id:'claude-opus-4-6',         label:'Opus 4.6' },
      { id:'claude-sonnet-4-6',        label:'Sonnet 4.6 ★' },
      { id:'claude-haiku-4-5-20251001',label:'Haiku 4.5' },
    ],
    gemini: [
      { id:'gemini-2.0-flash',  label:'2.0 Flash ★' },
      { id:'gemini-1.5-pro',    label:'1.5 Pro' },
      { id:'gemini-1.5-flash',  label:'1.5 Flash' },
    ],
    grok: [
      { id:'grok-3',      label:'Grok 3' },
      { id:'grok-3-mini', label:'Grok 3 Mini ★' },
    ],
    openai: [
      { id:'gpt-4.1',      label:'GPT-4.1' },
      { id:'gpt-4.1-mini', label:'GPT-4.1 Mini ★' },
    ],
  };

  const availProviders = ['claude','gemini','grok','openai'].filter(id => {
    try { return !!JSON.parse(localStorage.getItem('aria_api_keys')||'{}')[id]; } catch { return false; }
  });
  const PROV_LABELS = { claude:'Claude', gemini:'Gemini', grok:'Grok', openai:'OpenAI' };

  const loadOpts = () => { try { return JSON.parse(localStorage.getItem('aria_options')||'{}'); } catch { return {}; } };
  const saved0 = loadOpts();

  const [tab,       setTab]       = useState('ia');   // 'ia' | 'constitution'
  const [ariaMode,  setAriaMode]  = useState(saved0.ia_mode || 'aria');
  const [soloModel, setSoloModel] = useState(saved0.solo_model || availProviders[0] || 'claude');
  const [modelReg,  setModelReg]  = useState(FALLBACK_MODELS);
  const [regStatus, setRegStatus] = useState('idle'); // idle|loading|ok|error

  // provider → { minister, synthesis } pour mode ARIA/CUSTOM
  const initRoles = () => {
    const r = saved0.ia_roles || {};
    const p0 = availProviders[0] || 'claude';
    const p1 = availProviders[1] || p0;
    return {
      ministre_provider:  r.ministre_provider  || p0,
      ministre_model:     r.ministre_model     || FALLBACK_MODELS[p0]?.find(m=>m.label.includes('★'))?.id || FALLBACK_MODELS[p0]?.[0]?.id || '',
      synthese_min_prov:  r.synthese_min_prov  || p1,
      synthese_min_model: r.synthese_min_model || FALLBACK_MODELS[p1]?.find(m=>m.label.includes('★'))?.id || FALLBACK_MODELS[p1]?.[0]?.id || '',
      phare_provider:     r.phare_provider     || p0,
      phare_model:        r.phare_model        || FALLBACK_MODELS[p0]?.find(m=>m.label.includes('★'))?.id || FALLBACK_MODELS[p0]?.[0]?.id || '',
      boussole_provider:  r.boussole_provider  || p1,
      boussole_model:     r.boussole_model     || FALLBACK_MODELS[p1]?.find(m=>m.label.includes('★'))?.id || FALLBACK_MODELS[p1]?.[0]?.id || '',
      synthese_pres_prov: r.synthese_pres_prov || p0,
      synthese_pres_model:r.synthese_pres_model|| FALLBACK_MODELS[p0]?.find(m=>m.label.includes('★'))?.id || FALLBACK_MODELS[p0]?.[0]?.id || '',
    };
  };
  const [roles, setRoles] = useState(initRoles);

  // ── Constitution editor state ─────────────────────────────────────────
  const [agents, setAgents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aria_agents_override')||'null') || null; } catch { return null; }
  });
  // agents === null = use defaults from base_agents.json
  // We load defaults lazily when user opens the constitution tab
  const agentsRef = useRef(null);

  const loadDefaultAgents = async () => {
    if (agentsRef.current) return agentsRef.current;
    try {
      const mod = await import('../templates/base_agents.json');
      agentsRef.current = JSON.parse(JSON.stringify(mod.default));
      return agentsRef.current;
    } catch { return null; }
  };

  const [constData, setConstData] = useState(null); // loaded when tab='constitution'
  const [constLoading, setConstLoading] = useState(false);

  // Fetch registry on mount
  useEffect(() => {
    setRegStatus('loading');
    fetch(REGISTRY_URL)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setModelReg({...FALLBACK_MODELS, ...data}); setRegStatus('ok'); })
      .catch(() => setRegStatus('error'));
  }, []);

  // Load agents when switching to constitution tab
  useEffect(() => {
    if (tab !== 'constitution' || constData) return;
    setConstLoading(true);
    loadDefaultAgents().then(def => {
      const override = agents;
      // Use JSON defaults if available, otherwise fall back to saved override
      const base = def || override;
      if (base) {
        const merged = JSON.parse(JSON.stringify(base));
        if (def && override?.ministries) merged.ministries = override.ministries;
        if (def && override?.ministers)  merged.ministers  = override.ministers;
        if (def && override?.presidency) merged.presidency = override.presidency;
        setConstData(merged);
      } else {
        // Minimal skeleton so UI doesn't stay blank
        setConstData({ ministries:[], ministers:{}, presidency:{ phare:{name:'Phare',symbol:'☉',subtitle:'',essence:'',role_long:''}, boussole:{name:'Boussole',symbol:'☽',subtitle:'',essence:'',role_long:''} } });
      }
      setConstLoading(false);
    }).catch(() => {
      // If import throws entirely, use override or skeleton
      const fallback = agents || { ministries:[], ministers:{}, presidency:{ phare:{name:'Phare',symbol:'☉',subtitle:'',essence:'',role_long:''}, boussole:{name:'Boussole',symbol:'☽',subtitle:'',essence:'',role_long:''} } };
      setConstData(JSON.parse(JSON.stringify(fallback)));
      setConstLoading(false);
    });
  }, [tab]);

  // ── Helpers UI ────────────────────────────────────────────────────────
  const RoleRow = ({ provKey, modelKey, label }) => {
    const prov = roles[provKey] || availProviders[0];
    const models = modelReg[prov] || FALLBACK_MODELS[prov] || [];
    return (
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:'0.4rem',
        alignItems:'center', marginBottom:'0.35rem' }}>
        <span style={{ fontFamily:FONT.mono, fontSize:'0.44rem',
          color:'rgba(140,160,200,0.60)', letterSpacing:'0.05em' }}>{label}</span>
        {/* Provider select */}
        <select style={{ ...SELECT_STYLE, fontSize:'0.43rem', padding:'0.22rem 0.45rem', minWidth:'78px' }}
          value={prov}
          onChange={e => {
            const newProv = e.target.value;
            const defaultModel = (modelReg[newProv]||FALLBACK_MODELS[newProv]||[]).find(m=>m.label.includes('★'))?.id
                              || (modelReg[newProv]||FALLBACK_MODELS[newProv]||[])[0]?.id || '';
            setRoles(r => ({ ...r, [provKey]: newProv, [modelKey]: defaultModel }));
          }}>
          {availProviders.map(pid => <option key={pid} value={pid}>{PROV_LABELS[pid]}</option>)}
        </select>
        {/* Model select */}
        <select style={{ ...SELECT_STYLE, fontSize:'0.43rem', padding:'0.22rem 0.45rem', minWidth:'110px' }}
          value={roles[modelKey] || ''}
          onChange={e => setRoles(r => ({ ...r, [modelKey]: e.target.value }))}>
          {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>
    );
  };

  const SoloRoleRow = ({ label, provKey, modelKey }) => {
    // In Solo mode — provider is fixed, only model varies
    const prov = soloModel;
    const models = modelReg[prov] || FALLBACK_MODELS[prov] || [];
    return (
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'0.4rem',
        alignItems:'center', marginBottom:'0.35rem' }}>
        <span style={{ fontFamily:FONT.mono, fontSize:'0.44rem',
          color:'rgba(140,160,200,0.60)', letterSpacing:'0.05em' }}>{label}</span>
        <select style={{ ...SELECT_STYLE, fontSize:'0.43rem', padding:'0.22rem 0.45rem', minWidth:'120px' }}
          value={roles[modelKey] || ''}
          onChange={e => setRoles(r => ({ ...r, [modelKey]: e.target.value }))}>
          {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>
    );
  };

  const saveAndContinue = () => {
    try {
      const saved = loadOpts();
      const next = { ...saved, ia_mode: ariaMode, solo_model: soloModel, ia_roles: roles };
      localStorage.setItem('aria_options', JSON.stringify(next));
      if (constData) {
        // Save constitution override only if user edited it
        localStorage.setItem('aria_agents_override', JSON.stringify({
          ministries: constData.ministries,
          ministers:  constData.ministers,
          presidency: constData.presidency,
        }));
      }
    } catch {}
    onGoConfig();
  };

  const resetConst = () => {
    localStorage.removeItem('aria_agents_override');
    setConstData(null);
    setAgents(null);
    // reload defaults
    setConstLoading(true);
    loadDefaultAgents().then(def => { if (def) setConstData(JSON.parse(JSON.stringify(def))); setConstLoading(false); });
  };

  const MODE_CARDS = [
    { id:'aria',   icon:'⚡', title:'ARIA',        desc:'Multi-providers. Choisissez qui pense et qui synthétise.' },
    { id:'solo',   icon:'◎',  title:'SOLO',         desc:'Un provider unique. Simple et cohérent.' },
    { id:'custom', icon:'🔧', title:'PERSONNALISÉ', desc:'Chaque rôle assigné individuellement.' },
  ];

  // TAB STYLES
  const tabStyle = (active) => ({
    fontFamily:FONT.mono, fontSize:'0.48rem', letterSpacing:'0.12em',
    padding:'0.4rem 1rem', cursor:'pointer',
    background: active ? 'rgba(200,164,74,0.10)' : 'transparent',
    border:'none', borderBottom: active ? '2px solid rgba(200,164,74,0.70)' : '2px solid transparent',
    color: active ? 'rgba(200,164,74,0.90)' : 'rgba(140,160,200,0.40)',
  });

  return (
    <div style={S.wrap(false)}>
      <ARIAHeader showQuote={false} />
      <div style={{ ...labelStyle(), alignSelf:'flex-start' }}>CONFIGURATION — {worldName}</div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(200,164,74,0.12)', width:'100%' }}>
        <button style={tabStyle(tab==='ia')} onClick={() => setTab('ia')}>⚡ ARCHITECTURE IA</button>
        <button style={tabStyle(tab==='constitution')} onClick={() => setTab('constitution')}>📜 CONSTITUTION</button>
        {regStatus === 'ok'    && <span style={{ marginLeft:'auto', alignSelf:'center', fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(100,200,120,0.50)', paddingRight:'0.3rem' }}>registry ✓</span>}
        {regStatus === 'error' && <span style={{ marginLeft:'auto', alignSelf:'center', fontFamily:FONT.mono, fontSize:'0.38rem', color:'rgba(200,100,60,0.45)', paddingRight:'0.3rem' }}>registry local</span>}
      </div>

      {/* ── TAB : IA ─────────────────────────────────────────────────── */}
      {tab === 'ia' && (
        <>
          {/* Mode cards */}
          <div style={{ display:'flex', gap:'0.6rem', width:'100%' }}>
            {MODE_CARDS.map(m => (
              <div key={m.id} style={{ ...S.mCard, flex:1,
                borderColor: ariaMode===m.id ? 'rgba(200,164,74,0.45)' : undefined,
                background:  ariaMode===m.id ? 'rgba(200,164,74,0.06)' : undefined,
              }} onClick={() => setAriaMode(m.id)}>
                <div style={{ fontSize:'1.1rem' }}>{m.icon}</div>
                <div style={{ fontFamily:FONT.cinzel, fontSize:'0.50rem', letterSpacing:'0.13em',
                  color: ariaMode===m.id ? 'rgba(200,164,74,0.92)' : 'rgba(200,164,74,0.55)' }}>{m.title}</div>
                <div style={{ fontSize:'0.43rem', color:'rgba(140,160,200,0.50)', lineHeight:1.5 }}>{m.desc}</div>
              </div>
            ))}
          </div>

          {/* ARIA / CUSTOM — provider + model per role */}
          {(ariaMode === 'aria' || ariaMode === 'custom') && (
            <div style={{ ...CARD_STYLE, width:'100%' }}>
              {/* Header row */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:'0.4rem',
                marginBottom:'0.5rem', paddingBottom:'0.35rem',
                borderBottom:'1px solid rgba(200,164,74,0.08)' }}>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(90,110,150,0.40)' }}>RÔLE</span>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(90,110,150,0.40)', width:'78px', textAlign:'center' }}>PROVIDER</span>
                <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(90,110,150,0.40)', width:'110px', textAlign:'center' }}>MODÈLE</span>
              </div>
              <div style={{ ...labelStyle('0.40rem'), marginBottom:'0.4rem', color:'rgba(140,160,200,0.35)' }}>— DÉLIBÉRATION MINISTÉRIELLE —</div>
              <RoleRow provKey="ministre_provider"  modelKey="ministre_model"      label="Ministres pensent" />
              <RoleRow provKey="synthese_min_prov"  modelKey="synthese_min_model"  label="Synthèse ministérielle" />
              <div style={{ borderTop:'1px solid rgba(200,164,74,0.07)', margin:'0.4rem 0' }} />
              <div style={{ ...labelStyle('0.40rem'), marginBottom:'0.4rem', color:'rgba(140,160,200,0.35)' }}>— PRÉSIDENCE —</div>
              <RoleRow provKey="phare_provider"     modelKey="phare_model"         label="Le Phare (vision)" />
              <RoleRow provKey="boussole_provider"  modelKey="boussole_model"      label="La Boussole (mémoire)" />
              <RoleRow provKey="synthese_pres_prov" modelKey="synthese_pres_model" label="Synthèse présidentielle" />
            </div>
          )}

          {/* SOLO — provider pills + model per role */}
          {ariaMode === 'solo' && (
            <div style={{ ...CARD_STYLE, width:'100%' }}>
              <div style={{ ...labelStyle('0.44rem'), marginBottom:'0.5rem' }}>PROVIDER UNIQUE</div>
              <div style={{ display:'flex', gap:'0.45rem', flexWrap:'wrap', marginBottom:'0.7rem' }}>
                {availProviders.map(pid => (
                  <button key={pid}
                    style={{ ...BTN_SECONDARY, padding:'0.30rem 0.8rem', fontSize:'0.46rem',
                      ...(soloModel===pid ? { borderColor:'rgba(200,164,74,0.45)', color:'rgba(200,164,74,0.88)', background:'rgba(200,164,74,0.08)' } : {}) }}
                    onClick={() => {
                      setSoloModel(pid);
                      // reset all models to default for new provider
                      const star = (modelReg[pid]||FALLBACK_MODELS[pid]||[]).find(m=>m.label.includes('★'))?.id || '';
                      setRoles(r => ({...r,
                        ministre_model: star, synthese_min_model: star,
                        phare_model: star, boussole_model: star, synthese_pres_model: star,
                      }));
                    }}>
                    {PROV_LABELS[pid]}
                  </button>
                ))}
              </div>
              <div style={{ borderTop:'1px solid rgba(200,164,74,0.08)', paddingTop:'0.5rem' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'0.4rem',
                  marginBottom:'0.3rem', paddingBottom:'0.3rem', borderBottom:'1px solid rgba(200,164,74,0.06)' }}>
                  <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(90,110,150,0.40)' }}>ÉTAPE</span>
                  <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(90,110,150,0.40)', width:'120px', textAlign:'center' }}>MODÈLE</span>
                </div>
                <SoloRoleRow label="Ministres" provKey="ministre_provider" modelKey="ministre_model" />
                <SoloRoleRow label="Synthèse ministérielle" provKey="synthese_min_prov" modelKey="synthese_min_model" />
                <SoloRoleRow label="Le Phare" provKey="phare_provider" modelKey="phare_model" />
                <SoloRoleRow label="La Boussole" provKey="boussole_provider" modelKey="boussole_model" />
                <SoloRoleRow label="Synthèse présidentielle" provKey="synthese_pres_prov" modelKey="synthese_pres_model" />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB : CONSTITUTION ───────────────────────────────────────── */}
      {tab === 'constitution' && (
        <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'0.7rem' }}>
          {constLoading && (
            <div style={{ fontFamily:FONT.mono, fontSize:'0.48rem', color:GOLD+'66',
              textAlign:'center', padding:'1.5rem' }}>Chargement des agents…</div>
          )}
          {constData && !constLoading && (
            <>
              {/* PRÉSIDENCE */}
              <div style={{ ...CARD_STYLE }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                  <div style={labelStyle('0.44rem')}>PRÉSIDENCE</div>
                </div>
                {['phare','boussole'].map(key => {
                  const p = constData.presidency[key];
                  return (
                    <div key={key} style={{ marginBottom:'0.6rem' }}>
                      <div style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(200,164,74,0.60)',
                        marginBottom:'0.25rem', letterSpacing:'0.08em' }}>
                        {p.symbol} {p.name.toUpperCase()} — {p.subtitle}
                      </div>
                      <textarea
                        style={{ ...INPUT_STYLE, width:'100%', minHeight:'52px', resize:'vertical',
                          fontSize:'0.43rem', lineHeight:1.55, fontFamily:FONT.mono }}
                        value={p.essence}
                        onChange={e => setConstData(d => ({
                          ...d, presidency: { ...d.presidency,
                            [key]: { ...d.presidency[key], essence: e.target.value }
                          }
                        }))}
                      />
                    </div>
                  );
                })}
              </div>

              {/* MINISTÈRES */}
              {constData.ministries.map((ministry, mi) => {
                const allMinisterKeys = Object.keys(constData.ministers);
                return (
                  <div key={ministry.id} style={{ ...CARD_STYLE }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
                      <span style={{ fontSize:'1rem' }}>{ministry.emoji}</span>
                      <div style={labelStyle('0.44rem')}>{ministry.name}</div>
                      <div style={{ marginLeft:'auto', fontFamily:FONT.mono, fontSize:'0.40rem',
                        color:'rgba(90,110,150,0.40)' }}>
                        {ministry.ministers.length} ministre{ministry.ministers.length>1?'s':''}
                      </div>
                    </div>

                    {/* Mission */}
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                      color:'rgba(140,160,200,0.40)', marginBottom:'0.25rem' }}>MISSION</div>
                    <textarea
                      style={{ ...INPUT_STYLE, width:'100%', minHeight:'40px', resize:'vertical',
                        fontSize:'0.43rem', lineHeight:1.5, fontFamily:FONT.mono, marginBottom:'0.5rem' }}
                      value={ministry.mission}
                      onChange={e => setConstData(d => ({
                        ...d, ministries: d.ministries.map((m,i) =>
                          i===mi ? {...m, mission: e.target.value} : m)
                      }))}
                    />

                    {/* Ministers in this ministry */}
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                      color:'rgba(140,160,200,0.40)', marginBottom:'0.3rem' }}>MINISTRES ASSIGNÉS</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', marginBottom:'0.5rem' }}>
                      {allMinisterKeys.map(mkey => {
                        const min = constData.ministers[mkey];
                        const isIn = ministry.ministers.includes(mkey);
                        return (
                          <button key={mkey}
                            style={{ ...BTN_SECONDARY, padding:'0.22rem 0.55rem', fontSize:'0.43rem',
                              ...(isIn ? {
                                borderColor: min.color+'88',
                                color: min.color,
                                background: min.color+'18',
                              } : {}) }}
                            onClick={() => setConstData(d => {
                              const mins = isIn
                                ? ministry.ministers.filter(k=>k!==mkey)
                                : [...ministry.ministers, mkey];
                              return { ...d, ministries: d.ministries.map((m,i) =>
                                i===mi ? {...m, ministers: mins} : m) };
                            })}>
                            {min.emoji} {min.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Per-minister prompts in this ministry */}
                    {ministry.ministers.map(mkey => {
                      const min = constData.ministers[mkey];
                      const prompt = ministry.ministerPrompts?.[mkey] || '';
                      return (
                        <div key={mkey} style={{ marginBottom:'0.4rem' }}>
                          <div style={{ fontFamily:FONT.mono, fontSize:'0.40rem',
                            color: min.color+'AA', marginBottom:'0.2rem' }}>
                            {min.emoji} {min.name.toUpperCase()} — PROMPT MINISTÉRIEL
                          </div>
                          <textarea
                            style={{ ...INPUT_STYLE, width:'100%', minHeight:'36px', resize:'vertical',
                              fontSize:'0.42rem', lineHeight:1.5, fontFamily:FONT.mono }}
                            value={prompt}
                            onChange={e => setConstData(d => ({
                              ...d, ministries: d.ministries.map((m,i) => i===mi
                                ? {...m, ministerPrompts: {...(m.ministerPrompts||{}), [mkey]: e.target.value}}
                                : m)
                            }))}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <button style={{ ...BTN_SECONDARY, alignSelf:'flex-end', fontSize:'0.44rem',
                color:'rgba(200,80,80,0.55)', borderColor:'rgba(200,80,80,0.25)' }}
                onClick={resetConst}>
                ↺ Rétablir la constitution par défaut
              </button>
            </>
          )}
        </div>
      )}

      <div style={{ display:'flex', gap:'0.6rem', width:'100%', justifyContent:'space-between', paddingTop:'0.4rem' }}>
        <button style={BTN_SECONDARY} onClick={() => onBack()}>← RETOUR</button>
        <button style={BTN_PRIMARY} onClick={saveAndContinue}>CONTINUER →</button>
      </div>
    </div>
  );
}

// ── Composant principal ─────────────────────────────────────────────────
export default function InitScreen({ worldName, setWorldName, onLaunchLocal, onLaunchAI, hasApiKeys, onRefreshKeys }) {
  const [step,       setStep]      = useState('name');
  const [mode,       setMode]      = useState(null);
  const [preset,     setPreset]    = useState(null);
  const [countries,  setCountries] = useState([DEFAULT_COUNTRY()]);
  const [progress,   setProgress]  = useState(0);
  const [msg,        setMsg]       = useState('INITIALISATION…');
  const [boardGame,  setBoardGame] = useState(false);
  const [showKeys,   setShowKeys]  = useState(false);

  // Sous-états navigation défaut
  const [defautType,        setDefautType]        = useState(null);  // 'fictif'|'reel'|'new'
  const [defautFictif,      setDefautFictif]      = useState(null);  // id PAYS_LOCAUX ou 'new'
  const [defautReel,        setDefautReel]        = useState('');    // id REAL_COUNTRIES_DATA ou terrain si isNew
  const [defautNom,         setDefautNom]         = useState('');    // nom libre
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
      const opts = JSON.parse(localStorage.getItem('aria_options')||'{}');
      opts.gameplay = { ...(opts.gameplay||{}), mode_board_game: boardGame };
      localStorage.setItem('aria_options', JSON.stringify(opts));
    } catch {}
    setStep('generating');
    const MSGS = [
      'GÉNÉRATION DE LA TOPOGRAPHIE…','PLACEMENT DES MASSES TERRESTRES…',
      'CALCUL DES RESSOURCES…','INITIALISATION DU CONSEIL…','DÉMARRAGE DE LA SIMULATION…',
    ];
    let t = 0;
    const timer = setInterval(() => {
      t++;
      setProgress(Math.round((t / 30) * 100));
      setMsg(MSGS[Math.floor(t / 6)] || MSGS[MSGS.length - 1]);
      if (t >= 30) {
        clearInterval(timer);
        if (usePreset === 'defaut_local') {
          onLaunchLocal(customDefs);
        } else if (usePreset === 'defaut_ai') {
          onLaunchAI(customDefs || [{ type:'reel', nom:'France' }]);
        } else if (mode === 'local') {
          onLaunchLocal(customDefs || countries);
        } else {
          const defs = (customDefs || countries).map(c => {
            // c.type est la source de vérité (bouton Fictif/Pays réel dans l'UI)
            // c.realData est présent uniquement si le pays est dans REAL_COUNTRIES_DATA
            const isReel = c.type === 'reel';
            return {
              type:     isReel ? 'reel' : 'imaginaire',
              nom:      c.nom || c.realData?.nom || 'Nation',
              regime:   c.regime   || c.realData?.regime,
              terrain:  c.terrain  || c.realData?.terrain,
              realData: c.realData || null,
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
    <div style={S.wrap(false)}>
      {showKeys && <APIKeyInline onClose={() => { setShowKeys(false); onRefreshKeys?.(); }} />}
      <ARIAHeader showQuote={true} />

      <div style={CARD_STYLE}>
        <div style={labelStyle()}>NOM DU MONDE</div>
        <input style={INPUT_STYLE} value={worldName}
          onChange={e => setWorldName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && worldName.trim() && setStep('mode')}
          placeholder="Ex : Pangée Altérée, Archipel de la Paix…" autoFocus />
      </div>

      <div style={{ display:'flex', gap:'0.8rem', width:'100%', justifyContent:'space-between', alignItems:'center' }}>
        {/* Bouton clé API — encadré pour signaler le clic */}
        <button
          style={{
            background:'rgba(200,164,74,0.06)', border:'1px solid rgba(200,164,74,0.30)',
            borderRadius:'2px', padding:'0.35rem 0.75rem', cursor:'pointer',
            fontFamily:FONT.mono, fontSize:'0.48rem', letterSpacing:'0.12em',
            color: hasApiKeys ? 'rgba(100,200,120,0.70)' : 'rgba(200,164,74,0.55)',
            boxShadow: '0 0 8px rgba(200,164,74,0.08)',
          }}
          onClick={() => setShowKeys(true)}
          title="Configurer les clés API">
          {hasApiKeys ? '🔑 CLÉS API ✓' : '🔑 CLÉS API'}
        </button>

        <div style={{ display:'flex', gap:'0.8rem', alignItems:'center' }}>
          {!hasApiKeys && (
            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', color:'rgba(200,100,74,0.55)' }}>
              ⚠ Pas de clé — mode hors ligne uniquement
            </span>
          )}
          <button style={{ ...BTN_PRIMARY, opacity: worldName.trim() ? 1 : 0.35 }}
            disabled={!worldName.trim()} onClick={() => setStep('mode')}>
            CONTINUER →
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
        <div style={{ ...labelStyle(), marginBottom:'0.9rem' }}>MODE DE JEU — {worldName}</div>
        <div style={{ display:'flex', gap:'0.8rem' }}>
          {[
            { id:'local', icon:'🗺', title:'HORS LIGNE', desc:'1 nation prédéfinie. Délibérations locales. Aucune clé API.' },
            { id:'ai',    icon:'⚡', title:'EN LIGNE — IA', desc:'Pays réel ou fictif au choix. Délibérations temps réel. Clé API requise.', disabled:!hasApiKeys },
          ].map(m => (
            <div key={m.id}
              style={{ ...S.mCard, opacity: m.disabled ? 0.35 : 1, cursor: m.disabled ? 'not-allowed' : 'pointer' }}
              onClick={() => { if (m.disabled) return; setMode(m.id); setStep(m.id === 'ai' ? 'aria_config' : 'config'); }}>
              <div style={{ fontSize:'1.4rem' }}>{m.icon}</div>
              <div style={{ fontFamily:FONT.cinzel, fontSize:'0.58rem', letterSpacing:'0.18em', color:'rgba(200,164,74,0.85)' }}>{m.title}</div>
              <div style={{ fontSize:'0.50rem', color:'rgba(140,160,200,0.55)', lineHeight:1.6 }}>{m.desc}</div>
              {m.disabled && <span style={{ ...S.tag, color:'rgba(200,80,80,0.55)', borderColor:'rgba(200,80,80,0.20)' }}>CLÉ MANQUANTE</span>}
            </div>
          ))}
        </div>

        {hasApiKeys && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:'0.7rem', padding:'0.7rem 0.9rem', marginTop:'0.8rem', background:'rgba(200,164,74,0.03)', border:'1px solid rgba(200,164,74,0.10)', borderRadius:'2px' }}>
            <input type="checkbox" id="bg-toggle" checked={boardGame}
              onChange={e => setBoardGame(e.target.checked)}
              style={{ marginTop:'0.15rem', accentColor:'#C8A44A', cursor:'pointer' }} />
            <label htmlFor="bg-toggle" style={{ cursor:'pointer' }}>
              <div style={{ fontFamily:FONT.mono, fontSize:'0.50rem', letterSpacing:'0.12em', color:'rgba(200,164,74,0.70)' }}>
                MODE BOARD GAME — RÉPONSES LOCALES
              </div>
              <div style={{ fontSize:'0.46rem', color:'rgba(140,160,200,0.45)', marginTop:'0.2rem', lineHeight:1.5 }}>
                Utilise les textes pré-écrits même avec une clé API active.
              </div>
            </label>
          </div>
        )}
      </div>

      <button style={BTN_SECONDARY} onClick={() => setStep('name')}>← RETOUR</button>
    </div>
  );


  // ── Étape : configuration ARIA (mode IA uniquement) ──────────────────────
  if (step === 'aria_config') {
    return (
      <AriaConfigScreen
        worldName={worldName}
        onBack={() => setStep('mode')}
        onGoConfig={() => setStep('config')}
      />
    );
  }

  // ── Étape : config ────────────────────────────────────────────────────
  // ── Étape : config — helpers ──────────────────────────────────────────
  const BK = (fn) => <button style={BTN_SECONDARY} onClick={fn}>← RETOUR</button>;
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
        {H('CONFIGURATION')}
        <div style={{ display:'flex', gap:'0.8rem', width:'100%' }}>
          <MC onClick={() => { setPreset('defaut'); resetDefaut(); }}>
            <div style={{ fontSize:'1.3rem' }}>⚡</div>
            <McTitle t="PAR DÉFAUT" />
            <McSub t={mode === 'local' ? 'Un pays local au choix — réel, fictif ou nouveau. Avec historique local' : 'Un pays au choix — réel, fictif ou nouveau. Augmenté par IA.'} />
          </MC>
          <MC onClick={() => setPreset('custom')}>
            <div style={{ fontSize:'1.3rem' }}>🛠</div>
            <McTitle t="PERSONNALISÉ" />
            <McSub t="1 à 6 nations. Terrain, régime, nom libres." />
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
              <McTitle t="NATION FICTIVE" />
              <McSub t="1 des 3 nations prédéfinies avec historique." />
            </MC>
            <MC onClick={() => setDefautType('reel')}>
              <div style={{ fontSize:'1.3rem' }}>🗺</div>
              <McTitle t="PAYS RÉEL" />
              <McSub t="Simuler un pays réel avec ses données 2025-2026." />
            </MC>
          </div>
          {BK(() => setPreset(null))}
        </div>
      );

      // B — Choisir parmi les 3 fictifs ou en créer un nouveau
      if (defautType === 'fictif') {
        const chosen = defautFictif && defautFictif !== 'new'
          ? PAYS_LOCAUX.find(p => p.id === defautFictif)
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
              {PAYS_LOCAUX.map(p => (
                <MC key={p.id}
                  style={{
                    borderColor: defautFictif===p.id ? `${p.couleur}70` : undefined,
                    background:  defautFictif===p.id ? `${p.couleur}14` : undefined,
                    cursor:'pointer',
                  }}
                  onClick={() => setDefautFictif(p.id)}>
                  <div style={{ fontSize:'1.2rem' }}>{p.emoji}</div>
                  <McTitle t={p.nom} />
                  <McSub t={`${p.terrain} · ${p.regime.replace(/_/g,' ')}`} />
                </MC>
              ))}

              {/* Carte + Créer */}
              <MC
                style={{
                  borderColor: isNew ? 'rgba(58,191,122,0.55)' : 'rgba(58,191,122,0.18)',
                  background:  isNew ? 'rgba(58,191,122,0.07)' : undefined,
                  cursor:'pointer', justifyContent:'center', alignItems:'center',
                }}
                onClick={() => setDefautFictif('new')}>
                <div style={{ fontSize:'1.4rem' }}>🌍</div>
                <McTitle t="+ CRÉER" />
                <McSub t="Nation fictive personnalisée" />
              </MC>
            </div>

            {/* Détail preset choisi */}
            {chosen && (
              <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                <div style={{ fontSize:'0.44rem', color:'rgba(140,160,200,0.65)', lineHeight:1.6 }}>{chosen.description}</div>
                <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center' }}>
                  {[`👤 ${chosen.leader}`, `👥 ${(chosen.population/1e6).toFixed(1)} M hab.`, `😊 Satisfaction ${chosen.satisfaction}%`].map(t => (
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
                  NOUVELLE NATION FICTIVE
                </div>
                <div>
                  <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>NOM</div>
                  <input
                    style={{ ...INPUT_STYLE, fontSize:'0.54rem', borderColor:'rgba(58,191,122,0.25)' }}
                    value={defautNom}
                    onChange={e => setDefautNom(e.target.value)}
                    placeholder="Ex : Arvalia, Morvaine, Zephoria…"
                    autoFocus
                  />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
                  <div>
                    <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>TERRAIN</div>
                    <select style={SELECT_STYLE} value={newFictifTerrain} onChange={e => setNewFictifTerrain(e.target.value)}>
                      {Object.entries(TERRAIN_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ ...labelStyle('0.43rem'), marginBottom:'0.3rem' }}>RÉGIME</div>
                    <select style={SELECT_STYLE} value={newFictifRegime} onChange={e => setNewFictifRegime(e.target.value)}>
                      {Object.entries(REGIME_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
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
                {/* Bouton CONFIRMER dans le formulaire — visible sans scroll */}
                <button
                  style={{ ...BTN_PRIMARY, opacity: defautNom.trim() ? 1 : 0.35,
                    alignSelf:'flex-end', marginTop:'0.3rem' }}
                  disabled={!defautNom.trim()}
                  onClick={() => preLaunch('defaut_local', [{
                    type:'imaginaire', nom:defautNom.trim(),
                    terrain:newFictifTerrain, regime:newFictifRegime, realData:null,
                  }])}>
                  CONFIRMER →
                </button>
              </div>
            )}

            <BtnRow>
              {BK(() => { setDefautType(null); setDefautFictif(null); setDefautNom(''); })}
              {!isNew && (
                <button
                  style={{ ...BTN_PRIMARY, opacity: canPlay ? 1 : 0.35 }}
                  disabled={!canPlay}
                  onClick={() => preLaunch('defaut_local', [{ type:'imaginaire', realData: chosen }])}>
                  JOUER →
                </button>
              )}
            </BtnRow>
          </div>
        );
      }

      // C — Choisir un pays réel hors ligne
      if (defautType === 'reel') {
        const chosen = REAL_COUNTRIES_DATA.find(r => r.id === defautReel);
        return (
          <div style={S.wrap(false)}>
            <ARIAHeader showQuote={false} />
            {H('PAYS RÉEL')}
            <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.7rem' }}>
              <select style={SELECT_STYLE} value={defautReel}
                onChange={e => setDefautReel(e.target.value)}>
                <option value="">— Choisir un pays —</option>
                {REAL_COUNTRIES_DATA.map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
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
              <McTitle t="NATION FICTIVE" />
              <McSub t="1 des 3 nations prédéfinies ou 1 nouvelle — l'IA l'enrichit." />
            </MC>
            <MC onClick={() => setDefautType('reel')}>
              <div style={{ fontSize:'1.3rem' }}>🗺</div>
              <McTitle t="PAYS RÉEL" />
              <McSub t="L'IA génère le portrait depuis sa situation actuelle." />
            </MC>
          </div>
          {BK(() => setPreset(null))}
        </div>
      );

      // B — Pays réel en ligne
      if (defautType === 'reel') {
        const knownReel = REAL_COUNTRIES_DATA.find(r => r.id === defautReel);
        const canLaunch = defautReel || defautNom.trim();
        return (
          <div style={S.wrap(false)}>
            <ARIAHeader showQuote={false} />
            {H('PAYS RÉEL')}
            <div style={{ ...CARD_STYLE, width:'100%', display:'flex', flexDirection:'column', gap:'0.7rem' }}>
              <select style={SELECT_STYLE} value={defautReel}
                onChange={e => { setDefautReel(e.target.value); setDefautNom(''); }}>
                <option value="">— ou tapez un nom ci-dessous —</option>
                {REAL_COUNTRIES_DATA.map(rc => <option key={rc.id} value={rc.id}>{rc.flag} {rc.nom}</option>)}
              </select>
              <div style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:'rgba(140,160,200,0.35)', textAlign:'center' }}>— OU —</div>
              <input style={{ ...INPUT_STYLE, fontSize:'0.53rem' }}
                value={defautNom} onChange={e => { setDefautNom(e.target.value); setDefautReel(''); }}
                placeholder="Tout pays : Islande, Pérou, Thaïlande…" />
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
                  const nom = knownReel?.nom || defautNom;
                  preLaunch('defaut_ai', [{ type:'reel', nom, realData: knownReel || null }]);
                }}>
                GÉNÉRER →
              </button>
            </BtnRow>
          </div>
        );
      }

      // C — Nation fictive en ligne (3 presets + nouveau)
      if (defautType === 'fictif') {
        const chosenLocal = PAYS_LOCAUX.find(p => p.id === defautFictif && defautFictif !== 'new');
        const canLaunch   = (defautFictif && defautFictif !== 'new') || defautNom.trim();
        return (
          <div style={S.wrap(false)}>
            <ARIAHeader showQuote={false} />
            {H('NATION FICTIVE')}
            <div style={{ display:'flex', gap:'0.6rem', width:'100%', flexWrap:'wrap' }}>
              {PAYS_LOCAUX.map(p => (
                <MC key={p.id}
                  style={{ flex:'1 1 110px',
                    borderColor: defautFictif===p.id ? `${p.couleur}70` : undefined,
                    background:  defautFictif===p.id ? `${p.couleur}14` : undefined }}
                  onClick={() => { setDefautFictif(p.id); setDefautNom(''); }}>
                  <div style={{ fontSize:'1.1rem' }}>{p.emoji}</div>
                  <McTitle t={p.nom} />
                  <McSub t={p.terrain} />
                </MC>
              ))}
              <MC
                style={{ flex:'1 1 110px',
                  borderColor: defautFictif==='new' ? 'rgba(200,164,74,0.45)' : undefined,
                  background:  defautFictif==='new' ? 'rgba(200,164,74,0.06)' : undefined }}
                onClick={() => setDefautFictif('new')}>
                <div style={{ fontSize:'1.1rem' }}>✨</div>
                <McTitle t="NOUVEAU" />
                <McSub t="L'IA invente" />
              </MC>
            </div>
            {defautFictif === 'new' && (
              <input style={{ ...INPUT_STYLE, fontSize:'0.53rem', width:'100%' }}
                value={defautNom} onChange={e => setDefautNom(e.target.value)}
                placeholder="Nom de la nation fictive…" autoFocus />
            )}
            {chosenLocal && (
              <div style={{ ...CARD_STYLE, width:'100%', fontSize:'0.44rem', color:'rgba(140,160,200,0.65)', lineHeight:1.6 }}>
                {chosenLocal.description}
              </div>
            )}
            <BtnRow>
              {BK(() => setDefautType(null))}
              <button style={{ ...BTN_PRIMARY, opacity: canLaunch ? 1 : 0.35 }}
                disabled={!canLaunch}
                onClick={() => {
                  if (defautFictif === 'new') {
                    preLaunch('defaut_ai', [{ type:'imaginaire', nom: defautNom }]);
                  } else {
                    preLaunch('defaut_ai', [{ type:'imaginaire', nom: chosenLocal.nom, realData: chosenLocal }]);
                  }
                }}>
                GÉNÉRER →
              </button>
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
          <button style={BTN_PRIMARY} onClick={() => {
            // Auto-nommer les pays fictifs sans nom
            const filled = countries.map((c, i) => ({
              ...c,
              nom: c.nom.trim() || (c.realData?.nom) || `Nation ${i + 1}`,
            }));
            setCountries(filled);
            preLaunch('custom', filled);
          }}>GÉNÉRER LE MONDE →</button>
        </div>
      </div>
    );

    return null;
  }

  return null;
}
