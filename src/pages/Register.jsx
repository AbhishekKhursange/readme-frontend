import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { authService } from '../api/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    favoriteGenre: 'Fiction',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container d-flex align-items-center justify-content-center min-vh-100">
      <div className="floating-icon" style={{ top: '10%', left: '10%' }}>📚</div>
      <div className="floating-icon" style={{ bottom: '15%', right: '12%', animationDelay: '2s' }}>📖</div>
      <div className="floating-icon" style={{ top: '70%', left: '8%', animationDelay: '4s' }}>✨</div>

      <div className="card auth-card shadow-lg p-4 rounded-4 text-white">
        <div className="text-center mb-4">
          <div className="mb-2" style={{ fontSize: '2.5rem', animation: 'floatIcon 3s ease-in-out infinite' }}>📚</div>
          <h2 className="fw-bold">Join Reader's Haven</h2>
          <p className="text-white-50">Unlock thousands of books & stories</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              className="form-control custom-input"
              name="fullName"
              placeholder="e.g. Jane Austen"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-control custom-input"
              name="email"
              placeholder="reader@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control custom-input"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="favoriteGenre">Favorite Genre</label>
            <select
              id="favoriteGenre"
              className="form-select custom-input"
              name="favoriteGenre"
              value={formData.favoriteGenre}
              onChange={handleChange}
            >
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Fantasy">Fantasy & Sci-Fi</option>
              <option value="Mystery">Mystery & Thriller</option>
              <option value="Romance">Romance</option>
              <option value="Biography">Biography</option>
            </select>
          </div>

          <button type="submit" className="btn w-100 py-2 rounded-3 btn-animated fw-semibold" disabled={loading}>
            {loading ? 'Creating account...' : 'Start Reading'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          Already a member? <Link to="/login" className="text-warning fw-bold">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
