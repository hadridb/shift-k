# Shift-K — Roadmap

> Etat du projet, jalons, livrables. Source de verite : `CLAUDE.md` + ce fichier.

---

## Phase 0 — Scaffolding (en cours, 1 session)

**Objectif :** un projet Electron + React + TS qui s'installe et affiche une fenetre vide.

- [x] CLAUDE.md, README.md, .gitignore, docs/ poses
- [ ] `pnpm init`, `package.json` configure
- [ ] `tsconfig.json` strict
- [ ] `vite.config.ts` pour le renderer
- [ ] `electron/main` boilerplate, BrowserWindow vide
- [ ] `electron/preload.ts` avec contextBridge minimal
- [ ] `src/renderer/main.tsx` qui affiche "Shift-K"
- [ ] Tailwind configure
- [ ] Scripts `pnpm dev`, `pnpm build`
- [ ] `electron-builder.yml` minimal pour `.exe`
- [ ] Premier commit + push sur github.com/hadridb/shift-k
- [ ] GitHub Actions : lint + build sur PR

**Livrable :** clone le repo, `pnpm install`, `pnpm dev`, fenetre vide qui dit "Shift-K".

---

## Phase Alpha — Parite V1 (6-8 semaines, ~6-8 sessions)

**Objectif :** Shift-K Windows fait tout ce que la V1 PowerShell fait, en mieux.

### Sprint 1 : Moteur metier (2 semaines)

- [ ] `src/core/config/` : schema Zod + store electron-store, migrations
- [ ] `src/core/router/` : pattern matcher (port de Resolve-PhasmaPlatform), destination resolver (port de Resolve-PhasmaDestination)
- [ ] `src/core/watcher/` : chokidar wrapper avec retry-move, debounce events, gestion des fichiers ouverts
- [ ] `src/core/scanner/` : rescan manuel du Downloads
- [ ] `src/core/projects/` : scaffold nouveau projet depuis template, slots
- [ ] Tests Vitest pour chaque module (>80% coverage sur core)

### Sprint 2 : Overlay always-on-top (2 semaines)

- [ ] BrowserWindow `frameless`, `transparent`, `alwaysOnTop`, `skipTaskbar`
- [ ] React component `OverlayApp.tsx` reproduisant le design V1 (noir profond, blanc parcimonieux)
- [ ] Drag-to-move via webkit-app-region ou IPC
- [ ] Liste des 9 slots cliquables avec indicateur actif (trait vertical blanc)
- [ ] Stage badge cyclable
- [ ] Footer 5 icones (Open, Pause, Rescan, +Projet, Settings)
- [ ] Position persistee dans config
- [ ] Refresh sur changement config (watch config.json ou IPC broadcast)

### Sprint 3 : Dialogues utilitaires (1.5 semaines)

- [ ] `NewProject.tsx` : creer projet (client + mission), scaffold dossiers depuis template
- [ ] `EditSlots.tsx` : assigner les 9 slots a des projets existants
- [ ] `OpenFolders.tsx` : selection multi-checkbox + ouverture Explorer / Finder en parallele

### Sprint 4 : Routing en background + tray (1 semaine)

- [ ] Tray icon (Win) / menu bar (Mac) avec etat (active client, paused)
- [ ] Lancement au login (Electron `app.setLoginItemSettings`)
- [ ] globalShortcut : Ctrl+Alt+1..9 switch slot, Ctrl+Alt+F open folders, Ctrl+Alt+Space pause, Ctrl+Alt+P show overlay
- [ ] Notifications natives sur route

### Sprint 5 : Pause + logs + utilitaires (1 semaine)

- [ ] Toggle pause global (avec persistance + visuel overlay)
- [ ] Log viewer dans Settings (voir les routes recentes)
- [ ] Quarantaine UI : si fichier non-route depuis >5min dans Downloads matchant un pattern, alerter
- [ ] Cleanup auto des logs > 30 jours

**Livrable Phase Alpha :** Shift-K v0.5.0 sur Windows, parite fonctionnelle V1. Hadrien arrete la V1 PowerShell et passe sur la V2 en production sur ses vrais clients.

---

## Phase Beta — Production-grade (4-6 semaines)

### Sprint 6 : Settings panel complet (2 semaines)

- [ ] `Settings.tsx` avec onglets : General, Routing, Slots, Hotkeys, Apparence, Avance
- [ ] **General** : chemin dossier projets (file picker), Downloads (auto + override), langue
- [ ] **Routing** : edit patterns plateformes (CRUD), test field live, edit extensions image/video/projet/ignore
- [ ] **Slots** : reorganiser (drag-drop), renommer slots avec un alias court
- [ ] **Hotkeys** : rebind chaque action, detection conflits, reset defaults
- [ ] **Apparence** : theme system/dark/light, accent color, taille overlay, fonts
- [ ] **Avance** : naming stages (rename UI safe), format dossier jour (template + preview live), groupByPlatform toggle, devtools

### Sprint 7 : Onboarding wizard (1 semaine)

- [ ] 5 ecrans : welcome, projects folder, Downloads, premier projet (optionnel), browser extension (optionnel)
- [ ] Detection auto Downloads
- [ ] Defaut projects folder = ~/Documents/Shift-K
- [ ] Skip + accessibilite

### Sprint 8 : Build Mac + signing (1.5 semaines)

- [ ] electron-builder Mac : DMG, PKG, target arm64 + x64
- [ ] Apple Developer Program ($99/an)
- [ ] Code signing Developer ID Application
- [ ] Notarisation Apple
- [ ] Tray icon Mac (template image)
- [ ] Tests sur MacBook reel

### Sprint 9 : Auto-update + telemetry minimale (1 semaine)

- [ ] electron-updater wire-up (GitHub Releases prive ou S3)
- [ ] Update prompt UI (download in background, install on next restart)
- [ ] Telemetry opt-in : nb fichiers routes par jour, plateformes utilisees (anonyme)

**Livrable Phase Beta :** Shift-K v1.0.0-beta. Installable .dmg sur Mac, .exe sur Windows, signe, auto-update operationnel.

---

## Phase Gamma — Capture metadonnees + recherche (4-6 semaines)

### Sprint 10 : Extension Chrome (2.5 semaines)

- [ ] Manifest V3, content scripts pour chaque plateforme :
  - midjourney.com (et Discord via integration)
  - runwayml.com
  - klingai.com (kling.kuaishou.com)
  - higgsfield.ai
  - lumalabs.ai (dream-machine)
  - sora.com / chatgpt.com
  - krea.ai
  - topazlabs.com
- [ ] `chrome.downloads.onCreated` listener + scrape DOM pour prompt/seed/params
- [ ] Native messaging host pour com securisee avec Shift-K desktop
- [ ] UI extension minimale : popup avec etat connexion + dernier capture

### Sprint 11 : SQLite metadata store (1.5 semaines)

- [ ] better-sqlite3 dans main process
- [ ] Schema : `files`, `prompts`, `metadata`, `tags`
- [ ] Indexation FTS5 sur prompts
- [ ] xattrs (Mac) / ADS (Win) en complement pour portabilite
- [ ] Sidecar `.shiftk.json` fallback si xattrs/ADS indisponibles

### Sprint 12 : UI recherche (1.5 semaines)

- [ ] `Search.tsx` : barre de recherche globale (Cmd/Ctrl+K)
- [ ] Resultats avec preview (thumbnail genere par sharp), prompt, plateforme, date, client
- [ ] Filtres : par client, par plateforme, par stage, par range de date
- [ ] Open in folder + copy path

**Livrable Phase Gamma :** Shift-K v1.5.0. Search global operationnel, metadonnees capturees automatiquement.

---

## Phase Release — Commercialisation (en parallele de Gamma)

- [ ] Domaine shift-k.app ou shift-k.com (a verifier)
- [ ] Landing page : Astro + Tailwind, demo video 30s, pricing
- [ ] Compte Stripe + Stripe Checkout
- [ ] Systeme de licence (cle a entrer dans l'app, validation locale + serveur)
- [ ] Privacy policy + terms
- [ ] Apple Developer + Sectigo EV cert Windows (~$400)
- [ ] Beta privee : 10 directors creatifs invites
- [ ] Public launch : ProductHunt, X, LinkedIn

---

## Indicateurs de succes V1.0

- Cible : 100 utilisateurs payants a 3 mois post-launch
- NPS > 50
- Churn mensuel < 5%
- Crash-free sessions > 99.5%
