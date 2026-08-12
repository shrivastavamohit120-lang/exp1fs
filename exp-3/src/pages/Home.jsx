import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="hero">
      <p className="hero-eyebrow">JWT · RBAC · Protected Routes</p>
      <h1>
        Every request carries <span>proof of who you are.</span>
        <br />
        Every route decides <span>what you're allowed to see.</span>
      </h1>
      <p className="hero-sub">
        A small reference implementation of token-based authentication and
        role-based access control: Firebase issues the JWT, an Axios
        interceptor attaches and refreshes it, and protected routes enforce
        permissions before a single restricted pixel renders.
      </p>

      <div className="hero-actions">
        {isAuthenticated ? (
          <Link className="btn btn-primary" to="/dashboard">
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link className="btn btn-primary" to="/register">
              Create an account
            </Link>
            <Link className="btn btn-ghost" to="/login">
              Log in
            </Link>
          </>
        )}
      </div>

      <div className="hero-flow">
        {[
          "Sign in",
          "Token issued",
          "Stored securely",
          "Attached to requests",
          "Route + role checked",
        ].map((step, i, arr) => (
          <div className="hero-flow-step" key={step}>
            <span className="hero-flow-node">{step}</span>
            {i < arr.length - 1 && <span className="hero-flow-arrow" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </div>
  );
}
