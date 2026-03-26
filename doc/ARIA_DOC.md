# ARIA — Project Documentation
*Multi-agent governance simulation · v7.5 · 2026*

---

## I. What ARIA Is

ARIA is a governance simulator in which you lead one or more nations through cycles of collective deliberation. Every decision is debated by a **Council of 12 ministers**, arbitrated by a **configurable Presidency**, and submitted to a **popular vote**.

This is not a strategy game. It is a space for experimental political thinking — to explore what an augmented democracy might look like, what a collegial theocracy would decide, or how an authoritarian regime responds to an existential crisis.

**ARIA can operate in two ways:**
- **With LLMs** (Claude, Gemini, Grok, OpenAI) — each minister genuinely deliberates, syntheses are generated, positions evolve over cycles.
- **Without any AI** (Board Game Mode) — all editorial content is preloaded in JSON files. Zero API, zero latency, fully offline.

---

## II. The Council — Deliberation Architecture

### The 12 Ministers

Each minister embodies an **astrological archetype**. This is not mysticism: it is a way to give each agent a coherent philosophy, a distinctive stance, a recognizable way of arguing.

| Minister | Sign | Role in debate |
|---|---|---|
| ♈ The Initiator | Aries | Rupture, direct action, urgency |
| ♉ The Guardian | Taurus | Continuity, solidity, patrimonial caution |
| ♊ The Communicator | Gemini | Connections, plurality, information flows |
| ♋ The Protector | Cancer | Security, emotional intelligence, social safety net |
| ♌ The Ambassador | Leo | Prestige, radiance, soft consensus |
| ♍ The Analyst | Virgo | Precision, audit, systemic critique |
| ♎ The Arbitrator | Libra | Equity, procedure, fair balance |
| ♏ The Investigator | Scorpio | Hidden risks, corruption, transformation |
| ♐ The Guide | Sagittarius | Long vision, philosophy, 20-year horizon |
| ♑ The Strategist | Capricorn | Sustainability, efficiency, structures |
| ♒ The Inventor | Aquarius | Technological rupture, reinvention |
| ♓ The Healer | Pisces | Human dimension, care, spiritual depth |

Each minister has a **default stance** (radical · cautious · status quo), an **essence**, a **communication style**, and an **annotation** — the question they systematically raise in Council.

Everything is **editable**: prompts, essences, stances, names, colors. Each nation can have its own ministers.

---

### The 7 Ministries

| Ministry | Emoji | Domain |
|---|---|---|
| Justice & Truth | ⚖️ | Procedural equity, anti-corruption |
| Economy & Resources | 💰 | Economic flows, reserves, growth |
| Defense & Sovereignty | ⚔️ | National security, long-term strategy |
| Health & Social Protection | 🏥 | Safety net, wellbeing, public health |
| Education & Elevation | 🎓 | Knowledge, culture, transmission |
| Ecological Transition | 🌿 | Sober disruption, biodiversity, energy |
| Industry & Infrastructure | ⚙️ | Production, circular systems, infrastructure |

Every submitted question is **automatically routed** to the competent ministry (semantic analysis or keywords). If the question is transversal or unclassifiable, a **bureaucratic mode** engages the full Council.

---

### The Presidency — 4 configurations

The Presidency arbitrates after ministerial deliberations. It is not a chief executive: it is a **last-resort synthesizer**.

| Mode | Symbol | Summary |
|---|---|---|
| **Solar — Lighthouse** | ☉ | Lighthouse alone. Long-term vision, assumed authority, clear direction. |
| **Lunar — Compass** | ☽ | Compass alone. People's memory, intuition, instinctive protection. |
| **Dual** | ☉☽ | Lighthouse + Compass in absolute equality. No deputy: two sovereign voices. |
| **Collegial** | ✡ | No presidency. The 12 ministers synthesize directly. Constitutional vote. |

The presidency is **not a decorator**: in ARIA mode (LLM), each figure generates its own position before the final synthesis. In Board Game mode, JSON syntheses are differentiated by mode.

---

### The 6 phases of a deliberation

```
1. PEOPLE         → the question enters the Council
2. MINISTRY       → 2 assigned ministers deliberate
3. CIRCLE         → the other ministries annotate
4. [DESTINY]      → Oracle + Wyrd intervene if crisis detected (optional)
5. PRESIDENCY     → arbitration synthesis (or constitutional if ✡)
6. VOTE           → the people decide. Satisfaction fluctuates.
```

The vote can be **YES/NO** (referendum) or **LIGHTHOUSE/COMPASS** (binary arbitration between two visions).

---

## III. Experience Modes

### LLM Mode — Living Deliberation

Each role can be assigned to a different provider and model:

| Role | AI Key | What it generates |
|---|---|---|
| Minister A | Provider 1 | Position, argument, keyword |
| Minister B | Provider 2 | Counter-position, nuance |
| Ministry synthesis | Provider 3 | Convergence or divergence + recommendation |
| Circle | Provider | Short annotations from other ministries |
| Lighthouse | Provider 4 | Presidential vision |
| Compass | Provider 5 | Presidential memory |
| Presidential synthesis | Provider 6 | Final arbitration + question to vote |

Available architecture modes:
- **ARIA** — multi-provider orchestration
- **SOLO** — one single provider for everything (maximum coherence)
- **CUSTOM** — role-by-role assignment

---

### Board Game Mode — Zero AI

Activatable from the home screen. No API key required.

The full editorial content is embedded in JSON files:

- `aria_questions.json` — question pools by ministry + existential questions
- `aria_reponses.json` — responses by archetype × regime × stance (radical · cautious · status quo)
- `aria_syntheses.json` — deliberation syntheses (ministry × regime × convergence)
- `aria_annotations.json` — inter-ministerial circle annotations

All these files have a **complete EN mirror** under `templates/languages/en/`.

In Board Game mode:
- Questions come from the JSON pool (keyword routing or random)
- Each minister responds according to their archetype × the active regime × their stance
- Syntheses and annotations are drawn from the corresponding JSON
- The vote is computed, satisfaction fluctuates, the Chronolog updates

**Playable solo, with others, or in workshops** — no connection, no server required.

---

## IV. Nations — Total Customization

### What a nation contains

Each country in ARIA is not just a name and a flag. It is a complete political entity:

- **Political regime** (among 12 — see section VI)
- **Configured presidency** (Lighthouse · Compass · Dual · Collegial)
- **Ministry constitution** (which ones are active, their prompts)
- **Personalized agents** (essences, styles, stances specific to this nation)
- **ARIA score** (democratic health index)
- **Popular satisfaction** (fluctuates with each vote)
- **Resources, terrain, geopolitical bloc**

### What is customizable, everywhere, at all times

From the **Init screen**, before launch:
- Choose or generate a world (deterministic seed)
- Configure global world governance (default presidency, active ministries)
- Override each country's constitution independently

From the **Constitution modal** (in-game), during a session:
- Change a country's regime
- Switch the presidency mode
- Activate/deactivate individual ministries and ministers
- Modify each agent's prompts
- Revert to the world model default

From **Settings**, at any time:
- Switch AI mode
- Reconfigure provider/model assignments
- Modify the default governance
- Activate or deactivate Destiny of the World

There is no "final configuration". Everything can be reconfigured between cycles.

---

## V. Destiny of the World — Oracle & Wyrd

### Context

Some crises are beyond the scope of any ministry. They are **existential** — global pandemic, climate collapse, discovery of non-human intelligence, extraterrestrial contact. Ordinary political debate is not enough.

**Destiny of the World** is a block separate from the Council — neither ministry nor presidency. These are two philosophical voices that intervene when the fabric of reality tears.

### The Oracle (👁️)

Reads the signs. Decodes the hidden probabilities behind the question. Sees what ministers refuse to see. The Oracle does not decide — it reveals what is actually happening.

### The Weave / Wyrd (🕸️)

Turns random chance into will. What fate imposes, the Weave forces you to own as a choice. Wyrd does not predict — it compels decision in the face of uncertainty.

### Activation

- Activation is **global** (Settings > Governance) or **per country** (Constitution)
- Crisis detection is **automatic**: if the question's keywords match existential domains, crisis mode triggers
- In crisis mode: **all ministries deliberate in parallel**, the circle and presidency are bypassed, both Destiny voices are injected into the final synthesis

### The spiritual dimension

Destiny is not religious in any institutional sense. But it occupies the space that some governance systems assign to a Ministry of Religious Affairs or Spiritual Matters — **the questions that rational politics cannot answer**.

In theocratic regimes, Destiny is activated by default.

---

## VI. Political Regimes

12 regimes available. Each one affects:
- The **satisfaction multiplier** (how the people respond to decisions)
- The **default economic growth rate**
- The **base ARIA score** (democratic health measure)
- The **JSON syntheses** (each regime produces a different ministerial tone)
- The **archetypal responses** (stances adapted to the political context)

| Regime | Emoji | Bloc | ARIA score | Satisfaction × |
|---|---|---|---|---|
| Liberal Democracy | 🗳️ | West | 48 | 1.2× |
| Direct Democracy | 🗳️ | West | 52 | 1.35× |
| Federal Republic | 🏛️ | West | 44 | 1.0× |
| Constitutional Monarchy | 👑 | West | 38 | 0.9× |
| ARIA Technocracy | 🤖 | Techno | 72 | 0.85× |
| Communism | ☭ | East | 32 | 0.78× |
| Oligarchy | 💼 | Authoritarian | 26 | 0.75× |
| Absolute Monarchy | 👑 | Authoritarian | 28 | 0.72× |
| Theocracy | 🕌 | Authoritarian | 18 | 0.8× |
| Authoritarian Regime | 🔒 | Authoritarian | 20 | 0.65× |
| Authoritarian Nationalism | ⚡ | Authoritarian | 14 | 0.68× |
| Military Junta | 🎖️ | Authoritarian | 16 | 0.7× |

The **ARIA score** is not a moral judgment — it is a systemic resilience index. A well-managed theocracy can outperform a democracy in crisis.

Each country can have its own regime. Two nations can deliberate on the same question with radically opposed constitutions — and reach incompatible conclusions.

---

## VII. The Chronolog

At each cycle, ARIA records in the **Chronolog**:
- The question submitted to the Council
- The ministers' positions
- The presidential synthesis
- The vote result
- The impact on satisfaction and ARIA score

The Chronolog also serves as **memory injected into prompts**: after 5 cycles, previous deliberations are summarized and integrated into the context of every new question. The agents remember.

---

## VIII. What is playable today

| Feature | Status |
|---|---|
| Multi-LLM Council (6 phases) | ✅ Complete |
| Board Game mode (zero AI) | ✅ Complete |
| 4 presidency modes | ✅ Complete |
| 12 political regimes | ✅ Complete |
| Crisis mode (all ministries) | ✅ Complete |
| Collegial mode (✡) | ✅ Complete |
| Destiny of the World (Oracle + Wyrd) | ✅ Complete |
| Per-country constitution (in-game) | ✅ Complete |
| Agent customization (prompts, essences) | ✅ Complete |
| Secession and new nations | ✅ Complete |
| Chronolog with cycle snapshots | ✅ Complete |
| World map (procedural generation) | ⬡ Rebuild planned |
| Multiplayer network | ⬡ server.js base laid |

---

## IX. What ARIA is not

ARIA **is not** a strategy simulator where you maximize stats. Satisfaction can stay low for dozens of cycles in an authoritarian regime — that is coherent behavior, not a bug.

ARIA **is not** a propaganda tool. All regimes are playable, all stances are represented. The liberal Guide and the Investigator under a military junta run on the same engine — only the JSON syntheses differ.

ARIA **is** a space for reflection on what governing means — which questions deserve to be asked, how a political system responds to the same crisis according to its foundational values.

---

*French codebase — intentional choice. Bilingual content FR/EN (complete mirrors). Contributions welcome in both languages.*
*[GitHub](https://github.com/flodus/aria-llm-council) · [Demo](https://flodus.github.io/aria-llm-council)*
