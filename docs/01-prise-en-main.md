# 01 — Prise en main

Objectif : en une demi-journée, avoir le projet qui tourne, comprendre son organisation et ouvrir une première PR.

## 1. Installer

Prérequis : **Node.js 24** (fixé par `.nvmrc` et `engines` dans `package.json`), npm, Git, et `gh` (GitHub CLI) recommandé.

```bash
git clone https://github.com/TahirouM/ecommerce-chips.git
cd ecommerce-chips
nvm use                        # Node 24
npm install                    # installe aussi les hooks Git (Husky, via "prepare")
npx playwright install chromium   # une seule fois, pour les tests E2E
npm run dev                    # http://localhost:3000
```

Aucune variable d'environnement, aucune base de données, aucun service tiers : le projet fonctionne hors ligne une fois les dépendances installées.

Si votre éditeur le permet, activez « formater à l'enregistrement » avec Prettier et l'intégration ESLint : les hooks Git le feront de toute façon au commit.

## 2. Vérifier que tout est vert

Avant de toucher au code, lancez la même chose que la CI :

```bash
npm run format:check && npm run lint && npm run typecheck && npm test
npm run build && npm run test:e2e
```

Si l'une de ces commandes échoue sur `main` à jour, ce n'est pas normal : voir [Exploitation et dépannage](09-exploitation.md), puis le signaler.

## 3. Faire le tour de la démo (15 min)

C'est le meilleur moyen de comprendre le domaine avant de lire le code.

1. **Visiteur** : parcourez le catalogue, filtrez, ajoutez des favoris (♡) et des produits au panier. « Poulet rôti » est épuisé, et « Habanero extrême » n'a que 6 unités en stock.
2. **Achat invité** : dans le panier, saisissez le code `BIENVENUE10`, puis passez commande en invité avec la carte `4242 4242 4242 4242` (date future, CVC `123`).
3. **3-D Secure** : refaites un achat avec `4000 0027 6000 3184`. Essayez d'abord un mauvais code, puis `123456`.
4. **Compte** : connectez-vous avec `demo@craak.fr` / `chips2026`. Le compte contient 2 adresses, 3 favoris et 3 commandes, dont une annulée.
5. **Suivi** : ouvrez une commande récente. Son statut avance tout seul (préparation à 2 min, expédition à 5 min, livraison à 10 min). Annulez-en une avant l'expédition et vérifiez que le stock remonte.
6. **Rattachement** : passez une commande en invité avec un nouvel e-mail, puis créez un compte avec ce même e-mail. La commande apparaît dans l'historique.
7. **Remise à zéro** : le lien « Réinitialiser la démo » en pied de page efface tout.

Toutes les données vivent dans le `localStorage` de votre navigateur. Pour les inspecter : DevTools → Application → Local Storage, clé `craak-db`.

## 4. Lire le code dans le bon ordre

| Étape | Fichier                                                        | Ce que vous y apprenez                                             |
| ----- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1     | `src/lib/products.ts`                                          | Le catalogue, les prix en centimes, les frais de port              |
| 2     | `src/lib/cart-state.ts` et son test                            | La logique pure du panier et le calcul des totaux                  |
| 3     | `src/lib/backend/index.ts`                                     | La surface de l'API : tout ce que l'interface a le droit d'appeler |
| 4     | `src/lib/backend/checkout.ts`                                  | Le cœur métier : comment une commande est validée et enregistrée   |
| 5     | `src/components/checkout/checkout.tsx` puis `payment-step.tsx` | Comment l'interface orchestre le tunnel                            |
| 6     | `e2e/parcours-achat.spec.ts`                                   | Le comportement attendu, décrit du point de vue du client          |
| 7     | [docs/adr/](adr/README.md)                                     | Pourquoi c'est construit ainsi                                     |

## 5. Arborescence

```
.
├── src/
│   ├── app/                 Routes (App Router). Une page = un fichier page.tsx, mince.
│   ├── components/          Interface. Serveur par défaut, "use client" pour les îlots.
│   │   ├── account/         Connexion, inscription, espace client
│   │   ├── checkout/        Tunnel de commande et paiement
│   │   ├── orders/          Historique, détail, suivi, statut
│   │   └── ui/              Briques de formulaire partagées
│   └── lib/                 Logique métier et données, sans JSX
│       └── backend/         Backend simulé (seul point d'accès aux données)
├── e2e/                     Tests Playwright
├── docs/                    Cette documentation et les ADR
├── .github/                 CI, modèles d'issue et de PR, Dependabot, CODEOWNERS
└── (configs)                eslint, prettier, commitlint, lint-staged, vitest, playwright, next
```

## 6. Livrer sa première PR

Le processus complet est dans [CONTRIBUTING.md](../CONTRIBUTING.md). En résumé :

```bash
git switch main && git pull
git switch -c fix/libelle-bouton-panier       # préfixe = type de changement
# … code + test …
git commit -m "fix: corriger le libellé du bouton du panier

Refs #42"
git push -u origin HEAD
gh pr create --fill                            # puis compléter le modèle de PR
```

Bons premiers sujets : une issue étiquetée `taille: S`, ou un point de l'audit d'accessibilité (#9).

## 7. À qui demander ?

- Questions sur le code ou une décision : commentez l'issue ou la PR concernée. Les échanges restent ainsi traçables.
- Le propriétaire de chaque zone est déclaré dans `.github/CODEOWNERS`.
