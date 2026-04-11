# 🗺️ ARIA — Strategic Roadmap

> *Français : [ROADMAP.fr.md](ROADMAP.fr.md)*

```text
================================================================================
  ARIA STRATEGIC ROADMAP  —  v8.0
  Last updated: 2026-04-11
================================================================================

 ████████████████████████████████████████  SHIPPED  ████████████████████████████

 [ CORE ENGINE ] ................................................... STATUS: ✅ DONE
 ├─[✓] Multi-LLM Council ........ [Claude/Gemini/Grok/OpenAI] ...... ■ 100%
 ├─[✓] Constitutional Editor .... [Regime, Leader, Prompts] ........ ■ 100%
 ├─[✓] Minister Archetypes ...... [12 ministers × 7 ministries] .... ■ 100%
 ├─[✓] Phare & Boussole ......... [Presidential arbitration] ........ ■ 100%
 ├─[✓] Popular Vote ............. [Satisfaction + ARIA score] ....... ■ 100%
 └─[✓] World Events ............. [Secession, New nations] .......... ■ 100%

 [ CHRONOLOG ] ..................................................... STATUS: ✅ DONE
 ├─[✓] Typed Event History ...... [vote/secession/constitution] ..... ■ 100%
 ├─[✓] Cycle Snapshots .......... [SAT + ARIA deltas per cycle] ..... ■ 100%
 └─[✓] Auto-summarization ....... [Context pruning > 5 cycles] ...... ■ 100%

 [ INIT & CONFIGURATION ] ......................................... STATUS: ✅ DONE
 ├─[✓] 4-Provider Key Setup ..... [Inline test + validation] ........ ■ 100%
 ├─[✓] AI Architecture Mode ..... [ARIA / Solo / Custom] ............ ■ 100%
 ├─[✓] Per-role LLM Config ...... [Provider + Model per stage] ...... ■ 100%
 ├─[✓] Pre-launch Constitution .. [Edit before world gen] ........... ■ 100%
 └─[✓] LLM Registry ............. [Gist-hosted JSON + fallback] ..... ■ 100%

 [ BOARD GAME MODE — OFFLINE PIPELINE ] ........................... STATUS: ✅ DONE
 ├─[✓] Questions ................. [aria_questions.json FR+EN] ........ ■ 100%
 ├─[✓] Minister responses ........ [aria_reponses.json — archetype × regime × stance] ■ 100%
 ├─[✓] Deliberation syntheses .... [aria_syntheses.json — ministry × regime × convergence] ■ 100%
 ├─[✓] Circle annotations ........ [aria_annotations.json — ministry × regime] ■ 100%
 └─[✓] Offline routing ........... [keywords → ministry · garbage → random] ■ 100%
        └─> 100% editorial content in JSON · zero hardcoded phrases in engine

 [ SINGLE SOURCE OF TRUTH ] ...................................... STATUS: ✅ DONE
 ├─[✓] simulation.json enriched .. [aria_irl_base · sat_base · bloc · colour · pop_base] ■ 100%
 ├─[✓] governance.json cleaned ... [chance removed · industry · oracle · wyrd · destiny] ■ 100%
 ├─[✓] Hardcoded constants ....... [all removed → getStats()/getAgents() lookup] ■ 100%
 └─[✓] Industry as default ....... [replaces chance across all UI and engine] ......... ■ 100%

 [ DESTINY OF THE WORLD ] ......................................... STATUS: ✅ DONE
 ├─[✓] Oracle + Wyrd ............. [philosophical agents in ministers{}] ......... ■ 100%
 │      └─> Not a ministry — separate destiny block outside ministries[]
 ├─[✓] Crisis detection .......... [detectCrisis() — destiny keywords, sync, local] .. ■ 100%
 ├─[✓] runDestinPhase() .......... [AI + fallback aria_reponses.json] ............... ■ 100%
 ├─[✓] Presidency injection ...... [destinVoices → runPresidencePhase()] ............ ■ 100%
 ├─[✓] UI toggles ................ [destiny_mode + crisis_mode in Settings + Modal] .. ■ 100%
 ├─[✓] Oracle/Wyrd responses ..... [aria_reponses.json — 7 regimes × 3 stances, FR+EN] ■ 100%
 └─[✓] Destiny questions ......... [aria_questions.json — 7 existential crises, FR+EN] ■ 100%

 [ COLLEGIAL + CRISIS MODE ] ..................................... STATUS: ✅ DONE
 ├─[✓] B10 — Collegial mode ...... [?? null + active !== null in agentsManager] ... ■ 100%
 │      └─> [] (presidency disabled) correctly triggers _runCollegialPhase
 ├─[✓] B11 — Crisis mode ......... [runCrisisPhase() — all ministries || skip circle+pres] ■ 100%
 ├─[✓] Collegial syntheses JSON .. [aria_syntheses.json collegial — 7 regimes, FR+EN] ■ 100%
 │      └─> getSyntheseCollegial() in responseService · wired into _runCollegialPhase
 └─[✓] Collegial UI .............. [CONSTITUTIONAL SYNTHESIS · non-literal referendum] ■ 100%

 [ USER INTERFACE ] .............................................. STATUS: ✅ DONE
 ├─[✓] SVG gold cursors .......... [4 cursors #c6a24c · toggle Settings > INTERFACE] . ■ 100%
 ├─[✓] RadioPlayer topbar ........ [5 stations · localStorage · URL + local file] ..... ■ 100%
 └─[✓] Settings > INTERFACE ...... [dedicated section: cursors + radio] .............. ■ 100%

 [ DOCUMENTATION ] ............................................... STATUS: ✅ DONE
 ├─[✓] CONTRIBUTING.md + .fr.md .. [JSON schemas for 10 files · verified constraints] ■ 100%
 └─[✓] doc/ reorganised .......... [all tracking .md files in doc/] .................. ■ 100%

 [ CONSTITUTION PER COUNTRY ] ..................................... STATUS: ✅ DONE
 ├─[✓] Per-country gov override . [Independent constitution fork] ... ■ 100%
 │      └─> Each nation can have its own ministers, ministries, presidency
 ├─[✓] Council engine routing ... [getAgentsFor(country)] ........... ■ 100%
 │      └─> Council always uses the correct constitution per country
 ├─[✓] Init UI polish ........... [Glow, dark cards, emoji flags] ... ■ 100%
 │      └─> Minister/ministry glow style · fictional country tags · accordion recap
 └─[✓] World recap dialog ....... [Accordion: pres/min/ministers] ... ■ 100%

 ████████████████████████████████████████  NEXT  ████████████████████████████████

 [ PHASE B0 : STABILITY ] ......................................... STATUS: ✅ DONE
 │
 ├─[B1] Add-country bug ......... [addFictionalCountry — Dashboard_p1] ✅ 100%
 └─[B2] Country Context pipeline  [Init → in-game deliberation] ...... ✅ 100%

 [ PHASE B1 : STABILITY II ] ..................................... STATUS: ✅ DONE
 │  Post-refactor bugs + deliberation engine
 │
 ├─[B7]  setCurrentCycleQuestion → setCurrentCycleQuestions ......... ✅ fixed
 ├─[B8]  getTerrainLabel undefined in AddCountryModal ................ ✅ fixed
 ├─[B13] Refresh button (💡) missing in questions .................... ✅ fixed
 └─[B9]  Invalid ministry routing on list question ................... ✅ fixed (refactor useCouncilSession)
 ├─[B12] Destiny mode off but Oracle/Weave still active .............. ✅ fixed
 ├─[B14] Settings > Ministries: minister grid per ministry ........... ✅ fixed
 ├─[B15] ConstitutionModal > Presidency: Phare/Boussole prompts ...... ✅ fixed
 ├─[B10] Collegial mode → incorrect presidential synthesis ........... ✅ fixed
 └─[B11] Crisis mode: circle + presidency phases not skipped ......... ✅ fixed

 [ PHASE U1 : UX POLISH ] ........................................ STATUS: IN PROGRESS
 ├─[U1] Regime icons ............ [Dropdowns in Init + in-game] ..... ✅ 100%
 ├─[U2] Tile harmonisation ...... [PresidencyTiles shared — 4 screens] ✅ 100%
 │      └─> Settings · GovernanceForm · ConstitutionModal · PreLaunchScreen
 └─[U3] Chronolog enriched ....... [Last 5 cycles detail view] ....... ▶ NEXT

 [ PHASE G1 : GOVERNANCE COHERENCE ] ............................. STATUS: IN PROGRESS
 │  Spec validated (2026-03-26) — GovernanceForm exists, wiring to complete
 │
 ├─[G0] clearSession() : preserve aria_options + preferences ......... ✅ verified (no bug)
 ├─[G1] PreLaunchScreen : contextual block under active country badge . ✅ 100%
 │      └─> Lambda ⚙️ + presidency summary + [Customise →] · Custom ✦ + override summary
 ├─[G2] ConstitutionModal : lambda/custom banner + return to model .... ✅ 100%
 │      └─> Status banner between header/tabs · [↺ Return to world model] + confirm
 ├─[G3] AddCountryModal + SecessionModal : inherit/customise choice ... ⬡ 0%
 └─[G4] Settings : wire GovernanceForm context='settings' ............ ⬡ 0%

 [ PHASE V1 : WORLD MAP — FULL REWORK ] .......................... STATUS: PLANNED
 │
 │  ⚠ FULL REWORK: The entire procedural generation is being rebuilt.
 │  Current hex-grid approach is superseded. New direction TBD by owner.
 │  The council engine and country data model are map-agnostic and will
 │  survive the rework unchanged.
 │
 ├─[01] New procedural engine ... [Architecture TBD] ................ ⬡ 0%
 ├─[02] Country polygon assign .. [Territory pool → nation shapes] ... ⬡ 0%
 ├─[03] Globe projection ........ [Flat / WebGL sphere toggle] ....... ⬡ 0%
 ├─[04] Dynamic zoom ............ [Detail level scaling x1-x5] ....... ⬡ 0%
 ├─[05] Maritime zones .......... [Naval adjacency overlay] .......... ⬡ 0%
 └─[06] Terrain biomes .......... [Papercraft-layered elevation] ..... ⬡ 0%

 [ PHASE F1 : MULTI-COUNTRY FEATURES ] ........................... STATUS: QUEUED
 │
 │  Blocked on V1 map rework — country interactions depend on geography.
 │
 ├─[F1] Min 2 countries custom .. [Custom mode currently allows 1] ... ⬡ 0%
 ├─[F2] Duplicate blocking ...... [Real country picked once only] .... ⬡ 0%
 └─[F3] Settings multi-country .. [Common vs per-country config] ..... ⬡ 0%

 [ PHASE V2 : SYSTEMIC TRIGGERS ] ................................ STATUS: QUEUED
 ├─[V6] Global repercussions .... [Cross-country policy effects] .... ⬡ 0%
 │      └─> "If Country A taxes AI → Country B gains Trade,
 │           loses Diplomacy. Propagated through council context."
 ├─[V7] Crisis protocol ......... [Emergency referendums] ........... ⬡ 0%
 ├─[V8] Scenarios hub ........... [Historical & Sandbox presets] .... ⬡ 0%
 └─[V9] i18n full coverage ....... [Audit → centralise → translate] .. ⬡ 0%
        ├─> Audit all inline franglais strings (isEn ? '…' : '…')
        ├─> Centralise ~300 strings + AI prompts to ariaI18n.js
        ├─> Full FR/EN UI translation (all components)
        ├─> Sync base_agents_en.json ↔ base_agents.json
        └─> ariaQA_en.json (when ariaQA is created)

 [ PHASE V3 : LLM INFRASTRUCTURE ] .............................. STATUS: QUEUED
 ├─[V10] Dynamic model discovery  [Post-key API enumeration] ........ ⬡ 0%
 ├─[V11] Registry editor UI ..... [In-app Gist-sync manager] ........ ⬡ 0%
 └─[V12] Open-source prompts .... [Public agent prompt library] ..... ⬡ 0%

 [ PHASE V4 : QUALITY & MAINTAINABILITY ] ........................ STATUS: QUEUED
 ├─[V5] Src refactor ............ [src/components · engine · lib] .... ⬡ 0%
 └─[V8] Engine optimisation ..... [Re-renders · useCallback · AI calls] ⬡ 0%

 [ PHASE V5 : MULTIPLAYER ] ...................................... STATUS: DISTANT
 │
 │  Design principle (agreed 2026-03):
 │  Each player governs one nation in a shared world. Async turns,
 │  nation-isolated council sessions, client-side API keys.
 │
 ├─[V13] Shared world state ..... [Server or P2P world JSON] ........ ⬡ 0%
 ├─[V14] Async turn resolution .. [Cycle-close world merge] ......... ⬡ 0%
 ├─[V15] Player nation isolation  [Each player = 1 council] ......... ⬡ 0%
 ├─[V16] Cross-nation events .... [Secession, War, Alliance] ........ ⬡ 0%
 └─[V17] World save / import .... [Portable world snapshots] ........ ⬡ 0%

 [ PHASE V5 : WAR & GEOPOLITICS ] ............................... STATUS: DISTANT
 ├─[V18] Border friction ........ [Conflict at polygon edges] ........ ⬡ 0%
 ├─[V19] The Great Splitting .... [Secession with map rip] .......... ⬡ 0%
 └─[V20] Resource depletion ..... [Territory-based yields] .......... ⬡ 0%

================================================================================
 PROGRESS: [██████████░░░░░░░░░░░░░░░░░░░░░░░░] ~30%
 BASELINE: Core engine + per-country constitution complete.
           Init UX polished. Board Game offline mode complete (4-JSON pipeline).
           Single source of truth. Destiny of the World operational.
           PresidencyTiles unified. Collegial + crisis modes operational.
           Interface: SVG gold cursors + RadioPlayer topbar.
           Documentation: CONTRIBUTING complete + doc/ reorganised.
           Phase B1 done — all bugs B1→B15 fixed.
           Quality refactor (2026-04-11): src/ restructured,
           dead files removed, storage/options responsibilities clarified.
           Next: U3 Chronolog enriched.
================================================================================
```

---

## Architecture Decisions Log

### Per-Country Constitution (2026-03)
**Decision:** Each country carries its own `governanceOverride` object, merged at council call time via `getAgentsFor(country)`.

The naive approach (one global constitution for all countries) was superseded when multi-country worlds required independent governance. The adopted pattern is: `InitScreen` forks the common constitution per country → `Dashboard_p1` injects `governanceOverride` into each country object at world build time → `llmCouncilEngine` resolves the effective constitution at call time, falling back to global localStorage if no override exists. This keeps the engine stateless and the country object self-contained.

### LLM Registry (2026-03)
**Decision:** Gist-hosted `llm-registry.json` as shared source of truth, `localStorage` as personal override layer.

- `llm-registry.json` on a public Gist = what all users see by default
- `localStorage` = personal overrides, survive across sessions, cleared intentionally
- Merge on startup: Gist wins for shared keys, localStorage wins for personal additions
- To publish a new model to all users: edit the Gist in 2 clicks, no redeployment
- Fallback hardcoded in bundle if Gist is unreachable

### World Map (2026-03 → revised)
**Decision:** Full procedural generation rework. Previous hex-grid and low-poly SVG directions both superseded. New architecture TBD by project owner. Council engine and country data model are deliberately map-agnostic and will not be impacted.

### Multiplayer (2026-03)
**Decision:** Async, nation-isolated, client-side LLM keys. Server is a thin world-state relay only — API keys never touch it.

---

*See [README.md](README.md) for setup · [README.fr.md](README.fr.md) for French docs*
