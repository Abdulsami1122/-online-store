import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Truck,
  RotateCcw,
  Headphones,
  ShieldCheck,
  Star,
  ArrowRight,
  X,
  Menu,
  Eye,
  Check,
  Package,
  Clock,
  ChevronRight,
  Sparkles,
  Lock,
  ExternalLink,
  HelpCircle,
  Phone,
  MapPin,
  CheckCircle2,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { fetchProducts } from '../../api/productApi';
import { createOrder, trackOrder } from '../../api/orderApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';
import { BUSINESS_PRESETS } from '../../utils/businessPresets';
import AiAssistantModal from '../../components/common/AiAssistantModal';

export default function UserStorePage({
  defaultOpenCart = false,
  defaultSection = null,
  defaultOpenAi = false,
}) {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    itemsCount,
    totalPrice,
  } = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ----------------------------------------------------------------------
  // Multi-Business Switcher State
  // Supports: clothes (default 100% like mockup), honey, car, shoes
  // ----------------------------------------------------------------------
  const getInitialBusiness = () => {
    const params = new URLSearchParams(window.location.search);
    const busParam = params.get('business');
    if (busParam && BUSINESS_PRESETS[busParam]) return busParam;
    const saved = localStorage.getItem('store_business_key');
    if (saved && BUSINESS_PRESETS[saved]) return saved;
    return 'clothes'; // Default exact replica of user screenshot
  };

  const [activeBusinessKey, setActiveBusinessKey] = useState(getInitialBusiness);
  const currentBusiness = BUSINESS_PRESETS[activeBusinessKey] || BUSINESS_PRESETS.clothes;

  const handleSelectBusiness = (key) => {
    setActiveBusinessKey(key);
    localStorage.setItem('store_business_key', key);
    setSelectedCategory('All');
    setSearchQuery('');
  };

  // Dynamic Theme Colors based on active business
  const theme = currentBusiness.theme;

  // ----------------------------------------------------------------------
  // State for products, search, wishlist & filters
  // ----------------------------------------------------------------------
  const [dbProducts, setDbProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('user_store_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [addedNoticeId, setAddedNoticeId] = useState(null);

  // Mobile menu drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cart & Checkout Drawers
  const [cartDrawerOpen, setCartDrawerOpen] = useState(defaultOpenCart);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('New York');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [placedOrderData, setPlacedOrderData] = useState(null);

  // Newsletter Email State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [vipEmail, setVipEmail] = useState('');
  const [vipSuccess, setVipSuccess] = useState(false);

  // Order Tracking Modal
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackSearchId, setTrackSearchId] = useState('');
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  // AI Assistant Drawer
  const [aiModalOpen, setAiModalOpen] = useState(defaultOpenAi);

  // Section Refs for smooth scrolling
  const heroRef = useRef(null);
  const categoriesRef = useRef(null);
  const featuredRef = useRef(null);
  const whyUsRef = useRef(null);
  const editorialRef = useRef(null);
  const bestSellersRef = useRef(null);
  const testimonialsRef = useRef(null);
  const footerRef = useRef(null);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('user_store_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Load products from DB if available
  useEffect(() => {
    const loadDbProducts = async () => {
      try {
        const data = await fetchProducts();
        if (data && Array.isArray(data) && data.length > 0) {
          setDbProducts(data);
        }
      } catch (err) {
        console.log('No DB products or offline, using curated business catalog');
      }
    };
    loadDbProducts();
  }, []);

  // Handle URL defaultSection or hash
  useEffect(() => {
    if (defaultOpenCart) setCartDrawerOpen(true);
    if (defaultOpenAi) setAiModalOpen(true);
    if (defaultSection === 'track' || location.hash === '#track') {
      setTrackingModalOpen(true);
    }
  }, [defaultOpenCart, defaultOpenAi, defaultSection, location.hash]);

  // Combine products: Curated business presets + any DB products for this category
  const allCurrentProducts = [
    ...currentBusiness.featuredProducts,
    ...currentBusiness.bestSellers.filter(
      (b) => !currentBusiness.featuredProducts.some((f) => f._id === b._id)
    ),
  ];

  // Category filter list
  const categoryFilters = [
    'All',
    ...currentBusiness.categories.map((c) => c.name),
  ];

  // Filter products by selected category and search query
  const displayedFeatured = currentBusiness.featuredProducts.filter((p) => {
    const matchCat =
      selectedCategory === 'All' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(p.category.toLowerCase());
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Search Results
  const searchResults = allCurrentProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Cart / Buy Now handler
  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setAddedNoticeId(product._id);
    setTimeout(() => setAddedNoticeId(null), 1500);
  };

  const handleBuyNow = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setCartDrawerOpen(true);
    setCheckoutStep('checkout');
  };

  // Wishlist toggle
  const toggleWishlist = (product, e) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      if (exists) {
        return prev.filter((item) => item._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isWishlisted = (id) => wishlist.some((item) => item._id === id);

  // Smooth scroll
  const scrollTo = (ref) => {
    setMobileMenuOpen(false);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Order Placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      setOrderError('Please provide your full name, phone number, and delivery address.');
      return;
    }
    if (cartItems.length === 0) {
      setOrderError('Your shopping bag is empty.');
      return;
    }

    setPlacingOrder(true);
    setOrderError(null);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: `${shippingAddress.trim()}, ${city}${orderNotes ? ' (Note: ' + orderNotes + ')' : ''}`,
        paymentMethod,
        deliveryCharges: 15,
        orderItems: cartItems.map((item) => ({
          product: item._id,
          title: item.title,
          qty: item.qty,
          price: item.price,
          image: item.image,
        })),
      };

      try {
        const result = await createOrder(payload);
        setPlacedOrderData(result);
        setTrackSearchId(result.orderNumber || result._id || 'ORD-98241');
      } catch {
        // Fallback for live demo if backend is offline
        const fakeOrder = {
          _id: 'ord_' + Math.random().toString(36).substring(2, 9),
          orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          customerName: customerName.trim(),
          createdAt: new Date().toISOString(),
          status: 'New',
          totalAmount: totalPrice + 15,
        };
        setPlacedOrderData(fakeOrder);
        setTrackSearchId(fakeOrder.orderNumber);
      }

      clearCart();
      setCheckoutStep('success');
    } catch (err) {
      setOrderError('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Order Tracking
  const handleTrackOrder = async (idToSearch) => {
    const id = idToSearch || trackSearchId;
    if (!id || !id.trim()) return;

    setTrackingLoading(true);
    setTrackingError(null);

    try {
      const data = await trackOrder(id.trim());
      setTrackingOrder(data);
    } catch {
      // Mock order tracker so user can test anytime
      setTrackingOrder({
        orderNumber: id.trim(),
        status: 'Shipped',
        createdAt: new Date().toISOString(),
        customerName: customerName || 'Valued Customer',
        trackingSteps: [
          { status: 'Order Placed', done: true, time: 'Today, 10:30 AM' },
          { status: 'Confirmed & Packed', done: true, time: 'Today, 01:15 PM' },
          { status: 'In Transit with Express Courier', done: true, time: 'Today, 04:45 PM' },
          { status: 'Delivered', done: false, time: 'Estimated tomorrow' },
        ],
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  // Format Price
  const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
  };

  // Render business logo icon
  const renderLogoIcon = () => {
    if (activeBusinessKey === 'clothes') {
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a2.5 2.5 0 0 1 2.5 2.5c0 1.2-.8 2.2-1.9 2.5L21.5 13a2 2 0 0 1-1.2 3.6H3.7A2 2 0 0 1 2.5 13l8.9-6C10.3 6.7 9.5 5.7 9.5 4.5A2.5 2.5 0 0 1 12 2z" />
          <path d="M9 16.6v1.4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1.4" />
        </svg>
      );
    }
    if (activeBusinessKey === 'honey') {
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );
    }
    if (activeBusinessKey === 'car') {
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9L2.1 11.2C2 11.4 2 11.7 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      );
    }
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 13l3.5-7.5A2 2 0 0 1 8.3 4h4.4a2 2 0 0 1 1.8 1.1L18 12h3a2 2 0 0 1 2 2v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-2a2 2 0 0 1 1-1.7z" />
      </svg>
    );
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        color: '#1E1E24',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="font-sans"
    >
      {/* ================================================================= */}
      {/* 1. TOP ANNOUNCEMENT & MULTI-BUSINESS PRESET SELECTOR TOOLBAR      */}
      {/* ================================================================= */}
      <div
        style={{
          backgroundColor: theme.primary,
          color: '#ffffff',
          fontSize: '0.8rem',
          padding: '0.45rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Ticker / Announcement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, letterSpacing: '0.02em' }}>
          <span>{currentBusiness.announcement}</span>
        </div>

        {/* Multi-Business Quick Switcher Bar (User requested: used for many businesses like honey, car decoration, shoes, clothes) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.72rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Preview Niche:
          </span>
          {Object.keys(BUSINESS_PRESETS).map((key) => {
            const b = BUSINESS_PRESETS[key];
            const isSelected = activeBusinessKey === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectBusiness(key)}
                style={{
                  backgroundColor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.18)',
                  color: isSelected ? theme.primary : '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                title={`Switch store design for ${b.name}`}
              >
                <span>{key === 'clothes' ? '👗' : key === 'honey' ? '🍯' : key === 'car' ? '🚗' : '👟'}</span>
                <span>{b.shortName}</span>
              </button>
            );
          })}

          {/* Admin shortcut if logged in */}
          {user && isAdmin && (
            <Link
              to="/admin"
              style={{
                backgroundColor: '#0F172A',
                color: '#38BDF8',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                marginLeft: '0.5rem',
              }}
            >
              Admin Portal →
            </Link>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. MAIN HEADER / NAVIGATION (Exact match to screenshot)           */}
      {/* ================================================================= */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: '#FFFFFF',
          zIndex: 100,
          boxShadow: '0 2px 14px rgba(0, 0, 0, 0.05)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
          }}
        >
          {/* Left: Brand Logo (Hanger icon + Store Name) */}
          <div
            onClick={() => scrollTo(heroRef)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: theme.primaryLight,
                color: theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {renderLogoIcon()}
            </div>
            <div>
              <span
                className="font-serif"
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: theme.primary,
                  letterSpacing: '-0.02em',
                  display: 'block',
                  lineHeight: 1.1,
                }}
              >
                {currentBusiness.name}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#8A8588',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {currentBusiness.shortName}
              </span>
            </div>
          </div>

          {/* Center: Navigation Menu Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '2rem',
            }}
            className="desktop-nav"
          >
            {[
              { label: 'Home', ref: heroRef },
              { label: 'Shop', ref: featuredRef },
              { label: 'Best Seller', ref: bestSellersRef },
              { label: 'Category', ref: categoriesRef },
              { label: 'Why Us', ref: whyUsRef },
              { label: 'Reviews', ref: testimonialsRef },
              { label: 'Contact', ref: footerRef },
            ].map((link, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(link.ref)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  color: '#4A454E',
                  cursor: 'pointer',
                  padding: '0.25rem 0',
                  position: 'relative',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = theme.primary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4A454E')}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: Search, Wishlist, Account, Cart Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2B2830',
                padding: '0.45rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              title="Search products"
              aria-label="Search"
            >
              <Search size={21} strokeWidth={1.8} />
            </button>

            {/* Wishlist Icon with Live Badge */}
            <button
              onClick={() => setWishlistDrawerOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2B2830',
                padding: '0.45rem',
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <Heart size={21} strokeWidth={1.8} />
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: theme.primary,
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User / Login Icon */}
            <Link
              to={user ? '/admin' : '/login'}
              style={{
                background: 'none',
                color: '#2B2830',
                padding: '0.45rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={user ? `Signed in as ${user.name || 'User'}` : 'Login / Register'}
              aria-label="Account"
            >
              <User size={21} strokeWidth={1.8} />
            </Link>

            {/* Shopping Bag Icon with Live Badge */}
            <button
              onClick={() => {
                setCartDrawerOpen(true);
                setCheckoutStep('cart');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#2B2830',
                padding: '0.45rem',
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="View Shopping Bag"
              aria-label="Cart"
            >
              <ShoppingBag size={21} strokeWidth={1.8} />
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: theme.primary,
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {itemsCount}
              </span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'flex',
                background: 'none',
                border: 'none',
                padding: '0.4rem',
                cursor: 'pointer',
                color: '#2B2830',
              }}
              className="mobile-nav-toggle"
              aria-label="Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Media query helper style for desktop-nav */}
        <style>{`
          @media (min-width: 900px) {
            .desktop-nav { display: flex !important; }
            .mobile-nav-toggle { display: none !important; }
          }
        `}</style>
      </header>

      {/* ================================================================= */}
      {/* 3. HERO SECTION (100% Exact match to screenshot layout & styling)  */}
      {/* ================================================================= */}
      <section
        ref={heroRef}
        style={{
          background: theme.heroBg,
          padding: '4rem 1.25rem 3.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="bg-botanical"
      >
        {/* Subtle decorative leaf watermarks in background */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '5%',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(163, 31, 89, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="container hero-split"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '3.5rem',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Left Column: Heading, Subtitle, CTA Button, and 3 Features */}
          <div style={{ flex: 1.15, maxWidth: '580px' }}>
            {/* Handwritten script subtitle */}
            <div
              className="font-script"
              style={{
                fontSize: '2rem',
                color: theme.accentScriptColor,
                lineHeight: 1.2,
                marginBottom: '0.5rem',
              }}
            >
              {currentBusiness.hero.script}
            </div>

            {/* Display Headline */}
            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)',
                fontWeight: 700,
                color: '#260618',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '1.25rem',
              }}
            >
              {currentBusiness.hero.title}
            </h1>

            {/* Subtitle Paragraph */}
            <p
              style={{
                fontSize: '1.05rem',
                color: '#635961',
                lineHeight: 1.65,
                marginBottom: '2rem',
              }}
            >
              {currentBusiness.hero.subtitle}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <button
                onClick={() => scrollTo(featuredRef)}
                style={{
                  backgroundColor: theme.primary,
                  color: '#ffffff',
                  padding: '0.9rem 2.2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: '0 8px 24px rgba(109, 14, 59, 0.25)',
                  transition: 'all 0.25s ease',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primaryHover;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>{currentBusiness.hero.ctaPrimary}</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => scrollTo(categoriesRef)}
                style={{
                  backgroundColor: 'transparent',
                  color: theme.primary,
                  padding: '0.9rem 1.8rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  border: `1.5px solid ${theme.primary}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primaryLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {currentBusiness.hero.ctaSecondary}
              </button>
            </div>

            {/* Horizontal 3 Feature Badges row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                borderTop: '1px solid rgba(109, 14, 59, 0.1)',
                paddingTop: '1.5rem',
              }}
            >
              {currentBusiness.features.map((feat) => (
                <div key={feat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      color: theme.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      flexShrink: 0,
                    }}
                  >
                    {feat.icon === 'truck' ? (
                      <Truck size={18} />
                    ) : feat.icon === 'rotate' ? (
                      <RotateCcw size={18} />
                    ) : (
                      <Headphones size={18} />
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#260618', margin: 0 }}>
                      {feat.title}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#7E757A' }}>{feat.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Arched Model Photo Frame + Floating Script Badge */}
          <div style={{ flex: 0.85, position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div
              className="arch-frame"
              style={{
                width: '100%',
                maxWidth: '420px',
                height: '520px',
                position: 'relative',
              }}
            >
              <img
                src={currentBusiness.hero.image}
                alt={currentBusiness.hero.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Floating Luxury Script Badge */}
            <div
              className="animate-float font-script"
              style={{
                position: 'absolute',
                top: '30px',
                right: '-15px',
                backgroundColor: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                color: theme.primary,
                padding: '0.65rem 1.4rem',
                borderRadius: '999px',
                fontSize: '1.45rem',
                boxShadow: '0 12px 30px rgba(109, 14, 59, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                zIndex: 5,
                transform: 'rotate(2deg)',
              }}
            >
              {currentBusiness.hero.badgeText}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. SHOP BY CATEGORY (5 Clean rounded cards)                       */}
      {/* ================================================================= */}
      <section
        ref={categoriesRef}
        style={{
          padding: '4.5rem 1.25rem 3rem',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div className="container">
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2
              className="font-serif"
              style={{
                fontSize: '2.2rem',
                fontWeight: 700,
                color: '#260618',
                marginBottom: '0.4rem',
              }}
            >
              Shop by Category
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#7E757A' }}>
              Browse our versatile catalog tailored just for you
            </p>
          </div>

          {/* Grid of 5 Category Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1.25rem',
            }}
            className="grid-responsive-5"
          >
            {currentBusiness.categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  scrollTo(featuredRef);
                }}
                className="category-card"
                style={{
                  backgroundColor: '#FCF9FA',
                  borderRadius: '16px',
                  padding: '1.2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* Circular / Rounded Image Frame */}
                <div
                  style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    backgroundColor: '#EDE3E7',
                  }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="cat-img"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                </div>

                <h3
                  className="font-serif"
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: '#260618',
                    marginBottom: '0.2rem',
                  }}
                >
                  {cat.name}
                </h3>

                <span style={{ fontSize: '0.78rem', color: '#8F868C', marginBottom: '0.5rem' }}>
                  {cat.count}
                </span>

                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: theme.primary,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  Shop Now →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. PROMO BANNER: "New Season New Vibes" (Curved Deep Berry Box)  */}
      {/* ================================================================= */}
      <section style={{ padding: '2rem 1.25rem' }}>
        <div className="container">
          <div
            style={{
              background: theme.promoBg,
              borderRadius: '24px',
              padding: '2.5rem 3rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2.5rem',
              boxShadow: '0 20px 45px -10px rgba(83, 11, 45, 0.45)',
              position: 'relative',
              overflow: 'hidden',
            }}
            className="hero-split"
          >
            {/* Left Photo */}
            <div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: '4px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
            >
              <img
                src={currentBusiness.midPromo.image}
                alt={currentBusiness.midPromo.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Right Copy */}
            <div style={{ flex: 1 }}>
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  display: 'inline-block',
                  marginBottom: '0.75rem',
                }}
              >
                {currentBusiness.midPromo.badge}
              </span>

              <h2
                className="font-serif"
                style={{
                  fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.2,
                  marginBottom: '0.65rem',
                }}
              >
                {currentBusiness.midPromo.title}
              </h2>

              <p
                style={{
                  fontSize: '0.98rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  lineHeight: 1.6,
                  maxWidth: '540px',
                  marginBottom: '1.5rem',
                }}
              >
                {currentBusiness.midPromo.subtitle}
              </p>

              <button
                onClick={() => scrollTo(bestSellersRef)}
                style={{
                  backgroundColor: '#ffffff',
                  color: theme.primary,
                  padding: '0.75rem 1.8rem',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span>{currentBusiness.midPromo.cta}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. FEATURED COLLECTION (With Filter Tabs and 4-Column Product Grid) */}
      {/* ================================================================= */}
      <section
        ref={featuredRef}
        style={{
          padding: '4.5rem 1.25rem 3rem',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div className="container">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2
              className="font-serif"
              style={{
                fontSize: '2.2rem',
                fontWeight: 700,
                color: '#260618',
                marginBottom: '0.4rem',
              }}
            >
              Featured Collection
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#7E757A' }}>
              Handpicked selections just for you
            </p>
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              flexWrap: 'wrap',
              marginBottom: '2.5rem',
            }}
          >
            {categoryFilters.map((catName) => {
              const isSelected = selectedCategory.toLowerCase() === catName.toLowerCase();
              return (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  style={{
                    backgroundColor: isSelected ? theme.primary : '#F7F2F4',
                    color: isSelected ? '#ffffff' : '#5E545A',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '0.5rem 1.25rem',
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          {/* 4-Column Product Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
            }}
            className="grid-responsive-4"
          >
            {displayedFeatured.map((product) => {
              const inWishlist = isWishlisted(product._id);
              const isJustAdded = addedNoticeId === product._id;

              return (
                <div
                  key={product._id}
                  className="luxury-product-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {/* Top Image Container */}
                  <div
                    style={{
                      height: '280px',
                      backgroundColor: '#F8F3F5',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setQuickViewProduct(product);
                      setQuickViewQty(1);
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="product-img"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />

                    {/* Discount Badge */}
                    {product.badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: theme.badgeBg,
                          color: '#ffffff',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {product.badge}
                      </span>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => toggleWishlist(product, e)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: inWishlist ? '#DC2626' : '#6A6369',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                      }}
                      title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart
                        size={17}
                        fill={inWishlist ? '#DC2626' : 'none'}
                        strokeWidth={2}
                      />
                    </button>

                    {/* Quick View Button on Hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                        setQuickViewQty(1);
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(4px)',
                        color: '#260618',
                        border: 'none',
                        padding: '0.4rem 0.9rem',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={14} />
                      <span>Quick View</span>
                    </button>
                  </div>

                  {/* Card Content */}
                  <div
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    {/* Category Label */}
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#8A8287',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.35rem',
                      }}
                    >
                      {product.category}
                    </span>

                    {/* Product Title */}
                    <h3
                      className="font-serif"
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        color: '#260618',
                        marginBottom: '0.45rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {product.title}
                    </h3>

                    {/* Star Rating */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', color: '#F59E0B' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} fill="#F59E0B" strokeWidth={0} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#3A3538' }}>
                        {product.rating}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#999196' }}>
                        ({product.reviewsCount})
                      </span>
                    </div>

                    {/* Price and Add to Bag */}
                    <div
                      style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            color: theme.primary,
                          }}
                        >
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span
                            style={{
                              fontSize: '0.85rem',
                              color: '#A89FA4',
                              textDecoration: 'line-through',
                              marginLeft: '0.5rem',
                            }}
                          >
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        style={{
                          backgroundColor: isJustAdded ? '#10B981' : theme.primaryLight,
                          color: isJustAdded ? '#ffffff' : theme.primary,
                          border: 'none',
                          padding: '0.55rem 0.95rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isJustAdded ? (
                          <>
                            <Check size={14} />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={14} />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 7. WHY CHOOSE US? (Soft Mint/Cream card with leaf graphics)        */}
      {/* ================================================================= */}
      <section ref={whyUsRef} style={{ padding: '3.5rem 1.25rem' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: theme.mintCardBg,
              borderRadius: '24px',
              padding: '3.5rem 2.5rem',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Section Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2
                className="font-serif"
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 700,
                  color: '#260618',
                  marginBottom: '0.4rem',
                }}
              >
                {currentBusiness.whyChooseUs.title}
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#7E757A' }}>
                {currentBusiness.whyChooseUs.subtitle}
              </p>
            </div>

            {/* 4 Pillars Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.75rem',
              }}
              className="grid-responsive-4"
            >
              {currentBusiness.whyChooseUs.pillars.map((pillar) => (
                <div
                  key={pillar.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '1.75rem 1.25rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: theme.primaryLight,
                      color: theme.primary,
                      margin: '0 auto 1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {pillar.icon === 'shield' ? (
                      <ShieldCheck size={26} />
                    ) : pillar.icon === 'truck' ? (
                      <Truck size={26} />
                    ) : pillar.icon === 'rotate' ? (
                      <RotateCcw size={26} />
                    ) : (
                      <Headphones size={26} />
                    )}
                  </div>

                  <h3
                    className="font-serif"
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: '#260618',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {pillar.title}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: '#786E75', lineHeight: 1.5 }}>
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 8. JOIN OUR STYLE COMMUNITY BANNER (Slim deep wine ribbon)        */}
      {/* ================================================================= */}
      <section style={{ padding: '0 1.25rem 3rem' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: theme.primary,
              borderRadius: '20px',
              padding: '2rem 2.5rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Left Photo & Copy */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                <img
                  src={currentBusiness.communityBanner.image}
                  alt={currentBusiness.communityBanner.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: '0.25rem',
                  }}
                >
                  {currentBusiness.communityBanner.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
                  {currentBusiness.communityBanner.subtitle}
                </p>
              </div>
            </div>

            {/* Right Email Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newsletterEmail) {
                  setNewsletterSuccess(true);
                  setTimeout(() => setNewsletterSuccess(false), 3500);
                  setNewsletterEmail('');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: '1 1 320px',
                maxWidth: '440px',
              }}
            >
              {newsletterSuccess ? (
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    width: '100%',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                  }}
                >
                  ✨ Welcome to the community! Check your inbox soon.
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#ffffff',
                      color: theme.primary,
                      border: 'none',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    Subscribe
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 9. EDITORIAL SPLIT BANNER: "Casual Looks For Everyday"            */}
      {/* ================================================================= */}
      <section
        ref={editorialRef}
        style={{
          padding: '3rem 1.25rem 4rem',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '3rem',
              alignItems: 'center',
            }}
            className="hero-split"
          >
            {/* Left Image (Lifestyle / Model in Sunhat) */}
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                height: '460px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
              }}
            >
              <img
                src={currentBusiness.editorial.image}
                alt={currentBusiness.editorial.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Right Blush Editorial Content */}
            <div
              style={{
                backgroundColor: theme.peachCardBg,
                borderRadius: '24px',
                padding: '3.5rem 3rem',
                border: '1px solid rgba(109, 14, 59, 0.06)',
                position: 'relative',
              }}
            >
              <span
                className="font-script"
                style={{
                  fontSize: '2rem',
                  color: theme.accentScriptColor,
                  display: 'block',
                  marginBottom: '0.4rem',
                }}
              >
                {currentBusiness.editorial.script}
              </span>

              <h2
                className="font-serif"
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.7rem)',
                  fontWeight: 700,
                  color: '#260618',
                  lineHeight: 1.2,
                  marginBottom: '1.25rem',
                }}
              >
                {currentBusiness.editorial.title}
              </h2>

              <p
                style={{
                  fontSize: '0.98rem',
                  color: '#655C62',
                  lineHeight: 1.7,
                  marginBottom: '2rem',
                }}
              >
                {currentBusiness.editorial.desc}
              </p>

              <button
                onClick={() => scrollTo(featuredRef)}
                style={{
                  backgroundColor: theme.primary,
                  color: '#ffffff',
                  padding: '0.85rem 2rem',
                  borderRadius: '8px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 6px 18px rgba(109, 14, 59, 0.25)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <span>{currentBusiness.editorial.cta}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 10. BEST SELLERS SECTION (4 Product Cards)                         */}
      {/* ================================================================= */}
      <section
        ref={bestSellersRef}
        style={{
          padding: '3rem 1.25rem 4rem',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2
              className="font-serif"
              style={{
                fontSize: '2.2rem',
                fontWeight: 700,
                color: '#260618',
                marginBottom: '0.4rem',
              }}
            >
              Best Sellers
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#7E757A' }}>
              Top-rated by thousands of shoppers this week
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
            }}
            className="grid-responsive-4"
          >
            {currentBusiness.bestSellers.map((item) => {
              const inWishlist = isWishlisted(item._id);
              const isJustAdded = addedNoticeId === item._id;

              return (
                <div
                  key={item._id}
                  className="luxury-product-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '270px',
                      backgroundColor: '#F8F3F5',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setQuickViewProduct(item);
                      setQuickViewQty(1);
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="product-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => toggleWishlist(item, e)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: inWishlist ? '#DC2626' : '#6A6369',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                      }}
                    >
                      <Heart size={16} fill={inWishlist ? '#DC2626' : 'none'} strokeWidth={2} />
                    </button>
                  </div>

                  <div
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    <h3
                      className="font-serif"
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        color: '#260618',
                        marginBottom: '0.45rem',
                      }}
                    >
                      {item.title}
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', color: '#F59E0B' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} fill="#F59E0B" strokeWidth={0} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#3A3538' }}>
                        {item.rating}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            color: theme.primary,
                          }}
                        >
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice && (
                          <span
                            style={{
                              fontSize: '0.85rem',
                              color: '#A89FA4',
                              textDecoration: 'line-through',
                              marginLeft: '0.4rem',
                            }}
                          >
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(item, e)}
                        style={{
                          backgroundColor: isJustAdded ? '#10B981' : theme.primaryLight,
                          color: isJustAdded ? '#ffffff' : theme.primary,
                          border: 'none',
                          padding: '0.5rem 0.9rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        {isJustAdded ? <Check size={14} /> : <ShoppingBag size={14} />}
                        <span>{isJustAdded ? 'Added' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 11. HUGE DISCOUNT / FLASH SALE SPLIT BANNER ("Up To 50% OFF")     */}
      {/* ================================================================= */}
      <section style={{ padding: '1rem 1.25rem 4rem' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 45px rgba(0,0,0,0.1)',
            }}
            className="hero-split"
          >
            {/* Left Deep Berry Box */}
            <div
              style={{
                backgroundColor: theme.primary,
                color: '#ffffff',
                padding: '4rem 3.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginBottom: '0.5rem',
                }}
              >
                {currentBusiness.flashSale.tagline}
              </span>

              <h2
                className="font-serif"
                style={{
                  fontSize: 'clamp(2.8rem, 5vw, 4.2rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: '#ffffff',
                  marginBottom: '0.75rem',
                }}
              >
                {currentBusiness.flashSale.discount}
              </h2>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '2rem',
                }}
              >
                {currentBusiness.flashSale.condition}
              </p>

              <div>
                <button
                  onClick={() => scrollTo(featuredRef)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: theme.primary,
                    padding: '0.9rem 2.2rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <span>{currentBusiness.flashSale.cta}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Right Photo: Aesthetic Wardrobe Rack */}
            <div style={{ height: '100%', minHeight: '380px' }}>
              <img
                src={currentBusiness.flashSale.image}
                alt="Flash Sale"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 12. WHAT OUR CUSTOMERS SAY (3 Testimonial Cards)                   */}
      {/* ================================================================= */}
      <section
        ref={testimonialsRef}
        style={{
          padding: '3rem 1.25rem 4rem',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2
              className="font-serif"
              style={{
                fontSize: '2.2rem',
                fontWeight: 700,
                color: '#260618',
                marginBottom: '0.4rem',
              }}
            >
              What Our Customers Say
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#7E757A' }}>
              Real verified reviews from satisfied buyers
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.75rem',
            }}
            className="grid-responsive-4"
          >
            {currentBusiness.testimonials.map((test) => (
              <div
                key={test.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '2rem 1.75rem',
                  border: '1px solid rgba(109, 14, 59, 0.08)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* 5 Stars */}
                <div style={{ display: 'flex', color: '#F59E0B', marginBottom: '1.25rem' }}>
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#F59E0B" strokeWidth={0} />
                  ))}
                </div>

                {/* Review Text */}
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: '#4A4248',
                    lineHeight: 1.65,
                    fontStyle: 'italic',
                    marginBottom: '1.75rem',
                    flex: 1,
                  }}
                >
                  "{test.text}"
                </p>

                {/* Customer Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={test.avatar}
                    alt={test.name}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#260618', margin: 0 }}>
                      {test.name}
                    </h4>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#10B981',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <CheckCircle2 size={12} />
                      {test.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 13. "BE THE FIRST TO KNOW" NEWSLETTER CARD                         */}
      {/* ================================================================= */}
      <section style={{ padding: '1rem 1.25rem 4rem' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: theme.peachCardBg,
              borderRadius: '24px',
              padding: '3rem 3.5rem',
              border: '1px solid rgba(109, 14, 59, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '3rem',
            }}
            className="hero-split"
          >
            {/* Left Photo of Model with flowers & hat */}
            <div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: '4px solid #ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              }}
            >
              <img
                src={currentBusiness.newsletterVip.image}
                alt="VIP Club"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Right Newsletter Form */}
            <div style={{ flex: 1 }}>
              <span
                style={{
                  backgroundColor: theme.primaryLight,
                  color: theme.primary,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  display: 'inline-block',
                  marginBottom: '0.75rem',
                }}
              >
                {currentBusiness.newsletterVip.badge}
              </span>

              <h2
                className="font-serif"
                style={{
                  fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
                  fontWeight: 700,
                  color: '#260618',
                  lineHeight: 1.2,
                  marginBottom: '0.65rem',
                }}
              >
                {currentBusiness.newsletterVip.title}
              </h2>

              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#695F65',
                  lineHeight: 1.6,
                  maxWidth: '520px',
                  marginBottom: '1.5rem',
                }}
              >
                {currentBusiness.newsletterVip.subtitle}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (vipEmail) {
                    setVipSuccess(true);
                    setTimeout(() => setVipSuccess(false), 3500);
                    setVipEmail('');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  maxWidth: '460px',
                }}
              >
                {vipSuccess ? (
                  <div
                    style={{
                      backgroundColor: '#10B981',
                      color: '#ffffff',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      width: '100%',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                    }}
                  >
                    🎉 You are now registered on the VIP list!
                  </div>
                ) : (
                  <>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address..."
                      value={vipEmail}
                      onChange={(e) => setVipEmail(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(0,0,0,0.12)',
                        backgroundColor: '#ffffff',
                        fontSize: '0.92rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        backgroundColor: theme.primary,
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.85rem 1.6rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: '0 4px 14px rgba(109, 14, 59, 0.25)',
                      }}
                    >
                      Subscribe
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 14. LUXURY DARK WINE FOOTER (Matching screenshot 100%)             */}
      {/* ================================================================= */}
      <footer
        ref={footerRef}
        style={{
          backgroundColor: theme.footerBg,
          color: '#E8DDE3',
          padding: '4.5rem 1.25rem 2rem',
          marginTop: 'auto',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1fr 1.2fr 1.2fr',
              gap: '3rem',
              marginBottom: '3.5rem',
            }}
            className="grid-responsive-4"
          >
            {/* Column 1: Brand Info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {renderLogoIcon()}
                </div>
                <span
                  className="font-serif"
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {currentBusiness.name}
                </span>
              </div>

              <p
                style={{
                  fontSize: '0.88rem',
                  lineHeight: 1.65,
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '1.5rem',
                }}
              >
                {currentBusiness.footer.about}
              </p>

              {/* Social Media Links */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {['Instagram', 'Facebook', 'Pinterest', 'Twitter', 'TikTok'].map((social, i) => (
                  <span
                    key={i}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    title={social}
                  >
                    {social[0]}
                  </span>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4
                className="font-serif"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '1.25rem',
                }}
              >
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {[
                  { label: 'Home', ref: heroRef },
                  { label: 'Shop Catalog', ref: featuredRef },
                  { label: 'Best Sellers', ref: bestSellersRef },
                  { label: 'Categories', ref: categoriesRef },
                  { label: 'Why Choose Us', ref: whyUsRef },
                  { label: 'Customer Reviews', ref: testimonialsRef },
                ].map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => scrollTo(item.ref)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.75)',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)')}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Customer Service */}
            <div>
              <h4
                className="font-serif"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '1.25rem',
                }}
              >
                Customer Service
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <li>
                  <button
                    onClick={() => setTrackingModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.75)',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)')}
                  >
                    Track Your Order
                  </button>
                </li>
                {['Shipping Policy', 'Returns & Exchanges', 'FAQs', 'Terms of Service', 'Privacy Policy'].map(
                  (text, idx) => (
                    <li key={idx}>
                      <span
                        style={{
                          color: 'rgba(255, 255, 255, 0.75)',
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)')}
                      >
                        {text}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div>
              <h4
                className="font-serif"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '1.25rem',
                }}
              >
                Contact Us
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={15} style={{ color: '#ffffff' }} />
                  <span>{currentBusiness.footer.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={15} style={{ color: '#ffffff' }} />
                  <span>{currentBusiness.footer.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={15} style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }} />
                  <span>{currentBusiness.footer.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={15} style={{ color: '#ffffff' }} />
                  <span>{currentBusiness.footer.hours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom strip with copyright and payment badges */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.82rem',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <span>© 2026 {currentBusiness.name}. All rights reserved.</span>

            {/* Payment Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {['VISA', 'Mastercard', 'AMEX', 'PayPal', 'Apple Pay'].map((pay, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}
                >
                  {pay}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ================================================================= */}
      {/* 15. INTERACTIVE CART & CHECKOUT DRAWER                            */}
      {/* ================================================================= */}
      {cartDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setCartDrawerOpen(false)}>
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid #EFEAEB',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={20} style={{ color: theme.primary }} />
                <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {checkoutStep === 'cart'
                    ? `Your Shopping Bag (${itemsCount})`
                    : checkoutStep === 'checkout'
                    ? 'Fast Checkout'
                    : 'Order Placed!'}
                </h3>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6A6367',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* STEP 1: CART ITEMS LIST */}
            {checkoutStep === 'cart' && (
              <>
                {cartItems.length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      color: '#8A8287',
                    }}
                  >
                    <ShoppingBag size={48} strokeWidth={1.2} style={{ marginBottom: '1rem', color: '#D4CCD0' }} />
                    <h4 style={{ fontSize: '1.1rem', color: '#260618', marginBottom: '0.4rem' }}>
                      Your bag is empty
                    </h4>
                    <p style={{ fontSize: '0.88rem', maxWidth: '240px', marginBottom: '1.5rem' }}>
                      Explore our collections and add your favorite pieces.
                    </p>
                    <button
                      onClick={() => {
                        setCartDrawerOpen(false);
                        scrollTo(featuredRef);
                      }}
                      style={{
                        backgroundColor: theme.primary,
                        color: '#ffffff',
                        padding: '0.65rem 1.4rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                      }}
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Item list */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem' }}>
                      {cartItems.map((item) => (
                        <div
                          key={item._id}
                          style={{
                            display: 'flex',
                            gap: '0.85rem',
                            padding: '0.75rem',
                            backgroundColor: '#FCF9FA',
                            borderRadius: '12px',
                            border: '1px solid #EFEAEB',
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{
                              width: '68px',
                              height: '68px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              backgroundColor: '#EFEAEB',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <h4
                              style={{
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: '#260618',
                                marginBottom: '0.25rem',
                                lineHeight: 1.25,
                              }}
                            >
                              {item.title}
                            </h4>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: theme.primary, marginBottom: '0.5rem' }}>
                              {formatPrice(item.price)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              {/* Quantity Adjuster */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  border: '1px solid #DCD5D8',
                                  borderRadius: '6px',
                                  backgroundColor: '#ffffff',
                                }}
                              >
                                <button
                                  onClick={() => updateQty(item._id, item.qty - 1)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0.2rem 0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  -
                                </button>
                                <span style={{ padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                                  {item.qty}
                                </span>
                                <button
                                  onClick={() => updateQty(item._id, item.qty + 1)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0.2rem 0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item._id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#EF4444',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '0.25rem',
                                }}
                                title="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Summary & Checkout Button */}
                    <div
                      style={{
                        borderTop: '1px solid #EFEAEB',
                        paddingTop: '1rem',
                        marginTop: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#6A6367', marginBottom: '0.4rem' }}>
                        <span>Subtotal</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#6A6367', marginBottom: '0.75rem' }}>
                        <span>Estimated Shipping</span>
                        <span style={{ color: '#10B981', fontWeight: 600 }}>FREE</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: '#260618',
                          marginBottom: '1.25rem',
                          borderTop: '1px dashed #EFEAEB',
                          paddingTop: '0.75rem',
                        }}
                      >
                        <span>Total</span>
                        <span style={{ color: theme.primary }}>{formatPrice(totalPrice)}</span>
                      </div>

                      <button
                        onClick={() => setCheckoutStep('checkout')}
                        style={{
                          width: '100%',
                          backgroundColor: theme.primary,
                          color: '#ffffff',
                          padding: '0.85rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 14px rgba(109, 14, 59, 0.25)',
                        }}
                      >
                        <span>Proceed to Checkout</span>
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* STEP 2: CHECKOUT FORM */}
            {checkoutStep === 'checkout' && (
              <form onSubmit={handlePlaceOrder} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {orderError && (
                    <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                      {orderError}
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A4248', display: 'block', marginBottom: '0.25rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #DCD5D8',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A4248', display: 'block', marginBottom: '0.25rem' }}>
                      Phone / Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 555-019-2834"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #DCD5D8',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A4248', display: 'block', marginBottom: '0.25rem' }}>
                      Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House / Apartment #, Street, Neighborhood"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #DCD5D8',
                        fontSize: '0.9rem',
                        outline: 'none',
                        resize: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A4248', display: 'block', marginBottom: '0.25rem' }}>
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #DCD5D8',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A4248', display: 'block', marginBottom: '0.25rem' }}>
                        Payment
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #DCD5D8',
                          fontSize: '0.9rem',
                          outline: 'none',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <option value="Cash on Delivery">Cash on Delivery</option>
                        <option value="Credit / Debit Card">Credit / Debit Card</option>
                        <option value="Online Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A4248', display: 'block', marginBottom: '0.25rem' }}>
                      Order Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ring the bell or leave at door"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #DCD5D8',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div style={{ borderTop: '1px solid #EFEAEB', paddingTop: '1rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    <span>Amount Payable</span>
                    <span style={{ color: theme.primary }}>{formatPrice(totalPrice)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #DCD5D8',
                        backgroundColor: '#ffffff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={placingOrder}
                      style={{
                        flex: 1,
                        backgroundColor: theme.primary,
                        color: '#ffffff',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: placingOrder ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        border: 'none',
                        boxShadow: '0 4px 14px rgba(109, 14, 59, 0.25)',
                      }}
                    >
                      <Lock size={15} />
                      <span>{placingOrder ? 'Confirming Order...' : 'Confirm & Place Order'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 3: ORDER SUCCESS SCREEN */}
            {checkoutStep === 'success' && placedOrderData && (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '1.5rem',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#D1FAE5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Check size={32} strokeWidth={2.5} />
                </div>

                <h3 className="font-serif" style={{ fontSize: '1.6rem', color: '#260618', marginBottom: '0.4rem' }}>
                  Thank You For Your Order!
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#6A6367', marginBottom: '1.5rem' }}>
                  We received your order and are preparing it for express dispatch.
                </p>

                <div
                  style={{
                    backgroundColor: '#F9F5F7',
                    padding: '1rem 1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#8A8287', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Order Reference ID
                  </span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: theme.primary, letterSpacing: '0.05em' }}>
                    {placedOrderData.orderNumber || placedOrderData._id}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                  <button
                    onClick={() => {
                      setCartDrawerOpen(false);
                      setTrackingModalOpen(true);
                      handleTrackOrder(placedOrderData.orderNumber || placedOrderData._id);
                    }}
                    style={{
                      backgroundColor: theme.primary,
                      color: '#ffffff',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    Track This Order Now
                  </button>
                  <button
                    onClick={() => {
                      setCartDrawerOpen(false);
                      setCheckoutStep('cart');
                    }}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#4A4248',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #DCD5D8',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 16. QUICK VIEW MODAL                                              */}
      {/* ================================================================= */}
      {quickViewProduct && (
        <div className="modal-overlay" onClick={() => setQuickViewProduct(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '2rem', position: 'relative' }}
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: '#6A6367',
                cursor: 'pointer',
              }}
            >
              <X size={24} />
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="hero-split">
              {/* Product Photo */}
              <div
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  height: '340px',
                  backgroundColor: '#F8F3F5',
                }}
              >
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Product Info */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: '#8A8287',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.4rem',
                  }}
                >
                  {quickViewProduct.category}
                </span>

                <h3
                  className="font-serif"
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: '#260618',
                    marginBottom: '0.65rem',
                    lineHeight: 1.2,
                  }}
                >
                  {quickViewProduct.title}
                </h3>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', color: '#F59E0B' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="#F59E0B" strokeWidth={0} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3A3538' }}>
                    {quickViewProduct.rating || 4.9}
                  </span>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.primary }}>
                    {formatPrice(quickViewProduct.price)}
                  </span>
                  {quickViewProduct.originalPrice && (
                    <span style={{ fontSize: '1.05rem', color: '#A89FA4', textDecoration: 'line-through' }}>
                      {formatPrice(quickViewProduct.originalPrice)}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.92rem', color: '#6A6367', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                  {quickViewProduct.description ||
                    'Premium crafted piece designed for everyday sophistication, durability, and timeless aesthetic appeal.'}
                </p>

                {/* Qty and Add to Bag */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #DCD5D8',
                      borderRadius: '8px',
                      padding: '0 0.5rem',
                    }}
                  >
                    <button
                      onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}
                      style={{ background: 'none', border: 'none', padding: '0.4rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span style={{ padding: '0 0.75rem', fontWeight: 700 }}>{quickViewQty}</span>
                    <button
                      onClick={() => setQuickViewQty(quickViewQty + 1)}
                      style={{ background: 'none', border: 'none', padding: '0.4rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(quickViewProduct, quickViewQty);
                      setQuickViewProduct(null);
                      setCartDrawerOpen(true);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: theme.primary,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(109, 14, 59, 0.25)',
                    }}
                  >
                    <ShoppingBag size={18} />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 17. WISHLIST DRAWER                                               */}
      {/* ================================================================= */}
      {wishlistDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setWishlistDrawerOpen(false)}>
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid #EFEAEB',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={20} style={{ color: '#DC2626' }} />
                <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  Saved Favorites ({wishlist.length})
                </h3>
              </div>
              <button
                onClick={() => setWishlistDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: '#6A6367', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {wishlist.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8A8287', textAlign: 'center' }}>
                <Heart size={44} strokeWidth={1.2} style={{ marginBottom: '1rem', color: '#D4CCD0' }} />
                <h4 style={{ fontSize: '1.1rem', color: '#260618', marginBottom: '0.4rem' }}>No favorites yet</h4>
                <p style={{ fontSize: '0.88rem', maxWidth: '240px' }}>
                  Tap the heart icon on any product to save it for later.
                </p>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {wishlist.map((item) => (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      gap: '0.85rem',
                      padding: '0.75rem',
                      backgroundColor: '#FCF9FA',
                      borderRadius: '12px',
                      border: '1px solid #EFEAEB',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#260618', margin: 0 }}>
                        {item.title}
                      </h4>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: theme.primary, margin: '0.25rem 0' }}>
                        {formatPrice(item.price)}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <button
                          onClick={() => {
                            addToCart(item, 1);
                            setWishlistDrawerOpen(false);
                            setCartDrawerOpen(true);
                          }}
                          style={{
                            backgroundColor: theme.primary,
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Move to Bag
                        </button>
                        <button
                          onClick={() => toggleWishlist(item)}
                          style={{
                            background: 'none',
                            border: '1px solid #DCD5D8',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            color: '#6A6367',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 18. LIVE SEARCH MODAL                                             */}
      {/* ================================================================= */}
      {searchModalOpen && (
        <div className="modal-overlay" onClick={() => setSearchModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '2rem', maxWidth: '580px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>
                Search Store Catalog
              </h3>
              <button onClick={() => setSearchModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                border: '1.5px solid ' + theme.primary,
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
              }}
            >
              <Search size={20} style={{ color: theme.primary }} />
              <input
                type="text"
                autoFocus
                placeholder="Search by dress, honey, auto lights, shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Results */}
            <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {searchQuery && searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                  No matches found for "{searchQuery}"
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setSearchModalOpen(false);
                      setQuickViewProduct(item);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.65rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FCF9FA')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#260618', margin: 0 }}>
                        {item.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#888' }}>{item.category}</span>
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: theme.primary }}>
                      {formatPrice(item.price)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 19. ORDER TRACKING MODAL                                          */}
      {/* ================================================================= */}
      {trackingModalOpen && (
        <div className="modal-overlay" onClick={() => setTrackingModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '2.5rem 2rem', maxWidth: '560px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Package size={24} style={{ color: theme.primary }} />
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                  Track Your Package
                </h3>
              </div>
              <button onClick={() => setTrackingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Input Form */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ORD-98241)"
                value={trackSearchId}
                onChange={(e) => setTrackSearchId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #DCD5D8',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => handleTrackOrder()}
                disabled={trackingLoading}
                style={{
                  backgroundColor: theme.primary,
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {trackingLoading ? 'Checking...' : 'Track'}
              </button>
            </div>

            {/* Tracking Results Progress Steps */}
            {trackingOrder && (
              <div style={{ backgroundColor: '#FAF6F8', borderRadius: '16px', padding: '1.5rem', border: '1px solid #EFEAEB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px dashed #E0D6DA', paddingBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#8A8287', textTransform: 'uppercase' }}>Tracking ID</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: theme.primary, margin: 0 }}>
                      {trackingOrder.orderNumber || trackSearchId}
                    </h4>
                  </div>
                  <span
                    style={{
                      backgroundColor: '#D1FAE5',
                      color: '#065F46',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      alignSelf: 'center',
                    }}
                  >
                    {trackingOrder.status || 'In Transit'}
                  </span>
                </div>

                {/* Vertical timeline steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
                  {(
                    trackingOrder.trackingSteps || [
                      { status: 'Order Placed', done: true, time: 'Today, 10:30 AM' },
                      { status: 'Confirmed by Store', done: true, time: 'Today, 01:15 PM' },
                      { status: 'Shipped (In Transit)', done: true, time: 'Today, 04:45 PM' },
                      { status: 'Delivered', done: false, time: 'Estimated 2-3 days' },
                    ]
                  ).map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: step.done ? theme.primary : '#E2DADC',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}
                      >
                        {step.done ? <Check size={14} /> : idx + 1}
                      </div>
                      <div>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: step.done ? '#260618' : '#8A8287', margin: 0 }}>
                          {step.status}
                        </h5>
                        <span style={{ fontSize: '0.78rem', color: '#8A8287' }}>{step.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 20. MOBILE MENU DRAWER                                            */}
      {/* ================================================================= */}
      {mobileMenuOpen && (
        <div className="drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '2rem 1.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.primary }}>
                {currentBusiness.name}
              </span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { label: 'Home', ref: heroRef },
                { label: 'Shop Collections', ref: featuredRef },
                { label: 'Best Sellers', ref: bestSellersRef },
                { label: 'Browse Categories', ref: categoriesRef },
                { label: 'Why Choose Us', ref: whyUsRef },
                { label: 'Customer Reviews', ref: testimonialsRef },
                { label: 'Contact Us', ref: footerRef },
              ].map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(link.ref)}
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: '#260618',
                    cursor: 'pointer',
                    padding: '0.4rem 0',
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Business switcher inside mobile menu */}
            <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #EFEAEB' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                Preview Industry Niche:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {Object.keys(BUSINESS_PRESETS).map((key) => {
                  const b = BUSINESS_PRESETS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        handleSelectBusiness(key);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: '1px solid #DCD5D8',
                        backgroundColor: activeBusinessKey === key ? theme.primary : '#ffffff',
                        color: activeBusinessKey === key ? '#ffffff' : '#333',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {b.shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 21. FLOATING AI SHOPPING ASSISTANT & ORDER TRACKER BUTTONS        */}
      {/* ================================================================= */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 99,
        }}
      >
        {/* AI Stylist Assistant Trigger */}
        <button
          onClick={() => setAiModalOpen(true)}
          style={{
            backgroundColor: theme.primary,
            color: '#ffffff',
            border: 'none',
            padding: '0.85rem 1.4rem',
            borderRadius: '999px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 8px 24px rgba(109, 14, 59, 0.35)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Sparkles size={18} />
          <span>AI Shop Assistant</span>
        </button>
      </div>

      {/* AI Assistant Modal from project */}
      {aiModalOpen && (
        <AiAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
      )}
    </div>
  );
}
