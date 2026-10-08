# CRAAK! — boutique de chips artisanales

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4.

## Démarrer

```bash
npm install
npm run dev   # http://localhost:3000
```

## Fonctionnalités

- Accueil pop : hero animé, bandeau défilant des saveurs, univers, chouchous, packs
- Catalogue avec recherche, filtre par univers et tri (prix, note, niveau de piquant)
- Pages univers et fiches produit pré-rendues (statiques), avec prix au kilo et niveau de piquant
- Sachets de chips illustrés en SVG (`src/components/chip-bag.tsx`), aucune image externe
- Ajout rapide au panier depuis les cartes produit
- Panier persistant (localStorage, synchronisé entre onglets), gestion du stock
- Tunnel de commande : coordonnées, livraison (offerte dès 35 €), confirmation

## Personnaliser

- Saveurs, univers, frais de port : `src/lib/products.ts` (prix en centimes, poids en grammes)
- Couleurs et styles « pop » (boutons, ombres) : `src/app/globals.css`

## À brancher pour la production

- Paiement (Stripe…) dans `src/components/checkout-form.tsx` — actuellement en mode démo
- Base de données / back-office pour les produits et les commandes
