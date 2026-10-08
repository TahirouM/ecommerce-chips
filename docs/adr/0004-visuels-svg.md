# 0004 — Visuels produits dessinés en SVG

- **Statut** : acceptée
- **Date** : 2026-10-08

## Contexte

Le projet n'a pas de photos produit. Les images génériques d'une banque d'images ne montrent pas des chips et dépendent d'un service tiers (disponibilité, licence, performances). La charte « pop » demande des visuels colorés et cohérents entre eux.

## Décision

Chaque produit est illustré par un **sachet dessiné en SVG** (`src/components/chip-bag.tsx`), paramétré par les données du produit : couleur, emoji, nom imprimé (`short`). Le composant est un composant serveur sans état, rendu directement dans le HTML pré-rendu.

## Alternatives envisagées

- **Photos d'une banque d'images** : non représentatives, dépendance externe, poids élevé.
- **Images générées une fois et stockées** : à refaire à chaque nouvelle saveur, et chaque saveur ajoute des fichiers lourds au dépôt.

## Conséquences

- ✅ Aucune requête d'image : le visuel arrive avec le HTML, rien à charger après coup ni à optimiser.
- ✅ Ajouter une saveur ne demande que quelques lignes dans `products.ts`.
- ✅ Identité visuelle forte et homogène.
- ⚠️ Rendu différent d'une vraie photo : pour une mise en production réelle, le composant pourra servir de visuel de secours quand une photo manque.
- ⚠️ Le texte du sachet est en SVG : sa taille s'adapte à la longueur du nom, mais un nom très long reste à vérifier visuellement.
