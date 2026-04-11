// src/features/world/modals/CycleConfirmModal.jsx
import { useLocale } from '../../../ariaI18n';
import { REAL_COUNTRIES_DATA_EN } from '../../../shared/data/ariaData';
import { getStats } from '../../../shared/data/gameData';
import { S } from './modalStyles';

function getLocalizedNom(country) {
  if (!country?.id) return country?.nom || '';
  try {
    const lang = localStorage.getItem('aria_lang') || 'fr';
    if (lang !== 'en') return country?.nom || '';
    const enData = REAL_COUNTRIES_DATA_EN.find(r => r.id === country.id);
    return enData?.nom || country?.nom || '';
  } catch { return country?.nom || ''; }
}

export default function CycleConfirmModal({ countries, councilHistory, onConfirm, onClose }) {
  const { lang: uiLang } = useLocale();
  const MONO  = "'JetBrains Mono', monospace";
  const popForecasts = {}; // réservé — prévisions population par pays (non encore calculées)

  const withCouncil = councilHistory.filter(h => h.vote);
  const councilledIds = new Set(withCouncil.map(h => h.countryId));
  const uncounselled  = countries.filter(c => !councilledIds.has(c.id));
  const isEmpty = withCouncil.length === 0;

  // Projections passives pour tous les pays (doCycle tourne toujours)
  const cycleForecasts = countries.map(c => {
    const regime  = getStats().regimes[c.regime]  || getStats().regimes.republique_federale;
    const terrain = getStats().terrains[c.terrain] || getStats().terrains.inland;
    const natalite  = (c.tauxNatalite  ?? regime.taux_natalite  * 1000) / 1000 * 5;
    const mortalite = (c.tauxMortalite ?? regime.taux_mortalite * 1000) / 1000 * 5;
    const growthMod = terrain.modificateur_pop * regime.coeff_croissance;
    const popDelta  = Math.round(c.population * (natalite - mortalite) * growthMod);
    const ecoBase   = terrain.modificateur_eco * regime.coeff_croissance;
    const ecoRatio  = Object.values(c.ressources || {}).filter(Boolean).length / 7;
    const ecoDelta  = Math.round((ecoBase - 1) * 8 + (ecoRatio - 0.5) * 6);
    const satDrift  = Math.round(-2 * regime.coeff_satisfaction);
    return { id: c.id, nom: c.nom, emoji: c.emoji, popDelta, ecoDelta, satDrift };
  });

  const isSingle = countries.length === 1;
  const caseA = isSingle && isEmpty;
  const caseB = !isSingle && uncounselled.length > 0;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, width: '480px', maxHeight: '85vh', overflowY: 'auto' }}
           onClick={e => e.stopPropagation()}>

        <div style={S.modalHeader}>
          <span style={S.modalTitle}>⏭ CHANGEMENT DE CYCLE</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '0.9rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {caseA && (
            <div style={{
              padding: '0.7rem 0.85rem',
              background: 'rgba(200,120,48,0.07)', border: '1px solid rgba(200,120,48,0.22)',
              borderRadius: '2px',
            }}>
              <div style={{ fontFamily: MONO, fontSize: '0.40rem', letterSpacing: '0.16em', color: 'rgba(200,120,48,0.75)', marginBottom: '0.3rem' }}>
                {uiLang==='en'?'⚠ NO COUNCIL THIS CYCLE':'⚠ AUCUN CONSEIL CE CYCLE'}
              </div>
              <p style={{ fontFamily: MONO, fontSize: '0.50rem', color: 'rgba(200,215,240,0.70)', lineHeight: 1.6, margin: 0 }}>
                {uiLang==='en'?"No question was submitted to the Council. The cycle will advance without any collective decision.":"Aucune question n'a été soumise au Conseil. Le cycle avancera sans qu'aucune décision collective n'ait été prise."}
              </p>
            </div>
          )}

          {caseB && (
            <div style={{
              padding: '0.65rem 0.85rem',
              background: 'rgba(200,120,48,0.06)', border: '1px solid rgba(200,120,48,0.18)',
              borderRadius: '2px',
            }}>
              <div style={{ fontFamily: MONO, fontSize: '0.40rem', letterSpacing: '0.16em', color: 'rgba(200,120,48,0.70)', marginBottom: '0.4rem' }}>
                {uiLang==='en'?'⚠ COUNTRIES WITHOUT DELIBERATION':'⚠ PAYS SANS DÉLIBÉRATION'}
              </div>
              {uncounselled.map(c => (
                <div key={c.id} style={{
                  fontFamily: MONO, fontSize: '0.48rem', color: 'rgba(200,215,240,0.55)',
                  padding: '0.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  <span>{c.emoji}</span>
                  <span style={{ color: 'rgba(200,215,240,0.75)' }}>{getLocalizedNom(c, uiLang)}</span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(140,160,200,0.40)', fontSize: '0.42rem' }}>{uiLang==='en'?'no council this cycle':'aucun conseil ce cycle'}</span>
                </div>
              ))}
            </div>
          )}

          {withCouncil.length > 0 && (
            <div>
              <div style={{ fontFamily: MONO, fontSize: '0.38rem', letterSpacing: '0.18em', color: 'rgba(200,164,74,0.45)', marginBottom: '0.5rem' }}>
                {uiLang==='en'?'DECISIONS THIS CYCLE':'DÉCISIONS PRISES CE CYCLE'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {withCouncil.map((h, i) => {
                  const sat = h.impacts?.satisfaction;
                  const aria = h.impacts?.aria_delta;
                  return (
                  <div key={i} style={{
                    padding: '0.55rem 0.75rem',
                    background: 'rgba(14,20,36,0.55)', border: '1px solid rgba(200,164,74,0.10)',
                    borderRadius: '2px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>{h.countryEmoji}</span>
                      <span style={{ fontFamily: MONO, fontSize: '0.42rem', letterSpacing: '0.10em', color: 'rgba(200,164,74,0.65)' }}>
                        {h.countryNom}
                      </span>
                      <span style={{
                        marginLeft: 'auto', fontFamily: MONO, fontSize: '0.40rem', letterSpacing: '0.10em',
                        padding: '0.1rem 0.35rem', borderRadius: '2px',
                        background: h.vote === 'oui' ? 'rgba(58,191,122,0.12)' : 'rgba(200,80,80,0.10)',
                        border: `1px solid ${h.vote === 'oui' ? 'rgba(58,191,122,0.30)' : 'rgba(200,80,80,0.28)'}`,
                        color: h.vote === 'oui' ? 'rgba(58,191,122,0.85)' : 'rgba(200,80,80,0.80)',
                      }}>
                        {h.vote === 'oui' ? (uiLang==='en'?'✓ YES':'✓ OUI') : (uiLang==='en'?'✕ NO':'✕ NON')}
                      </span>
                    </div>
                    <p style={{ fontFamily: MONO, fontSize: '0.46rem', color: 'rgba(180,200,230,0.60)', lineHeight: 1.55, margin: '0 0 0.25rem', fontStyle: 'italic' }}>
                      « {h.question} »
                    </p>
                    {h.label && (
                      <p style={{ fontFamily: MONO, fontSize: '0.44rem', color: 'rgba(140,160,200,0.50)', lineHeight: 1.5, margin: '0 0 0.25rem' }}>
                        → {h.label}
                      </p>
                    )}
                    {(sat !== undefined || aria !== undefined) && (
                      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'0.15rem' }}>
                        {sat !== undefined && sat !== 0 && (
                          <span style={{ fontFamily:MONO, fontSize:'0.38rem', padding:'0.08rem 0.35rem', borderRadius:'2px',
                            background: sat > 0 ? 'rgba(58,191,122,0.08)' : 'rgba(200,80,80,0.08)',
                            border:`1px solid ${sat > 0 ? 'rgba(58,191,122,0.22)' : 'rgba(200,80,80,0.22)'}`,
                            color: sat > 0 ? 'rgba(58,191,122,0.80)' : 'rgba(200,80,80,0.75)' }}>
                            {uiLang==='en'?'SAT':'SAT'} {sat > 0 ? '+' : ''}{sat}%
                          </span>
                        )}
                        {aria !== undefined && aria !== 0 && (
                          <span style={{ fontFamily:MONO, fontSize:'0.38rem', padding:'0.08rem 0.35rem', borderRadius:'2px',
                            background: aria > 0 ? 'rgba(58,191,122,0.08)' : 'rgba(200,80,80,0.08)',
                            border:`1px solid ${aria > 0 ? 'rgba(58,191,122,0.22)' : 'rgba(200,80,80,0.22)'}`,
                            color: aria > 0 ? 'rgba(58,191,122,0.80)' : 'rgba(200,80,80,0.75)' }}>
                            ARIA {aria > 0 ? '+' : ''}{Math.round(aria)}%
                          </span>
                        )}
                        {(() => {
                          const pop = popForecasts[h.countryId];
                          if (!pop) return null;
                          return (
                            <span style={{ fontFamily:MONO, fontSize:'0.38rem', padding:'0.08rem 0.35rem', borderRadius:'2px',
                              background: pop > 0 ? 'rgba(58,191,122,0.08)' : 'rgba(200,80,80,0.08)',
                              border:`1px solid ${pop > 0 ? 'rgba(58,191,122,0.22)' : 'rgba(200,80,80,0.22)'}`,
                              color: pop > 0 ? 'rgba(58,191,122,0.80)' : 'rgba(200,80,80,0.75)' }}>
                              👥 {pop > 0 ? '+' : ''}{(pop/1000).toFixed(1)}k
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontFamily: MONO, fontSize: '0.38rem', letterSpacing: '0.18em',
              color: 'rgba(140,160,200,0.40)', marginBottom: '0.4rem' }}>
              {uiLang==='en' ? 'PASSIVE CHANGES THIS CYCLE' : 'ÉVOLUTIONS PASSIVES CE CYCLE'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {cycleForecasts.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.35rem 0.6rem', borderRadius: '2px',
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.85rem' }}>{f.emoji}</span>
                <span style={{ fontFamily: MONO, fontSize: '0.42rem',
                  color: 'rgba(200,215,240,0.55)', flex: 1 }}>{f.nom}</span>
                <span style={{ fontFamily: MONO, fontSize: '0.38rem', padding: '0.06rem 0.30rem',
                  borderRadius: '2px',
                  background: f.popDelta >= 0 ? 'rgba(58,191,122,0.07)' : 'rgba(200,80,80,0.07)',
                  border: `1px solid ${f.popDelta >= 0 ? 'rgba(58,191,122,0.20)' : 'rgba(200,80,80,0.20)'}`,
                  color: f.popDelta >= 0 ? 'rgba(58,191,122,0.75)' : 'rgba(200,80,80,0.70)' }}>
                  👥 {f.popDelta >= 0 ? '+' : ''}{(f.popDelta/1000).toFixed(1)}k
                </span>
                <span style={{ fontFamily: MONO, fontSize: '0.38rem', padding: '0.06rem 0.30rem',
                  borderRadius: '2px',
                  background: f.ecoDelta >= 0 ? 'rgba(58,191,122,0.07)' : 'rgba(200,80,80,0.07)',
                  border: `1px solid ${f.ecoDelta >= 0 ? 'rgba(58,191,122,0.20)' : 'rgba(200,80,80,0.20)'}`,
                  color: f.ecoDelta >= 0 ? 'rgba(58,191,122,0.75)' : 'rgba(200,80,80,0.70)' }}>
                  💰 {f.ecoDelta >= 0 ? '+' : ''}{f.ecoDelta}
                </span>
                <span style={{ fontFamily: MONO, fontSize: '0.38rem', padding: '0.06rem 0.30rem',
                  borderRadius: '2px',
                  background: f.satDrift >= 0 ? 'rgba(58,191,122,0.07)' : 'rgba(200,80,80,0.07)',
                  border: `1px solid ${f.satDrift >= 0 ? 'rgba(58,191,122,0.20)' : 'rgba(200,80,80,0.20)'}`,
                  color: f.satDrift >= 0 ? 'rgba(58,191,122,0.75)' : 'rgba(200,80,80,0.70)' }}>
                  😊 {f.satDrift >= 0 ? '+' : ''}{f.satDrift}%
                </span>
              </div>
            ))}
            </div>
          </div>

          <p style={{ fontFamily: MONO, fontSize: '0.50rem', color: 'rgba(200,215,240,0.55)', lineHeight: 1.6, margin: 0 }}>
            {uiLang==='en'?'Confirm advancement to the next cycle?':'Confirmer le passage au cycle suivant ?'}
          </p>

        </div>

        <div style={S.modalFooter}>
          <button style={S.cancelBtn} onClick={onClose}>{uiLang==='en'?'CANCEL':'ANNULER'}</button>
          <button style={S.saveBtn} onClick={onConfirm}>{uiLang==='en'?'CONFIRM CYCLE ⏭':'CONFIRMER LE CYCLE ⏭'}</button>
        </div>
      </div>
    </div>
  );
}
