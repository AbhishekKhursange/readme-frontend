import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./styles/flipbook.css";
import NightSky from "./components/NightSky";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import BookDetails from "./pages/BookDetails";
import BookReader from "./pages/BookReader";
import VolumeDetails from "./pages/VolumeDetails";
import ChapterDetails from "./pages/ChapterDetails";
import ChapterReader from "./pages/ChapterReader";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import RequireAdmin from "./components/RequireAdmin";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import TermsGate from "./components/TermsGate";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <NightSky />
        <TermsGate />
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/book/:bookSlug" element={<BookDetails />} />
            <Route path="/read/:bookSlug" element={<BookReader />} />
            <Route path="/volume/:volumeSlug" element={<VolumeDetails />} />
            <Route path="/chapter/:chapterSlug" element={<ChapterDetails />} />
            <Route path="/read-chapter/:chapterSlug" element={<ChapterReader />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </HelmetProvider>
  );
}
