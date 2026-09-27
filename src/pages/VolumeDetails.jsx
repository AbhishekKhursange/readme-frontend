import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { volumeService } from "../api/bookService";
import Loader from "../components/Loader";
import { Helmet } from "react-helmet-async";

export default function VolumeDetails() {
  const { volumeSlug } = useParams();
  const [volume, setVolume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    volumeService
      .getVolumeBySlug(volumeSlug)
      .then(setVolume)
      .catch(() => setError("Volume not found."))
      .finally(() => setLoading(false));
  }, [volumeSlug]);

  if (loading) return <Loader />;
  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!volume) return null;

  return (
    <div className="container py-4 page-fade-in text-center">
      <Helmet>
        <title>{volume.title} — {volume.bookTitle} | ReadMe</title>
        <meta name="description" content={`Chapters in ${volume.title} from ${volume.bookTitle}.`} />
        <meta property="og:title" content={volume.title} />
        <meta property="og:image" content={volume.coverImageUrl} />
      </Helmet>
      <h2 className="mb-1">{volume.title}</h2>
      <p style={{ color: "var(--color-text-muted)" }}>
        {volume.bookTitle} · Volume {volume.volumeNumber}
      </p>

      <div className="row g-3 text-start mt-2">
        {volume.chapters.length === 0 && (
          <p className="text-center" style={{ color: "var(--color-text-muted)" }}>No chapters yet.</p>
        )}
        {volume.chapters.map((chapter, idx) => (
          <Link key={chapter.slug} to={`/chapter/${chapter.slug}`} className="col-6 col-md-4 col-lg-3">
            <div className="book-card h-100" style={{ animationDelay: `${idx * 0.05}s` }}>
              <img src={chapter.coverImageUrl} alt={chapter.title} loading="lazy" />
              <div className="p-2">
                <h6 className="mb-1 text-truncate" style={{ color: "var(--color-text)" }}>
                  {chapter.title}
                </h6>
                <small style={{ color: "var(--color-text-muted)" }}>Chapter {chapter.chapterNumber}</small>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}