import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Store,
  ExternalLink,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SellerSidebar({ onClose, isMobile = false }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className={isMobile ? 'admin-sidebar-drawer' : 'admin-sidebar-desktop'}>
      <div>
        {/* Logo & Mobile Close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.25rem 0.5rem 1.5rem',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#5C3A21',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(92, 58, 33, 0.3)',
              }}
            >
              <Store size={19} />
            </div>
            <div>
              <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Store Admin
              </h2>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
                VERIFIED PORTAL
              </span>
            </div>
          </div>

          {isMobile && (
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer',
              }}
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => onClose?.()}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: isActive ? '#5C3A21' : '#475569',
                  backgroundColor: isActive ? '#F5EBE0' : 'transparent',
                  transition: 'var(--transition)',
                })}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link
          to="/"
          onClick={() => onClose?.()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#5C3A21',
            backgroundColor: '#F5EBE0',
            border: '1px solid #E8DEC8',
            textDecoration: 'none',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={15} /> 👁 Switch to User Store
          </span>
          <ExternalLink size={13} />
        </Link>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#ef4444',
            backgroundColor: 'transparent',
            textAlign: 'left',
          }}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
