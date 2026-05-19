# Theme system — limits techniques

Ce que le système de thèmes Shift-K **ne peut pas** faire et pourquoi.

---

## Liquid Glass sur Windows ≠ Liquid Glass natif macOS

**Constat** : sur Windows, le thème Liquid Glass est une approximation
CSS — `backdrop-filter: blur(80px) saturate(200%) brightness(110%)` sur
un layer translucide. Sur macOS, le même thème utilise la vibrancy
native d'AppKit (`setVibrancy('hud')`).

**Différence visuelle** : la vibrancy macOS inclut une **réfraction
physique** calculée par le GPU au niveau Core Animation — chromatic
aberration aux bords, distortion radiale subtile, échantillonnage
inter-fenêtres (pas seulement le desktop derrière, aussi les autres
apps qui passent sous l'overlay). Le CSS `backdrop-filter` ne fait
qu'un blur gaussien + filtres de couleur sur ce qui est visible
derrière la fenêtre transparente — pas de refraction, pas de capture
inter-app sur Windows.

**Conséquence** : le rendu Windows est *correct* mais reste "verre
opaque flouté" alors que macOS donne "verre liquide réfractant". Le
picker dans Settings affiche un badge **"Fallback CSS"** sous la card
Liquid Glass quand on tourne sur Windows pour informer l'utilisateur.

**Pas de fix prévu** : reproduire la refraction Apple en CSS demanderait
un shader WebGL custom (compositeur de couche en arrière du DOM), ce
qui sort largement du scope d'une overlay de 290×460 px.

---

## Mica sur Windows : matériau rectangulaire, pas rond

**Constat** : Mica est dessiné par DWM (Desktop Window Manager) sur
toute la surface rectangulaire de la `BrowserWindow`. Notre overlay a
des coins arrondis via CSS (`border-radius: 14px` + `overflow: hidden`
sur `.overlay-root`). Le matériau Mica reste donc visible dans les 4
coins extérieurs de la fenêtre (sous forme d'angles 90° très faibles
d'opacité).

**Workaround actuel** : `.overlay-root` clippe ses propres enfants
proprement. Les coins Mica restent visibles mais discrets — souvent
imperceptibles selon le wallpaper desktop. Acceptable tant qu'on ne
peut pas passer la BrowserWindow à un shape non-rectangulaire (Electron
ne l'expose pas sur Windows).

**Alternative** : utiliser le thème **Liquid Glass** qui produit l'effet
via CSS et bénéficie donc des coins arrondis naturellement.

---

## Aurora sur écrans haute fréquence

**Constat** : l'animation Aurora tourne à 60 s par cycle complet. Sur
un écran 240 Hz, le mouvement reste fluide mais peut paraître saccadé
si le compositeur GPU sature (cas extrême : 4K + multi-écrans + Aurora
sur 3 fenêtres simultanées).

**Pas de fix prévu** : `will-change: background-position` +
`transform: translateZ(0)` forcent déjà le compositing GPU. Si le cas
se présente en prod, ajouter `prefers-reduced-motion: reduce` pour
geler l'animation.

---

## prefers-reduced-motion non honoré

**Constat** : Aurora animate même quand Windows signale "Réduire les
animations". `prefers-reduced-motion` n'est pas câblé dans le composant.

**Statut** : à brancher dans un sprint futur si feedback utilisateur le
justifie. Pour l'instant, choisir un thème statique si gênant.
