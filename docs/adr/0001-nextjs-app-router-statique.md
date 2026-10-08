# 0001 — Next.js App Router, pages pré-rendues

- **Statut** : acceptée
- **Date** : 2026-10-08

## Contexte

Une boutique en ligne vit de son référencement et de sa vitesse d'affichage : une fiche produit lente ou mal indexée, c'est une vente perdue. Le catalogue change peu (quelques saveurs par saison) et ne dépend pas de l'utilisateur. Seuls le panier et la commande sont propres à chaque visiteur.

## Décision

- **Next.js 16 avec l'App Router**, en TypeScript strict.
- Les pages catalogue, univers et fiches produit sont **pré-rendues au build** (`generateStaticParams`) : HTML statique servi depuis un CDN, sans calcul à la requête.
- **Composants serveur par défaut**. `"use client"` est réservé aux îlots interactifs : panier, ajout au panier, filtres, formulaire de commande. Le JavaScript envoyé au navigateur reste minimal.
- `cacheComponents` est activé pour profiter du pré-rendu partiel quand des données dynamiques arriveront (voir [0005](0005-perimetre-demo.md)).
- Tailwind CSS 4 avec des **tokens de design** dans `globals.css` (`--primary`, `shadow-pop`, utilitaire `btn`…) : la charte « pop » est définie en un seul endroit.

## Alternatives envisagées

- **SPA React (Vite)** : pas de HTML pré-rendu, donc un référencement et un premier affichage moins bons pour un e-commerce.
- **Rendu serveur à chaque requête** : coût et latence inutiles pour un catalogue qui ne change qu'au déploiement.
- **Solution e-commerce clé en main (Shopify…)** : plus rapide à lancer, mais le projet doit démontrer la maîtrise de l'architecture front, et la charte graphique serait contrainte par le thème.

## Conséquences

- ✅ Pages produit instantanées et indexables, hébergement simple (CDN).
- ✅ Frontière nette entre le statique (catalogue) et l'interactif (panier).
- ⚠️ Toute modification du catalogue demande un nouveau build. Acceptable tant que le catalogue est dans le code ; à revoir avec une base de données (revalidation à la demande).
- ⚠️ Next 16 diffère de ce que beaucoup de développeurs connaissent (types `PageProps` générés, `cacheComponents`) : la documentation embarquée dans `node_modules/next/dist/docs/` fait référence (voir `AGENTS.md`).
