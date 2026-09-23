import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { bookService } from "../api/bookService";
import PageFlipViewer from "../components/PageFlipViewer";
import Loader from "../components/Loader";

export default function BookReader() {
  const { bookSlug } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    bookService
      .getBookBySlug(bookSlug)
      .then(setBook)
      .catch(() => setError("Couldn't load this book."))
      .finally(() => setLoading(false));
  }, [bookSlug]);

  if (loading) return <Loader />;
  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!book) return null;

  return (
    <div className="container-fluid py-4 page-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <Link to={`/book/${book.slug}`} style={{ color: "var(--color-text-muted)" }}>
          &larr; Back to details
        </Link>
        <h5 className="m-0">{book.title}</h5>
        <span />
      </div>

      {book.pages && book.pages.length > 0 ? (
        <PageFlipViewer
          pages={book.pages}
          coverImageUrl={book.coverImageUrl}
          title={book.title}
          author={book.author}
        />
      ) : (
        <p className="text-center" style={{ color: "var(--color-text-muted)" }}>
          This book doesn't have any pages yet.
        </p>
      )}
    </div>
  );
}
