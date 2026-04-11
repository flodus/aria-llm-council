// src/features/world/Dashboard.jsx

// ═══════════════════════════════════════════════════════════════════════════════
//  Dashboard.jsx — Hub principal (assemblage)
//
//  Composants extraits dans ./modals/ :
//    VoteResultModal · CycleConfirmModal · AddCountryModal · SecessionModal
//    DiplomacyModal · IaStatusBadge · Toast · AIErrorModal
//
//  Ce fichier conserve uniquement le composant Dashboard() et les imports.
// ═══════════════════════════════════════════════════════════════════════════════
import { REAL_COUNTRIES_DATA, REAL_COUNTRIES_DATA_EN } from '../../shared/data/ariaData';
import { STORAGE_KEYS } from '../../shared/services/storageKeys';
import { loadLang, t } from '../../ariaI18n';
import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useChronolog } from '../chronolog/useChronolog';
import { useChroniqueur } from '../chronolog/useChroniqueur';
import ChronologView   from '../chronolog/ChronologView';
import { useARIA } from './hooks/useARIA';
import { MapSVG } from '../map/MapSVG';
import ConstitutionModal from '../council/components/ConstitutionModal';
import CountryPanelCouncil from './components/CountryPanel/CountryPanelCouncil';
import LLMCouncil from '../council/components/LLMCouncil';
import { MINISTRIES_LIST } from '../council/services/councilEngine';
import { useCouncilSession } from '../council/hooks/useCouncilSession';
import { GarbageModal, MismatchModal } from '../council/components/CouncilModals';
import { S } from './modals/modalStyles';
import {
  VoteResultModal,
  CycleConfirmModal,
  AddCountryModal,
  SecessionModal,
  DiplomacyModal,
  useIaStatus,
  IaStatusBadge,
  Toast,
  AIErrorModal,
} from './modals';

export default function Dashboard({ selectedCountry, setSelectedCountry, isCrisis, activeTab, onGoToCouncil, onReady, onReset, onCountriesUpdate, chronologKey, onGoToSettings, onWorldStarted }) {
  const aria = useARIA({ setSelectedCountry, isCrisis, onReset });
  const iaStatus = useIaStatus(aria.pushNotif);

  const [uiLang, setUiLang] = useState(() => localStorage.getItem('aria_lang') || 'fr');
  useEffect(() => {
    const onLang = () => setUiLang(localStorage.getItem('aria_lang') || 'fr');
    window.addEventListener('aria-lang-change', onLang);
    return () => window.removeEventListener('aria-lang-change', onLang);
  }, []);
  const { pushEvent, pushCycleStats, closeCycle, resetChronolog } = useChronolog();
  const { runChroniqueur } = useChroniqueur();

  const _storedCycleNum = parseInt(localStorage.getItem(STORAGE_KEYS.CYCLE_NUM) || '1', 10);
  const cycleNumRef = useRef(isNaN(_storedCycleNum) ? 1 : _storedCycleNum);

  const [openMinistry, setOpenMinistry] = useState(null);
  const [customQ, setCustomQ] = useState('');
  const [freeQ, setFreeQ] = useState('');
  const [currentCycleQuestions, setCurrentCycleQuestions] = useState({});
  const [lastVoteTimestamp, setLastVoteTimestamp] = useState({});
  const setMinistryCycleQuestion = (ministryId, question) => {
    setCurrentCycleQuestions(prev => ({
      ...prev,
      [ministryId]: question
    }));
  };

  const [modalSecession,    setModalSecession]    = useState(false);
  const [modalDiplomacy,    setModalDiplomacy]    = useState(false);
  const [modalConstitution, setModalConstitution] = useState(false);
  const [modalVoteResult,   setModalVoteResult]   = useState(false);
  const [modalCycleConfirm, setModalCycleConfirm] = useState(false);
  const [modalAddCountry,   setModalAddCountry]   = useState(false);

  const [cycleHistory, setCycleHistory] = useState(() => {
    // B7 — hydratation au mount depuis aria_chronolog_cycles
    try {
      const cycles = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHRONOLOG_CYCLES) || '[]');
      const current = cycles.find(c => c.cycleNum === cycleNumRef.current);
      return current?.events?.filter(e => e.type === 'vote') || [];
    } catch { return []; }
  });

  const {
    session:        councilSession,
    running:        councilRunning,
    submitQuestion: handleSubmitQuestion,
    vote:           handleVoteCouncil,
    garbageModal,
    closeGarbageModal,
    mismatchModal,
    resolveMismatch,
  } = useCouncilSession(selectedCountry, handleVoteResult);

  const openSecession    = () => setModalSecession(true);
  const openDiplomacy    = () => setModalDiplomacy(true);
  const openConstitution = () => setModalConstitution(true);

  const handleSecessionConfirm = useCallback(async (nom, relation, regime, customize) => {
    setModalSecession(false);
    if (!selectedCountry) return;

    const parent = selectedCountry;
    await aria.doSecession(selectedCountry.id, nom, relation, regime);

    pushEvent(cycleNumRef.current, parent.annee || 2026, {
      type:         'secession',
      countryId:    parent.id,
      countryNom:   parent.nom,
      countryEmoji: parent.emoji,
      parentNom:    parent.nom,
      parentEmoji:  parent.emoji,
      childNom:     nom,
      childEmoji:   '🆕',
      relation,
      popTransmise: 25,
      narratif:     uiLang==='en' ? `${nom} secedes from ${parent.nom}. Established relation: ${relation}.` : `${nom} fait sécession de ${parent.nom}. Relation établie : ${relation}.`,
    });

    if (customize) {
      const childId = nom.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      setSelectedCountry({ id: childId, nom, regime });
      setModalConstitution(true);
    }
  }, [selectedCountry, aria, pushEvent, cycleNumRef]);

  const handleConstitutionSave = useCallback((updatedCountry) => {
    aria.setCountries(prev =>
      prev.map(c => c.id === updatedCountry.id ? updatedCountry : c)
    );
    if (selectedCountry?.id === updatedCountry.id) {
      setSelectedCountry(updatedCountry);
    }

    const diff = updatedCountry._constitutionDiff || {};
    const hasChange = diff.regimeAvant !== diff.regimeApres
      || diff.presidenceAvant !== diff.presidenceApres
      || diff.leaderAvant !== diff.leaderApres
      || diff.ministresDiff?.ajoutes?.length > 0
      || diff.ministresDiff?.retires?.length > 0;

    if (hasChange) {
      const parts = [];
      if (diff.regimeAvant !== diff.regimeApres)       parts.push(`${uiLang==='en'?'Regime':'Régime'} → ${diff.regimeApres.replace(/_/g,' ')}`);
      if (diff.presidenceAvant !== diff.presidenceApres) parts.push(`${uiLang==='en'?'Presidency':'Présidence'} → ${diff.presidenceApres}`);
      if (diff.leaderAvant !== diff.leaderApres && diff.leaderApres) parts.push(`Chef d'État → ${diff.leaderApres}`);
      if (diff.ministresDiff?.ajoutes?.length)  parts.push(`+${diff.ministresDiff.ajoutes.join(',')}`);
      if (diff.ministresDiff?.retires?.length)  parts.push(`-${diff.ministresDiff.retires.join(',')}`);

      pushEvent(cycleNumRef.current, updatedCountry.annee || 2026, {
        type:         'constitution',
        countryId:    updatedCountry.id,
        countryNom:   updatedCountry.nom,
        countryEmoji: updatedCountry.emoji,
        regimeAvant:      diff.regimeAvant,
        regimeApres:      diff.regimeApres,
        presidenceAvant:  diff.presidenceAvant,
        presidenceApres:  diff.presidenceApres,
        leaderAvant:      diff.leaderAvant,
        leaderApres:      diff.leaderApres,
        ministresDiff:    diff.ministresDiff || { ajoutes:[], retires:[] },
        promptsModifies:  diff.promptsModifies || 0,
        narratif: parts.join(' · '),
      });
    }
  }, [aria, selectedCountry, setSelectedCountry, pushEvent, cycleNumRef]);

  function handleVoteResult({ vote, voteResult: impact, session }) {
    const ministry        = session.ministryId ? MINISTRIES_LIST.find(m => m.id === session.ministryId) : null;
    const originalQuestion = session.question || '';

    const synthMin = (() => {
      const s = session.ministere?.synthese;
      if (!s) return '';
      return s.synthese_debat || s.recommandation || s.analyse || s.position || '';
    })();

    const synthPres = (() => {
      const s = session.presidence?.synthese;
      if (!s) return '';
      return s.decision_recommandee || s.synthese_debat || s.analyse || s.enjeu_principal || '';
    })();

    const entryBase = {
      type:               'vote',
      countryId:          selectedCountry.id,
      countryNom:         selectedCountry.nom,
      countryEmoji:       selectedCountry.emoji,
      ministereId:        session.ministryId || '',
      ministereNom:       ministry?.name || '',
      question:           originalQuestion,
      syntheseMinistere:  synthMin,
      synthesePresidence: synthPres,
      vote,
      label:              impact.label,
      impacts: {
        satisfaction: impact.satisfaction,
        aria_delta:   impact.aria_current - (selectedCountry.aria_current ?? 40),
      },
      voteCounts: { oui: impact.oui, non: impact.non },
      isCrisis:   !!(session.crisis?.crisis),
      deliberation: {
        ministere: session.ministere ? {
          ministryName:  session.ministere.ministryName,
          ministryEmoji: session.ministere.ministryEmoji,
          ministerA: {
            name:     session.ministere.ministerA?.name,
            emoji:    session.ministere.ministerA?.emoji,
            position: session.ministere.ministerA?.position,
            mot_cle:  session.ministere.ministerA?.mot_cle,
          },
          ministerB: {
            name:     session.ministere.ministerB?.name,
            emoji:    session.ministere.ministerB?.emoji,
            position: session.ministere.ministerB?.position,
            mot_cle:  session.ministere.ministerB?.mot_cle,
          },
          synthese: session.ministere.synthese,
        } : null,
        cercle: (session.cercle || []).map(a => ({
          ministryId:    a.ministryId,
          ministryName:  a.ministryName,
          ministryEmoji: a.ministryEmoji,
          annotation:    a.annotation,
        })),
        destin: session.destin ? {
          oracle: { name: session.destin.oracle?.name, position: session.destin.oracle?.position },
          wyrd:   { name: session.destin.wyrd?.name,   position: session.destin.wyrd?.position   },
        } : null,
        presidence: session.presidence ? {
          presidents: session.presidence.presidents || null,
          synthese:   session.presidence.synthese   || null,
          collegial:  !!session.presidence.collegial,
        } : null,
        crisis: session.crisis?.ministries?.map(m => ({
          ministryId:    m.ministryId,
          ministryName:  m.ministryName,
          ministryEmoji: m.ministryEmoji,
          synthese:      m.synthese?.synthese || m.synthese?.recommandation || '',
        })) || null,
      },
    };

    pushEvent(cycleNumRef.current, selectedCountry.annee || 2026, entryBase);

    window.dispatchEvent(new CustomEvent('aria:vote-stored', {
      detail: { cycleNum: cycleNumRef.current }
    }));

    setCycleHistory(prev => [
      ...prev.filter(h => !(h.type === 'vote' && h.countryId === selectedCountry.id && h.ministereId === entryBase.ministereId)),
      entryBase,
    ]);

    aria.setCountries(prev => prev.map(c => c.id !== selectedCountry.id ? c : {
      ...c,
      satisfaction: Math.max(5, Math.min(99, c.satisfaction + impact.satisfaction)),
      aria_current: Math.max(5, Math.min(95, impact.aria_current)),
    }));

    setSelectedCountry(prev => prev ? {
      ...prev,
      satisfaction: Math.max(5, Math.min(99, prev.satisfaction + impact.satisfaction)),
      aria_current: Math.max(5, Math.min(95, impact.aria_current)),
    } : prev);

    setModalVoteResult(true);

    if (session.ministryId) {
      setLastVoteTimestamp(prev => ({ ...prev, [session.ministryId]: Date.now() }));
    }
  }

  useEffect(() => {
    onReady?.({
      startLocal:          aria.startLocal,
      startWithAI:         aria.startWithAI,
      advanceCycle:        aria.advanceCycle,
      doDeliberate:        aria.doDeliberate,
      doSecession:         aria.doSecession,
      addFictionalCountry: aria.addFictionalCountry,
      openSecession:       openSecession,
      openConstitution:    openConstitution,
      openCyclePopup:      () => {
        if (aria.countries?.length > 0) setModalCycleConfirm(true);
      },
      resetWorld:       aria.resetWorld,
      resetChronolog:   resetChronolog,
      getYear:          aria.getYear,
      getCountries:     aria.getCountries,
      getCycle:         aria.getCycle,
      submitQuestion:   handleSubmitQuestion,
    });
  }, [aria.startLocal, aria.advanceCycle, onReady, handleSubmitQuestion, openConstitution, openSecession]);

  useEffect(() => {
    if (!aria.countries?.length) return;
    onCountriesUpdate?.(aria.countries);
    if (selectedCountry) {
      const fresh = aria.countries.find(c => c.id === selectedCountry.id);
      if (fresh) setSelectedCountry(fresh);
    }
  }, [aria.countries]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderMainContent = () => {
    if (activeTab === 'council') {
      return (
        <LLMCouncil
          session={councilSession}
          onVote={handleVoteCouncil}
          isRunning={councilRunning}
          countryContext={(() => {
            const c = selectedCountry;
            if (!c) return '';
            const isEn   = loadLang() === 'en';
            const raw    = (isEn ? REAL_COUNTRIES_DATA_EN : REAL_COUNTRIES_DATA).find(r => r.id === c.id);
            const geoText = raw?.triple_combo         || c.geoContext  || '';
            const socText = raw?.aria_sociology_logic || c.description || '';
            const sat     = Math.round(c.satisfaction ?? 50);
            const ariaScore = Math.round(c.aria_current ?? c.aria_irl ?? 40);
            const statsLine = isEn
              ? `Approval: ${sat}%   ·   ARIA: ${ariaScore}%`
              : `Satisfaction : ${sat}%   ·   Adhésion ARIA : ${ariaScore}%`;
            const geoBlock = [geoText, socText].filter(Boolean).join('\n\n');
            const baseText = c.contextOverride?.trim() || geoBlock;
            return [baseText, statsLine].filter(Boolean).join('\n\n');
          })()}
          countryNom={selectedCountry?.nom || ''}
          countryId={selectedCountry?.id}
          ctxMode={(() => {
            const c = selectedCountry;
            if (!c) return null;
            if (c.contextOverride?.trim()) return { icon:'✎', label:'Custom' };
            const m = c.context_mode || 'auto';
            return { auto:{icon:'🤖',label:'Auto'}, rich:{icon:'📖',label:'Enrichi'}, stats_only:{icon:'📊',label:'Stats'}, off:{icon:'🚫',label:'Off'} }[m] || {icon:'🤖',label:'Auto'};
          })()}
        />
      );
    }
    if (activeTab === 'timeline') {
      return (
        <ChronologView
          key={chronologKey}
          countries={aria.countries}
          currentCycleNum={cycleNumRef.current}
          currentCycleAnnee={aria.countries[0]?.annee ?? 2026}
          currentEvents={cycleHistory}
        />
      );
    }

    return (
      <MapSVG
        worldData={aria.worldData}
        countries={aria.countries}
        alliances={aria.alliances}
        selectedCountry={selectedCountry}
        onCountryClick={(c) => setSelectedCountry(prev => prev?.id === c.id ? null : c)}
        onCountryHover={() => {}}
      />
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {aria.aiRunning && !aria.countries?.length && (
        <div style={{
          position:'absolute', inset:0, zIndex:999,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:'1.4rem', background:'#0B0E14',
        }}>
          <div style={{
            fontFamily:"'JetBrains Mono', monospace",
            fontSize:'1.8rem', letterSpacing:'0.25em', color:'rgba(200,164,74,0.85)',
          }}>ARIA</div>
          <div style={{
            fontFamily:"'JetBrains Mono', monospace",
            fontSize:'0.58rem', letterSpacing:'0.18em', color:'rgba(200,164,74,0.65)',
            animation:'pulse 1.2s ease-in-out infinite',
          }}>{t('DASH_GEN_WORLD', uiLang)}</div>
          <div style={{
            width:'260px', height:'2px', background:'rgba(255,255,255,0.06)',
            borderRadius:'1px', overflow:'hidden',
          }}>
            <div style={{
              height:'100%', background:'rgba(200,164,74,0.5)',
              animation:'loading-slide 1.6s ease-in-out infinite',
              width:'60%',
            }} />
          </div>
          <div style={{
            fontFamily:"'JetBrains Mono', monospace",
            fontSize:'0.43rem', color:'rgba(120,140,175,0.50)', letterSpacing:'0.12em',
          }}>{t('DASH_GEN_ARCHIVES', uiLang)}</div>
          <style>{`
            @keyframes loading-slide {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(250%); }
            }
            @keyframes fadeSlideInBadge {
              from { opacity: 0; transform: translateX(-50%) translateY(8px); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
        </div>
      )}

      {renderMainContent()}

      <Toast notification={aria.notification} />
      <IaStatusBadge status={iaStatus} />

      <AIErrorModal
        error={aria.aiError}
        onClose={() => aria.clearAiError?.()}
        onSettings={() => { aria.clearAiError?.(); onGoToSettings?.(); }}
        onOffline={() => { aria.clearAiError?.(); onReset(); }}
        onCreateLocal={() => {
          const { countryDefs, W, H } = aria.aiError || {};
          aria.clearAiError?.();
          if (countryDefs?.length) {
            onWorldStarted?.();
            aria.startLocal(countryDefs, W || 1400, H || 800);
          }
        }}
      />

      {aria.aiRunning && (
        <div style={S.aiLoader}>
          <span style={S.aiLoaderDot} />
          DÉLIBÉRATION EN COURS…
        </div>
      )}

      {activeTab !== 'council' && (
        <div style={S.fabGroup}>
          <button
            style={S.fabBtn}
            title="Avancer de 5 ans"
            onClick={() => { if (aria.countries?.length > 0) setModalCycleConfirm(true); }}
            disabled={!aria.countries?.length || aria.aiRunning}
          >
            ⏭
          </button>

          {!selectedCountry && aria.countries?.length > 0 && (
            <button
              style={{ ...S.fabBtn, borderColor: 'rgba(58,191,122,0.38)', color: 'rgba(58,191,122,0.75)', background: 'rgba(58,191,122,0.06)' }}
              title="Ajouter une nation fictive"
              onClick={() => setModalAddCountry(true)}
            >
              🌍
            </button>
          )}

          {selectedCountry && (
            <>
              <button
                style={{ ...S.fabBtn, borderColor: 'rgba(200,164,74,0.40)', color: 'rgba(200,164,74,0.80)', background: 'rgba(200,164,74,0.07)' }}
                title={t('DASH_COUNCIL_TOOLTIP', uiLang)}
                onClick={() => onGoToCouncil?.()}
              >
                ⚖️
              </button>
              <button style={S.fabBtn} title="Diplomatie" onClick={openDiplomacy}>🤝</button>
              <button style={S.fabBtn} title="Gouvernement" onClick={openConstitution}>🏛️</button>
              <button style={{ ...S.fabBtn, ...S.fabBtnDanger }} title={t('DASH_SECESSION_TOOLTIP', uiLang)} onClick={openSecession}>✂️</button>
            </>
          )}
        </div>
      )}

      {activeTab === 'council' && selectedCountry && (
        <CountryPanelCouncil
          country={selectedCountry}
          lang={uiLang}
          openMinistry={openMinistry}
          setOpenMinistry={setOpenMinistry}
          customQ={customQ}
          setCustomQ={setCustomQ}
          freeQ={freeQ}
          setFreeQ={setFreeQ}
          submitting={councilRunning}
          handleSubmit={handleSubmitQuestion}
          onNextCycle={() => setModalCycleConfirm(true)}
          onConstitution={openConstitution}
          onSecession={openSecession}
          cycleActuel={cycleNumRef.current}
          currentCycleQuestions={currentCycleQuestions}
          setMinistryCycleQuestion={setMinistryCycleQuestion}
          lastVoteTimestamp={lastVoteTimestamp}
        />
      )}

      {createPortal(
        <>
          {modalAddCountry && (
            <AddCountryModal
              onConfirm={(def, customize) => {
                setModalAddCountry(false);
                const nouveauPays = aria.addFictionalCountry(def);
                const annee = aria.countries[0]?.annee || 2026;
                pushEvent(cycleNumRef.current, annee, {
                  type:         'new_country',
                  countryId:    nouveauPays?.id || null,
                  countryNom:   def.nom,
                  countryEmoji: def.realData?.flag || '🌍',
                  nom:     def.nom,
                  emoji:   def.realData?.flag || '🌍',
                  terrain: def.terrain,
                  regime:  def.regime,
                  isReal:  def.type === 'reel',
                  annee,
                });
                if (customize && nouveauPays) {
                  setSelectedCountry(nouveauPays);
                  setModalConstitution(true);
                }
              }}
              onClose={() => setModalAddCountry(false)}
            />
          )}
          {modalVoteResult && councilSession?.voteResult && (
            <VoteResultModal
              session={councilSession}
              onClose={() => setModalVoteResult(false)}
            />
          )}
          <GarbageModal msg={garbageModal?.msg} onClose={closeGarbageModal} />
          <MismatchModal data={mismatchModal} onResolve={resolveMismatch} />
          {modalCycleConfirm && (
            <CycleConfirmModal
              countries={aria.countries}
              councilHistory={cycleHistory}
              onGenerate={async () => {
                const cycleNum = cycleNumRef.current;
                const annee    = aria.countries[0]?.annee || 2026;
                // Pousser stats une seule fois (protection si modal rouverte)
                try {
                  const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHRONOLOG_CYCLES) || '[]');
                  const hasStats = existing.find(c => c.cycleNum === cycleNum)?.events?.some(e => e.type === 'cycle_stats');
                  if (!hasStats) pushCycleStats(cycleNum, annee, aria.countries);
                } catch { pushCycleStats(cycleNum, annee, aria.countries); }
                // Lire events après ajout des stats
                let cycleEvs = [];
                try {
                  const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHRONOLOG_CYCLES) || '[]');
                  cycleEvs = all.find(c => c.cycleNum === cycleNum)?.events || [];
                } catch {}
                // Chroniqueur : une narration par pays
                const narratives = await Promise.all(
                  aria.countries.map(async c => {
                    const memoire = await runChroniqueur(c, cycleEvs, cycleNum);
                    return { countryId: c.id, nom: c.nom, emoji: c.emoji, memoire };
                  })
                );
                return narratives.filter(n => n.memoire);
              }}
              onConfirm={() => {
                closeCycle(cycleNumRef.current);
                cycleNumRef.current += 1;
                localStorage.setItem(STORAGE_KEYS.CYCLE_NUM, String(cycleNumRef.current));
                setCurrentCycleQuestions({});
                setModalCycleConfirm(false);
                setCycleHistory([]);
                aria.advanceCycle();
              }}
              onClose={() => setModalCycleConfirm(false)}
            />
          )}
          {modalSecession && (
            <SecessionModal
              parent={selectedCountry}
              onConfirm={handleSecessionConfirm}
              onClose={() => setModalSecession(false)}
            />
          )}
          {modalDiplomacy && selectedCountry && (
            <DiplomacyModal
              sourceCountry={selectedCountry}
              allCountries={aria.countries}
              alliances={aria.alliances}
              onSetRelation={aria.setRelation}
              onClose={() => setModalDiplomacy(false)}
            />
          )}
          {modalConstitution && selectedCountry && (
            <ConstitutionModal
              country={selectedCountry}
              onSave={handleConstitutionSave}
              onClose={() => setModalConstitution(false)}
            />
          )}
        </>,
        document.body
      )}
    </div>
  );
}

export { useARIA };
