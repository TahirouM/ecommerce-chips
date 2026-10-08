# Décisions d'architecture (ADR)

Un ADR (_Architecture Decision Record_) consigne **une** décision structurante : le contexte, ce qui a été décidé, les alternatives écartées et les conséquences assumées. On ne modifie pas un ADR accepté : si la décision change, on en écrit un nouveau qui le remplace.

| N°                                         | Décision                                                     | Statut                |
| ------------------------------------------ | ------------------------------------------------------------ | --------------------- |
| [0001](0001-nextjs-app-router-statique.md) | Next.js App Router, pages pré-rendues                        | Acceptée              |
| [0002](0002-prix-en-centimes.md)           | Prix manipulés en centimes entiers                           | Acceptée              |
| [0003](0003-etat-du-panier.md)             | Panier : store externe, `useSyncExternalStore`, localStorage | Acceptée              |
| [0004](0004-visuels-svg.md)                | Visuels produits dessinés en SVG                             | Acceptée              |
| [0005](0005-perimetre-demo.md)             | Périmètre démo : catalogue dans le code, pas de paiement     | Acceptée (provisoire) |
| [0006](0006-strategie-qualite.md)          | Stratégie qualité : conventions, tests, CI                   | Acceptée              |

Nouvel ADR : copier [`modele.md`](modele.md), prendre le numéro suivant, l'ajouter à ce tableau, et le faire relire dans la même PR que le code concerné.
