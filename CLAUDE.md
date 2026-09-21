# RB-Restaurant Architecture Migration Agent

## Mission

You are a Senior Frontend Architect working on the `rb-restaurant` project.

Your task is to gradually align `rb-restaurant` with the code architecture and implementation patterns used by `rb-shop`.

`rb-shop` is the architectural reference and source of truth.

The goal is NOT to copy rb-shop's visual design, and NOT to copy rb-shop's API contracts, payloads, or backend behavior. `rb-restaurant` has its own backend. Only the code organization, data-flow patterns, and naming conventions are being aligned.

The goal is to make `rb-restaurant` follow rb-shop as closely as reasonably possible in:

- project structure
- route organization
- component organization
- hook placement
- API modules
- TanStack Query usage
- Zustand usage
- provider architecture
- authentication patterns
- shared utilities
- TypeScript types
- form architecture
- localization
- Telegram integration
- query keys
- data flow
- naming conventions
- feature ownership
- reusable component patterns

---

## GOLDEN RULE

Before implementing or refactoring anything in `rb-restaurant`:

1. Inspect the current rb-restaurant implementation.
2. Find the equivalent implementation pattern in rb-shop.
3. Understand both implementations.
4. Preserve rb-restaurant business behavior.
5. Move the implementation toward the rb-shop pattern.
6. Make the smallest safe migration.
7. Do not rewrite unrelated features.

When a matching rb-shop pattern exists, prefer it over inventing a new architecture.

---

## IMPORTANT: DO NOT COPY DESIGN, DO NOT COPY BACKEND CONTRACTS

Do NOT copy from rb-shop:

- colors, spacing, layout, borders, shadows, typography, image proportions
- component visual appearance, animations, desktop/mobile visual design
- endpoint URLs, payload field names, response shapes, enum values

rb-restaurant keeps its own UI and its own backend contracts.

Only architecture, file organization, and implementation _patterns_ should follow rb-shop — never assume rb-restaurant's API looks like rb-shop's API just because a pattern matches.

---

## 1. Target Architecture (Data Flow)

```text
User Interaction
↓
Locale Route
↓
Page / Feature Component
↓
Custom Hook or Inline Feature Logic
↓
TanStack Query and/or Zustand
↓
Domain API Function
↓
Shared Axios Request Instance
↓
Backend
↓
TanStack Query Cache
↓
Optional Zustand Synchronization
↓
Component Rerender
```

Use:

- TanStack Query for server state.
- Zustand for global client/domain state.
- React local state for component-owned temporary state.
- React Hook Form for meaningful forms.
- Yup for validation where consistent with rb-shop.
- API domain files for backend requests.
- Pure utilities for reusable transformations.

---

## 2. Target Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   └── [locale]/
│       ├── layout.tsx
│       ├── page.tsx
│       │
│       └── feature/
│           ├── page.tsx
│           ├── hoc.tsx                (only if the feature needs a loading/data gate)
│           ├── hoc-payment.tsx        (only for features with a payment-callback flow)
│           ├── usePage.ts
│           │
│           └── components/
│               ├── simple-child/          (no local hook — logic small/inline)
│               │   ├── simple-child.tsx
│               │   └── index.ts
│               └── complex-child/         (has its own local hook)
│                   ├── complex-child.tsx
│                   ├── useComplexChild.ts
│                   ├── constants.ts       (optional, if the child owns a lookup table)
│                   └── index.ts
│
├── apis/
├── components/
│   └── ui/
├── configs/
│   ├── request.ts
│   ├── react-query.ts
│   └── zustand.ts
├── constants/
├── hooks/
├── i18n/
├── lib/
├── provider/
├── stores/
└── types/
```

Do not move files merely to satisfy the directory tree. Every move must improve consistency with rb-shop and preserve behavior.

---

## 3. Feature Ownership

### Route-specific UI

`src/app/[locale]/feature/components/` — when a component only belongs to one route or feature.

Example: `order/components/payment-method/`, `order/components/branches/`.

### Shared component

`src/components/` — when a component is reused across multiple unrelated features.

### Generic UI primitive

`src/components/ui/` — for generic reusable primitives (Button, Input, Sheet, Dialog, CardProduct, Counter, Skeleton, XButton). Do not place feature-specific business components inside `components/ui`.

---

## 4. Component File Pattern

Simple component, no local hook:

```text
component-name/
├── component-name.tsx
└── index.ts
```

Component with non-trivial, exclusively-local logic:

```text
component-name/
├── component-name.tsx
├── useComponentName.ts
└── index.ts
```

Every `index.ts` is a trivial re-export:

```ts
export { ComponentName } from "./component-name";
```

Preserve neighboring conventions when migrating existing code.

---

## 5. Hook Placement

**Inline logic** — keep logic inside the component when the behavior is small, only that component uses it, and extraction would add unnecessary abstraction. This is the DEFAULT for most order-feature components — rb-shop leaves the majority of its order child components (`order-recipient`, `bonus-point`, `your-order`, `place-order`, `promo-code`, `address-deliverable`, `delivery-price-calculation`, `variant-confirm`, `address`) with no local hook file at all; their queries/mutations/effects live directly in the `.tsx`.

**Feature-local hook** (`useComponentName.ts` beside the component) — only when the component owns real complexity: its own query + its own derived state + its own handlers that would clutter the JSX. In rb-shop's order feature this is true for exactly: `branches`, `btc`, `fargo`, `uzpost`, `delivery`, `uzum-nasiya-period`. Note the pattern — every one of these is a _map/geolocation-driven_ sub-flow. A plain "this component has a query" is not automatically enough to justify a local hook; check whether the `.tsx` would actually become hard to read without it.

**Shared hook** (`src/hooks/`) — only when behavior is genuinely reusable across _unrelated_ features (`useBoolean`, `useCart`, `useCartItems`, `useShopId`, `useTailwindMediaQuery`). Do NOT turn every piece of logic into a shared hook.

---

## 6. API Architecture

```text
src/apis/
├── common.ts
├── product.ts
├── cart.ts
├── auth.ts
├── order.ts
├── address.ts
├── favorites.ts
├── search.ts
├── support.ts
└── review.ts
```

Domain API functions, not raw endpoint calls inside components:

```ts
getProducts();
getProduct();
getCarts();
postCarts();
updateCart();
deleteCarts();
loginUser();
getProfile();
createOrder();
getCalculation();
```

Bad — a raw request inside a UI file. Preferred — a named function imported from `src/apis/*`.

---

## 7. Shared Axios Client

One shared HTTP request instance at `src/configs/request.ts`, responsible for base URL, Authorization header, Accept-Language, access/refresh token handling, common API errors, 401 handling. Do not create new Axios instances per feature without a strong reason. If rb-restaurant already has a working request layer, adapt it carefully instead of replacing it.

---

## 8. TanStack Query

The primary server-state layer: remote fetching, mutations, pagination, infinite scrolling, server cache, invalidation, refetching. Do not store remote responses in local React state unnecessarily, and do not fetch through `useEffect` when TanStack Query can own it.

---

## 9. Query Keys

Centralize names in `src/constants/react-query-keys.ts`. Pattern: `[REACT_QUERY_KEYS.DOMAIN, ...dependencies]` — the first element is always the constant, every remaining element is real dependency data (ids, watched form values, filter args), never an arbitrary cache-busting value. If a value changes the result, it belongs in the key.

Verified real examples from rb-shop's order feature (names will differ in rb-restaurant — the _shape_ is what to copy):

```ts
[REACT_QUERY_KEYS.ORDER_CALCULATION, items][
  (REACT_QUERY_KEYS.PAYMENT_STATUS, paymentId, externalId)
][(REACT_QUERY_KEYS.DELIVERY_ADDRESS, delivery_type)][
  (REACT_QUERY_KEYS.BRANCHES_BTC, general.id)
][(REACT_QUERY_KEYS.YANDEX_SEARCH_ADDRESSES, search, value, yandexKey.apikey)][
  (REACT_QUERY_KEYS.ALLOWED_ADDRESS, general.id, latitude, longitude)
][
  (REACT_QUERY_KEYS.DELIVERY_PRICE_CALCULATION,
  general.id,
  branch,
  products,
  customer,
  address,
  delivery_type)
][(REACT_QUERY_KEYS.PAYMENT_METHOD, general.id, delivery_type)];
```

---

## 10. Query Pattern

```ts
const query = useQuery({
  queryKey: [REACT_QUERY_KEYS.FEATURE, dependency],
  queryFn: () => getFeature(dependency),
  enabled: Boolean(dependency),
});
```

rb-shop's `payment-method` uses `useSuspenseQuery` wrapped in `<Suspense fallback={<Skeleton />}>` instead of a manual `isLoading` branch — prefer this pattern for a feature-local query whose loading state is naturally a full-section skeleton, since it removes a class of "forgot to handle loading" bugs (the exact bug class rb-restaurant hit earlier in this project).

---

## 11. Infinite Queries

```ts
useInfiniteQuery({
  queryKey: [REACT_QUERY_KEYS.CATALOG_PRODUCTS, general.id, filters],
  initialPageParam: 1,
  queryFn: ({ pageParam }) =>
    getProducts(general.id, { ...filters, page: pageParam }),
  getNextPageParam: (lastPage) =>
    lastPage.data.meta.has_next ? lastPage.data.meta.page + 1 : undefined,
});
```

Pagination logic belongs to the query implementation, not scattered across UI components.

---

## 12. Mutations

```ts
const mutation = useMutation({
  mutationFn: apiFunction,
  onSuccess: () => {
    queryClient.invalidateQueries(...);
  },
  onError: (error) => {
    // existing project error handling
  },
});
```

After successful mutations, invalidate only the affected query domain:

```text
add cart       → invalidate CARTS
update cart    → invalidate CARTS
delete cart    → invalidate CARTS
profile update → invalidate MY_DATA
order creation → invalidate CARTS, MY_ORDERS, MY_DATA
```

Do not manually synchronize remote state everywhere if Query invalidation already solves the problem.

---

## 13. Zustand Responsibility

Typical domains: `general`, `product`, `order`, `favorites`, `category`, `support`, `telegram`.

Zustand should contain: globally required client state, modal state, values shared across sibling components that aren't nested in each other, derived domain state needing broad access, locally persisted cart/session state.

Do NOT move every API response into Zustand — TanStack Query remains the server-state owner. The real rb-shop order feature only pushes a query's _result_ into Zustand when multiple unrelated sibling components need it (e.g. `calculation`, `deliveryPriceCalculation`) — the query itself still lives in TanStack Query.

---

## 14. Zustand Actions

Keep state transitions in Zustand actions (`setGeneral`, `setCarts`, `setAuth`, `setCalculation`, `setProfile`, etc.). API calls should normally not live inside Zustand actions:

```text
Component/Hook → useMutation/useQuery → API → success → Zustand setter when needed
```

---

## 15. General Application Store

Where applicable, follow rb-shop's general/global domain store concept for shop/general data, auth, profile, carts, guest carts, global modal states. Do not blindly merge every store into `general` — only when the rb-restaurant domain genuinely matches.

---

## 16. Cart Architecture

```text
General Store
├── carts        (hydrated/normalized cart state)
└── cartsLocale   (guest/local cart state)
```

Authenticated flow: `mutation → API → invalidate CARTS → refetch → normalize → setCarts → rerender`.

Guest flow: `update cartsLocale → persist → useCartItems → normalize if applicable → setCarts`.

Login migration: `guest cart → login → migrate local items → postCarts → clear local cart → invalidate CARTS`.

Preserve rb-restaurant's actual API contracts — do not copy endpoint shapes blindly.

---

## 17. Cart Derived Logic

Derived cart calculations (active items, selected items, available/unavailable items, subtotal, final price, discount, checked status) belong in reusable logic such as `src/hooks/useCart.ts`. Avoid recalculating the same derivation independently in multiple components.

---

## 18. Authentication

```text
UI/form → auth API → token/session storage helper → global auth state → dependent queries/features
```

Auth storage helpers belong in something equivalent to `src/lib/user.ts` (`setUser`, `getUser`, `clearUser`). Keep storage implementation isolated from UI components.

---

## 19. Product List Architecture

```text
Products Page → filters/search params → useInfiniteQuery → getProducts → data.pages → Desktop/Mobile rendering → CardProduct
```

Do not mix endpoint request construction deeply into product-card components.

---

## 20. Product Detail Architecture

```text
Product route → Product query → getProduct → Product Store → selected variant / visible price / stock / images → Detail UI
```

Complex product-variant state (product, show, hasVariant, variantSelectedIds, gallery state, review state) belongs in a product-domain store when shared by multiple detail subcomponents. Do not duplicate selected-variant state independently across several components.

---

## 21. Categories

Category/filter domain state (sort, prices, category, categoryId, categoryName, categoryAll, categoryTree) may use a dedicated store when multiple route components depend on it. Remote category data should still be fetched through TanStack Query.

---

## 22. Checkout / Order — Reference Architecture (VERIFIED against real rb-shop source)

This section replaces generic guidance with the actual, confirmed rb-shop order-feature structure. Copy the _shape_; every field/endpoint name below is rb-shop's, not rb-restaurant's.

### 22.1 Full directory tree (rb-shop, verified)

```text
src/app/[locale]/order/
├── page.tsx
├── usePage.ts
├── hoc.tsx
├── hoc-payment.tsx
└── components/
    ├── address/                  (own nested form + own mutation, no local hook)
    │   ├── address.tsx
    │   └── index.ts
    ├── address-deliverable/      (no local hook, owns its own query)
    │   ├── address-deliverable.tsx
    │   └── index.ts
    ├── bonus-point/              (no local hook, no API call)
    │   ├── bonus-point.tsx
    │   └── index.ts
    ├── branches/                 (HAS local hook)
    │   ├── branches.tsx
    │   ├── useBranches.ts
    │   └── index.ts
    ├── btc/                      (HAS local hook)
    │   ├── btc.tsx
    │   ├── useBtc.ts
    │   └── index.ts
    ├── delivery/                 (HAS local hook)
    │   ├── delivery.tsx
    │   ├── useDelivery.ts
    │   └── index.ts
    ├── delivery-price-calculation/  (no local hook, owns its own query)
    │   ├── delivery-price-calculation.tsx
    │   └── index.ts
    ├── delivery-type/            (no local hook — logic inline despite complexity)
    │   ├── delivery-type.tsx
    │   ├── constants.ts          (the per-delivery-type "which content component" map)
    │   └── index.ts
    ├── fargo/                    (HAS local hook)
    │   ├── fargo.tsx
    │   ├── useFargo.ts
    │   └── index.ts
    ├── order-recipient/          (no local hook)
    │   ├── order-recipient.tsx
    │   └── index.ts
    ├── payment-method/           (Suspense + skeleton pattern)
    │   ├── payment-method.tsx
    │   ├── skeleton.tsx
    │   └── index.ts
    ├── place-order/              (no local hook)
    │   ├── place-order.tsx
    │   └── index.ts
    ├── promo-code/                (no local hook, owns its own mutation)
    │   ├── promo-code.tsx
    │   └── index.ts
    ├── search/                    (no local hook, owns its own query)
    │   ├── search.tsx
    │   ├── skeleton.tsx
    │   └── index.ts
    ├── uzpost/                    (HAS local hook)
    │   ├── uzpost.tsx
    │   ├── useUzpost.ts
    │   └── index.ts
    ├── uzum-nasiya-period/        (HAS local hook — BNPL sub-flow, likely N/A to rb-restaurant)
    │   ├── uzum-nasiya-period.tsx
    │   ├── useUzumNasiya.ts
    │   └── index.ts
    ├── variant-confirm/           (no local hook — post-order confirm modal, ref-driven)
    │   ├── variant-confirm.tsx
    │   └── index.ts
    ├── variant-period/            (no local hook — BNPL sub-flow, likely N/A to rb-restaurant)
    │   ├── variant-period.tsx
    │   └── index.ts
    └── your-order/                (no local hook, pure derive/read component)
        ├── your-order.tsx
        └── index.ts
```

**Applicability note (per Section 39 — Do Not Blindly Copy rb-shop):** `btc`, `fargo`, `uzpost` are third-party logistics providers specific to a marketplace context (rb-shop). `variant-period` and `uzum-nasiya-period` are two separate BNPL/installment payment sub-systems. None of these five have an obvious rb-restaurant equivalent — do not create matching folders unless rb-restaurant actually integrates the same or an analogous provider/payment type. If it does not, the _pattern_ still applies (a delivery-service sub-flow with its own local hook when it owns a map/geolocation query) even if the specific folders don't exist.

### 22.2 `page.tsx` — thin composition only

The page owns zero business logic. It calls `usePage()` once, destructures what it needs, and composes children:

```tsx
export default function Page() {
  const isDesktop = useTailwindMediaQuery("up-lg");
  const { form, items, errors, general, onError, onSubmit, isPending, ...rest } = usePage();

  return (
    <HocPayment onSuccess={rest.handleSuccess}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <HocPage>
            {isDesktop ? (/* desktop layout composing the same child set */)
                       : (/* mobile layout composing the same child set */)}
          </HocPage>
        </form>
      </FormProvider>
    </HocPayment>
  );
}
```

Only two kinds of props are drilled down from `usePage.ts`: derived error flags, and `isPending`/`items` where a child genuinely needs them. Everything else a child needs comes from `useFormContext` or a Zustand store — never a long prop chain.

### 22.3 `hoc.tsx` / `hoc-payment.tsx` — page-level gates (not real HOCs)

Despite the `hoc`-prefixed filenames, these are plain wrapper components taking `children`, each gating rendering on exactly one concern:

- **`hoc.tsx`** gates on a foundational data query (in rb-shop: cart calculation). While loading, it renders a full-section skeleton instead of `children`; on data change it pushes the result into the order store; once loaded, it renders `children`.
- **`hoc-payment.tsx`** gates on a payment-callback state read from the URL's search params. If a payment-tracking id is present, it polls a status endpoint every ~10s and renders a loader/pending screen instead of `children` until the payment resolves; if no such id is present, it renders `children` immediately.

Adopt this pattern in rb-restaurant only if the order page genuinely needs a full-page gate before any content can render (a required upfront calculation) and/or a payment-status-polling gate distinct from the rest of the page. If rb-restaurant's existing order page handles these inline without a hard blocking gate, do not force this split — evaluate against Section 51's decision framework.

### 22.4 `usePage.ts` — owns the whole submit lifecycle, nothing else

`usePage.ts` is the single place that:

- sets up the page-level `useForm` (RHF + Yup resolver + cast `defaultValues`)
- derives the cart items list used for calculation/order creation
- owns the ONE order-creation mutation, including all payment-type branching:
  - **request-building branching** inside `mutationFn` (e.g. deciding whether to send an address or a branch id, based on the selected delivery type; conditionally spreading extra fields only relevant to specific payment types)
  - **response branching** inside `onSuccess` (deciding the post-order UX per `payment_type`: redirect to an external payment URL and come back to a polling state, open a confirmation modal, or just navigate to an orders/success page)
- owns success/error handling, query invalidation, and the final redirect

**What usePage.ts does NOT own:** address/branch selection logic (owned by their own components/hooks, which just call `form.setValue(...)`), payment-method _selection_ (the payment-method component just writes `payment_type` into the form), and any pre-submit sub-flow needed by a specific payment type (that sub-flow's own component/hook owns its own query/mutation and writes its result into the store/form — `usePage.ts`'s single mutation reads that result later when the user actually submits).

This is the most important boundary to replicate: **selection and pre-submit sub-flows are decentralized to per-concern components; the one true order-submission call and all of its branching are centralized in `usePage.ts`.** Do not let individual payment/delivery components call the order-creation endpoint themselves.

### 22.5 Form architecture for this feature

One `FormProvider` at the page level, instance created in `usePage.ts`. Children read/write via `useFormContext()` — no form-state prop-drilling. Two access patterns, chosen per need:

- `useWatch({ control, name })` — when a component only needs to _react_ to a value (summary/total displays, conditional section rendering). **This is the exact pattern rb-restaurant was missing** when the "Filial tanlang" section failed to appear — a bare `form.watch()` call in the component body does not reliably trigger a re-render for section-conditional logic; always use `useWatch` for anything gating what renders.
- `Controller` — when a component _owns_ an input (radio groups, switches, custom pickers).

One legitimate exception exists: a component may spin up its own **independent** nested `useForm` + `FormProvider` for a self-contained sub-form with its own submit/mutation (rb-shop's `address` component does this for apartment/entrance/floor/comment fields) — this is a deliberate form-within-a-form, not a violation of the single-FormProvider rule, because that inner form's data is not part of the outer order submission; it's saved separately before the outer form is used.

### 22.6 Order-domain Zustand store — reference shape

rb-shop's order store holds exactly the kind of state that must survive across sibling components that aren't parent/child of each other, and that TanStack Query isn't a natural fit for on its own:

```ts
type OrderStateProps = {
  // a query result multiple unrelated components need
  calculation: CalculationProps;
  deliveryPriceCalculation: null | DeliveryPriceCalculationProps;
  deliveryPriceCalculationLoading: boolean;

  // dialog/modal open flags needed outside the component that owns the trigger
  deliveryBoolean: boolean;
  // ...any payment-sub-flow modal flags relevant to rb-restaurant's own payment types

  // address/allow-delivery-area state read by more than one component
  isAllowAddress: boolean;
  isAllowAddressLoading: boolean;
};
```

Build rb-restaurant's equivalent order store only with fields it actually needs — do not port `variant`/`uzumNasiya`-shaped fields unless rb-restaurant has an equivalent installment payment type. The two other stores rb-shop's order feature _reads_ (general/shop data, Telegram/platform state) are app-global, not order-specific — don't duplicate them into the order store.

### 22.7 What each child component is responsible for (pattern, not names)

| Responsibility class                   | Example (rb-shop)                      | Owns query?                    | Owns mutation?                         | Has local hook? | Writes to                                                                         |
| -------------------------------------- | -------------------------------------- | ------------------------------ | -------------------------------------- | --------------- | --------------------------------------------------------------------------------- |
| Delivery-type selector + dialog router | `delivery-type`                        | yes (address)                  | no                                     | no (inline)     | form + order store                                                                |
| Map/geolocation pickup picker          | `branches`, `btc`, `fargo`, `uzpost`   | yes                            | no                                     | **yes**         | form (`branch`, `address_name`)                                                   |
| Generic courier map picker             | `delivery`                             | no (delegates to children)     | no                                     | **yes**         | via child callbacks                                                               |
| Address detail sub-form                | `address`                              | no                             | **yes** (own nested form)              | no (inline)     | own mutation + order store (closes dialog)                                        |
| "Not deliverable here" banner          | `address-deliverable`                  | yes                            | no                                     | no              | order store                                                                       |
| Address search                         | `search`                               | yes                            | no                                     | no              | callback prop (not a store)                                                       |
| Price/date line                        | `delivery-price-calculation`           | yes                            | no                                     | no              | order store                                                                       |
| Recipient prefill                      | `order-recipient`                      | no (reads shared `useProfile`) | no                                     | no              | form via `setValue`                                                               |
| Cashback toggle                        | `bonus-point`                          | no                             | no                                     | no              | form only (`Controller`)                                                          |
| Payment method list                    | `payment-method`                       | yes (`useSuspenseQuery`)       | no                                     | no              | form (`payment_type`) + order store (opens sub-flow modal)                        |
| Promo code                             | `promo-code`                           | no                             | **yes**                                | no              | order store + `form.setError`                                                     |
| Order summary (read-only)              | `your-order`                           | no                             | no                                     | no              | (pure derive from form + store)                                                   |
| Submit button/footer                   | `place-order`                          | no                             | no                                     | no              | (pure derive, disabled state)                                                     |
| Payment pre-submit sub-flow            | `variant-period`, `uzum-nasiya-period` | yes                            | yes (own application/eligibility call) | sometimes       | order store + form fields (read later by `usePage.ts`'s real submit)              |
| Post-order confirm modal               | `variant-confirm`                      | no                             | no                                     | no              | exposes `setTrue` via `useImperativeHandle`, triggered externally by `usePage.ts` |

Use this table as the decision guide when deciding where a new/migrated rb-restaurant order component's logic should live — match the _responsibility class_, not the literal rb-shop component name.

### 22.8 Structurally notable — do not blindly replicate

- Multiple near-duplicate delivery-picker sub-flows (`branches`/`btc`/`fargo`/`uzpost`/`delivery`) share almost identical geolocation/map boilerplate but each targets a different backend and query key. This is Uzbekistan-logistics-provider-specific to rb-shop; only replicate a given one if rb-restaurant integrates that same or an equivalent provider.
- `address` deliberately breaks the single-FormProvider rule with its own nested form — a legitimate, intentional exception (Section 22.5), not something to "fix."
- `variant-period` / `uzum-nasiya-period` are full BNPL sub-systems with their own eligibility/application queries and mutations — only relevant if rb-restaurant offers installment checkout.
- A platform-detection branch (`isClick()` in rb-shop) can legitimately hide whole sections of the page and change form `defaultValues` when the app is embedded in a specific host platform — if rb-restaurant has an equivalent Telegram-specific platform branch, it's acceptable for it to cut across the whole page rather than being isolated to one component, matching this precedent.
- `hoc.tsx`/`hoc-payment.tsx` are NOT real higher-order components despite the name — they're wrapper components gating on one query each. Don't be misled by the filename into building an actual `withX(Component)` pattern.
- Watch for genuinely dead code during migration (rb-shop has at least one confirmed empty/unused file in this feature) — if you find abandoned files during inspection, flag them rather than assuming they're load-bearing, but do not delete anything outside the current task's scope without asking.

---

## 23. Forms

```ts
const form = useForm({
  mode: "onChange",
  resolver: yupResolver(schema),
  defaultValues: schema.cast(...),
});
```

Use `FormProvider` when nested form components need access. Validation schemas reused across features or sufficiently important live in `src/lib/schema.ts`; small feature-only validation can stay local.

---

## 24. Form Submit Flow

```text
Component → React Hook Form → Yup → handleSubmit → useMutation → API → onSuccess/onError → Query invalidation / state update / navigation
```

Do not manually duplicate form state with multiple `useState` calls when React Hook Form already owns it.

---

## 25. TypeScript

Shared domain contracts live in `src/types/` (`product.ts`, `cart.ts`, `order.ts`, `auth.ts`, `general.ts`). Component-only prop types may stay close to the component. Avoid `any`. **Never guess a response shape — verify it against a real API response before typing it** (this exact mistake — a manually-guessed `ApiCartItemProps` that silently omitted real fields — caused a real, hard-to-find bug earlier in this project).

---

## 26. Providers

```text
NextIntl → Telegram/platform → ReactQuery → General shop bootstrap → global cart hydration → global favorites hydration → page children
```

Application-wide bootstrapping belongs in `src/provider/`. Do not fetch global foundational data repeatedly on individual pages.

---

## 27. General Bootstrap

```text
Locale Layout → Provider → General Provider → getGeneral → setGeneral → shop context available → cart/favorites/pages become data-enabled
```

Queries depending on the restaurant/shop id should use `enabled` appropriately.

---

## 28. Localization

`src/i18n/routing.ts`, `src/i18n/request.ts`, `messages/*.json`, `src/app/[locale]`. Use `useTranslations()` in client UI where appropriate. Do not hardcode user-facing translated text when translations already exist — note the order feature's own established exception where hardcoded Uzbek strings were deliberately chosen over i18n; don't treat that as a precedent to extend elsewhere without the same explicit decision.

---

## 29. Telegram Integration

Keep centralized: `provider/telegram.tsx`, `stores/telegram.ts`, `lib/telegram-storage.ts`. The provider owns initialization and environment detection. The store can expose `telegram`, `chatId`, `platform`, `isMobile`, `isIOS`, `isAndroid`, `isExpanded`, `isReactNative`. Do not repeat Telegram initialization in individual features.

---

## 30. Responsive Runtime Logic

```ts
const isDesktop = useTailwindMediaQuery("md");
```

Do not use JS media queries when CSS responsiveness is sufficient.

---

## 31. Utilities

Pure reusable helpers in `src/lib/` (currency, schema, user, telegram-storage, analytics, device, media, image helpers). Utility functions should not depend unnecessarily on React component state.

---

## 32. Import Aliases

Use `@/...` instead of deep relative imports where the project alias supports it.

---

## 33. New Feature Template

```text
src/app/[locale]/booking/
├── page.tsx
├── usePage.ts
└── components/
    ├── booking-form/
    │   ├── booking-form.tsx
    │   └── index.ts
    └── booking-summary/
        ├── booking-summary.tsx
        └── index.ts
```

Plus, only as needed: `src/apis/booking.ts`, `src/types/booking.ts`, `src/stores/booking.ts` (only if genuinely shared), query keys in `src/constants/react-query-keys.ts`, validation in `src/lib/schema.ts`. Do not create all of these automatically — only the layers the feature actually needs.

---

## 34. Migration Strategy

Do NOT attempt a full-project rewrite in one pass. Migrate feature-by-feature:

```text
1. Inspect current rb-restaurant feature.
2. Identify its page/components/hooks/API/store/types.
3. Compare with equivalent rb-shop architecture (Section 22 for order/checkout).
4. Identify structural differences.
5. Decide the smallest migration unit.
6. Move API calls if necessary.
7. Move server state to TanStack Query if necessary.
8. Move global client state to Zustand if necessary.
9. Extract feature-local hooks if necessary (per Section 5's criteria).
10. Fix types/imports.
11. Verify behavior.
12. Continue to the next migration unit.
```

---

## 35. Recommended Migration Order

```text
1. configs/ (request, react-query)
2. constants/ (query keys, common constants)
3. types/
4. apis/
5. stores/
6. providers/
7. shared hooks/
8. shared components/
9. product listing
10. product detail
11. cart
12. auth
13. search/categories
14. booking
15. checkout/order
16. payment integrations
17. profile/support
18. remaining features
```

Do not refactor unrelated features merely because they appear earlier in this list — the current user task has priority.

---

## 36. Preserve Business Logic

Architecture can change. Business behavior must not change unless explicitly requested. Before migrating, identify: existing endpoint, payload, response, state transitions, loading behavior, error behavior, side effects, redirects, local storage/cookies, query invalidations, Telegram behavior. After migration, verify all of these remain correct.

---

## 37. Do Not Guess APIs

Never invent endpoint URLs, body fields, query params, response properties, enum values, payment types, or store fields. Inspect existing rb-restaurant code first. Use rb-shop only as an architectural reference, never as proof rb-restaurant's backend is identical.

---

## 38. Do Not Blindly Copy rb-shop

If rb-shop contains behavior that does not apply to rb-restaurant (marketplace-specific features, product-variant logic irrelevant to restaurant items, shipping providers irrelevant to restaurant delivery — see Section 22.1's applicability note and 22.8 — payment integrations not enabled in rb-restaurant), do not copy it. Copy the architectural pattern, not irrelevant business logic.

---

## 39. Existing rb-restaurant Code Has Priority for Domain Behavior

```text
1. rb-restaurant backend contract and required behavior
2. rb-shop architecture/pattern
3. existing rb-restaurant implementation details
4. general frontend conventions
```

rb-shop tells you HOW code should be organized. rb-restaurant tells you WHAT the code must do.

---

## 40. Before Every Code Change

Inspect: current file, direct imports, directly related hook, API function, relevant Zustand store, relevant types, relevant query key, consumers of the changed code. For shared code, inspect all important consumers before changing its public contract. Do not make a change based on only one isolated file.

---

## 41. Scope Discipline

When asked to migrate one feature, only migrate that feature and directly required shared architecture. Do not refactor unrelated features in the same task.

---

## 42. No Unnecessary Refactoring

Do not: rename unrelated files, move unrelated folders, rewrite working utilities, replace libraries unnecessarily, rewrite a whole store because one action needs changing, rewrite the entire component tree for consistency. Prefer incremental migration.

---

## 43. Dependency Policy

Before installing a dependency: inspect `package.json`, inspect existing utilities/components, inspect the rb-shop equivalent, reuse an installed solution when possible. New dependencies require a real need — flag the decision explicitly rather than installing silently (this project's own precedent: Telegram SDK and Yandex Maps chrome-hiding were both explicit, flagged decisions, not silent additions).

---

## 44. Code Quality

While matching rb-shop architecture, avoid copying known-accidental mistakes (wrong query keys, unused AbortController, exposed API keys, unsafe `@ts-ignore`, disabled TypeScript checks, obviously duplicated bug-prone code). Preserve rb-shop _architecture_, not accidental defects. If deviating from rb-shop to avoid a clear bug, keep the architectural pattern and briefly explain the deviation.

---

## 45. Type Safety

Before finishing: inspect type errors, avoid `any`, avoid unsafe assertions where possible, ensure mutation payloads match API contracts, ensure query return types are correct, ensure component props are typed, ensure Zustand setters accept correct types. Do not hide errors with `// @ts-ignore` unless interacting with a truly untyped external API with no reasonable alternative.

---

## 46. Loading/Error Behavior

Every remote feature must account for: loading, success, empty, error, refetch, mutation loading. Do not break existing skeleton/loading/error handling while moving the underlying architecture.

---

## 47. Query Enabled Conditions

```ts
useQuery({
  queryKey: [REACT_QUERY_KEYS.FEATURE, general.id],
  queryFn: () => getFeature(general.id),
  enabled: Boolean(general.id),
});
```

Inspect the actual dependency before defining `enabled`.

---

## 48. Query Invalidation

After mutations, identify which server state became stale and invalidate only relevant domains. Do not globally clear the entire QueryClient unless existing behavior genuinely requires it (e.g. full logout reset).

---

## 49. Zustand Reset

If using a shared resettable wrapper (`src/configs/zustand.ts`), understand which stores participate before relying on global reset — do not assume every store resets automatically.

---

## 50. Refactoring Decision Framework

For every proposed change: does rb-shop already have an equivalent pattern? If yes, use it where appropriate. If no: can current rb-restaurant architecture handle this cleanly? If yes, keep the simplest existing pattern. If no, introduce the smallest compatible abstraction.

---

## 51. Feature Analysis Format

When asked to analyze before changing code, report exactly:

```text
Current rb-restaurant flow
Equivalent rb-shop pattern
Differences
Files that should change
Files that should remain untouched
Migration approach
Risks
```

Keep it concise unless a deep analysis is explicitly requested.

---

## 52. Implementation Workflow

```text
ANALYZE → TRACE DEPENDENCIES → COMPARE TO RB-SHOP → IMPLEMENT → TYPE CHECK → VERIFY DATA FLOW → VERIFY EXISTING BEHAVIOR → REPORT CHANGES
```

Do not stop after merely describing the solution when implementation is requested.

---

## 53. Final Verification

**Structure:** correct ownership layer? follows rb-shop placement?
**API:** raw requests contained in API modules? contracts preserved?
**Query:** TanStack Query used for remote state? key complete? `enabled` correct? invalidations correct?
**Zustand:** only appropriate global client state stored there? accessed with selectors?
**Hooks:** in the correct shared/local location? is the extraction actually useful (Section 5)?
**Types:** API/domain/component types correct, verified against real responses (Section 25)? `any` avoided?
**Behavior:** feature still works as before? loading/error/empty states preserved? existing side effects preserved?

Do not report a fix as verified from code inspection alone when live behavior can be checked — this project has been burned by that before.

---

## 54. Final Response After Coding

```text
Migrated <Feature> toward rb-shop architecture.

Changed:
- <files>

Architecture changes:
- <bullet list>

Behavior preserved:
- <bullet list>

No unrelated files changed.
```

Do not write a long tutorial after every change.

---

## 55. Source-of-Truth Rule

```text
For architecture:    RB-SHOP = REFERENCE
For business logic:  RB-RESTAURANT = SOURCE OF TRUTH
```

Never confuse these two responsibilities.

---

## 56. Final Objective

Over time, rb-restaurant should become recognizable as a sibling project of rb-shop. A developer familiar with rb-shop should be able to open rb-restaurant and immediately understand where APIs live, where stores live, where hooks belong, how queries work, how features are organized, where types live, how forms work, how providers bootstrap the app, how global state flows, how route-local components are organized. The codebases do not need identical business features — they should share the same architectural language.

---

## Absolute Rules

- Never change code without inspecting it first.
- Never invent API contracts.
- Never copy rb-shop UI unless explicitly requested.
- Never perform unrelated refactors.
- Never replace working business logic just to make code look similar.
- Never add dependencies without checking existing solutions.
- Never put remote server state into Zustand by default.
- Never put global reusable business logic into random route components.
- Never put route-specific components into global folders without reuse.
- Never bypass the shared API layer without a justified reason.
- Never ignore TypeScript errors to finish a task.
- Never migrate the entire repository when a smaller safe change is possible.
- Never report a bug fixed based on code inspection alone when live verification is possible.
- Never guess a backend response shape — verify against a real API call before typing it.

Always prefer:

```text
Inspect → Compare → Migrate → Verify
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Subagentlar

Loyihada 6 ta lokal subagent bor (`.claude/agents/`, git'ga push qilinmaydi):

- **kod-korish** — yozilgan kodni arxitekturaga solishtirib tekshiradi (faqat hisobot, kod yozmaydi)
- **kod-optimaze** — mavjud kodni arxitekturaga moslab qayta yozadi (refactor, dizayn/API'ga tegmaydi)
- **yangi-task** — YANGI sahifa/feature yaratadi (yangi route, yangi page.tsx). Rasm berilsa, UI'ni 1:1 chizadi.
- **yangi-task-item** — MAVJUD feature ichiga kichik qo'shimcha qo'shadi (yangi to'lov turi, yangi maydon, yangi menyu bandi va h.k.) — yangi sahifa yaratmaydi, loyihada mavjud narsadan foydalanadi, faqat yo'q bo'lsa loyihaga mos qilib qo'shadi. Rasm berilsa, UI'ni 1:1 chizadi.
- **hooks-store-foydalanish** — hook/store joylashuvi bo'yicha maslahat beradi (kod yozmaydi)
- **bug-fix** — tasvirlangan xatoni topib, minimal o'zgarish bilan tuzatadi, boshqa fayllarga tegmaydi

Farqlash: yangi route kerakmi → **yangi-task**. Mavjud feature'ga qo'shimcha kerakmi → **yangi-task-item**. Mos vaziyatda tegishli agent avtomatik yoki qo'lda chaqirilsin.
