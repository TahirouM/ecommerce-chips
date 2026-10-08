# Documentation technique — CRAAK!

> Responsable : lead développeur · Dernière revue : 2026-10-08 · S'applique à : `main`

Cette documentation explique **comment le projet fonctionne, pourquoi il est construit ainsi, et comment y contribuer sans rien casser**. Elle complète le code : la règle exacte se trouve dans le code et ses tests, et ces pages donnent la carte, le contexte et les raisons des choix.

## Par où commencer ?

| Vous êtes…                                | Lisez, dans l'ordre                                                                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Nouveau sur le projet**                 | [Prise en main](01-prise-en-main.md) → [Architecture](02-architecture.md) → [Règles métier](03-regles-metier.md) → [CONTRIBUTING](../CONTRIBUTING.md)  |
| **Relecteur d'une PR**                    | [Conventions front-end](05-front-end.md) → [Tests](06-tests.md) → la checklist de relecture du [CONTRIBUTING](../CONTRIBUTING.md#relecture-de-code)    |
| **Chargé du branchement d'une vraie API** | [API du backend](04-api-backend.md) → [Sécurité](08-securite.md) → [Feuille de route](10-feuille-de-route.md) → [ADR 0007](adr/0007-backend-simule.md) |
| **En train de résoudre un incident**      | [Exploitation et dépannage](09-exploitation.md)                                                                                                        |
| **Évaluateur / jury**                     | [Architecture](02-architecture.md) → [Industrialisation](07-industrialisation.md) → [ADR](adr/README.md) → [Feuille de route](10-feuille-de-route.md)  |

## Sommaire

| Document                                                 | Contenu                                                                                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [01 — Prise en main](01-prise-en-main.md)                | Installer, lancer, faire le tour de la démo, livrer sa première PR                                  |
| [02 — Architecture](02-architecture.md)                  | Vue d'ensemble, couches, règles de dépendance, rendu, gestion de l'état, flux clés                  |
| [03 — Règles métier](03-regles-metier.md)                | Catalogue, prix, panier, livraison, promos, stock, paiement, cycle de vie d'une commande, glossaire |
| [04 — API du backend](04-api-backend.md)                 | Référence de chaque fonction, modèle de données, codes d'erreur, persistance                        |
| [05 — Conventions front-end](05-front-end.md)            | Composants serveur / client, hooks, formulaires, design system, accessibilité                       |
| [06 — Tests](06-tests.md)                                | Stratégie, outils, quoi tester où, recettes et pièges connus                                        |
| [07 — Industrialisation](07-industrialisation.md)        | Workflow Git, CI, protection de branche, Dependabot, gestion de projet                              |
| [08 — Sécurité](08-securite.md)                          | Modèle de menaces, mesures en place, limites assumées de la simulation                              |
| [09 — Exploitation et dépannage](09-exploitation.md)     | Remise à zéro, migration des données, diagnostic des échecs de CI, problèmes connus                 |
| [10 — Feuille de route et dette](10-feuille-de-route.md) | Passage en production, dette technique, backlog priorisé                                            |
| [ADR](adr/README.md)                                     | Les décisions d'architecture, leur contexte et leurs alternatives                                   |

## Le projet en 30 secondes

- **Quoi** : une boutique de chips au design « pop », avec un tunnel de vente complet (comptes, panier, codes promo, paiement par carte avec 3-D Secure, suivi et annulation des commandes).
- **Comment** : Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind 4. Les pages du catalogue sont **pré-rendues au build**. Tout ce qui dépend de l'utilisateur tourne dans des **îlots client**, qui parlent à un **backend simulé** dans le navigateur ([ADR 0007](adr/0007-backend-simule.md)).
- **Pourquoi simulé** : la démo doit fonctionner sans compte tiers, sans base de données à provisionner et sans coût. La simulation respecte pourtant le contrat d'une vraie API (appels asynchrones, erreurs typées, prix recalculés par le « serveur »). Elle se remplace donc sans toucher à l'interface.
- **Qualité** : 139 tests unitaires et de composants, 18 scénarios E2E joués sur desktop et sur mobile, CI obligatoire avant toute fusion, ADR pour chaque décision structurante.

## Faire vivre cette documentation

- **Elle vit dans le dépôt, à côté du code**, et se modifie dans la même PR que le code qu'elle décrit. Une PR qui change une règle métier, une fonction du backend ou un script met à jour la page concernée : la checklist de PR le demande.
- **Une décision structurante s'écrit en ADR**, pas dans ces pages. Ces pages décrivent l'état actuel, et les ADR expliquent comment on y est arrivé.
- **On ne copie pas le code.** On renvoie au fichier (`src/lib/promo.ts`) plutôt que de recopier une règle qui finirait par diverger.
- **Une information fausse dans la doc est un bug** : ouvrir une issue `type: bug` ou la corriger directement.
