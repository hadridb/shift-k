# V1 (Phasma PowerShell) — Reference de portage

> Carte de correspondance pour porter chaque concept de la V1 PowerShell vers la V2 TypeScript.

---

## Emplacement V1

`E:\000 My Razer Blade\Documents\Phasma\000 Phasma Missions\_PHASMA_SYSTEM\`

Statut : **gelee**. Voir `_FROZEN_V1.md` dans ce dossier. **NE PAS** modifier.
Servir uniquement comme reference de comportement attendu.

---

## Fichiers V1 a porter

| V1 (PowerShell)          | V2 (TypeScript)                       | Notes                                                                 |
| ------------------------ | ------------------------------------- | --------------------------------------------------------------------- |
| `config.json`            | `src/core/config/schema.ts` + store   | Schema Zod, migrations versionnees, electron-store                    |
| `Phasma-Core.ps1`        | `src/core/router/resolver.ts` + helpers | Helpers eclates par responsabilite                                  |
| `Phasma-Watcher.ps1`     | `src/core/watcher/watcher.ts`         | chokidar + retry-move + debounce                                      |
| `Phasma-Scan.ps1`        | `src/core/scanner/scanner.ts`         | Re-balayage manuel Downloads                                          |
| `Phasma-NewProject.ps1`  | `src/core/projects/scaffolder.ts`     | Template engine, slug-safe folder names                               |
| `Phasma-Switch.ps1`      | UI : remplace par overlay click + IPC | Plus de script CLI                                                    |
| `Phasma-SwitchSlot.ps1`  | UI : hotkey -> IPC -> store update    |                                                                       |
| `Phasma-Status.ps1`      | UI : badge dans overlay               |                                                                       |
| `Phasma-Pause.ps1`       | UI : bouton overlay + hotkey          |                                                                       |
| `Phasma-OpenFolders.ps1` | UI : `OpenFolders.tsx` dialog         |                                                                       |
| `Phasma-EditSlots.ps1`   | UI : `EditSlots.tsx` dialog           |                                                                       |
| `Phasma-DailyFolders.ps1`| Lazy via `Get-PhasmaDailyPath`        | Garde le mode lazy ; pas de cron                                      |
| `Phasma-Launch.ps1`      | UI : remplace par `OpenFolders.tsx`   |                                                                       |
| `Phasma-Install.ps1`     | Installer Electron (NSIS / DMG)       | Plus de tache planifiee, app au login via `setLoginItemSettings`      |
| `Phasma-Hotkeys.ahk`     | `src/main/shortcuts.ts`               | Electron globalShortcut                                               |
| `Phasma-Overlay.ps1`     | `src/renderer/overlay/OverlayApp.tsx` | WPF -> React, BrowserWindow frameless transparent alwaysOnTop         |

---

## Concepts cles a preserver

### Active client (slot system)

Un seul client est "actif" a un instant T. Tout fichier route va vers ce client. Switch via :
- Click sur un slot dans l'overlay
- Hotkey Ctrl+Alt+1..9 (mappe aux 9 slots configurables)

Les slots sont un mapping `1..9 -> clientFolderName | null`.

### Active stage

Stage par defaut ou le watcher pose les nouveaux fichiers. Cyclable.
Valeurs : `src`, `img`, `out`, `ost`, `liv`.

### Daily folder (lazy)

Format par defaut : `J{yyyy-MM-dd}`. **Cree uniquement quand un fichier y arrive**, jamais en avance. Pas de cron du matin.

### Platform pattern matching

Pour chaque plateforme (runway, kling, luma, higgsfield, sora, veo, midjourney, krea, topaz, photoshop, premiere) une liste de substrings. Si filename matche `*<substring>*`, la plateforme est identifiee.

Patterns de la V1 a porter tels quels (voir `config.json` V1).

### Group by platform (optionnel, off par defaut)

Si `groupByPlatform: false` (defaut) : fichier va dans `J<date>/`.
Si `true` : fichier va dans `J<date>/<platform>/`.

### Ignore extensions

`.drp`, `.dra` : fichiers DaVinci jamais routes (l'utilisateur les gere a la main).

### Project extensions

`.psd`, `.ai`, `.prproj`, `.aep` : project files, vont toujours dans `01_SRC Inits/J<date>/`, peu importe l'active stage.

### Stages renommables

L'utilisateur peut renommer ses 5 stages dans Settings. Les **cles** (src/img/out/ost/liv) sont stables ; seul le **label** (nom du dossier) change.

### Routing pause

Flag global `routingEnabled`. Quand `false`, le watcher tourne toujours mais Resolve-Destination retourne null. Aucun fichier deplace.

---

## Edge cases observes en V1 et a couvrir en V2

1. **Fichier deja ouvert** au moment du move : retry avec backoff (jusqu'a 10x, 500ms entre essais), tester ouverture exclusive avant move
2. **Collision de noms** : suffixe `_v02`, `_v03`... auto-incremente
3. **Watcher catch-up au boot** : si fichiers matchant sont deja dans Downloads avant le start, ils sont traites en sequence (mais skip si pas d'active client)
4. **Active client cleared** : si `activeClient` est null, watcher ignore tout
5. **Tache planifiee creant le sous-dossier J<date> matinal** : SUPPRIMEE. Mode lazy uniquement.
6. **Casse Windows insensible** : Windows considere `03_OUTPUTS` et `03_Outputs` comme le meme dossier (a savoir lors de rename)

---

## Tests d'acceptance Phase Alpha

Au sortir de Phase Alpha, ces scenarios doivent fonctionner sans rien faire d'autre que d'installer Shift-K et l'utiliser :

1. **Routage de base** : telecharger `Gen-4_demo.mp4` -> doit atterrir dans `<active client>\03_Outputs\J<today>\Gen-4_demo.mp4`
2. **Switch slot via hotkey** : Ctrl+Alt+2 -> active client change vers le slot 2
3. **Switch slot via overlay** : click sur le slot 3 dans l'overlay -> active client change vers slot 3
4. **Pause** : Ctrl+Alt+Space ou click bouton pause -> badge PAUSED apparait, prochain download ne bouge pas
5. **Resume** : meme action -> routing reprend
6. **Rescan** : forcer le balayage de Downloads, fichiers matching deja presents sont deplaces
7. **Nouveau projet** : creer "Gucci - Holiday 27" via `+`, dossier scaffolde depuis template
8. **Edit slots** : ouvrir Settings -> Slots, affecter Gucci au slot 4, valider
9. **Open folders** : Ctrl+Alt+F, cocher 02_IMG + 03_Outputs, ouvrir -> 2 fenetres Explorer / Finder
10. **Lazy J<date>** : ne pas bosser pendant 3 jours, redemarrer, verifier qu'aucun J<date> vide n'a ete cree

---

## Composants UI a recreer (parite design V1)

- **Overlay** : width 290px, fond `#0A0A0A`, border-radius 14px, shadow soft, sections separees par dividers `#191919` 1px
- **Slots** : trait vertical blanc 2x14px a gauche pour le slot actif, hover bg `#161616`, text inactive `#9A9A9A`, text active `#FFFFFF`
- **Buttons icon** : transparent par defaut, hover bg `#161616`, foreground `#666666` -> `#FFFFFF`
- **Tooltips** : sur tous les boutons icone
- **Drag-to-move** : sur la zone header uniquement

Voir les commits V1 pour les details exacts de palette + spacing.
