import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS = {
  admin: { label: 'Admin', color: '#e84118', bg: '#fff0ed' },
  account_manager: { label: 'Account Manager', color: '#6f42c1', bg: '#f0ebff' },
  waiter: { label: 'Waiter', color: '#17a2b8', bg: '#e8f8fb' },
  customer: { label: 'Customer', color: '#28a745', bg: '#eafaf1' },
};

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('waiter');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (isSignUp) {
        const result = register(username, password, displayName, role);
        if (result.success) {
          const userRole = result.user.role;
          if (userRole === 'waiter') {
            navigate('/pos');
          } else if (userRole === 'customer') {
            navigate('/customer-menu');
          } else {
            navigate('/');
          }
        } else {
          setError(result.error);
        }
      } else {
        const result = login(username, password);
        if (result.success) {
          const userRole = result.user.role;
          if (userRole === 'waiter') {
            navigate('/pos');
          } else if (userRole === 'customer') {
            navigate('/customer-menu');
          } else {
            navigate('/');
          }
        } else {
          setError(result.error);
        }
      }
      setLoading(false);
    }, 400);
  };

  const toggleMode = () => {
    setIsSignUp(prev => !prev);
    setError('');
    setUsername('');
    setPassword('');
    setDisplayName('');
    setRole('waiter');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      boxSizing: 'border-box',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #e84118, #c0392b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 8px 32px rgba(232,65,24,0.35)',
            fontSize: '1.8rem',
          }}>
            🍽️
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
            Neha's Kitchen
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }}>
            Restaurant Management System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1a1a2e' }}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '1.75rem' }}>
            {isSignUp ? 'Fill in your details to register' : 'Enter your credentials to continue'}
          </p>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#fff0ed', color: '#e84118',
              border: '1px solid #f5c6bc',
              borderRadius: '10px', padding: '0.75rem 1rem',
              marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 500,
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#343a40' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter your username"
                autoFocus
                style={{
                  padding: '0.8rem 1rem', borderRadius: '10px',
                  border: '1.5px solid #dee2e6',
                  fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#e84118'}
                onBlur={e => e.target.style.borderColor = '#dee2e6'}
                required
              />
            </div>

            {isSignUp && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#343a40' }}>Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => { setDisplayName(e.target.value); setError(''); }}
                  placeholder="Enter your name"
                  style={{
                    padding: '0.8rem 1rem', borderRadius: '10px',
                    border: '1.5px solid #dee2e6',
                    fontSize: '0.95rem', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#e84118'}
                  onBlur={e => e.target.style.borderColor = '#dee2e6'}
                  required
                />
              </div>
            )}

            {isSignUp && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#343a40' }}>Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  style={{
                    padding: '0.8rem 1rem', borderRadius: '10px',
                    border: '1.5px solid #dee2e6',
                    fontSize: '0.95rem', outline: 'none',
                    background: '#fff',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#e84118'}
                  onBlur={e => e.target.style.borderColor = '#dee2e6'}
                >
                  <option value="admin">Admin</option>
                  <option value="account_manager">Account Manager</option>
                  <option value="waiter">Waiter</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#343a40' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  style={{
                    width: '100%', padding: '0.8rem 2.75rem 0.8rem 1rem',
                    borderRadius: '10px', border: '1.5px solid #dee2e6',
                    fontSize: '0.95rem', outline: 'none',
                    transition: 'border-color 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#e84118'}
                  onBlur={e => e.target.style.borderColor = '#dee2e6'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#adb5bd', padding: '0.25rem',
                  }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.9rem',
                borderRadius: '12px',
                border: 'none',
                background: loading ? '#adb5bd' : 'linear-gradient(135deg, #e84118, #c0392b)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(232,65,24,0.35)',
                transition: 'all 0.2s',
              }}
            >
              <LogIn size={18} />
              {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          {/* Mode toggle */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={toggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#e84118',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          Neha's Kitchen POS v4 © 2026
        </p>
      </div>
    </div>
  );
}
