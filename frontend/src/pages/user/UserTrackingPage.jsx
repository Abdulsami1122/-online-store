import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Truck, Package, Search, RefreshCw, ShieldCheck } from 'lucide-react';
import { trackOrder } from '../../api/orderApi';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export default function UserTrackingPage() {
  const { orderId } = useParams();
  const [searchId, setSearchId] = useState(orderId || '10024');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTracking = async (idToSearch, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await trackOrder(idToSearch);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please check order number.');
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      setSearchId(orderId);
      fetchTracking(orderId);
    } else {
      fetchTracking('10024');
    }
  }, [orderId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchTracking(searchId.trim());
    }
  };

  // Status progression mapping
  const getStepState = (stepName) => {
    if (!order) return { completed: false, active: false };
    const statusOrder = ['New', 'Confirmed', 'Shipped', 'Delivered'];
    const currentIdx = statusOrder.indexOf(order.status);
    const stepIdx = statusOrder.indexOf(stepName);

    return {
      completed: currentIdx >= stepIdx,
      active: currentIdx === stepIdx,
    };
  };

  const steps = [
    {
      key: 'New',
      title: 'Order Placed',
      time: order?.createdAt ? formatDateTime(order.createdAt) : 'Pending',
      icon: Clock,
      color: '#4f46e5',
    },
    {
      key: 'Confirmed',
      title: 'Confirmed by Seller',
      time: order?.status !== 'New' ? 'Order confirmed by store' : 'Waiting for seller confirmation...',
      icon: CheckCircle2,
      color: '#0284c7',
    },
    {
      key: 'Shipped',
      title: 'Shipped (In Transit)',
      time: order?.status === 'Shipped' || order?.status === 'Delivered' ? 'Dispatched via Courier' : 'Pending dispatch',
      icon: Truck,
      color: '#2563eb',
    },
    {
      key: 'Delivered',
      title: 'Delivered',
      time: order?.status === 'Delivered' ? 'Parcel delivered successfully' : 'Estimated in 2-4 days',
      icon: Package,
      color: '#16a34a',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1.25rem 5rem' }}>
      <div className="container" style={{ maxWidth: '620px' }}>
        {/* Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#64748b',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to Store
          </Link>

          <Link
            to="/admin/orders"
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#4f46e5',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #c7d2fe',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <ShieldCheck size={13} /> Admin Orders View →
          </Link>
        </div>

        {/* Search Order Number Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Enter Order # (e.g. 10024)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.4rem', backgroundColor: '#ffffff' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 1.25rem' }}>
            Track
          </button>
        </form>

        {error && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '12px',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        {/* Stepper Timeline Card (Screen 7 Mockup) */}
        <div
          className="card"
          style={{
            padding: '2.5rem 2rem',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
            marginBottom: '1.5rem',
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Track Your Order
            </h1>

            {order && (
              <button
                onClick={() => fetchTracking(order.orderNumber, true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#4f46e5',
                  background: '#eef2ff',
                  border: 'none',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                }}
              >
                <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
                Refresh
              </button>
            )}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              Fetching live order tracking...
            </p>
          ) : order ? (
            <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
              {/* Vertical connector line */}
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '18px',
                  bottom: '24px',
                  width: '3px',
                  backgroundColor: '#e2e8f0',
                  zIndex: 1,
                }}
              />

              {steps.map((st, idx) => {
                const state = getStepState(st.key);
                const isDone = state.completed;
                const isCurrent = state.active;

                return (
                  <div
                    key={st.key}
                    style={{
                      position: 'relative',
                      marginBottom: idx === steps.length - 1 ? 0 : '2.25rem',
                    }}
                  >
                    {/* Circle badge */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-2.5rem',
                        top: '2px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? st.color : '#e2e8f0',
                        border: isCurrent ? '3px solid #e0e7ff' : 'none',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        boxShadow: isDone ? `0 0 10px ${st.color}40` : 'none',
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 size={15} />
                      ) : (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                      )}
                    </div>

                    {/* Title & Time */}
                    <div>
                      <h3
                        style={{
                          fontSize: '1rem',
                          fontWeight: isDone ? 700 : 500,
                          color: isDone ? '#0f172a' : '#94a3b8',
                          lineHeight: 1.2,
                          marginBottom: '0.2rem',
                        }}
                      >
                        {st.title}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: isDone ? '#64748b' : '#cbd5e1' }}>
                        {st.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Order Details Preview */}
        {order && (
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Order Number</span>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  #{order.orderNumber}
                </h4>
              </div>

              <span
                className={`status-pill status-${order.status?.toLowerCase()}`}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
              >
                {order.status}
              </span>
            </div>

            <div style={{ fontSize: '0.875rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div><strong>Recipient:</strong> {order.customerName}</div>
              <div><strong>Phone:</strong> {order.customerPhone}</div>
              <div><strong>Delivery Address:</strong> {order.shippingAddress}</div>
              <div><strong>Payment Method:</strong> {order.paymentMethod}</div>
            </div>

            {/* Items */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem' }}>
                Items Ordered:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {order.orderItems?.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img
                        src={it.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=80'}
                        alt={it.title}
                        style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'contain', backgroundColor: '#f3f4f6' }}
                      />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {it.title} × {it.qty}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                      {formatCurrency(it.price * it.qty)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Total Amount:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency(order.totalPrice)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
