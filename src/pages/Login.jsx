import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import { authService } from '../api/authService';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const { token, refreshToken, user } = await authService.login(formData);
      localStorage.setItem('ReadMe_token', token);
      localStorage.setItem('ReadMe_refresh_token', refreshToken);
      localStorage.setItem('ReadMe_user', JSON.stringify(user));
      window.dispatchEvent(new Event('ReadMe-auth-changed'));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container d-flex align-items-center justify-content-center min-vh-100">
      <div className="floating-icon" style={{ top: '12%', right: '10%' }}>📖</div>
      <div className="floating-icon" style={{ bottom: '12%', left: '10%', animationDelay: '2s' }}>📚</div>
      <div className="floating-icon" style={{ top: '65%', right: '8%', animationDelay: '4s' }}>✨</div>

      <div className="card auth-card shadow-lg p-4 rounded-4 text-white">
        <div className="text-center mb-4">
          <div className="mb-2" style={{ fontSize: '2.5rem', animation: 'floatIcon 3s ease-in-out infinite' }}>📖</div>
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-white-50">Pick up right where you left off</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className="mb-4">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control custom-input"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn w-100 py-2 rounded-3 btn-animated fw-semibold" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 mb-0">
          New here? <Link to="/register" className="text-warning fw-bold">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
