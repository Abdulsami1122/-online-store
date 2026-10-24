import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, MessageCircle, Bot, Check, ArrowRight, X } from 'lucide-react';
import { fetchProducts } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import AiAssistantModal from '../components/common/AiAssistantModal';

export default function PublicStorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const { addToCart, itemsCount, totalPrice } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadStoreProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data || []);
      } catch (err) {
        console.error('Failed to load store products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStoreProducts();
  }, []);

  const handleAdd = (product) => {
    addToCart(product, 1);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1400);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Store Header (Screen 4 Mockup) */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          className="container"
          style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Store Name & Icon */}
          <Link
            to="/store"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                My Store
              </h1>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified Seller</span>
            </div>
          </Link>

          {/* Social Links & Cart Badge (Screen 4 Mockup) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Instagram Link */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Store"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#fdf2f8',
                color: '#db2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>

            {/* WhatsApp Direct Chat */}
            <a
              href="https://wa.me/923001234567?text=Hi,%20I%20want%20to%20order%20from%20your%20store"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Chat"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition)',
              }}
            >
              <MessageCircle size={20} />
            </a>

            {/* Cart Link with Badge */}
            <Link
              to="/checkout"
              style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {itemsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {itemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner (Screen 4 Mockup) */}
      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1rem' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            backgroundColor: '#1e293b',
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '3.5rem 2.5rem',
            color: '#ffffff',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ maxWidth: '600px' }}>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.2,
                marginBottom: '0.75rem',
              }}
            >
              Trendy Styles For You
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                color: '#cbd5e1',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              Quality Products • Best Prices • Fast Delivery
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid (Screen 4 Mockup) */}
      <main className="container" style={{ flex: 1, paddingBottom: '5rem' }}>
        <div style={{ margin: '1.5rem 0' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Featured Catalog</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Select items and tap Add to Cart</p>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading store catalog...</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {products.map((product) => {
              const isAdded = addedId === product._id;
              return (
                <div
                  key={product._id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'var(--transition)',
                  }}
                >
                  <div>
                    {/* Image */}
                    <div
                      style={{
                        position: 'relative',
                        paddingTop: '90%',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        marginBottom: '1rem',
                      }}
                    >
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'}
                        alt={product.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>

                    {/* Title */}
                    <h4
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '0.35rem',
                      }}
                    >
                      {product.title}
                    </h4>

                    {/* Price */}
                    <p
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#475569',
                        marginBottom: '1rem',
                      }}
                    >
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  {/* Add to Cart Button (Screen 4 Mockup) */}
                  <button
                    onClick={() => handleAdd(product)}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      fontSize: '0.9rem',
                      backgroundColor: isAdded ? '#10b981' : '#4f46e5',
                    }}
                  >
                    {isAdded ? (
                      <>
                        <Check size={16} /> Added!
                      </>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p style={{ marginTop: '3rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
          Yeh customers ki online shop hai. Is link ko WhatsApp ya Instagram par share kiya ja sakta hai.
        </p>
      </main>

      {/* Floating Sticky Cart Bar if items exist */}
      {itemsCount > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            width: '90%',
            maxWidth: '460px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {itemsCount} {itemsCount === 1 ? 'item' : 'items'} in Bag
            </span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              {formatCurrency(totalPrice)}
            </div>
          </div>

          <Link
            to="/checkout"
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.55rem 1.25rem' }}
          >
            Checkout <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Floating AI Assistant Trigger Button (Bottom Right) */}
      <button
        onClick={() => setAiModalOpen(true)}
        aria-label="Ask AI Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 60,
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          border: 'none',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 8px 25px rgba(79, 70, 229, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}
      >
        <Bot size={20} />
        <span>Ask AI Assistant</span>
      </button>

      {/* AI Assistant Modal (Screen 8) */}
      {aiModalOpen && (
        <AiAssistantModal onClose={() => setAiModalOpen(false)} />
      )}
    </div>
  );
}
