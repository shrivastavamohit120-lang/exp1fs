# AccessLayer — JWT Auth & RBAC (Experiment 3)

A working implementation of Experiment 3 (Role-Based Authentication & Route
Protection): JWT-based auth, RBAC, protected routes, an Axios interceptor
that attaches and refreshes tokens, and role-conditional UI — built on
**Firebase** as the backend.

### Why Firebase covers "JWT" even though you never write jsonwebtoken code

Firebase Authentication issues a real JWT for every signed-in user (a
Firebase **ID token**): `header.payload.signature`, signed, with `exp`,
`iat`, `email`, and `user_id` claims — exactly the structure in the
experiment brief. Firebase's SDK also handles secure storage and silent
refresh internally, which is the "hard part" of section 3 and section 5 of
the brief. This project builds the pieces Firebase doesn't give you for
free: **RBAC roles, protected routes, an Axios interceptor, and
conditional UI.**

---

## 1. Project structure

```
src/
  firebase.js              Firebase app/auth/firestore init
  context/AuthContext.jsx  login/register/logout, role state, getToken()
  api/axiosInstance.js     request/response interceptors (JWT + refresh-retry)
  components/
    ProtectedRoute.jsx     route guard (auth-only or role-restricted)
    Navbar.jsx             role-based conditional rendering
  pages/
    Home.jsx, Login.jsx, Register.jsx,
    Dashboard.jsx          any authenticated user; decodes & shows the JWT
    AdminPanel.jsx         admin-only route + permission-gated delete button
    Unauthorized.jsx       shown on RBAC rejection
firestore.rules            server-side RBAC enforcement (the real security layer)
firebase.json / firestore.indexes.json   Firebase CLI config
```

---

## 2. Backend setup — Firebase (step by step)

### Step 1 — Create the Firebase project

1. Go to <https://console.firebase.google.com/> and click **Add project**.
2. Name it (e.g. `accesslayer-demo`), disable Google Analytics unless you
   want it, and click **Create project**.

### Step 2 — Register a Web App

1. In the project overview, click the **`</>`** (web) icon.
2. Give it a nickname, skip Firebase Hosting for now (we'll come back to
   it in Step 9).
3. Firebase shows you a `firebaseConfig` object — copy those values, you'll
   need them in Step 5.

### Step 3 — Enable Authentication

1. In the left sidebar: **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable **Email/Password**.
3. (Optional) Enable Google or other providers the same way — the code
   here only wires up email/password, but `AuthContext.jsx` is the only
   file you'd extend to add more.

### Step 4 — Enable Firestore (stores each user's role)

1. **Build → Firestore Database → Create database**.
2. Start in **production mode** (the rules file in this repo will lock it
   down properly).
3. Pick a region close to you.

Firestore holds one document per user at `users/{uid}` shaped like:

```json
{ "email": "person@example.com", "role": "viewer", "createdAt": "<timestamp>" }
```

New sign-ups are created with `role: "viewer"` automatically by
`AuthContext.jsx`. **Client code can never grant itself `admin` or
`editor`** — that's enforced by `firestore.rules`, not just by the UI.

### Step 5 — Configure the frontend with your Firebase keys

```bash
cp .env.example .env
```

Paste the six `firebaseConfig` values from Step 2 into `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Leave `VITE_API_BASE_URL` for Step 8 (only needed if you add a custom
backend endpoint beyond Firestore/Auth).

### Step 6 — Deploy the Firestore security rules

This is the step that makes RBAC real instead of decorative. Without it,
a user could open devtools and edit their own `role` field in Firestore.

```bash
npm install -g firebase-tools   # one-time
firebase login
firebase use --add              # pick your project, give it an alias
firebase deploy --only firestore:rules
```

`firestore.rules` in this repo:

- lets a user read their own profile (and read any profile if they're an
  admin),
- lets a user create their own profile doc **only** with `role: "viewer"`,
- only lets an existing **admin** update anyone's role,
- gates an example `posts` collection the same way the Admin Panel demo
  expects (`admin`/`editor` can write, only `admin` can delete, any signed
  -in user can read).

### Step 7 — Promote your first admin

New accounts always start as `viewer`. To test the Admin Panel:

1. Firebase Console → **Firestore Database → users → `<your uid>`**.
2. Edit the `role` field from `viewer` to `admin`.
3. Refresh the app — `AdminPanel.jsx` and the "Admin Panel" nav link
   appear because `AuthContext` re-reads the role on auth state changes.

(In a real product you'd do this from a trusted Cloud Function with the
Admin SDK, gated behind your own internal tooling — never expose a
"become admin" button in client code.)

### Step 8 (optional) — A custom backend endpoint for Axios to call

`api/axiosInstance.js` is pre-wired to attach `Authorization: Bearer
<token>` to any request and to refresh-and-retry once on a 401. If you
add a Cloud Function or Cloud Run service that needs to *verify* that
token server-side (e.g. before touching a non-Firestore resource), verify
it with the Admin SDK:

```js
// functions/index.js (Cloud Functions, Node)
const admin = require("firebase-admin");
admin.initializeApp();

exports.api = functions.https.onRequest(async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    // decoded.uid, decoded.email are now trustworthy
    res.json({ ok: true, uid: decoded.uid });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});
```

Point `VITE_API_BASE_URL` in `.env` at that function's URL and any call
through `src/api/axiosInstance.js` will authenticate against it
automatically.

### Step 9 (optional) — Deploy the frontend to Firebase Hosting

```bash
npm run build
firebase init hosting   # if you skipped it in Step 2; point it at "dist"
firebase deploy --only hosting
```

---

## 3. Running locally

```bash
npm install
cp .env.example .env    # fill in Firebase config (Step 5 above)
npm run dev
```

Then:

1. Visit `/register`, create an account → you're a `viewer`.
2. Visit `/dashboard` — see your role, permissions, and decoded JWT.
3. Try `/admin` — redirected to `/unauthorized` (you're not an admin yet).
4. Promote yourself in Firestore (Step 7), refresh, visit `/admin` again.

## 4. How each experiment section maps to the code

| Experiment section | Where it lives |
|---|---|
| JWT structure & claims | `pages/Dashboard.jsx` decodes and displays the live Firebase ID token |
| Token storage | Handled by the Firebase SDK internally (safer than manual localStorage) |
| Axios interceptors | `api/axiosInstance.js` — request (attach) + response (401 refresh-retry) |
| Token refresh mechanism | `context/AuthContext.jsx#getToken(forceRefresh)` + the response interceptor |
| RBAC | `context/AuthContext.jsx` (`ROLES`, `PERMISSIONS`, `hasPermission`) + `firestore.rules` |
| Protected routes | `components/ProtectedRoute.jsx`, used in `App.jsx` |
| Conditional rendering | `components/Navbar.jsx`, `pages/Dashboard.jsx`, `pages/AdminPanel.jsx` |
| Secure frontend architecture | Centralized `AuthContext` + `axiosInstance` + rules-backed Firestore |
