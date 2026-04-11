// src/features/chronolog/ChronologView.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  ChronologView.jsx  —  Journal du monde ARIA
//  Vue 🌐 MONDE / 🗺 PAR PAYS
//  Accordéons Cycle → (groupe pays) → Événement → Détails
// ═══════════════════════════════════════════════════════════════════════════

import { loadLang, t, useLocale } from '../../ariaI18n';
import { useState, useEffect } from 'react';
import { C, FONT } from '../../shared/theme';


const TYPE_META = {
  vote:         { icon: '🗳',  label: 'Vote',          color: C.gold   },
  secession:    { icon: '✂️',  get label() { return t('CHRON_SECESSION', loadLang()); }, color: C.red },
  constitution: { icon: '📜',  label: 'Constitution',  color: C.purple },
  new_country:  { icon: '🌍',  label: 'Nouveau pays',  color: C.green  },
  cycle_stats:  { icon: '📊',  get label() { return loadLang()==='en'?'Cycle stats':'Stats cycle'; },   color: C.teal   },
};

const LS_KEY = 'aria_chronolog_cycles';
function loadCycles() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

// ── Résumé narratif d'un cycle (calculé à la volée) ──────────────────────────
function cycleSummaryLine(events, lang) {
  const isEn = lang === 'en';
  const counts = { vote: 0, secession: 0, constitution: 0, new_country: 0 };
  for (const ev of events) {
    if (ev.type in counts) counts[ev.type]++;
  }

  // Deltas : priorité cycle_stats (net cycle), sinon somme des vote.impacts (cycle live)
  let satDelta = 0, ariaDelta = 0;
  const statsEv = events.find(e => e.type === 'cycle_stats');
  if (statsEv?.snapshot?.length) {
    satDelta  = statsEv.snapshot.reduce((s, c) => s + (c.satDelta  || 0), 0);
    ariaDelta = statsEv.snapshot.reduce((s, c) => s + (c.ariaDelta || 0), 0);
  } else {
    for (const ev of events) {
      if (ev.type === 'vote') {
        satDelta  += ev.impacts?.satisfaction || 0;
        ariaDelta += ev.impacts?.aria_delta   || 0;
      }
    }
  }

  const parts = [];
  if (counts.vote > 0)
    parts.push(`${counts.vote} ${isEn ? 'vote' + (counts.vote > 1 ? 's' : '') : 'vote' + (counts.vote > 1 ? 's' : '')}`);
  if (counts.secession > 0)
    parts.push(`${counts.secession} ${isEn ? 'secession' + (counts.secession > 1 ? 's' : '') : 'sécession' + (counts.secession > 1 ? 's' : '')}`);
  if (counts.constitution > 0)
    parts.push(`${counts.constitution} ${isEn ? 'amendment' + (counts.constitution > 1 ? 's' : '') : 'amendement' + (counts.constitution > 1 ? 's' : '')}`);
  if (counts.new_country > 0)
    parts.push(`${counts.new_country} ${isEn ? 'new nation' + (counts.new_country > 1 ? 's' : '') : 'nouvelle' + (counts.new_country > 1 ? 's' : '') + ' nation' + (counts.new_country > 1 ? 's' : '')}`);

  if (parts.length === 0) return null;
  let line = parts.join(' · ');

  const satStr  = satDelta  !== 0 ? ` SAT ${satDelta  > 0 ? '+' : ''}${Math.round(satDelta)}`  : '';
  const ariaStr = ariaDelta !== 0 ? ` ARIA ${ariaDelta > 0 ? '+' : ''}${Math.round(ariaDelta)}` : '';
  if (satStr || ariaStr) line += ` —${satStr}${ariaStr}`;

  return line;
}

// ── Pill delta ────────────────────────────────────────────────────────────────
function Pill({ label, delta }) {
  if (delta === undefined || delta === null || delta === 0) return null;
  const pos = delta > 0;
  return (
    <span style={{
      fontFamily: FONT.mono, fontSize: '0.37rem', letterSpacing: '0.07em',
      padding: '0.10rem 0.35rem', borderRadius: '2px',
      color:      pos ? C.green : C.red,
      border:     `1px solid ${pos ? 'rgba(58,191,122,0.22)' : 'rgba(200,80,80,0.22)'}`,
      background: pos ? 'rgba(58,191,122,0.05)' : 'rgba(200,80,80,0.05)',
      flexShrink: 0,
    }}>
      {label} {pos ? '+' : ''}{Math.round(delta)}
    </span>
  );
}

// ── Rendu détail par type ─────────────────────────────────────────────────────
function EventDetail({ ev, isSummary }) {
  if (ev.type === 'vote') {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', padding:'0.45rem 0.7rem 0.55rem' }}>
      {/* Label du résultat avec couleur selon l'option choisie */}
      {ev.label && (
        <p style={{
          fontFamily: FONT.mono, fontSize:'0.42rem',
          color: ev.chosenOption === 'phare' ? C.gold :
          ev.chosenOption === 'boussole' ? C.purple :
          ev.vote==='oui' ? 'rgba(58,191,122,0.65)' : 'rgba(200,80,80,0.65)',
                    fontStyle:'italic', margin:0, lineHeight:1.6
        }}>
        {ev.chosenOption === 'phare' && '☉ '}
        {ev.chosenOption === 'boussole' && '☽ '}
        « {ev.label} »
        </p>
      )}

      {/* Option choisie détaillée si disponible */}
      {ev.chosenLabel && (
        <p style={{
          fontFamily: FONT.mono, fontSize:'0.40rem',
          color: C.muted, margin:0, lineHeight:1.5, paddingLeft:'0.3rem'
        }}>
        {ev.chosenLabel}
        </p>
      )}

      {/* Résultats du vote */}
      {ev.voteCounts && (
        <div style={{ display:'flex', gap:'0.8rem', marginTop:'0.2rem' }}>
        <span style={{ fontFamily: FONT.mono, fontSize:'0.38rem', color:'rgba(58,191,122,0.50)' }}>
        {loadLang()==='en'?'YES':'OUI'} {Math.round((ev.voteCounts.oui||0)/1000)} k
        </span>
        <span style={{ fontFamily: FONT.mono, fontSize:'0.38rem', color:'rgba(200,80,80,0.50)' }}>
        {loadLang()==='en'?'NO':'NON'} {Math.round((ev.voteCounts.non||0)/1000)} k
        </span>
        </div>
      )}

      {/* Synthèses ministère/présidence */}
      {!isSummary && (ev.syntheseMinistere || ev.synthesePresidence) && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', marginTop:'0.2rem' }}>
        {ev.syntheseMinistere && (
          <div style={{ borderLeft:`2px solid ${C.blue}30`, paddingLeft:'0.55rem' }}>
          <div style={{ fontFamily: FONT.mono, fontSize:'0.36rem', letterSpacing:'0.14em', color:C.blue, marginBottom:'0.15rem' }}>
          {loadLang()==='en'?'MINISTRY':'MINISTÈRE'} — {ev.ministereNom||ev.ministereId}
          </div>
          <p style={{ fontFamily: FONT.mono, fontSize:'0.40rem', color:C.muted, lineHeight:1.65, margin:0 }}>
          {ev.syntheseMinistere}
          </p>
          </div>
        )}
        {ev.synthesePresidence && (
          <div style={{ borderLeft:`2px solid ${C.gold}30`, paddingLeft:'0.55rem' }}>
          <div style={{ fontFamily: FONT.mono, fontSize:'0.36rem', letterSpacing:'0.14em', color:C.goldDim, marginBottom:'0.15rem' }}>
          {t('CHRON_PRESIDENCE', loadLang())}
          </div>
          <p style={{ fontFamily: FONT.mono, fontSize:'0.40rem', color:C.muted, lineHeight:1.65, margin:0 }}>
          {ev.synthesePresidence}
          </p>
          </div>
        )}
        </div>
      )}
      </div>
    );
  }

  if (ev.type === 'secession') {
    return (
      <div style={{ padding:'0.45rem 0.7rem 0.55rem', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
        <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontFamily: FONT.mono, fontSize:'0.40rem', color:C.muted }}>
            {ev.parentEmoji} {ev.parentNom} → {ev.childEmoji} {ev.childNom}
          </span>
          <span style={{ fontFamily: FONT.mono, fontSize:'0.37rem', padding:'0.1rem 0.35rem', borderRadius:'2px',
            color: ev.relation==='Alliance' ? C.green : ev.relation==='Tension' ? C.red : C.muted,
            border:`1px solid ${ev.relation==='Alliance' ? 'rgba(58,191,122,0.25)' : ev.relation==='Tension' ? 'rgba(200,80,80,0.25)' : 'rgba(140,160,200,0.20)'}`,
          }}>{ev.relation}</span>
          {ev.popTransmise && (
            <span style={{ fontFamily: FONT.mono, fontSize:'0.37rem', color:C.dimmed }}>{loadLang()==='en'?`Pop. transferred ~${ev.popTransmise}%`:`Pop. transmise ~${ev.popTransmise}%`}</span>
          )}
        </div>
        {ev.narratif && (
          <p style={{ fontFamily: FONT.mono, fontSize:'0.40rem', color:C.muted, fontStyle:'italic', margin:0, lineHeight:1.6 }}>
            {ev.narratif}
          </p>
        )}
      </div>
    );
  }

  if (ev.type === 'constitution') {
    return (
      <div style={{ padding:'0.45rem 0.7rem 0.55rem', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          {ev.regimeAvant !== ev.regimeApres && (
            <span style={{ fontFamily: FONT.mono, fontSize:'0.38rem', color:C.purple }}>
              {loadLang()==='en'?'Regime':'Régime'} : {ev.regimeAvant} → {ev.regimeApres}
            </span>
          )}
          {ev.presidenceAvant !== ev.presidenceApres && (
            <span style={{ fontFamily: FONT.mono, fontSize:'0.38rem', color:C.purple }}>
              {loadLang()==='en'?'Presidency':'Présidence'} : {ev.presidenceAvant} → {ev.presidenceApres}
            </span>
          )}
          {ev.ministresDiff?.ajoutes?.length > 0 && (
            <span style={{ fontFamily: FONT.mono, fontSize:'0.38rem', color:C.green }}>
              + {ev.ministresDiff.ajoutes.join(', ')}
            </span>
          )}
          {ev.ministresDiff?.retires?.length > 0 && (
            <span style={{ fontFamily: FONT.mono, fontSize:'0.38rem', color:C.red }}>
              − {ev.ministresDiff.retires.join(', ')}
            </span>
          )}
          {ev.promptsModifies > 0 && (
            <span style={{ fontFamily: FONT.mono, fontSize:'0.38rem', color:C.muted }}>
              {ev.promptsModifies} prompt{ev.promptsModifies>1?'s':''} {ev.promptsModifies>1?t('CHRON_MODIFIE_P',loadLang()):t('CHRON_MODIFIE',loadLang())}
            </span>
          )}
        </div>
        {ev.narratif && (
          <p style={{ fontFamily: FONT.mono, fontSize:'0.40rem', color:C.muted, fontStyle:'italic', margin:0, lineHeight:1.6 }}>
            {ev.narratif}
          </p>
        )}
      </div>
    );
  }

  if (ev.type === 'new_country') {
    return (
      <div style={{ padding:'0.45rem 0.7rem 0.55rem' }}>
        <span style={{ fontFamily: FONT.mono, fontSize:'0.40rem', color:C.muted }}>
          {ev.emoji} {ev.nom} · {ev.terrain} · {ev.regime?.replace(/_/g,' ')} · {loadLang()==='en'?'Year':'An'} {ev.annee}
        </span>
      </div>
    );
  }

  if (ev.type === 'cycle_stats') {
    return (
      <div style={{ padding:'0.4rem 0.7rem 0.5rem', display:'flex', flexDirection:'column', gap:'0.3rem' }}>
        {(ev.snapshot||[]).map(s => (
          <div key={s.countryId} style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
            <span style={{ fontFamily: FONT.mono, fontSize:'0.40rem', color:C.muted, minWidth:'6rem' }}>
              {s.emoji} {s.nom}
            </span>
            <span style={{ fontFamily: FONT.mono, fontSize:'0.38rem', color:C.dimmed }}>{loadLang()==='en'?'Sat':'Sat'} {s.satisfaction}%</span>
            <Pill label="SAT"  delta={s.satDelta}  />
            <span style={{ fontFamily: FONT.mono, fontSize:'0.38rem', color:C.dimmed }}>ARIA {s.aria_current}%</span>
            <Pill label="ARIA" delta={s.ariaDelta} />
            <span style={{ fontFamily: FONT.mono, fontSize:'0.38rem', color:C.dimmed }}>
              Pop {s.population >= 1e6 ? (s.population/1e6).toFixed(1)+'M' : (s.population/1e3).toFixed(0)+'k'}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ── Ligne événement ───────────────────────────────────────────────────────────
function EventRow({ ev, isSummary, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const meta = TYPE_META[ev.type] || { icon:'?', label:ev.type, color:C.muted };

  // Résumé inline selon type
  const summary = (() => {
    if (ev.type === 'vote') return ev.question?.slice(0,80) + (ev.question?.length>80?'…':'');
    if (ev.type === 'secession')    return `${ev.parentNom} → ${ev.childNom}`;
    if (ev.type === 'constitution') return `${ev.countryNom} — amendement`;
    if (ev.type === 'new_country')  return `${ev.emoji} ${ev.nom} ${loadLang()==='en'?'founded':'fondée'}`;
    if (ev.type === 'cycle_stats')  return `${(ev.snapshot||[]).length} pays — snapshot`;
    return '';
  })();

  // Stat rapide à droite
  const quickStat = (() => {
    if (ev.type === 'vote') {
      // Si c'est un vote binaire Phare/Boussole
      if (ev.chosenOption === 'phare') {
        return (
          <span style={{ fontFamily: FONT.mono, fontSize:'0.40rem', letterSpacing:'0.12em', fontWeight:700,
            color: C.gold, flexShrink:0 }}>
            ☉ PHARE
            </span>
        );
      }
      if (ev.chosenOption === 'boussole') {
        return (
          <span style={{ fontFamily: FONT.mono, fontSize:'0.40rem', letterSpacing:'0.12em', fontWeight:700,
            color: C.purple, flexShrink:0 }}>
            ☽ BOUSSOLE
            </span>
        );
      }
      // Vote OUI/NON classique
      return (
        <span style={{ fontFamily: FONT.mono, fontSize:'0.40rem', letterSpacing:'0.12em', fontWeight:700,
          color: ev.vote==='oui' ? C.green : C.red, flexShrink:0 }}>
          {ev.vote==='oui' ? 'OUI' : 'NON'}
          </span>
      );
    }
    if (ev.type === 'secession') return (
      <span style={{ fontFamily: FONT.mono, fontSize:'0.38rem', color:
        ev.relation==='Alliance' ? C.green : ev.relation==='Tension' ? C.red : C.muted, flexShrink:0 }}>
        {ev.relation}
        </span>
    );
    return null;
  })();

  const hasDetail = ev.type !== 'new_country';

  return (
    <div style={{ borderBottom:`1px solid rgba(200,164,74,0.06)` }}>
      <div
        style={{ display:'flex', alignItems:'center', gap:'0.45rem', padding:'0.40rem 0.65rem', cursor: hasDetail ? 'pointer' : 'default' }}
        onClick={() => hasDetail && setOpen(o => !o)}
      >
        {/* Icône type */}
        <span style={{ fontSize:'0.75rem', minWidth:'1rem', flexShrink:0 }}>{meta.icon}</span>

        {/* Résumé */}
        <span style={{ fontFamily: FONT.mono, fontSize:'0.41rem', color:C.muted, flex:1,
          overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
          {summary}
        </span>

        {/* Impacts vote */}
        {ev.type === 'vote' && (
          <div style={{ display:'flex', gap:'0.25rem', flexShrink:0 }}>
            <Pill label="SAT"  delta={ev.impacts?.satisfaction} />
            <Pill label="ARIA" delta={ev.impacts?.aria_delta}   />
          </div>
        )}

        {quickStat}

        {hasDetail && (
          <span style={{ color:C.dimmed, fontSize:'0.45rem', flexShrink:0,
            transform: open ? 'rotate(90deg)' : 'none', transition:'transform 0.15s' }}>▶</span>
        )}
      </div>

      {open && hasDetail && <EventDetail ev={ev} isSummary={isSummary} />}
    </div>
  );
}

// ── Bloc pays dans un cycle ───────────────────────────────────────────────────
function CountryBlock({ countryId, countryNom, countryEmoji, events, isSummary, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  // Stats cycle pour ce pays (si présent)
  const statsEv = events.find(e => e.type === 'cycle_stats');
  const myStat  = statsEv?.snapshot?.find(s => s.countryId === countryId);

  return (
    <div style={{ border:`1px solid ${C.border}`, borderRadius:'2px', marginBottom:'0.35rem', overflow:'hidden' }}>
      <div
        style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.38rem 0.6rem',
          cursor:'pointer', background:'rgba(200,164,74,0.025)' }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ fontSize:'0.85rem' }}>{countryEmoji}</span>
        <span style={{ fontFamily: FONT.cinzel, fontSize:'0.46rem', letterSpacing:'0.13em', color:C.gold, flex:1 }}>
          {countryNom}
        </span>
        {myStat && (
          <div style={{ display:'flex', gap:'0.25rem' }}>
            <Pill label="SAT"  delta={myStat.satDelta}  />
            <Pill label="ARIA" delta={myStat.ariaDelta} />
          </div>
        )}
        <span style={{ fontFamily: FONT.mono, fontSize:'0.37rem', color:C.dimmed }}>
          {events.length} év.
        </span>
        <span style={{ color:C.dimmed, fontSize:'0.45rem',
          transform: open ? 'rotate(90deg)' : 'none', transition:'transform 0.15s' }}>▶</span>
      </div>

      {open && (
        <div>
          {events.map((ev, i) => (
            <EventRow key={i} ev={ev} isSummary={isSummary} defaultOpen={events.length===1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bloc cycle ────────────────────────────────────────────────────────────────
function CycleBlock({ cycle, filterCountryId, filterType, defaultOpen, isCurrent }) {
  const lang = loadLang();
  const isEn = lang === 'en';
  const [open, setOpen] = useState(defaultOpen);

  // Grouper les événements par pays
  // cycle_stats → groupe spécial 🌐 Monde OU réparti dans chaque pays
  const groups = {};

  for (const ev of cycle.events) {
    // cycle_stats : toujours inclus (stats techniques, non filtré par type)
    if (ev.type === 'cycle_stats') {
      const key = '__monde__';
      if (!groups[key]) groups[key] = { id: null, nom: 'Monde', emoji: '🌐', events: [] };
      if (!filterCountryId) groups[key].events.push(ev);
      continue;
    }
    // Filtre type
    if (filterType && ev.type !== filterType) continue;
    const cid = ev.countryId || '__monde__';
    if (filterCountryId && cid !== filterCountryId) continue;
    if (!groups[cid]) groups[cid] = { id: cid, nom: ev.countryNom || 'Monde', emoji: ev.countryEmoji || '🌐', events: [] };
    groups[cid].events.push(ev);
  }

  const visibleGroups = Object.values(groups).filter(g => g.events.length > 0);
  if (visibleGroups.length === 0) return null;

  const totalEvs = visibleGroups.reduce((s, g) => s + g.events.length, 0);
  const narratif = cycleSummaryLine(cycle.events, lang);

  return (
    <div style={{ marginBottom:'0.55rem',
      border:`1px solid ${isCurrent ? 'rgba(58,191,122,0.22)' : C.border}`,
      borderRadius:'2px', overflow:'hidden' }}>
      {/* Header cycle */}
      <div
        style={{ display:'flex', alignItems:'center', gap:'0.55rem', padding:'0.50rem 0.75rem',
          cursor:'pointer', background: isCurrent ? 'rgba(58,191,122,0.04)' : 'rgba(200,164,74,0.025)' }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.15rem', minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.45rem' }}>
            {isCurrent && (
              <span style={{ fontFamily: FONT.mono, fontSize:'0.34rem', letterSpacing:'0.14em', color:C.green,
                background:'rgba(58,191,122,0.10)', border:'1px solid rgba(58,191,122,0.28)',
                borderRadius:'2px', padding:'0.08rem 0.32rem', flexShrink:0 }}>EN COURS</span>
            )}
            <span style={{ fontFamily: FONT.cinzel, fontSize:'0.52rem', letterSpacing:'0.18em',
              color: isCurrent ? C.green : C.gold }}>
              CYCLE {cycle.cycleNum} — {isEn?'Year':'An'} {cycle.annee}
            </span>
          </div>
          {narratif && (
            <span style={{ fontFamily: FONT.mono, fontSize:'0.37rem', color:C.dimmed, letterSpacing:'0.04em' }}>
              {narratif}
            </span>
          )}
        </div>
        <span style={{ fontFamily: FONT.mono, fontSize:'0.37rem', color:C.dimmed, flexShrink:0 }}>
          {totalEvs} év. {cycle._summary ? `· ${t('CHRON_RESUME',loadLang())}` : `· ${t('CHRON_COMPLET',loadLang())}`}
        </span>
        <span style={{ color:C.dimmed, fontSize:'0.45rem', flexShrink:0,
          transform: open ? 'rotate(90deg)' : 'none', transition:'transform 0.15s' }}>▶</span>
      </div>

      {open && (
        <div style={{ padding:'0.45rem 0.55rem' }}>
          {visibleGroups.map((g, i) => (
            <CountryBlock
              key={g.id || 'monde'}
              countryId={g.id}
              countryNom={g.nom}
              countryEmoji={g.emoji}
              events={g.events}
              isSummary={cycle._summary}
              defaultOpen={visibleGroups.length === 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function ChronologView({
  countries = [],
  currentCycleNum,
  currentCycleAnnee,
  currentEvents = [],   // événements live du cycle en cours
}) {
  const { lang } = useLocale();
  const isEn = lang === 'en';
  const [view,           setView]           = useState('world');
  const [filterCountry,  setFilterCountry]  = useState(null);
  const [filterType,     setFilterType]     = useState(null);
  const [summaryPage,    setSummaryPage]    = useState(0);
  const [cycles,         setCycles]         = useState([]);
  const SUMMARY_PAGE_SIZE = 3;

  useEffect(() => {
    setCycles(loadCycles());
    const id = setInterval(() => setCycles(loadCycles()), 2000);
    return () => clearInterval(id);
  }, []);

  // Cycle live virtuel
  const liveCycle = currentEvents.length > 0 ? {
    cycleNum:  currentCycleNum,
    annee:     currentCycleAnnee,
    events:    currentEvents,
    _summary:  false,
    _live:     true,
  } : null;

  const persistedCycles = cycles.filter(c => !liveCycle || c.cycleNum !== liveCycle.cycleNum);
  const allCycles = [
    ...(liveCycle ? [liveCycle] : []),
    ...persistedCycles,
  ];

  // Séparer cycles récents (détail complet) et anciens (résumé, paginés)
  const recentCycles  = allCycles.filter(c => !c._summary);
  const summaryCycles = allCycles.filter(c =>  c._summary);
  const summaryTotal  = summaryCycles.length;
  const summaryStart  = summaryPage * SUMMARY_PAGE_SIZE;
  const summarySlice  = summaryCycles.slice(summaryStart, summaryStart + SUMMARY_PAGE_SIZE);

  if (allCycles.length === 0) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:'0.6rem', opacity:0.35 }}>
      <div style={{ fontSize:'2rem' }}>📜</div>
      <div style={{ fontFamily: FONT.mono, fontSize:'0.45rem', letterSpacing:'0.16em', color:C.muted }}>{loadLang()==='en'?'CHRONOLOG EMPTY':'CHRONOLOG VIDE'}</div>
      <p style={{ fontFamily: FONT.mono, fontSize:'0.40rem', color:C.dimmed, textAlign:'center', maxWidth:'240px', lineHeight:1.7 }}>
        Soumettez une question au Conseil et votez pour commencer l'historique.
      </p>
    </div>
  );

  const NavBtn = ({ id, icon, label }) => (
    <button onClick={() => { setView(id); if (id==='world') setFilterCountry(null); }}
      style={{
        background: view===id ? 'rgba(200,164,74,0.09)' : 'transparent',
        border:`1px solid ${view===id ? 'rgba(200,164,74,0.32)' : 'rgba(200,164,74,0.09)'}`,
        borderRadius:'2px', padding:'0.28rem 0.65rem', cursor:'pointer',
        fontFamily: FONT.mono, fontSize:'0.40rem', letterSpacing:'0.12em',
        color: view===id ? C.gold : C.dimmed, transition:'all 0.15s',
      }}>
      {icon} {label}
    </button>
  );

  const totalEvs = allCycles.reduce((s, c) => s + c.events.length, 0);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* Barre nav */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.45rem', padding:'0.45rem 0.7rem',
        borderBottom:`1px solid ${C.border}`, flexShrink:0, flexWrap:'wrap' }}>
        <NavBtn id="world"   icon="🌐" label="MONDE" />
        <NavBtn id="country" icon="🗺" label="PAYS"  />

        {view === 'country' && (
          <select
            style={{ background:'rgba(8,14,26,0.80)', border:`1px solid ${C.border}`, borderRadius:'2px',
              padding:'0.26rem 0.5rem', cursor:'pointer', fontFamily:FONT.mono, fontSize:'0.40rem',
              color: filterCountry ? C.gold : C.dimmed, outline:'none', marginLeft:'0.2rem' }}
            value={filterCountry || ''}
            onChange={e => setFilterCountry(e.target.value || null)}
          >
            <option value="">{t('SELECT_COUNTRY', lang)}</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nom}</option>)}
          </select>
        )}

        {/* Filtre par type d'événement */}
        <select
          style={{ background:'rgba(8,14,26,0.80)', border:`1px solid ${C.border}`, borderRadius:'2px',
            padding:'0.26rem 0.5rem', cursor:'pointer', fontFamily:FONT.mono, fontSize:'0.40rem',
            color: filterType ? C.gold : C.dimmed, outline:'none' }}
          value={filterType || ''}
          onChange={e => { setFilterType(e.target.value || null); setSummaryPage(0); }}
        >
          <option value="">{isEn ? 'All types' : 'Tous types'}</option>
          <option value="vote">🗳 {isEn ? 'Vote' : 'Vote'}</option>
          <option value="secession">✂️ {isEn ? 'Secession' : 'Sécession'}</option>
          <option value="constitution">📜 {isEn ? 'Constitution' : 'Constitution'}</option>
          <option value="new_country">🌍 {isEn ? 'New nation' : 'Nouveau pays'}</option>
        </select>

        <div style={{ marginLeft:'auto', fontFamily: FONT.mono, fontSize:'0.37rem', color:C.dimmed }}>
          {allCycles.length} cycle{allCycles.length>1?'s':''} · {totalEvs} {isEn?'events':'événements'}
        </div>
      </div>

      {/* Liste cycles */}
      <div style={{ flex:1, overflowY:'auto', padding:'0.55rem 0.6rem' }}>

        {/* Cycles récents — détail complet */}
        {recentCycles.map((cycle, i) => (
          <CycleBlock
            key={cycle.cycleNum + (cycle._live ? '-live' : '')}
            cycle={cycle}
            filterCountryId={view === 'country' ? filterCountry : null}
            filterType={filterType}
            defaultOpen={i === 0}
            isCurrent={!!cycle._live}
          />
        ))}

        {/* Cycles anciens — résumés paginés */}
        {summarySlice.map(cycle => (
          <CycleBlock
            key={cycle.cycleNum}
            cycle={cycle}
            filterCountryId={view === 'country' ? filterCountry : null}
            filterType={filterType}
            defaultOpen={false}
            isCurrent={false}
          />
        ))}

        {/* Message si aucun cycle visible après filtres */}
        {recentCycles.length === 0 && summarySlice.length === 0 && allCycles.length > 0 && (
          <div style={{ display:'flex', justifyContent:'center', padding:'1.5rem',
            fontFamily: FONT.mono, fontSize:'0.40rem', color:C.dimmed, opacity:0.5 }}>
            {isEn ? 'No events matching the selected filters.' : 'Aucun événement correspondant aux filtres.'}
          </div>
        )}

        {/* Pagination cycles anciens */}
        {summaryTotal > SUMMARY_PAGE_SIZE && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'0.5rem 0 0.3rem' }}>
            <button
              disabled={summaryPage === 0}
              onClick={() => setSummaryPage(p => p - 1)}
              style={{
                background: summaryPage === 0 ? 'transparent' : 'rgba(200,164,74,0.06)',
                border:`1px solid ${summaryPage === 0 ? 'rgba(200,164,74,0.06)' : 'rgba(200,164,74,0.22)'}`,
                borderRadius:'2px', padding:'0.26rem 0.6rem', cursor: summaryPage === 0 ? 'default' : 'pointer',
                fontFamily: FONT.mono, fontSize:'0.38rem', letterSpacing:'0.08em',
                color: summaryPage === 0 ? C.dimmed : C.gold, opacity: summaryPage === 0 ? 0.35 : 1,
              }}>
              ← {isEn ? 'Previous' : 'Précédent'}
            </button>
            <span style={{ fontFamily: FONT.mono, fontSize:'0.37rem', color:C.dimmed }}>
              {summaryPage + 1} / {Math.ceil(summaryTotal / SUMMARY_PAGE_SIZE)}
            </span>
            <button
              disabled={summaryStart + SUMMARY_PAGE_SIZE >= summaryTotal}
              onClick={() => setSummaryPage(p => p + 1)}
              style={{
                background: summaryStart + SUMMARY_PAGE_SIZE >= summaryTotal ? 'transparent' : 'rgba(200,164,74,0.06)',
                border:`1px solid ${summaryStart + SUMMARY_PAGE_SIZE >= summaryTotal ? 'rgba(200,164,74,0.06)' : 'rgba(200,164,74,0.22)'}`,
                borderRadius:'2px', padding:'0.26rem 0.6rem', cursor: summaryStart + SUMMARY_PAGE_SIZE >= summaryTotal ? 'default' : 'pointer',
                fontFamily: FONT.mono, fontSize:'0.38rem', letterSpacing:'0.08em',
                color: summaryStart + SUMMARY_PAGE_SIZE >= summaryTotal ? C.dimmed : C.gold,
                opacity: summaryStart + SUMMARY_PAGE_SIZE >= summaryTotal ? 0.35 : 1,
              }}>
              {isEn ? 'Next' : 'Suivant'} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
