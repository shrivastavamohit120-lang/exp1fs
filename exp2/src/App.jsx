import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchPosts } from "./features/posts/postsSlice";
import { fetchPlatforms } from "./features/platforms/platformsSlice";
import ComposePost from "./features/posts/ComposePost.jsx";
import PlatformFilter from "./features/platforms/PlatformFilter.jsx";
import PostStats from "./features/posts/PostStats.jsx";
import PostList from "./features/posts/PostList.jsx";
import RecomputeMonitor from "./features/posts/RecomputeMonitor.jsx";
import "./App.css";

export default function App() {
  const dispatch = useDispatch();

  // --- Assignment 2: kick off the async thunk lifecycle on mount ----------
  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchPlatforms());
  }, [dispatch]);

  return (
    <div className="shell">
      <header className="shell__header">
        <p className="eyebrow">EXPERIMENT 2 · REDUX TOOLKIT</p>
        <h1>Content Store</h1>
        <p className="subtitle">
          One normalized store for posts and platforms — reducers stay pure,
          selectors stay memoized, components re-render only when their slice
          of state actually changes.
        </p>
      </header>

      <RecomputeMonitor />

      <main className="shell__grid">
        <section className="panel">
          <h2>Compose</h2>
          <ComposePost />
        </section>

        <section className="panel panel--feed">
          <div className="panel__feed-head">
            <h2>Feed</h2>
            <PlatformFilter />
          </div>
          <PostStats />
          <PostList />
        </section>
      </main>
    </div>
  );
}
