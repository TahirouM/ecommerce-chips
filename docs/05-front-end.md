# 05 — Conventions front-end

Ces conventions sont vérifiées en relecture. Celles qu'un outil peut vérifier (formatage, règles React, typage) le sont automatiquement.

## 1. Composants serveur ou client

**Serveur par défaut.** On ajoute `"use client"` seulement si le composant :

- a de l'état ou des gestionnaires d'évènements ;
- lit le navigateur (`localStorage`, `window`, horloge) ;
- utilise un hook de navigation client (`useRouter`, `useSearchParams`, `usePathname`).

Et on descend la frontière **le plus bas possible** : la fiche produit est un composant serveur qui contient trois petits îlots (`StockStatus`, `FavoriteButton`, `AddToCart`), et non une page entièrement client.

| Situation                                                 | Modèle à suivre                                                                         |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Page dont le contenu dépend de l'utilisateur              | `page.tsx` serveur (métadonnées, titre) + un composant client (`MyOrders`, `Checkout`…) |
| Composant client qui lit `useSearchParams()`              | L'envelopper dans `<Suspense fallback={…}>` dans la page (sinon le build échoue)        |
| Contenu réservé aux clients connectés                     | `<RequireAuth>{(user) => …}</RequireAuth>`                                              |
| Valeur du navigateur affichée dans un composant pré-rendu | `useSyncExternalStore` avec un `getServerSnapshot` stable                               |

## 2. Données et état

- **Lire** des données du backend :
  - si elles sont réactives et synchrones (session, favoris, stock), avec les hooks de `@/lib/backend/hooks` ;
  - sinon (commandes, détail d'une commande), avec un appel asynchrone dans un `useEffect` qui ne fait que `.then(setState)`.
- **Écrire** : appeler une fonction de `@/lib/backend` à travers `useAsyncAction().run(...)`.
- **Ne jamais** appeler `setState` de façon synchrone dans un `useEffect`. La règle `react-hooks/set-state-in-effect` le refuse. Pour une valeur dérivée du navigateur, passer par `useSyncExternalStore` (voir `order-confirmation.tsx` et `last-order.ts`).
- **Ne jamais** stocker dans l'état ce qui peut être calculé. Le total du panier se recalcule avec `summarize` et `computeTotals`. Le statut d'une commande se dérive de `useNow()` et `orderStatus()`.
- Navigation après une action : `router.push()` / `router.replace()`, jamais `window.location`.

## 3. Formulaires

Les formulaires sont **non contrôlés** : on lit `FormData` à la soumission, sans `useState` par champ. On utilise les briques de `src/components/ui/form.tsx`.

```tsx
<form action={onSubmit} noValidate className="space-y-4">
  <Field label="E-mail" name="email" type="email" autoComplete="email" required />
  <FormError>{error}</FormError>
  <SubmitButton pending={pending} pendingLabel="Connexion…">
    Se connecter
  </SubmitButton>
</form>
```

| Brique         | Garantit                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `Field`        | Un vrai `<label>` visible, la mention « (facultatif) » automatique, un style d'erreur via `aria-invalid` |
| `FormError`    | `role="alert"` : le message est lu par les lecteurs d'écran                                              |
| `FormSuccess`  | `role="status"`                                                                                          |
| `SubmitButton` | Désactivé et `aria-busy` pendant l'appel, ce qui évite la double soumission                              |

Règles :

- **Le placeholder ne remplace jamais le label.**
- `autoComplete` est renseigné (`email`, `current-password`, `new-password`, `cc-number`, `postal-code`…). Le navigateur et les gestionnaires de mots de passe en dépendent.
- La validation côté interface **réutilise les fonctions du backend** (`passwordProblem`, `addressProblem`, `validateCard`) pour donner un retour immédiat. Le backend revalide de toute façon.
- Les messages d'erreur disent **quoi faire** (« Le code postal doit comporter 5 chiffres. »), pas seulement ce qui ne va pas.

## 4. Design system

_Source : `src/app/globals.css`_

Le style « pop » repose sur des contours épais, des ombres décalées sans flou et des couleurs franches.

| Token Tailwind                                               | Usage                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `bg-background`, `bg-surface`, `bg-soft`                     | Fond de page, cartes, zones secondaires et squelettes            |
| `text-foreground`, `text-muted`, `border-foreground`         | Texte, texte secondaire, contours                                |
| `bg-primary` (jaune)                                         | Action principale                                                |
| `bg-accent` (rose), `bg-blue`, `bg-green`, `bg-orange`       | Accents, statuts                                                 |
| `text-sale` / `bg-sale`                                      | Promotions, erreurs, rupture de stock                            |
| `shadow-pop-sm`, `shadow-pop`, `shadow-pop-lg`               | Ombres décalées de 2, 4 et 8 px                                  |
| `btn`                                                        | Bouton pop : contour, ombre, enfoncement au clic, état désactivé |
| `font-display` (Bricolage Grotesque) / `font-sans` (DM Sans) | Titres / texte courant                                           |

Règles :

- **Pas de couleur en dur dans un composant** (`#ff5c8a`, `text-pink-500`). Exceptions :
  - la couleur propre à un produit ou un univers, qui vient des données (`style={{ backgroundColor: product.color }}`) ;
  - les sachets SVG.
- Un nouveau token va dans `:root` et `@theme inline`, dans la même PR que son premier usage.
- Les visuels produits viennent de `<ProductVisual>` / `<ChipBag>` ([ADR 0004](adr/0004-visuels-svg.md)). On n'ajoute pas d'image matricielle.
- Impression : la facture utilise les variantes `print:` (en-tête et navigation masqués, `print:block`).

## 5. Responsive

- **On écrit pour le mobile d'abord**, puis on élargit avec `sm:` / `md:` / `lg:`.
- **Aucun défilement horizontal à 390 px.** Dans une grille, un enfant qui contient du texte long porte `min-w-0`. Les grilles à colonnes multiples ne s'activent qu'à partir de `md:`.
- Les cibles tactiles mesurent au moins 44 px (`size-11` ou plus pour les boutons-icônes).
- Toute PR visuelle joint une capture desktop **et** une capture mobile.

## 6. Accessibilité

Objectif : WCAG 2.2 niveau AA. L'audit est suivi dans #9.

- **HTML sémantique d'abord** :
  - un `<button>` pour une action, un `<Link>` pour une navigation ;
  - un seul `<h1>` par page, des listes en `<ul>` / `<ol>` ;
  - des listes nommées (`aria-label="Mes commandes"`).
- Tout bouton-icône a un nom accessible (`aria-label="Ajouter Truffe noire aux favoris"`) et un état (`aria-pressed`).
- Les étapes du tunnel portent `aria-current="step"`. Les zones en chargement portent `aria-busy`.
- La fenêtre 3-D Secure est un `<dialog>` natif ouvert avec `showModal()` : le focus y est piégé, et `Échap` annule le paiement (`onCancel`).
- Animations : toute animation décorative est une utilité de `globals.css` (`animate-marquee`, `animate-float`) neutralisée sous `prefers-reduced-motion: reduce`. Une nouvelle animation suit le même modèle.
- **Les tests interrogent l'interface par rôle et par libellé** (voir [Tests](06-tests.md)). Un élément qu'un test ne trouve pas par son rôle est souvent inaccessible.

## 7. Nommage et style de code

| Élément                                      | Convention                                                           | Exemple                                     |
| -------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------- |
| Fichiers                                     | `kebab-case`                                                         | `order-summary.tsx`, `cart-state.ts`        |
| Composants                                   | `PascalCase`, export nommé (pas de `default` hors `page` / `layout`) | `export function OrderSummary`              |
| Hooks                                        | `useXxx`                                                             | `useAvailableStock`                         |
| Fonctions de validation                      | `xxxProblem` → `string \| null`                                      | `addressProblem`                            |
| Constantes                                   | `SCREAMING_SNAKE_CASE`                                               | `FREE_SHIPPING_THRESHOLD`                   |
| Routes                                       | En français, comme l'interface                                       | `/compte/commandes`, `/mot-de-passe-oublie` |
| Code (identifiants)                          | En anglais                                                           | `placeOrder`, `cancelledAt`                 |
| Textes, commentaires, commits, documentation | En français                                                          | —                                           |

- **Commentaires** : on explique **pourquoi**, pas quoi. On en met un en tête de chaque module et sur chaque règle non évidente (« Le seuil s'apprécie APRÈS remise »).
- Imports absolus `@/…` entre dossiers, relatifs à l'intérieur d'un même dossier.
- Pas d'export par défaut, pas d'`any`, pas de `// @ts-ignore`. Un `!` (assertion non nulle) n'est admis que lorsqu'un invariant le garantit, et cet invariant est commenté s'il n'est pas évident.
