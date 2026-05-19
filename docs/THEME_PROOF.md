# Theme system — visual proof

Track record du rendu visuel des 6 thèmes. À remplir avec screenshots
manuels après chaque sprint touchant aux thèmes.

## Cible visuelle attendue

| Thème          | Rendu attendu                                                  |
| -------------- | -------------------------------------------------------------- |
| Obsidian       | Noir opaque uni, aucune transparence                           |
| Carbon         | Anthracite chaleureux opaque, accents ivoire                   |
| Ivory          | Crème clair opaque, texte sombre, accent or sourd              |
| Mica           | Matériau Windows 11 visible (wallpaper desktop en filigrane)   |
| Liquid Glass   | Flou 40 px + saturation derrière le contenu, fond translucide  |
| Aurora         | Gradient violet/bleu qui balaye visiblement en 60 s            |

## Vérifications automatiques (passent au CI)

- `npm test` — 121 tests verts (themes.ts structure, isWindowsAtLeast,
  checkAvailability, schema migration).
- `npm run typecheck` — 0 erreur.

## Vérifications manuelles à effectuer

Pour chaque thème :

1. **Switch** via Settings → APPARENCE → click sur la card
2. **Inspection devtools** dans la fenêtre overlay (auto-open en dev) :
   - `document.documentElement.getAttribute('data-theme')` doit correspondre
   - `getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')` :
     - opaques (Obsidian / Carbon / Ivory) : valeur hex ou rgb solide
     - translucides (Mica / Aurora) : `transparent`
     - Liquid Glass : `rgba(20, 20, 20, 0.55)`
3. **Logs terminal** (`[theme] applying <id>` + `setBackgroundMaterial(...)
   succeeded` ou `(none) — cleared`)
4. **Screenshot** : `Win+Shift+S` (ou ShareX si Mica/Glass — voir
   docs/KNOWN_LIMITATIONS.md)

## Snapshots

> _placeholders — coller les screenshots `.png` à côté avec les noms
> `proof-obsidian.png`, `proof-carbon.png`, etc. dans `docs/`_

- [ ] `proof-obsidian.png`
- [ ] `proof-carbon.png`
- [ ] `proof-ivory.png`
- [ ] `proof-mica.png`
- [ ] `proof-liquid-glass.png`
- [ ] `proof-aurora.png`

## Notes par thème

### Mica

Logs attendus à l'apply :
```
[theme] applying mica — platform= win32 ...
[theme] win11 detected: true (build threshold 22000)
[theme] setBackgroundMaterial( mica ) succeeded
```

Logs renderer attendus dans devtools :
```
[renderer] theme:changed received — mica
```

### Liquid Glass

Logs main :
```
[theme] applying liquid-glass — ...
[theme] glass-fallback signal sent: true   (sur Windows / Linux)
```

Logs renderer :
```
[renderer] theme:changed received — liquid-glass
[renderer] glass-fallback received — true
```

DOM doit contenir un `<div class="glass-layer">` sibling de la première
section de contenu.

### Aurora

Logs renderer :
```
[renderer] theme:changed received — aurora
[aurora] mounted { colors: ['#1A1530', '#0A1428', '#15203A'], durationSeconds: 60 }
```

DOM doit contenir une `<motion.div>` avec `background: linear-gradient(...)`
et l'animation `backgroundPosition` qui shift toutes les ~30s.
