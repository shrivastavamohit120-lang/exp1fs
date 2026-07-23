import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectVisiblePosts, selectPostsLoading, selectPostsError } from "./postsSelectors";
import { deletePost } from "./postsSlice";
import PostItem from "./PostItem.jsx";

function PostList() {
  const dispatch = useDispatch();
  const posts = useSelector(selectVisiblePosts);
  const loading = useSelector(selectPostsLoading);
  const error = useSelector(selectPostsError);

  // useCallback keeps a stable function identity across renders so
  // React.memo(PostItem) below can actually skip re-rendering.
  const handleDelete = useCallback((id) => dispatch(deletePost(id)), [dispatch]);

  if (loading && posts.length === 0) {
    return <p className="empty-state">Fetching posts…</p>;
  }

  if (error) {
    return <p className="empty-state empty-state--error">Couldn't load posts: {error}</p>;
  }

  if (posts.length === 0) {
    return <p className="empty-state">No posts for this platform yet.</p>;
  }

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} onDelete={handleDelete} />
      ))}
    </ul>
  );
}

export default React.memo(PostList);
