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
