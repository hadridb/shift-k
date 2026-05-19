# Marketing assets — Shift-K

Guide de production des assets visuels qui servent à la landing page,
ProductHunt, posts X, et démos client.

## Recording setup

- **Tool** : OBS Studio (gratuit) ou ScreenStudio (Mac, payant).
  ShareX sur Windows si capture statique.
- **Résolution cible** : 1920×1080 minimum. 2560×1440 ou 3840×2160 si
  l'écran le permet (réduction au montage donne un rendu propre).
- **Framerate** : 60 fps obligatoire — toutes les animations Shift-K
  sont tunées pour ce framerate.
- **Bitrate** : ≥ 10 Mbps pour éviter les artefacts de compression
  sur le noir profond (l'onboarding révèle vite la pixelisation).

## Sequences à capturer

### 1. Splash (1.2 s — réutilisable partout)

Lancer l'app proprement. Le splash apparaît centré, fade-in / underline /
fade-out auto. Capturer du clic launch au moment où l'overlay apparaît.

**Usage** : intro de toute démo, premier frame de la landing.

### 2. Cinematic onboarding (7 écrans, ~90 s avec pauses)

Forcer une nouvelle session : `npm run dev:onboarding` (force le replay).

Capturer en continu sans toucher autre chose, en respectant ces pauses :
- Écran 1 (Welcome) : 4 s — laisser le wordmark underline finir + tagline
- Écran 2 (Downloads) : 6 s — voir les particules sortir du folder en boucle
- Écran 3 (Projects) : 5 s — voir la tree se construire ligne par ligne
- Écran 4 (FirstProject) : taper "Gucci" + "Holiday 26" en 8 s — montrer le slot mock pulser
- Écran 5 (Shortcuts) : 6 s — voir les 3 chords s'illuminer en cascade
- Écran 6 (Extension) : 4 s — voir les 3 lignes converger
- Écran 7 (Ready) : 4 s — voir le particle burst, cliquer "Lancer Shift-K"

**Usage** : Hero video landing page, démo onboarding ProductHunt.

### 3. Theme picker (~20 s)

Ouvrir Settings → APPARENCE. Switcher les 4 thèmes dans l'ordre :
Obsidian → Carbon → Ivory → Liquid Glass/Transparency. Chaque switch
~3 s pour laisser le user voir le rendu se propager à la fenêtre Settings.

**Usage** : démo design system, post X "thèmes" thread.

### 4. Routing in action (10 s × 3 plateformes)

Drag un fichier Suno (audio) → toast bottom-right fade-in "1 fichier audio
envoyé vers 04_OST". Idem Runway (vidéo) et Midjourney (image).

**Usage** : démo core feature, landing "comment ça marche".

## Image statiques (PNG export)

### Hero overlay

Capture de l'overlay 290×460 sur fond luxe (wallpaper sombre minimaliste).
Slot 1 actif, stage OST sélectionné, badge "PAUSED" caché. Format 290×460
PNG transparent + PNG fond intégré.

### Theme grid

Settings → APPARENCE plein écran avec les 4 cards visibles. Format 16:9
pour landing.

## Limites OS connues à éviter

- **Snipping Tool Windows** capture parfois mal les fenêtres Mica /
  Transparency (rendu noir). Workaround : ShareX, OBS, ou export PNG
  depuis devtools (clic droit sur élément → "Capture node screenshot").
- **Fluidité** : si l'enregistrement saccade, désactiver temporairement
  les programmes en arrière-plan (Slack, Spotify…) qui consomment du
  GPU.

## Ne pas mettre dans le marketing

- Pas de mention "Beta" ou "Alpha" — Shift-K est livré comme produit
  fini, même en V1.
- Pas de logos d'éditeurs IA dans les screenshots sans accord (Runway,
  Higgsfield, etc.) — risque légal.
- Pas de noms de vrais clients (Gucci, Bvlgari, etc.) — utiliser des
  placeholders type "Maison Lorenzo" / "Holiday 26".
