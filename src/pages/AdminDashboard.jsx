import React, { useEffect, useState } from "react";
import { bookService, categoryService, uploadService } from "../api/bookService";
import { adminService } from "../api/adminService";
import Loader from "../components/Loader";

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

const emptyPage = () => ({ pageNumber: 1, text: "", file: null, imageUrl: null });

const emptyChapter = () => ({
  chapterNumber: 1,
  title: "",
  description: "",
  coverFile: null,
  pages: [emptyPage()],
});

const emptyVolume = () => ({
  volumeNumber: 1,
  title: "",
  coverFile: null,
  chapters: [emptyChapter()],
});

const TABS = [
  { key: "add", label: "Add a Book" },
  { key: "books", label: "Manage Books" },
  { key: "categories", label: "Manage Categories" },
  { key: "users", label: "Manage Users" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("add");

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [pages, setPages] = useState([emptyPage()]);
  const [hasVolumes, setHasVolumes] = useState(false);
  const [volumes, setVolumes] = useState([emptyVolume()]);
  const [submitting, setSubmitting] = useState(false);

  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);

  const slug = slugify(title || "untitled");

  const loadAll = (isRetry = false) => {
    setLoading(true);
    setError(null);
    Promise.all([bookService.getAllBooks(), categoryService.getAllCategories(), adminService.getAllUsers()])
      .then(([b, c, u]) => {
        setBooks(b);
        setCategories(c);
        setUsers(u);
      })
      .catch((err) => {
        // The very first request after a cold backend/database restart
        // (Neon's free tier sleeps when idle and needs a moment to wake up)
        // can fail outright instead of just being slow. One automatic
        // retry after a short pause covers that case without the reader
        // having to log out and back in just to "nudge" it.
        console.error("Admin data load failed:", err.response?.status, err.message);
        if (!isRetry) {
          setTimeout(() => loadAll(true), 3000);
          return;
        }
        setError("Couldn't load admin data right now.");
      })
      .finally(() => {
        if (isRetry || !error) setLoading(false);
      });
  };

  useEffect(loadAll, []);

  const updatePage = (index, field, value) => {
    setPages((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPageRow = () => {
    setPages((prev) => [...prev, { ...emptyPage(), pageNumber: prev.length + 1 }]);
  };

  const removePageRow = (index) => {
    setPages((prev) => prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, pageNumber: i + 1 })));
  };

  // ---------- Volume / Chapter builder (only used when hasVolumes) ----------
  const updateVolume = (vIdx, field, value) => {
    setVolumes((prev) => prev.map((v, i) => (i === vIdx ? { ...v, [field]: value } : v)));
  };

  const addVolume = () => {
    setVolumes((prev) => [...prev, { ...emptyVolume(), volumeNumber: prev.length + 1 }]);
  };

  const removeVolume = (vIdx) => {
    setVolumes((prev) => prev.filter((_, i) => i !== vIdx).map((v, i) => ({ ...v, volumeNumber: i + 1 })));
  };

  const updateChapter = (vIdx, cIdx, field, value) => {
    setVolumes((prev) =>
      prev.map((v, i) =>
        i !== vIdx
          ? v
          : { ...v, chapters: v.chapters.map((c, j) => (j === cIdx ? { ...c, [field]: value } : c)) }
      )
    );
  };

  const addChapter = (vIdx) => {
    setVolumes((prev) =>
      prev.map((v, i) =>
        i !== vIdx
          ? v
          : { ...v, chapters: [...v.chapters, { ...emptyChapter(), chapterNumber: v.chapters.length + 1 }] }
      )
    );
  };

  const removeChapter = (vIdx, cIdx) => {
    setVolumes((prev) =>
      prev.map((v, i) =>
        i !== vIdx
          ? v
          : {
            ...v,
            chapters: v.chapters
              .filter((_, j) => j !== cIdx)
              .map((c, j) => ({ ...c, chapterNumber: j + 1 })),
          }
      )
    );
  };

  const updateChapterPage = (vIdx, cIdx, pIdx, field, value) => {
    setVolumes((prev) =>
      prev.map((v, i) =>
        i !== vIdx
          ? v
          : {
            ...v,
            chapters: v.chapters.map((c, j) =>
              j !== cIdx
                ? c
                : { ...c, pages: c.pages.map((p, k) => (k === pIdx ? { ...p, [field]: value } : p)) }
            ),
          }
      )
    );
  };

  const addChapterPage = (vIdx, cIdx) => {
    setVolumes((prev) =>
      prev.map((v, i) =>
        i !== vIdx
          ? v
          : {
            ...v,
            chapters: v.chapters.map((c, j) =>
              j !== cIdx ? c : { ...c, pages: [...c.pages, { ...emptyPage(), pageNumber: c.pages.length + 1 }] }
            ),
          }
      )
    );
  };

  const removeChapterPage = (vIdx, cIdx, pIdx) => {
    setVolumes((prev) =>
      prev.map((v, i) =>
        i !== vIdx
          ? v
          : {
            ...v,
            chapters: v.chapters.map((c, j) =>
              j !== cIdx
                ? c
                : {
                  ...c,
                  pages: c.pages
                    .filter((_, k) => k !== pIdx)
                    .map((p, k) => ({ ...p, pageNumber: k + 1 })),
                }
            ),
          }
      )
    );
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      setStatus({ type: "danger", text: "Pick a category first." });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      // Cover goes in one flat folder for all books, whether it has
      // volumes or a flat page list.
      let coverImageUrl = "";
      if (coverFile) {
        const res = await uploadService.uploadImage(coverFile, "readMe/covers");
        coverImageUrl = res.url;
      }

      const bookPayload = {
        title,
        author,
        description,
        coverImageUrl,
        categoryId: Number(categoryId),
      };

      if (hasVolumes) {
        // Upload volume covers, then chapter covers, then each chapter's
        // page images — sequentially, using the book/volume/chapter
        // numbers to build clear folder paths as we go.
        const uploadedVolumes = [];
        for (const volume of volumes) {
          let volumeCoverUrl = "";
          if (volume.coverFile) {
            const res = await uploadService.uploadImage(
              volume.coverFile,
              `readMe/volumes/${slug}/v${volume.volumeNumber}`
            );
            volumeCoverUrl = res.url;
          }

          const uploadedChapters = [];
          for (const chapter of volume.chapters) {
            let chapterCoverUrl = "";
            if (chapter.coverFile) {
              const res = await uploadService.uploadImage(
                chapter.coverFile,
                `readMe/chapters/${slug}/v${volume.volumeNumber}/c${chapter.chapterNumber}`
              );
              chapterCoverUrl = res.url;
            }

            const uploadedPages = [];
            for (const page of chapter.pages) {
              let imageUrl = "";
              if (page.file) {
                const res = await uploadService.uploadImage(
                  page.file,
                  `readMe/pages/${slug}/v${volume.volumeNumber}/c${chapter.chapterNumber}`
                );
                imageUrl = res.url;
              }
              uploadedPages.push({ pageNumber: page.pageNumber, text: page.text, imageUrl });
            }

            uploadedChapters.push({
              chapterNumber: chapter.chapterNumber,
              title: chapter.title,
              description: chapter.description,
              coverImageUrl: chapterCoverUrl,
              pages: uploadedPages,
            });
          }

          uploadedVolumes.push({
            volumeNumber: volume.volumeNumber,
            title: volume.title,
            coverImageUrl: volumeCoverUrl,
            chapters: uploadedChapters,
          });
        }

        bookPayload.volumes = uploadedVolumes;
      } else {
        // Each page image goes under a per-book folder, named from the slug.
        const uploadedPages = [];
        for (const page of pages) {
          let imageUrl = "";
          if (page.file) {
            const res = await uploadService.uploadImage(page.file, `readMe/pages/${slug}`);
            imageUrl = res.url;
          }
          uploadedPages.push({ pageNumber: page.pageNumber, text: page.text, imageUrl });
        }
        bookPayload.pages = uploadedPages;
      }

      await bookService.createBook(bookPayload);

      setStatus({ type: "success", text: `"${title}" was added.` });
      setTitle("");
      setAuthor("");
      setDescription("");
      setCategoryId("");
      setCoverFile(null);
      setPages([emptyPage()]);
      setHasVolumes(false);
      setVolumes([emptyVolume()]);
      loadAll();
      setActiveTab("books");
    } catch (err) {
      setStatus({ type: "danger", text: err.response?.data?.message || "Couldn't create the book." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    try {
      await bookService.deleteBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setStatus({ type: "danger", text: "Couldn't delete that book." });
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCatSubmitting(true);
    setStatus(null);
    try {
      await categoryService.createCategory({ name: catName, description: catDescription });
      setStatus({ type: "success", text: `"${catName}" was added.` });
      setCatName("");
      setCatDescription("");
      loadAll();
    } catch (err) {
      setStatus({ type: "danger", text: err.response?.data?.message || "Couldn't create the category." });
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setStatus({ type: "danger", text: err.response?.data?.message || "Couldn't delete that category." });
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Delete account "${email}"? This can't be undone.`)) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setStatus({ type: "danger", text: "Couldn't delete that user." });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container py-4 page-fade-in">
      <h2 className="mb-1">Admin Dashboard</h2>

      <ul className="nav nav-tabs mb-4" style={{ borderBottomColor: "rgba(255,255,255,0.2)" }}>
        {TABS.map((tab) => (
          <li className="nav-item" key={tab.key}>
            <button
              className="nav-link"
              onClick={() => {
                setActiveTab(tab.key);
                setStatus(null);
              }}
              style={
                activeTab === tab.key
                  ? { color: "var(--color-accent)", borderColor: "rgba(255,255,255,0.2) rgba(255,255,255,0.2) transparent", background: "rgba(255,255,255,0.06)" }
                  : { color: "var(--color-text-muted)" }
              }
            >
              {tab.label}
              {tab.key === "books" && ` (${books.length})`}
              {tab.key === "users" && ` (${users.length})`}
            </button>
          </li>
        ))}
      </ul>

      {error && <div className="alert alert-danger">{error}</div>}
      {status && <div className={`alert alert-${status.type}`}>{status.text}</div>}

      {/* ---------- Add book ---------- */}
      {activeTab === "add" && (
        <div className="glass-panel p-4">
          <h4 className="mb-3">Add a Book</h4>
          <form onSubmit={handleCreateBook}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input className="form-control custom-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
                {title && (
                  <small style={{ color: "var(--color-text-muted)" }}>
                    Slug: <code>{slug}</code> — pages will upload to <code>readMe/pages/{slug}</code>
                  </small>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Author</label>
                <input className="form-control custom-input" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control custom-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Category</label>
                <select className="form-select custom-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Cover image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control custom-input"
                  onChange={(e) => setCoverFile(e.target.files[0])}
                />
              </div>
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="hasVolumesToggle"
                checked={hasVolumes}
                onChange={(e) => setHasVolumes(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="hasVolumesToggle">
                This book has volumes (e.g. Volume 1, Volume 2, each with its own chapters)
              </label>
            </div>

            {!hasVolumes ? (
              <>
                <h6 className="mt-4 mb-2">Pages</h6>
                {pages.map((page, idx) => (
                  <div className="glass-surface rounded-3 p-3 mb-2" key={idx}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Page {page.pageNumber}</strong>
                      {pages.length > 1 && (
                        <button type="button" className="btn btn-sm btn-outline-light" onClick={() => removePageRow(idx)}>
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      className="form-control custom-input mb-2"
                      rows={2}
                      placeholder="Page text"
                      value={page.text}
                      onChange={(e) => updatePage(idx, "text", e.target.value)}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control custom-input"
                      onChange={(e) => updatePage(idx, "file", e.target.files[0])}
                    />
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline-light mb-3" onClick={addPageRow}>
                  + Add another page
                </button>
              </>
            ) : (
              <>
                <h6 className="mt-4 mb-2">Volumes</h6>
                {volumes.map((volume, vIdx) => (
                  <div className="glass-surface rounded-3 p-3 mb-3" key={vIdx}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Volume {volume.volumeNumber}</strong>
                      {volumes.length > 1 && (
                        <button type="button" className="btn btn-sm btn-outline-light" onClick={() => removeVolume(vIdx)}>
                          Remove volume
                        </button>
                      )}
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-md-8">
                        <input
                          className="form-control custom-input"
                          placeholder="Volume title (e.g. Volume 1: The Beginning)"
                          value={volume.title}
                          onChange={(e) => updateVolume(vIdx, "title", e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control custom-input"
                          onChange={(e) => updateVolume(vIdx, "coverFile", e.target.files[0])}
                        />
                      </div>
                    </div>

                    <div className="ms-3">
                      {volume.chapters.map((chapter, cIdx) => (
                        <div className="rounded-3 p-3 mb-2" style={{ background: "rgba(255,255,255,0.04)" }} key={cIdx}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>Chapter {chapter.chapterNumber}</strong>
                            {volume.chapters.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-light"
                                onClick={() => removeChapter(vIdx, cIdx)}
                              >
                                Remove chapter
                              </button>
                            )}
                          </div>

                          <div className="row g-2 mb-2">
                            <div className="col-md-8">
                              <input
                                className="form-control custom-input"
                                placeholder="Chapter title"
                                value={chapter.title}
                                onChange={(e) => updateChapter(vIdx, cIdx, "title", e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-4">
                              <input
                                type="file"
                                accept="image/*"
                                className="form-control custom-input"
                                onChange={(e) => updateChapter(vIdx, cIdx, "coverFile", e.target.files[0])}
                              />
                            </div>
                          </div>
                          <textarea
                            className="form-control custom-input mb-2"
                            rows={2}
                            placeholder="Chapter description"
                            value={chapter.description}
                            onChange={(e) => updateChapter(vIdx, cIdx, "description", e.target.value)}
                          />

                          <div className="ms-3">
                            {chapter.pages.map((page, pIdx) => (
                              <div className="glass-surface rounded-3 p-2 mb-2" key={pIdx}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <small>Page {page.pageNumber}</small>
                                  {chapter.pages.length > 1 && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-light"
                                      onClick={() => removeChapterPage(vIdx, cIdx, pIdx)}
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <textarea
                                  className="form-control custom-input mb-2"
                                  rows={2}
                                  placeholder="Page text"
                                  value={page.text}
                                  onChange={(e) => updateChapterPage(vIdx, cIdx, pIdx, "text", e.target.value)}
                                />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="form-control custom-input"
                                  onChange={(e) => updateChapterPage(vIdx, cIdx, pIdx, "file", e.target.files[0])}
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-light mb-2"
                              onClick={() => addChapterPage(vIdx, cIdx)}
                            >
                              + Add page
                            </button>
                          </div>
                        </div>
                      ))}
                      <button type="button" className="btn btn-sm btn-outline-light mb-2" onClick={() => addChapter(vIdx)}>
                        + Add chapter
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline-light mb-3" onClick={addVolume}>
                  + Add another volume
                </button>
              </>
            )}

            <div>
              <button type="submit" className="btn btn-animated" disabled={submitting}>
                {submitting ? "Uploading & saving..." : "Create Book"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------- Existing books ---------- */}
      {activeTab === "books" && (
        <div className="glass-panel p-4">
          <h4 className="mb-3">Books ({books.length})</h4>
          <div className="table-responsive">
            <table className="table table-borderless align-middle mb-0" style={{ color: "var(--color-text)" }}>
              <thead>
                <tr style={{ color: "var(--color-text-muted)" }}>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Pages</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id}>
                    <td>{b.title}</td>
                    <td>{b.categoryName}</td>
                    <td>{b.totalPages}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteBook(b.id, b.title)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr><td colSpan={4} style={{ color: "var(--color-text-muted)" }}>No books yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="glass-panel p-4">
          <h4 className="mb-3">Add a Category</h4>
          <form onSubmit={handleCreateCategory} className="mb-4">
            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label">Name</label>
                <input
                  className="form-control custom-input"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Bedtime Stories"
                  required
                />
              </div>
              <div className="col-md-5">
                <label className="form-label">Description</label>
                <input
                  className="form-control custom-input"
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="submit" className="btn btn-animated w-100" disabled={catSubmitting}>
                  {catSubmitting ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </form>

          <h4 className="mb-3">Categories ({categories.length})</h4>
          <div className="table-responsive">
            <table className="table table-borderless align-middle mb-0" style={{ color: "var(--color-text)" }}>
              <thead>
                <tr style={{ color: "var(--color-text-muted)" }}>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Books</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td><code>{c.slug}</code></td>
                    <td>{c.bookCount}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        disabled={c.bookCount > 0}
                        title={c.bookCount > 0 ? "Move or delete its books first" : ""}
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={4} style={{ color: "var(--color-text-muted)" }}>No categories yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------- Users ---------- */}
      {activeTab === "users" && (
        <div className="glass-panel p-4">
          <h4 className="mb-3">Users ({users.length})</h4>
          <div className="table-responsive">
            <table className="table table-borderless align-middle mb-0" style={{ color: "var(--color-text)" }}>
              <thead>
                <tr style={{ color: "var(--color-text-muted)" }}>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Favorite Genre</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.favoriteGenre || "—"}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(u.id, u.email)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} style={{ color: "var(--color-text-muted)" }}>No users yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
