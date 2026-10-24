import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ShoppingBag,
  Bot,
  Check,
  ArrowRight,
  Search,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  Sparkles,
  Phone,
  MapPin,
  CheckCircle2,
  Package,
  X,
  Trash2,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { fetchProducts } from '../../api/productApi';
import { createOrder, trackOrder } from '../../api/orderApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import AiAssistantModal from '../../components/common/AiAssistantModal';

export default function UserStorePage({ defaultOpenCart = false, defaultSection = null, defaultOpenAi = false }) {
  const { cartItems, addToCart, removeFromCart, updateQty, clearCart, itemsCount, totalPrice, itemsPrice } = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedId, setAddedId] = useState(null);

  // Cart & Checkout Drawer
  const [cartDrawerOpen, setCartDrawerOpen] = useState(defaultOpenCart);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [orderNotes, setOrderNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [placedOrderData, setPlacedOrderData] = useState(null);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Tracking Section
  const [trackSearchId, setTrackSearchId] = useState(params.orderId || '10024');
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  // AI Assistant Drawer
  const [aiModalOpen, setAiModalOpen] = useState(defaultOpenAi);

  // Refs for smooth scroll
  const productsRef = useRef(null);
  const trackingRef = useRef(null);
  const featuresRef = useRef(null);
  const faqRef = useRef(null);

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching store products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Handle URL hash or defaultSection navigation
  useEffect(() => {
    if (defaultOpenCart) {
      setCartDrawerOpen(true);
    }
    if (defaultOpenAi) {
      setAiModalOpen(true);
    }
    if (defaultSection === 'track' || location.hash === '#track') {
      setTimeout(() => {
        trackingRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      if (params.orderId) {
        setTrackSearchId(params.orderId);
        handleTrackOrder(params.orderId);
      } else {
        handleTrackOrder('10024');
      }
    }
  }, [defaultOpenCart, defaultSection, defaultOpenAi, location.hash, params.orderId]);

  // Categories list
  const categories = ['All', 'Fashion', 'Footwear', 'Accessories', 'Watches'];

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1400);
  };

  const handleBuyNow = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setCartDrawerOpen(true);
    setCheckoutStep('checkout');
  };

  // Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setOrderError('Please enter your full name, phone number, and delivery address.');
      return;
    }
    if (cartItems.length === 0) {
      setOrderError('Your shopping bag is empty.');
      return;
    }

    setPlacingOrder(true);
    setOrderError(null);

    try {
      const fullAddress = `${shippingAddress.trim()}, ${city}${orderNotes ? ' (Note: ' + orderNotes + ')' : ''}`;
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: fullAddress,
        paymentMethod: 'Cash on Delivery',
        deliveryCharges: 200,
        orderItems: cartItems.map((item) => ({
          product: item._id,
          title: item.title,
          qty: item.qty,
          price: item.price,
          image: item.image,
        })),
      };

      const result = await createOrder(payload);
      setPlacedOrderData(result);
      clearCart();
      setCheckoutStep('success');

      // Also prefill tracking
      setTrackSearchId(result.orderNumber || result._id);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Order Tracking
  const handleTrackOrder = async (orderIdToSearch) => {
    const id = orderIdToSearch || trackSearchId;
    if (!id || !id.toString().trim()) return;

    setTrackingLoading(true);
    setTrackingError(null);

    try {
      const data = await trackOrder(id.toString().trim());
      setTrackingOrder(data);
    } catch (err) {
      setTrackingError(err.response?.data?.message || 'Order not found. Please verify your order number.');
      setTrackingOrder(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const trackingSteps = [
    { key: 'New', title: 'Order Placed', time: trackingOrder?.createdAt ? formatDateTime(trackingOrder.createdAt) : 'Pending', icon: Clock },
    { key: 'Confirmed', title: 'Confirmed by Store', time: trackingOrder?.status !== 'New' ? 'Order confirmed by seller' : 'Waiting for confirmation', icon: CheckCircle2 },
    { key: 'Shipped', title: 'Shipped (In Transit)', time: trackingOrder?.status === 'Shipped' || trackingOrder?.status === 'Delivered' ? 'Dispatched via Leopard Courier' : 'Pending dispatch', icon: Truck },
    { key: 'Delivered', title: 'Delivered', time: trackingOrder?.status === 'Delivered' ? 'Parcel delivered successfully' : 'Estimated 3-5 days', icon: Package },
  ];

  const getStepProgress = (stepName) => {
    if (!trackingOrder) return { completed: false, active: false };
    const orderHierarchy = ['New', 'Confirmed', 'Shipped', 'Delivered'];
    const currentIdx = orderHierarchy.indexOf(trackingOrder.status);
    const stepIdx = orderHierarchy.indexOf(stepName);
    return {
      completed: currentIdx >= stepIdx,
      active: currentIdx === stepIdx,
    };
  };

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Optional Top Notification for Logged-In Admin only */}
      {user && isAdmin && (
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#e2e8f0',
            padding: '0.45rem 1rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ backgroundColor: '#10b981', color: '#fff', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}>
              ADMIN LOGGED IN
            </span>
            <span>Welcome, <strong>{user.name || 'Ahmad'}</strong>. You are currently viewing the customer storefront.</span>
          </div>
          <Link
            to="/admin"
            style={{
              color: '#818cf8',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            Go to Admin Dashboard <ExternalLink size={13} />
          </Link>
        </div>
      )}

      {/* Main Customer Header */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
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
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                fontFamily: 'serif',
                boxShadow: '0 3px 10px rgba(15, 23, 42, 0.25)',
                border: '2px solid #334155',
              }}
            >
              A
            </div>
            <div>
              <span
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                My Store
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                Fashion & Lifestyle Boutique
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Single Page Smooth Scroll) */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
            }}
            className="hide-mobile"
          >
            <button
              onClick={() => scrollTo(productsRef)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#334155',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Shop Collection
            </button>
            <button
              onClick={() => scrollTo(featuresRef)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#334155',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Why Choose Us
            </button>
            <button
              onClick={() => scrollTo(trackingRef)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#334155',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Track Order
            </button>
            <button
              onClick={() => scrollTo(faqRef)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#334155',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              FAQ
            </button>
          </nav>

          {/* Right Action Icons: WhatsApp, Instagram, AI Button, Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Instagram Link */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Store"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill="url(#ig-grad-main)" />
                <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#ffffff" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="3" stroke="#ffffff" strokeWidth="1.6" />
                <circle cx="15.5" cy="8.5" r="0.9" fill="#ffffff" />
                <defs>
                  <linearGradient id="ig-grad-main" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F58529" />
                    <stop offset="0.5" stopColor="#DD2A7B" />
                    <stop offset="1" stopColor="#8134AF" />
                  </linearGradient>
                </defs>
              </svg>
            </a>

            {/* WhatsApp Link */}
            <a
              href="https://wa.me/923001234567?text=Hi,%20I%20am%20browsing%20My%20Store%20and%20want%20to%20order"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Chat"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.35)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M12.031 2C6.5 2 2 6.5 2 12.031c0 1.906.531 3.703 1.484 5.25L2 22l4.891-1.437A9.97 9.97 0 0 0 12.03 22c5.532 0 10.032-4.5 10.032-10.031C22.063 6.5 17.563 2 12.031 2zm5.782 14.234c-.234.656-1.359 1.25-1.922 1.328-.531.078-1.219.11-3.64-0.89-3.094-1.282-5.079-4.422-5.235-4.641-.156-.219-1.25-1.672-1.25-3.187 0-1.516.781-2.266 1.063-2.563.281-.297.609-.375.812-.375.203 0 .406 0 .578.016.188.015.438-.078.688.516.25.61.859 2.109.938 2.266.078.156.125.344.031.547-.094.203-.14.328-.281.484-.14.156-.312.359-.438.484-.14.14-.297.297-.125.594.172.297.766 1.266 1.641 2.047 1.125 1.016 2.078 1.328 2.375 1.484.297.14.469.125.641-.078.172-.203.734-.859.938-1.156.203-.297.406-.25.688-.14.281.11 1.781.844 2.094 1 .312.156.516.234.594.359.078.14.078.812-.156 1.469z" />
              </svg>
            </a>

            {/* Smart AI Assistant Quick Trigger */}
            <button
              onClick={() => setAiModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                border: '1px solid #c7d2fe',
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
              }}
            >
              <Bot size={16} />
              <span className="hide-mobile">Ask AI</span>
            </button>

            {/* Shopping Bag Trigger Button */}
            <button
              onClick={() => {
                setCartDrawerOpen(true);
                setCheckoutStep('cart');
              }}
              style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(15, 23, 42, 0.25)',
              }}
              aria-label="View Cart"
            >
              <ShoppingBag size={19} />
              {itemsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '0.725rem',
                    fontWeight: 800,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff',
                  }}
                >
                  {itemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="container" style={{ paddingTop: '1.25rem', paddingBottom: '0.75rem' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 58, 138, 0.8) 55%, rgba(15, 23, 42, 0.9) 100%), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '3.5rem 2.5rem',
            color: '#ffffff',
            boxShadow: '0 8px 25px rgba(15, 23, 42, 0.15)',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#a5b4fc',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={14} color="#38bdf8" /> Official Storefront • 100% Cash on Delivery
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.25rem)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.12,
                marginBottom: '0.85rem',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
              }}
            >
              Trendy Styles<br />
              <span style={{ color: '#818cf8' }}>For You</span>
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                color: '#cbd5e1',
                fontWeight: 500,
                letterSpacing: '0.01em',
                marginBottom: '1.75rem',
                lineHeight: 1.5,
              }}
            >
              Quality Products • Best Wholesale Prices • 3-5 Days Fast Delivery all over Pakistan
            </p>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => scrollTo(productsRef)}
                className="btn btn-primary"
                style={{
                  padding: '0.85rem 1.75rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(79, 70, 229, 0.45)',
                }}
              >
                Shop Collection <ArrowRight size={18} />
              </button>

              <button
                onClick={() => setAiModalOpen(true)}
                className="btn btn-secondary"
                style={{
                  padding: '0.85rem 1.5rem',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(5px)',
                }}
              >
                <Bot size={18} color="#818cf8" /> Ask AI Assistant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Value Strip */}
      <section className="container" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            backgroundColor: '#ffffff',
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Nationwide Delivery</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>3-5 days via Leopard / TCS</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>100% Cash on Delivery</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Pay upon parcel receipt</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>7 Days Easy Return</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Hassle-free size exchange</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>AI Order Assistant</h4>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>24/7 instant chat support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section ref={productsRef} className="container" style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Featured Products
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Select an item to add to your bag or click Buy Now for instant checkout
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.875rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.5rem 1.15rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: active ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                    backgroundColor: active ? '#4f46e5' : '#ffffff',
                    color: active ? '#ffffff' : '#475569',
                    boxShadow: active ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {loadingProducts ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: '#94a3b8' }}>
            Loading store collection...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <ShoppingBag size={42} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>No products found</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              Try searching with another keyword or select "All" categories.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredProducts.map((product) => {
              const isAdded = addedId === product._id;
              return (
                <div
                  key={product._id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '1.15rem',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  className="user-product-card"
                >
                  <div>
                    {/* Photo Container */}
                    <div
                      onClick={() => setQuickViewProduct(product)}
                      style={{
                        width: '100%',
                        paddingTop: '92%',
                        position: 'relative',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '1rem',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: '0.85rem',
                          transition: 'transform 0.3s ease',
                        }}
                      />

                      {/* Category Badge */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          backgroundColor: 'rgba(15, 23, 42, 0.75)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                        }}
                      >
                        {product.category || 'Fashion'}
                      </span>
                    </div>

                    {/* Product Title */}
                    <h3
                      onClick={() => setQuickViewProduct(product)}
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '0.35rem',
                        cursor: 'pointer',
                      }}
                    >
                      {product.title}
                    </h3>

                    {/* Stock Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          fontFamily: 'var(--font-heading)',
                        }}
                      >
                        {formatCurrency(product.price)}
                      </span>

                      <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                        ✓ In Stock ({product.stock || 10})
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: Add to Bag & Buy Now */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="btn"
                      style={{
                        padding: '0.65rem 0',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        backgroundColor: isAdded ? '#10b981' : '#f1f5f9',
                        color: isAdded ? '#ffffff' : '#1e293b',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isAdded ? (
                        <>
                          <Check size={16} /> Added
                        </>
                      ) : (
                        'Add to Bag'
                      )}
                    </button>

                    <button
                      onClick={(e) => handleBuyNow(product, e)}
                      className="btn btn-primary"
                      style={{
                        padding: '0.65rem 0',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Integrated Track Your Order Section */}
      <section
        ref={trackingRef}
        id="track"
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          padding: '4rem 1.5rem',
        }}
      >
        <div className="container" style={{ maxWidth: '640px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.65rem',
              }}
            >
              <Truck size={14} /> Live Tracking System
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Track Your Order
            </h2>
            <p style={{ fontSize: '0.925rem', color: '#64748b' }}>
              Enter your 5-digit Order Number (e.g. 10024) to see instant courier status
            </p>
          </div>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrackOrder();
            }}
            style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.75rem' }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Enter 5-digit Order Number (e.g. 10024)"
                value={trackSearchId}
                onChange={(e) => setTrackSearchId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.6rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                }}
              />
              <Search
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
            </div>

            <button
              type="submit"
              disabled={trackingLoading}
              className="btn btn-primary"
              style={{ padding: '0 1.5rem', borderRadius: '12px', fontWeight: 700 }}
            >
              {trackingLoading ? 'Checking...' : 'Track'}
            </button>
          </form>

          {/* Error Message */}
          {trackingError && (
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                borderRadius: '12px',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                border: '1px solid #fecaca',
                textAlign: 'center',
              }}
            >
              {trackingError}
            </div>
          )}

          {/* Tracking Card */}
          {trackingOrder && (
            <div
              className="card"
              style={{
                padding: '2rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.775rem', color: '#64748b' }}>Order Number</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    #{trackingOrder.orderNumber}
                  </h3>
                </div>

                <span
                  className={`status-pill status-${trackingOrder.status?.toLowerCase()}`}
                  style={{ padding: '0.4rem 0.95rem', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  {trackingOrder.status}
                </span>
              </div>

              {/* Stepper Timeline */}
              <div style={{ position: 'relative', paddingLeft: '2.5rem', marginBottom: '1.75rem' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '18px',
                    bottom: '24px',
                    width: '3px',
                    backgroundColor: '#e2e8f0',
                    zIndex: 1,
                  }}
                />

                {trackingSteps.map((st, idx) => {
                  const state = getStepProgress(st.key);
                  const isDone = state.completed;
                  const isCurrent = state.active;

                  return (
                    <div
                      key={st.key}
                      style={{
                        position: 'relative',
                        marginBottom: idx === trackingSteps.length - 1 ? 0 : '1.75rem',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: '-2.5rem',
                          top: '2px',
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: isDone ? '#4f46e5' : '#e2e8f0',
                          border: isCurrent ? '3px solid #c7d2fe' : 'none',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                        )}
                      </div>

                      <div>
                        <h4
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: isDone ? 700 : 500,
                            color: isDone ? '#0f172a' : '#94a3b8',
                            lineHeight: 1.2,
                          }}
                        >
                          {st.title}
                        </h4>
                        <p style={{ fontSize: '0.775rem', color: isDone ? '#64748b' : '#cbd5e1' }}>
                          {st.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Details */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  color: '#475569',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div><strong>Customer:</strong> {trackingOrder.customerName}</div>
                <div><strong>Delivery Address:</strong> {trackingOrder.shippingAddress}</div>
                <div><strong>Payment:</strong> {trackingOrder.paymentMethod} (COD)</div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0f172a' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: '#4f46e5' }}>{formatCurrency(trackingOrder.totalPrice)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features & Why Choose Us Section */}
      <section ref={featuresRef} className="container" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Why Shop With Us
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#64748b' }}>
            We provide a hassle-free, transparent online shopping experience across Pakistan
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              100% Cash on Delivery
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
              Zero advance payment required! Pay in cash directly to the courier rider upon receiving and inspecting your parcel.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Truck size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Fast Nationwide Courier
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
              Standard 3 to 5 business days delivery to Karachi, Lahore, Islamabad, Rawalpindi, and every city across Pakistan.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <RotateCcw size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              7 Days Easy Exchange
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
              Wrong size or not satisfied? Our friendly support team handles replacements and exchanges within 7 business days.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1.75rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Bot size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              24/7 AI Smart Assistant
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
              Ask anything in Roman Urdu or English! Inquire about product prices, photos, delivery policies, or track live orders anytime.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '4rem 1.5rem' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '0.925rem', color: '#64748b' }}>
              Common questions answered about placing orders, shipping, and delivery
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Delivery charges kitne hain?
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Standard delivery charges pure Pakistan mein sirf Rs. 200 hain. Iske ilawa koi hidden charges nahi hain.
              </p>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Parcel kitne din mein pohnchta hai?
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Order place hone ke baad usually 3 se 5 working days ke andar Leopard Courier ya TCS ke zariye deliver ho jata hai.
              </p>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Kya advance payment karni parti hai?
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Bilkul nahi! Hamara store 100% Cash on Delivery (COD) offer karta hai. Parcel hath mein lene ke baad hi cash payment karein.
              </p>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                Agar product pasand na aye ya size ka issue ho toh?
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                Hamari 7 days easy return aur exchange policy hai. Aap direct hamare WhatsApp (+92 300 1234567) par contact karke exchange request kar sakte hain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Footer */}
      <footer
        style={{
          backgroundColor: '#0f172a',
          color: '#cbd5e1',
          padding: '3rem 1.5rem 2rem',
          borderTop: '1px solid #1e293b',
          marginTop: 'auto',
        }}
      >
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ffffff', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'serif' }}>
                A
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>My Store</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Pakistan's trusted destination for trendy styles, comfortable shoes, luxury watches, and handcrafted bags.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.85rem' }}>
              Quick Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
              <button onClick={() => scrollTo(productsRef)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', textAlign: 'left', cursor: 'pointer' }}>
                Shop Collection
              </button>
              <button onClick={() => scrollTo(trackingRef)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', textAlign: 'left', cursor: 'pointer' }}>
                Track Your Order
              </button>
              <button onClick={() => scrollTo(featuresRef)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', textAlign: 'left', cursor: 'pointer' }}>
                Delivery & Policies
              </button>
              <button onClick={() => setAiModalOpen(true)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', textAlign: 'left', cursor: 'pointer' }}>
                Ask AI Assistant
              </button>
            </div>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.85rem' }}>
              Contact & Order Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div>WhatsApp: +92 300 1234567</div>
              <div>Instagram: @mystore_official</div>
              <div>Location: Lahore, Pakistan</div>
              <div>Delivery: 3-5 Business Days Nationwide</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Discreet Admin Portal Link */}
        <div
          className="container"
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <div>© {new Date().getFullYear()} My Store. All rights reserved. 100% Cash on Delivery.</div>

          {/* Admin Login Discreet Portal */}
          <Link
            to="/admin/login"
            style={{
              color: '#64748b',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            <Lock size={12} /> Admin / Seller Portal
          </Link>
        </div>
      </footer>

      {/* Floating Bottom Cart Bar (Appears when items are in bag) */}
      {itemsCount > 0 && !cartDrawerOpen && (
        <div
          onClick={() => {
            setCartDrawerOpen(true);
            setCheckoutStep('cart');
          }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 45,
            width: '92%',
            maxWidth: '460px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: '9999px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {itemsCount} {itemsCount === 1 ? 'item' : 'items'} in Bag
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              {formatCurrency(totalPrice)}
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            style={{
              borderRadius: '9999px',
              padding: '0.55rem 1.25rem',
              fontWeight: 700,
              gap: '0.35rem',
            }}
          >
            Checkout Now <ArrowRight size={15} />
          </button>
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
          zIndex: 45,
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          border: 'none',
          padding: '0.75rem 1.25rem',
          borderRadius: '9999px',
          boxShadow: '0 8px 25px rgba(79, 70, 229, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 700,
          fontSize: '0.9rem',
          cursor: 'pointer',
        }}
      >
        <Bot size={20} />
        <span>Ask AI Assistant</span>
      </button>

      {/* ================================================================= */}
      {/* SLIDE-OUT CART & 1-PAGE FAST CHECKOUT DRAWER                      */}
      {/* ================================================================= */}
      {cartDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setCartDrawerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              height: '100vh',
              backgroundColor: '#ffffff',
              boxShadow: '-8px 0 35px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShoppingBag size={20} color="#4f46e5" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {checkoutStep === 'success'
                    ? 'Order Confirmed!'
                    : checkoutStep === 'checkout'
                    ? 'Fast 1-Page Checkout'
                    : `Shopping Bag (${itemsCount})`}
                </h3>
              </div>

              <button
                onClick={() => setCartDrawerOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              {/* STEP 1: CART ITEMS VIEW */}
              {checkoutStep === 'cart' && (
                <>
                  {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                      <ShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                        Your shopping bag is empty
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.4rem', marginBottom: '1.5rem' }}>
                        Browse our collection and add your favorite items!
                      </p>
                      <button
                        onClick={() => setCartDrawerOpen(false)}
                        className="btn btn-primary btn-sm"
                      >
                        Explore Products
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div
                              style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '8px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                overflow: 'hidden',
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={item.image}
                                alt={item.title}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                              />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                                {item.title}
                              </h4>
                              <p style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 700 }}>
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>

                          {/* Quantity control */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                style={{ width: '26px', height: '26px', background: 'transparent', color: '#475569', fontWeight: 700 }}
                              >
                                -
                              </button>
                              <span style={{ width: '26px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                                {item.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQty(item._id, item.qty + 1)}
                                style={{ width: '26px', height: '26px', background: 'transparent', color: '#475569', fontWeight: 700 }}
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

                      {/* Summary Breakdown */}
                      <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>
                          <span>Subtotal:</span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(itemsPrice)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.65rem' }}>
                          <span>Delivery Charges:</span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>Rs. 200 (COD)</span>
                        </div>
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          <span>Total:</span>
                          <span style={{ color: '#4f46e5' }}>{formatCurrency(itemsPrice + 200)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2: 1-PAGE CHECKOUT FORM */}
              {checkoutStep === 'checkout' && (
                <div>
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginBottom: '1rem',
                      cursor: 'pointer',
                    }}
                  >
                    ← Review Bag Items ({itemsCount})
                  </button>

                  {orderError && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        marginBottom: '1rem',
                        border: '1px solid #fecaca',
                      }}
                    >
                      {orderError}
                    </div>
                  )}

                  <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ali Raza"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="form-control"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        WhatsApp / Mobile Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 0321 4567890"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        className="form-control"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Courier will contact on this number for delivery
                      </span>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        City *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="form-control"
                      >
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Multan">Multan</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Sialkot">Sialkot</option>
                        <option value="Gujranwala">Gujranwala</option>
                        <option value="Quetta">Quetta</option>
                        <option value="Other">Other City</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        Complete Delivery Address *
                      </label>
                      <textarea
                        rows={2}
                        placeholder="House / Flat #, Street, Area / Sector"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        required
                        className="form-control"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                        Order Note (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Call before delivery, size preference"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="form-control"
                      />
                    </div>

                    {/* Payment Badge */}
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      <CheckCircle2 size={18} color="#059669" />
                      <div style={{ fontSize: '0.825rem', color: '#065f46' }}>
                        <strong>Cash on Delivery (COD)</strong>: Pay cash to courier rider upon parcel receipt.
                      </div>
                    </div>

                    {/* Total Amount Confirmation */}
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Total to Pay on Delivery:</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4f46e5' }}>
                        {formatCurrency(itemsPrice + 200)}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={placingOrder || cartItems.length === 0}
                      className="btn btn-primary"
                      style={{
                        padding: '0.85rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderRadius: '12px',
                        marginTop: '0.5rem',
                      }}
                    >
                      {placingOrder ? 'Confirming Order...' : 'Confirm & Place Order'}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 3: ORDER SUCCESS CONFIRMATION */}
              {checkoutStep === 'success' && placedOrderData && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#ecfdf5',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>

                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                    Order Placed Successfully!
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                    Thank you, {placedOrderData.customerName}! Your order has been placed.
                  </p>

                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      border: '1px solid #e2e8f0',
                      marginBottom: '1.5rem',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Order Number:</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4f46e5' }}>
                        #{placedOrderData.orderNumber}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b' }}>Total (COD):</span>
                      <span style={{ fontWeight: 700 }}>{formatCurrency(placedOrderData.totalPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748b' }}>Delivery Address:</span>
                      <span style={{ fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>
                        {placedOrderData.shippingAddress}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <a
                      href={`https://wa.me/923001234567?text=Hi,%20I%20have%20placed%20order%20%23${placedOrderData.orderNumber}%20for%20Rs.%20${placedOrderData.totalPrice}.%20Please%20confirm%20my%20delivery!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        textDecoration: 'none',
                      }}
                    >
                      Chat on WhatsApp to Confirm
                    </a>

                    <button
                      onClick={() => {
                        setCartDrawerOpen(false);
                        scrollTo(trackingRef);
                        setTrackSearchId(placedOrderData.orderNumber);
                        handleTrackOrder(placedOrderData.orderNumber);
                      }}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem', borderRadius: '10px', fontWeight: 700 }}
                    >
                      Track this Order (# {placedOrderData.orderNumber})
                    </button>

                    <button
                      onClick={() => {
                        setCartDrawerOpen(false);
                        setCheckoutStep('cart');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.65rem', borderRadius: '10px' }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer for Step 1 */}
            {checkoutStep === 'cart' && cartItems.length > 0 && (
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderTop: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                }}
              >
                <button
                  onClick={() => setCheckoutStep('checkout')}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  Proceed to Checkout ({formatCurrency(itemsPrice + 200)}) <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* PRODUCT QUICK VIEW MODAL                                          */}
      {/* ================================================================= */}
      {quickViewProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <div
              style={{
                width: '100%',
                height: '240px',
                backgroundColor: '#f8fafc',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid #e2e8f0',
              }}
            >
              <img
                src={quickViewProduct.image}
                alt={quickViewProduct.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
              />
            </div>

            <span
              style={{
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
              }}
            >
              {quickViewProduct.category || 'Fashion'}
            </span>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              {quickViewProduct.title}
            </h3>

            <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#4f46e5', fontFamily: 'var(--font-heading)', marginBottom: '0.75rem' }}>
              {formatCurrency(quickViewProduct.price)}
            </p>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {quickViewProduct.description}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                onClick={(e) => {
                  handleAddToCart(quickViewProduct, e);
                  setQuickViewProduct(null);
                }}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.85rem', fontWeight: 700 }}
              >
                Add to Bag
              </button>

              <button
                onClick={(e) => {
                  handleBuyNow(quickViewProduct, e);
                  setQuickViewProduct(null);
                }}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.85rem', fontWeight: 700 }}
              >
                Buy Now (COD)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* AI ASSISTANT MODAL (Full Interactive Chatbot)                     */}
      {/* ================================================================= */}
      {aiModalOpen && (
        <AiAssistantModal onClose={() => setAiModalOpen(false)} />
      )}

      {/* Drawer slide-in animation styles */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
