import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import SellerSidebar from './SellerSidebar';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Menu } from 'lucide-react';

export default function SellerLayout() {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)', position: 'relative' }}>
      {/* Desktop Admin Sidebar */}
      <SellerSidebar />

      {/* Mobile Admin Sidebar Drawer */}
      {mobileSidebarOpen && (
        <>
          <div
            className="admin-sidebar-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <SellerSidebar
            isMobile={true}
            onClose={() => setMobileSidebarOpen(false)}
          />
        </>
      )}

      {/* Main Content Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          className="admin-header-responsive"
          style={{
            height: '68px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger Button for Mobile / Tablet */}
            <button
              type="button"
              className="admin-hamburger-btn"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={20} />
            </button>

            <span className="admin-header-title" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
              Store Management Portal
            </span>
            <span
              style={{
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Active
            </span>
          </div>

          {/* Quick User-Side Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/"
              className="btn btn-sm admin-quick-store-btn"
              style={{
                gap: '0.45rem',
                fontWeight: 700,
                backgroundColor: '#6D0E3B',
                color: '#ffffff',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(109, 14, 59, 0.2)',
                textDecoration: 'none',
              }}
            >
              <ShoppingBag size={14} /> <span>View Live Customer Store</span>
            </Link>

            {/* Admin Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.25rem' }}>
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'}
                alt="Admin Avatar"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #e2e8f0',
                }}
              />
              <div className="admin-user-info-text" style={{ fontSize: '0.85rem' }}>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  {user?.name || 'Store Administrator'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="admin-main-content" style={{ flex: 1, padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
