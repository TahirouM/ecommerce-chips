# 0007 — Backend simulé derrière une couche de services

- **Statut** : acceptée
- **Date** : 2026-10-08
- **Remplace en partie** : [0005](0005-perimetre-demo.md) (commande, stock, comptes)

## Contexte

Le jalon M3 demande un tunnel de vente complet et démontrable : comptes clients, paiement, suivi et annulation des commandes. Tout cela suppose un serveur. Or la démo doit fonctionner sans compte tiers, sans base de données à provisionner et sans coût, y compris sur un hébergement statique.

Le risque d'une simulation, c'est qu'elle « fuie » partout : des composants qui lisent `localStorage` directement, des totaux calculés n'importe où, et un passage à une vraie API qui oblige à tout réécrire.

## Décision

Un **backend simulé**, dans `src/lib/backend/`, qui se comporte comme une API distante :

- **Point d'entrée unique** (`index.ts`) : les composants n'importent que des fonctions asynchrones typées (`login`, `register`, `placeOrder`…). Aucun composant ne touche au stockage.
- **Asynchrone et lent exprès** : chaque appel attend 200 à 500 ms (`network()`). L'interface gère donc de vrais états de chargement et d'erreur, comme avec un serveur.
- **Erreurs métier typées** (`ApiError` avec un `code` et un message affichable).
- **Persistance** : un document JSON versionné dans `localStorage` (`craak-db`), et le jeton de session à part, comme le ferait un cookie. Changer la forme des données impose d'incrémenter `DB_VERSION`, ce qui remet la démo à zéro.
- **On applique les règles d'un vrai serveur** :
  - mots de passe salés et hachés (PBKDF2-SHA-256, 100 000 itérations), jamais renvoyés au client (`PublicUser`) ;
  - même message pour un e-mail inconnu et un mauvais mot de passe (pas d'énumération de comptes) ;
  - lien de réinitialisation à usage unique, qui expire au bout de 30 minutes et ferme les sessions ouvertes ;
  - redirections après connexion limitées aux chemins internes (pas de redirection ouverte) ;
  - **le total d'une commande est recalculé depuis le catalogue, et le stock revalidé** : le montant envoyé par le client n'est jamais cru.
- **Données de démonstration** : un compte `demo@craak.fr` pré-rempli, et un bouton « Réinitialiser la démo » dans le pied de page.

## Alternatives envisagées

- **Vraie API (routes Next.js + base de données hébergée)** : c'est la cible (M2, #8). Elle demande une base provisionnée, des secrets et un hébergement serveur, ce qui est disproportionné pour une démonstration, et la démo ne marcherait plus hors ligne.
- **Routes Next.js avec stockage en mémoire** : perdu à chaque redémarrage ou instance serverless, et partagé entre tous les visiteurs de la démo.
- **Bibliothèque de mock réseau (MSW)** : intercepte des requêtes HTTP réalistes, mais ajoute une couche (service worker) sans bénéfice tant que l'API réelle n'existe pas.

## Conséquences

- ✅ Tunnel complet démontrable, hors ligne, sans compte tiers ni coût.
- ✅ La migration vers une vraie API est circonscrite à `src/lib/backend/` : on y réécrit les fonctions avec des `fetch` vers des routes serveur, et les composants ne changent pas. La logique métier pure (totaux, codes promo, validation de carte) se réutilise telle quelle côté serveur.
- ✅ La logique du backend est testée unitairement comme celle d'un vrai service.
- 🚫 **Aucune sécurité réelle** : tout s'exécute dans le navigateur de l'utilisateur, qui peut modifier sa « base ». C'est acceptable pour une démo, **jamais pour la production** : la bascule passe par #8 (serveur et base de données) et #6 (paiement réel).
- ⚠️ Les données sont propres à chaque navigateur : un compte créé sur l'ordinateur n'existe pas sur le téléphone.
