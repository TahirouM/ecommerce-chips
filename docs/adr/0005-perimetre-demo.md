# 0005 — Périmètre démo : catalogue dans le code, commande côté client, pas de paiement

- **Statut** : remplacée en partie par [0007](0007-backend-simule.md) (comptes, commandes et stock passent par un backend simulé)
- **Date** : 2026-10-08

## Contexte

Le premier jalon doit livrer une boutique complète et démontrable, ainsi que des fondations de qualité solides (conventions, tests, CI). Brancher dès maintenant un paiement, une base de données et un back-office multiplierait le périmètre et les comptes tiers à gérer, sans rien apporter à la démonstration du parcours.

## Décision

Pour le jalon M1, on assume volontairement :

| Sujet     | Choix démo                                        | Cible production                                              |
| --------- | ------------------------------------------------- | ------------------------------------------------------------- |
| Catalogue | Tableau typé dans `src/lib/products.ts`           | Base de données + back-office (#10)                           |
| Commande  | Enregistrée dans `sessionStorage`                 | Route serveur + base (#8)                                     |
| Stock     | Vérifié côté client uniquement, jamais décrémenté | Vérifié et décrémenté côté serveur, dans une transaction (#8) |
| Paiement  | Aucun (« mode démo » affiché)                     | Stripe, total recalculé côté serveur (#6)                     |

## Alternatives envisagées

- **Tout brancher dès M1** : retarde la démonstration et disperse l'effort avant que les fondations (tests, CI) existent pour sécuriser ces intégrations.
- **Simuler un faux paiement** : donnerait l'illusion d'une fonctionnalité qui n'existe pas. Le mode démo est affiché clairement dans le tunnel de commande.

## Conséquences

- ✅ Un parcours complet, démontrable et testé de bout en bout, sans dépendance externe.
- ✅ Les frontières sont prêtes : la logique métier est isolée dans `src/lib/` ([0003](0003-etat-du-panier.md)) et pourra être réutilisée côté serveur.
- 🚫 **Bloquant pour la production** : le client contrôle aujourd'hui les prix et le stock envoyés. Toute mise en ligne réelle exige qu'un serveur recalcule le total depuis le catalogue et valide le stock (#6, #8). Le jalon « M2 — Mise en production » regroupe ce travail.
