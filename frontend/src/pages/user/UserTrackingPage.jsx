import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Truck, Package, Search, RefreshCw } from 'lucide-react';
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

  const statusOrder = ['New', 'Confirmed', 'Shipped', 'Delivered'];
  const currentIdx = order ? statusOrder.indexOf(order.status) : -1;
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  const isCOD = !order?.paymentMethod || order.paymentMethod.toLowerCase().includes('cash on delivery');
  const step1Title = isCOD ? 'Order Placed (Cash on Delivery)' : `Order Placed (${order?.paymentMethod || 'Online Payment'})`;

  const findTimelineDate = (st) => {
    const item = order?.timeline?.find((t) => t.status === st);
    return item ? item.date : null;
  };

  const steps = [
    {
      step: 1,
      key: 'New',
      title: step1Title,
      done: activeIdx >= 0,
      current: activeIdx === 0,
      desc: isCOD ? 'Order received. Payment to be collected upon delivery.' : 'Order received with online payment verification.',
      time: findTimelineDate('New') || order?.createdAt,
      icon: Clock,
    },
    {
      step: 2,
      key: 'Confirmed',
      title: 'Confirmed',
      done: activeIdx >= 1,
      current: activeIdx === 1,
      desc: activeIdx >= 1 ? 'Order verified and packed by store.' : 'Waiting for store confirmation...',
      time: findTimelineDate('Confirmed'),
      icon: CheckCircle2,
    },
    {
      step: 3,
      key: 'Shipped',
      title: 'In Transit with Courier',
      done: activeIdx >= 2,
      current: activeIdx === 2,
      desc: activeIdx >= 2 ? 'Dispatched with courier for doorstep delivery.' : 'Pending courier dispatch...',
      time: findTimelineDate('Shipped'),
      icon: Truck,
    },
    {
      step: 4,
      key: 'Delivered',
      title: 'Delivered to Doorstep',
      done: activeIdx >= 3,
      current: activeIdx === 3,
      desc: activeIdx >= 3 ? 'Package successfully delivered to customer address.' : 'Estimated in 2-3 business days.',
      time: findTimelineDate('Delivered'),
      icon: Package,
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
            <div>
              {/* Horizontal Progress Bar connecting nodes 1 -> 2 -> 3 -> 4 */}
              <div style={{ marginBottom: '2rem', padding: '1rem 0.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  {steps.map((st, sIdx) => {
                    const isDone = st.done;
                    const isNextDone = steps[sIdx + 1]?.done;

                    return (
                      <div
                        key={st.step}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flex: sIdx === steps.length - 1 ? '0 0 auto' : 1,
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: isDone ? '#10b981' : '#f1f5f9',
                              border: isDone ? '2px solid #10b981' : '2px solid #cbd5e1',
                              color: isDone ? '#ffffff' : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              boxShadow: isDone ? '0 0 10px rgba(16, 185, 129, 0.35)' : 'none',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {isDone ? <CheckCircle2 size={18} /> : st.step}
                          </div>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: isDone ? 700 : 500,
                              color: isDone ? '#0f172a' : '#94a3b8',
                              marginTop: '0.4rem',
                              textAlign: 'center',
                              maxWidth: '70px',
                              lineHeight: 1.1,
                            }}
                          >
                            {st.step === 1 ? 'Placed' : st.step === 2 ? 'Confirmed' : st.step === 3 ? 'In Transit' : 'Delivered'}
                          </span>
                        </div>

                        {/* Connecting line between nodes */}
                        {sIdx < steps.length - 1 && (
                          <div
                            style={{
                              flex: 1,
                              height: '4px',
                              backgroundColor: isNextDone ? '#10b981' : '#e2e8f0',
                              margin: '0 4px',
                              marginBottom: '1.2rem',
                              borderRadius: '999px',
                              transition: 'background-color 0.4s ease',
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step-by-Step Vertical Connected Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {steps.map((st, idx) => {
                  const isDone = st.done;
                  const isNextDone = steps[idx + 1]?.done;
                  const isLast = idx === steps.length - 1;

                  return (
                    <div
                      key={st.step}
                      style={{
                        display: 'flex',
                        gap: '1.25rem',
                        position: 'relative',
                        paddingBottom: isLast ? 0 : '2rem',
                      }}
                    >
                      {/* Vertical Connector Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '32px', flexShrink: 0 }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isDone ? '#10b981' : '#f1f5f9',
                            border: isDone ? '2px solid #10b981' : '2px solid #cbd5e1',
                            color: isDone ? '#ffffff' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            zIndex: 2,
                            boxShadow: isDone ? '0 0 10px rgba(16, 185, 129, 0.35)' : 'none',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                        </div>

                        {/* Vertical line connecting to next step: Green when next step is reached! */}
                        {!isLast && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '32px',
                              bottom: 0,
                              width: '3px',
                              backgroundColor: isNextDone ? '#10b981' : '#e2e8f0',
                              zIndex: 1,
                              transition: 'background-color 0.4s ease',
                            }}
                          />
                        )}
                      </div>

                      {/* Step Details Column */}
                      <div style={{ flex: 1, paddingTop: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h3
                            style={{
                              fontSize: '0.98rem',
                              fontWeight: isDone ? 800 : 600,
                              color: isDone ? '#0f172a' : '#94a3b8',
                              lineHeight: 1.2,
                              margin: 0,
                            }}
                          >
                            {st.title}
                          </h3>
                          {st.current && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '999px',
                              }}
                            >
                              ● Current Step
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: isDone ? '#475569' : '#94a3b8', margin: '0.25rem 0 0.15rem' }}>
                          {st.desc}
                        </p>
                        {st.time && (
                          <p style={{ fontSize: '0.75rem', color: isDone ? '#64748b' : '#cbd5e1', margin: 0, fontWeight: 500 }}>
                            {typeof st.time === 'string' && st.time.includes('T') ? formatDateTime(st.time) : st.time}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
