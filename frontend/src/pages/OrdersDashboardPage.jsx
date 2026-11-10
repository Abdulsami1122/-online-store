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
  const [proofModalUrl, setProofModalUrl] = useState(null);

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

  const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(orderId, { paymentStatus: newPaymentStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
      setActionSuccessMsg(`Order #${updated.orderNumber} payment marked as "${newPaymentStatus}"!`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
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
                  backgroundColor: isActive ? '#6D0E3B' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: isActive ? '1px solid #6D0E3B' : '1px solid #e2e8f0',
                  boxShadow: isActive ? '0 2px 6px rgba(109, 14, 59, 0.25)' : 'none',
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
                  <th>Payment</th>
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

                  const isOnline = ord.paymentMethod && ord.paymentMethod !== 'Cash on Delivery';

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

                      {/* Payment Method & Proof */}
                      <td>
                        <div>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor:
                                ord.paymentMethod === 'EasyPaisa'
                                  ? '#ecfdf5'
                                  : ord.paymentMethod === 'JazzCash'
                                  ? '#fef2f2'
                                  : ord.paymentMethod === 'Online Bank Transfer'
                                  ? '#eff6ff'
                                  : '#f1f5f9',
                              color:
                                ord.paymentMethod === 'EasyPaisa'
                                  ? '#047857'
                                  : ord.paymentMethod === 'JazzCash'
                                  ? '#b91c1c'
                                  : ord.paymentMethod === 'Online Bank Transfer'
                                  ? '#1d4ed8'
                                  : '#475569',
                            }}
                          >
                            {ord.paymentMethod === 'EasyPaisa' && '🟢'}
                            {ord.paymentMethod === 'JazzCash' && '🔴'}
                            {ord.paymentMethod === 'Online Bank Transfer' && '🏦'}
                            {!isOnline && '💵'}
                            {ord.paymentMethod || 'COD'}
                          </span>

                          {isOnline && (
                            <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {ord.paymentStatus === 'Verified' ? (
                                <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>
                                  ✓ Verified
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 700 }}>
                                  ⏳ Verify Needed
                                </span>
                              )}
                              {ord.paymentProof && (
                                <button
                                  type="button"
                                  onClick={() => setProofModalUrl(ord.paymentProof)}
                                  style={{
                                    background: '#f8fafc',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    padding: '0.1rem 0.35rem',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: '#2563eb',
                                    cursor: 'pointer',
                                  }}
                                  title="Click to view customer payment slip"
                                >
                                  📎 Slip
                                </button>
                              )}
                            </div>
                          )}
                        </div>
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

                      {/* Action: Quick Confirm, Ship, Complete & View Details */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
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
                                border: 'none',
                                borderRadius: '6px',
                              }}
                              title="Verify and confirm order"
                            >
                              ✓ Confirm
                            </button>
                          )}
                          {ord.status === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(ord._id, 'Shipped')}
                              disabled={updating}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.775rem',
                                fontWeight: 700,
                                border: 'none',
                                borderRadius: '6px',
                              }}
                              title="Dispatch order with courier"
                            >
                              🚚 Ship
                            </button>
                          )}
                          {ord.status === 'Shipped' && (
                            <button
                              onClick={() => handleUpdateStatus(ord._id, 'Delivered')}
                              disabled={updating}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: '#059669',
                                color: '#ffffff',
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.775rem',
                                fontWeight: 700,
                                border: 'none',
                                borderRadius: '6px',
                              }}
                              title="Mark order as delivered & completed"
                            >
                              ✓ Complete
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.35rem 0.75rem',
                              color: '#6D0E3B',
                              borderColor: '#F3D2DF',
                              backgroundColor: '#FCF2F6',
                              borderRadius: '6px',
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

      <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
          💡 <strong>Order Management:</strong> All customer Cash on Delivery orders appear here in real-time. Verify customer phone numbers, update status to Confirmed, Shipped, or Delivered.
        </p>
      </div>

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
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
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
                      backgroundColor: selectedOrder.status === st ? '#6D0E3B' : '#ffffff',
                      color: selectedOrder.status === st ? '#ffffff' : '#475569',
                      border: selectedOrder.status === st ? '1px solid #6D0E3B' : '1px solid #cbd5e1',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, width: '130px', color: '#64748b' }}>Phone / Contact:</span>
                <a href={`tel:${selectedOrder.customerPhone}`} style={{ color: '#6D0E3B', fontWeight: 600 }}>
                  {selectedOrder.customerPhone}
                </a>
                <a
                  href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedOrder.customerName}, this is regarding your order #${selectedOrder.orderNumber} for Rs. ${selectedOrder.totalPrice}. Please confirm your shipping address: ${selectedOrder.shippingAddress}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    marginLeft: '0.5rem',
                  }}
                >
                  💬 Verify on WhatsApp
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, width: '130px', color: '#64748b', flexShrink: 0 }}>Address:</span>
                <span>{selectedOrder.shippingAddress}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, width: '130px', color: '#64748b' }}>Tracking Link:</span>
                <a
                  href={`/track/${selectedOrder.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#6D0E3B', textDecoration: 'underline', fontWeight: 600 }}
                >
                  /track/{selectedOrder.orderNumber} ↗
                </a>
              </div>
            </div>

            {/* Dedicated Payment Verification Card */}
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor:
                  selectedOrder.paymentMethod === 'Cash on Delivery'
                    ? '#f8fafc'
                    : selectedOrder.paymentStatus === 'Verified'
                    ? '#f0fdf4'
                    : '#fffbeb',
                borderRadius: '12px',
                border: `1.5px solid ${
                  selectedOrder.paymentMethod === 'Cash on Delivery'
                    ? '#E2E8F0'
                    : selectedOrder.paymentStatus === 'Verified'
                    ? '#86efac'
                    : '#fde68a'
                }`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                  💳 Payment Information & Verification
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    backgroundColor:
                      selectedOrder.paymentStatus === 'Verified'
                        ? '#dcfce7'
                        : selectedOrder.paymentStatus === 'Pending Verification'
                        ? '#fef3c7'
                        : '#f1f5f9',
                    color:
                      selectedOrder.paymentStatus === 'Verified'
                        ? '#15803d'
                        : selectedOrder.paymentStatus === 'Pending Verification'
                        ? '#b45309'
                        : '#475569',
                  }}
                >
                  {selectedOrder.paymentStatus || (selectedOrder.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Pending')}
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Payment Method: </span>
                  <strong>{selectedOrder.paymentMethod || 'Cash on Delivery'}</strong>
                </div>

                {selectedOrder.accountDetailsUsed && (
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Destination Account: </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                      {selectedOrder.accountDetailsUsed}
                    </span>
                  </div>
                )}

                {/* Customer Uploaded Proof Screenshot */}
                {selectedOrder.paymentProof && (
                  <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px dashed #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                        Customer Submitted Payment Screenshot:
                      </span>
                      <button
                        type="button"
                        onClick={() => setProofModalUrl(selectedOrder.paymentProof)}
                        style={{
                          fontSize: '0.75rem',
                          color: '#2563eb',
                          fontWeight: 700,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        Enlarge Screenshot ↗
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <img
                        src={selectedOrder.paymentProof}
                        alt="Customer Payment Screenshot"
                        onClick={() => setProofModalUrl(selectedOrder.paymentProof)}
                        style={{
                          width: '96px',
                          height: '96px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                        }}
                        title="Click to view full screenshot"
                      />
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                          Customer uploaded this payment receipt during checkout.
                        </p>
                        {selectedOrder.paymentStatus !== 'Verified' ? (
                          <button
                            type="button"
                            onClick={() => handleUpdatePaymentStatus(selectedOrder._id, 'Verified')}
                            disabled={updating}
                            className="btn btn-sm"
                            style={{
                              marginTop: '0.45rem',
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              padding: '0.35rem 0.8rem',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            ✓ Mark Payment as Verified
                          </button>
                        ) : (
                          <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontWeight: 700, fontSize: '0.82rem' }}>
                            <Check size={16} /> Payment Verified & Approved
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
              <span style={{ color: '#6D0E3B' }}>{formatCurrency(selectedOrder.totalPrice)}</span>
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

      {/* FULL-SIZE PAYMENT PROOF RECEIPT MODAL */}
      {proofModalUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1.5rem',
          }}
          onClick={() => setProofModalUrl(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Customer Payment Proof Receipt
              </h3>
              <button
                onClick={() => setProofModalUrl(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', textAlign: 'center', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <img
                src={proofModalUrl}
                alt="Full Payment Proof"
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <a
                href={proofModalUrl}
                download="payment-proof.png"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                ⬇ Download Slip
              </a>
              <button
                onClick={() => setProofModalUrl(null)}
                className="btn btn-primary btn-sm"
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
