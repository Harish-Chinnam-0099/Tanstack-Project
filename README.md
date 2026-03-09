Welcome to your new TanStack Start app! 

# Getting Started

To run this application:

```bash
npm install
npm run dev
```

# Building For Production

To build this application for production:

```bash
npm run build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
npm run test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Uninstall the packages: `npm install @tailwindcss/vite tailwindcss -D`

## Linting & Formatting


This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
npm run lint
npm run format
npm run check
```



## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).





 ---
  How Filtering & Sorting Works

  1. URL as the Single Source of Truth

  Every filter value lives in the URL search params, not in React useState. When you change a filter, the URL updates and TanStack Router re-renders the page with the new     
  params.

  /recipes?page=1&limit=5&cuisine=Italian&difficulty=Easy&sort=rating&order=asc

  ---
  2. User Changes a Filter → setSearch() / navigate()

  // helper that merges new values into existing URL params
  const setSearch = (updates: Partial<RecipeSearchParams>) =>
    navigate({
      to: "/recipes",
      search: (prev) => ({ ...prev, ...updates, page: 1 }),
      //                   ↑ keep all current params
      //                                       ↑ always reset to page 1
    });

  When the user selects "Italian" from the cuisine dropdown:
  setSearch({ cuisine: "Italian" })
  // URL becomes: /recipes?page=1&limit=5&cuisine=Italian

  When the user clears it (selects empty):
  setSearch({ cuisine: undefined })
  // URL becomes: /recipes?page=1&limit=5  ← cuisine param removed

  ---
  3. validateSearch Reads & Validates the URL Params

  In recipes.tsx, TanStack Router validates params before the page renders:

  validateSearch: (search): RecipeSearchParams => ({
    page:       Number(search.page ?? 1),
    limit:      Number(search.limit ?? 5),
    search:     typeof search.search === "string" ? search.search : undefined,
    cuisine:    typeof search.cuisine === "string" ? search.cuisine : undefined,
    difficulty: typeof search.difficulty === "string" ? search.difficulty : undefined,
    sort:       typeof search.sort === "string" ? search.sort : undefined,
    order:      search.order === "asc" || search.order === "desc" ? search.order : undefined,
  })

  This converts raw URL strings to properly typed values and provides safe defaults.

  ---
  4. useSearch() Reads the Validated Params

  const search = useSearch({ from: "/_protected/recipes" }) as RecipeSearchParams;

  search now has the current filter state — e.g. { page: 1, limit: 5, cuisine: "Italian" }. This is passed directly to useQuery.

  ---
  5. React Query Fetches Based on Params

  const { data, isFetching } = useQuery({
    queryKey: queryKeys.recipes(search), // key changes when any filter changes
    queryFn: () => getRecipes(search),   // re-fetches automatically
    placeholderData: (prev) => prev,     // keeps old data visible while loading
  });

  Every time search changes (any filter or sort), the queryKey changes, which triggers a new fetch.

  ---
  6. getRecipes() — Two Paths Based on Filter Type

  Has cuisine or difficulty filter?
          │
          ├── YES → fetch ALL data (limit=0)
          │         filter client-side on full dataset
          │         slice for current page → correct total & pagination
          │
          └── NO  → fetch only current page (limit=5, skip=0)
                    server handles pagination → fast, correct total

  Search uses /recipes/search?q=... (server-side).
  Sort sends sortBy=rating&order=asc in the query string (server-side).
  Cuisine / Difficulty → no API support, so limit=0 fetches all, filter runs client-side, then paginated manually with .slice(skip, skip + limit).

  ---
  7. What Changed — map() Instead of Manual Options

  Before (repetitive, hard to maintain):
  <option value="Italian">Italian</option>
  <option value="Indian">Indian</option>
  // ... 19 more lines

  After (data-driven, easy to update):
  const CUISINES = ["American", "Asian", "Brazilian", ...]; // add/remove in one place

  {CUISINES.map((c) => (
    <option key={c} value={c}>{c}</option>
  ))}



● Great question. Let me walk through the entire app from scratch in beginner-friendly terms — what every piece does, why it's there, and how they all connect.                   
  ---                                                                                                                                                                            The Big Picture
                                                                                                                                                                               
  Your app is a Recipes Dashboard. It lets you:
  - Login
  - View a list of recipes in a table
  - Filter, sort, and paginate that list
  - Add a new recipe
  - Edit an existing recipe
  - Delete a recipe

  To build this, the project uses the TanStack ecosystem — a family of libraries that each solve one specific problem.

  ---
  The Tech Stack & Why Each Tool

  React

  The foundation. Every piece of UI — buttons, tables, forms, the sidebar — is a React component (a JavaScript function that returns HTML-like JSX). React re-renders the      
  component whenever its data changes.

  ---
  Vite

  The build tool. It takes all your TypeScript/TSX files and bundles them into files the browser can understand. In development it runs a local server (localhost:3000) with   
  hot reload — so when you save a file, the browser updates instantly.

  ---
  TanStack Router

  Why: Every URL in your app (/recipes, /recipesupdate/3, /) needs to show a different page. TanStack Router maps URLs to components.

  How it works in your app:

  URL /              → shows LoginForm       (routes/index.tsx)
  URL /recipes       → shows RecipesTable   (routes/_protected/recipes.tsx)
  URL /recipesupdate/add  → shows AddRecipe form
  URL /recipesupdate/3    → shows EditRecipe form for recipe #3

  The _protected prefix means those routes are protected — only logged-in users can see them.

  The URL is also used as a storage box for filter state. When you select "Italian" cuisine, the URL becomes /recipes?cuisine=Italian. This means:
  - You can share the URL and the other person sees the same filtered view
  - Pressing browser Back/Forward works correctly
  - Refreshing the page keeps your filters

  validateSearch is a gatekeeper that runs before any page renders. It reads the raw URL string ("1", "Italian") and converts them to proper types (1, "Italian") with safe    
  defaults if something is missing.

  ---
  TanStack Query (React Query)

  Why: Fetching data from an API has many states — loading, success, error, refetching. Writing all that manually every time is tedious. React Query handles all of it
  automatically.

  How it works:

  const { data, isFetching } = useQuery({
    queryKey: ["recipes", search],  // unique name for this data
    queryFn: () => getRecipes(search), // the function that fetches data
    placeholderData: (prev) => prev,   // show old data while new data loads
  });

  - queryKey — React Query uses this as a cache key. If you already fetched ["recipes", { cuisine: "Italian" }] before, it shows that cached result instantly instead of       
  waiting for the network again.
  - queryFn — the actual fetch function. React Query calls this automatically and manages the loading/error states.
  - placeholderData — while new data is loading, show the previous results so the table doesn't go blank.

  useMutation is for write operations (create, update, delete). Unlike useQuery which runs automatically, a mutation only runs when you call .mutate().

  Optimistic delete means: when you click Delete, the recipe is removed from the UI immediately — before the API call even finishes. If the API call fails, it puts the recipe 
  back. This makes the app feel instant.

  ---
  TanStack Table

  Why: A table with sortable columns, filtering, and pagination has a lot of logic. TanStack Table handles the data logic so you only write the HTML structure.

  How it works:

  // 1. Define what columns exist
  const columns = [
    { header: "Name", accessorKey: "name" }, // reads recipe.name
    { header: "Cuisine", accessorKey: "cuisine" },
    // ...
  ];

  // 2. Give it the data and columns
  const table = useReactTable({
    data: data?.data ?? [], // the recipes array
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 3. Render whatever the table tells you to render
  table.getHeaderGroups().map(...)  // renders header row
  table.getRowModel().rows.map(...) // renders each data row

  flexRender is TanStack Table's way of rendering a cell — it handles both simple string values ("Italian") and custom JSX (like the Edit/Delete buttons).

  ---
  TanStack Form

  Why: Forms have validation, error messages, touched/dirty states. Writing all that with useState gets messy fast.

  How it works in LoginForm and RecipeForm:

  const form = useForm({
    defaultValues: { name: "", cuisine: "" },
    onSubmit: ({ value }) => {
      // value contains all validated field values
      onSubmit(value);
    },
  });

  Then each field is wrapped in <form.Field>:

  <form.Field
    name="name"
    validators={{
      onSubmit: ({ value }) => !value ? "Name is required" : undefined
    }}
  >
    {(field) => (
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    )}
  </form.Field>

  - validators.onSubmit — runs when the form is submitted. Return a string = error message. Return undefined = valid.
  - field.state.value — the current value of this field
  - field.handleChange — updates the field value

  ---
  shadcn UI

  Why: Writing styled buttons, inputs, cards, tables from scratch takes time and looks inconsistent. shadcn gives you pre-built, styled components that you can customise.     

  Important: shadcn is NOT a package you install like normal. It copies component files directly into your src/components/ui/ folder. That's why you can see button.tsx,       
  input.tsx, table.tsx etc. — they are your files, you own them.

  ┌───────────┬───────────────────────────────────────────────┐
  │ Component │                  Where used                   │
  ├───────────┼───────────────────────────────────────────────┤
  │ Button    │ Throughout — forms, table actions, pagination │
  ├───────────┼───────────────────────────────────────────────┤
  │ Input     │ Search box, form text fields                  │
  ├───────────┼───────────────────────────────────────────────┤
  │ Label     │ Form field labels                             │
  ├───────────┼───────────────────────────────────────────────┤
  │ Card      │ Login form and recipe form wrapper            │
  ├───────────┼───────────────────────────────────────────────┤
  │ Table     │ The recipes table                             │
  ├───────────┼───────────────────────────────────────────────┤
  │ Textarea  │ Ingredients and instructions in recipe form   │
  ├───────────┼───────────────────────────────────────────────┤
  │ Sidebar   │ The dashboard side navigation                 │
  ├───────────┼───────────────────────────────────────────────┤
  │ Separator │ Visual dividers in the recipe form            │
  └───────────┴───────────────────────────────────────────────┘

  ---
  The API Layer (src/api/recipes.ts)

  This file is the only place in the app that talks to the internet. It uses the browser's built-in fetch() to call the DummyJSON API.

  Your component
      ↓ calls
  useQuery / useMutation
      ↓ calls
  getRecipes() / addRecipe() / deleteRecipe()
      ↓ calls
  fetch("https://dummyjson.com/recipes?limit=5&skip=0")
      ↓ returns
  JSON data
      ↓ back to
  React Query cache → component re-renders with new data

  The API layer has two modes for filtering:
  - Server-side (search, sort) — sends filter params to DummyJSON, it returns already-filtered results
  - Client-side (cuisine, difficulty) — DummyJSON has no filter endpoint for these, so fetch ALL data (limit=0) and filter the array yourself in JavaScript

  ---
  Auth (Login / Protected Routes)

  User fills LoginForm
      ↓
  POST /auth/login → DummyJSON returns { accessToken, ... }
      ↓
  setAuth() saves token to localStorage AND authStore
      ↓
  TanStack Router navigates to /recipes
      ↓
  _protected.tsx checks localStorage for token
      ↓
  No token → redirect to /    Token found → show the dashboard

  localStorage is the browser's permanent storage — it survives page refreshes. The token is saved there so the user stays logged in.

  ---
  The Layout System

  __root.tsx (always on screen)
  ├── <Header>  ← sticky top bar with ThemeToggle
  └── <main>
      └── _protected.tsx (when on /recipes, /recipesupdate/*)
          ├── <Sidebar>  ← left navigation panel
          └── <Outlet>   ← the actual page content goes here
              ├── /recipes       → RecipesPage
              ├── /recipesupdate/add → AddRecipe
              └── /recipesupdate/3   → EditRecipe

  <Outlet> is a placeholder — TanStack Router replaces it with whatever the current route's component is. Think of it like a picture frame; the frame (layout) stays the same, 
  only the picture (page) changes.

  ---
  The Sidebar (use-mobile.ts + sidebar.tsx)

  The sidebar behaves differently on desktop vs mobile:
  - Desktop (≥768px): Persistent panel on the left. Can collapse to icon-only mode.
  - Mobile (<768px): Hidden by default. SidebarTrigger (the hamburger button) opens it as a slide-in drawer.

  use-mobile.ts detects the screen width using window.matchMedia and returns true/false. The sidebar component reads this to decide which mode to use.

  ---
  How Everything Connects — One Full Flow

  User selects "Easy" difficulty filter:

  1. User selects "Easy" from dropdown
  2. setSearch({ difficulty: "Easy" }) is called
  3. navigate() updates URL to /recipes?difficulty=Easy&page=1
  4. TanStack Router sees URL changed
  5. validateSearch() converts "Easy" string → validated param
  6. useSearch() returns new search object with difficulty: "Easy"
  7. queryKey changes → React Query sees new key → triggers new fetch
  8. getRecipes({ difficulty: "Easy" }) is called
  9. API sends limit=0 (fetch all) because hasClientFilters = true
  10. All 50 recipes arrive from DummyJSON
  11. .filter(r => r.difficulty === "Easy") runs on all 50 → e.g. 20 match
  12. .slice(0, 5) takes first page of 5
  13. Returns { data: [5 recipes], total: 20 }
  14. React Query caches this result
  15. useQuery returns the new data
  16. useReactTable re-renders the table with 5 Easy recipes
  17. Pagination shows "Page 1 / 4" (20 total ÷ 5 per page)

  All of that happens in under a second, just from selecting one dropdown.
