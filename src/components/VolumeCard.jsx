import React from "react";
import { Link } from "react-router-dom";

export default function VolumeCard({ volume, index = 0 }) {
  return (
    <Link to={`/volume/${volume.slug}`} className="col-6 col-md-4 col-lg-3">
      <div className="book-card h-100" style={{ animationDelay: `${index * 0.05}s` }}>
        <img src={volume.coverImageUrl} alt={volume.title} loading="lazy" />
        <div className="p-2">
          <h6 className="mb-1 text-truncate" style={{ color: "var(--color-text)" }}>
            {volume.title}
          </h6>
          <small style={{ color: "var(--color-text-muted)" }}>
            {volume.bookTitle} · Volume {volume.volumeNumber}
          </small>
        </div>
      </div>
    </Link>
  );
}