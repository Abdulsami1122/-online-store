import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orderApi';
import { formatCurrency } from '../utils/formatters';

export default function CheckoutPage() {
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState(user?.shippingAddress?.address || '123 Market Street');
  const [city, setCity] = useState(user?.shippingAddress?.city || 'New York');
  const [postalCode, setPostalCode] = useState(user?.shippingAddress?.postalCode || '10001');
  const [country, setCountry] = useState(user?.shippingAddress?.country || 'USA');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  if (cartItems.length === 0 && !orderSuccess) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) {
      setError('Please fill in all shipping fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          title: item.title,
          qty: item.qty,
          image: item.image,
          price: item.price,
        })),
        shippingAddress: { address, city, postalCode, country },
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const created = await createOrder(orderData);
      clearCart();
      setOrderSuccess(created);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // If order succeeded, show celebration screen
  if (orderSuccess) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <CheckCircle2 size={48} />
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Order #{orderSuccess._id} has been placed successfully.
        </p>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Payment method: <strong>{orderSuccess.paymentMethod}</strong> • Total amount:{' '}
          <strong>{formatCurrency(orderSuccess.totalPrice)}</strong>
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/profile" className="btn btn-primary btn-lg">
            View My Orders <ArrowRight size={18} />
          </Link>
          <Link to="/shop" className="btn btn-secondary btn-lg">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem' }}>
        Checkout & Shipping
      </h1>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Shipping Details */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--accent-primary)" /> Shipping Address
            </h2>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal / ZIP Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="form-control"
              />
            </div>

            {/* Payment Method Selector */}
            <h3 style={{ fontSize: '1.15rem', marginTop: '2rem', marginBottom: '1rem' }}>
              Select Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { id: 'Cash on Delivery', desc: 'Pay with cash upon package arrival' },
                { id: 'Credit Card / Stripe (Test)', desc: 'Instant demo credit card settlement' },
                { id: 'PayPal', desc: 'Fast digital wallet payment' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.9rem 1.25rem',
                    backgroundColor: paymentMethod === opt.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)',
                    border: paymentMethod === opt.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{opt.id}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Order Review & Submit */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem' }}>Order Review</h2>

            {/* Item list overview */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxHeight: '260px',
                overflowY: 'auto',
                marginBottom: '1.5rem',
                paddingRight: '0.5rem',
              }}
            >
              {cartItems.map((item) => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </p>
                    <p style={{ color: 'var(--text-muted)' }}>Qty: {item.qty}</p>
                  </div>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(itemsPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'FREE' : formatCurrency(shippingPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Estimated Tax</span>
                <span>{formatCurrency(taxPrice)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '0.75rem',
                }}
              >
                <span>Total Due</span>
                <span style={{ color: 'var(--text-main)' }}>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1.75rem' }}
            >
              {loading ? 'Processing Order...' : `Place Order (${formatCurrency(totalPrice)})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
