# Shift-K — Système de thèmes

Reference des 4 thèmes livrés en V1. Pour le détail architecture
(CSS vars, IPC broadcast, native effects), voir **ADR-029 + ADR-030**.

---

## Themes disponibles

| ID interne     | Label macOS    | Label Windows/Linux | Catégorie     | Native |
| -------------- | -------------- | ------------------- | ------------- | ------ |
| `obsidian`     | Obsidian       | Obsidian            | standard      | —      |
| `carbon`       | Carbon         | Carbon              | standard      | —      |
| `ivory`        | Ivory          | Ivory               | standard      | —      |
| `liquid-glass` | Liquid Glass   | Transparency        | translucent   | macOS vibrancy / CSS fallback |

`obsidian` est le défaut. Le picker grise les cards indisponibles avec
un tooltip explicatif (Liquid Glass affiche "Fallback CSS" sous la
description sur non-macOS).

---

## Rendu attendu par thème

### Obsidian (défaut, universel)
Noir profond `#0A0A0A`, texte clair, accent blanc. Aucune transparence.
Le standard luxe sombre.

### Carbon (universel)
Anthracite chaleureux `#13141A`, texte ivoire `#F4ECD8`, accent ivoire.
Lecture longue plus douce que Obsidian.

### Ivory (universel)
Crème éditorial `#FAF8F3`, texte sombre `#1A1A1A`, accent or sourd
`#A28C5B`. Mode clair haut de gamme, pour environnements lumineux.

### Liquid Glass / Transparency (translucent)
- **macOS** : vibrancy native `'hud'` via `BrowserWindow.setVibrancy()`.
  Refraction physique GPU, sampling inter-fenêtres. Le vrai Liquid Glass
  Apple.
- **Windows / Linux** : `backdrop-filter: blur(80px) saturate(200%)
  brightness(110%)` sur un `.glass-layer` dédié. Approximation CSS sans
  refraction, sans sampling inter-app. Le label devient "Transparency"
  pour gérer les attentes.

---

## Architecture rapide

1. **Définition** : `src/renderer/styles/themes.ts` exporte le registre
   `THEMES` (4 objets `Theme` avec `cssVars`), `THEME_ORDER`,
   `DEFAULT_THEME_ID`, et les helpers `getThemeLabel` /
   `getThemeDescription` / `checkAvailability`.
2. **CSS** : `src/renderer/styles/themes.css` mirrore les `cssVars` dans
   des `:root[data-theme='<id>']` blocks.
3. **Application** : `useApplyTheme(themeId)` flippe
   `<html data-theme>` et fire l'IPC `theme:apply`. Le main process
   applique la vibrancy macOS et broadcaste `theme:changed` à TOUTES
   les BrowserWindows, qui réagissent en flipant leur `data-theme`
   local.
4. **Persistance** : `preferences.theme` dans le store Zod. Configs
   legacy (`'mica'` / `'aurora'`) sont coercées à `'obsidian'` via
   `z.preprocess`.

---

## Limitations

Voir aussi `docs/THEME_LIMITS.md` et `docs/KNOWN_LIMITATIONS.md`.

- **Liquid Glass sur Windows** n'est PAS du vrai Liquid Glass Apple —
  c'est un blur CSS. Documenté dans le picker via le badge "Fallback CSS".
- **`prefers-reduced-motion`** non honoré actuellement. Pas critique
  depuis qu'Aurora est retiré (pas d'autres animations de thème).
- **Capture d'écran Liquid Glass** : Snipping Tool Windows capture
  parfois mal les fenêtres transparentes. Utiliser ShareX.

---

## Ajouter un thème

1. Ajouter l'`id` dans le union `ThemeId` (`themes.ts` + `@shared/types`).
2. Ajouter l'objet `Theme` dans `themes.ts` (avec tous les 13 tokens
   `cssVars` — le test `themes.test.ts` échouera sinon).
3. Mirrorer dans `themes.css` (`:root[data-theme='<nouveau-id>']`).
4. Ajouter à `THEME_ORDER`.
5. Mettre à jour le Zod enum dans `schema.ts > preferences.theme`.
6. Si le thème a besoin d'un effet native OS, l'ajouter dans
   `theme-applier.ts > planFor()`.

Pas besoin de toucher au picker — il itère `THEME_ORDER`
automatiquement.
