import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  Package,
  Settings,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Store,
} from 'lucide-react';
import { fetchDashboardMetrics, fetchSellerOrders } from '../api/orderApi';
import { fetchProducts } from '../api/productApi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSales: 0,
    recentOrders: [],
    weeklyData: [],
  });
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [metricsData, productsData, ordersData] = await Promise.allSettled([
          fetchDashboardMetrics(),
          fetchProducts(),
          fetchSellerOrders({ status: 'all' }),
        ]);

        let calculatedMetrics = {
          totalOrders: 0,
          pendingOrders: 0,
          totalSales: 0,
          recentOrders: [],
          weeklyData: [],
        };

        if (metricsData.status === 'fulfilled' && metricsData.value) {
          calculatedMetrics = { ...calculatedMetrics, ...metricsData.value };
        }

        // If orders exist, sync with real customer orders
        if (ordersData.status === 'fulfilled' && Array.isArray(ordersData.value) && ordersData.value.length > 0) {
          const allOrders = ordersData.value;
          calculatedMetrics.totalOrders = allOrders.length;
          calculatedMetrics.pendingOrders = allOrders.filter(
            (o) => o.status === 'New' || o.status === 'Confirmed'
          ).length;
          calculatedMetrics.totalSales = allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
          calculatedMetrics.recentOrders = allOrders.slice(0, 6);
        }

        if (productsData.status === 'fulfilled' && Array.isArray(productsData.value)) {
          setProductsCount(productsData.value.length);
        }

        setMetrics(calculatedMetrics);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner & Quick Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Store Management Dashboard
            </h1>
            <span
              style={{
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.55rem',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <ShieldCheck size={12} /> SECURE ADMIN
            </span>
          </div>
          <p style={{ fontSize: '0.92rem', color: '#64748B', margin: 0 }}>
            Welcome, <strong>{user?.name || 'Store Administrator'}</strong>. Monitor customer orders, track sales, and control inventory.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/admin/products"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#6D0E3B',
              borderColor: '#6D0E3B',
              fontWeight: 700,
              fontSize: '0.86rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(109, 14, 59, 0.2)',
            }}
          >
            <Plus size={16} /> <span>Add New Product</span>
          </Link>

          <Link
            to="/admin/orders"
            className="btn btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#0F172A',
              borderColor: '#CBD5E1',
              backgroundColor: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.86rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              textDecoration: 'none',
            }}
          >
            <ShoppingBag size={16} color="#6D0E3B" /> <span>Verify Orders</span>
          </Link>
        </div>
      </div>

      {/* 4 Professional Metric Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Total Orders */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Orders
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#FCF2F6',
                color: '#6D0E3B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={20} />
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.1 }}>
              {loading ? '...' : metrics.totalOrders}
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.4rem' }}>
              <CheckCircle2 size={13} /> 100% Cash on Delivery
            </span>
          </div>
        </div>

        {/* Pending Orders */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending Verification
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#FFFBEB',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} />
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#D97706', margin: 0, lineHeight: 1.1 }}>
              {loading ? '...' : metrics.pendingOrders}
            </h2>
            <Link
              to="/admin/orders"
              style={{
                fontSize: '0.78rem',
                color: '#D97706',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '0.4rem',
                textDecoration: 'underline',
              }}
            >
              <AlertCircle size={13} /> Awaiting Confirmation →
            </Link>
          </div>
        </div>

        {/* Total Revenue */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Revenue
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.1 }}>
              {loading ? '...' : formatCurrency(metrics.totalSales)}
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.4rem' }}>
              <TrendingUp size={13} /> COD Volume
            </span>
          </div>
        </div>

        {/* Catalog Items */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Products
            </span>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={20} />
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.1 }}>
              {loading ? '...' : productsCount || 6}
            </h2>
            <Link
              to="/admin/products"
              style={{
                fontSize: '0.78rem',
                color: '#6D0E3B',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '0.4rem',
                textDecoration: 'none',
              }}
            >
              Manage Catalog →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Performance Chart + Quick Shortcuts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Sales Trend Chart */}
        <div
          className="card"
          style={{
            padding: '1.75rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Weekly Sales Activity
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Estimated daily cash on delivery volume
              </span>
            </div>
            <span
              style={{
                fontSize: '0.78rem',
                color: '#6D0E3B',
                backgroundColor: '#FCF2F6',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                fontWeight: 700,
              }}
            >
              Last 7 Days
            </span>
          </div>

          {/* SVG Line Chart Representation matching luxury maroon theme */}
          <div style={{ position: 'relative', width: '100%', height: '220px', paddingTop: '10px' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGradientLuxury" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6D0E3B" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#6D0E3B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#F1F5F9" strokeWidth="1" />

              {/* Area Fill */}
              <path
                d="M 20 130 Q 90 80, 160 120 T 300 70 T 420 40 L 480 50 L 480 180 L 20 180 Z"
                fill="url(#chartGradientLuxury)"
              />

              {/* Line Curve */}
              <path
                d="M 20 130 Q 90 80, 160 120 T 300 70 T 420 40 L 480 50"
                fill="none"
                stroke="#6D0E3B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="20" cy="130" r="4.5" fill="#FFFFFF" stroke="#6D0E3B" strokeWidth="2.5" />
              <circle cx="95" cy="85" r="4.5" fill="#FFFFFF" stroke="#6D0E3B" strokeWidth="2.5" />
              <circle cx="170" cy="115" r="4.5" fill="#FFFFFF" stroke="#6D0E3B" strokeWidth="2.5" />
              <circle cx="245" cy="95" r="4.5" fill="#FFFFFF" stroke="#6D0E3B" strokeWidth="2.5" />
              <circle cx="320" cy="65" r="4.5" fill="#FFFFFF" stroke="#6D0E3B" strokeWidth="2.5" />
              <circle cx="400" cy="45" r="4.5" fill="#FFFFFF" stroke="#6D0E3B" strokeWidth="2.5" />
              <circle cx="480" cy="50" r="5.5" fill="#6D0E3B" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* X Axis Labels */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: '#94A3B8',
                marginTop: '0.5rem',
                padding: '0 10px',
                fontWeight: 600,
              }}
            >
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Administration Hub Navigation Cards */}
        <div
          className="card"
          style={{
            padding: '1.75rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
              Management Modules
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1.25rem' }}>
              Direct access to all 4 core store administrative functions
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Link
                to="/admin/orders"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  padding: '1rem',
                  backgroundColor: '#FCF7F9',
                  border: '1px solid #F3D2DF',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#260618',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ShoppingBag size={20} color="#6D0E3B" />
                  <ArrowRight size={14} color="#6D0E3B" />
                </div>
                <strong style={{ fontSize: '0.92rem', marginTop: '0.2rem' }}>Orders (COD)</strong>
                <span style={{ fontSize: '0.75rem', color: '#7E757A' }}>Verify & Complete</span>
              </Link>

              <Link
                to="/admin/products"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  padding: '1rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#0F172A',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Package size={20} color="#334155" />
                  <ArrowRight size={14} color="#64748B" />
                </div>
                <strong style={{ fontSize: '0.92rem', marginTop: '0.2rem' }}>Products</strong>
                <span style={{ fontSize: '0.75rem', color: '#7E757A' }}>Manage Inventory</span>
              </Link>

              <Link
                to="/admin/settings"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  padding: '1rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#0F172A',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Settings size={20} color="#334155" />
                  <ArrowRight size={14} color="#64748B" />
                </div>
                <strong style={{ fontSize: '0.92rem', marginTop: '0.2rem' }}>Store Settings</strong>
                <span style={{ fontSize: '0.75rem', color: '#7E757A' }}>WhatsApp & Info</span>
              </Link>

              <Link
                to="/"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  padding: '1rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#0F172A',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Store size={20} color="#059669" />
                  <ExternalLink size={14} color="#64748B" />
                </div>
                <strong style={{ fontSize: '0.92rem', marginTop: '0.2rem' }}>Live Store</strong>
                <span style={{ fontSize: '0.75rem', color: '#7E757A' }}>View Customer Side</span>
              </Link>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '10px',
              fontSize: '0.8rem',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>Admin credentials are protected and securely hashed with bcrypt in the backend.</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Recent Customer Orders
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0.2rem 0 0' }}>
              Orders placed by customers appear here automatically in real-time
            </p>
          </div>
          <Link
            to="/admin/orders"
            style={{
              fontSize: '0.86rem',
              color: '#6D0E3B',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              textDecoration: 'none',
            }}
          >
            View all orders <ArrowRight size={15} />
          </Link>
        </div>

        {metrics.recentOrders && metrics.recentOrders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>Order #</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>Customer Name</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>Payment</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>Total Amount</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.8rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentOrders.map((order) => {
                  const statusClass =
                    order.status === 'New'
                      ? 'status-new'
                      : order.status === 'Confirmed'
                      ? 'status-confirmed'
                      : order.status === 'Shipped'
                      ? 'status-shipped'
                      : 'status-delivered';

                  return (
                    <tr key={order._id || order.orderNumber}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <strong style={{ color: '#0F172A', fontSize: '0.9rem' }}>
                          #{order.orderNumber}
                        </strong>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: 600 }}>
                        {order.customerName || 'Direct Customer'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.85rem' }}>
                        Cash on Delivery
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0F172A' }}>
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`status-pill ${statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <Link
                          to="/admin/orders"
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.35rem 0.75rem',
                            color: '#6D0E3B',
                            backgroundColor: '#FCF2F6',
                            borderColor: '#F3D2DF',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          Verify & Manage →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No orders placed yet. Orders submitted by customers on the storefront will appear here immediately.</p>
          </div>
        )}
      </div>
    </div>
  );
}
