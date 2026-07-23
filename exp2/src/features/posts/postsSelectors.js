import { createSelector } from "reselect";
import { postsAdapterSelectors } from "./postsSlice";

// --- Assignment 5 support: a counter so the UI can prove a selector only
// recomputes when its actual inputs change, not on every render/dispatch.
let shortPostsRecomputeCount = 0;
let statsRecomputeCount = 0;

export const selectAllPosts = postsAdapterSelectors.selectAll;
export const selectPostsLoading = (state) => state.posts.loading;
export const selectPostsError = (state) => state.posts.error;

export const selectPlatformFilter = (state) => state.ui.platformFilter;

// --- Assignment 4: Derived + memoized state --------------------------------
// Only recomputes when `selectAllPosts` or `selectPlatformFilter` change,
// not on unrelated state updates (e.g. toggling a UI flag elsewhere).
export const selectVisiblePosts = createSelector(
  [selectAllPosts, selectPlatformFilter],
  (posts, platformFilter) => {
    if (platformFilter === "All") return posts;
    return posts.filter((post) => post.platform === platformFilter);
  }
);

// Derived "short posts" (< 100 chars) — mirrors the PDF's selectShortPosts example.
export const selectShortPosts = createSelector([selectAllPosts], (posts) => {
  shortPostsRecomputeCount += 1;
  return posts.filter((post) => post.content.length < 100);
});

// Aggregated analytics-style derived state: counts per platform.
export const selectPostStats = createSelector([selectAllPosts], (posts) => {
  statsRecomputeCount += 1;
  const byPlatform = posts.reduce((acc, post) => {
    acc[post.platform] = (acc[post.platform] || 0) + 1;
    return acc;
  }, {});
  return {
    total: posts.length,
    shortCount: posts.filter((p) => p.content.length < 100).length,
    byPlatform
  };
});

export function getRecomputeCounts() {
  return { shortPostsRecomputeCount, statsRecomputeCount };
}
