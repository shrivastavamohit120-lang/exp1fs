import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="page page-centered">
      <p className="page-eyebrow">403</p>
      <h1>You don't have access to this page</h1>
      <p className="page-sub">
        Your account role doesn't include the permissions this page
        requires. If you think this is wrong, ask an admin to update your
        role.
      </p>
      <Link className="btn btn-primary" to="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}
