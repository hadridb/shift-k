# Theme system — debug snapshot

Template à remplir manuellement par l'utilisateur lors d'un bug de thème.
Le diagnostic main-process est loggé automatiquement au démarrage de
l'app (voir `src/main/debug/theme-diagnostics.ts`). Ce fichier compile
les sorties devtools (renderer) à coller à côté.

## Diagnostic main process (auto)

À récupérer dans le terminal `npm run dev` au démarrage :

```
═══ Shift-K theme diagnostics ═══
  platform           : ...
  os.release()       : ...
  windows build      : ...
  Mica supported     : ...
  Electron version   : ...
  Chrome version     : ...
  Node version       : ...
  setBackgroundMaterial available : ...
  setVibrancy available           : ...
  app version        : ...
═══════════════════════════════════
```

## Diagnostic renderer (manuel)

Ouvrir devtools sur l'overlay (à activer temporairement via
`overlayWindow.webContents.openDevTools({ mode: 'detach' })` dans
`overlay.ts` si nécessaire — la fenêtre est frameless), puis :

```js
// 1. Vérifier que la fenêtre est transparente
document.documentElement.style.background
window.getComputedStyle(document.documentElement).background
window.getComputedStyle(document.body).background

// 2. Inspecter le data-theme actuel
document.documentElement.getAttribute('data-theme')
document.documentElement.getAttribute('data-glass-fallback')

// 3. Vérifier les CSS vars actives
getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')
getComputedStyle(document.documentElement).getPropertyValue('--bg-modal')

// 4. Demander au main process l'état complet
await window.shiftK.applyTheme  // exists?
await window.shiftK.getPlatformInfo()
```

Coller les sorties dans la section suivante.

## Snapshot

> _vide — remplir manuellement_
