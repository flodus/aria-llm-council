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

import {
  useState,
  useEffect,
  useRef
} from 'react';
import {
  useLocale,
  t,
  loadLang

} from '../../ariaI18n';
import {
  FONT,
  COLOR,
  CARD_STYLE,
  INPUT_STYLE,
  SELECT_STYLE,
  BTN_PRIMARY,
  BTN_SECONDARY,
  labelStyle,
  wrap,
  wrapNarrow,
  wrapWide,
  mCard,
  tag

} from '../../shared/theme';
import {
  PAYS_LOCAUX,
  getStats,
  isValidKeyFormat,
  isFakeKey

} from '../../Dashboard_p1';
import {
  REAL_COUNTRIES_DATA,
  REAL_COUNTRIES_DATA_EN

} from '../../ariaData';
import {
  BASE_AGENTS,
  BASE_AGENTS_EN

} from '../../../templates';
import {
  ARIAHeader,
  CountryInfoCard,
  APIKeyInline,
  ContextPanel,
  RecapAccordion,
  PreLaunchScreen,
  CountryConfig
} from './components';
import {
  CustomFlow,
  DefaultLocalFlow,
  DefaultAIFlow
} from './components/flows';
import {
  NameScreen,
  ModeScreen,
  GeneratingScreen,
  PresetChoiceScreen
} from './components/screens';
import {
  getTerrainLabels,
  getRegimeLabels,
  getPaysLocaux,
  rcMatch,
  rcDisplayName,
  getAllCountries,
  validateCountryWithAI,
  getRealCountries
} from './services';
import {
  ARIA_FALLBACK_MODELS,
  ARIA_REGISTRY_URL,
  PROV_LABELS

} from '../../shared/constants/llmRegistry';
import {
  BackButton,
  HeaderTitle,
  Card,
  TitleCard,
  SubtitleCard,
  ButtonRow
} from '../../shared/components';


// ── Getters localisés — labels terrain/régime/pays depuis JSON ────────────


const DEFAULT_COUNTRY = () => ({
  key: Math.random().toString(36).slice(2),
  type: 'imaginaire', nom: '', regime: 'democratie_liberale',
  terrain: 'coastal', realData: null,
});

// ── Composant principal ─────────────────────────────────────────────────
export default function InitScreen({ worldName, setWorldName, onLaunchLocal, onLaunchAI, hasApiKeys, onRefreshKeys }) {
  const { lang, setLang } = useLocale();
  const [step,       setStep]      = useState('name');
  const [mode,       setMode]      = useState(null);
  const [preset,     setPreset]    = useState(null);
  const [countries,  setCountries] = useState([DEFAULT_COUNTRY()]);
  const [confirmOpen, setConfirmOpen] = useState(false); // dialog récap avant génération
  const [progress,   setProgress]  = useState(0);
  const [msg,        setMsg]       = useState('INITIALISATION…');
  const [showKeys,   setShowKeys]  = useState(false);

  // Sous-états navigation défaut
  const [defautType,        setDefautType]        = useState(null);  // 'fictif'|'reel'|'new'
  const [defautFictif,      setDefautFictif]      = useState(null);  // id PAYS_LOCAUX ou 'new'
  const [defautReel,        setDefautReel]        = useState('');    // id REAL_COUNTRIES_DATA ou terrain si isNew
  const [defautNom,         setDefautNom]         = useState('');    // nom libre
  // Validation pays réel défaut — état unique pour éviter les race conditions
  const [rcDefaut, setRcDefaut] = useState({ status: null, suggestion: null, canonical: '' });
  const [rcDefautData, setRcDefautData] = useState(null); // { flag, population, region } récupérés depuis restcountries
  const rcDefautTimer = useRef(null);
  const rcDefautQueryRef = useRef(''); // query en cours — pour ignorer les réponses obsolètes
  const searchDefautCountry = async (query) => {
    if (!query || query.length < 3) { setRcDefaut({ status: null, suggestion: null, canonical: '' }); return; }
    // Marque cette query comme courante — les réponses d'une ancienne query seront ignorées
    rcDefautQueryRef.current = query;
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    const local = getRealCountries().find(r => norm(r.nom) === norm(query));
    if (local) {
      if (rcDefautQueryRef.current !== query) return; // réponse obsolète
      setRcDefaut({ status: 'found', suggestion: null, canonical: local.nom });
      return;
    }
    setRcDefaut({ status: 'searching', suggestion: null, canonical: '' });
    try {
      const ai = await validateCountryWithAI(query, lang);
      if (rcDefautQueryRef.current !== query) return;
      if (ai.status === 'notfound' || !ai.displayName) {
        setRcDefaut({ status: 'notfound', suggestion: null, canonical: '' });
      } else if (ai.status === 'suggestion') {
        setRcDefaut({ status: 'suggestion', suggestion: ai.displayName, canonical: '' });
      } else {
        const canonical = ai.displayName || query;
        setRcDefaut({ status: 'found', suggestion: null, canonical });
        setDefautNom(canonical);
        // Fetch drapeau + population depuis restcountries
        try {
          const rc = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(ai.canonicalName||canonical)}?fields=name,flag,population,region`)
            .then(r => r.ok ? r.json() : []);
          if (rc[0]) setRcDefautData({
            id: canonical.toLowerCase().replace(/[^a-z0-9]/g,'-'),
            nom: canonical, flag: rc[0].flag || '🌐',
            regime: 'democratie_liberale', terrain: 'coastal',
            population: rc[0].population || 5_000_000,
            region: rc[0].region || '', _fromApi: true,
          });
        } catch(_) {}
      }
    } catch(_) {
      if (rcDefautQueryRef.current === query)
        setRcDefaut({ status: 'error', suggestion: null, canonical: '' });
    }
  };
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
      const opts = JSON.parse(localStorage.getItem('aria_options') || '{}');
      localStorage.setItem('aria_options', JSON.stringify(opts));
    } catch {}
    setStep('generating');
    const MSGS = [
      t('GEN_TOPO',lang),t('GEN_MASSES',lang),
      t('GEN_RESOURCES',lang),t('GEN_COUNCIL',lang),t('GEN_SIM',lang),
    ];
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
          onLaunchLocal(customDefs || countries);
        } else {
          const defs = (customDefs || countries).map(c => {
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
    <GeneratingScreen progress={progress} msg={msg} />
  );

  // ── Étape : nom ───────────────────────────────────────────────────────
  if (step === 'name') return (
    <NameScreen
    worldName={worldName}
    setWorldName={setWorldName}
    lang={lang}
    setLang={setLang}
    hasApiKeys={hasApiKeys}
    showKeys={showKeys}
    setShowKeys={setShowKeys}
    onRefreshKeys={onRefreshKeys}
    onContinue={() => setStep('mode')}
    />
  );

  // ── Étape : mode ──────────────────────────────────────────────────────
  if (step === 'mode') return (
    <ModeScreen
    worldName={worldName}
    hasApiKeys={hasApiKeys}
    onSelectMode={(modeId) => {
      setMode(modeId);
      try {
        const opts = JSON.parse(localStorage.getItem('aria_options')||'{}');
        if (modeId === 'local') opts.ia_mode = 'none';
                               else if (modeId === 'ai' && opts.ia_mode === 'none') opts.ia_mode = 'aria';
                               localStorage.setItem('aria_options', JSON.stringify(opts));
      } catch {}
      setStep('config');
    }}
    onBack={() => setStep('name')}
    />
  );

  // ── Étape : config ────────────────────────────────────────────────────
  // ── Étape : config — helpers ──────────────────────────────────────────


  if (!preset) return (
    <PresetChoiceScreen
    mode={mode}
    onSelectPreset={(presetValue) => {
      setPreset(presetValue);
      if (presetValue === 'defaut') resetDefaut();
    }}
    onBack={() => setStep('mode')}
    />
  );

    // ══════════════════════════════════════════════════════════════════
    // PAR DÉFAUT HORS LIGNE
    // ══════════════════════════════════════════════════════════════════
    if (preset === 'defaut' && mode === 'local') {
      return (
        <DefaultLocalFlow
        worldName={worldName}
        onBack={() => setPreset(null)}
        onPreLaunch={preLaunch}
        />
      )
    };

    // ══════════════════════════════════════════════════════════════════
    // PAR DÉFAUT EN LIGNE
    // ══════════════════════════════════════════════════════════════════
    if (preset === 'defaut' && mode === 'ai') {
      return (
        <DefaultAIFlow
        worldName={worldName}
        onBack={() => setPreset(null)}
        onPreLaunch={preLaunch}
        />
      )
    };

    // ══════════════════════════════════════════════════════════════════
    // PERSONNALISÉ (hors ligne ou en ligne)
    // ══════════════════════════════════════════════════════════════════

    if (preset === 'custom') {
      return (
        <CustomFlow
        worldName={worldName}
        mode={mode}
        onBack={() => setPreset(null)}
        onPreLaunch={preLaunch}
        />
      )
    };

    return null;
  }

