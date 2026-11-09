# Inventaire UI — éléments dupliqués

_Date : 2026-11-09 · Branche : `docs/coherence-roadmap-todo` · Méthode : lecture du code par recherche de motifs (grep), sans lancer l'application. Les chiffres sont des ordres de grandeur, pas un comptage exact._

Objectif : repérer ce qui est défini à plusieurs endroits, pour appliquer le principe directeur de CLAUDE.md (un seul composant, un seul endroit pour les styles).

---

## 0. Dernier gros chantier (par commits)

**Intégration du globe 3D « ma-planète »**, du 20 mars au 14 avril 2026.

- Démarrage : commits `1b53c2f` « aria planete » (20 mars) et `ed63eb2` « pourIntegration/ma-planete » (25 mars). Ce sont les plus gros diffs de l'historique récent, environ 10 000 lignes chacun.
- Intégration : commits `7676e3f` « MP1-MP5 » (14 avril), puis `d6eea1e`, `db40017`, `83736ef`.
- Fin : PR #74, #75 et #76 fusionnées le 14 avril 2026.
- Journée la plus chargée : 22 mars, 74 commits (travail sur plusieurs sujets, pas seulement le globe).

Chantier précédent : refactor Chronolog + Chroniqueur (PR #63 à #65, 11 et 12 avril), puis STORAGE_KEYS (PR #70, 12 avril).

---

## 1. Modales et overlays

**Constat : deux façons de faire coexistent.**

| Approche | Fichiers | Remarque |
|---|---|---|
| `S.overlay` / `S.modal` (`src/features/world/modals/modalStyles.js`) | 7 fichiers importent ce module | Le plus proche d'une source unique, mais il vit dans `world/` et ne couvre pas tout |
| Overlay `position: fixed` écrit en ligne | 20 fichiers | Chacun avec son propre fond et son propre z-index |

Fonds d'overlay trouvés, tous différents : `rgba(0,0,0,0.75)` (ConstitutionModal), `rgba(4,8,18,0.92)` (ConfirmLaunchDialog), `rgba(8,13,22,0.98)` (EmojiPicker), plus les variantes de `modalStyles.js`.

Fichiers concernés :
- Modales « métier » : `AddCountryModal`, `AIErrorModal`, `CycleConfirmModal`, `DiplomacyModal`, `SecessionModal`, `VoteResultModal` (`features/world/modals/`)
- Constitution et conseil : `ConstitutionModal` (`features/council/components/`), `CouncilModals.jsx`
- Lancement : `ConfirmLaunchDialog` (`features/init/components/`)
- Autres overlays : `LegitimiteOverlay` (`features/world/`), `App.jsx` (3 overlays), `RadioPlayer`, `PreLaunchScreen` (2 chacun), plusieurs écrans `init/` (flows, screens, GeneratingScreen, NameScreen)

**Risque concret** : une modale peut s'ouvrir avec un fond différent selon l'endroit d'où elle vient.

---

## 2. Boutons

- **250** balises `<button` dans `src/`.
- **58** fichiers définissent un `cursor: 'pointer'` en ligne, donc un style de bouton propre.
- Il existe déjà des styles partagés : `BTN_PRIMARY` et `BTN_SECONDARY` (`src/shared/theme/ariaTheme.js`), utilisés dans **41** fichiers. Mais il n'y a aucun composant `Button`.
- `modalStyles.js` redéfinit à part `cancelBtn`, `saveBtn`, `relBtn`, `relBtnActive`.
- `App.css` contient des classes de bouton (`cp-act-btn`), utilisées dans le panneau pays. Un troisième système.

Les 250 boutons se répartissent entre au moins trois systèmes : les constantes du thème, les classes CSS et les styles en ligne.

Les plus gros fichiers de boutons : `SectionSysteme` (11), `ConstitutionModal` (11), `AddCountryModal` (9), `RadioPlayer` (8), `SectionConstitution` (8), `PreLaunchScreen` (8).

---

## 3. Champs de saisie (input, select, textarea)

- **116** champs au total.
- Un kit existe : `src/features/settings/ui/SettingsUI.jsx` exporte `Field`, `TextInput`, `TextArea`, `Toggle`, `Select`, `NumberInput`, `SectionTitle`, `SaveBadge`, `DangerButton`. Il n'est importé que par les sections de Settings (7 fichiers). Il est en plus enfermé dans `features/settings/`, alors qu'il devrait être partagé.
- **Doublon confirmé** : `Toggle` est défini deux fois, dans `SettingsUI.jsx` et dans `src/shared/components/GovernanceForm.jsx` (ligne 94). Le second est dans un composant partagé.
- Champs écrits à la main hors du kit : `MinistersDetail` (9), `NewMinisterForm` (6), `APIKeyInline` (7), `AddCountryModal` (6), `PresidencyDetail` (7), `IAConfigAccordion` (4), `NewMinistryForm` (4), `TabPresidence` (4).

---

## 4. Tuiles, cartes et affichage de la présidence

- Composants partagés déjà présents : `PresidencyTiles`, `PresidencyList`, `Card`, `TitleCard`, `SubtitleCard`, `HeaderTitle`, `AgentGrid`.
- `CountryInfoCard` est dans `features/init/components/`, et ne réutilise pas `Card`.
- La présidence (Phare, Boussole) est affichée par au moins 10 fichiers : `PresidencyTiles`, `PresidencyList`, `PresidencyDetail` (init), `councilParts`, `RecapAccordion`, `IAConfigAccordion`, `WorldRecap`, `ChronologView`, `LLMCouncil`, `SectionGouvernanceDefaut` et `SectionSysteme`. Il faut vérifier lesquels réaffichent la même tuile, et lesquels sont des usages légitimes.

---

## 5. Styles en ligne (rappel)

- **1 497** occurrences de `style={{` dans **118** fichiers sur **136** fichiers JSX.
- Dans `shared/components/` (qui doit être la source unique), les plus chargés sont `RadioPlayer` (32), `GovernanceForm` (33), `PresidencyTiles` (17), `PresidencyList` (17), `AgentGrid` (9). Un composant partagé qui s'appuie sur des styles en ligne reste une source unique pour sa structure, mais pas pour son apparence.

---

## 6. Ordre de travail proposé

1. **Modale** : un seul composant `Modal` dans `src/shared/components/`, qui remplace les overlays en ligne et `modalStyles.js`. C'est le point où un changement de fond ou de z-index se voit le plus.
2. **Champs** : déplacer le kit de `SettingsUI.jsx` vers `src/shared/components/` et supprimer le `Toggle` en double de `GovernanceForm.jsx`.
3. **Boutons** : un composant `Button` avec trois variantes (primary, secondary, danger), à partir de `BTN_PRIMARY` et `BTN_SECONDARY`.
4. **Présidence** : un seul affichage, `PresidencyTiles`, réutilisé par les autres.
5. **Styles** : fusionner `Settings.css` dans `App.css`, puis migrer les styles en ligne composant par composant, en commençant par `shared/components/`.

Chaque étape doit passer par `npm run build` et une vérification visuelle dans l'application, que cet inventaire ne couvre pas.

---

## 7. Limites de cet inventaire

- Fait par recherche de motifs dans le code. Aucun écran n'a été ouvert, donc les doublons visuels ne sont pas vérifiés.
- Les décomptes sont approximatifs : certains `<button` ou champs sont dans des fichiers qui ne sont pas des écrans.
- Question ouverte, déjà signalée : les couleurs sont définies à la fois dans `colors.js` / `ariaTheme.js` (JS) et dans `App.css` (CSS). Il faut choisir une seule source pour les tokens avant la migration des styles.
