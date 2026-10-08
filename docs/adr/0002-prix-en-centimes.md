# 0002 — Prix manipulés en centimes entiers

- **Statut** : acceptée
- **Date** : 2026-10-08

## Contexte

Les nombres à virgule flottante JavaScript ne représentent pas exactement les décimales : `0.1 + 0.2 === 0.30000000000000004`. Sur un panier, ces écarts s'accumulent (quantités, sous-total, frais de port) et produisent des totaux faux au centime près, ou des comparaisons de seuil incorrectes (« livraison offerte dès 35 € »).

## Décision

- Tous les montants sont des **entiers en centimes** : `price: 249` pour 2,49 €. Cela vaut pour les prix, les prix barrés, les frais de port et le seuil de gratuité.
- Les calculs (sous-total, total, prix au kilo) se font en centimes. On arrondit explicitement (`Math.round`) quand une division intervient.
- La conversion en euros n'a lieu **qu'à l'affichage**, dans une seule fonction : `formatPrice()` (`Intl.NumberFormat` `fr-FR`).
- Un test vérifie que tous les prix du catalogue sont des entiers positifs (`products.test.ts`).

## Alternatives envisagées

- **Euros en flottants** : simple, mais faux (voir contexte).
- **Bibliothèque décimale** (`decimal.js`, `dinero.js`) : exacte, mais une dépendance de plus pour un besoin que les entiers couvrent. À reconsidérer pour du multi-devises ou de la TVA ligne à ligne.

## Conséquences

- ✅ Calculs exacts, comparaisons de seuil fiables, et c'est le format attendu par les prestataires de paiement (Stripe utilise des centimes).
- ⚠️ Discipline à tenir : un montant affiché sans passer par `formatPrice` serait 100 fois trop grand. La règle figure dans `CONTRIBUTING.md` et se vérifie en relecture.
