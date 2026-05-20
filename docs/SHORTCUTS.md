# Shift-K — Reference des raccourcis clavier

> Le nom du produit est un raccourci : la touche **K** au centre du transport
> J-K-L universel des NLE (Avid, Premiere, DaVinci Resolve, Final Cut), avec
> **Shift** comme modifier signature.

---

## Raccourcis globaux (actifs meme quand Shift-K n'a pas le focus)

Enregistres via `globalShortcut` Electron, ils prennent priorite sur l'OS et
les autres applications. **Sur macOS, lire `Ctrl` = `Cmd` et `Alt` = `Option`**
(Electron mappe automatiquement `CommandOrControl+Alt+...`).

| Raccourci Win/Linux | Raccourci macOS    | Action                                              |
| ------------------- | ------------------ | --------------------------------------------------- |
| **Ctrl+Shift+K**    | **Cmd+Shift+K**    | Toggle overlay (afficher / masquer)                 |
| **Ctrl+Alt+1..9**   | **Cmd+Option+1..9**| Activer directement le slot 1 a 9                   |
| **Ctrl+Alt+0**      | **Cmd+Option+0**   | Activer le slot 10 (touche 0, juste apres 9)        |
| **Ctrl+Alt+S**      | **Cmd+Option+S**   | Cycler le stage (src → img → out → ost → liv → src) |
| **Ctrl+Alt+P**      | **Cmd+Option+P**   | Pause / reprise du routage                          |

> Si un raccourci echoue a s'enregistrer (deja pris par une autre app), un
> warning apparait dans la console et le raccourci est inactif.

---

## Raccourcis overlay-focused (J-K-L NLE transport)

Actifs uniquement quand l'overlay a le focus clavier. Inspires du transport
universel des NLE : J recule, K stop, L avance. Voir [ADR-021](DECISIONS.md)
pour le raisonnement complet.

| Raccourci   | Action                                       |
| ----------- | -------------------------------------------- |
| **Shift+J** | Slot precedent (cycle les slots non-vides)   |
| **Shift+K** | Pause / reprise du routage                   |
| **Shift+L** | Slot suivant (cycle les slots non-vides)     |

Ces raccourcis sont desactives automatiquement quand un champ texte a le
focus (modals Nouveau projet, Slots, Reglages — pour ne pas casser la saisie).

---

## Interactions souris (overlay)

| Action                        | Effet                                  |
| ----------------------------- | -------------------------------------- |
| Clic gauche sur un slot       | Active ce client                       |
| Clic gauche sur la stage bar  | Cycle le stage                         |
| Drag de l'en-tete SHIFT-K     | Deplace l'overlay (position persistee) |
| Clic gauche sur tray icon     | Toggle overlay                         |
| Clic droit sur tray icon      | Menu contextuel (afficher / quitter)   |

---

## Resume strategique

Trois modes d'acces aux slots, gradues par la frequence d'usage :

1. **Acces direct** (memoriser le mapping slot→client) : Ctrl+Alt+1..9 — global
2. **Navigation J-K-L** (parcours sans memoriser) : Shift+J / Shift+L — overlay
3. **Clic souris** (decouverte ou switch occasionnel) : clic sur la slot list

Pour l'utilisateur power, le combo **Ctrl+Shift+K** (faire surgir l'overlay)
+ **Shift+J/L** (naviguer) + **Shift+K** (pause) constitue un flow JKL complet
sans souris.
