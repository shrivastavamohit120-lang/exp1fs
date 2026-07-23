import React from "react";

const PLATFORM_CLASS = {
  Instagram: "dot--instagram",
  Twitter: "dot--twitter",
  LinkedIn: "dot--linkedin"
};

function PostItem({ post, onDelete }) {
  return (
    <li className="post-item">
      <span className={`dot ${PLATFORM_CLASS[post.platform] || ""}`} aria-hidden="true" />
      <div className="post-item__body">
        <p className="post-item__content">{post.content}</p>
        <div className="post-item__meta">
          <span>{post.platform}</span>
          <span>·</span>
          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </time>
        </div>
      </div>
      <button className="post-item__delete" onClick={() => onDelete(post.id)} aria-label="Delete post">
        ×
      </button>
    </li>
  );
}

// React.memo: with a stable `onDelete` (see PostList's useCallback) and a
// `post` object that only changes when *this* entity changes, unrelated
// posts never re-render when one post is added/removed/edited.
export default React.memo(PostItem);
