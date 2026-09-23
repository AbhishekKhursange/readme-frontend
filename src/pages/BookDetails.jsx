import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { bookService } from "../api/bookService";
import Loader from "../components/Loader";

export default function BookDetails() {
  const { bookSlug } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    bookService
      .getBookBySlug(bookSlug)
      .then(setBook)
      .catch(() => setError("Book not found."))
      .finally(() => setLoading(false));
  }, [bookSlug]);

  if (loading) return <Loader />;
  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!book) return null;

  return (
    <div className="container py-4 page-fade-in">
      <div className="glass-panel p-4">
        <div className="row g-4">
          <div className="col-md-4">
            <img src={book.coverImageUrl} alt={book.title} className="img-fluid rounded-3 shadow" />
          </div>
          <div className="col-md-8">
            <span className="category-pill active">{book.categoryName}</span>
            <h1 className="mt-3">{book.title}</h1>
            {book.author && <p style={{ color: "var(--color-text-muted)" }}>by {book.author}</p>}
            <p>{book.description}</p>
            <p style={{ color: "var(--color-text-muted)" }}>{book.totalPages} pages</p>
            <Link to={`/read/${book.slug}`} className="btn btn-lg btn-animated">
              Start Reading
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
