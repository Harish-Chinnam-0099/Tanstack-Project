# App Issues & Crash Analysis

---

## Summary Table

| # | Location | Risk | Severity |
|---|---|---|---|
| 1 | Entire app | No Error Boundaries | 🔴 Critical |
| 2 | `RecipesTable.tsx` | `mealType.join()` on null/undefined | 🔴 Critical |
| 3 | `authStore.ts` | Auth store resets on page refresh | 🟠 High |
| 4 | `api/recipes.ts` | Client-side filters broke pagination totals | 🟠 High — **Fixed** |
| 5 | `config/env.ts` | No `.env` variable validation | 🟠 High |
| 6 | `routes/_protected.tsx` | Auth check via `useEffect` causes flash | 🟠 High |
| 7 | `recipesupdate/$id.tsx` | `NaN` recipe ID on invalid URL param | 🟡 Medium |
| 8 | `pagination.tsx` | Shows "Page 1 / 0" during initial load | 🟡 Medium |
| 9 | `RecipesTable.tsx` | Optimistic delete breaks on unexpected cache shape | 🟡 Medium |
| 10 | `api/auth.ts` | Unreachable dead code after `throw` | 🔵 Low |
| 11 | `routes/__root.tsx` | `lang="ar"` on English content | 🔵 Low |
| 12 | `add.tsx`, `$id.tsx` | `alert()` blocking dialogs | 🔵 Low |

---

## Detailed Breakdown

---

### 🔴 Issue #1 — No React Error Boundaries

**File:** Entire application (no Error Boundary exists anywhere)

**Situation that causes the crash:**
Any unhandled JavaScript error thrown inside a React component during render, in a lifecycle method, or in an event handler will propagate up the component tree. Since there is no `ErrorBoundary` component wrapping any route, the React root itself crashes and the entire screen goes white — a blank page with no message, no fallback UI, and no way for the user to recover except manually refreshing the browser.

**Example triggers:**
- `mealType.join()` is called on a `null` value from the API (see Issue #2)
- An API response returns an unexpected shape (e.g. `data.name.trim()` where `name` is `null`)
- A third-party library throws during initialization

**What the user sees:**
Complete white/blank screen. No error message. No navigation. The app is completely dead until a hard refresh.

**How to resolve:**
Create an `ErrorBoundary` class component and wrap the router `<Outlet />` in `_protected.tsx` and the root in `__root.tsx`:

```tsx
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-destructive">Something went wrong</h2>
          <p className="text-muted-foreground mt-2">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

Then wrap `<Outlet />` in `_protected.tsx`:
```tsx
<main className="p-6 flex-1">
  <ErrorBoundary>
    <Outlet />
  </ErrorBoundary>
</main>
```

---

### 🔴 Issue #2 — `mealType.join()` Crash on Null

**File:** `src/components/RecipesTable.tsx`

**The exact crash line:**
```tsx
cell: (info) => info.row.original.mealType.join(", "),
```

**Situation that causes the crash:**
DummyJSON returns some recipe entries where the `mealType` field is `null`, `undefined`, or simply absent. When React Table tries to render that cell, JavaScript throws:

```
TypeError: Cannot read properties of null (reading 'join')
```

This error propagates up, and because there is no Error Boundary (Issue #1), the entire app goes blank.

**What the user sees:**
White screen the moment a recipe without a valid `mealType` array appears in the table — which can happen on any page, with any filter combination.

**How to resolve:**
Guard the `.join()` call with a nullish fallback:

```tsx
cell: (info) => (info.row.original.mealType ?? []).join(", "),
```

Or more explicitly:
```tsx
cell: (info) => {
  const types = info.row.original.mealType;
  return Array.isArray(types) ? types.join(", ") : "—";
},
```

---

### 🟠 Issue #3 — Auth Store Resets on Page Refresh

**File:** `src/store/authStore.ts`

**Situation that causes the crash:**
`authStore` is an in-memory TanStack Store. It initialises with:
```ts
{ user: null, token: null, isAuthenticated: false }
```
When the user refreshes the page, the JavaScript runtime resets and the store goes back to these defaults — even though the token is still safely stored in `localStorage`.

**What breaks:**
- `authStore.state.isAuthenticated` is `false` after refresh even if the user is logged in
- `authStore.state.user` is `null` — any component that reads the user's name, email, or role from the store will display nothing or crash with `Cannot read properties of null`
- The `_protected.tsx` works fine because it reads directly from `localStorage`, but the store is out of sync for the entire session until the user logs out and back in

**What the user sees:**
User info in the header/sidebar shows blank or wrong data. Any component that gates UI on `isAuthenticated` from the store shows the wrong state.

**How to resolve:**
Rehydrate the store from `localStorage` on app startup. Add a `rehydrateAuth` function and call it once in `__root.tsx`:

```ts
// authStore.ts
export const rehydrateAuth = () => {
  const token = localStorage.getItem("token");
  if (token) {
    authStore.setState(() => ({
      user: null,      // user profile can be fetched separately
      token,
      isAuthenticated: true,
    }));
  }
};
```

```tsx
// __root.tsx — inside RootDocument or a top-level useEffect
import { rehydrateAuth } from "#/store/authStore";
rehydrateAuth(); // call once at module level or in an effect
```

---

### 🟠 Issue #4 — Client-Side Filters Broke Pagination Totals ✅ Fixed

**File:** `src/api/recipes.ts`

**Was the situation:**
When cuisine or difficulty filters were applied, only the current page of results (e.g. 5 recipes) was fetched from the API. The client-side filter then ran on just those 5 recipes, leaving 1–2 visible. However, `total` was still taken from the API's unfiltered count (e.g. 50), making the pagination show "Page 1 / 10" even though only 1–2 filtered results existed.

**What the user saw:**
Clicking "Next" on a filtered table would show completely different, unfiltered recipes. The page count was wrong. The filtering appeared broken.

**Resolution applied:**
When cuisine or difficulty filter params are present, the API now sends `limit=0` to DummyJSON to fetch **all** records at once, applies the client-side filter on the complete dataset, reads `total` from `recipes.length` (post-filter), and then slices the result for the current page using `recipes.slice(skip, skip + limit)`. This makes both the results and the pagination accurate.

---

### 🟠 Issue #5 — No `.env` Variable Validation

**File:** `src/config/env.ts`

**The problematic code:**
```ts
export const ENV = {
  RECIPES_URL: import.meta.env.VITE_RECIPES_URL as string,
};
```

**Situation that causes the crash:**
If the `.env` file is missing, not created during deployment, or the variable name is mistyped (e.g. `VITE_RECIPE_URL` instead of `VITE_RECIPES_URL`), then `ENV.RECIPES_URL` is `undefined`. The TypeScript `as string` cast hides this from the compiler at build time.

At runtime, every `fetch()` call becomes:
```
fetch("undefined/recipes?limit=5&skip=0")
```
This is an invalid URL and `fetch` throws a `TypeError: Failed to fetch`. React Query catches these errors but every single data-fetching call silently fails. The entire app renders empty with no meaningful error.

**What the user sees:**
The app loads but every data fetch fails silently. The table is empty, forms cannot save, and login fails — with no error message explaining why.

**How to resolve:**
Validate environment variables at startup and throw early with a clear message:

```ts
// config/env.ts
const RECIPES_URL = import.meta.env.VITE_RECIPES_URL;

if (!RECIPES_URL) {
  throw new Error(
    "[Config] VITE_RECIPES_URL is not defined. " +
    "Create a .env file with VITE_RECIPES_URL=https://dummyjson.com"
  );
}

export const ENV = { RECIPES_URL };
```

This crashes at startup with a readable message instead of silently failing at every API call.

---

### 🟠 Issue #6 — Auth Check via `useEffect` Causes Flash of Protected Content

**File:** `src/routes/_protected.tsx`

**The problematic code:**
```tsx
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) navigate({ to: "/" });
}, []);
```

**Situation that causes the crash:**
`useEffect` runs **after** the first render. This means every time an unauthenticated user visits a protected route like `/recipes`, the following happens in order:
1. The protected layout renders (SidebarProvider, Sidebar, header, Outlet all mount)
2. The `Outlet` (e.g. `RecipesTable`) also renders and starts fetching data
3. **Then** `useEffect` fires, detects no token, and redirects

This is a security flash — protected content is briefly visible and API calls are fired unnecessarily. More critically, if `RecipesTable` throws during that brief first render (e.g. Issue #2), the redirect never happens.

**How to resolve:**
Use TanStack Router's `beforeLoad` with `throw redirect()` which runs **before** any component renders — this is the pattern already written in the commented-out code in the same file:

```tsx
export const Route = createFileRoute("/_protected")({
  beforeLoad: () => {
    if (typeof window === "undefined") return; // SSR guard
    const token = localStorage.getItem("token");
    if (!token) throw redirect({ to: "/" });
  },
  component: ProtectedLayout,
});
```

This completely prevents the component from mounting if the user is unauthenticated.

---

### 🟡 Issue #7 — `NaN` Recipe ID on Invalid URL Param

**File:** `src/routes/_protected/recipesupdate/$id.tsx`

**The problematic code:**
```tsx
const { id } = Route.useParams();
const recipeId = Number(id);  // Number("abc") === NaN
```

**Situation:**
If a user manually types `/recipesupdate/abc` or `/recipesupdate/undefined` in the browser, `Number("abc")` returns `NaN`. The query `getRecipe(NaN)` calls `/recipes/NaN` on DummyJSON which returns a 404. The `isError` check catches this and shows "Failed to load recipe" — so it does not white-screen. However, `NaN` is a valid JavaScript value so it bypasses any TypeScript checks, and if the error boundary is absent and something down the render tree calls a method on `data` before `isError` is checked, it can crash.

**How to resolve:**
Validate the ID before using it:

```tsx
const recipeId = Number(id);
if (isNaN(recipeId) || recipeId <= 0) {
  return <p>Invalid recipe ID.</p>;
}
```

---

### 🟡 Issue #8 — Pagination Shows "Page 1 / 0" on Initial Load

**File:** `src/components/pagination.tsx`

**Situation:**
While `useQuery` is in its loading state, `data` is `undefined`. In `RecipesTable`:
```tsx
const totalPages = Math.ceil((data?.total ?? 0) / limit); // → 0
```
`totalPages` is `0`. Pagination then renders `Page 1 / 0` and disables all navigation buttons because `page >= totalPages` evaluates to `1 >= 0 → true`.

**What the user sees:**
A broken pagination bar for ~200–500ms on every page load and every filter change. The buttons all appear greyed out briefly before data arrives.

**How to resolve:**
Either hide the pagination during loading, or clamp `totalPages` to at least 1:

```tsx
// Option A — hide while loading
{!isFetching && <Pagination totalPages={totalPages} />}

// Option B — clamp
const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / limit));
```

---

### 🟡 Issue #9 — Optimistic Delete Breaks on Unexpected Cache Shape

**File:** `src/components/RecipesTable.tsx`

**The problematic code:**
```tsx
queryClient.setQueriesData(
  { queryKey: ["recipes"] },
  (old: any) =>
    old ? { ...old, data: old.data.filter((r: Recipe) => r.id !== id) } : old
);
```

**Situation:**
The `old` cache value is cast as `any`. If any other part of the app stores something under the `["recipes"]` query key with a different shape (e.g. a single recipe object `{ id, name }` instead of `{ data: Recipe[] }`), then `old.data.filter` throws:

```
TypeError: old.data.filter is not a function
```

Because `old.data` would be `undefined` or a non-array. The `onError` rollback runs but the UI may already be in a broken state.

**How to resolve:**
Guard the filter call with an array check:

```tsx
queryClient.setQueriesData(
  { queryKey: ["recipes"] },
  (old: any) => {
    if (!old || !Array.isArray(old.data)) return old;
    return { ...old, data: old.data.filter((r: Recipe) => r.id !== id) };
  }
);
```

---

### 🔵 Issue #10 — Unreachable Dead Code in `auth.ts`

**File:** `src/api/auth.ts`

**The problematic code:**
```ts
if (!res.ok) {
  throw new Error(result.message);
  console.log(ENV.RECIPES_URL); // ← never executes
}
```

**Situation:**
`console.log` after a `throw` statement is unreachable. It never runs. This is harmless but indicates the developer was debugging and forgot to clean up. Additionally, if the DummyJSON error response does not include a `message` field, `result.message` is `undefined` and the error becomes `Error: undefined` — a meaningless message shown to the user.

**How to resolve:**
Remove the dead `console.log` and add a fallback message:

```ts
if (!res.ok) {
  throw new Error(result.message ?? "Login failed. Please try again.");
}
```

---

### 🔵 Issue #11 — `lang="ar"` on English Content

**File:** `src/routes/__root.tsx`

**The problematic code:**
```tsx
<html lang="ar" dir="ltr">
```

**Situation:**
`lang="ar"` declares the page language as Arabic. The content is entirely in English. This causes:
- Screen readers to pronounce text using Arabic phonetics
- Browser spell-check to flag all English text as misspelled
- Search engines to index the page as Arabic content
- Some browsers to offer Arabic translation for an already-English page

**How to resolve:**
```tsx
<html lang="en" dir="ltr">
```

---

### 🔵 Issue #12 — `alert()` Blocking Dialogs

**Files:** `src/routes/_protected/recipesupdate/add.tsx`, `src/routes/_protected/recipesupdate/$id.tsx`

**The problematic code:**
```ts
alert("Recipe added successfully ✅");
alert("Recipe updated successfully ✅");
alert("Update in Dummy json is not possible");
alert("Failed to add recipe");
```

**Situation:**
Native `alert()` is a synchronous blocking call. It freezes the entire browser tab — no scrolling, no clicking, no JS execution — until the user dismisses it. On mobile, it looks like a system crash dialog. It cannot be styled, positioned, or auto-dismissed. It is not accessible and breaks keyboard navigation.

**How to resolve:**
Replace with a toast notification library such as `sonner` (lightweight, works with shadcn):

```bash
npm install sonner
```

```tsx
// __root.tsx — add once
import { Toaster } from "sonner";
<Toaster position="top-right" />

// In add.tsx / $id.tsx
import { toast } from "sonner";
toast.success("Recipe added successfully");
toast.error("Failed to add recipe");
```

---

## Crash Deep-Dive — How, When, and Why Each Issue Breaks

> This section explains exactly what sequence of events leads to each crash, when in the app's lifecycle it happens, and what JavaScript is actually doing internally when it fails.

---

### Crash A — `mealType.join()` White Screen

**How it crashes:**

When React Table renders each row, it calls the `cell` function you defined for the "Meal Type" column:
```tsx
cell: (info) => info.row.original.mealType.join(", ")
```
JavaScript executes `info.row.original.mealType` — this gives back the value from the API. If that value is `null`, JavaScript then tries to call `.join()` on `null`. `null` has no methods. JavaScript throws:
```
TypeError: Cannot read properties of null (reading 'join')
```
This error is thrown **inside React's render cycle** — not in an async function, not in a promise — directly during rendering. React sees the error, walks up the component tree looking for an Error Boundary to hand the error off to. It finds none. React has no choice: it **unmounts the entire tree** and renders nothing. The DOM goes blank.

**When it crashes:**

Exactly when the API response arrives and React Table tries to render the rows for the first time. The loading spinner shows, data loads, and then — white screen. It can also crash when filters change and new data comes in, or when the user navigates to a different page in the table.

**Why it crashes at that specific moment:**

Because `useQuery`'s `queryFn` runs asynchronously. During the loading phase, `data` is `undefined` and the table renders with zero rows (the "No results found" empty state) — so `mealType.join()` is never called yet. The crash fires only when `data` is populated and React Table begins iterating the actual rows.

**How to resolve:**
```tsx
cell: (info) => (info.row.original.mealType ?? []).join(", "),
```

---

### Crash B — `localStorage` SecurityError White Screen

**How it crashes:**

In `_protected.tsx`:
```js
const token = localStorage.getItem("token");
```
And in `authStore.ts`:
```js
localStorage.setItem("token", data.accessToken);
localStorage.removeItem("token");
```
In most environments, these calls are harmless. But `localStorage` is a browser API that can be **restricted by browser policy**. When it is restricted, these calls do not return `undefined` — they throw a `SecurityError`:
```
SecurityError: Failed to read the 'localStorage' property from 'Window':
Access is denied for this document.
```
This error is thrown during component rendering (in the `useEffect` in `_protected.tsx`) or during the `onSuccess` callback in `LoginForm`. There is no `try/catch` anywhere around these calls. The thrown `SecurityError` propagates up, React catches it at the root, finds no Error Boundary, and blanks the screen.

**When it crashes:**

During login (`authStore.setItem` throws) or when a protected route loads (`localStorage.getItem` throws in the `useEffect`).

**Why it crashes in those environments:**

Firefox's "Strict Mode" privacy setting, Safari's "Prevent cross-site tracking" setting with certain configurations, and some corporate proxy setups actively block `localStorage`. The browser treats accessing it as a security violation. This is by design on the browser's part — but your code has no defense against it.

**How to resolve:**
```ts
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
```
Wrap every `localStorage` call in a `try/catch`.

---

### Crash C — Auth `useEffect` — Render Before Redirect

**How it crashes:**

This is not a hard crash by itself, but it creates the conditions for one. The sequence:

1. User visits `/recipes` without a token (e.g. pasted the URL)
2. TanStack Router mounts `_protected.tsx` → `ProtectedLayout` renders
3. `ProtectedLayout` returns JSX → `SidebarProvider`, `Sidebar`, `Outlet` all mount
4. `Outlet` mounts `RecipesPage` → `RecipesTable` renders
5. `RecipesTable` calls `useQuery` → fetch fires
6. **Now** the `useEffect` runs — detects no token — calls `navigate({ to: "/" })`

Between steps 2 and 6, the protected content is alive. If `RecipesTable` throws during that render window (say, Issue A fires because stale cached data with a null `mealType` is in the React Query cache), the error propagates **before** the redirect in step 6. The redirect never happens. The screen goes white.

**When it crashes:**

In the window between the component mounting and `useEffect` running (~1 frame). In practice this is milliseconds, but it is a real race condition.

**Why the `useEffect` approach is the wrong tool here:**

`useEffect` is designed to run **side effects after render**. Navigation is a side effect. So React correctly waits until after the DOM is painted to run it. The right tool is `beforeLoad` in TanStack Router, which runs synchronously before the component tree is built at all — making the render window zero milliseconds.

**How to resolve:**
```tsx
export const Route = createFileRoute("/_protected")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) throw redirect({ to: "/" });
  },
  component: ProtectedLayout,
});
```

---

### Crash D — Missing `.env` Silent API Failure

**How it crashes:**

```ts
export const ENV = {
  RECIPES_URL: import.meta.env.VITE_RECIPES_URL as string,
};
```
`import.meta.env.VITE_RECIPES_URL` is `undefined` when the variable is not set. TypeScript's `as string` is a **compile-time lie** — it tells TypeScript "trust me, this is a string," but TypeScript does not verify this at runtime. At runtime, `ENV.RECIPES_URL` is `undefined`.

Every fetch call then does:
```js
fetch(`${undefined}/recipes?limit=5&skip=0`)
// → fetch("undefined/recipes?limit=5&skip=0")
```
JavaScript converts `undefined` to the string `"undefined"` during template literal interpolation. `fetch` receives the URL `"undefined/recipes?..."`. This is not a valid absolute URL (no protocol, no hostname). `fetch` throws `TypeError: Failed to fetch`.

**When it crashes:**

Not on app startup visually — the app renders its shell (header, sidebar, layout) fine because those components don't call `fetch`. The crash happens when `useQuery` fires the first data fetch, approximately 0–200ms after the page loads. The table never fills. Login fails. The user sees an empty app with no error message.

**Why there is no visible error:**

`useQuery` catches the thrown `TypeError` internally and sets `isError = true`. But `RecipesTable` only shows `"Updating..."` during fetching — it has no `isError` display branch. The table just stays empty. The user has no idea why.

**How to resolve:**

Validate at module load time so the app crashes loudly and immediately with a useful message:
```ts
const RECIPES_URL = import.meta.env.VITE_RECIPES_URL;
if (!RECIPES_URL) {
  throw new Error("[Config] VITE_RECIPES_URL is not set. Add it to your .env file.");
}
export const ENV = { RECIPES_URL };
```

---

### Crash E — Optimistic Delete `old.data.filter` Failure

**How it crashes:**

```tsx
(old: any) =>
  old
    ? { ...old, data: old.data.filter((r: Recipe) => r.id !== id) }
    : old
```
The guard `old ?` checks if `old` is truthy. It does NOT check if `old.data` exists or is an array. If `old` is a truthy object but `old.data` is `undefined` — for example, if a different `useQuery` stored something under the `["recipes"]` key without a `data` array — then `old.data.filter` throws:
```
TypeError: Cannot read properties of undefined (reading 'filter')
```
This error is thrown inside the `onMutate` callback. React Query catches it and calls `onError`, which runs the rollback. But the rollback itself iterates `ctx.previous` — if `ctx` is `undefined` because `onMutate` threw before returning, `ctx?.previous` is `undefined`, and the `forEach` throws as well.

**When it crashes:**

When the user clicks Delete. It is intermittent — only happens if the query cache for `["recipes"]` has a non-standard shape.

**How to resolve:**
```tsx
(old: any) => {
  if (!old || !Array.isArray(old.data)) return old;
  return { ...old, data: old.data.filter((r: Recipe) => r.id !== id) };
}
```

---

### Crash F — `Number(id)` Becomes NaN on Invalid Route

**How it crashes:**

```tsx
const { id } = Route.useParams();   // id = "hello" (string from URL)
const recipeId = Number(id);        // Number("hello") = NaN
```
`Number("hello")` returns `NaN` — JavaScript's special "Not a Number" value. `NaN` is of type `number` in JavaScript, so TypeScript doesn't complain. The query fires:
```
getRecipe(NaN)
→ fetch("https://dummyjson.com/recipes/NaN")
→ 404 Not Found
```
The API returns 404. `res.ok` is false. `getRecipe` throws `Error: Not Found`. `useQuery` sets `isError = true`. The component checks `if (isError || !data) return <h3>Failed to load recipe</h3>` — so it renders an error message, not a white screen.

**When it "crashes" (broken UI):**

When a user manually types `/recipesupdate/hello`, `/recipesupdate/0`, or `/recipesupdate/undefined` in the browser address bar.

**Why it doesn't white-screen here:**

Because the `$id.tsx` component has explicit `isLoading` and `isError` guards before rendering the form. The component is defensive enough to survive this specific case. However, if an earlier version of the code accessed `data.name` without checking `isError` first, it would throw `TypeError: Cannot read properties of undefined (reading 'name')` and white-screen.

**How to resolve:**
```tsx
const recipeId = Number(id);
if (isNaN(recipeId) || recipeId <= 0) {
  return <p className="text-destructive">Invalid recipe ID: "{id}"</p>;
}
```

---

## How to Manually Crash This App — Step by Step

> These are exact reproduction steps you can run right now. Each one includes what you do, what JavaScript executes, and why the crash occurs.

---

### Manual Crash #1 — White Screen via API Response Tampering
**Target:** `mealType.join()` null crash (Issue #2 / Crash A)

**Steps:**
1. Open the app in Chrome. Log in and go to `/recipes`.
2. Open DevTools → **Network** tab.
3. Wait for a request to `dummyjson.com/recipes?limit=5&skip=0` to appear.
4. Right-click the request → **Copy** → **Copy response**.
5. Now, in the Network tab, click the `⋮` menu → **Override content** (or use the Overrides feature in the Sources panel).
6. Edit the JSON response — find any recipe entry and change:
   ```json
   "mealType": ["Dinner"]
   ```
   to:
   ```json
   "mealType": null
   ```
7. Reload the page.

**What happens:**
The app loads, `useQuery` fires, gets the tampered response, React Table loops over the rows, reaches the recipe with `mealType: null`, calls `.join()` on `null` → `TypeError` → React unmounts the entire tree → white screen.

**Why it crashes exactly there:**
The cell renderer is a plain JavaScript function. It does not check what type `mealType` is before calling `.join()`. JavaScript does not throw when you access a property on `null` — it throws when you call a **method** on it. So `info.row.original.mealType` succeeds (returns `null`), and then `null.join` throws.

---

### Manual Crash #2 — Break All API Calls by Deleting the .env File
**Target:** `ENV.RECIPES_URL` undefined (Issue #5 / Crash D)

**Steps:**
1. Stop the dev server.
2. Delete or rename `.env` to `.env.bak`.
3. Run `npm run dev` again.
4. Open the app and try to log in.

**What happens:**
The login button spins. Nothing happens. Navigate to `/recipes` (if you still have a token in localStorage). The table renders with the sidebar and header, but stays permanently empty. The console shows:
```
TypeError: Failed to fetch
    at getRecipes (recipes.ts:157)
```

**Why it crashes in this way:**
Vite reads `.env` files at build/dev-server startup and injects them into `import.meta.env`. When `.env` is absent, `VITE_RECIPES_URL` is `undefined`. The template literal `` `${ENV.RECIPES_URL}/recipes` `` produces the string `"undefined/recipes"` because JavaScript converts `undefined` to `"undefined"` in string interpolation. `fetch("undefined/recipes?...")` treats this as a relative URL with no hostname and the browser throws `TypeError: Failed to fetch`.

---

### Manual Crash #3 — Navigate to a Nonsense Recipe ID
**Target:** `Number(id)` → NaN (Issue #7 / Crash F)

**Steps:**
1. Log in and go to `/recipes`.
2. In the browser address bar, manually type:
   ```
   /recipesupdate/hello
   ```
   and press Enter.

**What happens:**
The page shows "Loading..." for a moment, then renders "Failed to load recipe."

**Why it doesn't fully white-screen:**
`Number("hello")` is `NaN`. The API call `fetch(".../recipes/NaN")` returns 404. `useQuery` sets `isError = true`. The component checks `if (isError || !data)` before rendering the form — so it safely falls back to the error message. This is actually the one place in the app that handles its own error state correctly.

**To make it white-screen anyway:**
Remove the `isError` guard on line 98 of `$id.tsx`:
```tsx
// Remove this line:
if (isError || !data) return <h3>Failed to load recipe</h3>;
```
Now when `data` is `undefined` and the form renders, `RecipeForm` will try to access `initialData.name`, `initialData.cuisine` etc. on `undefined` → `TypeError` → white screen.

---

### Manual Crash #4 — Open the App in Firefox Strict Mode (localStorage crash)
**Target:** `localStorage` SecurityError (Crash B)

**Steps:**
1. Open Firefox.
2. Go to **Settings** → **Privacy & Security** → **Enhanced Tracking Protection** → set to **Strict**.
3. Navigate to the app URL.
4. Try to log in.

**What happens:**
On some Firefox versions with strict privacy and certain domain configurations, `localStorage.setItem()` throws `SecurityError: The operation is insecure`. The login mutation's `onSuccess` calls `setAuth(data)`, which calls `localStorage.setItem(...)` — this throws, propagates up through the React event handler, and crashes the component. With no Error Boundary, the screen goes white.

**Why strict mode blocks localStorage:**
Firefox's strict tracking protection can isolate storage per-site or block it in specific contexts (embedded iframes, certain third-party contexts). This is a browser security feature, not a bug. Your code assumes `localStorage` always works — that assumption breaks in these environments.

---

### Manual Crash #5 — Trigger Optimistic Delete on Corrupted Cache
**Target:** `old.data.filter` on undefined (Issue #9 / Crash E)

**Steps:**
1. Log in and go to `/recipes`.
2. Open DevTools → **Application** tab → nothing needed here.
3. Open the **Console** tab.
4. Paste the following to corrupt the React Query cache under the `["recipes"]` key:
   ```js
   // Find the QueryClient — it's on the window via React Query devtools
   // Or use this trick with TanStack Query devtools being open
   window.__TANSTACK_QUERY_DEVTOOLS_GLOBAL_HOOK__
   ```
   A simpler approach: open the TanStack Query DevTools (bottom right panel) → find the `["recipes", {...}]` cache entry → manually edit the cache value to `{ total: 10 }` (no `data` array).
5. Click the **Delete** button on any recipe.

**What happens:**
`onMutate` fires, calls `queryClient.setQueriesData(...)`, the updater function receives `{ total: 10 }` as `old`, which is truthy — so the `old ?` guard passes — then `old.data.filter(...)` is called on `undefined` → `TypeError: Cannot read properties of undefined (reading 'filter')` → the mutation crashes.

**Why this is exploitable:**
The `(old: any)` type cast silences TypeScript. There is no runtime shape check. Any truthy value with a missing `data` property will slip past the `old ?` guard and crash at `.filter()`.

---

*Last updated: 2026-03-09*








 can i make manual crash by changing in the logic code and dont do it just tell me.                                                                                                                                                                                
● Yes, here are all the logic-level code changes that will crash the app — without touching DevTools or the browser:                                                                                                                                                                                                                                          
  ---                                                                                                                                                                            Code Change Crash #1 — Remove the null guard in old.data.filter
                                                                                                                                                                                 File: src/components/RecipesTable.tsx:86                                                                                                                                     

  Change:
  old ? { ...old, data: old.data.filter(...) } : old
  To:
  { ...old, data: old.data.filter(...) }
  What happens: When useQuery is still loading and old is undefined, this immediately throws TypeError: Cannot read properties of undefined (reading 'data') the moment any    
  delete button is clicked.

  ---
  Code Change Crash #2 — Break the queryKey shape

  File: src/lib/queryKeys.ts:4

  Change:
  recipes: (params: RecipeSearchParams) => ["recipes", params] as const,
  To:
  recipes: (params: RecipeSearchParams) => undefined as any,
  What happens: React Query requires queryKey to be an array. Passing undefined throws immediately when RecipesTable mounts: Error: queryKey must be an Array.

  ---
  Code Change Crash #3 — Access data.recipes before it exists

  File: src/components/RecipesTable.tsx:168

  Change:
  data: data?.data ?? [],
  To:
  data: data.data,
  What happens: On the first render, data is undefined (query still loading). data.data throws TypeError: Cannot read properties of undefined (reading 'data') → white screen  
  immediately on page load, before any API response even arrives.

  ---
  Code Change Crash #4 — Remove the isLoading / isError guard in the edit route

  File: src/routes/_protected/recipesupdate/$id.tsx:97-99

  Remove these two lines:
  if (isLoading) return <h3>Loading...</h3>;
  if (isError || !data) return <h3>Failed to load recipe</h3>;
  What happens: RecipeForm receives initialData={undefined}. Inside RecipeForm, when it tries to read initialData.name or initialData.cuisine to pre-fill the fields, it throws
   TypeError: Cannot read properties of undefined. White screen on every edit page load, every time.

  ---
  Code Change Crash #5 — Call .join() on mealType without the array check

  File: src/components/RecipesTable.tsx:114 (already exists as-is)

  The crash is already live in the code right now. You don't need to change anything — just find a recipe where the API returns mealType: null or add one manually through the 
  Add Recipe form with no meal type. The line:
  cell: (info) => info.row.original.mealType.join(", ")
  will throw and white-screen the moment that row renders.

  ---
  Code Change Crash #6 — Make ENV.RECIPES_URL always undefined

  File: src/config/env.ts:2

  Change:
  RECIPES_URL: import.meta.env.VITE_RECIPES_URL as string,
  To:
  RECIPES_URL: undefined as unknown as string,
  What happens: Every single API call in the entire app becomes fetch("undefined/..."). Login fails, recipes fail to load, add/edit/delete all fail. The app loads visually but
   is completely dead. No white screen — just silent total failure.

  ---
  Code Change Crash #7 — Remove the beforeLoad SSR guard and break the auth check

  File: src/routes/_protected.tsx:40-48

  Change the useEffect token check to this:
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate({ to: "/" }); // inverted — redirects logged-IN users
    }
  }, []);
  What happens: Every logged-in user who visits /recipes gets immediately bounced back to the login page. Every unauthenticated user stays on /recipes forever with an empty,  
  broken dashboard.

  ---
  The easiest one to demo live right now is #3 — one character change (data?.data → data.data) and the entire recipes page white-screens instantly on load, before any network 
  request even completes. Very dramatic for a presentation.