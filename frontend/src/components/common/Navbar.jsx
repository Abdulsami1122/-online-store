import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, LogOut, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(keyword.trim())}`);
      setKeyword('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(10, 13, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '74px',
          gap: '1.5rem',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontFamily: 'var(--font-heading)',
            fontSize: '1.45rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            }}
          >
            <ShoppingBag size={18} color="#fff" />
          </div>
          <span>AURORA</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
            fontSize: '0.95rem',
            fontWeight: 500,
          }}
          className="desktop-nav"
        >
          <Link to="/" style={{ color: 'var(--text-main)' }}>Home</Link>
          <Link to="/shop" style={{ color: 'var(--text-muted)' }}>Shop All</Link>
          <Link to="/shop?category=Electronics" style={{ color: 'var(--text-muted)' }}>Electronics</Link>
          <Link to="/shop?category=Fashion" style={{ color: 'var(--text-muted)' }}>Fashion</Link>
          <Link to="/shop?category=Audio" style={{ color: 'var(--text-muted)' }}>Audio</Link>
        </nav>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          style={{
            position: 'relative',
            maxWidth: '280px',
            width: '100%',
          }}
          className="desktop-search"
        >
          <input
            type="text"
            placeholder="Search products..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'var(--transition)',
            }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
            }}
          />
        </form>

        {/* Actions (Cart & User) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Cart Icon */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
            }}
            aria-label="View Shopping Cart"
          >
            <ShoppingBag size={20} />
            {itemsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#6366f1',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.7)',
                }}
              >
                {itemsCount}
              </span>
            )}
          </Link>

          {/* User Profile / Login */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                  alt={user.name}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <span className="user-name-label">{user.name.split(' ')[0]}</span>
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '200px',
                    backgroundColor: '#151b2c',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '0.5rem',
                    zIndex: 200,
                  }}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                    {isAdmin && (
                      <span className="badge badge-primary" style={{ marginTop: '4px' }}>
                        <Shield size={10} /> Admin
                      </span>
                    )}
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.75rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <User size={15} /> My Profile & Orders
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.75rem',
                      fontSize: '0.85rem',
                      color: 'var(--color-danger)',
                      background: 'transparent',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            aria-label="Toggle menu"
            style={{
              background: 'transparent',
              color: 'var(--text-main)',
              padding: '0.4rem',
              display: 'none',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="form-control"
            />
          </form>

          <nav style={{ display: 'flex', flexDirections: 'column', gap: '0.75rem', fontSize: '1rem' }}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
            <Link to="/shop?category=Electronics" onClick={() => setMobileMenuOpen(false)}>Electronics</Link>
            <Link to="/shop?category=Fashion" onClick={() => setMobileMenuOpen(false)}>Fashion</Link>
            <Link to="/shop?category=Audio" onClick={() => setMobileMenuOpen(false)}>Audio</Link>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav, .desktop-search {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
          .user-name-label {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
