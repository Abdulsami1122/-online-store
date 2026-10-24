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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Public User Store Link:
            </span>
            <Link
              to="/"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
              }}
            >
              mystore.shop/ahmad <Eye size={13} />
            </Link>
          </div>

          {/* Quick User-Side Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/"
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.4rem', fontWeight: 700 }}
            >
              <ShoppingBag size={14} color="#4f46e5" /> Open User Storefront
            </Link>
            <Link to="/track" className="btn btn-secondary btn-sm">
              User Order Tracking
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
                  {user?.name || 'Ahmad'}
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
