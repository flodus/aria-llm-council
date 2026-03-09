// ═══════════════════════════════════════════════════════════════════════════════
//  ConstitutionModal.jsx  v2
//  Présidence toggleable · ministères actifs · ajout custom ministres/ministères
//  Lit + écrit aria_agents_override (localStorage) — même store que PreLaunchScreen
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { REGIMES, getOptions, DEFAULT_OPTIONS } from './Dashboard_p1';

// ─── Primitives UI ───────────────────────────────────────────────────────────
const FONT  = "'JetBrains Mono', monospace";
const GOLD  = 'rgba(200,164,74,0.88)';
const DIM   = 'rgba(140,160,200,0.48)';
const INPUT = {
  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(200,164,74,0.18)',
  borderRadius:'2px', padding:'0.38rem 0.55rem', color:'rgba(220,228,240,0.85)',
  fontFamily:FONT, fontSize:'0.50rem', outline:'none',
  width:'100%', boxSizing:'border-box',
};
const BTN_S = {
  background:'none', border:'1px solid rgba(255,255,255,0.10)',
  color:'rgba(200,215,240,0.50)', fontFamily:FONT, fontSize:'0.50rem',
  letterSpacing:'0.10em', padding:'0.32rem 0.7rem', borderRadius:'2px', cursor:'pointer',
};
const BTN_P = {
  background:'rgba(200,164,74,0.10)', border:'1px solid rgba(200,164,74,0.42)',
  color:'rgba(200,164,74,0.90)', fontFamily:FONT, fontSize:'0.50rem',
  letterSpacing:'0.10em', padding:'0.32rem 0.9rem', borderRadius:'2px', cursor:'pointer',
};

const REGIME_LIST = [
  ['democratie_liberale','Démocratie libérale 🗳️'],
  ['republique_federale','République fédérale 🏛️'],
  ['monarchie_constitutionnelle','Monarchie constitutionnelle 👑'],
  ['democratie_directe','Démocratie directe 🤝'],
  ['technocratie','Technocratie ⚙️'],
  ['oligarchie','Oligarchie 💼'],
  ['junte_militaire','Junte militaire ⚔️'],
  ['regime_autoritaire','Régime autoritaire 🔒'],
  ['monarchie_absolue','Monarchie absolue 👸'],
  ['theocracie','Théocratie ✝️'],
];
const BASE_IDS = ['justice','economie','defense','sante','education','ecologie','chance'];

function readOv()   { try { return JSON.parse(localStorage.getItem('aria_agents_override')||'null'); } catch { return null; } }
function writeOv(d) { try { localStorage.setItem('aria_agents_override', JSON.stringify(d)); } catch {} }

// ─── Composant ───────────────────────────────────────────────────────────────
export default function ConstitutionModal({ country, onSave, onClose }) {
  const globalGov = getOptions().defaultGovernance || DEFAULT_OPTIONS.defaultGovernance;
  const current   = { ...globalGov, ...(country?.governanceOverride || {}) };

  const [agents, setAgents] = useState(null);
  const [tab,    setTab]    = useState('regime');
  const [regime, setRegime] = useState(country?.regime || 'democratie_liberale');
  const [leader, setLeader] = useState(country?.leader || '');
  const [contextMode,     setContextMode]     = useState(country?.context_mode     || '');      // '' = hérite global
  const [contextOverride, setContextOverride] = useState(country?.contextOverride  || '');

  // présidence actives (array de keys)
  const [activePres, setActivePres] = useState(() => {
    const ov = readOv();
    if (ov?.active_presidency) return ov.active_presidency;
    const p = current.presidency || 'duale';
    if (p==='solaire') return ['phare'];
    if (p==='lunaire') return ['boussole'];
    if (p==='collegiale') return [];
    return ['phare','boussole'];
  });

  // ministères actifs
  const [activeMins, setActiveMins] = useState(() => {
    const ov = readOv();
    if (ov?.active_ministries) return ov.active_ministries;
    return current.ministries || globalGov.ministries || BASE_IDS;
  });

  // formulaires ajout
  const [activeMinsters, setActiveMinsters] = useState(() => {
    const ov = readOv();
    return ov?.active_ministers || null; // null = tous actifs
  });
  const scrollRef = useRef(null);
  const [openMin,         setOpenMin]         = useState(null); // set to first key once agents load (ministers)
  const [openMinistry,    setOpenMinistry]    = useState(null); // ministry accordion
  const [showNewMin,      setShowNewMin]      = useState(false);
  const [showNewMinistry, setShowNewMinistry] = useState(false);
  const [nMinD,  setNMinD]  = useState({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'', annotation:'' });
  const [nMinistryD, setNMinistryD] = useState({ id:'', name:'', emoji:'🏛️', color:'#8090C0', mission:'', ministers:[] });

  useEffect(() => {
    const ov = readOv();
    if (ov) { setAgents(ov); return; }
    import('../templates/base_agents.json').then(mod =>
      setAgents(JSON.parse(JSON.stringify(mod.default)))
    ).catch(() => setAgents({ ministries:[], ministers:{}, presidency:{} }));
  }, []);

  useEffect(() => {
    if (agents && openMin === null) {
      const firstKey = Object.keys(agents.ministers || {})[0];
      if (firstKey) setOpenMin(firstKey);
    }
  }, [agents]);

  const toggleMinster = (key) => {
    setActiveMinsters(prev => {
      const all = Object.keys(agents?.ministers || {});
      const cur = prev || all;
      const on = cur.includes(key);
      const next = on ? cur.filter(k => k !== key) : [...cur, key];
      return next.length === all.length ? null : next;
    });
  };

  const togglePres = k =>
    setActivePres(p => p.includes(k) ? p.filter(x=>x!==k) : [...p, k]);

  const toggleMin = id => setActiveMins(p =>
    p.includes(id) ? (p.length>1 ? p.filter(x=>x!==id) : p) : [...p, id]
  );

  const addMinister = () => {
    if (!nMinD.id||!nMinD.name||!agents) return;
    const id = nMinD.id.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z_]/g,'');
    if (!id||agents.ministers[id]) return;
    setAgents(a => ({...a, ministers:{...a.ministers,[id]:{...nMinD,id,sign:'Custom',weight:1,annotation:''}}}));
    setNMinD({ id:'', name:'', emoji:'🌟', color:'#8090C0', essence:'', comm:'' });
    setShowNewMin(false);
  };

  const addMinistry = () => {
    if (!nMinistryD.id||!nMinistryD.name||!agents) return;
    const id = nMinistryD.id.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z_]/g,'');
    if (!id||agents.ministries.find(m=>m.id===id)) return;
    setAgents(a => ({...a, ministries:[...a.ministries,{...nMinistryD,id,keywords:[],questions:[],ministerPrompts:{}}]}));
    setActiveMins(p => [...p, id]);
    setNMinistryD({ id:'', name:'', emoji:'🏛️', color:'#8090C0', mission:'', ministers:[] });
    setShowNewMinistry(false);
  };

  const delMinister  = k  => setAgents(a => { const m={...a.ministers}; delete m[k]; return {...a,ministers:m}; });
  const delMinistry  = id => { setAgents(a => ({...a,ministries:a.ministries.filter(m=>m.id!==id)})); setActiveMins(p=>p.filter(x=>x!==id)); };

  const handleSave = () => {
    if (agents) writeOv({ ...agents, active_ministries:activeMins, active_presidency:activePres, active_ministers:activeMinsters });
    const presStr = activePres.length===0 ? 'collegiale'
      : activePres.length===1 ? (activePres[0]==='phare' ? 'solaire' : 'lunaire') : 'duale';
    const prevMin = new Set(current.ministries || globalGov.ministries);
    const nextMin = new Set(activeMins);
    const diff = {
      regimeAvant:current?.regime||'', regimeApres:regime,
      presidenceAvant:current.presidency||'duale', presidenceApres:presStr,
      leaderAvant:country?.leader||'', leaderApres:leader,
      ministresDiff:{ ajoutes:[...nextMin].filter(m=>!prevMin.has(m)), retires:[...prevMin].filter(m=>!nextMin.has(m)) },
    };
    const regimeData = REGIMES?.[regime] || {};
    onSave({ ...country, regime, regimeName:regimeData.name||regime, regimeEmoji:regimeData.emoji||'🏛️',
      leader:leader||null,
      context_mode:     contextMode     || undefined,
      contextOverride:  contextOverride || undefined,
      governanceOverride:{ presidency:presStr, active_presidency:activePres, ministries:activeMins, crisis_ministry:activeMins.includes('chance') },
      _constitutionDiff:diff });
    onClose();
  };

  const tabSt = t => ({
    ...BTN_S, flex:1, borderRadius:0, borderLeft:'none', borderRight:'none', borderTop:'none',
    borderBottom: tab===t ? `2px solid ${GOLD}` : '2px solid transparent',
    color: tab===t ? GOLD : DIM, padding:'0.45rem 0.3rem', fontSize:'0.46rem', letterSpacing:'0.12em',
  });

  const S = STYLES;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={S.header}>
          <span style={S.headerTitle}>⚖️ Constitution — {country?.nom||'ce pays'}</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid rgba(200,164,74,0.12)' }}>
          {[['regime','RÉGIME'],['presidency','PRÉSIDENCE'],['ministries','MINISTÈRES'],['ministers','MINISTRES']].map(([t,lbl])=>(
            <button key={t} style={tabSt(t)}
              onClick={()=>{ setTab(t); if(scrollRef.current) scrollRef.current.scrollTop=0; }}>
              {lbl}
            </button>
          ))}
        </div>

        <div ref={scrollRef} style={S.body}>

          {!agents && <div style={{fontFamily:FONT,fontSize:'0.50rem',color:'rgba(200,164,74,0.45)',textAlign:'center',padding:'2rem'}}>Chargement…</div>}

          {agents && (<>

            {/* ── RÉGIME ─────────────────────────────────────────── */}
            {tab==='regime' && (<>
              <section style={S.sec}>
                <h3 style={S.secTitle}>RÉGIME POLITIQUE</h3>
                <select style={{...INPUT,cursor:'pointer'}} value={regime} onChange={e=>setRegime(e.target.value)}>
                  {REGIME_LIST.map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </section>
              <section style={S.sec}>
                <h3 style={S.secTitle}>CHEF D'ÉTAT</h3>
                <input style={INPUT} value={leader} onChange={e=>setLeader(e.target.value)} placeholder="Nom du dirigeant…"/>
              </section>

              {/* ── CONTEXTE PAYS ─────────────────────────────────── */}
              <section style={S.sec}>
                <h3 style={S.secTitle}>CONTEXTE DANS LES DÉLIBÉRATIONS</h3>
                <p style={S.hint}>
                  Contrôle quelles infos sur ce pays sont injectées dans les prompts IA.
                  Laissez sur "Hérite" pour suivre le réglage global (Settings).
                </p>
                <div style={{display:'flex',flexDirection:'column',gap:'0.32rem'}}>
                  {[
                    ['',           '⚙️ Hérite du global',    'Suit le réglage de Settings'],
                    ['auto',       '🤖 Auto',                'Stats + description si disponible'],
                    ['rich',       '📖 Enrichi',             'Contexte complet — incite l\'IA à raisonner historiquement'],
                    ['stats_only', '📊 Stats seules',        'Chiffres uniquement — neutre, moins d\'hallucinations'],
                    ['off',        '🚫 Désactivé',           'Aucun contexte — délibération aveugle pour ce pays'],
                  ].map(([val,lbl,hint]) => {
                    const on = contextMode === val;
                    return (
                      <label key={val} style={{display:'flex',alignItems:'flex-start',gap:'0.45rem',
                        cursor:'pointer',padding:'0.30rem 0.45rem',borderRadius:'2px',
                        background:on?'rgba(200,164,74,0.08)':'transparent',
                        border:`1px solid ${on?'rgba(200,164,74,0.28)':'transparent'}`}}>
                        <input type="radio" name="ctx_mode" value={val}
                          checked={on} onChange={()=>setContextMode(val)}
                          style={{marginTop:'0.08rem',accentColor:'#C8A44A'}}/>
                        <div>
                          <div style={{fontFamily:FONT,fontSize:'0.50rem',color:'rgba(220,228,240,0.85)'}}>{lbl}</div>
                          <div style={{fontSize:'0.44rem',color:'rgba(140,160,200,0.48)',marginTop:'0.08rem',lineHeight:1.4}}>{hint}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Contexte custom libre */}
              <section style={S.sec}>
                <h3 style={S.secTitle}>CONTEXTE PERSONNALISÉ</h3>
                <p style={S.hint}>
                  Texte libre injecté tel quel dans chaque délibération de ce pays.
                  Si renseigné, remplace <em>entièrement</em> le contexte auto/enrichi.
                  Idéal pour ancrer un pays fictif dans une lore précise.
                </p>
                <textarea style={{...INPUT,minHeight:'80px',resize:'vertical',lineHeight:1.55,fontFamily:FONT}}
                  value={contextOverride}
                  onChange={e=>setContextOverride(e.target.value)}
                  placeholder={`Ex : ${country?.nom||'Ce pays'} est une théocratie insulaire dont la constitution date de 1847. Le conseil délibère en tenant compte de la tradition des Anciens et des tensions avec la République voisine de Valmoria…`}
                />
                {contextOverride && (
                  <button style={{...BTN_S,alignSelf:'flex-end',fontSize:'0.42rem',
                    color:'rgba(200,80,80,0.50)',borderColor:'rgba(200,80,80,0.20)'}}
                    onClick={()=>setContextOverride('')}>✕ Effacer</button>
                )}
              </section>
            </>)}

            {/* ── PRÉSIDENCE ─────────────────────────────────────── */}
            {tab==='presidency' && (<>
              <section style={S.sec}>
                <h3 style={S.secTitle}>FIGURES ACTIVES</h3>
                <p style={S.hint}>Activez / désactivez chaque figure. Sans présidence → mode collégial (ministres votent).</p>
                <div style={{display:'flex',flexDirection:'column',gap:'0.45rem'}}>
                  {Object.entries(agents.presidency||{}).map(([key,p])=>{
                    const on=activePres.includes(key);
                    return (
                      <button key={key} style={{...S.presCard,...(on?S.presCardOn:{})}} onClick={()=>togglePres(key)}>
                        <span style={{fontSize:'1.15rem',minWidth:'1.4rem'}}>{p.symbol}</span>
                        <div style={{flex:1,textAlign:'left'}}>
                          <div style={{fontSize:'0.56rem',letterSpacing:'0.10em',color:on?GOLD:'rgba(200,215,240,0.50)'}}>{p.name}</div>
                          <div style={{fontSize:'0.44rem',color:DIM,marginTop:'0.08rem'}}>{p.subtitle}</div>
                        </div>
                        <span style={{fontFamily:FONT,fontSize:'0.48rem',color:on?GOLD:'rgba(140,160,200,0.22)'}}>{on?'● ACTIF':'○ INACTIF'}</span>
                      </button>
                    );
                  })}
                </div>
                {activePres.length===0 && <div style={S.warn}>⚠ Mode collégial — délibération sans arbitrage présidentiel.</div>}
              </section>

              {Object.entries(agents.presidency||{}).map(([key,p])=>(
                <section key={key} style={{...S.sec,opacity:activePres.includes(key)?1:0.42}}>
                  <h3 style={S.secTitle}>{p.symbol} {p.name.toUpperCase()}</h3>
                  <div style={S.label}>NOM</div>
                  <input style={INPUT} value={p.name}
                    onChange={e=>setAgents(a=>({...a,presidency:{...a.presidency,[key]:{...a.presidency[key],name:e.target.value}}}))} />
                  <div style={{...S.label,marginTop:'0.35rem'}}>ESSENCE</div>
                  <textarea style={{...INPUT,minHeight:'52px',resize:'vertical',lineHeight:1.55,fontFamily:FONT}}
                    value={p.essence||''}
                    onChange={e=>setAgents(a=>({...a,presidency:{...a.presidency,[key]:{...a.presidency[key],essence:e.target.value}}}))} />
                  <div style={{...S.label,marginTop:'0.35rem'}}>RÔLE ÉTENDU</div>
                  <textarea style={{...INPUT,minHeight:'52px',resize:'vertical',lineHeight:1.55,fontFamily:FONT}}
                    value={p.role_long||''}
                    onChange={e=>setAgents(a=>({...a,presidency:{...a.presidency,[key]:{...a.presidency[key],role_long:e.target.value}}}))} />
                </section>
              ))}
            </>)}

            {/* ── MINISTÈRES ─────────────────────────────────────── */}
            {tab==='ministries' && (<>
              {/* ── Header + chips toggle actif/inactif ── */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.3rem'}}>
                <h3 style={S.secTitle}>MINISTÈRES <span style={S.badge}>{activeMins.length}/{agents.ministries.length}</span></h3>
                <button style={{...BTN_S,fontSize:'0.40rem',padding:'0.14rem 0.38rem'}} onClick={()=>setActiveMins(agents.ministries.map(m=>m.id))}>Tous actifs</button>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.32rem',marginBottom:'0.55rem'}}>
                {agents.ministries.map(m=>{
                  const on=activeMins.includes(m.id);
                  const isBase=BASE_IDS.includes(m.id);
                  const isOpen=openMinistry===m.id;
                  return (
                    <div key={m.id} style={{display:'flex',alignItems:'center',gap:'0.12rem'}}>
                      <button style={{display:'flex',alignItems:'center',gap:'0.32rem',
                        padding:'0.28rem 0.52rem',borderRadius:'3px',cursor:'pointer',
                        background:isOpen?m.color+'18':on?m.color+'0C':'rgba(255,255,255,0.015)',
                        border:`1px solid ${isOpen?m.color+'66':on?m.color+'33':'rgba(255,255,255,0.07)'}`,
                        opacity:on?1:0.30, filter:on?'none':'grayscale(0.6)', transition:'all 0.12s'}}
                        onClick={()=>{
                          if(isOpen){ toggleMin(m.id); setOpenMinistry(null); }
                          else { if(!on) toggleMin(m.id); setOpenMinistry(m.id); }
                        }}>
                        <span style={{fontSize:'0.95rem',lineHeight:1,filter:on?'none':'grayscale(1)',opacity:on?1:0.35,transition:'all 0.12s'}}>{m.emoji}</span>
                        <span style={{fontFamily:FONT,fontSize:'0.42rem',color:isOpen?m.color+'EE':on?'rgba(200,215,235,0.80)':'rgba(140,160,200,0.38)',letterSpacing:'0.04em'}}>
                          {m.name}
                        </span>
                        <span style={{fontSize:'0.42rem',color:on?(m.color||GOLD):'rgba(100,120,160,0.25)'}}>{on?'●':'○'}</span>
                      </button>
                      {!isBase&&<button style={{background:'none',border:'none',cursor:'pointer',color:'rgba(200,80,80,0.35)',fontSize:'0.65rem',padding:'0 0.15rem',lineHeight:1}} onClick={()=>delMinistry(m.id)}>✕</button>}
                    </div>
                  );
                })}
              </div>

              {/* ── GESTION DE CRISE ── */}
              <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',marginTop:'0.4rem',paddingTop:'0.55rem',marginBottom:'0.45rem'}}>
                <div style={{fontFamily:FONT,fontSize:'0.38rem',letterSpacing:'0.12em',color:'rgba(140,160,200,0.40)',marginBottom:'0.32rem'}}>
                  GESTION DE CRISE
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'0.45rem 0.65rem',borderRadius:'3px',
                  background: activeMins.includes('chance') ? 'rgba(200,164,74,0.06)' : 'rgba(255,255,255,0.02)',
                  border:`1px solid ${activeMins.includes('chance') ? 'rgba(200,164,74,0.28)' : 'rgba(255,255,255,0.07)'}`,
                  cursor:'pointer', transition:'all 0.15s'}}
                  onClick={()=>setActiveMins(p=>p.includes('chance')?p.filter(x=>x!=='chance'):[...p,'chance'])}>
                  <div>
                    <div style={{fontFamily:FONT,fontSize:'0.44rem',color:activeMins.includes('chance')?'rgba(200,164,74,0.88)':'rgba(160,175,210,0.50)',letterSpacing:'0.06em'}}>
                      🎲 Ministère de la Chance &amp; Crises
                    </div>
                    <div style={{fontSize:'0.38rem',color:'rgba(120,140,180,0.38)',marginTop:'0.1rem'}}>
                      Active le 7e ministère pour la gestion des urgences
                    </div>
                  </div>
                  <div style={{width:'2rem',height:'1rem',borderRadius:'10px',position:'relative',flexShrink:0,
                    background:activeMins.includes('chance')?'rgba(200,164,74,0.55)':'rgba(70,82,105,0.50)',
                    transition:'all 0.15s',marginLeft:'0.8rem'}}>
                    <div style={{position:'absolute',top:'0.12rem',
                      left:activeMins.includes('chance')?'1.0rem':'0.12rem',
                      width:'0.76rem',height:'0.76rem',borderRadius:'50%',transition:'all 0.15s',
                      background:activeMins.includes('chance')?'#C8A44A':'rgba(150,165,195,0.55)'}} />
                  </div>
                </div>
              </div>

              {/* ── Fiche ministère ouverte : style modal création de monde ── */}
              {openMinistry && (() => {
                const m  = agents.ministries.find(x=>x.id===openMinistry);
                const mi = agents.ministries.findIndex(x=>x.id===openMinistry);
                if (!m) return null;
                const on = activeMins.includes(m.id);
                const assignedKeys = m.ministers || [];
                return (
                  <section style={{...S.sec,
                    border:`1px solid ${on?m.color+'44':'rgba(180,180,180,0.10)'}`,
                    borderRadius:'4px',padding:'0.8rem',
                    opacity:on?1:0.32, filter:on?'none':'grayscale(0.5)',
                    background:on?m.color+'06':'rgba(255,255,255,0.01)'}}>

                    {/* Header */}
                    <div style={{display:'flex',alignItems:'center',gap:'0.55rem',marginBottom:'0.5rem'}}>
                      <span style={{fontSize:'1.3rem'}}>{m.emoji}</span>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:FONT,fontSize:'0.52rem',color:m.color+'DD',letterSpacing:'0.08em',textTransform:'uppercase'}}>{m.name}</div>
                      </div>
                      <button style={{...BTN_S,fontSize:'0.38rem',padding:'0.12rem 0.42rem',
                        ...(on?{borderColor:m.color+'55',color:m.color+'CC',background:m.color+'10'}:{})}}
                        onClick={()=>toggleMin(m.id)}>
                        {on?'● ACTIF':'○ INACTIF'}
                      </button>
                    </div>

                    {/* Mission */}
                    <div style={S.label}>MISSION</div>
                    <textarea style={{...INPUT,minHeight:'38px',resize:'vertical',lineHeight:1.5,fontFamily:FONT,marginBottom:'0.55rem'}}
                      value={m.mission||''}
                      onChange={e=>setAgents(a=>({...a,ministries:a.ministries.map((x,i)=>i===mi?{...x,mission:e.target.value}:x)}))} />

                    {/* Sélection ministres assignés */}
                    <div style={{...S.label,marginBottom:'0.28rem'}}>
                      MINISTRES ASSIGNÉS
                      <span style={{fontFamily:FONT,fontSize:'0.36rem',color:'rgba(140,160,200,0.28)',fontWeight:'normal',letterSpacing:'0',marginLeft:'0.5rem'}}>— cliquez pour assigner / retirer</span>
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'0.3rem',marginBottom:'0.55rem'}}>
                      {Object.entries(agents.ministers).map(([mk,min])=>{
                        if (!min) return null;
                        const assigned = assignedKeys.includes(mk);
                        return (
                          <button key={mk}
                            style={{display:'flex',alignItems:'center',gap:'0.28rem',
                              padding:'0.22rem 0.44rem',borderRadius:'3px',cursor:'pointer',
                              background:assigned?min.color+'15':'rgba(255,255,255,0.02)',
                              border:`1px solid ${assigned?min.color+'55':'rgba(255,255,255,0.06)'}`,
                              transition:'all 0.12s', opacity: assigned?1:0.45}}
                            onClick={()=>{
                              const next = assigned
                                ? assignedKeys.filter(k=>k!==mk)
                                : [...assignedKeys, mk];
                              setAgents(a=>({...a,ministries:a.ministries.map((x,i)=>i===mi?{...x,ministers:next}:x)}));
                            }}>
                            <span style={{fontSize:'0.85rem',lineHeight:1}}>{min.emoji||'👤'}</span>
                            <span style={{fontFamily:FONT,fontSize:'0.40rem',color:assigned?min.color+'EE':'rgba(140,160,200,0.45)',letterSpacing:'0.04em'}}>
                              {min.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Prompts ministériels par ministre assigné */}
                    {assignedKeys.length > 0 && (
                      <>
                        <div style={{...S.label,marginBottom:'0.28rem'}}>
                          PROMPTS MINISTÉRIELS
                          <span style={{fontFamily:FONT,fontSize:'0.36rem',color:'rgba(140,160,200,0.28)',fontWeight:'normal',letterSpacing:'0',marginLeft:'0.5rem'}}>— rôle spécifique de chaque ministre dans ce ministère</span>
                        </div>
                        {assignedKeys.map(mk=>{
                          const min = agents.ministers[mk];
                          if (!min) return null;
                          const promptVal = (m.minister_prompts||{})[mk] || '';
                          return (
                            <div key={mk} style={{marginBottom:'0.35rem'}}>
                              <div style={{display:'flex',alignItems:'center',gap:'0.3rem',marginBottom:'0.14rem'}}>
                                <span style={{fontSize:'0.82rem'}}>{min.emoji||'👤'}</span>
                                <span style={{fontFamily:FONT,fontSize:'0.40rem',color:min.color+'BB',letterSpacing:'0.05em'}}>{min.name}</span>
                              </div>
                              <textarea style={{...INPUT,minHeight:'30px',resize:'vertical',lineHeight:1.5,fontFamily:FONT}}
                                value={promptVal}
                                placeholder={`Rôle de ${min.name} dans ${m.name}…`}
                                onChange={e=>{
                                  const prompts = {...(m.minister_prompts||{}), [mk]:e.target.value};
                                  setAgents(a=>({...a,ministries:a.ministries.map((x,i)=>i===mi?{...x,minister_prompts:prompts}:x)}));
                                }}/>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </section>
                );
              })()}

              {/* ── Nouveau ministère ── */}
              {showNewMinistry ? (
                <section style={{...S.sec,border:'1px solid rgba(100,160,255,0.22)',borderRadius:'2px',padding:'0.7rem'}}>
                  <h3 style={{...S.secTitle,color:'rgba(100,160,255,0.65)'}}>+ NOUVEAU MINISTÈRE</h3>
                  <div style={{display:'grid',gridTemplateColumns:'auto 1fr 1fr',gap:'0.38rem',marginBottom:'0.32rem'}}>
                    <input style={{...INPUT,width:'2.1rem',textAlign:'center',fontSize:'1rem',padding:'0.16rem'}} value={nMinistryD.emoji} onChange={e=>setNMinistryD(d=>({...d,emoji:e.target.value}))} placeholder="🏛️"/>
                    <input style={INPUT} value={nMinistryD.name} onChange={e=>setNMinistryD(d=>({...d,name:e.target.value}))} placeholder="Nom du ministère"/>
                    <input style={INPUT} value={nMinistryD.id}   onChange={e=>setNMinistryD(d=>({...d,id:e.target.value}))} placeholder="id_unique"/>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'0.45rem',marginBottom:'0.32rem'}}>
                    <span style={{fontFamily:FONT,fontSize:'0.43rem',color:DIM}}>Couleur</span>
                    <input type="color" value={nMinistryD.color} style={{width:'1.9rem',height:'1.5rem',border:'none',background:'none',cursor:'pointer'}} onChange={e=>setNMinistryD(d=>({...d,color:e.target.value}))}/>
                  </div>
                  <textarea style={{...INPUT,minHeight:'34px',resize:'vertical',lineHeight:1.5,fontFamily:FONT,marginBottom:'0.38rem'}} value={nMinistryD.mission} onChange={e=>setNMinistryD(d=>({...d,mission:e.target.value}))} placeholder="Mission du ministère…"/>
                  <div style={{display:'flex',gap:'0.38rem',justifyContent:'flex-end'}}>
                    <button style={BTN_S} onClick={()=>setShowNewMinistry(false)}>Annuler</button>
                    <button style={{...BTN_P,opacity:nMinistryD.name&&nMinistryD.id?1:0.35}} disabled={!nMinistryD.name||!nMinistryD.id} onClick={addMinistry}>Créer →</button>
                  </div>
                </section>
              ) : (
                <button style={{...BTN_S,alignSelf:'center',color:'rgba(100,160,255,0.55)',borderColor:'rgba(100,160,255,0.22)'}} onClick={()=>setShowNewMinistry(true)}>+ Nouveau ministère</button>
              )}
            </>)}

            {/* ── MINISTRES ──────────────────────────────────────── */}
            {tab==='ministers' && (<>
              {/* ── Grille boutons icône ─────────────────────────── */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.3rem'}}>
                <h3 style={S.secTitle}>{Object.keys(agents.ministers).length} MINISTRES</h3>
                <button style={{...BTN_S,fontSize:'0.40rem',padding:'0.14rem 0.38rem'}} onClick={()=>setActiveMinsters(null)}>Tous actifs</button>
              </div>
              <div style={{fontFamily:FONT,fontSize:'0.37rem',color:'rgba(140,155,185,0.35)',
                marginBottom:'0.32rem',letterSpacing:'0.06em'}}>
                1 clic = ouvrir la fiche · 2e clic = activer / désactiver
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem',marginBottom:'0.5rem'}}>
                {Object.entries(agents.ministers).map(([key,min])=>{
                  if (!min) return null;
                  // Grisé si ministre inactif OU si son ministère est inactif
                  const ministryOfMin = agents.ministries?.find(m=>(m.ministers||[]).includes(key));
                  const ministryActive = !ministryOfMin || activeMins.includes(ministryOfMin.id);
                  const on     = ministryActive && (activeMinsters===null || activeMinsters.includes(key));
                  const isOpen = openMin === key;
                  return (
                    <button key={key}
                      style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.18rem',
                        padding:'0.45rem 0.55rem',borderRadius:'4px',cursor:'pointer',
                        background: isOpen ? min.color+'18' : on ? min.color+'0A' : 'rgba(255,255,255,0.015)',
                        border:`1px solid ${isOpen ? min.color+'66' : on ? min.color+'33' : 'rgba(255,255,255,0.07)'}`,
                        opacity: on ? 1 : 0.28,
                        filter: on ? 'none' : 'grayscale(0.7)',
                        minWidth:'3.2rem', transition:'all 0.12s'}}
                      onClick={()=>setOpenMin(p=>p===key?null:key)}>
                      <span style={{fontSize:'1.1rem',lineHeight:1,filter:on?'none':'grayscale(1)',opacity:on?1:0.35,transition:'all 0.12s'}}>{min.emoji||'👤'}</span>
                      <span style={{fontFamily:FONT,fontSize:'0.36rem',color:isOpen?min.color+'EE':on?min.color+'99':'rgba(140,160,200,0.40)',
                        letterSpacing:'0.04em',textAlign:'center',lineHeight:1.3,maxWidth:'3.8rem',
                        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {min.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Fiche ministre ouverte ───────────────────────── */}
              {openMin && agents.ministers[openMin] && (() => {
                const key = openMin;
                const min = agents.ministers[key];
                const on  = activeMinsters===null || activeMinsters.includes(key);
                return (
                  <section style={{...S.sec,
                    border:`1px solid ${on ? min.color+'44' : 'rgba(180,180,180,0.12)'}`,
                    borderRadius:'4px', padding:'0.75rem 0.8rem',
                    opacity: on ? 1 : 0.38,
                    filter: on ? 'none' : 'grayscale(0.6)',
                    background: on ? min.color+'08' : 'rgba(255,255,255,0.012)'}}>
                    {/* Header fiche */}
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.45rem'}}>
                      <span style={{fontSize:'1.4rem'}}>{min.emoji||'👤'}</span>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:FONT,fontSize:'0.52rem',color:min.color+'EE',letterSpacing:'0.08em'}}>{min.name}</div>
                        <div style={{fontSize:'0.38rem',color:'rgba(140,160,200,0.45)',marginTop:'0.08rem'}}>{min.sign||''}</div>
                      </div>
                      {/* Toggle actif */}
                      <button style={{...BTN_S,fontSize:'0.38rem',padding:'0.12rem 0.42rem',
                        ...(on?{borderColor:min.color+'55',color:min.color+'CC',background:min.color+'10'}:{})}}
                        onClick={e=>{e.stopPropagation();toggleMinster(key);}}>
                        {on?'● ACTIF':'○ INACTIF'}
                      </button>
                      {min.sign==='Custom'&&(
                        <button style={{background:'none',border:'none',cursor:'pointer',
                          color:'rgba(200,80,80,0.55)',fontSize:'0.70rem',padding:'0 0.2rem',lineHeight:1}}
                          onClick={()=>{delMinister(key);setOpenMin(null);}}>✕</button>
                      )}
                    </div>
                    {/* Identity row */}
                    <div style={{display:'flex',alignItems:'center',gap:'0.38rem',marginBottom:'0.38rem'}}>
                      <input style={{...INPUT,width:'1.95rem',textAlign:'center',fontSize:'1rem',padding:'0.15rem',flexShrink:0}}
                        value={min.emoji||''} onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],emoji:e.target.value}}}))}/>
                      <input style={{...INPUT,flex:1,fontSize:'0.50rem'}}
                        value={min.name||''} onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],name:e.target.value}}}))}/>
                      <input type="color" value={min.color||'#8090C0'}
                        style={{width:'1.9rem',height:'1.8rem',border:'none',background:'none',cursor:'pointer',flexShrink:0}}
                        onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],color:e.target.value}}}))}/>
                    </div>
                    <div style={S.label}>ESSENCE</div>
                    <textarea style={{...INPUT,minHeight:'44px',resize:'vertical',lineHeight:1.5,fontFamily:FONT,marginBottom:'0.28rem'}}
                      value={min.essence||''} onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],essence:e.target.value}}}))}/>
                    <div style={S.label}>STYLE DE COMMUNICATION</div>
                    <textarea style={{...INPUT,minHeight:'30px',resize:'vertical',lineHeight:1.5,fontFamily:FONT,marginBottom:'0.28rem'}}
                      value={min.comm||''} onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],comm:e.target.value}}}))}/>
                    <div style={{...S.label,display:'flex',alignItems:'center',gap:'0.4rem',flexWrap:'wrap'}}>
                      ANGLE D'ANNOTATION
                      <span style={{fontFamily:FONT,fontSize:'0.36rem',color:'rgba(140,160,200,0.28)',fontWeight:'normal',letterSpacing:'0'}}>— question posée lors des annotations inter-ministérielles</span>
                    </div>
                    <textarea style={{...INPUT,minHeight:'30px',resize:'vertical',lineHeight:1.5,fontFamily:FONT}}
                      value={min.annotation||''} onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],annotation:e.target.value}}}))}/>
                  </section>
                );
              })()}

              {/* ── Nouveau ministre ────────────────────────────── */}
              {showNewMin ? (
                <section style={{...S.sec,border:'1px solid rgba(100,200,120,0.22)',borderRadius:'2px',padding:'0.7rem'}}>
                  <h3 style={{...S.secTitle,color:'rgba(100,200,120,0.65)'}}>+ NOUVEAU MINISTRE</h3>
                  <div style={{display:'grid',gridTemplateColumns:'auto 1fr 1fr auto',gap:'0.38rem',marginBottom:'0.32rem',alignItems:'center'}}>
                    <input style={{...INPUT,width:'1.9rem',textAlign:'center',fontSize:'1rem',padding:'0.15rem'}} value={nMinD.emoji} onChange={e=>setNMinD(d=>({...d,emoji:e.target.value}))} placeholder="🌟"/>
                    <input style={INPUT} value={nMinD.name} onChange={e=>setNMinD(d=>({...d,name:e.target.value}))} placeholder="Nom du ministre"/>
                    <input style={INPUT} value={nMinD.id}   onChange={e=>setNMinD(d=>({...d,id:e.target.value}))} placeholder="id_unique"/>
                    <input type="color" value={nMinD.color} style={{width:'1.9rem',height:'1.8rem',border:'none',background:'none',cursor:'pointer'}} onChange={e=>setNMinD(d=>({...d,color:e.target.value}))}/>
                  </div>
                  <textarea style={{...INPUT,minHeight:'34px',resize:'vertical',lineHeight:1.5,fontFamily:FONT,marginBottom:'0.28rem'}} value={nMinD.essence} onChange={e=>setNMinD(d=>({...d,essence:e.target.value}))} placeholder="Essence — rôle et vision…"/>
                  <textarea style={{...INPUT,minHeight:'26px',resize:'vertical',lineHeight:1.5,fontFamily:FONT,marginBottom:'0.28rem'}} value={nMinD.comm} onChange={e=>setNMinD(d=>({...d,comm:e.target.value}))} placeholder="Style de communication…"/>
                  <div style={{...S.label,marginBottom:'0.12rem'}}>ANGLE D'ANNOTATION <span style={{fontWeight:'normal',color:'rgba(90,110,150,0.35)'}}>— question posée lors des annotations inter-ministérielles</span></div>
                  <textarea style={{...INPUT,minHeight:'26px',resize:'vertical',lineHeight:1.5,fontFamily:FONT,marginBottom:'0.38rem'}} value={nMinD.annotation} onChange={e=>setNMinD(d=>({...d,annotation:e.target.value}))} placeholder="Ex : Quelle est la position du ministre sur…"/>
                  <div style={{display:'flex',gap:'0.38rem',justifyContent:'flex-end'}}>
                    <button style={BTN_S} onClick={()=>setShowNewMin(false)}>Annuler</button>
                    <button style={{...BTN_P,opacity:nMinD.name&&nMinD.id?1:0.35}} disabled={!nMinD.name||!nMinD.id} onClick={addMinister}>Créer →</button>
                  </div>
                </section>
              ) : (
                <button style={{...BTN_S,alignSelf:'center',color:'rgba(100,200,120,0.55)',borderColor:'rgba(100,200,120,0.22)'}} onClick={()=>setShowNewMin(true)}>+ Nouveau ministre</button>
              )}
            </>)}

          </>)}
        </div>

        {/* Footer */}
        <div style={STYLES.footer}>
          <button style={STYLES.cancelBtn} onClick={onClose}>Annuler</button>
          <button style={STYLES.saveBtn} onClick={handleSave}>✓ Appliquer la Constitution</button>
        </div>

      </div>
    </div>
  );
}

const STYLES = {
  overlay:{ position:'fixed',inset:0,zIndex:9000,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(3px)' },
  modal:{ width:'560px',maxWidth:'96vw',maxHeight:'90vh',background:'#0D1117',border:'1px solid rgba(200,164,74,0.22)',borderRadius:'2px',display:'flex',flexDirection:'column',fontFamily:FONT,overflow:'hidden' },
  header:{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.68rem 1rem',borderBottom:'1px solid rgba(200,164,74,0.14)',background:'rgba(200,164,74,0.04)' },
  headerTitle:{ fontSize:'0.60rem',letterSpacing:'0.18em',color:'rgba(200,164,74,0.85)',textTransform:'uppercase' },
  closeBtn:{ background:'none',border:'none',cursor:'pointer',color:'rgba(200,164,74,0.40)',fontSize:'0.80rem',lineHeight:1,padding:'0.1rem 0.3rem' },
  body:{ overflowY:'auto',flex:1,padding:'0.80rem 1rem',display:'flex',flexDirection:'column',gap:'1.1rem' },
  sec:{ display:'flex',flexDirection:'column',gap:'0.42rem' },
  secTitle:{ fontSize:'0.50rem',letterSpacing:'0.20em',color:'rgba(200,164,74,0.55)',margin:0,textTransform:'uppercase',display:'flex',alignItems:'center',gap:'0.5rem' },
  label:{ fontFamily:FONT,fontSize:'0.42rem',color:'rgba(140,160,200,0.45)' },
  badge:{ fontSize:'0.46rem',padding:'0.10rem 0.38rem',background:'rgba(200,164,74,0.10)',border:'1px solid rgba(200,164,74,0.20)',borderRadius:'10px',color:'rgba(200,164,74,0.70)' },
  hint:{ fontSize:'0.47rem',color:'rgba(140,160,200,0.42)',margin:0,lineHeight:1.55 },
  warn:{ fontFamily:FONT,fontSize:'0.47rem',color:'rgba(200,100,60,0.62)',padding:'0.38rem 0.5rem',border:'1px solid rgba(200,100,60,0.20)',borderRadius:'2px',background:'rgba(200,100,60,0.05)' },
  presCard:{ display:'flex',alignItems:'center',gap:'0.55rem',padding:'0.52rem 0.68rem',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'2px',cursor:'pointer',width:'100%',textAlign:'left',transition:'all 0.15s' },
  presCardOn:{ background:'rgba(200,164,74,0.07)',border:'1px solid rgba(200,164,74,0.36)' },
  minCard:{ display:'flex',alignItems:'center',gap:'0.60rem',padding:'0.40rem 0.62rem',border:'1px solid transparent',borderRadius:'2px',cursor:'pointer',transition:'all 0.15s',background:'none',textAlign:'left',width:'100%' },
  minOff:{ background:'rgba(255,255,255,0.012)',border:'1px solid rgba(255,255,255,0.04)',opacity:0.48 },
  footer:{ display:'flex',justifyContent:'flex-end',gap:'0.6rem',padding:'0.68rem 1rem',borderTop:'1px solid rgba(200,164,74,0.12)',background:'rgba(0,0,0,0.22)' },
  cancelBtn:{ background:'none',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(200,215,240,0.50)',fontFamily:FONT,fontSize:'0.52rem',letterSpacing:'0.12em',padding:'0.42rem 1rem',borderRadius:'2px',cursor:'pointer' },
  saveBtn:{ background:'rgba(200,164,74,0.10)',border:'1px solid rgba(200,164,74,0.42)',color:'rgba(200,164,74,0.90)',fontFamily:FONT,fontSize:'0.52rem',letterSpacing:'0.12em',padding:'0.42rem 1.2rem',borderRadius:'2px',cursor:'pointer' },
};
