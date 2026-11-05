import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Bot,
  Settings,
  LogOut,
  Store,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SellerSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1rem',
        position: 'sticky',
        top: 0,
      }}
    >
      <div>
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.25rem 0.5rem 1.75rem',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#6D0E3B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(109, 14, 59, 0.3)',
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

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: isActive ? '#6D0E3B' : '#475569',
                  backgroundColor: isActive ? '#FCF2F6' : 'transparent',
                  transition: 'var(--transition)',
                })}
              >
                <Icon size={18} />
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
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#6D0E3B',
            backgroundColor: '#FCF2F6',
            border: '1px solid #F3D2DF',
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
