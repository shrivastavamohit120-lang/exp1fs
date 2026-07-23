import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "../features/posts/postsSlice";
import platformsReducer from "../features/platforms/platformsSlice";
import uiReducer from "../features/ui/uiSlice";
import { actionCounterMiddleware } from "./actionCounter";

// --- Section 4 of the PDF: Flat, domain-based state structure -------------
// {
//   posts:     { ids: [], entities: {}, loading, error },
//   platforms: { ids: [], entities: {}, loading, error },
//   ui:        { platformFilter }
// }
export const store = configureStore({
  reducer: {
    posts: postsReducer,
    platforms: platformsReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(actionCounterMiddleware)
});
