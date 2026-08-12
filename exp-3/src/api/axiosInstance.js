// src/api/axiosInstance.js
//
// Centralized Axios client (Experiment 3, section 4 & 5).
//
//  - Request interceptor: attaches the Firebase ID token (JWT) to every
//    outgoing request as "Authorization: Bearer <token>".
//  - Response interceptor: on a 401 from the backend, forces a token
//    refresh and retries the original request exactly once, so an
//    expired token never surfaces as a failed request in the UI.
//
// This talks to whatever backend you point VITE_API_BASE_URL at (e.g. a
// Cloud Function or Cloud Run service that verifies the Firebase ID token
// with the Admin SDK). Firebase's own SDK calls (auth, Firestore) do NOT
// go through this file - they already attach and refresh tokens
// internally. This file is for YOUR custom backend endpoints.

import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 15000,
});

// --- Request interceptor: attach current JWT ---
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken(); // cached, auto-refreshed by SDK
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: refresh + retry once on 401 ---
let refreshInFlight = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (response?.status === 401 && !config._retried && auth.currentUser) {
      config._retried = true;

      try {
        // De-dupe concurrent refreshes if several requests 401 at once.
        refreshInFlight =
          refreshInFlight || auth.currentUser.getIdToken(true);
        const freshToken = await refreshInFlight;
        refreshInFlight = null;

        config.headers.Authorization = `Bearer ${freshToken}`;
        return api(config); // retry the original request
      } catch (refreshError) {
        refreshInFlight = null;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
