# Contribuer à CRAAK!

Ce guide décrit comment le projet est organisé et comment proposer une modification. Il s'applique à tout le monde, lead compris.

## Installation

Prérequis : Node.js 24 (voir `.nvmrc`).

```bash
nvm use
npm install      # installe aussi les hooks Git (Husky)
npm run dev      # http://localhost:3000
```

## Scripts

| Commande               | Rôle                                         |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Serveur de développement                     |
| `npm run build`        | Build de production                          |
| `npm run lint`         | ESLint                                       |
| `npm run typecheck`    | Vérification TypeScript                      |
| `npm run format`       | Formate tout le code avec Prettier           |
| `npm run format:check` | Vérifie le formatage (utilisé par la CI)     |
| `npm test`             | Tests unitaires et de composants (Vitest)    |
| `npm run test:watch`   | Tests en mode surveillance                   |
| `npm run test:e2e`     | Tests E2E Playwright (après `npm run build`) |

## Workflow

`main` est protégée : **on n'y pousse jamais directement**. Toute modification passe par une Pull Request validée par la CI.

1. **Une issue d'abord.** Chaque travail part d'une issue avec un contexte et des critères d'acceptation (modèles fournis). Elle est rangée dans un jalon et étiquetée (type, priorité, taille).
2. **Une branche par issue**, créée depuis `main` à jour :

   | Préfixe  | Usage                                 |
   | -------- | ------------------------------------- |
   | `feat/`  | nouvelle fonctionnalité               |
   | `fix/`   | correction de bug                     |
   | `chore/` | outillage, dépendances, configuration |
   | `test/`  | ajout ou correction de tests          |
   | `ci/`    | intégration / déploiement continus    |
   | `docs/`  | documentation, ADR                    |

   Exemple : `feat/paiement-stripe`.

3. **Des commits petits et lisibles**, au format [Conventional Commits](https://www.conventionalcommits.org/fr/) — vérifié par commitlint à chaque commit :

   ```
   feat: ajouter le filtre par niveau de piquant

   Refs #12
   ```

   Types autorisés : `feat`, `fix`, `chore`, `test`, `ci`, `docs`, `refactor`, `style`, `perf`, `build`, `revert`.

4. **Une Pull Request** qui remplit le modèle (quoi, pourquoi, comment tester, captures) et référence l'issue (`Closes #12`).
5. **La CI doit être au vert** avant la fusion. Les PR sont fusionnées par _merge commit_ : les commits atomiques de la branche sont conservés, et leurs hashes restent valides (indispensable pour `.git-blame-ignore-revs`). Une branche à l'historique brouillon est nettoyée avant la relecture.
6. La branche est supprimée après fusion.

## Ce qui est vérifié automatiquement

- **Avant chaque commit** (Husky + lint-staged) : ESLint et Prettier sur les fichiers modifiés, format du message de commit.
- **Sur chaque PR** (GitHub Actions) : voir `.github/workflows/`.

## Tests

- La logique métier (`src/lib/`) est écrite en **fonctions pures** et testée unitairement à côté du code (`*.test.ts`).
- Les composants interactifs sont testés avec Testing Library **comme un utilisateur** : par rôle et libellé accessibles, jamais par classe CSS.
- Le **parcours d'achat** est couvert de bout en bout par Playwright (`e2e/`), sur desktop et mobile, contre le build de production. Première installation : `npx playwright install chromium`.
- **Tout bug corrigé arrive avec un test qui le reproduit** (écrit avant la correction, il doit échouer).

## Conventions de code

- TypeScript strict, pas de `any`.
- **Les prix sont toujours manipulés en centimes** (entiers), formatés uniquement à l'affichage avec `formatPrice` — voir [ADR 0002](docs/adr/0002-prix-en-centimes.md).
- Composants serveur par défaut ; `"use client"` uniquement quand il faut de l'interactivité ou le navigateur.
- La logique métier vit dans `src/lib/` sous forme de fonctions pures testables ; les composants restent fins.
- Styles : utilitaires Tailwind et tokens de `globals.css` (`bg-primary`, `shadow-pop`, `btn`…), pas de couleurs en dur dans les composants.
- Textes de l'interface en français.

## Relecture de code

Le relecteur vérifie, dans l'ordre :

1. **Le besoin** : la PR répond-elle à l'issue, sans dépasser son périmètre ?
2. **La justesse** : cas limites (panier vide, stock épuisé, quantités), erreurs gérées.
3. **Les tests** : le comportement est-il couvert ?
4. **La lisibilité** : un autre développeur comprendra-t-il ce code dans six mois ?
5. **L'accessibilité et le responsive.**

Un commentaire de relecture se justifie (« parce que… ») et distingue le bloquant de la suggestion (préfixe `nit:` pour les détails non bloquants).

## Décisions d'architecture

Toute décision structurante (nouvelle dépendance majeure, changement de modèle de données, choix d'hébergement…) fait l'objet d'un ADR dans `docs/adr/`, relu dans la même PR que le code.
