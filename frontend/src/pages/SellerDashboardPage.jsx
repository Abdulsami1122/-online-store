import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, DollarSign, TrendingUp, ArrowRight, Eye } from 'lucide-react';
import { fetchDashboardMetrics } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalOrders: 12,
    pendingOrders: 5,
    totalSales: 24500,
    recentOrders: [],
    weeklyData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchDashboardMetrics();
        if (data) {
          setMetrics(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  return (
    <div>
      {/* Header (Screen 2 Mockup) */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
          Welcome back, {user?.name || 'Ahmad'}!
        </p>
      </div>

      {/* 3 Metric Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Orders */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
          }}
        >
          <div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Orders</p>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              {metrics.totalOrders || 12}
            </h2>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Pending Orders */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
          }}
        >
          <div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Pending Orders</p>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              {metrics.pendingOrders || 5}
            </h2>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={24} />
          </div>
        </div>

        {/* Total Sales */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
          }}
        >
          <div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Sales</p>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
              {formatCurrency(metrics.totalSales || 24500)}
            </h2>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Main Grid: Sales Overview Chart + Recent Orders Table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {/* Sales Overview Chart (Screen 2 Mockup) */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Sales Overview</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
              This Week
            </span>
          </div>

          {/* SVG Line Chart Representation matching the screenshot */}
          <div style={{ position: 'relative', width: '100%', height: '220px', paddingTop: '10px' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />

              {/* Area Fill */}
              <path
                d="M 20 130 Q 90 80, 160 120 T 300 70 T 420 40 L 480 50 L 480 180 L 20 180 Z"
                fill="url(#chartGradient)"
              />

              {/* Line Curve */}
              <path
                d="M 20 130 Q 90 80, 160 120 T 300 70 T 420 40 L 480 50"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="20" cy="130" r="4" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
              <circle cx="95" cy="85" r="4" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
              <circle cx="170" cy="115" r="4" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
              <circle cx="245" cy="95" r="4" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
              <circle cx="320" cy="65" r="4" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
              <circle cx="400" cy="45" r="4" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
              <circle cx="480" cy="50" r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* X Axis Labels */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#94a3b8',
                marginTop: '0.5rem',
                padding: '0 10px',
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

        {/* Recent Orders (Screen 2 Mockup) */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Orders</h3>
            <Link
              to="/dashboard/orders"
              style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(metrics.recentOrders && metrics.recentOrders.length > 0
              ? metrics.recentOrders
              : [
                  { orderNumber: '10024', totalPrice: 2500, status: 'New' },
                  { orderNumber: '10023', totalPrice: 4200, status: 'Confirmed' },
                  { orderNumber: '10022', totalPrice: 1850, status: 'Shipped' },
                  { orderNumber: '10021', totalPrice: 3400, status: 'Delivered' },
                ]
            ).map((order) => {
              const statusClass =
                order.status === 'New'
                  ? 'status-new'
                  : order.status === 'Confirmed'
                  ? 'status-confirmed'
                  : order.status === 'Shipped'
                  ? 'status-shipped'
                  : 'status-delivered';

              return (
                <div
                  key={order._id || order.orderNumber}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                      #{order.orderNumber}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>

                  <div>
                    <span className={`status-pill ${statusClass}`}>{order.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
        Yahan seller apni shop ka dashboard dekh sakta hai. Total orders, sales, aur recent orders yahan nazar aayenge.
      </p>
    </div>
  );
}
