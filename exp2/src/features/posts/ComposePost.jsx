import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPostAsync } from "./postsSlice";
import { platformsAdapterSelectors } from "../platforms/platformsSlice";

export default function ComposePost() {
  const dispatch = useDispatch();
  const platforms = useSelector(platformsAdapterSelectors.selectAll);
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [submitting, setSubmitting] = useState(false);

  // useCallback: stable reference so this handler doesn't force a re-render
  // of any memoized child that might receive it as a prop.
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!content.trim()) return;
      setSubmitting(true);
      await dispatch(addPostAsync({ content: content.trim(), platform }));
      setSubmitting(false);
      setContent("");
    },
    [content, platform, dispatch]
  );

  return (
    <form className="compose" onSubmit={handleSubmit}>
      <textarea
        className="compose__input"
        placeholder="What's happening across your channels?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        maxLength={280}
      />
      <div className="compose__row">
        <select
          className="compose__select"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          {(platforms.length ? platforms : [{ id: "Instagram" }, { id: "Twitter" }, { id: "LinkedIn" }]).map(
            (p) => (
              <option key={p.id} value={p.id}>
                {p.id}
              </option>
            )
          )}
        </select>
        <span className="compose__count">{content.length}/280</span>
      </div>
      <button className="compose__submit" type="submit" disabled={submitting || !content.trim()}>
        {submitting ? "Publishing…" : "Publish post"}
      </button>
    </form>
  );
}
