# Signal — Multi-Platform Post Composer

A React + Vite implementation of **Unit 1 / Experiment 1: Post Composer with
Platform Validation & Draft Management**, covering all four assignments:

| Assignment | Where it lives |
|---|---|
| 1. Multi-platform composer (3+ platforms, dynamic limits, real-time validation) | `src/components/PostComposer.jsx`, `PlatformSelector.jsx`, `CharacterGauge.jsx` |
| 2. Draft management (save/list/edit/delete, localStorage) | `src/hooks/useDrafts.js`, `src/components/DraftList.jsx`, `DraftItem.jsx` |
| 3. Strategy Pattern validation (easy to add a new platform) | `src/utils/validationStrategies.js` |
| 4. Mock API + loading state + retry logic + toasts | `src/utils/mockApi.js`, `src/hooks/useToast.jsx` |

Everything is client-side only — no backend required. Drafts persist to your
browser's `localStorage`.

---

## Run it on Windows 11 — step by step

### 1. Install Node.js
You need Node.js 18 or newer (this ships with `npm`).

1. Go to **https://nodejs.org** and download the **LTS** installer for Windows.
2. Run the installer, click through with default options, then finish.
3. Confirm it worked — open **PowerShell** (search "PowerShell" in the Start
   menu) and run:
   ```
   node -v
   npm -v
   ```
   You should see version numbers for both. If not, restart your computer
   (Windows sometimes needs a restart to pick up the new PATH entry).

### 2. Unzip the project
1. Right-click `social-post-composer.zip` → **Extract All...**
2. Choose a destination (e.g. `C:\Users\<you>\Documents\social-post-composer`)
   and click **Extract**.

### 3. Open a terminal in the project folder
- Easiest way: open the extracted folder in File Explorer, click the address
  bar, type `powershell`, and hit Enter. This opens PowerShell already inside
  the folder.
- Alternatively, open PowerShell and run:
  ```
  cd "C:\Users\<you>\Documents\social-post-composer"
  ```
  (adjust the path to wherever you extracted it)

### 4. Install dependencies
```
npm install
```
This downloads React, Vite, and the other packages listed in
`package.json` into a `node_modules` folder. It only needs to be run once
(or again if you delete `node_modules`).

### 5. Start the dev server
```
npm run dev
```
You'll see output like:
```
  VITE v5.x.x  ready in 400 ms
  ➜  Local:   http://localhost:5173/
```
Hold **Ctrl** and click the `http://localhost:5173/` link (or paste it into
your browser) to open the app.

### 6. Stop the server
Press **Ctrl + C** in the PowerShell window when you're done.

---

## Other useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the local dev server with hot-reload |
| `npm run build` | Produce an optimized production build in `dist/` |
| `npm run preview` | Serve the production build locally, to sanity-check it |

## Troubleshooting

- **"npm is not recognized..."** → Node.js isn't installed or PATH wasn't
  refreshed. Reinstall Node.js from nodejs.org and restart PowerShell (or your
  PC).
- **Port 5173 already in use** → Vite will automatically pick the next free
  port (5174, etc.) — just use the URL it prints.
- **Blank page in browser** → Make sure the terminal shows no red error text.
  If it does, copy the error and check that `npm install` completed without
  failures.
- **Want to reset your drafts?** → Open the browser DevTools (F12) → Application
  tab → Local Storage → delete the `signal.drafts.v1` key, or just clear
  browsing data for `localhost`.

## Project structure

```
social-post-composer/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx                # Layout + hero section
│   ├── App.css / index.css    # Styling
│   ├── hooks/
│   │   ├── useForm.js         # Controlled-input hook
│   │   ├── useDrafts.js       # Draft CRUD + localStorage + save lifecycle
│   │   └── useToast.jsx       # Toast notification system
│   ├── utils/
│   │   ├── validationStrategies.js  # Strategy pattern per platform
│   │   └── mockApi.js               # Simulated save request + retry logic
│   └── components/
│       ├── PostComposer.jsx   # Main composer form
│       ├── PlatformSelector.jsx
│       ├── CharacterGauge.jsx # Live character-limit gauge
│       ├── DraftList.jsx
│       └── DraftItem.jsx
```

## Extending it (Assignment 3 in practice)

To add a new platform (say, Threads), open
`src/utils/validationStrategies.js` and add one entry to the `platforms`
object with a `label`, `limit`, `color`, `hint`, and `validate` function —
nothing else in the app needs to change.
