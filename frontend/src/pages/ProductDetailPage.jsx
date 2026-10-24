import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Star, Check, ShieldCheck, Truck, RotateCcw, ArrowLeft, MessageSquare } from 'lucide-react';
import { fetchProductById, createReview } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import Rating from '../components/common/Rating';
import Loader from '../components/common/Loader';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductById(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setReviewSubmitting(true);
    setReviewMsg(null);
    try {
      await createReview(product._id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewMsg({ type: 'success', text: 'Thank you! Your review has been added.' });
      setReviewComment('');
      // Reload product data to show updated review
      const updated = await fetchProductById(id);
      setProduct(updated);
    } catch (err) {
      setReviewMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to submit review',
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading product details..." />;
  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>{error || 'Product not found'}</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const activePrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-dim)', marginBottom: '2rem' }}>
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-muted)' }}>{product.title}</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '3.5rem',
          alignItems: 'start',
        }}
      >
        {/* Images Gallery */}
        <div>
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: '#121829',
              border: '1px solid var(--border-color)',
              marginBottom: '1rem',
            }}
          >
            <img
              src={selectedImage || product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
              alt={product.title}
              style={{
                width: '100%',
                maxHeight: '480px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: selectedImage === img ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: '#121829',
                    padding: 0,
                  }}
                >
                  <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span className="badge badge-primary">{product.category}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Brand: {product.brand}</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem' }}>
            {product.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Rating value={product.rating || 5} numReviews={product.numReviews} />
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <span style={{ fontSize: '0.85rem', color: product.stock > 0 ? '#34d399' : '#f87171', fontWeight: 600 }}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Price Box */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'baseline',
              gap: '1rem',
            }}
          >
            <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
              {formatCurrency(activePrice)}
            </span>
            {hasDiscount && (
              <>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                  {formatCurrency(product.price)}
                </span>
                <span className="badge badge-sale">
                  Save {formatCurrency(product.price - product.discountPrice)}
                </span>
              </>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            {product.description}
          </p>

          {/* Quantity and Add to Cart */}
          {product.stock > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.2rem',
                }}
              >
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{ width: '38px', height: '38px', background: 'transparent', color: 'var(--text-main)', fontSize: '1.1rem' }}
                >
                  -
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  style={{ width: '38px', height: '38px', background: 'transparent', color: 'var(--text-main)', fontSize: '1.1rem' }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, minWidth: '200px' }}
              >
                {added ? (
                  <>
                    <Check size={20} /> Added to Bag
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} /> Add to Shopping Bag
                  </>
                )}
              </button>
            </div>
          )}

          {/* Guarantee Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
              <Truck size={18} color="var(--accent-primary)" />
              <span>Fast Tracked Shipping</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} color="#10b981" />
              <span>Official 2-Year Warranty</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
              <RotateCcw size={18} color="#f59e0b" />
              <span>30-Day Money Back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MessageSquare size={24} color="var(--accent-primary)" /> Customer Reviews ({product.reviews?.length || 0})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          {/* Review List */}
          <div>
            {!product.reviews || product.reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to share your thoughts!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {product.reviews.map((rev) => (
                  <div key={rev._id} className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rev.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{formatDate(rev.createdAt)}</span>
                    </div>
                    <Rating value={rev.rating} showText={false} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.6rem' }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review Box */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Write a Customer Review</h3>

            {reviewMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  backgroundColor: reviewMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: reviewMsg.type === 'success' ? '#34d399' : '#f87171',
                  fontSize: '0.9rem',
                }}
              >
                {reviewMsg.text}
              </div>
            )}

            {user ? (
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="form-control"
                  >
                    <option value={5}>5 Stars - Exceptional Quality</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Below Expectations</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Review</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us what you like or dislike about this product..."
                    className="form-control"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Please <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>sign in</Link> to write a review.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
