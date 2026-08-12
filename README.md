# Network Insight

A unified network management console: plan, integrate, monitor and automate
every part of the network from one surface.

This is a rebuild of a prototype that previously existed only as a single
552 KB self-extracting HTML bundle. The UI is unchanged — same layout, same
interactions, same theming — but it is now an ordinary Vite + React +
TypeScript project with real components, real stylesheets and a data layer
that can be pointed at a backend.

## Getting started

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # typecheck + production build to dist/
npm run preview  # serve the production build
npm run typecheck
```

Sign-in accepts any non-empty email and password; the form is pre-filled.

## What's in it

- **Sign-in** with an interactive node-graph backdrop — drag to orbit,
  shift-drag to pan, wheel to zoom, double-click to reset.
- **Boot splash** between sign-in and the landing screen, covering the
  warm-up that needs an authenticated user.
- **Navigation** as either a 284px sidebar or a 66px rail with flyouts,
  covering 11 applications, their vendor groupings and ~50 modules.
- **Tabs** for open modules, capped at four visible with an overflow count.
- **Command palette** (`⌘K` / `Ctrl+K`) searching applications, modules and
  submodules, with arrow-key navigation.
- **Module workspace** with filters, KPI tiles and a parameter-audit grid,
  plus dedicated loading, error and empty states.
- **Notifications** and **activity** slide-overs.
- **Theming**: three brands (blue, orange, red) × light and dark, all driven
  by CSS custom properties.

## Architecture

```
src/
  data/         Static fixtures — the catalog, notifications, seed session
  services/     Service contracts and the fixture-backed implementation
  state/        One hook per state slice, composed by AppStateProvider
  lib/          Icons, logo, catalog queries, formatting
  components/   login/ shell/ home/ module/ panels/ common/
  styles/       Design tokens and the base layer
```

**State.** The prototype held everything in one class component with about
thirty fields. That is now one hook per concern — `useSession`, `useTabs`,
`useNavigation`, `useNotifications`, `usePalette`, `useModuleWorkspace`,
`usePreferences`, `useToast`, `useBootSequence` — each owning its own slice.
`AppStateProvider` composes them and owns only the interactions that cross
slices, such as opening a module (which touches tabs, history, overlays and
the workspace at once).

**Startup.** `useBootSequence` runs the warm-up between sign-in and the
landing screen, and `App` renders the splash for every authenticated state
that is not yet `ready` — so the shell cannot appear before its data has
landed. Boot tasks are supplied by the provider; today that is the
notification fetch, which needs a signed-in user and therefore cannot happen
any earlier. The sequence finishes when both the tasks and a minimum
duration are done, so real backend latency lengthens the splash rather than
being hidden behind it.

**Styling.** Every colour resolves through the custom properties in
`styles/tokens.css`. Appearance is set by two independent attributes on the
document element, so one paint re-themes the whole app:

```html
<html data-theme="light|dark" data-brand="blue|orange|red">
```

**Data.** Nothing in `components/` or `state/` imports a fixture directly.
Everything goes through the interfaces in `services/contracts.ts`:
`AuthService`, `CatalogService`, `NotificationService`, `ModuleService`.

## Pointing it at a real backend

Implement the four interfaces in `src/services/contracts.ts` and change the
single binding in `src/services/index.ts`:

```ts
export const services: Services = httpServices  // was mockServices
```

Nothing else has to change. The contracts are already async, and
`ModuleService.load` takes an optional progress callback so a real
implementation can drive the loading screen from server-sent progress — or
just report 0 and then 100.

## Notes on the port

A few things were deliberately changed rather than reproduced:

- **Hover and focus states** are real CSS. The bundle synthesised them at
  runtime from `style-hover` attributes, which React has no equivalent for.
- **A keyboard focus ring** was added. The original had no focus indicator
  anywhere, which made the app unusable without a mouse.
- **Vendor colour hashing** was dropped. It hashed vendor names into palette
  arrays whose entries were all identical, so it never varied anything.
- **Unused animations** (six of the thirteen keyframes) were removed.
- `prefers-reduced-motion` is now honoured.

The Inter webfont is loaded from Google Fonts in `index.html` rather than
being embedded; to run fully offline, vendor the woff2 files into `public/`
and swap the `@font-face` sources.
