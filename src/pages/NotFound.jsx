import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5 text-center page-fade-in">
      <div className="glass-panel p-5 mx-auto" style={{ maxWidth: 420 }}>
        <h2>404</h2>
        <p style={{ color: "var(--color-text-muted)" }}>That page doesn't exist.</p>
        <Link to="/" className="btn btn-animated">Back to the shelf</Link>
      </div>
    </div>
  );
}
