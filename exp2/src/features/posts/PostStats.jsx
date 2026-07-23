import React from "react";
import { useSelector } from "react-redux";
import { selectPostStats } from "./postsSelectors";

function PostStats() {
  const stats = useSelector(selectPostStats);

  return (
    <div className="stats-row">
      <div className="stat">
        <span className="stat__value">{stats.total}</span>
        <span className="stat__label">Total posts</span>
      </div>
      <div className="stat">
        <span className="stat__value">{stats.shortCount}</span>
        <span className="stat__label">Short-form (&lt;100 chars)</span>
      </div>
      {Object.entries(stats.byPlatform).map(([platform, count]) => (
        <div className="stat" key={platform}>
          <span className="stat__value">{count}</span>
          <span className="stat__label">{platform}</span>
        </div>
      ))}
    </div>
  );
}

// React.memo: this only needs to re-render when `selectPostStats`'s memoized
// output identity changes — not on every store update elsewhere (e.g. the
// compose textarea's local state, which lives outside Redux anyway).
export default React.memo(PostStats);
