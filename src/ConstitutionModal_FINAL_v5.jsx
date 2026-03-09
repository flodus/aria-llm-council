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
  const [openMin,         setOpenMin]         = useState(null); // set to first key once agents load
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
              <section style={S.sec}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <h3 style={S.secTitle}>
                    ACTIFS <span style={S.badge}>{activeMins.length}/{agents.ministries.length}</span>
                  </h3>
                  <button style={{...BTN_S,fontSize:'0.44rem',padding:'0.16rem 0.4rem'}}
                    onClick={()=>setActiveMins(agents.ministries.map(m=>m.id))}>Tous</button>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'0.26rem'}}>
                  {agents.ministries.map(m=>{
                    const on=activeMins.includes(m.id);
                    const isBase=BASE_IDS.includes(m.id);
                    return (
                      <div key={m.id} style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
                        <button style={{...S.minCard,flex:1,...(on?{background:`${m.color}12`,border:`1px solid ${m.color}44`}:S.minOff)}}
                          onClick={()=>toggleMin(m.id)}>
                          <span style={{fontSize:'0.88rem',minWidth:'1.2rem'}}>{m.emoji}</span>
                          <span style={{flex:1,fontSize:'0.52rem',letterSpacing:'0.06em',color:on?'rgba(220,228,240,0.90)':'rgba(160,180,210,0.42)'}}>{m.name}</span>
                          <span style={{fontSize:'0.54rem',color:on?(m.color||GOLD):'rgba(140,160,200,0.18)'}}>{on?'●':'○'}</span>
                        </button>
                        {!isBase && <button style={{background:'none',border:'none',cursor:'pointer',color:'rgba(200,80,80,0.35)',fontSize:'0.72rem',lineHeight:1,padding:0}} onClick={()=>delMinistry(m.id)}>✕</button>}
                      </div>
                    );
                  })}
                </div>
              </section>

              {agents.ministries.map((m,mi)=>(
                <section key={m.id} style={{...S.sec,opacity:activeMins.includes(m.id)?1:0.38}}>
                  <h3 style={{...S.secTitle,color:m.color+'AA'}}>{m.emoji} {m.name.toUpperCase()}</h3>
                  <div style={S.label}>MISSION</div>
                  <textarea style={{...INPUT,minHeight:'34px',resize:'vertical',lineHeight:1.5,fontFamily:FONT}}
                    value={m.mission||''}
                    onChange={e=>setAgents(a=>({...a,ministries:a.ministries.map((x,i)=>i===mi?{...x,mission:e.target.value}:x)}))} />
                  <div style={{...S.label,marginTop:'0.3rem'}}>MINISTRES ASSIGNÉS</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'0.22rem'}}>
                    {(m.ministers||[]).map(mk => {
                      const min = agents.ministers[mk];
                      if (!min) return null;
                      return (
                        <span key={mk} style={{fontFamily:FONT,fontSize:'0.43rem',padding:'0.12rem 0.38rem',
                          borderRadius:'2px',border:`1px solid ${min.color+'44'}`,
                          color:min.color+'CC',background:min.color+'10'}}>
                          {min.emoji} {min.name}
                        </span>
                      );
                    })}
                  </div>
                </section>
              ))}

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
              <section style={S.sec}>
                <h3 style={S.secTitle}>{Object.keys(agents.ministers).length} MINISTRES</h3>
                <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'0.2rem'}}>
                  <button style={{...BTN_S,fontSize:'0.40rem',padding:'0.14rem 0.38rem'}} onClick={()=>setActiveMinsters(null)}>Tous actifs</button>
                </div>
                {/* Chips toggle actif/inactif */}
                <div style={{display:'flex',flexWrap:'wrap',gap:'0.26rem'}}>
                  {Object.entries(agents.ministers).map(([key,min])=>{
                    const on = activeMinsters===null || activeMinsters.includes(key);
                    return (
                      <div key={key} style={{display:'flex',alignItems:'center',gap:'0.28rem',
                        padding:'0.22rem 0.48rem',borderRadius:'2px',cursor:'pointer',
                        background:on?min.color+'12':'rgba(255,255,255,0.02)',
                        border:`1px solid ${on?min.color+'44':'rgba(255,255,255,0.05)'}`,
                        opacity:on?1:0.42}}
                        onClick={()=>toggleMinster(key)}>
                        <span>{min.emoji}</span>
                        <span style={{fontFamily:FONT,fontSize:'0.46rem',color:on?min.color+'CC':'rgba(140,160,200,0.38)'}}>{min.name}</span>
                        {min.sign==='Custom'&&<button style={{background:'none',border:'none',cursor:'pointer',color:'rgba(200,80,80,0.35)',fontSize:'0.64rem',padding:0,lineHeight:1}} onClick={e=>{e.stopPropagation();delMinister(key);}}>✕</button>}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Accordéons par ministre */}
              {Object.entries(agents.ministers).map(([key,min])=>{
                const isOpen = openMin === key;
                const on = activeMinsters===null || activeMinsters.includes(key);
                return (
                  <div key={key} style={{borderRadius:'2px',overflow:'hidden',opacity:on?1:0.52,
                    border:`1px solid ${isOpen?min.color+'55':'rgba(255,255,255,0.07)'}`}}>
                    {/* Header cliquable */}
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',
                      padding:'0.42rem 0.65rem',cursor:'pointer',
                      background:isOpen?min.color+'12':'rgba(255,255,255,0.018)'}}
                      onClick={()=>setOpenMin(p=>p===key?null:key)}>
                      <span style={{fontSize:'0.95rem',flexShrink:0}}>{min.emoji}</span>
                      <span style={{fontFamily:FONT,fontSize:'0.46rem',flex:1,
                        color:isOpen?min.color+'EE':'rgba(200,215,240,0.70)'}}>{min.name}</span>
                      {min.sign==='Custom'&&(
                        <button style={{background:'none',border:'none',cursor:'pointer',
                          color:'rgba(200,80,80,0.45)',fontSize:'0.62rem',padding:'0 0.2rem',lineHeight:1}}
                          onClick={e=>{e.stopPropagation();delMinister(key);}}>✕</button>
                      )}
                      <span style={{fontFamily:FONT,fontSize:'0.44rem',
                        color:min.color+'66',flexShrink:0}}>{isOpen?'▲':'▼'}</span>
                    </div>
                    {/* Corps accordéon */}
                    {isOpen&&(
                      <div style={{padding:'0.55rem 0.65rem',
                        borderTop:`1px solid ${min.color+'22'}`,
                        display:'flex',flexDirection:'column',gap:'0.32rem'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'0.38rem',marginBottom:'0.1rem'}}>
                          <input style={{...INPUT,width:'1.95rem',textAlign:'center',fontSize:'1rem',padding:'0.15rem',flexShrink:0}}
                            value={min.emoji} onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],emoji:e.target.value}}}))}/>
                          <input style={{...INPUT,flex:1,fontSize:'0.50rem'}}
                            value={min.name} onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],name:e.target.value}}}))}/>
                          <input type="color" value={min.color}
                            style={{width:'1.9rem',height:'1.8rem',border:'none',background:'none',cursor:'pointer',flexShrink:0}}
                            onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],color:e.target.value}}}))}/>
                        </div>
                        <div style={S.label}>ESSENCE</div>
                        <textarea style={{...INPUT,minHeight:'34px',resize:'vertical',lineHeight:1.5,fontFamily:FONT}}
                          value={min.essence||''} onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],essence:e.target.value}}}))}/>
                        <div style={S.label}>STYLE DE COMMUNICATION</div>
                        <textarea style={{...INPUT,minHeight:'26px',resize:'vertical',lineHeight:1.5,fontFamily:FONT}}
                          value={min.comm||''} onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],comm:e.target.value}}}))}/>
                        <div style={{...S.label,display:'flex',alignItems:'center',gap:'0.4rem',flexWrap:'wrap'}}>
                          ANGLE D'ANNOTATION
                          <span style={{fontFamily:FONT,fontSize:'0.36rem',color:'rgba(140,160,200,0.28)',fontWeight:'normal',letterSpacing:'0'}}>— question posée lors des annotations inter-ministérielles</span>
                        </div>
                        <textarea style={{...INPUT,minHeight:'30px',resize:'vertical',lineHeight:1.5,fontFamily:FONT}}
                          value={min.annotation||''} onChange={e=>setAgents(a=>({...a,ministers:{...a.ministers,[key]:{...a.ministers[key],annotation:e.target.value}}}))}/>
                      </div>
                    )}
                  </div>
                );
              })}

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
                  <textarea style={{...INPUT,minHeight:'26px',resize:'vertical',lineHeight:1.5,fontFamily:FONT,marginBottom:'0.38rem'}} value={nMinD.comm} onChange={e=>setNMinD(d=>({...d,comm:e.target.value}))} placeholder="Style de communication…"/>
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
