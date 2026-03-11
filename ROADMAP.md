# 🗺️ ARIA — Strategic Roadmap

> *Français : [ROADMAP.fr.md](ROADMAP.fr.md)*

```text
================================================================================
  ARIA STRATEGIC ROADMAP  —  v8.0
  Last updated: 2026-03
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

 [ CONSTITUTION PER COUNTRY ] ..................................... STATUS: ✅ DONE
 ├─[✓] Per-country gov override . [Independent constitution fork] ... ■ 100%
 │      └─> Each nation can have its own ministers, ministries, presidency
 ├─[✓] Council engine routing ... [getAgentsFor(country)] ........... ■ 100%
 │      └─> Council always uses the correct constitution per country
 ├─[✓] Init UI polish ........... [Glow, dark cards, emoji flags] ... ■ 100%
 │      └─> Minister/ministry glow style · fictional country tags
 └─[✓] World recap dialog ....... [Accordion: pres/min/ministers] ... ■ 100%

 ████████████████████████████████████████  NEXT  ████████████████████████████████

 [ PHASE B0 : STABILITY ] ......................................... STATUS: 🔴 NOW
 │
 │  Pre-requisite before any new feature. Two known open issues.
 │
 ├─[B1] Add-country bug ......... [Console error on in-game add] .... ⬡ 0%
 │      └─> F12 investigation needed — likely a state mutation issue
 └─[B2] Country Context pipeline  [Init → in-game deliberation] .... ⬡ 0%
        └─> Context mode + override not reliably reaching council prompts

 [ PHASE U1 : UX POLISH ] ........................................ STATUS: QUEUED
 ├─[U1] Regime icons ............ [Dropdowns in Init + in-game] ..... ⬡ 0%
 ├─[U2] Tuile harmonization ..... [Init ↔ Settings ↔ in-game popup] . ⬡ 0%
 │      └─> Same minister/ministry tile style across all 3 contexts
 └─[U3] Chronolog enriched ....... [Last 5 cycles detail view] ....... ⬡ 0%

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
 └─[V9] i18n support ............ [FR/EN switch at startup] ......... ⬡ 0%

 [ PHASE V3 : LLM INFRASTRUCTURE ] .............................. STATUS: QUEUED
 ├─[V10] Dynamic model discovery  [Post-key API enumeration] ........ ⬡ 0%
 ├─[V11] Registry editor UI ..... [In-app Gist-sync manager] ........ ⬡ 0%
 └─[V12] Open-source prompts .... [Public agent prompt library] ..... ⬡ 0%

 [ PHASE V4 : MULTIPLAYER ] ...................................... STATUS: DISTANT
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
 PROGRESS: [█████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] ~16%
 BASELINE: Core engine + per-country constitution complete.
           2 bugs to fix · Map full rework incoming.
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
