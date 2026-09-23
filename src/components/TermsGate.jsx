import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const STORAGE_KEY = "readme_terms_accepted";
const EXEMPT_PATHS = ["/terms", "/privacy"];

export default function TermsGate() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const handleAgree = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  // Never show the gate on the Terms/Privacy pages themselves — those
  // links open in a new tab, and since localStorage is shared across tabs,
  // that new tab would otherwise show this same overlay on top of the very
  // page the visitor is trying to read before agreeing.
  if (!visible || EXEMPT_PATHS.includes(location.pathname)) return null;

  return (
    <div className="terms-gate-backdrop">
      <div className="glass-panel p-4 terms-gate-card">
        <h4 className="mb-3">Before you continue</h4>
        <p style={{ color: "var(--color-text-muted)" }}>
          ReadMe is a platform for reading illustrated storybooks. Stories and illustrations on
          this site are AI-generated and provided for personal reading only.
        </p>

        <div className="form-check my-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="termsCheckbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="termsCheckbox">
            I have read and agree to the{" "}
            <Link to="/terms" target="_blank" rel="noreferrer">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link to="/privacy" target="_blank" rel="noreferrer">
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        <button
          type="button"
          className="btn btn-animated w-100"
          disabled={!checked}
          onClick={handleAgree}
        >
          Agree & Continue
        </button>
      </div>
    </div>
  );
}