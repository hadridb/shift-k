# Shift-K — Memoire long terme pour Claude Code

> Ce fichier est lu automatiquement par Claude Code a chaque session.
> Il est la **source de verite** sur le contexte, les decisions, et l'etat du projet.

---

## Identite du projet

**Shift-K** est une application desktop cross-platform (Mac + Windows) qui automatise et orchestre le workflow des AI directors qui produisent des visuels et animations IA pour des clients luxe. Elle resout un probleme tres concret : ces createurs jonglent entre 4-5 clients en parallele, telechargent des dizaines de fichiers par jour depuis Runway, Higgsfield, Kling, Luma, Sora, Krea, Midjourney, et perdent un temps fou a les ranger manuellement dans la bonne arborescence de projet client.

Le produit assure le **routage automatique en temps reel** depuis le dossier Downloads vers une structure de projet client / stage / jour. Il fournit un **overlay always-on-top minimaliste** qui montre en permanence le client actif et le stage. Il permet de **switcher entre clients en un raccourci clavier** (Ctrl+Alt+1..9), de **capturer les metadonnees** (prompt, seed, parametres) directement depuis les plateformes IA via une extension navigateur, et de **rechercher** parmi tous les plans generes par prompt ou caracteristique.

## Persona cible

AI directors / freelancers haut de gamme qui :
- Bossent pour des maisons luxe (Gucci, Bvlgari, Lancome, Estee Lauder, Boucheron, Helena Rubinstein, etc.)
- Utilisent quotidiennement 3-5 plateformes IA generative
- Livrent en montage DaVinci Resolve (ou Premiere)
- Sont sur Mac (~70%) ou Windows (~30%)
- Sont sensibles au design produit, n'ouvriront jamais un terminal
- Sont prets a payer 29-49 EUR/mois pour gagner 1-2h par jour

Persona de reference : **Hadrien Durand-Baissas** (le co-architecte de ce projet, qui l'utilise en production sur ses propres campagnes).

## Heritage V1 (Phasma PowerShell)

Une **V1 fonctionnelle existe deja** en PowerShell + AHK, deployee sur la machine d'Hadrien. Elle est **gelee** (voir `E:\000 My Razer Blade\Documents\Phasma\000 Phasma Missions\_PHASMA_SYSTEM\_FROZEN_V1.md`). La logique metier est solide et a ete testee en conditions reelles ; le port vers TypeScript doit en **preserver les comportements exacts**. Voir `docs/V1_REFERENCE.md` pour le mapping V1 -> V2.

**Piege au demarrage V1 vs V2 (15/05/2026)** : V1 s'installait via deux taches Task Scheduler Windows — `Phasma-Watcher` (running) et `Phasma-Overlay` (ready). Tant que ces taches restent activees, V1 continue de surveiller `~/Downloads` en parallele de V2 et **vole les fichiers** que V2 devrait router (le pause de V2 ne sert a rien dans ce cas). Si un test de routage montre des fichiers qui disparaissent vers une destination inattendue : verifier `Get-ScheduledTask Phasma-Watcher,Phasma-Overlay` et `Disable-ScheduledTask` les deux. V1 reste installe sur disque comme fallback manuel.

## Stack technique (decidee, voir docs/DECISIONS.md)

- **Framework desktop** : Electron 33+
- **UI** : React 18 + TypeScript 5 + Tailwind CSS 3 + shadcn/ui (composants quand pertinents)
- **Bundler** : Vite (renderer) + tsc/esbuild (main)
- **Package manager** : npm (pnpm abandonne : drive E: exFAT sans symlinks, voir ADR-020)
- **File watching** : chokidar
- **Persistance config** : electron-store (wrapper JSON cross-platform avec migration)
- **Persistance metadonnees** (Phase Gamma) : better-sqlite3
- **Tests** : Vitest + Testing Library
- **Linting** : ESLint flat config + Prettier
- **Packaging** : electron-builder (DMG/PKG Mac, NSIS Win)
- **Auto-update** : electron-updater + S3 / GitHub Releases
- **Code signing** : Apple Developer ID (Mac), Sectigo EV cert (Win - phase release)
- **Hotkeys natifs** : Electron globalShortcut (a verifier ; sinon AHK Mac via systeme natif + fallback)

## Structure du code (a respecter strictement)

```
shift-k/
├── src/
│   ├── main/              # Electron main process (Node)
│   │   ├── index.ts       # entry
│   │   ├── windows/       # BrowserWindow factories (overlay, settings, onboarding)
│   │   ├── ipc/           # IPC handlers exposed to renderer
│   │   ├── tray.ts        # menu bar (Mac) / tray icon (Win)
│   │   └── shortcuts.ts   # globalShortcut registration
│   ├── renderer/          # React UI (browser context)
│   │   ├── overlay/       # the always-on-top window
│   │   ├── settings/      # full settings panel
│   │   ├── onboarding/    # first-run wizard
│   │   ├── components/    # shared design system
│   │   └── styles/        # Tailwind config + globals.css
│   ├── core/              # pure TS business logic (testable without Electron)
│   │   ├── config/        # config schema + store
│   │   ├── watcher/       # chokidar wrapper, debounce, retry-move
│   │   ├── router/        # pattern matching + destination resolver
│   │   ├── scanner/       # manual Downloads rescan
│   │   └── projects/      # project scaffolding from template
│   ├── shared/            # types/interfaces shared between main and renderer
│   └── preload/           # contextBridge bridges
├── electron/              # electron-builder config, icons, entitlements
├── docs/                  # ROADMAP, DECISIONS, V1_REFERENCE, ARCHITECTURE
├── tests/                 # vitest specs
├── .github/workflows/     # CI: build, test, release
├── package.json
├── pnpm-workspace.yaml    # (si monorepo plus tard)
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── electron-builder.yml
└── CLAUDE.md              # ce fichier
```

## Roadmap (voir docs/ROADMAP.md pour le detail)

- **Phase Alpha** (6-8 semaines) : Port moteur en TS + reconstruction UI parite avec V1
- **Phase Beta** (4-6 semaines) : Settings panel + onboarding + build Mac signe
- **Phase Gamma** (4-6 semaines) : Extension navigateur + capture metadonnees + recherche
- **Phase Release** : Auto-update, signing Windows, landing page, Stripe

## Conventions

- **Langage** : TypeScript strict (`"strict": true`, `"noUncheckedIndexedAccess": true`)
- **Naming fichiers** : kebab-case (`config-store.ts`), composants React PascalCase (`OverlayPanel.tsx`)
- **Imports** : utiliser les path aliases (`@core/*`, `@shared/*`, `@renderer/*`, `@main/*`)
- **Commits** : conventionnel (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`), en anglais
- **Branches** : `main` protegee. Travail sur `feature/<short-name>` et merge via PR
- **Versioning** : semver. Tags `v0.1.0` etc.
- **Tests** : tout module dans `src/core/` doit avoir un `.test.ts` adjacent
- **i18n** : pas en V1. Tout en francais dans l'UI (cible principale), mais code/commentaires en anglais sauf si specifie

## Anti-patterns a eviter

- Ne JAMAIS faire de logique metier dans le renderer React. Toute action passe par IPC vers le main, qui appelle `@core/*`.
- Ne JAMAIS hardcoder de chemin de filesystem. Tout passe par `app.getPath()` ou la config utilisateur.
- Ne JAMAIS supposer que les permissions admin sont disponibles. L'app doit tourner en user normal.
- Ne JAMAIS bloquer le main thread. Operations IO async, file moves dans des workers si volumineux.
- Ne PAS reintroduire de dependance PowerShell ou AHK. Tout natif Electron.

## Sprint en cours

**Sprint 0 (termine)** : Scaffolding initial.
- [x] Init npm, package.json, tsconfig, vite.config, tailwind.config
- [x] Boilerplate Electron main + renderer minimal qui affiche "Shift-K" dans une fenetre
- [x] electron-builder config minimal pour produire un .exe vide
- [x] CI GitHub Actions basique (lint + build + typecheck + test)
- [x] Premier commit + push sur github.com/hadridb/shift-k
- [x] Switch pnpm -> npm (ADR-020 : drive E: exFAT, symlinks impossibles)

**Sprint 1 (termine)** : Moteur metier.
- [x] src/core/config/ : schema Zod + store electron-store, migrations
- [x] src/core/router/ : platform-matcher, destination resolver (port V1)
- [x] src/core/watcher/ : chokidar wrapper, retry-move, debounce
- [x] src/core/scanner/ : rescan manuel Downloads
- [x] Tests Vitest 36 tests, 100% core coverage

**Sprint 2 (termine)** : Overlay always-on-top.
- [x] Fenetre frameless/transparent/alwaysOnTop 290x468px
- [x] SlotList (9 slots, indicateur actif, click pour switcher)
- [x] StageBar (cycle de stage, indicateur PAUSED)
- [x] FooterBar (5 boutons icon : FolderOpen, Pause/Play, Rescan, NewProject, Settings)
- [x] IPC bridge complet (getConfig, setActiveClient, cycleStage, toggleRouting, triggerRescan, onConfigChange)
- [x] Persistence position overlay sur moved

**Sprint 3 (termine)** : Dialogues projet.
- [x] src/core/projects/scaffolder : createProject (copie _TEMPLATE, dirs stages + dossiers journaliers), listProjects
- [x] IPC handlers : projects:create, projects:list, projects:open-folders, config:set-slots
- [x] Bridge + preload : createProject, listProjects, openFolders, setSlots
- [x] NewProjectModal : champs client + mission, creation + activation automatique
- [x] EditSlotsModal : 9 dropdowns charges depuis filesystem (bouton Settings pour l'instant)
- [x] OpenFoldersModal : checkboxes stages + toggle "dossier du jour" (ost toujours stage root), shell.openPath

**Sprint 4 (termine)** : Configuration & raccourcis.
- [x] Settings BrowserWindow 540x720 non-modal (general / stages / preferences)
- [x] IPC dialog:pick-folder, config:update, window:open-settings
- [x] services/watcher-manager : syncWatcher() ferme chokidar quand pause OU downloadsPath change (await close + ignoreInitial:true au restart pour pas re-router les fichiers arrives pendant la pause)
- [x] FooterBar reorganise : 6 boutons, EditSlots (Sliders) separe de Settings (gear)
- [x] globalShortcut Ctrl+Alt+1..9 (switch slot), Ctrl+Alt+S (cycle stage), Ctrl+Alt+P (pause)
- [x] services/actions extrait (DRY entre IPC handlers et shortcuts)
- [x] Ctrl+Shift+K (global) toggle overlay
- [x] Shift+J/K/L (overlay focused) navigation NLE-style — voir ADR-021 + docs/SHORTCUTS.md
- [x] Tray icon (K base64 16x16) + menu contextuel afficher/quitter, click toggle overlay
- [x] Notifications natives sur routage (Electron Notification API, AppUserModelID com.shiftk.app pour identite Windows)
- [x] Onboarding wizard premier lancement (root + downloadsPath, 3 etapes : welcome/paths/recap)
- [x] Dry-run rescan : scanner.previewRescan + executeRescan + RescanModal (checkboxes par fichier), pref confirmBeforeRescan

**Sprint 5a (termine)** : Packaging Windows + autostart.
- [x] electron-builder.yml : NSIS per-user, appId com.shiftk.app, icone electron/resources/icon.png (512x512 K-sur-fond-arrondi-noir)
- [x] services/autostart : app.setLoginItemSettings avec --hidden flag, no-op en dev
- [x] main/index detecte wasOpenedAtLogin OU --hidden et skip createOverlayWindow (tray seul)
- [x] preferences.startOnLogin toggle dans Settings, applique via onConfigChange listener
- [x] Build pre-req : Windows Developer Mode activable via ms-settings:developers (sinon electron-builder echoue sur les symlinks Mac du cache winCodeSign — bug connu, voir commit 2d3de9d)
- [x] Installer genere : release/Shift-K Setup 0.1.0.exe (~80 MB, non signe — SmartScreen warning au premier lancement)
- [x] Fix `Cannot find module '../../core/config/store'` au demarrage de l'installer (19/05/2026) — `electron-builder.yml > files:` n'incluait que `dist/main/`, `dist/preload/`, `dist/renderer/`. Ajout de `dist/core/**/*`, `dist/shared/**/*` et `!**/*.test.js`. Voir ADR-022. Smoke test CI ajoute (verifie `dist/core/config/store.js` + presence dans asar via `npx asar list`).
- [x] Personnalisation des dossiers journaliers (19/05/2026) — ajout de `preferences.dailyFoldersEnabled` (toggle on/off complet, route directement vers `<Client>/<stage>/` si off) + placeholder `{stage}` dans `dailyFolderFormat` (`{stage} J{yyyy-MM-dd}` → `03_Outputs J2026-05-19`). Section "DOSSIERS PAR JOUR" dans Settings avec select 4-options (presets + Personnalise) et live preview. Voir ADR-023. 40 tests Vitest (36 → 40, 4 nouveaux : toggle on/off × format simple/stage-prefixed).
- [x] Routage audio (19/05/2026) — support des plateformes audio (Suno, ElevenLabs, Udio, Stable Audio, AIVA, Mubert, Soundraw, Splice, Loopcloud, Cymatics) avec `audioExtensions` config + `PLATFORM_STAGE_OVERRIDES` (10 audio → OST, photoshop/premiere → src). Toggle `preferences.routeAllAudio` (default off) capture les orphelins audio vers OST. Migration auto-merge des nouveaux patterns dans configs existantes via `migrations.ts` (testable hors Electron). Section AUDIO dans Settings (chips editables pour extensions + patterns par plateforme + toggle + preview). Voir ADR-024. 54 tests Vitest (40 → 54, 14 nouveaux).

**Sprint 6 (termine)** : Polish quotidien.
- [x] Settings : sections Audio / Images / Vidéo / Fichiers projet wrappées dans `AccordionSection` (chevron rotatif framer-motion + height/opacity reveal). Etat persiste dans `preferences.settingsAccordionState` (audio open par defaut, autres closed). Sections IMAGES/VIDEO/PROJECT FILES nouvelles — auparavant les listes d'extensions etaient config-only.
- [x] Overlay : Stage selector peek popover. Chevron-down a cote du bouton STAGE → liste des 5 stages avec indicateur barre verticale 2px sur l'actif. ESC + click-outside ferment. Hook pur `useEscapeClose` + predicate `isEscapeForClose` testable hors RTL.
- [x] Overlay : Activity feed sous SlotList. Service `src/main/services/activity-log.ts` (ring buffer in-memory max 20, FIFO). IPC event `activity:routed` push depuis watcher + IPC handle `activity:get-recent` pour bootstrap. Composant `ActivityFeed.tsx` affiche les 5 derniers avec timestamp relatif (il y a 12s / 2 min / 1 h), fade-in puis fade-to-grey apres 30s.
- [x] Animations : `framer-motion@^12` installe. Slot indicator slide via `layoutId`, modales fade+scale 180ms, stage badge flip rotateX 180ms, pause badge scale+fade. ADR-025 fixe les durations/easings canoniques (Material standard `[0.4, 0, 0.2, 1]`).
- [x] Tests : 66 verts (54 → 66). +4 activity-log (FIFO, max, copy, empty), +2 accordion state (defaults, round-trip), +6 useEscapeClose (Escape vs autres touches × INPUT/TEXTAREA/SELECT/DIV).

**Sprint 8 (termine)** : Splash screen + cinematic onboarding 7 ecrans.
- [x] Splash 400x300 frameless transparent, 1.2 s, wordmark + trait sous "shift" anime + tagline. Skip sur autostart / `--hidden`.
- [x] Onboarding fullscreen plein noir avec 7 ecrans : Welcome (hero + value prop combine) → Downloads (folder SVG + particules + pre-seed OS default) → Projects (tree anime) → FirstProject (slot mock pulsant, optionnel via Skip) → Shortcuts (3 chords clavier qui s'illuminent en cascade) → Extension (3 plateformes converging, "Bientot disponible" en attendant la Phase Gamma) → Ready (point cloud Touch Designer 140 particules, 3 phases burst/idle/implode).
- [x] State machine 1-7 dans `OnboardingApp.tsx`, transitions slide-up + fade 350 ms (entry) + 120 ms (exit, opacity-only). `ScreenLayout` partage (dots de progression, footer Retour/Continuer).
- [x] Persistance per-screen : chaque "Confirmer" ecrit la config. Flag `preferences.firstLaunchCompleted` flippe a la fin sur "Lancer Shift-K".
- [x] Migration auto : configs existantes avec root + downloadsPath → `firstLaunchCompleted: true` silencieusement au load (les users actuels ne se prennent pas le nouvel onboarding involontairement).
- [x] Replay : bouton dans Settings → À PROPOS + script `npm run dev:onboarding` (cross-env `SHIFTK_FORCE_ONBOARDING=1`).
- [x] Voir ADR-031 + docs/MARKETING_ASSETS.md. 118 tests verts.

**Sprint 8 polish (termine — 20/05/2026)** : 5 iterations de raffinement onboarding sur retour Hadrien.
- [x] **Iter 1** : devtools gate (`SHIFTK_DEVTOOLS=1`), splash + Screen 1 wordmark passes en UPPERCASE sans trait, onboarding window passe `frame: false`, particle burst delai 1100 ms pour etre visible apres l'entry transition.
- [x] **Iter 2** : `ParticleField.tsx` (140 particules 1-3 px Touch Designer style, 3 phases burst/idle/implode, seed deterministe pour HMR-stable). Screen 7 reecrit autour de la state machine. Screen 1 copy sober "Réalisateur IA".
- [x] **Iter 3** : window 980x680 → **980x605** (golden ratio 1.619). Typo system extrait dans `ScreenLayout.tsx` (`H1` / `Body` / `Caption`). Screen 1 lowercase 112 px + accent line draw-in sous "shift" (mesuree via ref). `AnimatePresence` passe sans `mode` pour fix le black flash → introduit cross-fade muddy.
- [x] **Iter 4** : Screen 1 revient UPPERCASE 64 px sans accent line. Tous les em-dashes visibles supprimes (Screen 2 body, Screen 4 placeholder, Screen 5 chord caption). Titres H1 32 → 26 px. `AnimatePresence` revient en `mode="wait"` avec exit ultra-rapide (120 ms opacity-only) — pattern reutilisable, voir ADR-032.
- [x] **Iter 5** : Screen 1 absorbe le contenu de Screen 2 (devient hero brand + value prop combine, "réalisateurs IA"). Screen 2 devient picker explicite avec pre-seed du dossier OS Downloads via nouveau IPC `system:default-downloads`. Implode duration 0.8 → 0.5 s. `onLaunch` fire 80 ms avant la fin de l'implode pour chevaucher le cold-start de l'overlay. Voir ADR-032, ADR-033, ADR-034.

**Sprint 7.6 (termine — Sprint 7 ferme)** : Cleanup final themes.
- [x] Mica retire (rendu Electron/Chromium insuffisant vs WinUI 3 natif). Aurora retire (animation CSS instable, ROI faible).
- [x] 4 themes finaux : Obsidian, Carbon, Ivory, Liquid Glass.
- [x] Liquid Glass renomme "Transparency" sur Windows/Linux via `getThemeLabel(theme, platform)` (ADR-030). Label/description macOS inchanges.
- [x] Settings window passe a `transparent: true` + `backgroundColor: '#00000000'`. SettingsApp container peint `var(--bg-primary)`. La fenetre Reglages suit maintenant le theme actif (avant elle restait dark).
- [x] Migration auto : configs persistees avec `theme: 'mica'` ou `theme: 'aurora'` sont coercees a `'obsidian'` via Zod `preprocess`. Tests dedies.
- [x] Docs : ADR-029 update (Sprint 7.6 supersede partiellement), ADR-030 (label per-platform), docs/THEMES.md (reference des 4 themes), docs/THEME_LIMITS.md (limites structurelles).
- [x] 118 tests verts.

**Sprint 7 (termine)** : Système de thèmes complet.
- [x] 6 thèmes premium dans `src/renderer/styles/themes.ts` + miroir CSS dans `themes.css`. Obsidian (défaut), Carbon, Ivory, Mica, Liquid Glass, Aurora.
- [x] Architecture : CSS variables sur `<html data-theme="...">`. 12 tokens canoniques (--bg-primary, --bg-elevated, --bg-hover, --bg-modal, --border-subtle/divider, --text-primary/secondary/muted/disabled, --accent, --shadow-overlay). Switching = une mutation DOM, pas de re-render React.
- [x] Mica natif sur Windows 11+ via `BrowserWindow.setBackgroundMaterial('mica')`, gate version `os.release() ≥ 10.0.22000`.
- [x] Liquid Glass : vibrancy native macOS via `setVibrancy('hud')`, fallback CSS `backdrop-filter: blur(40px) saturate(180%) brightness(110%)` sur Windows/Linux. Signal envoye via IPC `theme:glass-fallback` → attribut `data-glass-fallback` sur `<html>`.
- [x] Aurora : animation CSS pure `aurora-shift` 60 s ease-in-out infinite, GPU-accelerated via `translateZ(0)`. Composant `AuroraBackground.tsx` monte conditionnellement.
- [x] Picker dans Settings (section APPARENCE en haut) : grille 2×3 cards avec mini-preview live, label, description, état actif + greyed-out pour themes indisponibles sur la plateforme. Click = live preview immédiat (`useApplyTheme(form.theme)`).
- [x] Refactor : 171 occurrences de couleurs hardcodees migrees vers `var(--*)` sur 17 fichiers (overlay components, modals, settings, onboarding).
- [x] Voir ADR-029. 121 tests verts (90 → 121, +31 incluant 27 sur themes.ts et 4 sur schema theme pref).

**Sprint 6.3 (termine)** : 10 slots + ratio compact.
- [x] 10e slot ajoute, surface comme "0" sur le clavier (touche 0 juste apres 9 sur la rangee numerique). Hotkey Ctrl+Alt+0 enregistre automatiquement via la boucle existante sur SLOT_KEYS.
- [x] Migration auto : un config v0.1.0 a 9 slots se voit injecter `'0': null` au prochain `parse()` Zod (via `.default(null)` sur la cle '0' du schema). 2 tests dedies couvrent ce cas + le defaut a vide.
- [x] Slot row height : `h-9` (36 px) → `h-8` (32 px) pour caser 10 slots + header + stage + footer dans 498 px.
- [x] Window : 520 → 498 px. Ratio compact, regression test mis a jour.
- [x] 90 tests verts (88 → 90).

**Sprint 6.2 (termine)** : Fix bug critique modale.
- [x] Bug : a l'ouverture de n'importe quelle modale, le BrowserWindow paraissait s'agrandir et les coins arrondis disparaissaient. **Cause** : modales en `position: fixed inset: 0` couvraient les 290×520 du window, alors que le container arrondi ne faisait que 290×~455 (hauteur naturelle du contenu). **Fix** : container `100vw × 100vh` + flex column avec spacer ; modales toutes en `position: absolute` (confinees + clippees par le container arrondi) ; toast repositionne `bottom: 93` (au-dessus du stage bar dans la nouvelle geometrie).
- [x] Verrouillage par test de regression : `overlay.test.ts` inspecte `overlay.ts` pour bloquer `setSize` / `setBounds` / `setContentSize` / `did-finish-load`. Tout pattern dangereux casse le CI.
- [x] Voir ADR-028. 88 tests verts (80 → 88, +8).

**Sprint 6.1 (termine)** : Corrections UI Sprint 6.
- [x] StagePopover ouvre **vers le haut** (au-dessus du chevron) au lieu de vers le bas qui depassait l'overlay 468px. `bottom: 44` + `transformOrigin: 'bottom left'` pour que le scale parte du bouton. Garde-fou `maxHeight: 200 + overflowY: auto` si plus de 5 stages un jour.
- [x] `ActivityFeed` (5 lignes par fichier) remplace par `ActivityToast` agregat. Buckets par (type × stage), une ligne `2 vidéos envoyées vers 03_Outputs` plutot que 2 lignes Gen-4_001.mp4 + Gen-4_002.mp4. State machine idle → buffering (debounce 3 s silence) → visible (4 s, reset sur nouvelle arrivee) → fading (600 ms).
- [x] Helper FR pur `src/shared/i18n/activity.ts` : `formatActivityLine(count, type, stageFolderName)` + `classifyExtension(filename, lists)`. Accord du participe + invariabilite "audio"/"projet" gerees. 14 tests dedies.
- [x] `ActivitySpinner` : arc rotatif accent `#9090E0` pendant l'affichage, dispersion en 6 particules `(cos, sin)·14px` + opacity/scale pendant le fade-out. ≤ 600 ms, sobriete a la Linear/Notion.
- [x] Overlay window 468 → 520 px pour caser toast + popover + slots integralement visibles.
- [x] Voir ADR-026. 80 tests verts (66 → 80, +14).

**Sprint 5b (prochain)** : A definir parmi :
- Code signing Windows (cert Sectigo EV) pour faire disparaitre SmartScreen warning
- electron-updater + GitHub Releases feed pour auto-update silencieux
- Polish overlay : badge "N fichiers en attente" pres du bouton Rescan, recherche dans EditSlots
- Phase Gamma : extension navigateur pour capture metadonnees (prompt, seed, params depuis Runway/Higgsfield/Kling)

**Sprint 10 (en cours — config seule, build Mac attend les certs)** : Preparation packaging macOS.
- [x] `electron-builder.yml > mac:` : cibles `dmg` + `zip` (arm64 + x64), category `productivity`, hardenedRuntime, gatekeeperAssess false, entitlements + entitlementsInherit, notarize teamId placeholder.
- [x] `extendInfo.LSUIElement: true` : Shift-K vit dans la menu bar uniquement, pas de Dock icon (UX equivalente au tray Windows). `NSDownloadsFolderUsageDescription` ajoute pour le prompt macOS 10.15+ au premier acces Downloads.
- [x] `electron/resources/entitlements.mac.plist` cree avec les 4 entitlements briefes (allow-jit, allow-unsigned-executable-memory, files.user-selected, files.downloads).
- [x] `src/main/shortcuts.ts` migre vers `CommandOrControl+...` (mappe Cmd sur Mac, Ctrl ailleurs ; Alt → Option sur Mac automatiquement). Tests regression `shortcuts.test.ts` bloquent toute regression future vers `Control+...` litteral.
- [x] `docs/SHORTCUTS.md` : tableau double-colonne Win/Mac.
- [x] Tests : 6 sur `shortcuts.test.ts` + 18 sur `electron-builder.mac.test.ts` (config YAML + entitlements plist + script npm). Total 142 tests verts (118 → 142). Voir ADR-035.
- [ ] **Icone .icns** : pas encore generee (a faire au Sprint 8b sur Mac via `iconutil` ou Figma export). Le path est setup, le fichier manque — `npm run dist:mac` echouera proprement avec un message clair tant qu'il n'existe pas.
- [ ] **TeamId Apple** : placeholder `PLACEHOLDER_TEAM_ID` a remplacer par le vrai (10 chars) une fois l'enrollment Developer Program valide (24-48h).
- [ ] **Variables d'env signing** : `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, `CSC_LINK` (chemin .p12), `CSC_KEY_PASSWORD` a renseigner sur la machine Mac avant le run.

## Build Mac — procedure

Sequence a executer **sur Mac**, une fois les certificats Apple Developer recus :

1. **Cloner / pull la branche `main`** sur la machine Mac. Le repo Windows et Mac sont le meme git remote ; pas de fork separe.

2. **Generer l'icone** `electron/resources/icon.icns` :
   - Source : un PNG 1024x1024 du logo (`electron/resources/icon.png` existe deja, peut servir de base si la resolution est suffisante).
   - Generation : `mkdir Shift-K.iconset` puis `sips -z 16 16 src.png --out Shift-K.iconset/icon_16x16.png` (et 32, 64, 128, 256, 512, 1024 + leurs @2x), puis `iconutil -c icns Shift-K.iconset -o electron/resources/icon.icns`. Alternative : Image2icon (gratuit, Mac App Store) ou Figma export plugin.

3. **Renseigner le teamId reel** dans `electron-builder.yml > mac.notarize.teamId` (remplacer `PLACEHOLDER_TEAM_ID`).

4. **Exporter les variables d'environnement** dans la session shell :
   ```bash
   export APPLE_ID="hadridb@gmail.com"
   export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"   # genere sur appleid.apple.com
   export APPLE_TEAM_ID="XXXXXXXXXX"                          # 10 chars, same as electron-builder.yml
   export CSC_LINK="/path/to/DeveloperID.p12"
   export CSC_KEY_PASSWORD="mot-de-passe-du-p12"
   ```

5. **Installer les deps** : `npm install` (le drive Mac est APFS, pas exFAT — on peut revenir a pnpm si on veut, mais npm marche aussi voir ADR-020).

6. **Lancer le packaging** : `npm run dist:mac`. Sequence : build TS + Vite, signing du .app via la cle .p12, creation du .dmg + .zip, upload pour notarization Apple (~3-10 min), staple du ticket dans le .dmg.

7. **Artefacts attendus** dans `release/` :
   - `Shift-K-X.Y.Z-arm64.dmg` + `Shift-K-X.Y.Z-x64.dmg` (~120 MB chacun)
   - `Shift-K-X.Y.Z-arm64-mac.zip` + `Shift-K-X.Y.Z-x64-mac.zip` (auto-update feed quand on aura electron-updater)
   - `Shift-K-X.Y.Z-arm64.dmg.blockmap` + variants
   - `latest-mac.yml` si on flippe `publish:` plus tard

8. **Verification** : ouvrir le .dmg, drag-and-drop vers /Applications, premier lancement → Gatekeeper doit accepter sans prompt (signe + notarise + stapled). Si "App ne peut etre ouverte", c'est que le staple a echoue — re-lancer `xcrun stapler staple release/Shift-K-X.Y.Z-arm64.dmg`.

Le test de regression `tests/electron-builder.mac.test.ts` garantit que la config Mac ne derive pas pendant qu'on attend les certs. Si on ajoute un entitlement, mettre a jour le plist ET le test.

## Dernieres decisions (session 20/05/2026)

- **Onboarding window 980x605** (golden ratio 1.619) — l'ancien 680 laissait du vide sous chaque ecran. Verrouille `resizable: false` ; tout layout est tune a ce box. Voir ADR-032.
- **AnimatePresence pattern `mode="wait"` + exit 120 ms opacity-only** : iter 2 avait retire `mode="wait"` pour fixer un black flash avant l'ecran 7 ; le cross-fade resultant donnait l'impression que l'ecran precedent restait colle. Le pattern final retient l'isolation des ecrans tout en gardant la transition perceptible "instant" (~120 ms entre clic et nouvelle content readable). Reutilisable pour toute sequence multi-ecrans. Voir ADR-032.
- **Typography system extrait** dans `ScreenLayout.tsx` (`H1` 26 / `Body` 15 / `Caption` 13, weight 300/400/400). Regle dure : zero `font-weight: bold` ou `600` dans la copy ; key chips clavier soft a 500. Tous les em-dashes "—" bannis de la copy user-visible (remplaces par virgule, deux-points ou `·`). Voir ADR-033.
- **Hero + value prop sur Screen 1** (au lieu de l'ancien hero pur). Le wordmark co-existe avec le titre "Tes fichiers savent ou aller." + l'explainer Higgsfield/Runway/Kling/Suno/ElevenLabs. Screen 2 devient picker dedie avec pre-seed du dossier OS Downloads via nouveau IPC `system:default-downloads`. Voir ADR-034.
- **`ParticleField` Touch Designer** (140 particules 1-3 px, 3 phases burst/idle/implode, seed deterministe). Implode 0.5 s + `onLaunch` fire 80 ms avant la fin → cold-start overlay chevauche les dernieres frames de l'animation, perception "snappy". Voir ADR-031 (cadre general) + commentaires inline pour le tuning.

## Prochaine etape

Sprint 10 cote config = termine cote Windows. Attendre la validation Apple Developer Program (24-48h, en cours depuis 20/05/2026). Des reception :
1. Migrer sur la machine Mac, suivre la section "Build Mac — procedure" ci-dessus.
2. Premier `npm run dist:mac` reussi = livrer le DMG arm64 a un beta testeur Mac (test ami symetrique au Windows 0.1.1).
3. En parallele cote Windows, reprendre **Sprint 5b** (code signing Sectigo EV ou electron-updater).

## Contacts

- Co-architecte : Hadrien Durand-Baissas (hadridb@gmail.com)
- Repo : https://github.com/hadridb/shift-k

---

*Derniere mise a jour : 20 mai 2026 (Sprint 10 — config Mac packaging, en attente certs Apple ; ADR-035). A maintenir a jour a chaque decision structurante.*
