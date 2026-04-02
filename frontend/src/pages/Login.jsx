import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdEmail, MdLock, MdSchool, MdVerified, MdAnalytics, MdSecurity } from 'react-icons/md';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-art">
        <div className="login-art-content">
          <MdSchool style={{ fontSize: 60, color: '#818cf8', marginBottom: 20 }} />
          <h1>Academic Audit<br />Management System</h1>
          <p>A comprehensive portal for managing faculty audits, marks, and academic documentation.</p>
          <div className="points">
            <div className="point">
              <div className="point-icon"><MdVerified /></div>
              <span>Track and submit audit documentation easily</span>
            </div>
            <div className="point">
              <div className="point-icon"><MdAnalytics /></div>
              <span>Enter IAT marks with auto-fetched student lists</span>
            </div>
            <div className="point">
              <div className="point-icon"><MdSecurity /></div>
              <span>Secure JWT authentication for all staff</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-form-wrapper">
          <h2>Welcome back 👋</h2>
          <p>Enter your staff credentials to access the portal</p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <MdEmail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: 18 }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  type="email"
                  name="email"
                  placeholder="staff@college.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <MdLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: 18 }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  type="password"
                  name="password"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="login-hint" style={{ marginTop: 24 }}>
            <p>Demo credentials:</p>
            <p><code>priya@college.edu</code> / <code>password123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
