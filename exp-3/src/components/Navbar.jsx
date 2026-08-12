import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-mark" aria-hidden="true" />
        AccessLayer
      </Link>

      <nav className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {/* Conditional rendering based on RBAC role (section 8) */}
            {role === "admin" && <Link to="/admin">Admin Panel</Link>}
            <span className="navbar-role" data-role={role}>
              {role}
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
