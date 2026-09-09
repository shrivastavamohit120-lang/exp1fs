# Weekly Calendar — Render Lab

A real **Node + React** project (Vite), built for **Unit 1 / Experiment 4 — Interactive Calendar
Optimization & Testing**. It shows a week-view calendar (Mon–Sun) rendered two ways side by side,
each with a live **per-weekday render counter**, so the effect of React performance optimizations
is visible instead of theoretical.

This has been installed and built locally to confirm it runs cleanly (`npm install` → `npm run
build` → `npm run dev`, verified with an HTTP 200 from the dev server) before being handed over.

## How to run

Requires Node.js (18+) and npm.

```bash
npm install
npm run dev       # starts the dev server, prints a local URL (usually http://localhost:5173)
```

Open the printed URL in a browser. To build a production bundle instead:

```bash
npm run build      # outputs to dist/
npm run preview      # serves the production build locally
```

## File structure

```
calendar-render-lab/
├── index.html                    # Vite entry HTML
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx                    # mounts <App /> into #root
│   ├── App.jsx                      # toolbar + the two side-by-side panels
│   ├── data.js                       # DAYS, HOURS, initialEvents(), formatHour()
│   ├── styles.css
│   └── components/
│       ├── EventCard.jsx               # the card: PlainEventCard vs MemoEventCard
│       └── CalendarPanel.jsx             # one calendar: grid, drag-and-drop, render counters
└── README.md
```

## What's on screen

- **Week grid, weekday names only (Mon–Sun)** — no month/date numbers, just the 7 days, 8 AM–6 PM.
- **Two calendars side by side**, fed the exact same event data and the exact same actions:
  - **Left — "Without optimization"**: `PlainEventCard`, a plain function component, no memoization.
  - **Right — "With optimization"**: `MemoEventCard`, the same component wrapped in `React.memo`,
    combined with `useMemo` (grouping events by day/hour) and `useCallback` (stable
    `onDragStart` / `onDrop` / render-tracking handlers) in `CalendarPanel.jsx`.
- **A render count under every weekday header** (`Mon · 3 renders`, `Tue · 0 renders`, …), plus a
  **panel-wide total** in the header — so you can see exactly which day is doing the work.
- **Drag-and-drop**: drag any event onto another day/hour cell to reschedule it. Only the moved
  event gets a new object reference; every other event keeps its original reference, which is what
  lets `React.memo` skip re-rendering the untouched cards.
- **Filter box**: filters events by title, mirroring the "typing in a fast list filter" profiling
  scenario from the experiment write-up.
- **Reset** (per panel, clears that panel's counters) and **Reset demo** (full state + both panels'
  counters, via a remount).

Note: `main.jsx` deliberately does **not** wrap `<App />` in `React.StrictMode`. In development,
StrictMode intentionally double-invokes component renders to help surface side-effect bugs — which
would double every counter here and make the comparison confusing. Turn it back on if you want to
inspect StrictMode-specific behavior; just expect the counts to double while it's on.

## What the counters actually demonstrate

| Action                         | Left (no memo)                                              | Right (memoized)                                     |
|---------------------------------|----------------------------------------------------------------|----------------------------------------------------------|
| Drag one event to a new weekday | Every visible card re-renders — the moved day, the destination day, and every other day's count all jump | Only the moved card's new day count increases by 1 |
| Type in the filter box          | All matching cards re-render                                  | Only cards whose visibility/data actually changed re-render |

This mirrors the experiment's theory section directly:

- `React.memo` skips a re-render when props are shallow-equal (Section 2, "Component level Optimization").
- `useMemo` avoids recomputing the day/hour grouping unless `events` actually changes (Section 2).
- `useCallback` keeps `onDragStart`, `onDrop`, and the render-tracking callback referentially stable
  — required for `React.memo` to actually bail out. Without it, a new function prop on every render
  would defeat the memoization (Section 2, "referential stability").
- The left panel reproduces the "Common Causes" of unnecessary renders from Section 3 (parent
  re-renders cascading to children with no dependency check).

## Mapping to the assignments

- **Assignment 1 (Render Optimization)** — compare the two panels' per-day counters directly.
- **Assignment 2 (Drag-and-Drop)** — implemented via native HTML5 drag events (`onDragStart` /
  `onDragOver` / `onDrop`), updating event state immutably per-item.
- **Assignment 3 (Profiling)** — install the React DevTools browser extension, open the Profiler
  tab, record a session, drag an event, and confirm the flame/ranked chart matches what the
  on-screen counters already show.
- **Assignments 4 & 5 (Testing / Mocking)** — the project already has a bundler and separate
  component files, so it's ready for `@testing-library/react` + `msw` to be added (e.g. via
  `npm install -D vitest @testing-library/react @testing-library/jest-dom msw`) without any
  restructuring.
