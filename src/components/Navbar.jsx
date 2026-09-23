import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../api/authService";

function readStoredUser() {
  const stored = localStorage.getItem("ReadMe_user");
  return stored ? JSON.parse(stored) : null;
}

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(readStoredUser);
  const navigate = useNavigate();

  useEffect(() => {
    // Fires on login/logout (dispatched manually, since localStorage writes
    // in the same tab don't trigger the browser's native "storage" event).
    const onAuthChange = () => setUser(readStoredUser());
    window.addEventListener("ReadMe-auth-changed", onAuthChange);
    return () => window.removeEventListener("ReadMe-auth-changed", onAuthChange);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("ReadMe_refresh_token");
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // Even if this fails (e.g. already expired), still clear locally below.
      }
    }
    localStorage.removeItem("ReadMe_user");
    localStorage.removeItem("ReadMe_token");
    localStorage.removeItem("ReadMe_refresh_token");
    window.dispatchEvent(new Event("ReadMe-auth-changed"));
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg glass-surface sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" style={{ color: "var(--color-accent)" }}>
          <span style={{ display: "inline-block", animation: "floatIcon 3s ease-in-out infinite" }}>📖</span>{" "}
          ReadMe
        </Link>

        <form className="d-flex mx-auto" onSubmit={handleSearch} style={{ maxWidth: 360, flex: 1 }}>
          <input
            className="form-control form-control-sm custom-input me-2"
            type="search"
            placeholder="Search books..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-sm btn-animated">Search</button>
        </form>

        <div className="d-flex align-items-center gap-2">
          {user ? (
            <>
              {user.admin && (
                <Link to="/admin" className="btn btn-sm btn-outline-warning">
                  Admin
                </Link>
              )}
              <span style={{ color: "var(--color-text-muted)" }} className="small">
                Hi, {user.fullName?.split(" ")[0]}
              </span>
              <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-outline-light">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-sm btn-animated">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
