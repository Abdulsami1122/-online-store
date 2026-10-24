import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#070a10',
        borderTop: '1px solid var(--border-color)',
        marginTop: '4rem',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
      }}
    >
      <div className="container">
        {/* Perks Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            paddingBottom: '3rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '3rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Free Express Shipping</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>On orders above $150</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Secure Checkout</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>256-bit SSL encrypted</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>30-Day Guarantee</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hassle-free return policy</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
              <Headphones size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>24/7 Dedicated Support</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instant assistance always</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand Intro */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBag size={16} color="#fff" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>AURORA</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Curated lifestyle goods, high-performance electronics, and modern essentials crafted with meticulous attention to detail.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Shop Categories</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <li><Link to="/shop?category=Electronics">Electronics & Gadgets</Link></li>
              <li><Link to="/shop?category=Audio">High-Fidelity Audio</Link></li>
              <li><Link to="/shop?category=Fashion">Modern Lifestyle & Fashion</Link></li>
              <li><Link to="/shop?category=Home%20%26%20Living">Home & Minimalist Living</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Customer Care</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <li><Link to="/cart">View Shopping Bag</Link></li>
              <li><Link to="/profile">Track Your Order</Link></li>
              <li><a href="#shipping">Shipping & Returns</a></li>
              <li><a href="#privacy">Privacy & Security</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Join the Circle</h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Receive 10% off your first order plus secret drop alerts.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="Enter email address"
                className="form-control"
                style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
              />
              <button className="btn btn-primary btn-sm" aria-label="Subscribe">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.825rem',
            color: 'var(--text-dim)',
          }}
        >
          <p>© {new Date().getFullYear()} AURORA Online Store. Built with React & Node.js.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>MongoDB Atlas</span>
            <span>Express.js API</span>
            <span>Vite React</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
