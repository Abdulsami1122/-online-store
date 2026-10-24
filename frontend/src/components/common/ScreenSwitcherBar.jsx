import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, ChevronDown, ChevronUp, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function ScreenSwitcherBar() {
  const [collapsed, setCollapsed] = useState(false);

  const userScreens = [
    { label: '🛍️ Storefront', path: '/' },
    { label: '🛒 Cart & Checkout', path: '/checkout' },
    { label: '📍 Live Tracking (#10024)', path: '/track/10024' },
  ];

  const adminScreens = [
    { label: '📊 Admin Dashboard', path: '/admin' },
    { label: '📦 Product Catalog', path: '/admin/products' },
    { label: '📋 Orders & Confirmation', path: '/admin/orders' },
    { label: '🤖 AI Assistant', path: '/admin/ai' },
    { label: '💎 Subscription Plans', path: '/admin/settings' },
    { label: '🔐 Login / Signup', path: '/admin/login' },
  ];

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        fontSize: '0.8rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 1rem',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Layers size={15} color="#818cf8" />
          <span style={{ fontWeight: 800, color: '#f8fafc', letterSpacing: '0.02em' }}>
            AI Order Assistant — Live Navigation Switcher
          </span>
          <span
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontSize: '0.675rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            User Side & Admin Side Separated
          </span>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            fontSize: '0.75rem',
          }}
        >
          {collapsed ? (
            <>
              Show Views <ChevronDown size={14} />
            </>
          ) : (
            <>
              Hide <ChevronUp size={14} />
            </>
          )}
        </button>
      </div>

      {!collapsed && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '0.45rem 1rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {/* User Side Screens Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              User Side:
            </span>
            {userScreens.map((sc) => (
              <NavLink
                key={sc.path}
                to={sc.path}
                end={sc.path === '/'}
                style={({ isActive }) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#4f46e5' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#ffffff' : '#e2e8f0',
                  border: isActive ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                })}
              >
                {sc.label}
              </NavLink>
            ))}
          </div>

          <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

          {/* Admin Side Screens Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              Admin Side:
            </span>
            {adminScreens.map((sc) => (
              <NavLink
                key={sc.path}
                to={sc.path}
                end={sc.path === '/admin'}
                style={({ isActive }) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#059669' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#ffffff' : '#e2e8f0',
                  border: isActive ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                })}
              >
                {sc.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
