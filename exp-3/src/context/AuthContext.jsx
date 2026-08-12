// src/context/AuthContext.jsx
//
// Central authentication + authorization state for the app.
//
// Firebase Authentication already implements everything Experiment 3 asks
// for at the protocol level:
//   - the "token" is a Firebase ID token, which IS a JWT
//     (header.payload.signature, signed, with an "exp" claim)
//   - "token storage" is handled internally by the Firebase SDK (IndexedDB),
//     which is safer than hand-rolling localStorage/sessionStorage
//   - "token refresh" happens automatically before the 1 hour expiry, and
//     auth.currentUser.getIdToken(true) forces an immediate refresh
//
// What we still build ourselves, per the experiment brief:
//   - RBAC: a "role" field stored on a Firestore user document
//   - Protected routes (components/ProtectedRoute.jsx)
//   - Conditional UI rendering based on role
//   - An Axios interceptor that attaches the token to outgoing requests
//     and retries once on 401 (api/axiosInstance.js)

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

// Roles known to the app. Kept in one place so RBAC.jsx and the UI
// components stay in sync with what's written to Firestore at signup.
export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
};

// Mirrors the "permissions" table from the experiment write-up.
export const PERMISSIONS = {
  [ROLES.ADMIN]: ["create", "edit", "delete"],
  [ROLES.EDITOR]: ["create", "edit"],
  [ROLES.VIEWER]: ["read"],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase user object
  const [role, setRole] = useState(null); // "admin" | "editor" | "viewer"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fires on login, logout, and silent token refresh.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const profile = await fetchOrCreateUserDoc(firebaseUser);
        setRole(profile.role);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function fetchOrCreateUserDoc(firebaseUser) {
    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data();
    }

    // First sign-in: create a profile doc with a default "viewer" role.
    // Promoting someone to editor/admin is a privileged action and should
    // be done from the Firebase Console or a trusted Cloud Function -
    // never by trusting a role value sent from the client.
    const profile = {
      email: firebaseUser.email,
      role: ROLES.VIEWER,
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return profile;
  }

  async function register(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await fetchOrCreateUserDoc(cred.user);
    return cred.user;
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  async function logout() {
    await signOut(auth);
  }

  // Returns the current JWT (Firebase ID token). Pass forceRefresh=true to
  // bypass the cached token and mint a fresh one - this is what the Axios
  // response interceptor calls after a 401.
  async function getToken(forceRefresh = false) {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken(forceRefresh);
  }

  function hasPermission(action) {
    if (!role) return false;
    return PERMISSIONS[role]?.includes(action) ?? false;
  }

  const value = {
    user,
    role,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    getToken,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
