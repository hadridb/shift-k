# Known limitations

Bugs intentionnellement non corrigés (limites OS / hors scope) avec workaround
recommandé.

---

## Capture d'écran des thèmes translucides sur Windows

**Symptôme** : avec un thème Mica ou Liquid Glass actif, le Snipping Tool
natif de Windows (Win+Shift+S) capture parfois un rectangle noir ou une
fenêtre transparente sans le matériau. Idem pour certains screenshot
captures système (PrtScr).

**Cause** : la BrowserWindow Shift-K est créée avec `transparent: true` +
`backgroundColor: '#00000000'`. Le Snipping Tool ne sait pas toujours
composer correctement les fenêtres translucides avec leur matériau OS
(Mica est dessiné par DWM en dehors du framebuffer applicatif).

**Workaround** :
- **ShareX** (gratuit, open-source) capture correctement les fenêtres Mica.
- **Sharex Region capture** ou **Window capture** fonctionne, **Active window**
  est moins fiable.
- Sinon, capture plein écran + crop manuel.

**Statut** : non-bloquant. Décision documentée dans ADR-029 : le rendu en
production prime sur les outils de capture.

---

## prefers-reduced-motion non honoré

**Symptôme** : Aurora continue d'animer même si l'utilisateur a activé
"Réduire les animations" dans Settings Windows.

**Cause** : `prefers-reduced-motion` n'est pas honoré par framer-motion par
défaut, et Windows 10/11 ne signale pas systématiquement la préférence.

**Workaround** : choisir un autre thème (Obsidian, Carbon, Ivory) si les
animations gênent.

**Statut** : prévu pour un sprint ultérieur si feedback utilisateur le
justifie. Voir ADR-025.

---

## Slots / Mica + DWM acceleration désactivée

**Symptôme** : sur certaines machines avec carte graphique antique ou pilote
DWM ancien, le matériau Mica peut ne pas rendre malgré Windows 11 22H2+.

**Cause** : `setBackgroundMaterial` repose sur DWM qui peut rejeter
silencieusement l'effet sur du hardware non-compatible.

**Workaround** : utiliser le thème **Liquid Glass** qui produit un effet
similaire via CSS backdrop-filter (rendu un peu différent mais fonctionne
partout).

**Statut** : limitation OS, hors de notre contrôle.
