# Shift-K — Brand & Design System

> Source de verite visuelle. Toute valeur design (couleur, font, spacing, motion) qui apparait dans le code DOIT etre referencee ici.
> Mise a jour : 15 mai 2026.

---

## Voice

**Confident, low-noise, premium.**
On ne crie pas, on ne sur-explique pas. Quelques mots bien places valent mieux qu'un paragraphe.
On parle a un createur senior, pas a un debutant. Pas d'emojis dans les UI strings.

## Couleurs (V1 baseline)

| Token             | Hex       | Usage                                              |
| ----------------- | --------- | -------------------------------------------------- |
| `bg-primary`      | `#0A0A0A` | Fond principal (overlay, dialogues)                |
| `bg-elevated`     | `#141414` | Carte / section emergee                            |
| `bg-hover`        | `#161616` | Etat hover sur slot, button                        |
| `border-subtle`   | `#1A1A1A` | Bordure de fenetre                                 |
| `border-divider`  | `#191919` | Separateur horizontal                              |
| `text-primary`    | `#F5F5F5` | Texte principal (titres, valeurs actives)          |
| `text-secondary`  | `#9A9A9A` | Texte secondaire (labels, slots inactifs)          |
| `text-muted`      | `#666666` | Icones inactives, hint                             |
| `text-faint`      | `#4A4A4A` | Numeros slots, decoration                          |
| `text-ghost`      | `#3F3F3F` | Tres faible (label "ACTIF")                        |
| `text-empty`      | `#2A2A2A` | Placeholder pour slots vides                       |
| `accent-active`   | `#FFFFFF` | Indicateur slot actif, badge PAUSED, hover         |

Pas d'accent coloré pour l'instant. Tout est noir et blanc, on travaille la nuance par contraste.

## Typography

- **Famille principale** : Segoe UI (Windows) / SF Pro (Mac) via stack system-ui
- **Display** : Segoe UI Semibold pour titres et valeurs actives (overlay header, client name)
- **Body** : Segoe UI Regular
- **Mono** : SF Mono / Cascadia Code (pour chemins, logs, IDs)

| Token         | Size | Weight   | Usage                          |
| ------------- | ---- | -------- | ------------------------------ |
| `text-xs`     | 9px  | SemiBold | Labels "ACTIF", badges         |
| `text-sm`     | 10px | Regular  | Date, slots numero, badges     |
| `text-base`   | 11px | Regular  | Nom client dans slot           |
| `text-md`     | 12px | SemiBold | Stage badge, footer button     |
| `text-lg`     | 14px | SemiBold | Active client name             |
| `text-xl`     | 18px | SemiBold | Settings header                |

## Spacing

Echelle : 4px base.

| Token     | Value | Usage                           |
| --------- | ----- | ------------------------------- |
| `space-1` | 4px   | Spacing minimum entre icones    |
| `space-2` | 8px   | Padding inside slot row         |
| `space-3` | 12px  | Vertical separation sections    |
| `space-4` | 16px  | Header bottom margin            |
| `space-5` | 20px  | Outer padding overlay container |

## Radius

- `radius-sm` : 4px (chips, badges)
- `radius-md` : 6px (slot rows, footer buttons)
- `radius-lg` : 14px (window outer border)

## Shadow

- `shadow-overlay` : drop shadow Y+6, blur 20, opacity 50%, color black

## Motion

Pas d'animations en V1. Phase Beta : transitions de 150ms ease-out sur hover et state changes. Pas d'easings exotiques, pas de spring physics.

## Icones

Stack : Unicode symbols + Segoe MDL2 / Lucide Icons (a decider en Phase Alpha selon rendu cross-platform).
Style : line, monochrome, 1.5px stroke, 16-20px box.

## Logo

A creer en Phase Beta. Direction : monogramme `SK` ou typographique. Eviter pictogramme. Tres minimaliste, lisible en favicon 16x16.

---

## Anti-patterns visuels

- Pas de gradient
- Pas d'ombres colorees
- Pas d'animations bouncy
- Pas d'effets glassmorphism / acrylique
- Pas de bordures bleues macOS par defaut (override via stylesheet)
- Pas d'icones a 3 couleurs
