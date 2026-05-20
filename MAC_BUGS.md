# Bugs Mac à corriger

Tracker des bugs trouvés en test Mac. À fermer au fil des passes.

## Démarrage

- [ ] `[theme] applyTheme called but no overlay window` apparaît 2× dans la console
      au démarrage. Cause probable : `applyTheme` appelé avant la création de la
      BrowserWindow overlay. Pas bloquant mais à investiguer.

## Liquid Glass (Sprint 8d — en cours de validation)

Avant Sprint 8d, la vibrancy `'hud'` rendait un gris semi-transparent uniforme,
loin de l'effet macOS 26 Liquid Glass attendu.

Sprint 8d (ADR-030 revision) applique 4 niveaux d'approximation :
1. Vibrancy `'fullscreen-ui'` (matériau Control Center / Menu Bar) au lieu de `'hud'`
2. `visualEffectState: 'active'` au constructor — vibrancy reste vivante quand
   l'overlay perd le focus
3. Couche CSS subtile macOS-only sur `.glass-layer` : `saturate(140%) brightness(108%)`
   + inset box-shadow chromatique ±0.5 px (rose à gauche, bleu à droite)
4. `.modal-backdrop` (blur 20 px + alpha 0.15) entre UI et modal pour push-back
   stacking macOS 26

À valider en test Mac :
- [ ] L'overlay liquid-glass montre un vrai backdrop blur dynamique (pas du gris)
- [ ] Aberration chromatique visible mais subtile sur les bords
- [ ] Ouverture d'un modal floute le reste de l'UI
- [ ] Pas de régression sur les 3 autres thèmes (Obsidian / Carbon / Ivory)

Screenshots avant/après à déposer dans `docs/screenshots/sprint-8d-liquid-glass/`
au prochain test Mac (préfixes `before-` et `after-`).

## Sprint 8d.3 — Transparence max

Suite à 8d.2 ("specular validée, mais encore trop opaque"). Audit a montré que
`.overlay-root` peignait `var(--bg-primary)` à `rgba(20,20,20,0.55)` — voile
55 % qui écrasait la vibrancy. Tokens revus :
- `--bg-primary` : 0.55 → 0.04 (vibrancy passe à travers)
- `--bg-elevated` : 0.55 → 0.30 (inputs / cards restent lisibles)
- `--bg-modal` : 0.50 → 0.45 (modals gardent leur séparation)

Screenshots before/after à déposer dans `docs/screenshots/sprint-8d3-liquid-glass-max/`.
