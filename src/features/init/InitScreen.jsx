// src/features/init/InitScreen.jsx

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

import { useState, lazy, Suspense } from 'react';
import { useLocale, t } from '../../ariaI18n';
import { PreLaunchScreen } from './components';
import { DefaultLocalFlow, RealWorldFlow } from './components/flows';
import { NameScreen, GeneratingScreen } from './components/screens';
import InitScreenLayout from './InitScreenLayout';

const GlobeBackground = lazy(() => import('./components/canvas/GlobeBackground'));


// ── Composant interne (exporté pour usage externe, ex: ma-planete) ────
export function InitScreenInner({ worldName, setWorldName, onLaunchLocal, onLaunchAI, hasApiKeys, onRefreshKeys, generatingBackground }) {
  const { lang, setLang } = useLocale();
  const [step,       setStep]      = useState('name');
  const [mode,       setMode]      = useState(null);
  const [preset,     setPreset]    = useState(null);
  const [progress,   setProgress]  = useState(0);
  const [msg,        setMsg]       = useState('INITIALISATION…');
  const [showKeys,   setShowKeys]  = useState(false);

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
      const opts = JSON.parse(localStorage.getItem('aria_options') || '{}');
      localStorage.setItem('aria_options', JSON.stringify(opts));
    } catch {}
    setStep('generating');
    const MSGS = [
      t('GEN_TOPO',lang),t('GEN_MASSES',lang),
      t('GEN_RESOURCES',lang),t('GEN_COUNCIL',lang),t('GEN_SIM',lang),
    ];
    // Attendre 3.5s (vue globe) avant de commencer la progression + morphing
    setTimeout(() => {
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setProgress(Math.round((step / 30) * 100));
      setMsg(MSGS[Math.floor(step / 6)] || MSGS[MSGS.length - 1]);
      if (step >= 30) {
        clearInterval(timer);
        if (usePreset === 'defaut_local') {
          onLaunchLocal(customDefs);
        } else if (usePreset === 'defaut_ai') {
          onLaunchAI(customDefs || [{ type:'reel', nom:'France' }]);
        } else if (mode === 'local') {
          onLaunchLocal(customDefs || []);
        } else {
          const defs = (customDefs || []).map(c => {
            const isReel = c.type === 'reel';
            return {
              type:     isReel ? 'reel' : 'imaginaire',
              nom:      c.nom || c.realData?.nom || 'Nation',
              regime:   c.regime   || c.realData?.regime,
              terrain:  c.terrain  || c.realData?.terrain,
              realData: c.realData || null,
              // Préserver les overrides passés par PreLaunchScreen
              ...(c.context_mode      ? { context_mode:      c.context_mode      } : {}),
              ...(c.contextOverride   ? { contextOverride:   c.contextOverride   } : {}),
              ...(c.governanceOverride? { governanceOverride: c.governanceOverride } : {}),
            };
          });
          onLaunchAI(defs);
        }
      }
    }, 120);
    }, 2000);
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
    <GeneratingScreen progress={progress} msg={msg}
      background={generatingBackground?.(progress)}/>
  );

  // ── Étape : nom ───────────────────────────────────────────────────────
  if (step === 'name') return (
    <NameScreen
    lang={lang}
    setLang={setLang}
    hasApiKeys={hasApiKeys}
    showKeys={showKeys}
    setShowKeys={setShowKeys}
    onRefreshKeys={onRefreshKeys}
    onSelectWorld={(selectedPreset) => {
      // Calcul du mode selon clés API et Board Game
      const boardGame = (() => {
        try { return JSON.parse(localStorage.getItem('aria_options') || '{}').ia_mode === 'none'; } catch { return false; }
      })();
      const computedMode = hasApiKeys && !boardGame && navigator.onLine ? 'ai' : 'local';
      setMode(computedMode);
      setPreset(selectedPreset);
      if (selectedPreset === 'reel') {
        setWorldName(lang === 'en' ? 'Earth' : 'Terre');
      } else {
        setWorldName(lang === 'en' ? 'New World' : 'Nouveau Monde');
      }
      setStep('config');
    }}
    />
  );

  // ── Étape : config ────────────────────────────────────────────────────

    // ══════════════════════════════════════════════════════════════════
    // TERRE RÉELLE
    // ══════════════════════════════════════════════════════════════════
    if (preset === 'reel') {
      return (
        <RealWorldFlow
        worldName={worldName}
        mode={mode}
        onBack={() => { setPreset(null); setStep('name'); }}
        onPreLaunch={preLaunch}
        background={null}
        />
      );
    }

    // ══════════════════════════════════════════════════════════════════
    // NOUVEAU MONDE (nations fictives multi-sélection)
    // ══════════════════════════════════════════════════════════════════
    if (preset === 'custom') {
      return (
        <DefaultLocalFlow
        worldName={worldName}
        onBack={() => { setPreset(null); setStep('name'); }}
        onPreLaunch={preLaunch}
        />
      );
    }

    return null;
  }

// ── Export principal — enveloppe dans InitScreenLayout ───────────────────
export default function InitScreen({ background, ...props }) {
  return (
    <>
      <Suspense fallback={null}><GlobeBackground /></Suspense>
      <InitScreenLayout background={background}>
        <InitScreenInner {...props} />
      </InitScreenLayout>
    </>
  );
}

