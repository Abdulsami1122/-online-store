import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { fetchFeaturedProducts, fetchCategories } from '../api/productApi';
import ProductCard from '../components/common/ProductCard';
import Loader from '../components/common/Loader';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          fetchFeaturedProducts(),
          fetchCategories(),
        ]);
        setFeaturedProducts(prodData || []);
        setCategories(catData || []);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          padding: '3rem 0 5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.9rem',
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 'var(--radius-full)',
                  color: '#818cf8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '1.5rem',
                }}
              >
                <Sparkles size={14} /> New Season Drops Just Arrived
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginBottom: '1.25rem',
                }}
              >
                Next-Generation Gear for the{' '}
                <span
                  style={{
                    background: 'var(--accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Modern Creator
                </span>
              </h1>

              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                  maxWidth: '520px',
                }}
              >
                Immerse yourself in precision audio, aesthetic tech essentials, and curated designer pieces engineered for elevated daily living.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <Link to="/shop" className="btn btn-primary btn-lg">
                  Shop Collection <ArrowRight size={18} />
                </Link>
                <Link to="/shop?category=Electronics" className="btn btn-secondary btn-lg">
                  Explore Gadgets
                </Link>
              </div>

              {/* Quick metrics */}
              <div
                style={{
                  display: 'flex',
                  gap: '2.5rem',
                  marginTop: '3rem',
                  paddingTop: '2rem',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>45K+</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Delivered Orders</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>4.9/5</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer Rating</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>100%</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Authentic Gear</p>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                  alt="Aura Studio Headphones"
                  style={{
                    width: '100%',
                    height: '460px',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '1.5rem',
                    background: 'linear-gradient(to top, rgba(10, 13, 20, 0.95), transparent)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Editor's Choice</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Aura Studio Wireless</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Spatial Acoustic Drivers</p>
                  </div>
                  <Link to="/shop" className="btn btn-primary btn-sm">
                    View <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      {categories.length > 0 && (
        <section style={{ padding: '3rem 0', backgroundColor: 'rgba(16, 21, 34, 0.5)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Curated Categories</h2>
              <p style={{ color: 'var(--text-muted)' }}>Browse specialized gear tailored for your lifestyle</p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '1.75rem',
                    borderRadius: 'var(--radius-lg)',
                    textDecoration: 'none',
                  }}
                >
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300'}
                    alt={cat.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '1rem',
                      border: '2px solid rgba(99, 102, 241, 0.3)',
                    }}
                  />
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cat.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <Zap size={15} /> Top Rated Collection
              </div>
              <h2 style={{ fontSize: '2.2rem' }}>Trending & Featured</h2>
            </div>
            <Link to="/shop" className="btn btn-outline btn-sm">
              View All Products <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <Loader text="Loading featured catalog..." />
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
