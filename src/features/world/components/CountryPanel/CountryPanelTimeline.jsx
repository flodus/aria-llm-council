// src/features/world/components/CountryPanel/CountryPanelTimeline.jsx

// ═══════════════════════════════════════════════════════════════════════════
//  CountryPanelTimeline.jsx — Historique pays (panel droit)
//
//  Lit aria_chronolog_cycles (filtré par countryId) + aria_session_alliances
//  Affiche : diplomatie active · cycles avec votes/sécessions/amendements/stats
//  Accordéons sur les cycles anciens si > seuil (3 détail / 5 résumés)
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { FONT, C } from '../../../../shared/theme';
import { loadLang } from '../../../../ariaI18n';

const LS_CYCLES    = 'aria_chronolog_cycles';
const LS_ALLIANCES = 'aria_session_alliances';
const LS_COUNTRIES = 'aria_session_countries';

// ── Lecture données ───────────────────────────────────────────────────────────

function loadCyclesForCountry(countryId) {
  let rawCycles = [];
  try { rawCycles = JSON.parse(localStorage.getItem(LS_CYCLES) || '[]'); } catch { rawCycles = []; }

  const result = [];
  for (const cycle of rawCycles) {
    const evs = [];
    for (const ev of cycle.events) {
      if (ev.type === 'cycle_stats') {
        const stat = ev.snapshot?.find(s => s.countryId === countryId);
        if (stat && (stat.satDelta !== 0 || stat.ariaDelta !== 0)) {
          evs.push({ ...ev, _myStat: stat });
        }
      } else if (ev.countryId === countryId) {
        evs.push(ev);
      }
    }
    if (evs.length > 0) result.push({ ...cycle, events: evs });
  }
  return result;
}

function loadDiplomacy(countryId) {
  let alliances = [];
  let countries = [];
  try { alliances = JSON.parse(localStorage.getItem(LS_ALLIANCES) || '[]'); } catch {}
  try { countries = JSON.parse(localStorage.getItem(LS_COUNTRIES) || '[]'); } catch {}

  return alliances
    .filter(a => (a.a === countryId || a.b === countryId) && a.type !== 'Neutre')
    .map(a => {
      const pid     = a.a === countryId ? a.b : a.a;
      const partner = countries.find(c => c.id === pid);
      return { pid, nom: partner?.nom || pid, emoji: partner?.emoji || '🌍', type: a.type };
    });
}

// ── Relation diplomatique ─────────────────────────────────────────────────────

function DiplomacyRow({ rel }) {
  const color = rel.type === 'Alliance' ? C.green : C.red;
  const icon  = rel.type === 'Alliance' ? '🤝' : '⚔️';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.16rem 0' }}>
      <span style={{ fontSize:'0.72rem' }}>{rel.emoji}</span>
      <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:C.muted, flex:1 }}>{rel.nom}</span>
      <span style={{ fontFamily:FONT.mono, fontSize:'0.35rem', color, letterSpacing:'0.07em' }}>{icon} {rel.type}</span>
    </div>
  );
}

// ── Ligne événement ───────────────────────────────────────────────────────────

function EventRow({ ev }) {
  const isEn = loadLang() === 'en';

  if (ev.type === 'vote') {
    const pos = ev.vote === 'oui';
    return (
      <div style={{ padding:'0.22rem 0', borderBottom:`1px solid ${C.border}22` }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', flexWrap:'wrap' }}>
          <span style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color: pos ? C.green : C.red }}>
            🗳 {pos ? (isEn?'YES':'OUI') : (isEn?'NO':'NON')}
          </span>
          {ev.isCrisis && (
            <span style={{ fontFamily:FONT.mono, fontSize:'0.32rem', color:'rgba(255,140,0,0.85)',
              border:'1px solid rgba(255,140,0,0.30)', borderRadius:'2px',
              padding:'0.04rem 0.22rem', letterSpacing:'0.08em' }}>
              {isEn?'CRISIS':'CRISE'}
            </span>
          )}
          {ev.impacts?.satisfaction !== 0 && (
            <span style={{ fontFamily:FONT.mono, fontSize:'0.34rem', color:C.dimmed, marginLeft:'auto' }}>
              {ev.impacts.satisfaction > 0 ? '+' : ''}{Math.round(ev.impacts.satisfaction)} SAT
            </span>
          )}
        </div>
        {ev.question && (
          <p style={{ fontFamily:FONT.mono, fontSize:'0.39rem', color:C.muted,
            margin:'0.10rem 0 0 0.5rem', lineHeight:1.5 }}>
            {ev.question}
          </p>
        )}
      </div>
    );
  }

  if (ev.type === 'cycle_stats') {
    const s = ev._myStat;
    return (
      <div style={{ display:'flex', gap:'0.5rem', padding:'0.16rem 0', opacity:0.60 }}>
        <span style={{ fontFamily:FONT.mono, fontSize:'0.36rem', color:C.dimmed }}>📊</span>
        <span style={{ fontFamily:FONT.mono, fontSize:'0.36rem', color:C.dimmed }}>
          SAT {s.satDelta > 0 ? '+' : ''}{s.satDelta} · ARIA {s.ariaDelta > 0 ? '+' : ''}{s.ariaDelta}
        </span>
      </div>
    );
  }

  if (ev.type === 'secession') {
    return (
      <div style={{ padding:'0.20rem 0' }}>
        <span style={{ fontFamily:FONT.mono, fontSize:'0.39rem', color:C.red }}>
          ✂️ {ev.childNom} {isEn ? 'secedes' : 'fait sécession'} — {ev.relation}
        </span>
      </div>
    );
  }

  if (ev.type === 'constitution') {
    const detail = ev.regimeAvant !== ev.regimeApres
      ? ` — ${(ev.regimeApres || '').replace(/_/g,' ')}`
      : '';
    return (
      <div style={{ padding:'0.20rem 0' }}>
        <span style={{ fontFamily:FONT.mono, fontSize:'0.39rem', color:C.purple }}>
          📜 {isEn ? 'Amendment' : 'Amendement'}{detail}
        </span>
      </div>
    );
  }

  if (ev.type === 'new_country') {
    return (
      <div style={{ padding:'0.20rem 0' }}>
        <span style={{ fontFamily:FONT.mono, fontSize:'0.39rem', color:C.green }}>
          🌍 {isEn ? 'New nation' : 'Nouveau pays'} : {ev.nom || ev.countryNom}
        </span>
      </div>
    );
  }

  return null;
}

// ── Bloc cycle ────────────────────────────────────────────────────────────────

function CycleItem({ cycle, defaultOpen, isEn }) {
  const [open, setOpen] = useState(defaultOpen);
  const myStat = cycle.events.find(e => e.type === 'cycle_stats')?._myStat;
  const voteCount = cycle.events.filter(e => e.type === 'vote').length;

  return (
    <div style={{ borderBottom:`1px solid ${C.border}22`, marginBottom:'0.20rem' }}>
      <div
        style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.28rem 0', cursor:'pointer' }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ fontFamily:FONT.cinzel, fontSize:'0.43rem', letterSpacing:'0.12em', color:C.goldDim, flex:1 }}>
          {isEn?'Cycle':'Cycle'} {cycle.cycleNum} — {isEn?'Year':'An'} {cycle.annee}
        </span>
        {voteCount > 0 && (
          <span style={{ fontFamily:FONT.mono, fontSize:'0.34rem', color:C.dimmed }}>
            {voteCount} 🗳
          </span>
        )}
        {myStat && (myStat.satDelta !== 0 || myStat.ariaDelta !== 0) && (
          <span style={{ fontFamily:FONT.mono, fontSize:'0.34rem',
            color: myStat.satDelta >= 0 ? C.green : C.red }}>
            {myStat.satDelta > 0 ? '+' : ''}{myStat.satDelta}
          </span>
        )}
        <span style={{ color:C.dimmed, fontSize:'0.38rem', flexShrink:0,
          transform: open ? 'rotate(90deg)' : 'none', transition:'transform 0.12s' }}>▶</span>
      </div>
      {open && (
        <div style={{ paddingLeft:'0.4rem', paddingBottom:'0.3rem' }}>
          {cycle.events.map((ev, i) => <EventRow key={i} ev={ev} />)}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function TimelineView({ country, lang }) {
  const [cycles,    setCycles]    = useState([]);
  const [diplomacy, setDiplomacy] = useState([]);
  const isEn = lang === 'en';

  useEffect(() => {
    setCycles(loadCyclesForCountry(country.id));
    setDiplomacy(loadDiplomacy(country.id));
    const id = setInterval(() => {
      setCycles(loadCyclesForCountry(country.id));
      setDiplomacy(loadDiplomacy(country.id));
    }, 2000);
    return () => clearInterval(id);
  }, [country.id]);

  if (cycles.length === 0 && diplomacy.length === 0) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        flex:1, padding:'2rem', textAlign:'center', gap:'0.5rem' }}>
        <div style={{ fontSize:'2rem', opacity:0.15 }}>📜</div>
        <div style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:C.dimmed, letterSpacing:'0.16em' }}>
          {isEn ? 'NO HISTORY YET' : 'AUCUN HISTORIQUE'}
        </div>
        <p style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(100,120,160,0.4)',
          maxWidth:'220px', lineHeight:1.6, margin:0 }}>
          {isEn
            ? 'Events appear here as the world evolves.'
            : 'Les événements apparaissent ici au fil du monde.'}
        </p>
      </div>
    );
  }

  // Seuil : 3 si cycles détaillés présents, 5 si tout en résumé
  const hasDetail     = cycles.some(c => !c._summary);
  const threshold     = hasDetail ? 3 : 5;
  const useAccordions = cycles.length > threshold;

  return (
    <div className="side-panel-scroll">
      <div style={{ padding:'0.55rem 0.75rem', display:'flex', flexDirection:'column', gap:'0.55rem' }}>

        {/* Relations diplomatiques actives */}
        {diplomacy.length > 0 && (
          <div>
            <div style={{ fontFamily:FONT.mono, fontSize:'0.35rem', letterSpacing:'0.15em',
              color:C.dimmed, marginBottom:'0.25rem' }}>
              {isEn ? 'DIPLOMACY' : 'DIPLOMATIE'}
            </div>
            {diplomacy.map(rel => <DiplomacyRow key={rel.pid} rel={rel} />)}
          </div>
        )}

        {/* Historique cycles */}
        {cycles.length > 0 && (
          <div>
            <div style={{ fontFamily:FONT.mono, fontSize:'0.35rem', letterSpacing:'0.15em',
              color:C.dimmed, marginBottom:'0.28rem' }}>
              {isEn ? 'HISTORY' : 'HISTORIQUE'}
            </div>
            {cycles.map((cycle, i) => (
              <CycleItem
                key={cycle.cycleNum}
                cycle={cycle}
                defaultOpen={!useAccordions || i === 0}
                isEn={isEn}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
