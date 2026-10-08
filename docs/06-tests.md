# 06 — Tests

La stratégie est décidée dans l'[ADR 0006](adr/0006-strategie-qualite.md). Cette page explique comment l'appliquer au quotidien.

## 1. La pyramide

| Niveau       | Outil                            | Fichiers                       | Volume actuel              | Durée  |
| ------------ | -------------------------------- | ------------------------------ | -------------------------- | ------ |
| Unitaire     | Vitest                           | `src/lib/**/*.test.ts`         | ~130 cas                   | ~2 s   |
| Composant    | Vitest + Testing Library (jsdom) | `src/components/**/*.test.tsx` | ~10 cas                    | inclus |
| Bout en bout | Playwright (build de production) | `e2e/*.spec.ts`                | 18 scénarios × 2 appareils | ~1 min |

**Règle de placement** : on teste chaque comportement **au niveau le plus bas qui puisse le prouver**.

| Comportement                                                    | Niveau                                        |
| --------------------------------------------------------------- | --------------------------------------------- |
| « −10 % sur 12,45 € donne 1,25 € »                              | Unitaire (`promo.test.ts`)                    |
| « Un client ne voit pas les commandes d'un autre »              | Unitaire, sur le backend (`orders.test.ts`)   |
| « Le prix envoyé par le client est ignoré »                     | Unitaire, sur le backend (`checkout.test.ts`) |
| « Le récapitulatif affiche la remise et la livraison offerte »  | Composant (`order-summary.test.tsx`)          |
| « Un invité achète avec un code promo et voit sa confirmation » | E2E (`parcours-achat.spec.ts`)                |

Un E2E qui échoue doit pouvoir s'expliquer par un test unitaire manquant. Si c'est le cas, on écrit aussi ce test unitaire.

## 2. Lancer les tests

```bash
npm test                         # unitaires + composants
npm run test:watch               # en continu pendant le développement
npx vitest run src/lib/promo     # un seul fichier (filtre sur le chemin)

npm run build && npm run test:e2e        # E2E, sur le build de production
npx playwright test --project=mobile     # un seul appareil
npx playwright test e2e/comptes.spec.ts --headed   # en voyant le navigateur
npx playwright test --ui                 # mode interactif (pas à pas, traces)
npx playwright show-report               # rapport HTML du dernier run
```

Les E2E démarrent eux-mêmes `next start` sur le port 3100 et réutilisent un serveur déjà lancé en local. Ils tournent sur le **build de production**, car c'est lui qui sera servi, pré-rendu compris. **Pensez à relancer `npm run build` après une modification.**

## 3. Tests unitaires du backend

Le backend tourne tel quel sous jsdom :

- `localStorage` est fourni par jsdom et **vidé après chaque test** (`vitest.setup.ts`) ;
- `network()` est instantané quand `NODE_ENV === "test"` ;
- Web Crypto (PBKDF2) est disponible nativement dans Node 24.

Après avoir vidé le `localStorage`, appelez `resetDemo()` (ou `resetDb()`) dans un `beforeEach`. Cette fonction vide aussi le **cache mémoire** du store : sans elle, des données d'un test précédent restent en mémoire.

Ce qu'un test du backend doit couvrir, pour chaque fonction :

1. le cas nominal ;
2. **chaque** code d'erreur qu'elle peut lever ;
3. **les droits d'accès** : sans session, avec la session d'un autre client, avec un mauvais e-mail ;
4. **les effets de bord** : stock décrémenté ou restitué, session fermée, adresse par défaut réassignée…

## 4. Tests de composants

- On interroge l'interface **comme un utilisateur** : `getByRole`, `getByLabelText`, `getByText`. Jamais par classe CSS, par `data-testid` ou par structure DOM.
- On interagit avec `@testing-library/user-event` (et non `fireEvent`) : il reproduit la frappe et les clics réels.
- On prépare l'état par l'API publique (`cart.add(...)`, `setPromoCode(...)`), pas en écrivant dans `localStorage`.

## 5. Tests E2E

Écrits en français, du point de vue du client. Chaque scénario est **autonome** : il crée ses propres données, et ne dépend ni de l'ordre d'exécution ni d'un autre test. Les scénarios tournent en parallèle, chacun dans un navigateur neuf.

Utilitaires (`e2e/helpers.ts`) :

| Utilitaire          | Pourquoi                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ouvrir(page, url)` | Attend la fin de l'hydratation (`networkidle`) : sans cela, un clic trop rapide est perdu et le test devient instable |
| `euros("11,88 €")`  | `Intl` sépare les euros par une espace insécable : on accepte n'importe quelle espace                                 |

### Pièges connus et solutions

| Symptôme                                                  | Cause                                                      | Solution                                                                               |
| --------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `getByRole("alert")` trouve deux éléments                 | Next.js insère un `role="alert"` d'annonce de route        | Filtrer : `getByRole("alert").filter({ hasText: "…" })`                                |
| Un texte est trouvé plusieurs fois                        | Un même texte figure dans le récapitulatif et dans l'étape | Restreindre la recherche : `page.getByRole("listitem").filter(...)`, `{ exact: true }` |
| Lire la valeur associée à un intitulé (`<dt>` / `<dd>`)   | Le sélecteur CSS `+ dd` est fragile                        | `locator("xpath=following-sibling::dd[1]")`                                            |
| Tester un statut qui dépend du temps                      | Attendre 10 min réelles est impossible                     | `page.clock.install()` puis `page.clock.fastForward("05:00")`                          |
| Le scénario voit les commandes du compte de démonstration | La base est pré-remplie (seed)                             | Créer un compte ou un e-mail unique par test, et filtrer les résultats par cet e-mail  |
| Un test passe en local et échoue en CI                    | Ancien build local, serveur réutilisé                      | `npm run build`, puis arrêter tout `next start` encore lancé sur le port 3100          |

## 6. Règles d'équipe

- **Tout bug corrigé arrive avec un test qui le reproduit**, écrit **avant** la correction (il doit échouer, puis passer).
- **Un test instable (flaky) n'est jamais relancé en boucle jusqu'au vert** : on ouvre une issue et on corrige la cause. `retries: 1` en CI n'est qu'un filet ; un test qui a eu besoin d'une deuxième tentative apparaît comme « flaky » dans le rapport.
- `test.only` est refusé en CI (`forbidOnly`).
- On ne vise pas un pourcentage de couverture. On vise **les règles métier et les droits d'accès couverts à 100 %**, et chaque parcours critique couvert de bout en bout.

## 7. Couverture actuelle par parcours

| Parcours                     | Unitaires                                                      | E2E                                                              |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| Catalogue, recherche, épuisé | `products.test.ts`                                             | `parcours-achat` : recherche, produit épuisé                     |
| Panier, persistance          | `cart-state.test.ts`, `quick-add.test.tsx`                     | `parcours-achat` : rechargement                                  |
| Promo et totaux              | `promo.test.ts`, `order-summary.test.tsx`                      | `parcours-achat` : achat invité avec code                        |
| Paiement, 3-D Secure, refus  | `card.test.ts`, `checkout.test.ts`                             | `parcours-achat` : refus, 3-D Secure, client connecté en express |
| Comptes, mot de passe        | `auth.test.ts`, `account.test.ts`, `return-to.test.ts`         | `comptes` (3 scénarios), `espace-client` (4)                     |
| Suivi, annulation, invité    | `order-status.test.ts`, `orders.test.ts`, `last-order.test.ts` | `suivi-commandes` (4 scénarios)                                  |
