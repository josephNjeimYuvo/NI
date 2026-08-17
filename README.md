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

Sign-in accepts any non-empty email and password; the form is pre-filled. The
session survives a reload, so refreshing lands back on the same screen — sign
out to get the login form again.

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
- **Module workspace** with a multi-select site picker, metric picker,
  sortable and paged parameter-audit grid, KPI tiles, a metric sparkline, and
  dedicated loading and empty states.
- **Failure screens** that tell a module which is not provisioned apart from
  one whose service timed out and one that crashed, and offer only the action
  that can actually work.
- **Notifications** slide-over.
- **Accessible by structure**: landmarks, a heading outline, a skip link,
  live-region announcements and a roving-tabindex tab strip.
- **Theming**: three brands (blue, orange, red) × light and dark, all driven
  by CSS custom properties.

## Architecture

```
src/
  data/         Static fixtures — the catalog, notifications, seed session
  services/     Service contracts and the fixture-backed implementation
  state/        One hook per state slice, composed by AppStateProvider
  lib/          Icons, logo, catalog queries, formatting, storage
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

**Surviving a reload.** Refreshing the page puts the user back where they
were rather than at the sign-in form. Four slices persist through
`lib/storage`, each owned by the hook it belongs to:

| key | holds | written by |
| --- | --- | --- |
| `ni.session` | user, favorites, history | `useSession` |
| `ni.tabs` | open module names, selection | `useTabs` |
| `ni.nav` | selected application, rail or sidebar | `useNavigation` |
| `ni.theme` | light or dark | `usePreferences` |

Reads are validated by the hook that made them and a value that fails
validation is discarded, so changing any of these shapes needs no migration —
an older blob is simply ignored and the in-memory default stands. Every write
is best-effort: `localStorage` throws in private modes and when cookies are
blocked, which is not something to surface for a convenience feature.

Two things follow from restoring a session rather than signing in. The
transition machine starts at `ready` instead of `idle`, because a reload is
not an arrival and does not deserve the splash — but the warm-up still has to
run, so `resume()` performs the same tasks in the same order behind the app.
And only module *names* are stored, never their contents: restored tabs come
back in `loading` and only the active one is fetched, since restoring nine
tabs must not fire nine requests for screens nobody is reading. The rest load
the first time they are selected.

Signing out clears the session and the tab strip, so the next visitor to the
browser gets the login screen and an empty workspace.

**Breadcrumbs.** The trail follows the catalog's real depth, which is four
levels for a module inside a grouping: `Network Insight › Core Analytics ›
Subscriber Trace › Trace Sessions`. Skipping the grouping would describe a
route that does not exist — `Trace Sessions` is only reachable by opening
`Subscriber Trace` first — so the application crumb returns to the catalog
with that application selected, and the grouping crumb returns with the group
already expanded.

Only crumbs that lead somewhere the user is not already are rendered as
buttons. On the catalog itself there is nowhere further up, so both crumbs
are plain text naming the location — previously it read `Network Insight ›
Applications › Main menu`, three crumbs of which two were live-looking links
that did nothing.

When the trail runs out of room the intermediate crumbs abbreviate, while the
root and the page you are actually on keep their names. Sharing the loss
evenly truncated all four at once, which left the user reading
"Network Insi…" — the one crumb short enough to never have needed it.

`main` is a column so the trail keeps its own band and the view fills what is
left. The loading, failure and workspace views were absolutely positioned
across the whole of `main`, which painted them over the breadcrumb and
swallowed every click on it — the trail looked fine and did nothing on any
screen that was not the catalog or a loaded module.

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

**Failure screens.** A module that will not open fails for one of three
reasons, and `ModuleError` treats them as different events rather than as one
message with different words:

| | not provisioned | timed out | internal error |
| --- | --- | --- | --- |
| Code | `NI-MODULE-404` | `NI-GATEWAY-504` | `NI-CORE-500` |
| Mark | dashed, half filled | cut through | fractured |
| Badge | clock, accent | alarm, critical | cross, critical |
| Primary action | Request access | Retry | Report to service desk |
| Repeats? | every time | probably not | every time |

The distinction matters because the screen used to present everything as a
gateway timeout with Retry as its primary button. Two of the three kinds
reproduce on every attempt, so for those the one action on offer was the one
that could never succeed. Only the timeout keeps Retry; the other two hand
over the action that does move things forward.

Four things are on screen: what happened in one sentence, the one action that
moves it forward, the way back, and `Technical details` folded shut.
Everything support needs — code, correlation ID, module, timestamp, a
`Copy diagnostics` button and the service desk number — is inside that
disclosure, because it matters to one caller in twenty and to nobody else
reading the page.

The illustration is the Network Insight mark itself, in muted greys rather
than a drawing of the failure: at this size a picture competes with the
sentence under it, and the sentence is the part that has to land. Each kind
marks the same shape differently, so the three are distinguishable before a
word is read.

Retry is free the first time, since a timeout often clears by itself. From
the second consecutive failure the button holds for a growing interval and
says so, because one that fails identically three times running is worse than
no button at all.

**Styling.** Every colour resolves through the custom properties in
`styles/tokens.css`. Appearance is set by two independent attributes on the
document element, so one paint re-themes the whole app:

```html
<html data-theme="light|dark" data-brand="blue|orange|red">
```

**Icons.** Anything standing for an application, module or submodule renders
through `DuoIcon`, which draws in two tones: `--icon-primary` carries the
structure and `--icon-accent` picks out one part of the drawing. Which paths
take the accent is declared per icon in `ICON_ACCENT_PATHS` — the signal arcs
of an antenna, the knobs of a slider, the trend line over its axes. No
positional rule lands on those consistently, so it is a drawing decision
rather than a formula.

The primary follows the brand but the accent is one cyan everywhere,
including dark mode. Each brand's own accent shade sits in the same hue
family as its primary — orange on orange, red on red — which leaves the two
tones nearly indistinguishable at icon sizes; a single contrasting hue keeps
the split readable in all three. Being decorative rather than load-bearing,
it is tuned for visibility over contrast ratio: the primary carries the
structure, so an icon still reads if the accent is missed entirely.

Both tones are CSS variables rather than props, so a container can restate
the pair for its own background: a selected application tile sets
`--icon-primary` to its foreground colour, and the icon follows without
`DuoIcon` knowing tiles exist.

**Data.** Nothing in `components/` or `state/` imports a fixture directly.
Everything goes through the interfaces in `services/contracts.ts`:
`AuthService`, `CatalogService`, `NotificationService`, `ModuleService`.

Filtering, sorting and paging are arguments to `getWorkspaceData` rather than
operations on a local array, so the grid behaves the same once a real backend
is answering and none of the UI changes when it is. `getTrend` rejects with
`TrendUnavailableError` for designated modules, which is how the workspace
demonstrates a partially-degraded screen without pretending the whole app is
broken.

All three kinds of failure are wired into the fixtures, so every branch of
the failure screen is reachable:

- `Unified Map (New)` — in the catalog's `failingModules` as `unavailable`,
  and never opens. What an unprovisioned module looks like.
- `Signalling Analytics` — in `failingModules` as `internal`, and fails on
  every open with `NI-CORE-500`.
- `Interference Map` — times out on its first two opens and then comes up.
  Flakiness is not something a backend would declare about itself, so this
  one lives in the mock service rather than in the catalog.

**Accessibility.** The shell provides `header`, `nav` and `main` landmarks, a
skip link, and one `h1` per view that names it — visually hidden, since the
breadcrumb carries that job on screen. `Announcer` holds a permanent
`aria-live` region so module loads, failures and toasts are spoken; it stays
mounted because a live region has to exist before its content changes for the
change to be announced. Every interactive element is a real control rather
than a `div` with a role, and the tab strip implements the ARIA tablist
pattern with a roving tabindex.

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
