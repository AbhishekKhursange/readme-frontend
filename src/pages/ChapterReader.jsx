import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { chapterService } from "../api/bookService";
import PageFlipViewer from "../components/PageFlipViewer";
import Loader from "../components/Loader";

export default function ChapterReader() {
  const { chapterSlug } = useParams();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    chapterService
      .getChapterBySlug(chapterSlug)
      .then(setChapter)
      .catch(() => setError("Couldn't load this chapter."))
      .finally(() => setLoading(false));
  }, [chapterSlug]);

  if (loading) return <Loader />;
  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!chapter) return null;

  return (
    <div className="container-fluid py-4 page-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <Link to={`/chapter/${chapter.slug}`} style={{ color: "var(--color-text-muted)" }}>
          &larr; Back to details
        </Link>
        <h5 className="m-0">{chapter.title}</h5>
        <span />
      </div>

      {chapter.pages && chapter.pages.length > 0 ? (
        <PageFlipViewer
          pages={chapter.pages}
          coverImageUrl={chapter.coverImageUrl}
          title={chapter.title}
          author={chapter.author}
        />
      ) : (
        <p className="text-center" style={{ color: "var(--color-text-muted)" }}>
          This chapter doesn't have any pages yet.
        </p>
      )}
    </div>
  );
}