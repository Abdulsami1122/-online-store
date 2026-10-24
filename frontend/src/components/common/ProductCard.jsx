import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';
import Rating from './Rating';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        transition: 'var(--transition)',
        position: 'relative',
      }}
      className="product-card"
    >
      {/* Badges */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2,
          display: 'flex',
          gap: '6px',
        }}
      >
        {hasDiscount && (
          <span className="badge badge-sale">-{discountPercent}%</span>
        )}
        {product.isFeatured && (
          <span className="badge badge-primary">Featured</span>
        )}
      </div>

      {/* Image container */}
      <Link
        to={`/product/${product._id}`}
        style={{
          display: 'block',
          position: 'relative',
          paddingTop: '75%',
          overflow: 'hidden',
          backgroundColor: '#121829',
        }}
      >
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'}
          alt={product.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          className="product-image"
        />
      </Link>

      {/* Product info */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--accent-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
              marginBottom: '0.25rem',
            }}
          >
            {product.category}
          </div>
          <Link to={`/product/${product._id}`}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.8rem',
              }}
            >
              {product.title}
            </h3>
          </Link>
        </div>

        <div>
          <Rating value={product.rating || 4.5} numReviews={product.numReviews} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {formatCurrency(displayPrice)}
              </span>
              {hasDiscount && (
                <span
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-dim)',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            <button
              onClick={handleAdd}
              aria-label="Add to cart"
              className="btn btn-sm"
              style={{
                background: added ? 'var(--color-success)' : 'rgba(99, 102, 241, 0.15)',
                color: added ? '#fff' : '#818cf8',
                border: added ? '1px solid var(--color-success)' : '1px solid rgba(99, 102, 241, 0.3)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {added ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .product-card:hover {
          transform: translateY(-5px);
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
        }
        .product-card:hover .product-image {
          transform: scale(1.06);
        }
      `}</style>
    </div>
  );
}
