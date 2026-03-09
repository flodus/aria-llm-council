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
  const [keys,   setKeys]   = useState(loadKeys);
  const [status, setStatus] = useState({ claude:null, gemini:null, grok:null, openai:null });

  const PROVIDERS = [
    { id:'claude', label:'CLAUDE',  sub:'Anthropic',  ph:'sk-ant-…',  testUrl: async (k) => {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method:'POST', headers:{ 'Content-Type':'application/json','x-api-key':k,
            'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
          body: JSON.stringify({ model:'claude-haiku-4-5-20251001', max_tokens:10, messages:[{role:'user',content:'Hi'}] }),
        }); return r.ok;
    }},
    { id:'gemini', label:'GEMINI',  sub:'Google',     ph:'AIza…',     testUrl: async (k) => {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${k}`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ contents:[{parts:[{text:'Hi'}]}], generationConfig:{maxOutputTokens:10} }),
        }); return r.ok || r.status===429;
    }},
    { id:'grok',   label:'GROK',    sub:'xAI',        ph:'xai-…',     testUrl: async (k) => {
        const r = await fetch('https://api.x.ai/v1/chat/completions', {
          method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${k}`},
          body: JSON.stringify({ model:'grok-3-mini', max_tokens:10, messages:[{role:'user',content:'Hi'}] }),
        }); return r.ok;
    }},
    { id:'openai', label:'OPENAI',  sub:'OpenAI',     ph:'sk-…',      testUrl: async (k) => {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${k}`},
          body: JSON.stringify({ model:'gpt-4.1-mini', max_tokens:10, messages:[{role:'user',content:'Hi'}] }),
        }); return r.ok;
    }},
  ];

  const testKey = async (id) => {
    if (!keys[id]) { setStatus(s=>({...s,[id]:'missing'})); return; }
    setStatus(s=>({...s,[id]:'testing'}));
    try {
      const prov = PROVIDERS.find(p=>p.id===id);
      const ok = await prov.testUrl(keys[id]);
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
              <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                <input style={{ ...INPUT_STYLE, flex:1, fontSize:'0.48rem' }} type="password"
                  value={val}
                  onChange={e => { setKeys(k=>({...k,[prov.id]:e.target.value})); setStatus(s=>({...s,[prov.id]:null})); }}
                  placeholder={prov.ph} />
                <button style={{ ...BTN_SECONDARY, padding:'0.35rem 0.55rem', fontSize:'0.44rem', whiteSpace:'nowrap' }}
                  disabled={!val} onClick={()=>testKey(prov.id)}>Test</button>
                {s && <span style={{ fontFamily:FONT.mono, fontSize:'0.50rem', minWidth:'1rem' }}>{stLabel(s)}</span>}
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
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────
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
    // Load agents from override or defaults
    const [plAgents,    setPlAgents]    = useState(null);
    const [plLoading,   setPlLoading]   = useState(true);
    const [plTab,       setPlTab]       = useState('resume');   // 'resume' | 'presidency' | 'ministries'

    // Load on mount
    useEffect(() => {
      const loadAgents = async () => {
        try {
          const override = JSON.parse(localStorage.getItem('aria_agents_override')||'null');
          if (override) { setPlAgents(override); setPlLoading(false); return; }
          const mod = await import('../templates/base_agents.json');
          setPlAgents(JSON.parse(JSON.stringify(mod.default)));
        } catch { setPlAgents(null); }
        setPlLoading(false);
      };
      loadAgents();
    }, []);

    const saveAndLaunch = () => {
      if (plAgents) {
        try { localStorage.setItem('aria_agents_override', JSON.stringify(plAgents)); } catch {}
      }
      launch(pendingPreset, pendingDefs);
    };

    const tabStyle = (active) => ({
      fontFamily:FONT.mono, fontSize:'0.46rem', letterSpacing:'0.10em',
      padding:'0.35rem 0.8rem', cursor:'pointer', background:'transparent', border:'none',
      borderBottom: active ? '2px solid rgba(200,164,74,0.70)' : '2px solid transparent',
      color: active ? 'rgba(200,164,74,0.90)' : 'rgba(140,160,200,0.35)',
    });

    return (
      <div style={{ ...S.wrap(true), maxWidth:640 }}>
        <ARIAHeader showQuote={false} />
        <div style={{ ...labelStyle(), alignSelf:'flex-start' }}>CONSTITUTION — {worldName}</div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(200,164,74,0.10)', width:'100%', marginBottom:'0.2rem' }}>
          <button style={tabStyle(plTab==='resume')}     onClick={() => setPlTab('resume')}>RÉSUMÉ</button>
          <button style={tabStyle(plTab==='presidency')} onClick={() => setPlTab('presidency')}>PRÉSIDENCE</button>
          <button style={tabStyle(plTab==='ministries')} onClick={() => setPlTab('ministries')}>MINISTÈRES</button>
        </div>

        {plLoading && (
          <div style={{ fontFamily:FONT.mono, fontSize:'0.48rem', color:'rgba(200,164,74,0.50)',
            padding:'1.5rem', textAlign:'center' }}>Chargement…</div>
        )}

        {!plLoading && plAgents && (
          <div style={{ width:'100%', overflowY:'auto', maxHeight:'55vh', display:'flex', flexDirection:'column', gap:'0.55rem' }}>

            {/* ── RÉSUMÉ ─────────────────────────────────────────────────── */}
            {plTab === 'resume' && (
              <>
                {/* Presidency summary */}
                <div style={{ ...CARD_STYLE }}>
                  <div style={{ ...labelStyle('0.42rem'), marginBottom:'0.5rem' }}>PRÉSIDENCE</div>
                  <div style={{ display:'flex', gap:'0.8rem' }}>
                    {['phare','boussole'].map(key => {
                      const p = plAgents.presidency[key];
                      return (
                        <div key={key} style={{ flex:1, padding:'0.5rem 0.6rem',
                          background:'rgba(200,164,74,0.03)', borderRadius:'2px',
                          border:'1px solid rgba(200,164,74,0.08)' }}>
                          <div style={{ fontFamily:FONT.mono, fontSize:'0.44rem',
                            color:'rgba(200,164,74,0.75)', marginBottom:'0.2rem' }}>
                            {p.symbol} {p.name}
                          </div>
                          <div style={{ fontSize:'0.42rem', color:'rgba(140,160,200,0.55)', lineHeight:1.5 }}>
                            {p.subtitle}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ministries summary grid */}
                <div style={{ ...CARD_STYLE }}>
                  <div style={{ ...labelStyle('0.42rem'), marginBottom:'0.5rem' }}>
                    MINISTÈRES — {plAgents.ministries.length}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:'0.4rem' }}>
                    {plAgents.ministries.map(m => (
                      <div key={m.id} style={{ padding:'0.45rem 0.55rem',
                        background:'rgba(255,255,255,0.02)', borderRadius:'2px',
                        border:`1px solid ${m.color}33` }}>
                        <div style={{ fontFamily:FONT.mono, fontSize:'0.44rem',
                          color: m.color+'CC', marginBottom:'0.18rem' }}>
                          {m.emoji} {m.name}
                        </div>
                        <div style={{ fontSize:'0.39rem', color:'rgba(140,160,200,0.40)', lineHeight:1.4 }}>
                          {m.ministers.map(mk => {
                            const min = plAgents.ministers[mk];
                            return min ? `${min.emoji} ${min.name}` : mk;
                          }).join(' · ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize:'0.43rem', color:'rgba(140,160,200,0.35)',
                  fontFamily:FONT.mono, textAlign:'center', padding:'0.2rem' }}>
                  Utilisez les onglets PRÉSIDENCE et MINISTÈRES pour modifier la constitution
                </div>
              </>
            )}

            {/* ── PRÉSIDENCE ─────────────────────────────────────────────── */}
            {plTab === 'presidency' && (
              <div style={{ ...CARD_STYLE }}>
                {['phare','boussole'].map(key => {
                  const p = plAgents.presidency[key];
                  return (
                    <div key={key} style={{ marginBottom:'0.8rem' }}>
                      <div style={{ fontFamily:FONT.mono, fontSize:'0.44rem',
                        color:'rgba(200,164,74,0.70)', marginBottom:'0.3rem' }}>
                        {p.symbol} {p.name.toUpperCase()} — {p.subtitle}
                      </div>
                      <div style={{ fontFamily:FONT.mono, fontSize:'0.39rem',
                        color:'rgba(90,110,150,0.45)', marginBottom:'0.2rem' }}>ESSENCE</div>
                      <textarea
                        style={{ ...INPUT_STYLE, width:'100%', minHeight:'50px',
                          resize:'vertical', fontSize:'0.42rem', fontFamily:FONT.mono, lineHeight:1.55 }}
                        value={p.essence}
                        onChange={e => setPlAgents(a => ({...a, presidency:{...a.presidency,
                          [key]:{...a.presidency[key], essence:e.target.value}}}))}
                      />
                      <div style={{ fontFamily:FONT.mono, fontSize:'0.39rem',
                        color:'rgba(90,110,150,0.45)', margin:'0.35rem 0 0.2rem' }}>RÔLE ÉTENDU</div>
                      <textarea
                        style={{ ...INPUT_STYLE, width:'100%', minHeight:'50px',
                          resize:'vertical', fontSize:'0.42rem', fontFamily:FONT.mono, lineHeight:1.55 }}
                        value={p.role_long}
                        onChange={e => setPlAgents(a => ({...a, presidency:{...a.presidency,
                          [key]:{...a.presidency[key], role_long:e.target.value}}}))}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── MINISTÈRES ─────────────────────────────────────────────── */}
            {plTab === 'ministries' && plAgents.ministries.map((ministry, mi) => {
              const allMinKeys = Object.keys(plAgents.ministers);
              return (
                <div key={ministry.id} style={{ ...CARD_STYLE }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.45rem' }}>
                    <span style={{ fontSize:'0.9rem' }}>{ministry.emoji}</span>
                    <div style={{ fontFamily:FONT.mono, fontSize:'0.46rem', letterSpacing:'0.10em',
                      color: ministry.color+'CC' }}>{ministry.name.toUpperCase()}</div>
                  </div>

                  {/* Mission */}
                  <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                    color:'rgba(90,110,150,0.40)', marginBottom:'0.18rem' }}>MISSION</div>
                  <textarea
                    style={{ ...INPUT_STYLE, width:'100%', minHeight:'38px', resize:'vertical',
                      fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5, marginBottom:'0.45rem' }}
                    value={ministry.mission}
                    onChange={e => setPlAgents(a => ({...a,
                      ministries: a.ministries.map((m,i) => i===mi ? {...m, mission:e.target.value} : m)
                    }))}
                  />

                  {/* Minister assignment toggles */}
                  <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                    color:'rgba(90,110,150,0.40)', marginBottom:'0.25rem' }}>MINISTRES</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.28rem', marginBottom:'0.45rem' }}>
                    {allMinKeys.map(mkey => {
                      const min = plAgents.ministers[mkey];
                      const isIn = ministry.ministers.includes(mkey);
                      return (
                        <button key={mkey}
                          style={{ ...BTN_SECONDARY, padding:'0.20rem 0.50rem', fontSize:'0.41rem',
                            ...(isIn ? { borderColor:min.color+'99', color:min.color, background:min.color+'18' } : {}) }}
                          onClick={() => setPlAgents(a => ({...a,
                            ministries: a.ministries.map((m,i) => i!==mi ? m : {
                              ...m, ministers: isIn
                                ? m.ministers.filter(k=>k!==mkey)
                                : [...m.ministers, mkey]
                            })
                          }))}>
                          {min.emoji} {min.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Per-minister ministry prompts */}
                  {ministry.ministers.length > 0 && (
                    <>
                      <div style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
                        color:'rgba(90,110,150,0.40)', marginBottom:'0.25rem' }}>PROMPTS MINISTÉRIELS</div>
                      {ministry.ministers.map(mkey => {
                        const min = plAgents.ministers[mkey];
                        return (
                          <div key={mkey} style={{ marginBottom:'0.35rem' }}>
                            <div style={{ fontFamily:FONT.mono, fontSize:'0.39rem',
                              color:min.color+'AA', marginBottom:'0.15rem' }}>
                              {min.emoji} {min.name}
                            </div>
                            <textarea
                              style={{ ...INPUT_STYLE, width:'100%', minHeight:'34px',
                                resize:'vertical', fontSize:'0.41rem', fontFamily:FONT.mono, lineHeight:1.5 }}
                              value={ministry.ministerPrompts?.[mkey] || ''}
                              onChange={e => setPlAgents(a => ({...a,
                                ministries: a.ministries.map((m,i) => i!==mi ? m : {
                                  ...m, ministerPrompts: {...(m.ministerPrompts||{}), [mkey]: e.target.value}
                                })
                              }))}
                            />
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display:'flex', gap:'0.6rem', width:'100%', justifyContent:'space-between', paddingTop:'0.4rem' }}>
          <button style={BTN_SECONDARY} onClick={() => setStep('config')}>← RETOUR</button>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <button style={{ ...BTN_SECONDARY, fontSize:'0.44rem',
              color:'rgba(200,80,80,0.50)', borderColor:'rgba(200,80,80,0.20)' }}
              onClick={() => {
                localStorage.removeItem('aria_agents_override');
                setPlAgents(null);
                setPlLoading(true);
                import('../templates/base_agents.json').then(mod => {
                  setPlAgents(JSON.parse(JSON.stringify(mod.default)));
                  setPlLoading(false);
                }).catch(() => setPlLoading(false));
              }}>
              ↺ Défaut
            </button>
            <button style={BTN_PRIMARY} onClick={saveAndLaunch}>
              GÉNÉRER LE MONDE →
            </button>
          </div>
        </div>
      </div>
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
        // Merge saved overrides on top of defaults
        if (def) {
          const merged = JSON.parse(JSON.stringify(def));
          if (override?.ministries) merged.ministries = override.ministries;
          if (override?.ministers)  merged.ministers  = override.ministers;
          if (override?.presidency) merged.presidency = override.presidency;
          setConstData(merged);
        }
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
      setStep('config');
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
          <button style={BTN_SECONDARY} onClick={() => setStep('mode')}>← RETOUR</button>
          <button style={BTN_PRIMARY} onClick={saveAndContinue}>CONTINUER →</button>
        </div>
      </div>
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
              </div>
            )}

            <BtnRow>
              {BK(() => { setDefautType(null); setDefautFictif(null); setDefautNom(''); })}
              <button
                style={{ ...BTN_PRIMARY, opacity: canPlay ? 1 : 0.35 }}
                disabled={!canPlay}
                onClick={() => {
                  if (isNew) {
                    preLaunch('defaut_local', [{
                      type: 'imaginaire',
                      nom:     defautNom.trim(),
                      terrain: newFictifTerrain,
                      regime:  newFictifRegime,
                      realData: null,
                    }]);
                  } else {
                    preLaunch('defaut_local', [{ type:'imaginaire', realData: chosen }]);
                  }
                }}>
                JOUER →
              </button>
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
