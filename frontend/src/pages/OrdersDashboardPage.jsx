import { useState, useEffect } from 'react';
import { Search, Eye, X, CheckCircle, Clock, Truck, Package, Phone, MapPin, Check } from 'lucide-react';
import { fetchSellerOrders, updateOrderStatus } from '../api/orderApi';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function OrdersDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadOrders = async () => {
    try {
      const data = await fetchSellerOrders({
        status: statusFilter,
        search: searchTerm,
      });
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, searchTerm]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
      setActionSuccessMsg(`Order #${updated.orderNumber} status updated to "${newStatus}"! Customer tracking updated.`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      {/* Header (Screen 6 Mockup) */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
          Orders Dashboard (Admin)
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Orders placed by customers appear here in real-time. Confirm, ship or update delivery status.
        </p>
      </div>

      {actionSuccessMsg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Check size={18} /> {actionSuccessMsg}
        </div>
      )}

      {/* Filter Tabs & Search Bar (Screen 6 Mockup) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Status Pills: [All] [New] [Confirmed] [Shipped] [Delivered] */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'New', 'Confirmed', 'Shipped', 'Delivered'].map((st) => {
            const isActive = statusFilter.toLowerCase() === st.toLowerCase();
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: isActive ? '#4f46e5' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: isActive ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                  boxShadow: isActive ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'none',
                  transition: 'var(--transition)',
                }}
              >
                {st === 'all' ? 'All' : st}
              </button>
            );
          })}
        </div>

        {/* Search orders input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{
              padding: '0.55rem 1rem 0.55rem 2.3rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
            }}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
            Loading orders list...
          </p>
        ) : orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b' }}>No orders found for this filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => {
                  const statusClass =
                    ord.status === 'New'
                      ? 'status-new'
                      : ord.status === 'Confirmed'
                      ? 'status-confirmed'
                      : ord.status === 'Shipped'
                      ? 'status-shipped'
                      : 'status-delivered';

                  return (
                    <tr key={ord._id}>
                      {/* Order Number */}
                      <td>
                        <strong style={{ color: '#1e293b' }}>
                          #{ord.orderNumber}
                        </strong>
                      </td>

                      {/* Customer Info */}
                      <td>
                        <div>
                          <p style={{ fontWeight: 600, color: '#0f172a' }}>{ord.customerName}</p>
                          <span style={{ fontSize: '0.775rem', color: '#64748b' }}>
                            {ord.customerPhone}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td>
                        <strong style={{ color: '#1e293b' }}>
                          {formatCurrency(ord.totalPrice)}
                        </strong>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-pill ${statusClass}`}>
                          {ord.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ color: '#64748b' }}>
                        {formatDate(ord.createdAt)}
                      </td>

                      {/* Action: Quick Confirm & View Details */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {ord.status === 'New' && (
                            <button
                              onClick={() => handleUpdateStatus(ord._id, 'Confirmed')}
                              disabled={updating}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.775rem',
                                fontWeight: 700,
                              }}
                              title="Confirm this order"
                            >
                              ✓ Confirm
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.35rem 0.75rem',
                              color: '#4f46e5',
                              borderColor: '#c7d2fe',
                              backgroundColor: '#eef2ff',
                            }}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
        Yahan seller tamam orders dekh sakta hai. Jab aap "Confirm" par click karenge to customer tracking par live status "Confirmed" ho jayega.
      </p>

      {/* Order Detail & Status Update Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '2rem',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  Order #{selectedOrder.orderNumber}
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Placed on {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'transparent', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Status Buttons: [New] [Confirmed] [Shipped] [Delivered] */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.6rem' }}>
                Change Order Status (reflects on User Tracking):
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['New', 'Confirmed', 'Shipped', 'Delivered'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder._id, st)}
                    disabled={updating}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: selectedOrder.status === st ? '#4f46e5' : '#ffffff',
                      color: selectedOrder.status === st ? '#ffffff' : '#475569',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {selectedOrder.status === st ? `✓ ${st}` : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, width: '130px', color: '#64748b' }}>Customer:</span>
                <span style={{ fontWeight: 600 }}>{selectedOrder.customerName}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, width: '130px', color: '#64748b' }}>Phone:</span>
                <a href={`tel:${selectedOrder.customerPhone}`} style={{ color: '#4f46e5', fontWeight: 600 }}>
                  {selectedOrder.customerPhone}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, width: '130px', color: '#64748b', flexShrink: 0 }}>Address:</span>
                <span>{selectedOrder.shippingAddress}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, width: '130px', color: '#64748b' }}>Payment:</span>
                <span>{selectedOrder.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, width: '130px', color: '#64748b' }}>Tracking Link:</span>
                <a
                  href={`/track/${selectedOrder.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#4f46e5', textDecoration: 'underline', fontWeight: 600 }}
                >
                  /track/{selectedOrder.orderNumber} ↗
                </a>
              </div>
            </div>

            {/* Items List */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Items Ordered
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {selectedOrder.orderItems?.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={it.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=80'}
                      alt={it.title}
                      style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'contain', backgroundColor: '#f3f4f6' }}
                    />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{it.title}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {it.qty}</p>
                    </div>
                  </div>
                  <strong style={{ fontSize: '0.925rem' }}>
                    {formatCurrency(it.price * it.qty)}
                  </strong>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e2e8f0',
                fontSize: '1.15rem',
                fontWeight: 800,
              }}
            >
              <span>Total Amount:</span>
              <span style={{ color: '#4f46e5' }}>{formatCurrency(selectedOrder.totalPrice)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
