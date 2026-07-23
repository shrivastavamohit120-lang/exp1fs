import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectShortPosts, selectPostStats, getRecomputeCounts } from "./postsSelectors";
import { getDispatchCount } from "../../app/actionCounter";

// Reading these selectors here (in addition to wherever else they're used)
// is intentional: it proves the memoization is store-wide, not per-component.
export default function RecomputeMonitor() {
  useSelector(selectShortPosts);
  useSelector(selectPostStats);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 400);
    return () => clearInterval(id);
  }, []);

  const { shortPostsRecomputeCount, statsRecomputeCount } = getRecomputeCounts();
  const dispatchCount = getDispatchCount();

  return (
    <div className="monitor" data-tick={tick}>
      <div className="monitor__label">
        <span className="monitor__pulse" />
        Selector recompute monitor
      </div>
      <div className="monitor__row">
        <MonitorStat label="Actions dispatched" value={dispatchCount} />
        <MonitorStat label="selectPostStats recomputed" value={statsRecomputeCount} />
        <MonitorStat label="selectShortPosts recomputed" value={shortPostsRecomputeCount} />
      </div>
      <p className="monitor__note">
        Recompute counts stay far below actions dispatched — reselect only
        reruns a selector when its actual inputs change, e.g. adding a post,
        not on every filter click or keystroke.
      </p>
    </div>
  );
}

function MonitorStat({ label, value }) {
  return (
    <div className="monitor__stat">
      <span className="monitor__value">{value}</span>
      <span className="monitor__stat-label">{label}</span>
    </div>
  );
}
