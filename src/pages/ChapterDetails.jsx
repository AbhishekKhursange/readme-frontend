import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { chapterService } from "../api/bookService";
import Loader from "../components/Loader";
import { Helmet } from "react-helmet-async";

export default function ChapterDetails() {
  const { chapterSlug } = useParams();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    chapterService
      .getChapterBySlug(chapterSlug)
      .then(setChapter)
      .catch(() => setError("Chapter not found."))
      .finally(() => setLoading(false));
  }, [chapterSlug]);

  if (loading) return <Loader />;
  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!chapter) return null;

  return (
    <div className="container py-4 page-fade-in">
      <Helmet>
        <title>{chapter.title} — {chapter.bookTitle} | ReadMe</title>
        <meta name="description" content={chapter.description?.slice(0, 155)} />
        <meta property="og:title" content={chapter.title} />
        <meta property="og:description" content={chapter.description?.slice(0, 200)} />
        <meta property="og:image" content={chapter.coverImageUrl} />
        <meta property="og:type" content="book" />
      </Helmet>
      <div className="glass-panel p-4">
        <div className="row g-4">
          <div className="col-md-4">
            <img src={chapter.coverImageUrl} alt={chapter.title} className="img-fluid rounded-3 shadow" />
          </div>
          <div className="col-md-8">
            <span className="category-pill active">{chapter.volumeTitle}</span>
            <h1 className="mt-3">{chapter.title}</h1>
            <p style={{ color: "var(--color-text-muted)" }}>
              {chapter.bookTitle} · Chapter {chapter.chapterNumber}
              {chapter.author && ` · by ${chapter.author}`}
            </p>
            <p>{chapter.description}</p>
            <p style={{ color: "var(--color-text-muted)" }}>{chapter.totalPages} pages</p>
            <Link to={`/read-chapter/${chapter.slug}`} className="btn btn-lg btn-animated">
              Start Reading
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}