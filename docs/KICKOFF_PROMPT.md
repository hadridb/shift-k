# Kickoff prompt pour la premiere session Claude Code

> Copie-colle ce bloc dans Claude Code des qu'il est lance dans le dossier `Shift-K App/`.

---

Salut Claude, on demarre Shift-K en V2. Lis d'abord `CLAUDE.md` et les fichiers de `docs/` (ROADMAP, DECISIONS, V1_REFERENCE) — c'est ta memoire long terme du projet.

Mon repo GitHub est : **https://github.com/hadridb/shift-k.git** (prive). Le repo est vide.

Pour cette premiere session, je veux qu'on accomplisse Phase 0 — Scaffolding (voir ROADMAP.md). Concretement :

1. Init `pnpm` et `package.json` avec les bonnes deps (Electron, React, TypeScript, Vite, Tailwind, electron-builder, electron-store, chokidar, vitest, eslint, prettier)
2. Configure `tsconfig.json` strict avec les path aliases `@core/*`, `@shared/*`, `@renderer/*`, `@main/*`, `@preload/*`
3. Configure `vite.config.ts` pour le renderer
4. Configure `tailwind.config.ts` + `postcss.config.js` + `src/renderer/styles/globals.css`
5. Cree le squelette `src/main/index.ts` avec une BrowserWindow vide (non transparente pour ce premier jet, juste verifier que ca lance)
6. Cree `src/preload/index.ts` avec contextBridge minimal
7. Cree `src/renderer/main.tsx` + `src/renderer/App.tsx` affichant "Shift-K" en gros, fond noir, typo Segoe UI
8. Ajoute les scripts `dev`, `build`, `lint`, `test` dans package.json
9. Configure `electron-builder.yml` minimal pour produire un `.exe` Windows (Mac viendra en Phase Beta)
10. Premier commit `chore: initial scaffolding` + push sur main
11. GitHub Actions workflow basique : `.github/workflows/ci.yml` qui lance lint + build sur PR

Avant de commencer, configure mon Git local si pas deja fait :
- `git config --global user.email "hadridb@gmail.com"`
- `git config --global user.name "Hadrien Durand-Baissas"`

Et installe `pnpm` globalement si pas deja fait :
- `npm install -g pnpm`

Quand tu rencontres une decision non-triviale (ex : version exacte d'une lib, structure de dossier alternative, formatter), justifie ton choix dans le commit message ou ajoute un nouvel ADR dans `docs/DECISIONS.md`.

Vas-y, je te suis pas a pas.
