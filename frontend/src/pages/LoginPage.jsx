import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MessageCircle, ShoppingBag, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');

  const { user, login, register, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'seller')) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await register(name || 'Seller', email, password);
      }
      navigate('/admin');
    } catch {
      // Error handled by AuthContext
    }
  };

  const handleQuickDemoSeller = async () => {
    try {
      await login('ahmad@store.com', 'password123');
      navigate('/admin');
    } catch {
      setEmail('ahmad@store.com');
      setPassword('password123');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1050px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
        }}
      >
        {/* Left Value Props Column (Screen 1 Mockup) */}
        <div style={{ padding: '1rem' }}>
          {/* Logo */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)',
              marginBottom: '1.5rem',
            }}
          >
            <Store size={34} />
          </div>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: '0.5rem',
            }}
          >
            AI Order Assistant
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: '#6366f1',
              fontWeight: 600,
              marginBottom: '2.5rem',
            }}
          >
            Your Online Store + Smart Assistant
          </p>

          {/* 3 Key Benefits from Screenshot */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MessageCircle size={20} />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                Sell on WhatsApp & Instagram
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShoppingBag size={20} />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                Manage Orders Easily
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={20} />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                AI Answers for Your Customers
              </span>
            </div>
          </div>

          <p style={{ marginTop: '2.5rem', fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
            Yeh seller ka account banane aur login karne ka page hai. Yahan se seller apni shop manage karega.
          </p>
        </div>

        {/* Right Auth Card (Screen 1 Mockup) */}
        <div
          className="card"
          style={{
            padding: '2.5rem',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <a
              href="/"
              style={{
                fontSize: '0.825rem',
                color: '#64748b',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              ← Back to Store
            </a>
          </div>

          {/* Tabs: [Login] [Signup] */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: 'var(--radius-md)',
              padding: '0.3rem',
              marginBottom: '2rem',
            }}
          >
            <button
              onClick={() => setIsLoginTab(true)}
              style={{
                flex: 1,
                padding: '0.65rem 0',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.925rem',
                backgroundColor: isLoginTab ? '#ffffff' : 'transparent',
                color: isLoginTab ? '#4f46e5' : '#64748b',
                boxShadow: isLoginTab ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition)',
              }}
            >
              Login
            </button>
            <button
              onClick={() => setIsLoginTab(false)}
              style={{
                flex: 1,
                padding: '0.65rem 0',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.925rem',
                backgroundColor: !isLoginTab ? '#ffffff' : 'transparent',
                color: !isLoginTab ? '#4f46e5' : '#64748b',
                boxShadow: !isLoginTab ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition)',
              }}
            >
              Signup
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                border: '1px solid #fecaca',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLoginTab && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLoginTab}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Store Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Trendy Styles"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="form-control"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Please wait...' : isLoginTab ? 'Login' : 'Create Store Account'}
            </button>
          </form>

          {/* Social login buttons */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Or continue with</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={handleQuickDemoSeller}
                className="btn btn-secondary btn-sm"
              >
                Google
              </button>
              <button
                type="button"
                onClick={handleQuickDemoSeller}
                className="btn btn-secondary btn-sm"
              >
                Facebook
              </button>
            </div>
          </div>

          {/* 1-Click Demo Login Button */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button
              type="button"
              onClick={handleQuickDemoSeller}
              className="btn btn-outline"
              style={{
                width: '100%',
                padding: '0.65rem',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={16} /> ⚡ 1-Click Login as Seller Ahmad
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {isLoginTab ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={() => setIsLoginTab(!isLoginTab)}
              style={{
                background: 'transparent',
                color: '#4f46e5',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {isLoginTab ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
