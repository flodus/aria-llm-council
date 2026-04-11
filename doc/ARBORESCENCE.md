# ARBORESCENCE — ARIA LLM Council
_Mise à jour : 2026-04-11 · post-refactor Dashboard_p1_

---

```
aria/
├── src/
│   ├── App.jsx                          # Shell global, ariaRef (API impérative)
│   ├── ariaI18n.js                      # i18n FR/EN : t(), useLocale(), loadLang()
│   ├── main.jsx                         # Point d'entrée Vite
│   │
│   ├── features/
│   │   │
│   │   ├── chronolog/
│   │   │   ├── ChronologView.jsx        # Vue historique des événements
│   │   │   └── useChronolog.js          # Hook chronolog
│   │   │
│   │   ├── council/                     # Moteur délibératif LLM
│   │   │   ├── components/
│   │   │   │   ├── ConstitutionModal.jsx          # Modale constitution (in-game)
│   │   │   │   ├── CouncilModals.jsx               # GarbageModal, MismatchModal
│   │   │   │   ├── councilParts.jsx                # Composants UI conseil
│   │   │   │   ├── councilStyles.js                # Styles inline conseil
│   │   │   │   ├── LLMCouncil.jsx                  # Composant principal conseil
│   │   │   │   └── constitution/                   # Onglets de la modale constitution
│   │   │   │       ├── index.js
│   │   │   │       ├── MinisterDetail.jsx
│   │   │   │       ├── MinistersList.jsx
│   │   │   │       ├── MinistriesList.jsx
│   │   │   │       ├── MinistryDetail.jsx
│   │   │   │       ├── NewMinisterForm.jsx
│   │   │   │       ├── NewMinistryForm.jsx
│   │   │   │       ├── PresidentDetail.jsx
│   │   │   │       ├── PresidentsList.jsx
│   │   │   │       ├── PromptEditor.jsx
│   │   │   │       ├── TabDestin.jsx
│   │   │   │       ├── TabMinisteres.jsx
│   │   │   │       ├── TabMinistres.jsx
│   │   │   │       ├── TabPresidence.jsx
│   │   │   │       └── TabRegime.jsx
│   │   │   ├── contexts/
│   │   │   │   └── CouncilContext.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useConstitutionModal.js
│   │   │   │   └── useCouncilSession.js
│   │   │   └── services/
│   │   │       ├── agentsManager.js        # Agents dynamiques selon gouvernance
│   │   │       ├── constitutionValidator.js
│   │   │       ├── contextBuilder.js       # buildCountryContext()
│   │   │       ├── councilEngine.js        # Pipeline délibération ⚠ ne pas modifier sans demande
│   │   │       ├── deliberationEngine.js   # 6 phases ⚠ idem
│   │   │       ├── fallbacks.js            # FALLBACK_RESPONSES
│   │   │       ├── index.js
│   │   │       ├── routingEngine.js
│   │   │       └── voteEngine.js
│   │   │
│   │   ├── game/                        # Stubs — base pour V4 GameProvider
│   │   │   ├── GameProvider.jsx
│   │   │   ├── gameReducer.js
│   │   │   └── useGameCycle.js
│   │   │
│   │   ├── init/                        # Écran de démarrage
│   │   │   ├── InitScreen.jsx           # Écran config monde + clés API
│   │   │   ├── InitScreenLayout.jsx
│   │   │   ├── components/
│   │   │   │   ├── api/                 # Gestion clés API
│   │   │   │   │   ├── AddKeyButton.jsx
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── KeyEntryRow.jsx
│   │   │   │   │   ├── ModelSelector.jsx
│   │   │   │   │   ├── ProviderAccordion.jsx
│   │   │   │   │   └── ProviderHeader.jsx
│   │   │   │   ├── canvas/
│   │   │   │   │   └── GlobeBackground.jsx  # Globe Three.js de l'init screen
│   │   │   │   ├── flows/               # Flux de configuration pays
│   │   │   │   │   ├── CustomFlow.jsx
│   │   │   │   │   ├── DefaultAIFlow.jsx
│   │   │   │   │   ├── DefaultLocalFlow.jsx
│   │   │   │   │   ├── FlowFictionalCountry.jsx
│   │   │   │   │   ├── FlowRealCountry.jsx
│   │   │   │   │   ├── FlowTypeChoice.jsx
│   │   │   │   │   ├── index.js
│   │   │   │   │   └── RealWorldFlow.jsx
│   │   │   │   ├── government/          # Composants formulaire gouvernance
│   │   │   │   │   ├── ActiveToggle.jsx
│   │   │   │   │   ├── ColorPicker.jsx
│   │   │   │   │   ├── DeleteButton.jsx
│   │   │   │   │   ├── EmojiPicker.jsx
│   │   │   │   │   ├── Hint.jsx
│   │   │   │   │   └── index.js
│   │   │   │   ├── screens/             # Écrans de l'init (mode, nom, preset…)
│   │   │   │   │   ├── GeneratingScreen.jsx
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── ModeScreen.jsx
│   │   │   │   │   ├── NameScreen.jsx
│   │   │   │   │   └── PresetChoiceScreen.jsx
│   │   │   │   ├── ActiveMinistersSection.jsx
│   │   │   │   ├── ActiveMinistriesSection.jsx
│   │   │   │   ├── ActivePresidencySection.jsx
│   │   │   │   ├── APIKeyInline.jsx
│   │   │   │   ├── ARIAHeader.jsx
│   │   │   │   ├── ConfirmLaunchDialog.jsx
│   │   │   │   ├── ConstitutionStatus.jsx
│   │   │   │   ├── ConstitutionTabs.jsx
│   │   │   │   ├── ContextPanel.jsx
│   │   │   │   ├── CountryBadges.jsx
│   │   │   │   ├── CountryConfig.jsx
│   │   │   │   ├── CountryContextAccordion.jsx
│   │   │   │   ├── CountryEstimations.jsx
│   │   │   │   ├── CountryInfoCard.jsx
│   │   │   │   ├── CustomizeButton.jsx
│   │   │   │   ├── FictionalCountrySection.jsx
│   │   │   │   ├── IAConfigAccordion.jsx
│   │   │   │   ├── index.js
│   │   │   │   ├── MinistersDetail.jsx
│   │   │   │   ├── MinistriesDetail.jsx
│   │   │   │   ├── PreLaunchScreen.jsx
│   │   │   │   ├── PresidencyDetail.jsx
│   │   │   │   ├── RealCountryAISection.jsx
│   │   │   │   ├── RealCountryLocalSection.jsx
│   │   │   │   ├── RecapAccordion.jsx
│   │   │   │   └── WorldRecap.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── index.js
│   │   │   │   ├── useConstitution.js
│   │   │   │   ├── useCountryContext.js
│   │   │   │   ├── useCountryOverride.js
│   │   │   │   ├── useGameLaunch.js
│   │   │   │   ├── useIAConfig.js
│   │   │   │   └── useMinisterForms.js
│   │   │   └── services/
│   │   │       ├── index.js
│   │   │       ├── labels.js            # getTerrainLabel, getRegimeLabel
│   │   │       └── realCountries.js
│   │   │
│   │   ├── map/                         # Rendu carte hexagonale
│   │   │   ├── ariaHexWorld.js          # Utilitaires hex
│   │   │   ├── HexGrid.jsx              # Grille hexagonale SVG
│   │   │   ├── MapSVG.jsx               # Assembleur carte (seed → HexGrid)
│   │   │   └── WorldEngineCapsule.js    # Capsule WorldEngine pour proto
│   │   │
│   │   ├── settings/                    # Page de configuration
│   │   │   ├── Settings.jsx             # Composant Settings principal
│   │   │   ├── Settings.css             # Styles settings (exception historique)
│   │   │   ├── index.js
│   │   │   ├── components/
│   │   │   │   ├── ARIAManifeste.jsx
│   │   │   │   ├── SectionAPropos.jsx
│   │   │   │   ├── SectionConseil.jsx
│   │   │   │   ├── SectionConstitution.jsx
│   │   │   │   ├── SectionGouvernanceDefaut.jsx
│   │   │   │   ├── SectionInterface.jsx
│   │   │   │   ├── SectionSimulation.jsx
│   │   │   │   └── SectionSysteme.jsx
│   │   │   ├── ui/
│   │   │   │   └── SettingsUI.jsx       # Composants UI réutilisables settings
│   │   │   └── utils/
│   │   │       └── settingsStorage.js
│   │   │
│   │   └── world/                       # Feature monde en jeu
│   │       ├── Dashboard.jsx            # Hub composant principal (modales, FAB)
│   │       ├── LegitimiteOverlay.jsx    # Overlay légitimité ARIA
│   │       ├── components/
│   │       │   └── CountryPanel/        # Panneau latéral pays sélectionné
│   │       │       ├── CountryPanel.jsx
│   │       │       ├── CountryPanelCouncil.jsx
│   │       │       ├── CountryPanelEmpty.jsx
│   │       │       ├── CountryPanelHeader.jsx
│   │       │       ├── CountryPanelMap.jsx
│   │       │       ├── CountryPanelNavArrows.jsx
│   │       │       ├── CountryPanelTabs.jsx
│   │       │       ├── CountryPanelTimeline.jsx
│   │       │       ├── council/         # Onglets conseil du panneau pays
│   │       │       │   ├── CouncilCitizenQuestion.jsx
│   │       │       │   ├── CouncilFooter.jsx
│   │       │       │   ├── CouncilFreeQuestion.jsx
│   │       │       │   ├── CouncilMinistryItem.jsx
│   │       │       │   ├── CouncilMinistryList.jsx
│   │       │       │   ├── CouncilMinistryQuestions.jsx
│   │       │       │   └── index.js
│   │       │       ├── map/             # Onglet carte du panneau pays
│   │       │       │   ├── index.js
│   │       │       │   ├── MapActions.jsx
│   │       │       │   ├── MapARIAStats.jsx
│   │       │       │   ├── MapDemographics.jsx
│   │       │       │   ├── MapResources.jsx
│   │       │       │   └── MapSatisfaction.jsx
│   │       │       └── timeline/        # Onglet timeline du panneau pays
│   │       │           ├── index.js
│   │       │           ├── TimelineEmpty.jsx
│   │       │           ├── TimelineEventEntry.jsx
│   │       │           ├── TimelineEventList.jsx
│   │       │           └── TimelineHeader.jsx
│   │       ├── contexts/
│   │       │   └── WorldContext.jsx
│   │       ├── hooks/
│   │       │   ├── index.js
│   │       │   ├── useARIA.js           # Hook principal : état global + handlers
│   │       │   └── useCountryPanel.js
│   │       ├── modals/                  # Modales in-game
│   │       │   ├── index.js
│   │       │   ├── modalStyles.js       # Objet S — styles partagés modales
│   │       │   ├── AddCountryModal.jsx
│   │       │   ├── AIErrorModal.jsx
│   │       │   ├── CycleConfirmModal.jsx
│   │       │   ├── DiplomacyModal.jsx
│   │       │   ├── IaStatusBadge.jsx    # useIaStatus, IaStatusBadge, Toast
│   │       │   ├── SecessionModal.jsx
│   │       │   └── VoteResultModal.jsx  # ImpactPill + VoteResultModal
│   │       ├── services/
│   │       │   ├── countryEngine.js     # buildCountry*, calcAria*, ressources
│   │       │   ├── crisisEngine.js      # Moteur crises
│   │       │   ├── gameEngine.js        # doCycle, checkSeuils, getHumeur
│   │       │   ├── sessionStore.js      # save/load/clearSession, alliances
│   │       │   ├── svgWorldEngine.js    # generateWorld SVG, findSpawnPoint
│   │       │   └── WorldEngine.js       # Moteur hexagonal (carte rendu)
│   │       └── utils/
│   │           ├── countryHelpers.js
│   │           └── index.js
│   │
│   └── shared/                          # Transversal à toutes les features
│       ├── components/                  # Composants UI réutilisables
│       │   ├── index.js
│       │   ├── AgentGrid.jsx
│       │   ├── BackButton.jsx
│       │   ├── ButtonRow.jsx
│       │   ├── Card.jsx
│       │   ├── EmojiPicker.jsx
│       │   ├── GovernanceForm.jsx
│       │   ├── HeaderTitle.jsx
│       │   ├── PresidencyList.jsx
│       │   ├── PresidencyTiles.jsx
│       │   ├── RadioPlayer.jsx
│       │   ├── SubtitleCard.jsx
│       │   └── TitleCard.jsx
│       ├── config/
│       │   └── options.js               # DEFAULT_OPTIONS, getOptions, saveOptions
│       ├── constants/
│       │   └── llmRegistry.js           # Registre providers LLM
│       ├── data/
│       │   ├── ariaData.js              # LOCAL_EVENTS, LOCAL_DELIBERATION, LOCAL_COUNTRIES ⚠
│       │   ├── gameData.js              # getStats, getAgents, REGIMES, TERRAINS…
│       │   └── worldLabels.js           # getTerrainLabel, getRegimeLabel
│       ├── hooks/
│       │   ├── useAccordion.js
│       │   └── useAriaOptions.js
│       ├── services/
│       │   ├── index.js
│       │   ├── iaStatusStore.js         # setIaStatus, getIaStatus
│       │   ├── storage.js
│       │   ├── boardgame/
│       │   │   ├── questionService.js
│       │   │   └── responseService.js
│       │   ├── country/
│       │   │   ├── index.js
│       │   │   └── validation.js
│       │   └── llm/                     # Moteur IA
│       │       ├── index.js
│       │       ├── aiService.js         # callAI, callModel, prompts, clés API
│       │       ├── providerManager.js   # Stub — V4
│       │       └── clients/             # Stubs — V4
│       │           ├── claudeClient.js
│       │           ├── geminiClient.js
│       │           └── openaiClient.js
│       ├── theme/                       # Design tokens ⚠ ne pas modifier sans demande
│       │   ├── applyTheme.js
│       │   ├── ariaTheme.js
│       │   ├── colors.js
│       │   ├── components.js
│       │   └── index.js
│       └── utils/
│           ├── agentsOverrides.js
│           ├── curseurs.js
│           ├── normalizeCountry.js
│           ├── prng.js                  # seededRand, strToSeed, randRange…
│           └── storage.js
│
├── templates/                           # Données de jeu (JSON)
│   └── languages/
│       ├── fr/
│       │   ├── governance.json          # Ministres, ministères, présidence (FR)
│       │   └── simulation.json          # Régimes, terrains, humeurs, cycles (FR)
│       └── en/
│           ├── governance.json
│           └── simulation.json
│
├── public/                              # Assets statiques
├── doc/                                 # Documentation projet
│   ├── ARBORESCENCE.md                  # Ce fichier
│   ├── ARIA_CONTEXT.md                  # Base de connaissances permanente
│   ├── ROADMAP.fr.md
│   ├── TODO.md
│   ├── REFLEXIONS.md
│   └── MIGRATION_NOTES.md
│
├── App.css                              # Tokens CSS + classes globales (source de vérité)
├── CLAUDE.md                            # Instructions Claude Code
├── vite.config.js                       # base: '/aria-llm-council/' (GitHub Pages)
└── server.js                            # Dormant — base V4 multijoueur + proxy RSS
```

---

## Notes

- `⚠` = ne pas modifier sans demande explicite
- `Stubs V4` = fichiers vides, réservés pour l'architecture multijoueur future
- `shared/` = code transversal, jamais lié à une feature spécifique
- `Settings.css` = exception historique (CSS fichier séparé) — refactorisé et nettoyé (793L → 584L)
