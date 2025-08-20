Resource Explorer — Rick & Morty
================================

A small, polished React app (Next.js + TypeScript, App Router) to explore the Rick & Morty API with search, filters, sorting, detail view, favorites, URL‑synced state, and graceful loading/error handling.

How to run
----------

1) Install dependencies

```bash
npm install
```

2) Start the dev server

```bash
npm run dev
```

3) Open `http://localhost:3000`


What’s implemented
------------------

- List view with pagination; detail view at `/characters/:id`
- Debounced search (350ms), status/species filters, sort (name/id)
- URL is the source of truth for search/filter/sort/page (shareable, reload‑safe)
- Favorites toggle (list and detail), persisted in `localStorage`, filter to favorites
- Loading skeletons, error box with retry; in‑flight request cancellation via `AbortController`
- Client caching with React Query; background refetch on remount; keep-previous-page while loading next
- Theme toggle with persistence (light/dark)
- Remote images configured for `rickandmortyapi.com`
- Back/forward navigation preserves list scroll and restores focus to the clicked item


Architecture notes & trade‑offs
--------------------------------

- Framework & structure
  - Next.js (App Router) with TypeScript and sensible separation: `app/`, `components/`, `lib/` (API + hooks), and small CSS modules.
  - Minimal UI tooling: plain CSS variables + tiny CSS modules to keep bundle small.

- Data fetching & state
  - `src/lib/api.ts` wraps native `fetch` with a small `request()` helper and validates responses using `zod`.
  - React Query (`src/lib/hooks.ts`) provides caching, abort via `signal`, background refetch, and "keep previous data" for pagination.
  - URL is the single source of truth for list state. A guarded `replaceParams` prevents flicker/race when navigating back.
  - Manual scroll restoration using `sessionStorage` (`list:viewstate`) to avoid losing position on back/forward. Focus is restored to the previously opened item.

- Favorites
  - Implemented with `localStorage` (`src/lib/favorites.ts`) and optimistic UI in the button. Chosen for simplicity over server persistence.

- Styling & a11y
  - Semantic CSS variables for theme and status colors; `StatusBadge` component for Alive/Dead/Unknown.
  - Focus-visible styles on cards; accessible labels on controls; keyboard‑friendly.

- Error handling
  - Zod validation guards; friendly error UI with a retry action; AbortError is ignored to avoid noisy errors during typing.

Trade‑offs
----------

- Chose React Query over RTK Query to avoid Redux setup and keep focus on server cache rather than app state.
- Did not add a global design system to keep the project small; used lightweight CSS modules instead of Tailwind or MUI.
- Scroll restoration is custom and URL‑driven; it’s robust for typical flows but could be expanded for edge cases (e.g., deep linking with anchors).


If I had more time (next steps)
-------------------------------

- Virtualized list (react‑window) when many results are shown to keep rendering snappy.
- Prefetch adjacent pages and detail records on hover to further reduce perceived latency.
- Code splitting and Suspense boundaries around the detail route; skeletons per sub‑section.
- Notes on the detail page with form validation (Zod + React Hook Form) and optimistic updates.
- Simple E2E smoke test (Playwright) for the happy path: load → search → open detail → favorite → back.
- More robust scroll/focus restoration with the Navigation API and restoring per filter set.


Project structure
-----------------

```
src/
  app/
    page.tsx                 # list view (URL‑synced controls + React Query)
    characters/[id]/page.tsx # server wrapper for params
    characters/[id]/view.client.tsx # client detail view
    globals.css              # theme + base styles
    home.module.css          # list page styles
  components/
    CharacterCard.tsx/.css   # list item UI
    FavoriteButton.tsx       # optimistic favorites toggle
    StatusBadge.tsx/.css     # status color chip
  lib/
    api.ts                   # fetch + zod schemas
    hooks.ts                 # React Query hooks
    favorites.ts             # localStorage favorites
```

