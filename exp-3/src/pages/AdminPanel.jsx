import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const SEED_POSTS = [
  { id: 1, title: "Welcome to AccessLayer" },
  { id: 2, title: "How RBAC protects this page" },
  { id: 3, title: "Rotating refresh tokens, explained" },
];

export default function AdminPanel() {
  const { hasPermission } = useAuth();
  const [posts, setPosts] = useState(SEED_POSTS);

  function handleDelete(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="page">
      <p className="page-eyebrow">Admin only · role = admin</p>
      <h1>Admin Panel</h1>
      <p className="page-sub">
        This route is wrapped in{" "}
        <code>&lt;ProtectedRoute allowedRoles={"{['admin']}"}&gt;</code>.
        Anyone without the admin role is redirected to /unauthorized before
        this component ever renders.
      </p>

      <section className="card">
        <h2>Posts</h2>
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.id}>
              <span>{post.title}</span>
              {/* Conditional rendering: only admins see the Delete button,
                  same idea as {user.role === "admin" && <button>...} */}
              {hasPermission("delete") && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
          {posts.length === 0 && <li className="empty">No posts left.</li>}
        </ul>
      </section>
    </div>
  );
}
