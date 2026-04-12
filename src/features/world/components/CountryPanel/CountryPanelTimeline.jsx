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
import { loadLang, t } from '../../../../ariaI18n';
import { loadMemoire } from '../../../chronolog/useChroniqueur';
import { EventDetail } from '../../../chronolog/ChronologView';

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
      } else if (ev.countryId === countryId || (ev.type === 'diplomacy' && ev.paysB?.id === countryId)) {
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

// ── Config icônes / couleurs par type ────────────────────────────────────────
const TYPE_STYLE = {
  vote:         { icon: '🗳',  bg: 'rgba(58,191,122,0.06)',  border: 'rgba(58,191,122,0.18)' },
  secession:    { icon: '✂️', bg: 'rgba(200,80,80,0.06)',   border: 'rgba(200,80,80,0.18)'  },
  constitution: { icon: '📜', bg: 'rgba(140,100,220,0.06)', border: 'rgba(140,100,220,0.18)'},
  new_country:  { icon: '🌍', bg: 'rgba(58,191,122,0.06)',  border: 'rgba(58,191,122,0.18)' },
  cycle_stats:  { icon: '📊', bg: 'rgba(90,110,160,0.04)',  border: 'rgba(90,110,160,0.12)' },
  diplomacy:    { icon: '🤝', bg: 'rgba(90,140,220,0.05)',  border: 'rgba(90,140,220,0.15)' },
};

// ── Ligne événement ───────────────────────────────────────────────────────────

function EventRow({ ev, onOpenEvent }) {
  const lang = loadLang();
  const ts = TYPE_STYLE[ev.type] || { icon: '•', bg: 'transparent', border: C.border };
  const clickable = ev.type === 'vote' && !!ev.deliberation;

  if (ev.type === 'vote') {
    const pos = ev.vote === 'oui';
    const voteColor = ev.chosenOption === 'phare' ? C.gold
      : ev.chosenOption === 'boussole' ? C.purple
      : pos ? C.green : C.red;
    const voteLabel = ev.chosenOption === 'phare' ? '☉ PHARE'
      : ev.chosenOption === 'boussole' ? '☽ BOUSSOLE'
      : pos ? t('YES', lang) : t('NO', lang);

    return (
      <div
        onClick={() => clickable && onOpenEvent?.(ev)}
        style={{
          display:'flex', gap:'0.55rem', alignItems:'flex-start',
          padding:'0.45rem 0.55rem', marginBottom:'0.28rem',
          background: ts.bg, border:`1px solid ${ts.border}`, borderRadius:'3px',
          cursor: clickable ? 'pointer' : 'default',
          transition:'background 0.12s',
        }}
      >
        <span style={{ fontSize:'1.3rem', lineHeight:1, flexShrink:0, marginTop:'0.05rem' }}>{ts.icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', flexWrap:'wrap', marginBottom:'0.12rem' }}>
            <span style={{ fontFamily:FONT.mono, fontSize:'0.43rem', fontWeight:700,
              letterSpacing:'0.10em', color: voteColor }}>
              {voteLabel}
            </span>
            {ev.isCrisis && (
              <span style={{ fontFamily:FONT.mono, fontSize:'0.33rem', color:'rgba(255,140,0,0.90)',
                border:'1px solid rgba(255,140,0,0.32)', borderRadius:'2px',
                padding:'0.04rem 0.22rem', letterSpacing:'0.08em' }}>
                {t('TIMELINE_CRISIS', lang)}
              </span>
            )}
            {ev.impacts?.satisfaction !== 0 && ev.impacts?.satisfaction !== undefined && (
              <span style={{ fontFamily:FONT.mono, fontSize:'0.37rem',
                color: ev.impacts.satisfaction > 0 ? C.green : C.red, marginLeft:'auto' }}>
                {ev.impacts.satisfaction > 0 ? '+' : ''}{Math.round(ev.impacts.satisfaction)} SAT
              </span>
            )}
          </div>
          {ev.question && (
            <p style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:C.textDim,
              margin:0, lineHeight:1.55 }}>
              {ev.question}
            </p>
          )}
          {clickable && (
            <div style={{ fontFamily:FONT.mono, fontSize:'0.34rem', color:C.dimmed,
              marginTop:'0.20rem', letterSpacing:'0.08em', opacity:0.70 }}>
              {t('TIMELINE_VIEW_DELIB', lang)}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (ev.type === 'cycle_stats') {
    const s = ev._myStat;
    return (
      <div style={{ display:'flex', gap:'0.50rem', alignItems:'center',
        padding:'0.30rem 0.55rem', marginBottom:'0.18rem',
        background: ts.bg, border:`1px solid ${ts.border}`, borderRadius:'3px', opacity:0.70 }}>
        <span style={{ fontSize:'1.1rem', lineHeight:1, flexShrink:0 }}>{ts.icon}</span>
        <span style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:C.textDim }}>
          SAT {s.satDelta > 0 ? '+' : ''}{s.satDelta} · ARIA {s.ariaDelta > 0 ? '+' : ''}{s.ariaDelta}
        </span>
      </div>
    );
  }

  if (ev.type === 'secession') {
    return (
      <div style={{ display:'flex', gap:'0.55rem', alignItems:'flex-start',
        padding:'0.40rem 0.55rem', marginBottom:'0.28rem',
        background: ts.bg, border:`1px solid ${ts.border}`, borderRadius:'3px' }}>
        <span style={{ fontSize:'1.3rem', lineHeight:1, flexShrink:0 }}>{ts.icon}</span>
        <div>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.43rem', fontWeight:700,
            color: C.red, letterSpacing:'0.08em', marginBottom:'0.08rem' }}>
            {t('TIMELINE_SECESSION', lang)}
          </div>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:C.textDim }}>
            {ev.childNom} — {ev.relation}
          </div>
        </div>
      </div>
    );
  }

  if (ev.type === 'constitution') {
    const detail = ev.regimeAvant !== ev.regimeApres
      ? `${ev.regimeAvant} → ${(ev.regimeApres || '').replace(/_/g,' ')}`
      : '';
    return (
      <div style={{ display:'flex', gap:'0.55rem', alignItems:'flex-start',
        padding:'0.40rem 0.55rem', marginBottom:'0.28rem',
        background: ts.bg, border:`1px solid ${ts.border}`, borderRadius:'3px' }}>
        <span style={{ fontSize:'1.3rem', lineHeight:1, flexShrink:0 }}>{ts.icon}</span>
        <div>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.43rem', fontWeight:700,
            color: C.purple, letterSpacing:'0.08em', marginBottom:'0.08rem' }}>
            {t('TIMELINE_AMENDMENT', lang)}
          </div>
          {detail && (
            <div style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:C.textDim }}>{detail}</div>
          )}
        </div>
      </div>
    );
  }

  if (ev.type === 'new_country') {
    return (
      <div style={{ display:'flex', gap:'0.55rem', alignItems:'flex-start',
        padding:'0.40rem 0.55rem', marginBottom:'0.28rem',
        background: ts.bg, border:`1px solid ${ts.border}`, borderRadius:'3px' }}>
        <span style={{ fontSize:'1.3rem', lineHeight:1, flexShrink:0 }}>{ts.icon}</span>
        <div>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.43rem', fontWeight:700,
            color: C.green, letterSpacing:'0.08em', marginBottom:'0.08rem' }}>
            {t('TIMELINE_NEW_NATION', lang)}
          </div>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:C.textDim }}>
            {ev.nom || ev.countryNom}
          </div>
        </div>
      </div>
    );
  }

  if (ev.type === 'diplomacy') {
    const isSource = ev.countryId === ev.countryId; // toujours vrai, pour clarté
    const partner  = ev.paysB;
    const relColor = ev.relationType === 'Alliance' ? C.green
      : ev.relationType === 'Tension' ? C.red
      : C.muted;
    const relIcon  = ev.relationType === 'Alliance' ? '🤝'
      : ev.relationType === 'Tension' ? '⚔️'
      : '○';
    return (
      <div style={{ display:'flex', gap:'0.55rem', alignItems:'flex-start',
        padding:'0.40rem 0.55rem', marginBottom:'0.28rem',
        background: ts.bg, border:`1px solid ${ts.border}`, borderRadius:'3px' }}>
        <span style={{ fontSize:'1.3rem', lineHeight:1, flexShrink:0 }}>{ts.icon}</span>
        <div>
          <div style={{ fontFamily:FONT.mono, fontSize:'0.43rem', fontWeight:700,
            color: relColor, letterSpacing:'0.08em', marginBottom:'0.08rem' }}>
            {relIcon} {ev.relationType}
          </div>
          {partner && (
            <div style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:C.textDim }}>
              {partner.emoji} {partner.nom}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ── Bloc cycle ────────────────────────────────────────────────────────────────

function CycleItem({ cycle, defaultOpen, isEn, onOpenEvent }) {
  const [open, setOpen] = useState(defaultOpen);
  const myStat = cycle.events.find(e => e.type === 'cycle_stats')?._myStat;
  const voteCount = cycle.events.filter(e => e.type === 'vote').length;

  return (
    <div style={{ marginBottom:'0.35rem' }}>
      <div
        style={{ display:'flex', alignItems:'center', gap:'0.4rem',
          padding:'0.30rem 0.40rem', cursor:'pointer',
          borderBottom:`1px solid ${C.border}` }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ fontFamily:FONT.cinzel, fontSize:'0.46rem', letterSpacing:'0.14em', color:C.goldGlow, flex:1 }}>
          Cycle {cycle.cycleNum} — {t('TIMELINE_YEAR', isEn ? 'en' : 'fr')} {cycle.annee}
        </span>
        {voteCount > 0 && (
          <span style={{ fontFamily:FONT.mono, fontSize:'0.37rem', color:C.textDim }}>
            {voteCount} 🗳
          </span>
        )}
        {myStat && (myStat.satDelta !== 0 || myStat.ariaDelta !== 0) && (
          <span style={{ fontFamily:FONT.mono, fontSize:'0.38rem',
            color: myStat.satDelta >= 0 ? C.green : C.red }}>
            {myStat.satDelta > 0 ? '+' : ''}{myStat.satDelta}
          </span>
        )}
        <span style={{ color:C.dimmed, fontSize:'0.40rem', flexShrink:0,
          transform: open ? 'rotate(90deg)' : 'none', transition:'transform 0.12s' }}>▶</span>
      </div>
      {open && (
        <div style={{ paddingTop:'0.28rem', paddingBottom:'0.10rem' }}>
          {cycle.events.map((ev, i) => <EventRow key={i} ev={ev} onOpenEvent={onOpenEvent} />)}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function TimelineView({ country, lang, onOpenEvent }) {
  const [cycles,    setCycles]    = useState([]);
  const [diplomacy, setDiplomacy] = useState([]);
  const [memoire,   setMemoire]   = useState(null);
  const isEn = lang === 'en';

  useEffect(() => {
    setCycles(loadCyclesForCountry(country.id));
    setDiplomacy(loadDiplomacy(country.id));
    setMemoire(loadMemoire(country.id));
    const id = setInterval(() => {
      setCycles(loadCyclesForCountry(country.id));
      setDiplomacy(loadDiplomacy(country.id));
      setMemoire(loadMemoire(country.id));
    }, 2000);
    return () => clearInterval(id);
  }, [country.id]);

  if (cycles.length === 0 && diplomacy.length === 0) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        flex:1, padding:'2rem', textAlign:'center', gap:'0.5rem' }}>
        <div style={{ fontSize:'2rem', opacity:0.15 }}>📜</div>
        <div style={{ fontFamily:FONT.mono, fontSize:'0.42rem', color:C.dimmed, letterSpacing:'0.16em' }}>
          {t('PANEL_NO_HISTORY', lang)}
        </div>
        <p style={{ fontFamily:FONT.mono, fontSize:'0.40rem', color:'rgba(100,120,160,0.4)',
          maxWidth:'220px', lineHeight:1.6, margin:0 }}>
          {t('TIMELINE_NO_HIST_DESC', lang)}
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

        {/* Mémoire institutionnelle */}
        {memoire?.memoire && (
          <div style={{ padding:'0.55rem 0.70rem',
            background:'rgba(90,110,160,0.05)',
            border:'1px solid rgba(90,110,160,0.14)', borderRadius:'2px' }}>
            <div style={{ fontFamily:FONT.mono, fontSize:'0.35rem', letterSpacing:'0.15em',
              color:C.goldDim, marginBottom:'0.30rem' }}>
              📜 {t('TIMELINE_MEMORY', lang)}
              <span style={{ marginLeft:'0.5rem', color:C.dimmed, fontWeight:'normal',
                letterSpacing:'0.08em' }}>
                — cycle {memoire.cycle}
              </span>
            </div>
            <p style={{ fontFamily:FONT.mono, fontSize:'0.39rem', color:'rgba(180,200,230,0.60)',
              lineHeight:1.65, margin:0, fontStyle:'italic' }}>
              {memoire.memoire}
            </p>
          </div>
        )}

        {/* Relations diplomatiques actives */}
        {diplomacy.length > 0 && (
          <div>
            <div style={{ fontFamily:FONT.mono, fontSize:'0.35rem', letterSpacing:'0.15em',
              color:C.dimmed, marginBottom:'0.25rem' }}>
              {t('TIMELINE_DIPLOMACY', lang)}
            </div>
            {diplomacy.map(rel => <DiplomacyRow key={rel.pid} rel={rel} />)}
          </div>
        )}

        {/* Historique cycles */}
        {cycles.length > 0 && (
          <div>
            <div style={{ fontFamily:FONT.mono, fontSize:'0.35rem', letterSpacing:'0.15em',
              color:C.dimmed, marginBottom:'0.28rem' }}>
              {t('TIMELINE_HISTORY_LBL', lang)}
            </div>
            {cycles.map((cycle, i) => (
              <CycleItem
                key={cycle.cycleNum}
                cycle={cycle}
                defaultOpen={!useAccordions || i === 0}
                isEn={isEn}
                onOpenEvent={onOpenEvent}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
