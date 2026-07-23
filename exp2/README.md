# Content Store — Redux Toolkit (Unit 1, Experiment 2)

A runnable React + Redux Toolkit app implementing everything in the
"Redux-Based Content State Management" experiment: slices, async thunks,
`createEntityAdapter` normalization, memoized `reselect` selectors, and
render-optimized components.

---

## 1. Prerequisites (Windows 11)

You need **Node.js** (which includes npm). If you don't have it:

1. Go to https://nodejs.org
2. Download the **LTS** installer for Windows.
3. Run the installer, accepting the defaults (this also installs npm).
4. Confirm it worked — open **PowerShell** or **Command Prompt** and run:
   ```
   node -v
   npm -v
   ```
   You should see version numbers for both.

---

## 2. Unzip and install

1. Right-click the downloaded `redux-content-manager.zip` → **Extract All…**
   and pick a folder (e.g. `Documents\redux-content-manager`).
2. Open **PowerShell** in that folder:
   - In File Explorer, go into the extracted folder.
   - Click the address bar, type `powershell`, press Enter.
3. Install dependencies:
   ```
   npm install
   ```
   This downloads Vite, React, Redux Toolkit, react-redux, and reselect.
   It needs an internet connection and takes ~30–60 seconds.

---

## 3. Run it

```
npm run dev
```

Vite will print a local URL, typically:

```
Local:   http://localhost:5173/
```

It should also open automatically in your default browser. If not, open
that URL yourself.

To stop the server, click the terminal and press `Ctrl + C`.

---

## 4. Build for production (optional)

```
npm run build
npm run preview
```

`npm run build` outputs a static `dist/` folder you could deploy anywhere;
`npm run preview` serves that build locally so you can sanity-check it.

---

## 5. Project structure

```
src/
  app/
    store.js            → configureStore: single source of truth
    actionCounter.js     → tiny middleware, powers the on-screen recompute monitor
  api/
    mockApi.js           → simulated backend (fetch delay, in-memory data)
  features/
    posts/
      postsSlice.js      → createSlice + createEntityAdapter + createAsyncThunk
      postsSelectors.js  → memoized selectors (reselect / createSelector)
      ComposePost.jsx    → form, dispatches addPostAsync
      PostList.jsx       → React.memo, reads selectVisiblePosts
      PostItem.jsx       → React.memo leaf, receives a stable onDelete
      PostStats.jsx      → React.memo, reads selectPostStats
      RecomputeMonitor.jsx → live proof selectors skip unnecessary recomputation
    platforms/
      platformsSlice.js  → createEntityAdapter + createAsyncThunk
      PlatformFilter.jsx → tabs, writes to ui slice
    ui/
      uiSlice.js         → UI-only state (platformFilter), separate from data
```

## 6. How this maps to the experiment's assignments

| Assignment | Where it lives |
|---|---|
| 1 — Redux Slice Implementation | `postsSlice.js`: `addPost` / `updatePost` / `deletePost`, wired to React via `ComposePost.jsx` and `PostList.jsx` |
| 2 — Async Data Handling | `postsSlice.js`: `fetchPosts` thunk + `pending/fulfilled/rejected` in `extraReducers`; loading/error surfaced in `PostList.jsx` |
| 3 — State Normalization | `createEntityAdapter` in `postsSlice.js` and `platformsSlice.js` stores `{ ids, entities }` instead of a plain array |
| 4 — Selector Optimization | `postsSelectors.js`: `selectShortPosts`, `selectPostStats`, `selectVisiblePosts` built with `createSelector` |
| 5 — Performance Optimization | `React.memo` on `PostList`, `PostItem`, `PostStats`; `useCallback` for the delete/submit handlers; `RecomputeMonitor.jsx` shows live counts proving it works |

The **recompute monitor** at the top of the page is the most direct way to
see Assignment 4/5 working: it shows total Redux actions dispatched next to
how many times each memoized selector actually recomputed. Click around the
platform filter or type in the compose box — the recompute counts barely
move, because reselect only reruns a selector when its real inputs change.

---

## 7. Troubleshooting

- **`npm : command not found` / not recognized** — Node.js isn't installed
  or you need to restart PowerShell after installing it.
- **Port 5173 already in use** — close whatever else is using it, or run
  `npm run dev -- --port 5174`.
- **Blank page / console errors mentioning modules** — delete the
  `node_modules` folder and `package-lock.json` (if present), then run
  `npm install` again.
