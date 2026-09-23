# ReadMe — Frontend

React (Vite) frontend for the ReadMe books reading website: browse
illustrated books by category, read them with a page-flip animation, and
(if logged in as admin) manage books and users.

## Stack

React 18 · Vite · React Router · Bootstrap 5 · `react-pageflip` · Axios

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and point it at your backend:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

Run it:
```bash
npm run dev
```
Opens at `http://localhost:5173`.

## Folder structure

```
src/
├── api/          # axios client + service calls (books, auth, admin, upload)
├── components/   # Navbar, BookCard, PageFlipViewer, RequireAdmin, etc.
├── pages/        # Home, CategoryPage, BookDetails, BookReader, Login,
│                 # Register, AdminDashboard, NotFound
└── styles/       # global animated theme, Auth.css, flipbook.css
```

## Auth

Login stores three things in `localStorage`:
- `ReadMe_token` — short/long-lived JWT access token, sent as
  `Authorization: Bearer <token>` on every request (see `api/axiosConfig.js`)
- `ReadMe_refresh_token` — opaque token used to silently mint a new
  access token when one expires (handled automatically by an axios response
  interceptor — you won't see a login screen mid-session because of this)
- `ReadMe_user` — the logged-in user's profile, including `admin: true/false`

`/admin` is guarded client-side by `components/RequireAdmin.jsx`, which
redirects non-admins to `/login`. This is just UX — the real enforcement is
on the backend (`SecurityConfig.java`), which rejects non-admin requests
regardless of what the frontend does.

## Backend

This frontend expects the Spring Boot backend (separate project) running at
the URL in `VITE_API_BASE_URL`. See that project's own README for setup
(Neon Postgres, Cloudinary, Redis, JWT secret, etc.).
