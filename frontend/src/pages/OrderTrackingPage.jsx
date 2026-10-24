import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Truck, Package, Search } from 'lucide-react';
import { trackOrder } from '../api/orderApi';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [searchId, setSearchId] = useState(orderId || '10024');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTracking = async (idToSearch) => {
    setLoading(true);
    setError(null);
    try {
      const data = await trackOrder(idToSearch);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please check order number.');
      setOrder(null);
    } finally {
      setLoading(false);
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

  // Status step progression
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
      time: order?.createdAt ? formatDateTime(order.createdAt) : 'Oct 6, 10:24',
      icon: Clock,
      color: '#4f46e5',
    },
    {
      key: 'Confirmed',
      title: 'Confirmed',
      time: order?.status !== 'New' ? 'Oct 6, 11:00' : 'Pending',
      icon: CheckCircle2,
      color: '#0284c7',
    },
    {
      key: 'Shipped',
      title: 'Shipped',
      time: order?.status === 'Shipped' || order?.status === 'Delivered' ? 'Oct 6, 14:30' : 'Pending',
      icon: Truck,
      color: '#2563eb',
    },
    {
      key: 'Delivered',
      title: 'Delivered',
      time: order?.status === 'Delivered' ? 'Oct 7, 11:40' : 'Estimated in 2-3 days',
      icon: Package,
      color: '#16a34a',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2.5rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '580px' }}>
        {/* Back Arrow */}
        <Link
          to="/store"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={18} /> Back to Store
        </Link>

        {/* Quick Order Number Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Enter Order # (e.g. 10024)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.4rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Track
          </button>
        </form>

        {error && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        {/* Vertical Stepper Timeline Card (Screen 7 Mockup) */}
        <div
          className="card"
          style={{
            padding: '2.5rem 2rem',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '1.5rem',
          }}
        >
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            Track Your Order
          </h1>

          {/* Stepper Timeline */}
          <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
            {/* Vertical connector line */}
            <div
              style={{
                position: 'absolute',
                left: '19px',
                top: '20px',
                bottom: '30px',
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
                  {/* Step Circle Indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-2.5rem',
                      top: '2px',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? st.color : '#e2e8f0',
                      border: isCurrent ? `3px solid #e0e7ff` : 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: isDone ? `0 0 10px ${st.color}40` : 'none',
                      transition: 'var(--transition)',
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                    )}
                  </div>

                  {/* Step Title & Timestamp */}
                  <div>
                    <h3
                      style={{
                        fontSize: '1.05rem',
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
        </div>

        {/* Order Details Preview */}
        {order && (
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Order Number:</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  #{order.orderNumber}
                </h4>
              </div>
              <span className={`status-pill status-${order.status?.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <div style={{ fontSize: '0.875rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div><strong>Recipient:</strong> {order.customerName}</div>
              <div><strong>Phone:</strong> {order.customerPhone}</div>
              <div><strong>Delivery Address:</strong> {order.shippingAddress}</div>
              <div><strong>Payment:</strong> {order.paymentMethod} (Pay upon arrival)</div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Total Payable:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4f46e5', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency(order.totalPrice)}
              </span>
            </div>
          </div>
        )}

        <p style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
          Customer apne order ka status yahan check kar sakta hai. Tracking link se bina login ke bhi dekh sakta hai.
        </p>
      </div>
    </div>
  );
}
