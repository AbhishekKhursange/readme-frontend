import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookService, categoryService } from "../api/bookService";
import BookCard from "../components/BookCard";
import CategoryPills from "../components/CategoryPills";
import Loader from "../components/Loader";

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([bookService.getBooksByCategory(categorySlug), categoryService.getAllCategories()])
      .then(([booksData, categoriesData]) => {
        setBooks(booksData);
        setCategories(categoriesData);
      })
      .catch(() => setError("Couldn't load this category right now."))
      .finally(() => setLoading(false));
  }, [categorySlug]);

  const currentCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="container py-4 page-fade-in text-center">
      <h2 className="mb-1">{currentCategory ? currentCategory.name : "Category"}</h2>
      {currentCategory?.description && (
        <p style={{ color: "var(--color-text-muted)" }}>{currentCategory.description}</p>
      )}

      <CategoryPills categories={categories} />

      {loading && <Loader />}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="row g-3 text-start">
          {books.length === 0 && <p className="text-center" style={{ color: "var(--color-text-muted)" }}>No books in this category yet.</p>}
          {books.map((book, idx) => (
            <BookCard key={book.slug} book={book} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
