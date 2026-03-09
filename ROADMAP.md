# 🗺️ ARIA — Strategic Roadmap

> *Français : [ROADMAP.fr.md](ROADMAP.fr.md)*

```text
================================================================================
  ARIA STRATEGIC ROADMAP  —  v7.5 baseline
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

 ████████████████████████████████████████  NEXT  ████████████████████████████████

 [ PHASE V1 : WORLD MAP ] ......................................... STATUS: PLANNED
 │
 │  ⚠ CONCEPT CHANGE: Hex-Grid replaced by Procedural Low-Poly SVG
 │  The original hex-grid approach (Phases V1/V4) has been superseded.
 │  New direction: layered SVG world map with PRNG terrain generation,
 │  country polygon assignment, and optional WebGL globe projection.
 │  Hex logic (ZEE, border friction) will be reinterpreted as polygon
 │  adjacency and naval zone overlays — same design goals, better fit
 │  for ARIA's aesthetic and React-native rendering.
 │
 ├─[01] Procedural SVG Map ...... [PRNG polygon world gen] .......... ⬡ 0%
 │      └─> Country shapes assigned from world territory pool
 ├─[02] Globe Projection ........ [Robinson / WebGL sphere] ......... ⬡ 0%
 │      └─> Toggle between flat planisphere and 3D globe
 ├─[03] Dynamic Zoom ............ [Detail level scaling x1-x5] ...... ⬡ 0%
 ├─[04] Maritime Zones .......... [Naval adjacency overlay] ......... ⬡ 0%
 └─[05] Terrain Biomes .......... [Papercraf-layered elevation] ..... ⬡ 0%
        └─> Visual style: low-poly papercraft with color-coded strata

 [ PHASE V2 : SYSTEMIC TRIGGERS ] ................................ STATUS: QUEUED
 ├─[06] Global Repercussions .... [Cross-country policy effects] .... ⬡ 0%
 │      └─> "If Country A taxes AI → Country B gains Trade,
 │           loses Diplomacy. Propagated through council context."
 ├─[07] Crisis Protocol ......... [Emergency referendums] ........... ⬡ 0%
 ├─[08] Scenarios Hub ........... [Historical & Sandbox presets] .... ⬡ 0%
 └─[09] i18n Support ............ [FR/EN switch at startup] ......... ⬡ 0%

 [ PHASE V3 : LLM INFRASTRUCTURE ] .............................. STATUS: QUEUED
 │
 │  Architecture decided: Gist-hosted registry (llm-registry.json)
 │  as public source of truth. localStorage as personal override layer.
 │  Both merge at startup. No server, no token, no redeployment needed.
 │  Gist edited in 2 clicks to publish new models to all users.
 │
 ├─[10] Dynamic Model Discovery . [Post-key API enumeration] ........ ⬡ 0%
 │      └─> After key entry in Init, query provider /models endpoint
 │           to enrich registry with actually-available model IDs.
 │           ★ marker on recommended default preserved in all modes.
 ├─[11] Registry Editor UI ...... [In-app Gist-sync manager] ........ ⬡ 0%
 └─[12] Open-Source Prompts ..... [Public agent prompt library] ..... ⬡ 0%

 [ PHASE V4 : MULTIPLAYER ] ...................................... STATUS: DISTANT
 │
 │  Design principle (agreed 2026-03):
 │  Each player governs one nation in a shared world. Players do NOT
 │  share the same screen — each has their own council session and
 │  votes independently. Cross-player effects propagate through the
 │  systemic trigger layer (Phase V2). No real-time sync required:
 │  turns resolve asynchronously, world state merges on cycle close.
 │
 │  populationWeight already stubbed in handleVote():
 │    total = population / 1_000_000 × 10 × 10_000
 │  Will be exposed cleanly when server architecture is decided.
 │
 │  Likely stack: lightweight Node.js relay + shared world JSON,
 │  or serverless (Supabase / PocketBase) for world state sync.
 │  API keys remain client-side — never touch the server.
 │
 ├─[13] Shared World State ...... [Server or P2P world JSON] ........ ⬡ 0%
 ├─[14] Async Turn Resolution ... [Cycle-close world merge] ......... ⬡ 0%
 ├─[15] Player Nation Isolation . [Each player = 1 council] ......... ⬡ 0%
 ├─[16] Cross-Nation Events ..... [Secession, War, Alliance] ........ ⬡ 0%
 └─[17] World Save / Import ..... [Portable world snapshots] ........ ⬡ 0%

 [ PHASE V5 : WAR & GEOPOLITICS ] ............................... STATUS: DISTANT
 ├─[18] Border Friction ......... [Conflict at polygon edges] ........ ⬡ 0%
 ├─[19] The Great Splitting ..... [Secession with map rip] .......... ⬡ 0%
 └─[20] Resource Depletion ...... [Territory-based yields] .......... ⬡ 0%

================================================================================
 PROGRESS: [████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] ~12%
 BASELINE: Core deliberation engine complete. Map & multiplayer pending.
================================================================================
```

---

## Architecture Decisions Log

### LLM Registry (2026-03)
**Decision:** Gist-hosted `llm-registry.json` as shared source of truth, `localStorage` as personal override layer.

The standard pattern (Option A: localStorage only / Option B: download JSON → git push) both have drawbacks. The adopted architecture merges both cleanly:

- `llm-registry.json` on a public Gist = what all users see by default
- `localStorage` = personal overrides, survive across sessions, cleared intentionally
- Merge on startup: Gist wins for shared keys, localStorage wins for personal additions
- To publish a new model to all users: edit the Gist in 2 clicks, no redeployment
- Fallback hardcoded in bundle if Gist is unreachable (network failure resilience)

**Future improvement:** after API key entry in Init, query each provider's `/models` endpoint to discover actually-available model IDs. Registry then becomes a curated default layer, not a constraint.

### World Map (2026-03)
**Decision:** Hex-grid concept (original V1/V4) replaced by procedural low-poly SVG.

Hex grids are geometrically clean but fight against React's SVG rendering model and ARIA's existing aesthetic (PRNG polygon globe, papercraft layering). The new direction preserves all original design goals (ZEE logic → polygon adjacency, terrain biomes → elevation strata, border friction → edge conflict detection) while staying native to the existing renderer.

### Multiplayer (2026-03)
**Decision:** Async, nation-isolated, client-side LLM keys.

Real-time sync between council sessions is unnecessary and expensive. Each player runs their own full council locally; only world-state deltas (vote outcomes, territory changes, diplomatic events) are shared. API keys never leave the client — the server is a thin world-state relay, not an AI proxy.

---

*See [README.md](README.md) for setup · [README.fr.md](README.fr.md) for French docs*
