# Feature Specs

> Chaque feature non-triviale ouvre une spec ici avant implementation.
> Format : `{numero}-{slug}.md`. Numero auto-incremente.
> Source : redigee en Cowork, consommee par Claude Code.

---

## Template

```markdown
# {Numero}-{Titre}

**Status :** draft | ready | implemented | deprecated
**Author :** Hadrien (design Cowork) / Claude (impl Claude Code)
**Phase :** Alpha | Beta | Gamma

## Probleme

Quel pain point cette feature resout ? Cite un cas concret.

## Solution

Approche retenue. 2-5 phrases. Pas de detail technique.

## Comportement attendu

Description user-facing. Etape par etape si interaction.

## Edge cases

- Cas X : comportement attendu
- Cas Y : comportement attendu

## UI / UX

Reference aux tokens de `docs/design/BRAND.md` et strings de `docs/design/COPY.md`.
Lien vers mockup HTML dans `docs/mockups/` si applicable.

## Tests d'acceptance

- [ ] Scenario 1 : ...
- [ ] Scenario 2 : ...

## Out of scope

Ce qu'on ne fait PAS dans cette spec.
```
