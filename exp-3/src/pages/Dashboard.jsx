import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import { PERMISSIONS } from "../context/AuthContext";

export default function Dashboard() {
  const { user, role, getToken, hasPermission } = useAuth();
  const [claims, setClaims] = useState(null);
  const [rawToken, setRawToken] = useState("");

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        setRawToken(token);
        setClaims(jwtDecode(token)); // decode client-side, for display only
      }
    })();
  }, [getToken]);

  return (
    <div className="page">
      <p className="page-eyebrow">Signed in as</p>
      <h1>{user?.email}</h1>
      <p className="page-sub">
        Role: <span className="pill" data-role={role}>{role}</span>
      </p>

      <section className="card">
        <h2>Permissions for this role</h2>
        <ul className="permission-list">
          {["create", "edit", "delete", "read"].map((action) => (
            <li key={action} className={hasPermission(action) ? "allowed" : "denied"}>
              <span className="permission-dot" aria-hidden="true" />
              {action}
              <span className="permission-state">
                {hasPermission(action) ? "allowed" : "denied"}
              </span>
            </li>
          ))}
        </ul>
        <p className="card-note">
          Defined in <code>PERMISSIONS</code>: {JSON.stringify(PERMISSIONS[role] ?? [])}
        </p>
      </section>

      {/* Conditional rendering example straight from the experiment brief */}
      {role === "admin" && (
        <div className="callout">
          You have admin access. <a href="/admin">Go to the Admin Panel →</a>
        </div>
      )}

      <section className="card">
        <h2>Your JWT (Firebase ID token)</h2>
        <p className="card-note">
          This is the real token Firebase issued — decoded here client-side
          for demonstration only. Never trust client-side decoding for
          authorization; a backend must verify the signature with the
          Firebase Admin SDK.
        </p>
        {claims && (
          <pre className="token-block">
{JSON.stringify(
  {
    uid: claims.user_id || claims.sub,
    email: claims.email,
    iat: claims.iat,
    exp: claims.exp,
  },
  null,
  2
)}
          </pre>
        )}
        <details>
          <summary>Show raw token</summary>
          <p className="token-raw">{rawToken}</p>
        </details>
      </section>
    </div>
  );
}
