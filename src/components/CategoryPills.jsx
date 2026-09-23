import React from "react";
import { Link, useParams } from "react-router-dom";

export default function CategoryPills({ categories }) {
  const { categorySlug } = useParams();

  return (
    <div className="d-flex flex-wrap justify-content-center gap-2 my-4">
      <Link to="/" className={`category-pill ${!categorySlug ? "active" : ""}`}>
        All Books
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          to={`/category/${cat.slug}`}
          className={`category-pill ${categorySlug === cat.slug ? "active" : ""}`}
        >
          {cat.name} ({cat.bookCount})
        </Link>
      ))}
    </div>
  );
}
