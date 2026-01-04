import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(credentials);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-form-section">
          <form onSubmit={handleSubmit}>
            <h1>Sign In</h1>
            <span className="form-subtitle">Use your account</span>

            {error && (
              <div className="alert-error">{error}</div>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={credentials.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="login-btn"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="login-overlay-section">
          <div className="overlay-content">
            <h1>Halo, Admin <span className="brand-text">Studioku.jogja</span></h1>
            <p>Kelola studio, booking, dan galeri dengan mudah dari sini.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;