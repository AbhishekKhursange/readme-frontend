import React, { useMemo } from "react";

// Lens-flare style star: a soft glowing core plus thin bright rays crossing
// it (two long primary rays, plus faint diagonals) — matches a
// camera-captured star flare much more closely than a flat diamond shape.
function LensFlareStar({ top, left, size, delay, opacity }) {
  const gid = `${top}-${left}`; // unique per star so gradient ids don't clash
  return (
    <svg
      className="night-star"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: size,
        height: size,
        animationDelay: `${delay}s`,
        "--star-max-opacity": opacity,
      }}
      viewBox="0 0 100 100"
    >
      <defs>
        <radialGradient id={`glow-${gid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="35%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`vRay-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`hRay-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* soft bloom behind everything */}
      <circle cx="50" cy="50" r="30" fill={`url(#glow-${gid})`} />

      {/* faint diagonal rays */}
      <g stroke="#fff" strokeOpacity="0.3" strokeWidth="1">
        <line x1="22" y1="22" x2="78" y2="78" />
        <line x1="78" y1="22" x2="22" y2="78" />
      </g>

      {/* primary vertical + horizontal rays */}
      <rect x="48.5" y="0" width="3" height="100" fill={`url(#vRay-${gid})`} />
      <rect x="0" y="48.5" width="100" height="3" fill={`url(#hRay-${gid})`} />

      {/* bright core */}
      <circle cx="50" cy="50" r="4" fill="#fff" />
    </svg>
  );
}

function generateStars(count) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      top: Math.random() * 92,
      left: Math.random() * 100,
      size: 26 + Math.random() * 22,
      delay: Math.random() * 4,
      opacity: 0.75 + Math.random() * 0.25,
    });
  }
  return stars;
}

export default function NightSky() {
  const stars = useMemo(() => generateStars(9), []);

  return (
    <div className="night-sky" aria-hidden="true">
      {stars.map((s, i) => (
        <LensFlareStar key={i} {...s} />
      ))}
    </div>
  );
}
