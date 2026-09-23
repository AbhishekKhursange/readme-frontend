import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="text-center py-4 mt-5 glass-surface" style={{ color: "var(--color-text-muted)" }}>
      <small>&copy; {new Date().getFullYear()} ReadMe. Stories and illustrations are AI-generated.</small>
      <div className="mt-1">
        <Link to="/terms" className="me-3" style={{ color: "var(--color-text-muted)" }}>
          Terms of Use
        </Link>
        <Link to="/privacy" style={{ color: "var(--color-text-muted)" }}>
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}