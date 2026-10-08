# 0003 — Panier : store externe, `useSyncExternalStore` et localStorage

- **Statut** : acceptée
- **Date** : 2026-10-08

## Contexte

Le panier est lu par des composants éloignés dans l'arbre (compteur du header, boutons d'ajout de chaque carte, page panier, récapitulatif, formulaire de commande). Il doit survivre à un rechargement, rester cohérent entre plusieurs onglets ouverts et respecter le stock. Les pages étant pré-rendues ([0001](0001-nextjs-app-router-statique.md)), le panier n'existe pas côté serveur : le rendu initial doit être identique au HTML statique pour éviter les erreurs d'hydratation.

## Décision

Le panier est découpé en deux couches :

1. **`src/lib/cart-state.ts` : la logique métier, en fonctions pures** (`addItem`, `setItemQuantity`, `summarize`, `shippingCost`…). Pas de React ni de navigateur : chaque règle (plafond au stock, seuil de livraison offerte…) est testée unitairement.
2. **`src/lib/cart.ts` : un petit store externe** qui persiste dans `localStorage`, écoute l'événement `storage` (synchronisation entre onglets) et s'expose aux composants via **`useSyncExternalStore`**. Côté serveur, le snapshot est un panier vide, ce qui garantit une hydratation sans écart.

Les composants n'appellent que `useCart()` (lecture) et `cart.add/setQuantity/remove/clear` (écriture).

## Alternatives envisagées

- **Context React + `useState`** : il faudrait un provider autour de l'application (donc rendre le layout client), et la synchronisation entre onglets serait à réécrire. Chaque mise à jour re-rend tout l'arbre sous le provider.
- **Redux / Zustand** : solides, mais une dépendance et des concepts en plus pour un état de quelques lignes. `useSyncExternalStore` est la primitive sur laquelle ces bibliothèques s'appuient elles-mêmes.
- **Panier côté serveur (cookie + base)** : nécessaire à terme pour un panier multi-appareils, mais demande une base de données, hors périmètre ([0005](0005-perimetre-demo.md)).

## Conséquences

- ✅ Aucune dépendance, aucun provider, hydratation sûre, synchronisation entre onglets gratuite.
- ✅ Logique métier testée isolément ; c'est en l'isolant qu'un bug de frais de port a été trouvé et corrigé (PR #13).
- ⚠️ Le panier est propre à un navigateur : il ne suit pas l'utilisateur d'un appareil à l'autre.
- ⚠️ Les prix et le stock sont relus depuis le catalogue à chaque calcul, et non stockés dans le panier : un changement de prix s'applique immédiatement, ce qui est le comportement voulu. En revanche, **rien ne revalide le stock côté serveur** au moment de la commande (voir #8).
