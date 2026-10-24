import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export default function CartPage() {
  const {
    cartItems,
    itemsCount,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    updateQty,
    removeFromCart,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <ShoppingBag size={38} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Your shopping bag is empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Explore our trending collection and add items you love.
        </p>
        <Link to="/shop" className="btn btn-primary btn-lg">
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Shopping Bag ({itemsCount} {itemsCount === 1 ? 'item' : 'items'})
        </h1>
        <button
          onClick={clearCart}
          style={{ background: 'transparent', color: 'var(--text-dim)', fontSize: '0.85rem', textDecoration: 'underline' }}
        >
          Clear Bag
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.25rem',
              }}
            >
              {/* Product Thumbnail */}
              <Link
                to={`/product/${item._id}`}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#151b2c',
                }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Link>

              {/* Item Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/product/${item._id}`}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: '0.25rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </h3>
                </Link>

                <p style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {formatCurrency(item.price)}
                </p>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <button
                      onClick={() => updateQty(item._id, item.qty - 1)}
                      style={{ width: '30px', height: '30px', background: 'transparent', color: 'var(--text-main)' }}
                    >
                      -
                    </button>
                    <span style={{ width: '32px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item._id, item.qty + 1)}
                      style={{ width: '30px', height: '30px', background: 'transparent', color: 'var(--text-main)' }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    style={{
                      background: 'transparent',
                      color: 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.8rem',
                    }}
                    aria-label="Remove item"
                  >
                    <Trash2 size={15} color="#ef4444" />
                  </button>
                </div>
              </div>

              {/* Item Line Total */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  {formatCurrency(item.price * item.qty)}
                </span>
              </div>
            </div>
          ))}

          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              marginTop: '1rem',
            }}
          >
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {/* Order Summary Card */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '1.5rem' }}>Order Summary</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(itemsPrice)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Shipping</span>
              <span>
                {shippingPrice === 0 ? (
                  <span style={{ color: '#34d399', fontWeight: 600 }}>FREE</span>
                ) : (
                  formatCurrency(shippingPrice)
                )}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Sales Tax (8%)</span>
              <span>{formatCurrency(taxPrice)}</span>
            </div>

            {shippingPrice > 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem', borderRadius: '6px' }}>
                💡 Add {formatCurrency(150 - itemsPrice)} more to qualify for Free Express Shipping!
              </p>
            )}

            <div
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontWeight: 800,
              }}
            >
              <span>Total</span>
              <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.75rem' }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
