import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ArrowLeft, CheckCircle2, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orderApi';
import { formatCurrency } from '../utils/formatters';

export default function OrderPlacementPage() {
  const { cartItems, itemsPrice, updateQty, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If no items in cart, allow adding sample T-Shirt for fast demonstration
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !shippingAddress) {
      setError('Please enter your full name, phone number, and address');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty. Please add items from the store.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        customerName,
        customerPhone,
        shippingAddress,
        paymentMethod,
        orderItems: cartItems.map((item) => ({
          product: item._id,
          title: item.title,
          qty: item.qty,
          price: item.price,
          image: item.image,
        })),
        deliveryCharges: 200,
      };

      const created = await createOrder(orderPayload);
      clearCart();
      // Redirect to Screen 7: Order Tracking
      navigate(`/track/${created.orderNumber || created._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2.5rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Back Link */}
        <Link
          to="/store"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#64748b',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to Store
        </Link>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '2rem' }}>
          Order Placement
        </h1>

        {error && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Your Cart (Screen 5 Mockup) */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Your Cart
            </h2>

            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <ShoppingBag size={40} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>Your cart is empty.</p>
                <Link to="/store" className="btn btn-outline btn-sm">
                  Go to Store
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid #f1f5f9',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid #e2e8f0',
                        }}
                      />
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.title}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Modifier [-] 1 [+] (Screen 5 Mockup) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '6px',
                          padding: '0.15rem',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQty(item._id, item.qty - 1)}
                          style={{
                            width: '26px',
                            height: '26px',
                            background: 'transparent',
                            color: '#475569',
                            fontWeight: 700,
                          }}
                        >
                          -
                        </button>
                        <span style={{ width: '28px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item._id, item.qty + 1)}
                          style={{
                            width: '26px',
                            height: '26px',
                            background: 'transparent',
                            color: '#475569',
                            fontWeight: 700,
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        style={{ background: 'transparent', color: '#94a3b8', padding: '0.2rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Total (Screen 5 Mockup) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    Total
                  </span>
                  <span
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {formatCurrency(itemsPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Shipping Details (Screen 5 Mockup) */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              Shipping Details
            </h2>

            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number (e.g. 0300 1234567)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  rows={3}
                  placeholder="Enter full address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              {/* Payment Method: Cash on Delivery (Screen 5 Mockup) */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1.75rem' }}>
                <label className="form-label">Payment Method</label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span style={{ fontSize: '0.925rem', fontWeight: 600, color: '#312e81' }}>
                    Cash on Delivery
                  </span>
                </label>
              </div>

              {/* Place Order Button (Screen 5 Mockup) */}
              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '1.05rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {loading ? 'Submitting Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>

        <p style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
          Customer product select karke order karega. Naam, phone aur address dena hoga.
        </p>
      </div>
    </div>
  );
}
