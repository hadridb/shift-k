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
