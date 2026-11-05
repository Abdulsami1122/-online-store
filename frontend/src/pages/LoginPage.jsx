import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { user, login, loading, error } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin/seller
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'seller')) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email.trim(), password);
      navigate('/admin');
    } catch {
      // Error handled by AuthContext
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAF5F7',
        padding: '2rem 1.5rem',
        position: 'relative',
      }}
    >
      {/* Top Bar navigation */}
      <div style={{ width: '100%', maxWidth: '440px', marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: '#6D0E3B',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to Storefront</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 20px 45px -10px rgba(109, 14, 59, 0.15), 0 2px 10px rgba(0,0,0,0.05)',
          border: '1px solid #F0E6EA',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#FCF2F6',
              color: '#6D0E3B',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 14px rgba(109, 14, 59, 0.15)',
            }}
          >
            <ShieldCheck size={28} />
          </div>

          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#260618',
              lineHeight: 1.2,
              marginBottom: '0.4rem',
            }}
          >
            Store Admin Portal
          </h1>

          <p style={{ fontSize: '0.88rem', color: '#7E757A', margin: 0 }}>
            Enter your credentials to manage orders, products, and store settings
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              border: '1px solid #FECACA',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#332E38', display: 'block', marginBottom: '0.35rem' }}>
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@store.com"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #DCD5D8',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#332E38', display: 'block', marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #DCD5D8',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#6D0E3B',
              color: '#ffffff',
              border: 'none',
              padding: '0.85rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(109, 14, 59, 0.25)',
              marginTop: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Lock size={16} />
            <span>{loading ? 'Verifying Credentials...' : 'Sign In to Admin Portal'}</span>
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #F0E6EA', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: '#9E959B', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <Lock size={13} />
            <span>Restricted Access • Authorized Store Administrators Only</span>
          </p>
        </div>
      </div>
    </div>
  );
}
