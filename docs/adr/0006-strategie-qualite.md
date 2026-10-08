# 0006 — Stratégie qualité : conventions, tests et CI

- **Statut** : acceptée
- **Date** : 2026-10-08

## Contexte

Sans règles partagées, la qualité dépend de la vigilance de chacun : formatage hétérogène, relectures qui portent sur la forme, régressions découvertes en production. Le coût d'un bug augmente à chaque étape où il survit (poste du développeur → PR → `main` → production). On veut donc des vérifications au plus tôt, et automatiques.

## Décision

Trois filets de sécurité, du plus rapide au plus complet :

1. **Sur le poste, avant chaque commit** (Husky) : ESLint et Prettier sur les fichiers modifiés (lint-staged), format Conventional Commits (commitlint).
2. **Sur chaque PR** (GitHub Actions, jobs parallèles) : formatage, lint, typage, tests unitaires, build, tests E2E, messages de commit. `main` est protégée : on n'y fusionne qu'avec une PR dont la CI est au vert.
3. **Pyramide de tests** :
   - beaucoup de **tests unitaires** (Vitest) sur la logique métier pure (`src/lib/`) : rapides, précis ;
   - quelques **tests de composants** (Testing Library) sur les interactions clés, écrits comme un utilisateur (rôles et libellés accessibles) ;
   - peu de **tests E2E** (Playwright) sur le parcours d'achat, contre le build de production, desktop et mobile.

Règles associées : tout bug corrigé arrive avec le test qui le reproduit ; les PR sont fusionnées par merge commit pour garder des commits atomiques (et des hashes stables pour `.git-blame-ignore-revs`) ; Dependabot propose chaque semaine les mises à jour, regroupées.

## Alternatives envisagées

- **Uniquement des tests E2E** : couvrent tout, mais lents, plus fragiles, et un échec indique mal la cause.
- **Pas de hooks locaux, CI seule** : retour plus lent, et des commits de correction de formatage qui polluent l'historique.
- **Fusion en squash** : historique de `main` plus court, mais perte du détail (refactoring et correction séparés) et hashes réécrits.

## Conséquences

- ✅ Une régression sur le panier ou le parcours d'achat est bloquée avant d'atteindre `main`.
- ✅ Les relectures portent sur le fond : la forme est vérifiée par les outils.
- ✅ Les problèmes « ça marche sur ma machine » sont détectés : la CI part d'un checkout propre. C'est ainsi qu'elle a révélé que les types de routes Next n'étaient pas générés (PR #12).
- ⚠️ Temps de CI d'environ 2 minutes par PR, et les tests sont du code à maintenir.
- ⚠️ Un développeur seul ne peut pas approuver sa propre PR sur GitHub : la protection impose la CI, pas une approbation. Dès qu'un second développeur rejoint le projet, on exige une relecture approuvée (`CODEOWNERS` est déjà en place).
