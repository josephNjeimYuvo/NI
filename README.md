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
- **Session splashes** either side of the app: one between sign-in and the
  landing screen, one between signing out and the login screen.
- **Navigation** as either a 284px sidebar or a 66px rail with flyouts,
  covering 11 applications, their vendor groupings and ~50 modules.
- **Tabs** for open modules in a strip that fits the available width, with
  arrows to scroll through them and a dropdown listing every open module.
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
`usePreferences`, `useToast`, `useSessionTransition` — each owning its own
slice. `AppStateProvider` composes them and owns only the interactions that
cross slices, such as opening a module (which touches tabs, history,
overlays and the workspace at once).

**Session lifecycle.** `useSessionTransition` drives both splashes through
one four-state machine:

```
idle ──enter()──▶ entering ──▶ ready ──leave()──▶ leaving ──▶ idle
(login)           (splash)      (app)            (splash)     (login)
```

Both directions work the same way: run their tasks in order, and finish when
both those tasks and a minimum duration are done — so real backend latency
lengthens a splash rather than hiding behind it. The floor exists because
the work is instant against fixtures, and a one-frame splash reads as a
glitch. Signing out uses a shorter floor than signing in; it is an exit, not
an arrival.

The provider supplies the tasks. On the way in, that is the notification
fetch, which needs a signed-in user and so cannot happen any earlier. On the
way out it is revoking the session and dropping everything belonging to it.
Teardown is deliberately deferred into the `leaving` phase so the splash
covers it, rather than the app tearing itself down behind a screen the user
has already left.

`App` orders its checks around that: `leaving` is checked before
authentication, because teardown clears the session partway through and the
login screen would otherwise appear mid-splash; and the shell renders only
at `ready`, so it cannot appear before its data has landed.

**Tab strip.** `TabStrip` renders every open tab into a horizontally
scrolling track that fills whatever width the top bar has left, so how many
are on screen follows the viewport instead of a fixed cap. Arrows appear
only once the track overflows and scroll it — they never change the active
module, so hunting for a tab costs nothing. Opening a module from elsewhere
scrolls its tab into view, and the overflow chip opens a menu of every tab
for jumping straight to one that is far off-screen.

Below 1180px the search box collapses to its icon. Without that, the search
field, action buttons and scroll controls together leave the track with no
room at all and no tab is reachable. At 800px with the sidebar *expanded*
the track is still too narrow for a full tab — collapsing the sidebar, or
the overflow menu, covers that case.

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
