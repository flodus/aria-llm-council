// src/features/world/hooks/useARIA.js
// Hook principal — état global du Dashboard, handlers, persistance session

import { useState, useEffect, useRef, useCallback } from 'react';
import { getStats, PAYS_LOCAUX } from '../../../shared/data/gameData';
import { getApiKeys, callAI, buildCountryPrompt, buildEventPrompt } from '../../../shared/services/llm/aiService';
import { generateWorld, findSpawnPoint, genOrganicPath, seededRand, strToSeed, randRange } from '../services/svgWorldEngine';
import { calcAriaIRL, driftAria, calcRessources, buildCountryFromLocal, buildCountryFromAI, normalizeRealCountryTemplate } from '../services/countryEngine';
import { getHumeur, calcInfluenceRadius, doCycle, checkSeuils } from '../services/gameEngine';
import { saveSession, loadSession, clearSession, buildDefaultAlliances } from '../services/sessionStore';
import { loadLang } from '../../../ariaI18n';
import STATS from '../../../../templates/languages/fr/simulation.json';

export function useARIA({ setSelectedCountry, isCrisis, onReset }) {
  const savedSession = loadSession();

  // ── State ──────────────────────────────────────────────────────────────────
  const [phase,        setPhase]      = useState(savedSession ? 'game' : 'init');
  const [worldData,    setWorldData]  = useState(() => {
    if (!savedSession) return null;
    return generateWorld(savedSession.seed, savedSession.W, savedSession.H);
  });
  const [countries,    setCountries]  = useState(savedSession?.countries || []);
  const [alliances,    setAlliances]  = useState(savedSession?.alliances || []);
  const [events,       setEvents]     = useState([]);
  const [aiRunning,    setAiRunning]  = useState(false);
  const [aiError,      setAiError]    = useState(null);
  const [notification, setNotif]      = useState(null);
  const [viewport,     setViewport]   = useState({
    W: savedSession?.W || 1400,
    H: savedSession?.H || 800,
  });

  const notifTimerRef = useRef(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const pushNotif = useCallback((msg, type = 'info', duration = 4000) => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    const t = type === 'error' ? 'err' : type;
    setNotif({ message: msg, type: t });
    notifTimerRef.current = setTimeout(() => setNotif(null), duration);
  }, []);

  // ── Init monde ─────────────────────────────────────────────────────────────
  const initWorld = useCallback((seed, W, H) => {
    const world = generateWorld(seed, W, H);
    setWorldData(world);
    setViewport({ W, H });
    return world;
  }, []);

  // ── Persistance auto ───────────────────────────────────────────────────────
  const worldDataRef = useRef(worldData);
  const viewportRef  = useRef(viewport);
  useEffect(() => { worldDataRef.current = worldData; }, [worldData]);
  useEffect(() => { viewportRef.current  = viewport;  }, [viewport]);

  useEffect(() => {
    if (phase !== 'game' || !countries.length || !worldDataRef.current) return;
    const { seed, W, H } = worldDataRef.current;
    saveSession(seed, W, H, countries, alliances);
  }, [countries, alliances, phase]);

  // ── Démarrage local ────────────────────────────────────────────────────────
  const startLocal = useCallback((customDefs = null, W = 1400, H = 800) => {
    try {
      const o = JSON.parse(localStorage.getItem('aria_options') || '{}');
      o.force_local = true;
      localStorage.setItem('aria_options', JSON.stringify(o));
    } catch {}
    const seed  = Math.floor(Math.random() * 999999);
    const world = initWorld(seed, W, H);

    const templates = customDefs
      ? customDefs.map(d => {
          if (d.realData?.id) {
            const local = PAYS_LOCAUX.find(p => p.id === d.realData.id);
            if (local) return local;
          }
          if (d.realData && (d.realData.population || d.realData.natalite)) {
            return normalizeRealCountryTemplate(d.realData);
          }
          if (d.type === 'imaginaire' || !d.realData) {
            return {
              id:           (d.nom || 'nation').toLowerCase().replace(/[^a-z0-9]/g, '-'),
              nom:          d.nom || 'Nation Inconnue',
              emoji:        '🌍',
              couleur:      '#4A7EC8',
              regime:       d.regime || 'republique_federale',
              terrain:      d.terrain || 'coastal',
              description:  '',
              leader:       null,
              population:   5_000_000,
              tauxNatalite: 11,
              tauxMortalite: 9,
              satisfaction: 55,
            };
          }
          return PAYS_LOCAUX[0];
        })
      : [PAYS_LOCAUX[0]];

    const raw   = templates.map(t => buildCountryFromLocal(t, world));
    const built = raw.map((c, i) => {
      const irl = calcAriaIRL(c);
      const def = customDefs?.[i];
      return {
        ...c,
        aria_irl: irl, aria_current: irl,
        ...(def?.context_mode       ? { context_mode:       def.context_mode       } : {}),
        ...(def?.contextOverride    ? { contextOverride:    def.contextOverride    } : {}),
        ...(def?.governanceOverride ? { governanceOverride: def.governanceOverride } : {}),
      };
    });

    setCountries(built);
    const defaultAlliances = buildDefaultAlliances(built);
    setAlliances(defaultAlliances);
    setEvents([]);
    setPhase('game');
    saveSession(seed, W, H, built, defaultAlliances);
    const names = built.map(c => c.nom).join(', ');
    pushNotif(`Mode local — ${names}.`, 'ok');
  }, [initWorld, pushNotif]);

  // ── Démarrage IA ───────────────────────────────────────────────────────────
  const startWithAI = useCallback(async (countryDefs, W = 1400, H = 800) => {
    try {
      const o = JSON.parse(localStorage.getItem('aria_options') || '{}');
      o.force_local = false;
      localStorage.setItem('aria_options', JSON.stringify(o));
    } catch {}
    const seed  = Math.floor(Math.random() * 999999);
    const world = initWorld(seed, W, H);
    setAiRunning(true);
    const built = [];

    for (const def of countryDefs) {
      try {
        const prompt = buildCountryPrompt(def.type, def.nom);
        const aiData = await callAI(prompt, 'pays');
        if (aiData) {
          const c      = buildCountryFromAI(aiData, world, built);
          const irlAI  = aiData.aria_acceptance && Number.isFinite(+aiData.aria_acceptance)
            ? Math.round(Math.max(5, Math.min(95, +aiData.aria_acceptance))) : null;
          const irl    = irlAI ?? calcAriaIRL(c);
          const finalNom = def.nom || c.nom;
          built.push({ ...c, nom: finalNom, aria_irl: irl, aria_current: irl, _fallback: false,
            ...(def.context_mode       ? { context_mode:       def.context_mode       } : {}),
            ...(def.contextOverride    ? { contextOverride:    def.contextOverride    } : {}),
            ...(def.governanceOverride ? { governanceOverride: def.governanceOverride } : {}),
          });
        } else {
          let fallback;
          if (def.realData && (def.realData.population || def.realData.natalite)) {
            const tpl = normalizeRealCountryTemplate(def.realData);
            fallback  = buildCountryFromLocal(tpl, world);
          } else {
            fallback = buildCountryFromLocal(PAYS_LOCAUX[built.length % PAYS_LOCAUX.length], world);
          }
          const irl = calcAriaIRL(fallback);
          built.push({ ...fallback, aria_irl: irl, aria_current: irl, _fallback: true, _errorCode: aiData?.code,
            ...(def.context_mode       ? { context_mode:       def.context_mode       } : {}),
            ...(def.contextOverride    ? { contextOverride:    def.contextOverride    } : {}),
            ...(def.governanceOverride ? { governanceOverride: def.governanceOverride } : {}),
          });
        }
      } catch (e) {
        console.warn('[ARIA] startWithAI error:', e);
      }
    }

    if (built.length === 0) {
      setAiRunning(false);
      setAiError({ type: 'generic', details: "Aucun pays n'a pu être généré. Vérifiez votre clé API.", countryDefs, W, H });
      return;
    }

    const allFallback = built.every(b => b._fallback === true);
    if (allFallback) {
      const quotaHit = built.some(b => b._errorCode === 429);
      setAiError({
        type: quotaHit ? 'quota' : 'nokey',
        details: quotaHit
          ? (loadLang() === 'en' ? 'API quota exceeded (429 Too Many Requests). Wait before retrying, or switch to offline mode.' : 'Quota API dépassé (429 Too Many Requests). Patientez avant de relancer, ou passez en mode hors-ligne.')
          : (loadLang() === 'en' ? "AI could not generate any country. Check your API key in settings, or switch to offline mode." : "L'IA n'a pu générer aucun pays. Vérifiez votre clé API dans les paramètres, ou passez en mode hors-ligne."),
        countryDefs, W, H,
      });
    }

    setCountries(built);
    const defaultAlliances = buildDefaultAlliances(built);
    setAlliances(defaultAlliances);
    setEvents([]);
    setPhase('game');
    setAiRunning(false);
    saveSession(world.seed, W, H, built, defaultAlliances);
    if (!allFallback) pushNotif(`${built.length} pays générés. La simulation commence.`, 'ok');
  }, [initWorld, pushNotif]);

  // ── Cycle +5 ans ──────────────────────────────────────────────────────────
  const advanceCycle = useCallback(async () => {
    const keys    = getApiKeys();
    const updated = countries.map(c => {
      const cycled  = doCycle(c, alliances);
      const newAria = driftAria(
        cycled.aria_current ?? cycled.aria_irl ?? 40,
        cycled.aria_irl     ?? 40,
        cycled.satisfaction,
      );
      return { ...cycled, aria_current: newAria };
    });
    const triggers = [];

    updated.forEach((after, i) => {
      const seuils = checkSeuils(countries[i], after);
      triggers.push(...seuils);
    });

    setCountries(updated);

    for (const trigger of triggers) {
      const hasKey = keys.claude || keys.gemini;
      if (hasKey) {
        const prompt  = buildEventPrompt(trigger);
        const aiEvent = await callAI(prompt, 'evenement');
        if (aiEvent) {
          const evt = { ...aiEvent, id: Date.now(), pays: trigger.pays.nom, trigger: trigger.type };
          setEvents(prev => [evt, ...prev].slice(0, 50));
          pushNotif(`⚠ ${aiEvent.titre} — ${trigger.pays.nom}`, aiEvent.severite || 'warn', 6000);
        }
      } else {
        const labels = {
          revolte:        `Révolte imminente à ${trigger.pays.nom} — satisfaction critique.`,
          demo_explosion: `Explosion démographique à ${trigger.pays.nom}.`,
        };
        pushNotif(labels[trigger.type] || `Événement critique à ${trigger.pays.nom}.`, 'warn', 5000);
      }
    }

    pushNotif(`Cycle avancé — An ${updated[0]?.annee || '?'}`, 'info', 2500);
  }, [countries, alliances, pushNotif]);

  // ── Sécession ─────────────────────────────────────────────────────────────
  const doSecession = useCallback(async (parentId, nomNouveau, relationType, childRegime) => {
    const parent = countries.find(c => c.id === parentId);
    if (!parent) return;

    const keys       = getApiKeys();
    const seed       = strToSeed(nomNouveau + Date.now());
    const rand       = seededRand(seed);
    const regimeKey  = childRegime || parent.regime;
    const regimeObj  = getStats().regimes[regimeKey] || getStats().regimes.republique_federale;

    let newCx, newCy;
    if (worldDataRef.current) {
      const spawn = findSpawnPoint(worldDataRef.current, countries, parent.coastal ? 'continent' : null);
      newCx = spawn.cx;
      newCy = spawn.cy;
    } else {
      const angle = rand() * Math.PI * 2;
      const dist  = parent.size * 2.2;
      newCx = parent.cx + Math.cos(angle) * dist;
      newCy = parent.cy + Math.sin(angle) * dist;
    }
    const newSize = parent.size * 0.55;

    const popFils   = Math.round(parent.population * 0.25);
    const popParent = Math.round(parent.population * 0.75);

    const parentHue = parseInt((parent.couleur || '#4A7EC8').replace('#', ''), 16) % 360;
    const childHue  = (parentHue + 137 + Math.floor(rand() * 60)) % 360;
    const childColor = `hsl(${childHue}, 58%, 36%)`;

    const updatedParent = {
      ...parent,
      population:   popParent,
      satisfaction: Math.max(parent.satisfaction - 8, 10),
      size:         parent.size * 0.88,
      svgPath:      genOrganicPath(parent.cx, parent.cy, parent.size * 0.88, parent.seed, 11, 0.30),
      ressources:   Object.fromEntries(
        Object.entries(parent.ressources).map(([k, v]) => [k, v && rand() > 0.35])
      ),
    };

    const childRes     = calcRessources(parent.terrain, seed);
    const childCountry = {
      id:           nomNouveau.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      nom:          nomNouveau,
      emoji:        regimeObj.emoji || '🆕',
      couleur:      childColor,
      regime:       regimeKey,
      regimeName:   regimeObj.name || regimeKey,
      regimeEmoji:  regimeObj.emoji || '🏛️',
      terrain:      parent.terrain,
      terrainName:  parent.terrainName,
      coastal:      parent.coastal,
      description:  `Né de la sécession de ${parent.nom}.`,
      leader:       null,
      annee:        parent.annee,
      population:   popFils,
      tauxNatalite: parent.tauxNatalite,
      tauxMortalite:parent.tauxMortalite,
      satisfaction: 60,
      humeur:       getHumeur(60).label,
      humeur_color: getHumeur(60).color,
      popularite:   55,
      ressources:   childRes,
      coefficients: parent.coefficients,
      cx: newCx, cy: newCy, size: newSize, seed,
      svgPath:      genOrganicPath(newCx, newCy, newSize, seed, 9, 0.28),
      influenceRadius: calcInfluenceRadius(popFils, parent.coastal, childRes),
      relations:    { [parentId]: relationType },
      chronolog:    [],
      economie:     Math.round((parent.economie || 100) * 0.7),
      aria_irl:     parent.aria_irl,
      aria_current: parent.aria_current,
      isLocal:      false,
    };

    updatedParent.relations = { ...updatedParent.relations, [childCountry.id]: relationType };

    setCountries(prev =>
      prev.map(c => c.id === parentId ? updatedParent : c).concat(childCountry)
    );
    setAlliances(prev => [...prev, { a: parentId, b: childCountry.id, type: relationType }]);

    if (keys.claude || keys.gemini) {
      const trigger  = { type: 'secession', pays: childCountry, parent: parent.nom };
      const aiEvent  = await callAI(buildEventPrompt(trigger), 'evenement');
      if (aiEvent) {
        const evt = { ...aiEvent, id: Date.now(), pays: childCountry.nom, trigger: 'secession' };
        setEvents(prev => [evt, ...prev].slice(0, 50));
        pushNotif(`✂ ${aiEvent.titre}`, 'warn', 6000);
      }
    } else {
      pushNotif(`✂ ${nomNouveau} naît de la sécession de ${parent.nom}.`, 'warn', 5000);
    }
  }, [countries, pushNotif]);

  // ── Alliance / rupture ────────────────────────────────────────────────────
  const setRelation = useCallback((idA, idB, type) => {
    setCountries(prev => prev.map(c => {
      if (c.id === idA) return { ...c, relations: { ...c.relations, [idB]: type } };
      if (c.id === idB) return { ...c, relations: { ...c.relations, [idA]: type } };
      return c;
    }));

    setAlliances(prev => {
      const filtered = prev.filter(a => !(
        (a.a === idA && a.b === idB) || (a.a === idB && a.b === idA)
      ));
      if (type !== 'Neutre') return [...filtered, { a: idA, b: idB, type }];
      return filtered;
    });

    if (type === 'Tension') {
      const paysA = countries.find(c => c.id === idA);
      const paysB = countries.find(c => c.id === idB);
      if (paysA && paysB) {
        const keys = getApiKeys();
        if (keys.claude || keys.gemini) {
          const trigger = { type: 'alliance_rompue', pays: paysA, avec: paysB.nom };
          callAI(buildEventPrompt(trigger), 'evenement').then(aiEvent => {
            if (aiEvent) {
              setEvents(prev => [
                { ...aiEvent, id: Date.now(), pays: paysA.nom, trigger: 'alliance_rompue' },
                ...prev,
              ].slice(0, 50));
              pushNotif(`⚡ ${aiEvent.titre}`, 'warn', 6000);
            }
          });
        } else {
          pushNotif(`⚡ Tension entre ${paysA.nom} et ${paysB.nom}.`, 'warn', 4000);
        }
      }
    }
  }, [countries, pushNotif]);

  // ── Ajout pays en cours de partie ─────────────────────────────────────────
  const addFictionalCountry = useCallback((def) => {
    if (!worldDataRef.current) return;

    const { nom, terrain, regime, realData } = def;
    const seed      = strToSeed(nom + Date.now());
    const rand      = seededRand(seed);
    const regimeObj = getStats().regimes?.[regime] || getStats().regimes?.republique_federale || {};
    const spawn     = findSpawnPoint(worldDataRef.current, countries);
    const { cx, cy } = spawn;
    const size       = 55 + rand() * 30;
    const hue        = Math.floor(rand() * 360);
    const couleur    = `hsl(${hue}, 52%, 34%)`;
    const ressources = calcRessources(terrain, seed);

    const basePopulation  = realData?.population || Math.round(1_000_000 + rand() * 9_000_000);
    const regimeFinal     = realData?.regime || regime;
    const terrainFinal    = realData?.terrain || terrain;
    const regimeObjFinal  = getStats().regimes?.[regimeFinal] || regimeObj;

    const newCountry = {
      id:           nom.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') + '-' + Date.now(),
      nom,
      emoji:        realData?.flag || regimeObjFinal.emoji || '🌍',
      couleur,
      regime:       regimeFinal,
      regimeName:   regimeObjFinal.name || regimeFinal,
      regimeEmoji:  regimeObjFinal.emoji || '🏛️',
      terrain:      terrainFinal,
      terrainName:  terrainFinal,
      coastal:      terrainFinal === 'coastal' || terrainFinal === 'island' || terrainFinal === 'archipelago',
      description:  realData ? 'Pays réel — intégré en cours de simulation.' : 'Nation émergente — fondée par décret.',
      leader:       null,
      annee:        countries[0]?.annee || 2026,
      population:   basePopulation,
      tauxNatalite: 10 + Math.round(rand() * 8),
      tauxMortalite: 7 + Math.round(rand() * 5),
      satisfaction: 55,
      humeur:       getHumeur(55).label,
      humeur_color: getHumeur(55).color,
      popularite:   50,
      ressources,
      coefficients: getStats().terrains?.[terrain]?.coefficients || {},
      cx, cy, size, seed,
      svgPath:      genOrganicPath(cx, cy, size, seed, 9, 0.28),
      influenceRadius: calcInfluenceRadius(Math.round(1_000_000 + rand() * 9_000_000), terrain === 'coastal', ressources),
      relations:    {},
      chronolog:    [],
      economie:     60 + Math.round(rand() * 30),
      aria_irl:     realData?.aria_acceptance_irl ?? 40,
      aria_current: realData?.aria_acceptance_irl ?? 40,
      isLocal:      false,
      realData:     realData || null,
    };

    setCountries(prev => [...prev, newCountry]);
    pushNotif(`🌍 ${nom} rejoint le monde.`, 'ok', 4000);
    return newCountry;
  }, [countries, pushNotif]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetWorld = useCallback(() => {
    clearSession();
    setPhase('init');
    setWorldData(null);
    setCountries([]);
    setAlliances([]);
    setEvents([]);
    setSelectedCountry(null);
    onReset?.();
  }, [setSelectedCountry, onReset]);

  // ── Getters pour App.jsx ──────────────────────────────────────────────────
  const getYear      = useCallback(() => countries[0]?.annee ?? null, [countries]);
  const getCycle     = useCallback(() => {
    const base = STATS?.global_start?.annee ?? 2026;
    const cur  = countries[0]?.annee ?? base;
    return Math.max(0, Math.round((cur - base) / 5));
  }, [countries]);
  const getCountries = useCallback(() => countries, [countries]);

  return {
    phase, worldData, countries, alliances, events, aiRunning, aiError,
    clearAiError: () => setAiError(null), notification, viewport,
    setCountries, setViewport,
    startLocal, startWithAI, advanceCycle, doSecession, addFictionalCountry,
    setRelation, resetWorld, pushNotif,
    getYear, getCycle, getCountries,
  };
}
