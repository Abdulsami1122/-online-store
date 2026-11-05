import { Outlet, Link } from 'react-router-dom';
import SellerSidebar from './SellerSidebar';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Eye, ShieldCheck } from 'lucide-react';

export default function SellerLayout() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Admin Sidebar */}
      <SellerSidebar />

      {/* Main Content Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
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
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
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
              }}
            >
              Active
            </span>
          </div>

          {/* Quick User-Side Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/"
              className="btn btn-sm"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.5rem' }}>
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
              <div style={{ fontSize: '0.85rem' }}>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  {user?.name || 'Store Administrator'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main style={{ flex: 1, padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
