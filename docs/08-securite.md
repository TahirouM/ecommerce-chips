# 08 — Sécurité

> **À lire en premier** : le backend est simulé dans le navigateur. **Aucune mesure de cette page ne protège réellement les données de la démo.** Le visiteur contrôle son `localStorage` et peut tout y lire ou y modifier. Les règles ci-dessous sont appliquées **pour que le contrat de l'API soit déjà celui d'un vrai serveur** : en production, elles seront exécutées côté serveur, sans que l'interface change.

## 1. Données manipulées

| Donnée                          | Sensibilité        | Traitement actuel                                                                        | Traitement en production                                                                                                  |
| ------------------------------- | ------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Mot de passe                    | Critique           | Jamais stocké en clair : PBKDF2-SHA-256, 100 000 itérations, sel aléatoire de 128 bits   | Argon2id ou bcrypt côté serveur                                                                                           |
| Numéro de carte, CVC            | Critique           | Validés puis **oubliés** : la commande ne garde que la marque et les 4 derniers chiffres | **Ne transitent jamais par nos serveurs** : formulaire hébergé du prestataire (Stripe Elements), conformité PCI-DSS SAQ A |
| Jeton de session                | Élevée             | 192 bits aléatoires, `localStorage`                                                      | Cookie `HttpOnly`, `Secure`, `SameSite=Lax`, avec expiration                                                              |
| Jeton de réinitialisation       | Élevée             | 192 bits, usage unique, 30 min                                                           | Idem, envoyé par e-mail ; seul son hash est stocké                                                                        |
| Nom, e-mail, adresse, téléphone | Personnelle (RGPD) | Stockés localement                                                                       | Base chiffrée au repos, accès journalisés                                                                                 |

## 2. Mesures en place

| Menace                                             | Mesure                                                                                                                         | Où                                | Testé dans                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------- |
| Vol de la base, mots de passe exposés              | Hachage salé et lent                                                                                                           | `backend/crypto.ts`               | `auth.test.ts`                                                                                |
| Fuite du hash vers l'interface                     | Type `PublicUser` sans `salt` ni `passwordHash`                                                                                | `toPublicUser`                    | `auth.test.ts`                                                                                |
| Énumération des comptes                            | Même message pour un e-mail inconnu et pour un mauvais mot de passe ; même réponse à « mot de passe oublié »                   | `login`, `requestPasswordReset`   | `auth.test.ts`                                                                                |
| Énumération des commandes                          | Même erreur `not_found` pour une commande inexistante et pour une commande d'un autre client                                   | `getOrder`, `cancelOrder`         | `orders.test.ts`                                                                              |
| Rejeu d'un lien de réinitialisation                | Usage unique, expiration, invalidation à chaque nouvelle demande                                                               | `resetPassword`                   | `auth.test.ts`                                                                                |
| Session volée après un changement de mot de passe  | La réinitialisation ferme toutes les sessions du compte                                                                        | `resetPassword`                   | `auth.test.ts`                                                                                |
| Action sensible depuis une session laissée ouverte | Mot de passe redemandé pour le changer ou supprimer le compte                                                                  | `changePassword`, `deleteAccount` | `account.test.ts`                                                                             |
| Accès aux données d'un autre client (IDOR)         | L'utilisateur vient de la session, jamais d'un paramètre ; une commande n'est accessible qu'à son titulaire ou avec son e-mail | `requireUser`, `canAccess`        | `orders.test.ts`, `account.test.ts`                                                           |
| Manipulation du prix par le client                 | Le client n'envoie que des slugs et des quantités ; prix, remise et livraison sont recalculés                                  | `priceLines`, `computeTotals`     | `checkout.test.ts`                                                                            |
| Code promo forgé ou détourné                       | Revalidé côté backend sur le sous-total recalculé                                                                              | `placeOrder`                      | `checkout.test.ts`                                                                            |
| Survente                                           | Stock revérifié au paiement et à la finalisation                                                                               | `priceLines`, `finalize`          | `checkout.test.ts` (au paiement ; la revérification après 3-D Secure n'est pas encore testée) |
| Redirection ouverte après connexion                | `?retour=` limité aux chemins internes (refuse `//`, `/\`, `https:`, `javascript:`)                                            | `safeReturnTo`                    | `return-to.test.ts`                                                                           |
| Injection de HTML (XSS)                            | Aucun `dangerouslySetInnerHTML` : React échappe toutes les données affichées                                                   | Partout                           | Relecture                                                                                     |
| Dépendance vulnérable                              | Dépendances d'exécution réduites au minimum, Dependabot chaque semaine                                                         | `package.json`, `.github/`        | CI                                                                                            |
| Jeton de CI détourné                               | `permissions: contents: read`                                                                                                  | `ci.yml`                          | —                                                                                             |

## 3. Limites assumées de la simulation

Ces points sont **connus et acceptés pour une démo**. Ils sont **bloquants pour une mise en production** :

1. **Toute la base est lisible et modifiable par le visiteur** (DevTools). Un utilisateur peut se donner du stock, modifier une commande ou lire les hashes. Le stock, les commandes et les comptes doivent passer côté serveur (#8).
2. **Le jeton de session est lisible par JavaScript** : une faille XSS permettrait de le voler. En production, il ira dans un cookie `HttpOnly`.
3. **Les sessions n'expirent pas** et ne sont pas révoquées à la suppression du `localStorage` d'un autre appareil (il n'existe pas d'autre appareil).
4. **Aucune limitation du nombre de tentatives** de connexion ou de code 3-D Secure. Il faut un rate limiting côté serveur.
5. **Le lien de réinitialisation est affiché à l'écran** (`simulatedEmail`) au lieu d'être envoyé par e-mail.
6. **Le paiement est fictif** : les numéros de carte saisis sont traités par notre code. En production, ils ne doivent jamais l'être (voir §1).
7. **Aucun en-tête de sécurité HTTP** n'est configuré (CSP, HSTS, `X-Frame-Options`). Ils sont à ajouter au déploiement (#7).

## 4. RGPD

| Exigence               | État                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Droit d'accès          | L'espace client affiche toutes les données du compte                                                                                             |
| Droit de rectification | Profil et carnet d'adresses modifiables                                                                                                          |
| Droit à l'effacement   | Suppression du compte. Les commandes sont conservées pour l'obligation comptable (10 ans) mais détachées du compte.                              |
| Minimisation           | Seules les données nécessaires à la livraison sont demandées ; téléphone facultatif ; pas de date de naissance                                   |
| Traceurs               | Aucun cookie tiers, aucune mesure d'audience : pas de bandeau de consentement nécessaire aujourd'hui                                             |
| À faire en production  | Registre des traitements, politique de confidentialité, durée de conservation des comptes inactifs, sous-traitants (hébergeur, paiement, e-mail) |

## 5. Signaler une faille

Ne pas ouvrir d'issue publique. Utiliser **Security → Report a vulnerability** sur le dépôt GitHub (signalement privé).
