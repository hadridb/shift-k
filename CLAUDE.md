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

**Sprint 4 (en cours)** : Configuration & raccourcis.
- [x] Settings BrowserWindow 540x720 non-modal (general / stages / preferences)
- [x] IPC dialog:pick-folder, config:update, window:open-settings
- [x] services/watcher-manager : syncWatcher() redemarre chokidar quand downloadsPath change
- [x] FooterBar reorganise : 6 boutons, EditSlots (Sliders) separe de Settings (gear)
- [x] globalShortcut Ctrl+Alt+1..9 (switch slot), Ctrl+Alt+S (cycle stage), Ctrl+Alt+P (pause)
- [x] services/actions extrait (DRY entre IPC handlers et shortcuts)
- [x] Ctrl+Shift+K (global) toggle overlay
- [x] Shift+J/K/L (overlay focused) navigation NLE-style — voir ADR-021 + docs/SHORTCUTS.md
- [ ] Tray icon + menu contextuel quit/show/hide
- [ ] Notifications natives sur routage (Notification API Electron)
- [x] Onboarding wizard premier lancement (root + downloadsPath, 3 etapes : welcome/paths/recap)

## Contacts

- Co-architecte : Hadrien Durand-Baissas (hadridb@gmail.com)
- Repo : https://github.com/hadridb/shift-k

---

*Derniere mise a jour : 15 mai 2026 (Sprint 3 termine). A maintenir a jour a chaque decision structurante.*
