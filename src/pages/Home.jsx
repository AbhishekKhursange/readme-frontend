import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { bookService, categoryService, volumeService } from "../api/bookService";
import BookCard from "../components/BookCard";
import VolumeCard from "../components/VolumeCard";
import CategoryPills from "../components/CategoryPills";
import Loader from "../components/Loader";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  const [books, setBooks] = useState([]);
  const [volumes, setVolumes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHome = (isRetry = false) => {
    setLoading(true);
    setError(null);

    const booksRequest = searchQuery ? bookService.searchBooks(searchQuery) : bookService.getAllBooks();
    // Search only covers standalone books for now — volumes show only when
    // browsing normally (no search query).
    const volumesRequest = searchQuery ? Promise.resolve([]) : volumeService.getAllVolumes();

    Promise.all([booksRequest, volumesRequest, categoryService.getAllCategories()])
      .then(([booksData, volumesData, categoriesData]) => {
        setBooks(booksData);
        setVolumes(volumesData);
        setCategories(categoriesData);
      })
      .catch((err) => {
        // Same cold-start scenario as AdminDashboard — the very first
        // request after Neon's free tier wakes up from being idle can fail
        // once before it succeeds. One silent retry covers it.
        console.error("Home load failed:", err.response?.status, err.message);
        if (!isRetry) {
          setTimeout(() => loadHome(true), 3000);
          return;
        }
        setError("Couldn't load books right now. Please try again shortly.");
      })
      .finally(() => {
        if (isRetry || !error) setLoading(false);
      });
  };

  useEffect(() => {
    loadHome();
  }, [searchQuery]);

  return (
    <div className="container py-4 page-fade-in text-center">
      <Helmet>
        <title>ReadMe | Illustrated Storybooks to Read Online</title>
        <meta
          name="description"
          content="Browse bedtime stories, suspense tales, romance, and informative illustrated storybooks. Read free, beautifully illustrated books online at ReadMe."
        />
        <meta property="og:title" content="ReadMe | Illustrated Storybooks to Read Online" />
        <meta
          property="og:description"
          content="Browse and read illustrated storybooks across bedtime, suspense, romance, and more."
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <h2 className="mb-1">{searchQuery ? `Results for "${searchQuery}"` : "Browse Books"}</h2>
      <p style={{ color: "var(--color-text-muted)" }}>
        Bedtime stories, suspense tales, and informative reads — pick a shelf.
      </p>

      {!searchQuery && <CategoryPills categories={categories} />}

      {loading && <Loader />}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="row g-3 text-start">
          {books.length === 0 && volumes.length === 0 && (
            <p className="text-center" style={{ color: "var(--color-text-muted)" }}>No books found.</p>
          )}
          {books.map((book, idx) => (
            <BookCard key={`book-${book.slug}`} book={book} index={idx} />
          ))}
          {volumes.map((volume, idx) => (
            <VolumeCard key={`volume-${volume.slug}`} volume={volume} index={books.length + idx} />
          ))}
        </div>
      )}
    </div>
  );
}
