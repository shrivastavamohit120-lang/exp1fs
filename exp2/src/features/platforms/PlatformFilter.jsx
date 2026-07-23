import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPlatformFilter } from "../ui/uiSlice";
import { selectPlatformFilter } from "../posts/postsSelectors";
import { platformsAdapterSelectors } from "./platformsSlice";

export default function PlatformFilter() {
  const dispatch = useDispatch();
  const active = useSelector(selectPlatformFilter);
  const platforms = useSelector(platformsAdapterSelectors.selectAll);

  const options = ["All", ...platforms.map((p) => p.id)];

  return (
    <div className="filter-tabs" role="tablist" aria-label="Filter posts by platform">
      {options.map((option) => (
        <button
          key={option}
          role="tab"
          aria-selected={active === option}
          className={`filter-tab ${active === option ? "is-active" : ""}`}
          onClick={() => dispatch(setPlatformFilter(option))}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
