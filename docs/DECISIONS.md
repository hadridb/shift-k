# Architectural Decisions Records (ADR)

> Une decision = un changement d'architecture documente. Format minimal.
> Ne jamais reverter un ADR : si la decision change, on ajoute un nouvel ADR qui supersede.

---

## ADR-001 : Electron over Tauri

**Date :** 2026-05-15
**Statut :** Acceptee

**Contexte :** Choix du framework desktop cross-platform pour Shift-K.

**Decision :** Electron 33+, pas Tauri.

**Raisons :**
- Velocite de developpement primordiale (Hadrien solo + Claude)
- Ecosysteme massif : auto-update, builder, plugins (electron-store, etc.)
- Produits de reference (Figma, Linear, Cron, Arc) tournent sous Electron
- TypeScript end-to-end vs apprendre Rust pour le backend Tauri

**Consequences :**
- Installer plus lourd (~80 MB) vs Tauri (~10 MB)
- RAM ~150-250 MB en idle (acceptable pour app pro)
- Re-evaluer Tauri en v2 si scale > 50 000 utilisateurs

---

## ADR-002 : pnpm over npm/yarn

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** pnpm comme package manager.

**Raisons :**
- 3x plus rapide installs grace au content-addressed store
- Pas de dependency hoisting bizarre (vrai isolation)
- Workspaces natifs si on passe en monorepo
- Compatible 100% avec npm registry

**Consequences :** Hadrien doit installer pnpm globalement (`npm install -g pnpm`).

---

## ADR-003 : Tailwind + shadcn/ui

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** Tailwind CSS 3 pour le styling. shadcn/ui pour les composants quand pertinents (Dialog, Popover, DropdownMenu). Pas de Material/Chakra/MUI.

**Raisons :**
- Identite visuelle custom (dark luxury minimaliste) facile a maintenir avec utility classes
- shadcn/ui : composants copies dans le repo, pas de lib externe = controle total
- Bundle minimal (Tailwind purge inutilise)

**Consequences :**
- Pas d'auto-completion magique pour composants stylises
- Documenter notre design system dans `src/renderer/components/`

---

## ADR-004 : Architecture monolithique single-package (pas de monorepo en V1)

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** Un seul `package.json` a la racine, code organise dans `src/{main,renderer,core,shared,preload}`. Pas de monorepo pnpm workspaces pour l'instant.

**Raisons :**
- Pas de partage de code externe = pas besoin de packages
- Plus simple a comprendre, debugger, packager
- Refactor en monorepo trivial le jour ou on extrait l'engine

**Consequences :** Si on construit la browser extension dans le meme repo, elle sera dans `src/extension/` (mais a son propre `manifest.json` + build).

---

## ADR-005 : chokidar pour le file watching

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** chokidar comme abstraction au-dessus de fs.watch / fsevents.

**Raisons :**
- Standard de facto Node.js (utilise par Webpack, Parcel, Vite)
- Gere les differences macOS (fsevents) / Windows (ReadDirectoryChangesW) / Linux (inotify)
- Debounce, ignore, atomic-write handling integres

---

## ADR-006 : electron-store pour la config

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** electron-store (wrapper JSON dans `app.getPath('userData')`) avec validation Zod.

**Raisons :**
- Cross-platform automatique
- Migrations versionnees integrees
- Watch + emit on change si besoin

**Schema config :** voir `src/core/config/schema.ts` (a creer)

---

## ADR-007 : SQLite (better-sqlite3) pour la recherche metadonnees

**Date :** 2026-05-15
**Statut :** Acceptee (Phase Gamma)

**Decision :** better-sqlite3 + FTS5 pour indexer prompts et permettre recherche full-text.

**Raisons :**
- Synchrone, simple, 10x plus rapide que sqlite3 async pour notre usage
- FTS5 fournit recherche full-text native
- Zero serveur, zero deps externes

---

## ADR-008 : Native Messaging pour browser extension <-> desktop

**Date :** 2026-05-15
**Statut :** Acceptee (Phase Gamma)

**Decision :** Native Messaging Host (manifest + executable PowerShell ou Node) plutot que WebSocket local.

**Raisons :**
- Pas de port reseau expose = vecteur d'attaque elimine
- Chrome / Edge / Firefox supportent tous Native Messaging
- Auth implicite (l'extension declare quel host elle peut appeler)

**Consequences :**
- L'installer Shift-K doit poser le manifest Native Messaging dans le bon dossier OS

---

## ADR-009 : electron-builder pour le packaging

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** electron-builder, pas electron-forge.

**Raisons :**
- Plus mature pour les besoins production (DMG + PKG Mac, NSIS Win, auto-update)
- Integration GitHub Releases native pour auto-update
- Configuration YAML lisible

---

## ADR-010 : Code signing strategy

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :**
- **Mac :** Apple Developer ID Application + notarisation (mandatory pour Gatekeeper en 2025+).
- **Windows :** Sectigo EV Code Signing Certificate ($300-400/an, instant SmartScreen reputation).
- Standard OV cert evite (warning Windows pendant les 30 premiers jours).

**Consequences :** ~$500/an total. A debourser au moment de la phase Beta / Release.

---

## ADR-011 : Strict TypeScript

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.

**Raisons :**
- Catch les bugs au compile-time, pas au support client
- Refactors safe quand le projet grossit
- IDE assistance maximale

---

## ADR-012 : Vitest over Jest

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** Vitest pour les tests unitaires.

**Raisons :**
- Native ESM, pas de config Babel
- Compatible Jest API (familier)
- Beaucoup plus rapide (utilise Vite sous le capot)

---

## ADR-013 : Pas de cloud sync en V1

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** Tout est local en V1. Cloud sync (config + metadata uniquement, jamais les fichiers media) a etudier en V1.5+.

**Raisons :**
- Reduit drastiquement la surface d'attaque, le RGPD, et la complexite
- Les fichiers media sont trop volumineux pour sync de toute facon
- Les utilisateurs peuvent sync leur config eux-memes via Dropbox/iCloud Drive sur le dossier de projets

---

## ADR-014 : Branding "Shift-K"

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** Le produit s'appelle officiellement "Shift-K". Pas "Phasma" (qui reste le nom de la V1 et l'agence d'Hadrien).

**Raisons :**
- Phasma = brand personnel d'Hadrien, conflit potentiel si vente a des concurrents
- Shift-K evoque l'edition video (shortcuts NLE) et reste neutre
- Court, memorable, pronon caple en plusieurs langues

**Consequences :** Domaine a securiser : shift-k.app, shift-k.com, shiftk.io.

---

## ADR-015 : Separation tsconfig renderer / main

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** Deux tsconfig separes : `tsconfig.json` (base + renderer, module ESNext + moduleResolution bundler) et `tsconfig.main.json` (main + preload + core, module CommonJS + moduleResolution node).

**Raisons :**
- Main process Electron requiert CommonJS (require, __dirname natifs)
- Renderer compile via Vite (ESM + bundler resolution)
- Evite de melanger les environments dans un seul tsconfig
- `rootDir: src` dans tsconfig.main.json preserve la structure de dossiers dans `dist/`

**Consequences :**
- Preload compile vers `dist/preload/index.js` (reference par `path.join(__dirname, '../preload/index.js')`)
- Core compile vers `dist/core/` (disponible dans main process, pas dans renderer qui passe par IPC)

---

## ADR-016 : Detection mode dev via app.isPackaged

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** Utiliser `!app.isPackaged` pour detecter le mode dev dans le main process, pas `process.env.NODE_ENV`.

**Raisons :**
- `app.isPackaged` est la methode officielle Electron
- `false` quand lance via `electron .` en dev
- `true` uniquement quand packager par electron-builder
- Pas besoin de cross-env ou de variables d'environnement supplementaires

---

## ADR-017 : Workflow dev : tsc watch + Vite dev server + wait-on

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** `pnpm dev` = build:main synchrone, puis concurrently (vite dev server + tsc watch + wait-on:5173 && electron).

**Raisons :**
- Pas de electron-vite (non documente dans les ADR existants, complexity layer suppl.)
- wait-on garantit que Electron ne demarre pas avant que le serveur Vite soit pret
- build:main initial garantit que dist/main/index.js existe avant le start
- Reload du renderer : automatique via HMR Vite
- Reload du main : manuel pour Sprint 0 (amelioration Sprint 1 si besoin)

**Consequences :** Pas de hot-reload automatique du main process en dev. Acceptable pour Sprint 0.

---

## ADR-018 : Vitest config separee de vite.config.ts

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** `vitest.config.ts` separe de `vite.config.ts`, environment `node` pour les tests core.

**Raisons :**
- Tests core (logique metier pure) n'ont pas besoin de l'environnement browser/DOM
- Separation claire : vite.config.ts = renderer uniquement
- Coverage cible uniquement `src/core/` (la logique testable sans Electron)

---

## ADR-020 : npm over pnpm (drive exFAT — symlinks impossibles)

**Date :** 2026-05-15
**Statut :** Acceptee — supersede ADR-002 et ADR-019

**Decision :** npm (inclus avec Node.js) comme package manager en lieu et place de pnpm.

**Raisons :**
- pnpm utilise des symlinks a plusieurs niveaux (store/projects registry, symlinkAllModules, virtual store), independamment du node-linker setting
- Le drive E: de la machine d'Hadrien est exFAT, qui ne supporte aucun symlink
- Meme avec `node-linker=hoisted`, pnpm echoue au demarrage (EISDIR sur les symlinks du store)
- npm sur Windows utilise des .cmd shims pour .bin, pas de symlinks : fonctionne nativement sur exFAT
- `baseline-browser-mapping` ajoute comme devDependency explicite (peer dep non-declare de browserslist 4.28+)

**Consequences :**
- Lock file : `package-lock.json` (a la place de `pnpm-lock.yaml`)
- Scripts : `npm run X` (a la place de `pnpm run X`)
- CI : `npm ci` + `cache: npm` (a la place de pnpm/action-setup)
- Vitesse install un peu plus lente (pas de content-addressed store)
- Si Hadrien migre vers un drive NTFS, on peut revenir a pnpm sans changement de code

---

## ADR-019 : node-linker=hoisted pour pnpm (drive exFAT)

**Date :** 2026-05-15
**Statut :** Acceptee

**Decision :** `.npmrc` contient `node-linker=hoisted`. pnpm installe en mode "hoisted" (comportement npm classique, pas de virtual store avec symlinks).

**Raisons :**
- Le drive E: de la machine d'Hadrien est exFAT (pas NTFS)
- exFAT ne supporte pas les symlinks
- pnpm utilise des symlinks par defaut pour son content-addressed store
- `node-linker=hoisted` contourne ce probleme : packages hoisted directement dans `node_modules/`

**Consequences :**
- Install plus lente que le mode pnpm natif (pas de deduplication optimale)
- node_modules plus volumineux (comme npm)
- Fonctionnellement identique en dev et en prod
- Si Hadrien migre vers un drive NTFS, retirer cette option pour retrouver les benefices pnpm natifs

---

## ADR-021 : Shift+J/K/L pour navigation slot (overlay focused)

**Date :** 2026-05-15
**Statut :** Acceptee

**Contexte :** Le persona cible (AI director freelance luxe) passe sa journee dans un NLE — DaVinci Resolve, Premiere, Avid, Final Cut. Dans tous les NLE depuis ~30 ans, **J-K-L est le raccourci universel de transport video** :
- J = reverse / precedent
- K = stop / pause
- L = forward / suivant

C'est une muscle memory profonde, reflexe sans pensee. Le persona pense JKL comme "lire / arreter / avancer".

**Decision :** En complement des raccourcis globaux Ctrl+Alt+1..9 (acces direct slot), on ajoute trois raccourcis fenetre-locale (overlay focused) :
- **Shift+J** : slot precedent (cycle slots non-vides uniquement)
- **Shift+K** : pause / reprise routing
- **Shift+L** : slot suivant (cycle slots non-vides uniquement)

Le nom "Shift-K" du produit devient un double-meaning explicite : la touche centrale du transport (Shift+K = pause) ET le verbe "switch clients" (shift = bascule).

**Pourquoi Shift- comme modifier ?**
- J/K/L seuls inutilisables (l'utilisateur tape du texte ailleurs dans l'OS)
- Cmd/Ctrl+J/K/L pris par browser (downloads, focus location bar) et editeurs (jump to definition, etc.)
- Shift+J/K/L libre, naturel, et **renforce** la memoire JKL plutot que la contourner

**Pourquoi pas global ?**
- Un globalShortcut sur Shift+J/K/L bloquerait toute saisie majuscule des lettres J/K/L dans l'OS entier — inacceptable
- Le scope "overlay focused" est suffisant : quand le persona veut switcher, il fait Ctrl+Shift+K pour faire surgir l'overlay, puis enchaine sur JKL

**Implementation :**
- Listener `document.keydown` dans `OverlayApp.tsx` (renderer)
- Skip si `e.target.tagName` est `INPUT` / `TEXTAREA` / `SELECT` (modals NewProject, EditSlots, Settings preservent leur saisie)
- Skip si une modal est ouverte (hook `useJklShortcuts(modal === null)`)
- Pas de `globalShortcut` cote main process

**Consequences :**
- Trois modes d'acces aux slots, gradues par frequence :
  1. Memoriser le mapping → Ctrl+Alt+1..9 (global, direct)
  2. Parcourir → Shift+J / Shift+L (overlay, sequentiel)
  3. Decouvrir / occasionnel → clic souris
- Documentation : `docs/SHORTCUTS.md` agrege tous les raccourcis
- Le combo signature **Ctrl+Shift+K** (surgir) + **Shift+J/K/L** (manipuler) = flow sans souris complet

---

## ADR-022 : electron-builder `files:` doit lister explicitement toutes les sous-arborescences runtime du main

**Date :** 2026-05-19
**Statut :** Acceptee

**Contexte :** Sprint 5a a produit un installer Windows (`Shift-K Setup 0.1.0.exe`) qui crashait au demarrage avec :
```
Cannot find module '../../core/config/store'
  at Object.<anonymous> (app.asar\dist\main\ipc\config-handlers.js:10)
```

Cause : `electron-builder.yml` listait uniquement `dist/main/**/*`, `dist/preload/**/*`, `dist/renderer/**/*` dans `files:`. Le main process compile correctement via `tsconfig.main.json` (qui inclut `src/core/**/*` et `src/shared/**/*` depuis Sprint 1), donc `dist/core/config/store.js` existait sur disque — mais electron-builder filtre via `files:` avant de produire l'asar. Resultat : l'asar contenait `dist/main/` qui faisait `require("../../core/config/store")` vers un dossier inexistant dans le bundle.

**Decision :** `files:` doit lister **explicitement** toutes les sous-arborescences sous `dist/` dont le main a besoin a l'execution, pas seulement `dist/main/`. Liste actuelle :
```yaml
files:
  - dist/main/**/*
  - dist/preload/**/*
  - dist/renderer/**/*
  - dist/core/**/*      # runtime: store, router, watcher, scanner, projects
  - dist/shared/**/*    # preventif (types purs aujourd'hui, mais facile a polluer plus tard)
  - "!**/*.map"
  - "!**/*.d.ts"
  - "!**/*.test.js"     # exclure les specs Vitest compilees
```

**Smoke test CI :** Apres `npm run dist`, le job CI verifie deux invariants (voir `.github/workflows/ci.yml`) :
1. `dist/core/config/store.js` existe sur disque (build:main a tourne).
2. `npx asar list release/win-unpacked/resources/app.asar` contient `dist\core\config\store.js` (electron-builder l'a packagee).

Si l'un ou l'autre echoue, le build casse — impossible de re-livrer un installer dans le meme etat qu'avant ce fix.

**Pourquoi le piege est insidieux :**
- `npm run typecheck` est vert : le code source est correct.
- `npm test` est vert : Vitest charge depuis `src/`, jamais depuis l'asar.
- `npm run dev` marche : Electron charge directement depuis `dist/` (filesystem nu, pas d'asar).
- Le crash ne se manifeste **que** dans le binaire installe.

**Consequences :**
- Toute nouvelle sous-arborescence ajoutee a `src/` et importee par le main (ex: `src/extension/`, `src/lib/`, `src/services/...`) doit etre ajoutee a `files:` **en plus** de l'`include` de `tsconfig.main.json`. Les deux listes sont independantes mais doivent rester en phase.
- Convention : la PR qui ajoute un nouveau dossier sous `src/` doit toucher les deux fichiers dans le meme commit.
- Si on consolide un jour le bundling main (ex: esbuild en single-file), ce piege disparait — l'asar contiendrait un seul `dist/main/index.js` auto-suffisant. A reconsiderer si on accumule plus de pieges du genre.

---

## ADR-023 : Toggle `dailyFoldersEnabled` + placeholder `{stage}` dans `dailyFolderFormat`

**Date :** 2026-05-19
**Statut :** Acceptee

**Contexte :** En V1 et jusqu'a maintenant en V2, chaque fichier route etait place dans un sous-dossier journalier au sein du stage (ex: `YSL/03_Outputs/J2026-05-19/Gen-4_clip.mp4`). Le format etait limite a `{yyyy-MM-dd}`. Deux limites :
1. Certains workflows preferent une hierarchie plate `<Client>/<stage>/<file>` (peu de fichiers/jour, ou archivage automatique en bout de chaine).
2. Quand le user a plusieurs apps qui ouvrent des dossiers cote-a-cote (DaVinci import bins, Finder/Explorer tabs), le nom `J2026-05-19` est ambigu — impossible de distinguer le dossier `03_Outputs/J2026-05-19/` du dossier `01_SRC Inits/J2026-05-19/` au coup d'oeil dans une barre d'onglets.

**Decision :** Ajouter deux prefs orthogonales dans `preferences` :

- **`dailyFoldersEnabled: boolean`** (default `true`) — controle l'existence meme du sous-dossier journalier. Quand `false`, `buildDailyPath()` retourne `<root>/<client>/<stage>/` (+ platform si `groupByPlatform`), et `createProject()` ne pre-cree pas les sous-dossiers de jour. Le toggle est un seul point de verite : aucune autre logique n'a besoin de le connaitre, le router fait foi.

- **`dailyFolderFormat`** etendu pour supporter le placeholder `{stage}`, substitue par le nom du stage actif (`config.stages[stageKey]`). Combine avec `{yyyy-MM-dd}`. Exemples :
  - `J{yyyy-MM-dd}` → `J2026-05-19` (defaut, retrocompatible)
  - `{stage} J{yyyy-MM-dd}` → `03_Outputs J2026-05-19`
  - `{stage}-{yyyy-MM-dd}` → `03_Outputs-2026-05-19`

**Pourquoi pas un seul flag a 3 etats (off / simple / stage-prefixed) ?** Le choix du format et l'activation sont des decisions independantes — un user qui passe en mode "pas de dossier jour" puis reactive ne veut pas perdre son format custom. Les deux prefs sont stockees separement, et l'UI rend le champ format invisible quand `dailyFoldersEnabled === false`. La pref `dailyFolderFormat` reste dans la config meme quand le toggle est off.

**Migration :** Aucun code de migration manuel — les `.default()` Zod injectent automatiquement la nouvelle pref a la prochaine lecture pour les configs persistees avant ce commit. Defaults retrocompatibles : `dailyFoldersEnabled = true`, `dailyFolderFormat = 'J{yyyy-MM-dd}'`. Aucun fichier ne se retrouve route differemment apres l'upgrade.

**Consequences :**
- La signature de `formatDailyFolderName(format, date)` devient `formatDailyFolderName(format, stageName, date)`. Tous les callers (router, scaffolder, open-folders handler) passent le nom du stage. La compute est par-stage dans le scaffolder, donc le dossier journalier peut differer entre stages quand `{stage}` est utilise.
- La pref pre-existante `lazyDailyFolders` (default `true`) reste presente dans le schema mais n'est encore utilisee nulle part dans le code — orthogonale a `dailyFoldersEnabled` (lazy = quand creer, enabled = si creer). A wirer separement quand on en aura besoin (l'idee : creer le dossier journalier au premier routage plutot qu'au scaffold), ou a retirer si on conclut que l'eager-create du scaffolder est satisfaisant.
- L'UI Settings expose une section "DOSSIERS PAR JOUR" avec :
  1. Toggle pour `dailyFoldersEnabled`.
  2. Quand active : un `<select>` proposant les 3 presets + "Personnalise" qui revele un champ texte libre.
  3. Une preview live `<stage>/<dossier-genere>/Gen-4_demo.mp4` recalculee a chaque keystroke.

---

## ADR-024 : Routage audio — per-platform stage map + toggle `routeAllAudio`

**Date :** 2026-05-19
**Statut :** Acceptee

**Contexte :** Jusqu'a maintenant le routeur ne connaissait que video + image + project (PSD/AI/PRPROJ/AEP) et envoyait tout sur `activeStage` sauf les project files (→ src). Les AI directors utilisent de plus en plus de plateformes audio — Suno, ElevenLabs, Udio, Stable Audio pour la generation ; Splice, Loopcloud, Cymatics pour les sound banks — et toutes leurs sorties ont vocation a aller dans le stage **OST** (musique, voix, sound design) peu importe le stage actif du moment. Forcer le user a switcher manuellement vers OST a chaque drop est inacceptable (et casse le flow "drop and forget" qui fait la valeur du produit).

**Decision :** Deux mecanismes complementaires.

### 1. `PLATFORM_STAGE_OVERRIDES` (constante de code, pas de config)

Une map dans `src/core/router/resolver.ts` qui force le stage pour certaines plateformes :

```ts
{
  suno: 'ost', elevenlabs: 'ost', udio: 'ost', stable_audio: 'ost',
  aiva: 'ost', mubert: 'ost', soundraw: 'ost', splice: 'ost',
  loopcloud: 'ost', cymatics: 'ost',
  photoshop: 'src', premiere: 'src',
}
```

Quand `resolvePlatform()` retourne une cle presente dans la map, le `stageKey` est celui de la map plutot que `config.activeStage`. Les autres plateformes (runway / kling / luma / higgsfield / sora / veo / midjourney / krea / topaz) continuent de suivre `activeStage` — comportement existant preserve.

**Pourquoi en code et pas en config ?** Tres faible churn (les plateformes audio vont *toujours* vers OST par nature), et exposer ca en UI ouvrirait la porte a des mappings absurdes ("envoie Suno vers img") sans benefice. Si un user a un cas legitime de re-mapping (peu probable), un ADR-superseed le geera proprement. Photoshop/Premiere → src formalise une regle qui etait deja implicite via `projectExtensions`.

### 2. Toggle `preferences.routeAllAudio` (boolean, default `false`)

Quand `true`, n'importe quel fichier avec une extension dans `audioExtensions` mais **sans pattern de plateforme reconnu** est route vers OST (avec `platform: 'audio'` comme nom synthetique). Utile pour les sound banks dont le naming est totalement libre (`kick_03.wav`, `pad_dark.mp3`).

**Pourquoi opt-in et pas default-on ?** Le dossier Downloads contient souvent de la musique personnelle non liee aux campagnes. Un default-on enverrait `Pink_Floyd_Echoes.mp3` dans `04_OST/J2026-05-19/` au premier lancement — UX inacceptable. Le user doit confirmer activement qu'il sait ce qu'il fait. Le tooltip dans Settings dit explicitement : "Active uniquement si ton Downloads ne contient JAMAIS d'audio personnel".

**Pourquoi pas une logique heuristique (taille, duree, ML) ?** Le cout de complexite / faux positifs est dispro vs la simplicite d'un opt-in clair.

### Conflits de patterns

`'udio'` est sous-chaine de `'stable-audio'` → en `Object.entries` order, stable_audio doit etre liste **avant** udio dans le schema et la migration. Test couvert. Convention : a chaque nouvelle plateforme audio, verifier les sous-chaines vs les patterns existants.

### Migration

Pour les configs existantes (v0.1.0 → maintenant), la fonction pure `mergeNewPlatformPatterns()` (`src/core/config/migrations.ts`) est appelee au chargement de `store.ts`. Elle ajoute les 10 cles audio uniquement si absentes — les customisations user sur les cles existantes (`runway`, `photoshop`, etc.) sont preservees integralement. `audioExtensions` se voit injecter ses defaults via Zod (champ absent → default). Aucune action utilisateur requise post-upgrade.

### Consequences

- Les utilisateurs avec un Downloads "propre" peuvent activer `routeAllAudio` et ne plus jamais ranger leurs sound banks manuellement.
- Photoshop/Premiere → src est maintenant **double-couvert** : par `projectExtensions` (extension-driven) ET par `PLATFORM_STAGE_OVERRIDES` (platform-driven). Redondant mais defensif : si un user retire `.psd` de `projectExtensions` par erreur, la regle plateforme prend le relais.
- 21 plateformes par defaut (11 visuelles + 10 audio). La complexite de l'UI Settings monte d'un cran — l'ADR ne prescrit pas encore d'editeur generique pour `platforms`, juste un editeur scope aux 10 plateformes audio (commit #3).
- Quand on ajoutera la prochaine plateforme apres v0.2.0, refaire le meme pattern : ajouter dans `schema.ts` defaults, ajouter dans `migrations.ts` `POST_V1_PLATFORM_PATTERNS` (renommer si la version cible change), ajouter dans `PLATFORM_STAGE_OVERRIDES` si le stage est forced. Trois fichiers a synchroniser.

---

## ADR-025 : Animations — `framer-motion` + design system de durations/easings

**Date :** 2026-05-19
**Statut :** Acceptee

**Contexte :** Sprint 6 introduit des micro-animations partout dans l'overlay et les modales (accordion, popover, indicateur slot qui glisse, fade+scale des modales, flip stage badge, fade-in activity feed, fade-to-grey apres 30s). Sans cadre, on accumule du CSS one-off et des incoherences (un fade en 100ms, un autre en 250ms, un easing different par composant).

**Decision :**

### 1. Bibliotheque : `framer-motion`

Plutot que CSS pur + `@keyframes` + `transition`. Raisons :
- **Layout animations (`layoutId`)** — l'indicateur de slot actif (la barre verticale 2x14px qui marque le client courant) doit **glisser** entre les positions des 9 slots quand on switch. En CSS pur, ca demande de mesurer manuellement les positions avec `getBoundingClientRect()` puis d'animer `top` — chiant. Avec `<motion.div layoutId="slot-active-indicator">` dans le slot actif, framer-motion gere la transition automatiquement quand le `layoutId` change de parent DOM.
- **AnimatePresence** pour les exit-animations des modales et du popover. Une modale qui sort en fade+scale demande que le composant reste monte pendant l'animation puis se demonte — `<AnimatePresence>` automatise ce cycle. En CSS, il faut un state local `closing`, un setTimeout de la duree de l'anim, puis `setMounted(false)`. Erreur-prone.
- **Variants** pour les `mode="wait"` (stage badge flip a l'update).

Cout : ~32 kB gzip. Acceptable pour une desktop app pro (l'app pese ~140 kB renderer total).

CSS Tailwind reste utilise pour les hover-color transitions simples (`transition-colors duration-150 ease-out`) — pas besoin d'invoquer framer-motion pour passer de `transparent` a `#161616`.

### 2. Design system — duree + easing canoniques

Defini de facto dans le code, a respecter pour toute nouvelle animation :

| Cas                                      | Duration | Easing                       |
|------------------------------------------|----------|------------------------------|
| Hover (color/background fade)            | 150 ms   | `ease-out`                   |
| Toggle chevron rotation (accordion)      | 150 ms   | `[0.4, 0, 0.2, 1]`           |
| Layout animation (slot indicator slide)  | 200 ms   | `[0.4, 0, 0.2, 1]`           |
| Modal open/close (opacity + scale 0.96)  | 180 ms   | `[0.4, 0, 0.2, 1]`           |
| Popover open/close (opacity + scale + y) | 180 ms   | `[0.4, 0, 0.2, 1]`           |
| Stage badge flip (rotateX)               | 180 ms   | `[0.4, 0, 0.2, 1]`           |
| Activity feed entry fade-in              | 150 ms   | (default)                    |
| Activity feed fade-to-grey (30s tick)    | 800 ms   | (default)                    |
| Accordion content reveal (height+opacity)| 180 ms   | `[0.4, 0, 0.2, 1]`           |

`[0.4, 0, 0.2, 1]` est l'easing standard Material "standard". On l'a choisi parce qu'il est familier, lisible (rapide au depart, decelere), et un seul easing partout vaut mieux que cinq qui se ressemblent.

### 3. Ce qu'on n'anime PAS

- **Slot text color change** quand on switch (le texte ne fade pas du gris au blanc — c'est le slide de la barre indicateur qui porte la transition).
- **Stage button cycle** au-dela du flip badge — pas d'animation sur le STAGE label lui-meme.
- **Notification natives** — relevent de l'OS, pas du renderer.

### Consequences

- Toute nouvelle animation doit prendre l'une des durations/easings du tableau. Si un cas legitime ne fitte aucune, mettre a jour le tableau dans cet ADR plutot que d'introduire une valeur ad-hoc.
- Le bundle renderer passe de ~144 kB a ~176 kB (gzip 46 → 56 kB) — acceptable.
- En cas de probleme de performance sur des machines plus modestes, le toggle `prefers-reduced-motion` du navigateur sera honore via les API natives de framer-motion (`useReducedMotion`). Pas implemente pour l'instant — `prefers-reduced-motion` n'est pas signale par Windows en mode "performance" classique, donc gain marginal.
- Les tests Vitest qui touchent a des composants animes ne testent que la logique (predicats, hooks purs comme `isEscapeForClose`), pas le rendering ou les transitions — la suite ne charge pas RTL+JSDOM.

---

## ADR-029 : Systeme de themes — CSS variables + materiaux natifs OS

**Date :** 2026-05-19
**Statut :** Acceptee

**Contexte :** Sprint 7 introduit 6 themes premium (Obsidian, Carbon, Ivory, Mica, Liquid Glass, Aurora) avec switching live, integration native Mica sur Windows 11 et vibrancy sur macOS, et un fallback CSS pour les plateformes sans natif. Question architecturale : ou vit la source de verite des couleurs ? Comment integrer les materiaux OS sans casser le rendu sur les plateformes sans natif ?

**Decision :**

### 1. Source unique : `src/renderer/styles/themes.ts` + miroir CSS

Chaque theme est un objet TypeScript expose dans `THEMES` :
```ts
{ id, label, description, category, availability, cssVars, windowBackgroundMaterial?, vibrancy?, animatedBackground? }
```

`themes.css` mirrore les `cssVars` dans des selecteurs `:root[data-theme='<id>']`. Le switching est une seule mutation DOM : `document.documentElement.setAttribute('data-theme', id)`. Tous les composants qui consomment `var(--bg-primary)`, `var(--text-secondary)`, etc. se mettent a jour instantanement (cascade CSS, pas de re-render React force).

**Pourquoi miroir TS+CSS et pas TS injecte dynamiquement ?** L'injection dynamique de `<style>` au runtime fonctionnerait, mais (a) on perd la HMR et le linting CSS, (b) le premier paint a un flash sur le default avant que JS s'execute. Le miroir permet le rendu themed au tout premier paint (CSS charge avant JS).

Les tests asserent que les deux miroirs sont coherents (THEME registry vs CSS blocks).

### 2. Tokens canoniques

12 tokens, namespaces `--<scope>-<role>` :
- `--bg-primary` / `--bg-elevated` / `--bg-hover` / `--bg-modal`
- `--border-subtle` / `--border-divider`
- `--text-primary` / `--text-secondary` / `--text-muted` / `--text-disabled`
- `--accent`
- `--shadow-overlay`

Chaque theme DOIT definir tous les tokens (assert par `themes.test.ts`). Convention : composants consomment via inline `style={{ background: 'var(--bg-primary)' }}` ou via Tailwind classes mappees aux vars.

### 3. Materiaux OS via API natives

Effets impossibles a exprimer en CSS pur :
- **Mica** sur Windows 11 (build ≥ 22000) : `BrowserWindow.setBackgroundMaterial('mica')`. Effet visuel pilote par le compositeur Windows (DWM) — couleurs derriere la fenetre qui transpirent a travers le materiau translucide.
- **Vibrancy** sur macOS : `BrowserWindow.setVibrancy('hud')`. Effet visuel pilote par Core Animation — flou de fond + saturation, qui inclut la refraction subtile typique de macOS.

Service `src/main/services/theme-applier.ts` : ecoute l'IPC `theme:apply`, plan le materiau approprie selon (theme.id, process.platform, os.release()), applique sur la BrowserWindow active. Re-appel idempotent — peut etre appele a chaque switch sans accumuler d'etat.

`isWindowsAtLeast(currentRelease, minRelease)` parse les versions `os.release()` et compare numeriquement. Gate Mica sur ≥ `10.0.22000`.

### 4. Fallback CSS pour Liquid Glass sur non-macOS

Sur Windows et Linux, pas de vibrancy native equivalente. Le theme Liquid Glass conserve sa `cssVars` translucide (`rgba(20,20,20,0.55)` pour `--bg-primary`), et le theme-applier emet un event IPC `theme:glass-fallback` au renderer. Le renderer (via `useApplyTheme`) flippe l'attribut `data-glass-fallback="true"` sur `<html>`, et un selecteur CSS scope un `backdrop-filter: blur(40px) saturate(180%) brightness(110%)` sur la container racine :

```css
:root[data-theme='liquid-glass'][data-glass-fallback='true'] .overlay-root {
  backdrop-filter: blur(40px) saturate(180%) brightness(110%);
}
```

Le rendu n'est pas la vraie refraction Apple (qui inclut chromatic aberration au bord, distortion radiale), mais visuellement convaincant. Documente dans le tooltip du picker : "Fallback CSS — rendu optimal sur macOS".

### 5. BrowserWindow toujours `transparent: true` + `backgroundColor: '#00000000'`

Pour que Mica/vibrancy puissent "voir" derriere la fenetre, elle doit etre transparente cote Electron. Les themes opaques (Obsidian, Carbon, Ivory) peignent leur `--bg-primary` sur la container racine, qui masque la transparence. Les themes translucides (Mica, Liquid Glass) ont `--bg-primary: transparent`, laissant le materiau OS voir a travers.

Cela impose que `globals.css` mette `body { background-color: transparent }` — la couleur de fond vient toujours de la container racine, jamais du body.

### 6. Aurora — gradient anime CSS

Pas de native API. Pure CSS keyframes :
```css
@keyframes aurora-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

Avec `background-size: 400% 400%` sur un linear-gradient, l'animation balaye lentement les color stops (60 s par cycle). Acceleration GPU forcee via `transform: translateZ(0)` + `will-change: background-position`. Composant `AuroraBackground.tsx` monte conditionnellement quand le theme actif expose `animatedBackground`.

**Pourquoi pas une bibliotheque de particules pour Aurora ?** L'effet souhaite est lisse, contemplatif — pas du mouvement nerveux. Un gradient anime est exactement le bon outil. Ajouter `react-tsparticles` ou similar serait du sur-ingenierie.

### 7. Disponibilite per-theme — fonction pure `checkAvailability`

```ts
checkAvailability(theme, platform, osRelease) → { available, usesFallback, reason }
```

Retourne `available: false` pour Mica sur autre que Windows 11+ (pas de fallback). Retourne `available: true, usesFallback: true` pour Liquid Glass sur Windows/Linux. Universelles : toujours `{ available: true, usesFallback: false }`. Le picker UI grise les cards `!available` et affiche le `reason` en tooltip.

### Consequences

- **Migration des configs existantes** : Zod injecte `preferences.theme = 'obsidian'` automatiquement pour les configs persistees avant ce sprint. Aucune action utilisateur.
- **Bundle renderer** : ~9 kB ajoutes (themes.ts + .css). Negligeable.
- **Tous les composants** doivent consommer `var(--*)` — l'audit du sprint a migre 171 occurrences de couleurs hardcodees sur 17 fichiers vers les tokens. Tout futur composant doit suivre cette convention.
- **Test de coherence** assure que chaque theme definit tous les tokens. Si un futur theme oublie un token, le test echoue au CI.
- **Le screenshot `docs/themes-preview.png` est a generer manuellement** — Claude ne peut pas captures-screenshot. Solution : ouvrir Settings > APPARENCE et capturer la grille 2×3, puis ajouter au repo.

---

## ADR-026 : Activity feed remplace par un toast agregat avec debounce 3 s

**Date :** 2026-05-19
**Statut :** Acceptee, supersede la decision implicite du Sprint 6 (feed permanent de 5 lignes par fichier)

**Contexte :** Le Sprint 6 introduisait un `ActivityFeed` permanent sous la liste des slots : 5 lignes max, une par fichier route, avec timestamp relatif et fade-to-grey apres 30 s. Apres test sur des sessions reelles, deux problemes :

1. **Bruit visuel disproportionne** — un AI director qui drop 8 plans Runway d'un coup voit 5 lignes quasi-identiques `↳ Gen-4_001.mp4 → YSL / out` qui ne lui apprennent rien de plus que "ca route" (et il le sait deja par la notification systeme native). La densite d'information est faible.
2. **Le feed occupe verticalement de la place permanente** dans une fenetre de 290×468 deja contrainte. On a sacrifie ~120 px qui auraient pu rester aux slots.

**Decision :** Remplacer le feed permanent par un **toast** ephemere en bas de l'overlay (au-dessus du footer), qui :
- Agrege les arrivees en buckets `(type × stage)`. Une ligne par bucket : `2 vidéos envoyées vers 03_Outputs` plutot que `Gen-4_001.mp4`, `Gen-4_002.mp4`, ...
- N'apparait qu'apres une fenetre de silence de **3 secondes** (debounce) — laisse a chokidar le temps de finir d'emettre les events `awaitWriteFinish` pour des fichiers dropees ensemble.
- Reste affiche 4 s, puis fade-out en 600 ms. Si une nouvelle arrivee tombe pendant les 4 s, le timer est reset et les compteurs s'incrementent en place — l'utilisateur voit `1 vidéo → 2 vidéos → 3 vidéos` sans que le toast clignote.

**Pourquoi 3 s de debounce et pas plus / moins ?**
- chokidar `awaitWriteFinish.stabilityThreshold` est a 2000 ms. Une fenetre de 3 s englobe l'event "ecriture finie" + 1 s de tampon pour les fichiers en serie.
- En dessous de 3 s, le toast clignote a chaque drop (un drop de 5 fichiers via Runway "Download all" arrive en ~2.5 s).
- Au-dessus de 5 s, l'utilisateur a deja change de contexte (ouvert DaVinci, etc.) et la confirmation devient inutile.

**Pourquoi un toast plutot qu'une notif systeme ?**
- Les notifs systeme sont deja la (`preferences.notifyOnRoute`), elles sont per-fichier et apparaissent dans le centre de notifications Windows. Cible : confirmation rapide qu'un fichier est bien arrive.
- Le toast in-overlay sert l'autre cas d'usage : "j'ai dropp un batch, est-ce que tout est passe ?". Il aggrege.
- Les deux sont complementaires, pas concurrents. Le user peut desactiver la notif systeme si elle le derange, le toast reste.

**Format de la ligne :** `<count> <noun> <participle> vers <stage_folder_name>`. Helper `formatActivityLine(count, type, stageFolderName)` dans `src/shared/i18n/activity.ts` gere la pluralisation et l'accord du participe en francais (10 tests). Les types sont determines a l'IPC (cote main) via `classifyExtension()` qui partage le code avec le router pour eviter les divergences (project > audio > video > image en ordre de priorite).

**Pourquoi le glyphe (spinner + particules) ?**
- Le toast est silencieux et minimaliste. Sans signal visuel "ca bouge", il pourrait passer pour un panneau statique.
- Un spinner pendant l'affichage signale "operation en cours" (memori metaphore).
- Au moment du fade-out, le spinner se dissout en 6 particules qui se dispersent — signale clairement la fin du cycle. Plus expressif qu'un simple fade. Inspire des transitions Linear/Notion.
- 6 particules, 550 ms de duree, accent `#9090E0` (subtle purple pour donner une identite Shift-K — distinct du blanc/gris du reste de l'overlay).

**Consequences :**
- `ActivityFeed.tsx` est supprime. Son comportement (5 dernieres routes, fade-to-grey 30 s) ne survit nulle part.
- `ActivityType` ajoute a `@shared/types`. L'IPC `activity:routed` transporte maintenant un champ `type: 'video' | 'image' | 'audio' | 'project' | null` (null pour les fichiers dont l'extension n'est dans aucune liste — ne devrait pas arriver puisque le router refuse de les router, mais defensif).
- Le hauteur de l'overlay passe de 468 → 520 px (ADR pas requis, change trivial dans `overlay.ts`). Necessaire pour caser le toast en bas + popover stage qui s'ouvre vers le haut + slots integralement visibles.
- Si plus tard on veut un historique persistant et requetable (Phase Gamma : recherche dans les plans generes), il vivra ailleurs (SQLite + UI dediee), pas dans le feed overlay.

---

## ADR-027 : Animations stochastiques — `framer-motion` plutot que CSS keyframes

**Date :** 2026-05-19
**Statut :** Acceptee, prolonge ADR-025

**Contexte :** Sprint 6.1 introduisait un spinner + dispersion de 6 particules. Sprint 6.2 le remplace par un `ParticleBurst` : 12 a 16 particules par burst, chacune avec un angle, un rayon, une taille **randomisees** au moment du declenchement. Chaque burst doit avoir une silhouette differente — c'est ca qui le rend "organique" plutot que mecanique.

CSS keyframes ne se prete pas a ca proprement :
- Un `@keyframes` est une definition statique. Pour animer 16 particules dans 16 directions distinctes, il faudrait **16 regles CSS** ecrites a la main (ou genere via JS et inject en runtime — alambique).
- Alternative : `@keyframes` parametre par CSS custom properties (`--dx`, `--dy`) settees inline sur chaque element. Marche, mais on perd l'expressivite de pouvoir faire varier l'easing par axe (`opacity: { duration, times }` separe du `x`/`y`/`scale`), et le pattern "remount sur key change pour rejouer" devient un hack (toggle de classe + setTimeout pour forcer reflow).

framer-motion gere ca trivialement :
- Chaque `<motion.circle>` accepte `initial`, `animate`, `transition` independants. Les valeurs cibles sont des nombres JS — on peut les calculer avec `Math.random()` et `useMemo(generate, [])`.
- Pour rejouer : la convention est `<BurstInstance key={trigger} />` dans le parent. React unmount/remount sur key change, et framer-motion repart de `initial`. C'est documente, idiomatique, deux lignes de code.
- Cout : 0 — framer-motion est deja dans le bundle depuis ADR-025.

**Decision :** Toute animation **stochastique** (parametres randomises a chaque declenchement) utilise framer-motion avec le pattern :

```tsx
function Burst({ trigger }: { trigger: number }) {
  return <BurstInstance key={trigger} />;
}
function BurstInstance() {
  const particles = useMemo(generateParticles, []);
  return <svg>{particles.map(p => <motion.circle ... />)}</svg>;
}
```

Les animations **deterministes simples** (hover-color, fade, scale fixe) restent en Tailwind/CSS — pas la peine d'invoquer framer-motion pour une transition `background 150ms ease-out`. Ligne de partage : si une valeur d'animation depend d'un appel runtime (random, mesure DOM, derivation d'etat), framer-motion. Sinon CSS suffit.

**Convention sur les bursts visuels Shift-K :**
- Couleur : **blanc pur uniquement** (`#FFFFFF`). Le bundle d'identite visuelle est volontairement minimaliste — l'accent purple `#9090E0` du spinner Sprint 6.1 est retire avec lui.
- Pas de trainees. Pas plus de 16 particules. Duree ≤ 700 ms total.
- Easing canonique pour les bursts : `cubic-bezier(0.16, 1, 0.3, 1)` — strong ease-out, qui reproduit la forme d'une vraie explosion (rapide au depart, decelere fort). Ajoute a la table de durees d'ADR-025 :

  | Cas                              | Duration | Easing                     |
  |----------------------------------|----------|----------------------------|
  | Particle burst                   | 700 ms   | `[0.16, 1, 0.3, 1]`        |
  | Central flash (burst centre)     | 200 ms   | `[0.16, 1, 0.3, 1]`        |

**Demo page :** `particle-demo.html` + `src/renderer/dev/particle-demo.tsx` (registre dans `vite.config.ts > rollupOptions.input`). Accessible en dev a `http://localhost:5173/particle-demo.html`. Bouton "Trigger burst" + "Loop ×1.2s" pour iterer sans avoir a dropper un fichier reel et attendre le cycle du toast (3 s debounce + 4 s visible + 600 ms fade). La page reste dans la build de prod mais Electron ne la charge jamais — overhead negligeable (~3 kB).

**Consequences :**
- ActivitySpinner.tsx supprime. La metaphore "loader rotatif + dispersion" est remplacee par "burst d'apparition + burst de dissolution + silence entre les deux" — l'utilisateur lit le texte du toast sans element visuel en mouvement.
- Le pattern `key={trigger}` + `useMemo(generate, [])` est applicable a toute autre micro-animation que je voudrais randomiser plus tard (un confetti pour un milestone, un sparkle au switch de slot, etc.).
- Si un jour on a besoin d'une bibliotheque de particules plus puissante (gpu-accelerated, des milliers d'instances), `react-tsparticles` est l'option de reference. Pas necessaire pour notre usage actuel.

---

## ADR-028 : L'overlay est verrouille a 290×520 ; aucune modale n'utilise `position: fixed`

**Date :** 2026-05-19
**Statut :** Acceptee

**Contexte :** Un bug visuel critique decouvert pendant les tests de Sprint 6.2 : a l'ouverture de n'importe quelle modale (NewProject, EditSlots, OpenFolders, Rescan), l'overlay **paraissait** se redimensionner — les coins arrondis disparaissaient, un rectangle plein remplacait la silhouette luxe arrondie. Comportement identique pour les 4 modales.

**Cause racine :** la BrowserWindow restait bien a 290×520 (verifie par inspection des bounds — pas de `setSize` / `setBounds` nulle part). Mais :
- Le container racine de `OverlayApp.tsx` avait `width: 290` et **pas de `height`** → sa hauteur naturelle etait celle du contenu (~455 px).
- Les modales etaient rendues en `position: fixed inset: 0` → positionnees par rapport au **viewport** (290×520), pas par rapport au container arrondi (290×455).
- Resultat : la modale couvrait les 290×520 du window en rectangle plein, debordant les 65 px transparents en bas du container arrondi. L'effet visuel : "perte des coins + agrandissement".

**Decision :**

### 1. La BrowserWindow est **immuable** en runtime

- Dimensions verrouillees : `OVERLAY_WIDTH = 290`, `OVERLAY_HEIGHT = 520`.
- Flags BrowserWindow : `resizable: false`, `useContentSize: false` (explicite — la taille passee est la taille de la fenetre OUTER, pas du contenu).
- **Aucun appel a `setSize` / `setBounds` / `setContentSize`** n'est autorise dans le main process. Test de regression `src/main/windows/overlay.test.ts` inspecte le source pour bloquer ces patterns (et `did-finish-load` qui est le declencheur typique).
- Aucun listener qui ajuste les bounds en fonction du DOM. Si plus tard on veut un mode "compact" (overlay rapetisse), ce sera une recreation explicite de la window, pas une mutation in-place.

### 2. Le container `OverlayApp` remplit la fenetre

`width: '100vw', height: '100vh'` + `borderRadius: 14, overflow: 'hidden', position: 'relative'` + flex column. Tout enfant en `position: absolute` est confine au rectangle arrondi 290×520 — le `overflow: hidden` le clip aux coins.

Layout flex column avec un spacer `flex: 1` entre le slot-list et le bloc stage+footer : pousse la stage bar et le footer au bas de la window, et laisse un gap d'environ 65 px dans lequel le toast activity flotte quand visible.

### 3. Les modales sont **toujours** en `position: absolute`

Convention :
```tsx
<motion.div
  style={{
    position: 'absolute', // JAMAIS fixed — voir ADR-028
    inset: 0,
    background: 'rgba(10,10,10,0.95)',
    backdropFilter: 'blur(2px)',
    borderRadius: 14,    // defense-in-depth si parent perd overflow:hidden
    zIndex: 100,
    ...
  }}
>
```

`borderRadius: 14` est redondant avec `overflow: hidden` du parent, mais sert de filet de securite — si un futur refactor casse l'overflow parent, le modal arrondit deja lui-meme.

### 4. Le toast activity est positionne au-dessus du **stage bar**, pas du footer

`bottom: 93` = footer (44) + divider (1) + stage (40) + 8 px de gap. Toast flotte dans le spacer flex au-dessus du stage bar, sans empieter sur les slots (`maxHeight: 64`).

**Pourquoi pas `position: fixed` avec une window plus grande ?** Tentee pendant Sprint 6.1 (bump 468 → 520). Echoue parce que `fixed` rapporte toujours au viewport entier (290×520), et la window reste necessairement plus grande que le container arrondi pour laisser de l'air aux animations (popover stage qui s'ouvre vers le haut, etc.). La bonne reponse est de remplir le container, pas d'agrandir la window.

**Consequences :**
- Toute future modale ou overlay flottant doit suivre la convention `position: absolute` confinee au container racine. Pas d'exception.
- Le test de regression bloque les patterns dangereux dans `overlay.ts` (`setSize`, `setBounds`, `setContentSize`, `did-finish-load`). Si un changement legitime de window dimensions devient necessaire un jour, le test doit etre mis a jour avec un ADR nouveau qui supersede 028.
- L'identite visuelle "luxe arrondi" (preservation des coins, transparence subtile autour) est protegee par construction — un modal qui passerait en `fixed` casserait le test au CI, pas en production.

---

## ADR-029 (revisited Sprint 7.6) : Mica et Aurora retires

**Date :** 2026-05-20
**Statut :** Acceptee, supersede partiellement ADR-029 (Sprint 7 initial)

**Contexte :** Sprint 7 livrait 6 themes. Apres Sprint 7.1 → 7.5 et tests en condition reelle :
- **Mica** ne s'applique pas visuellement de maniere fiable. L'API Electron `BrowserWindow.setBackgroundMaterial('mica')` repond sans erreur (`succeeded` dans nos logs), mais le rendu final reste un gris opaque ou un materiau tres faible — rien a voir avec le rendu Mica fluide d'une vraie app WinUI 3 (Settings Windows 11, par exemple). Le moteur Chromium d'Electron ne supporte qu'imparfaitement le pipeline DWM Mica, et chaque release Electron change subtilement le comportement. Maintenir un thema qui promet du Mica mais delivre du grise est une promesse non tenue.
- **Aurora** : l'animation CSS keyframes ne s'enclenche pas systematiquement au premier mount (constate Sprint 7.1, contourne avec framer-motion, encore instable). Le ROI design est faible : un gradient anime sur un overlay de 290x460 ne se voit quasiment pas, et quand il se voit il distrait.

**Decision :** Retirer Mica et Aurora du registre. Garder Obsidian, Carbon, Ivory, Liquid Glass. 4 themes maintenables, tous testes visuellement OK.

**Consequences :**
- `ThemeId` enum reduit a 4 valeurs.
- Configs persistees avec `theme: 'mica'` ou `theme: 'aurora'` coercees a `'obsidian'` via `z.preprocess` — silencieux, sans erreur utilisateur.
- `theme-applier.ts` simplifie : plus de branche Mica, juste vibrancy macOS + signal CSS fallback pour Liquid Glass.
- `AuroraBackground.tsx` supprime, keyframes `@aurora-shift` retires de globals.css.
- Card picker passe de 6 a 4. Le picker reste en grille 2x3 visuelle (les 2 dernieres slots sont juste vides ou la grille devient 2x2 — voir picker actuel).
- La detection `isWindows11OrLater` reste exportee dans `theme-applier.ts` pour un futur sprint qui reintroduirait un effet Win-build-gated avec une approche differente.

---

## ADR-030 : Liquid Glass renomme "Transparency" sur Windows/Linux

**Date :** 2026-05-20
**Statut :** Acceptee

**Contexte :** Le thema `liquid-glass` utilise la vibrancy native AppKit sur macOS (vraie refraction GPU + sampling inter-fenetres) et un CSS `backdrop-filter: blur + saturate` sur Windows/Linux (gaussian blur sur ce qui est visible derriere la fenetre transparente, sans refraction). Les deux rendus sont differents : Apple delivre "Liquid Glass", nous delivrons "verre translucide flou". Appeler les deux "Liquid Glass" survend le rendu Windows et frustre l'utilisateur qui s'attend a l'effet macOS.

**Decision :** Le `Theme.label` et `Theme.description` deviennent platform-dependent via les helpers `getThemeLabel(theme, platform)` et `getThemeDescription(theme, platform)`. Pour `liquid-glass` :
- macOS → label = `"Liquid Glass"`, description = `"Vibrancy native macOS, profondeur translucide."`
- Windows / Linux → label = `"Transparency"`, description = `"Verre depoli translucide. Approximation CSS."`

L'`id` interne reste `'liquid-glass'` — la migration de config ne change rien, et l'affichage est purement cosmetique au picker.

**Consequences :**
- 2 fonctions pures testables (`getThemeLabel` / `getThemeDescription`) dans `themes.ts`, 2 tests dedies dans `themes.test.ts`.
- Le picker SettingsApp consomme ces helpers via `platformInfo` (deja recupere par IPC `system:platform-info` au mount).
- Les futurs themes pourront suivre le meme pattern s'ils ont besoin de noms differents par plateforme — l'opt-in vit dans le helper, pas dans le type `Theme`.
