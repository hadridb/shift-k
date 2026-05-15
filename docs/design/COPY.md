# Shift-K — UI Copy

> Toutes les strings utilisateur visibles dans l'app. Si tu vois une string hardcodee dans le code, c'est un bug, elle doit etre ici.
> Langue par defaut : francais. Anglais a venir en Phase Beta (i18n).

---

## Overlay

| Element                  | FR                                   | EN (futur)               |
| ------------------------ | ------------------------------------ | ------------------------ |
| Header logo              | `SHIFT-K`                            | `SHIFT-K`                |
| Active label             | `ACTIF`                              | `ACTIVE`                 |
| Paused badge             | `PAUSED`                             | `PAUSED`                 |
| Empty slot               | `(vide)`                             | `(empty)`                |
| No active client         | `(aucun)`                            | `(none)`                 |
| Footer Open tooltip      | `Ouvrir dossiers du client`          | `Open client folders`    |
| Footer Pause tooltip     | `Pause routing`                      | `Pause routing`          |
| Footer Rescan tooltip    | `Rescan Downloads`                   | `Rescan Downloads`       |
| Footer New tooltip       | `Nouveau projet`                     | `New project`            |
| Footer Settings tooltip  | `Reglages`                           | `Settings`               |

## Open Folders dialog

| Element              | FR                                                           |
| -------------------- | ------------------------------------------------------------ |
| Title                | `Phasma — Ouvrir`  (a renommer "Shift-K — Ouvrir")            |
| Active label         | `Active`                                                     |
| Open button          | `Ouvrir la selection`                                        |
| Cancel button        | `Annuler`                                                    |
| Today toggle         | `Ouvrir le dossier J{date} (sinon racine du stage)`           |
| Tout link            | `Tout`                                                       |
| Rien link            | `Rien`                                                       |
| Empty client error   | `Aucun client actif. Selectionne un slot d'abord.`           |

## Edit Slots dialog

| Element        | FR                                                           |
| -------------- | ------------------------------------------------------------ |
| Title          | `Shift-K — Slots clients`                                     |
| Subtitle       | `Affecte un client a chaque slot. Ctrl+Alt+1..9 = switch.`   |
| Save button    | `Enregistrer`                                                |
| Cancel button  | `Annuler`                                                    |

## New Project dialog

| Element        | FR                                                           |
| -------------- | ------------------------------------------------------------ |
| Title          | `Nouveau projet`                                             |
| Client field   | `Client`                                                     |
| Mission field  | `Mission / projet`                                           |
| Create button  | `Creer`                                                      |
| Exists toast   | `Le projet existe deja : {name}`                             |
| Success toast  | `Projet cree : {name}. Active.`                              |

## Notifications systeme

| Trigger              | FR                                                       |
| -------------------- | -------------------------------------------------------- |
| File routed          | `{filename} -> {client} / {stage}`                        |
| Slot switched        | `Slot {n} : {client}`                                    |
| Slot empty           | `Slot {n} vide. Assigne un client d'abord.`              |
| Routing paused       | `Routing PAUSED`                                         |
| Routing resumed      | `Routing RESUMED`                                        |
| Manual scan complete | `{n} fichier(s) deplace(s)`                              |

## Onboarding (Phase Beta)

A definir.

## Settings (Phase Beta)

A definir.

## Erreurs

| Code                 | FR                                                       |
| -------------------- | -------------------------------------------------------- |
| Config corrupt       | `Config corrompue. Restaure depuis backup ou reset.`     |
| Path inaccessible    | `Chemin inaccessible : {path}`                           |
| Downloads not found  | `Dossier Downloads introuvable. Configure-le dans Reglages.` |

---

## Ton

- Toujours **direct**, jamais paternaliste. "Le slot 3 est vide." pas "Oh il semblerait que le slot 3 soit malheureusement vide..."
- Pas de "veuillez". Tutoiement assume.
- Phrases courtes. Verbes a l'imperatif quand on demande une action.
- Pas d'humour. C'est un outil de prod, pas un toy.
