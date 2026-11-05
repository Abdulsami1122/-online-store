import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
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
  Share2,
  MessageCircle,
  Store,
  SlidersHorizontal,
  Bot,
} from 'lucide-react';
import { fetchProducts } from '../../api/productApi';
import { createOrder, trackOrder } from '../../api/orderApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';
import AiAssistantModal from '../../components/common/AiAssistantModal';

// Default multi-product catalog covering Honey, Car Accessories, Shoes, Fashion, Bags & Tech
// If admin adds products from backend, those products automatically appear at the TOP!
const DEFAULT_PRODUCTS = [
  {
    _id: 'prod-honey-1',
    title: 'Pure Mountain Sidr Honey (500g)',
    category: 'Honey & Organics',
    price: 2400,
    originalPrice: 3200,
    rating: 5.0,
    reviewsCount: 184,
    badge: '100% PURE RAW',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: '100% pure raw unpasteurized Sidr honey harvested from pristine wild mountain apiaries. Rich in natural live enzymes, antibacterial properties, and deep caramel sweetness.',
  },
  {
    _id: 'prod-car-1',
    title: '64-Color App-Controlled Car Ambient LED Kit',
    category: 'Car Accessories',
    price: 3500,
    originalPrice: 4800,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'TOP SELLER',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
    description: 'Universal plug-and-play fiber optic ambient lighting kit for all car models. 64 RGB colors, sound-reactive music sync, and wireless Bluetooth smartphone app control.',
  },
  {
    _id: 'prod-shoes-1',
    title: 'Aero-Glide Breathable Urban Sneakers',
    category: 'Footwear & Shoes',
    price: 2800,
    originalPrice: 3800,
    rating: 4.9,
    reviewsCount: 210,
    badge: 'BESTSELLER',
    stock: 14,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    description: 'Ultra-lightweight shock-absorbing memory foam sneakers with breathable knit mesh. Designed for all-day comfort, walking, gym, and smart-casual wear.',
  },
  {
    _id: 'prod-clothes-1',
    title: 'Classic Combed Cotton Casual T-Shirt',
    category: 'Fashion & Clothes',
    price: 1200,
    originalPrice: 1800,
    rating: 4.8,
    reviewsCount: 96,
    badge: 'PREMIUM COTTON',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    description: '100% combed ringspun cotton crew neck t-shirt. Pre-shrunk, breathable, super soft texture that maintains shape and deep color after repeated washing.',
  },
  {
    _id: 'prod-clothes-2',
    title: 'Chic Floral Chiffon Maxi Dress',
    category: 'Fashion & Clothes',
    price: 3200,
    originalPrice: 4500,
    rating: 4.9,
    reviewsCount: 118,
    badge: 'TRENDING',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
    description: 'Flowing romantic chiffon dress with an elasticated smocked waist and delicate floral prints. Lightweight, elegant, and perfect for daywear or festive outings.',
  },
  {
    _id: 'prod-car-2',
    title: 'Solar Powered Dual-Ring Car Aroma Diffuser',
    category: 'Car Accessories',
    price: 1450,
    originalPrice: 2200,
    rating: 4.7,
    reviewsCount: 88,
    badge: 'HOT ITEM',
    stock: 22,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    description: 'Aerospace-grade alloy rotating diffuser that spins automatically in sunlight. Dispenses natural alcohol-free botanical fragrance rings into your car cabin.',
  },
  {
    _id: 'prod-honey-2',
    title: 'Fresh Wild Cut Honeycomb Box (400g)',
    category: 'Honey & Organics',
    price: 1950,
    originalPrice: 2600,
    rating: 5.0,
    reviewsCount: 130,
    badge: '100% NATURAL',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80',
    description: 'Fresh cut natural beeswax comb straight from the hive frames. Chewy, delectable, and loaded with pure raw wildflower nectar and live propolis.',
  },
  {
    _id: 'prod-acc-1',
    title: 'Luxury Tan Structured Leather Handbag',
    category: 'Bags & Accessories',
    price: 2500,
    originalPrice: 3500,
    rating: 4.9,
    reviewsCount: 74,
    badge: 'ELEGANT',
    stock: 9,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    description: 'Structured premium vegan leather bag with gold hardware, dual top handles, and a detachable shoulder strap. Ample compartments for phone, wallet, and essentials.',
  },
];

// Social Brand Icons (Instagram & Facebook)
function InstagramIcon({ size = 20, color = 'currentColor', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 20, color = 'currentColor', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

// 3D Tilt Card Component for Luxury Perspective Physics & Gloss Reflection
function TiltCard({ children, className = '', style = {}, maxTilt = 8, onClick, ...props }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={cardRef}
      className={`card-3d sweep-hover ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      <div className="card-specular-glow" />
      {children}
    </div>
  );
}

// Scroll Reveal Component: Animates sections one-by-one from left and right as user scrolls,
// then stops firmly in its own place.
function ScrollRevealSection({
  children,
  direction = 'left',
  threshold = 0.12,
  delay = 0,
  className = '',
  style = {},
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Locked firmly in its own place permanently!
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold]);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';
    if (direction === 'left') return 'translate3d(-100px, 0, 0)';
    if (direction === 'right') return 'translate3d(100px, 0, 0)';
    if (direction === 'up') return 'translate3d(0, 60px, 0)';
    return 'translate3d(0, 0, 0)';
  };

  return (
    <div
      ref={sectionRef}
      className={`scroll-reveal-section ${className}`}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 1.35s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms, transform 1.35s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`,
        willChange: 'transform, opacity',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ----------------------------------------------------------------------
  // Store Settings (Persistent configuration managed via /admin/settings)
  // ----------------------------------------------------------------------
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('user_store_custom_info');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      storeName: 'TrendBazaar',
      storeTagline: 'Quality Products • Best Prices • 100% Cash on Delivery',
      whatsapp: '+92 300 1234567',
      currency: 'Rs.',
      phone: '+92 (300) 123-4567',
      email: 'orders@trendbazaar.pk',
      address: 'Shop #12, Commercial Plaza, Main Boulevard, Lahore',
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
    };
  });

  // Color Theme (Deep luxury berry / wine matching the mockup)
  const theme = {
    primary: '#6D0E3B',
    primaryHover: '#56092E',
    primaryLight: '#FDF2F5',
    primaryBorder: '#F2D3DF',
    heroBg: 'linear-gradient(135deg, #FBF2F4 0%, #F8E7EC 50%, #FCF5F7 100%)',
    promoBg: 'linear-gradient(135deg, #530B2D 0%, #6E0F3E 100%)',
    footerBg: '#36061E',
    badgeBg: '#7A1343',
    mintCardBg: '#F3F8F5',
    peachCardBg: '#FAF0ED',
    accentScriptColor: '#801446',
  };

  // ----------------------------------------------------------------------
  // Products from Backend & Catalog
  // ----------------------------------------------------------------------
  const [dbProducts, setDbProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Wishlist
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('user_store_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [addedNoticeId, setAddedNoticeId] = useState(null);
  const [copyLinkNotice, setCopyLinkNotice] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cart & Checkout
  const [cartDrawerOpen, setCartDrawerOpen] = useState(defaultOpenCart);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [customerName, setCustomerName] = useState(() => user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(() => user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(() => user?.address || '');
  const [city, setCity] = useState(() => user?.city || 'Lahore');

  // Auto-fill checkout fields when user signs in or registers
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.address) setShippingAddress(user.address);
      if (user.city) setCity(user.city);
    }
  }, [user]);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [placedOrderData, setPlacedOrderData] = useState(null);

  // Tracking
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackSearchId, setTrackSearchId] = useState('');
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  // Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // AI Assistant
  const [aiModalOpen, setAiModalOpen] = useState(defaultOpenAi);

  // Lock background body & html scrolling whenever any card, modal, or drawer is open
  // Ensuring the outside website CANNOT scroll while a card/modal is open!
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      quickViewProduct ||
      cartDrawerOpen ||
      wishlistDrawerOpen ||
      searchModalOpen ||
      trackingModalOpen ||
      mobileMenuOpen ||
      aiModalOpen
    );

    if (isAnyModalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (quickViewProduct) setQuickViewProduct(null);
        if (cartDrawerOpen) setCartDrawerOpen(false);
        if (wishlistDrawerOpen) setWishlistDrawerOpen(false);
        if (searchModalOpen) setSearchModalOpen(false);
        if (trackingModalOpen) setTrackingModalOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
        if (aiModalOpen) setAiModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.paddingRight = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    quickViewProduct,
    cartDrawerOpen,
    wishlistDrawerOpen,
    searchModalOpen,
    trackingModalOpen,
    mobileMenuOpen,
    aiModalOpen,
  ]);

  // Refs for scrolling
  const heroRef = useRef(null);
  const categoriesRef = useRef(null);
  const productsRef = useRef(null);
  const whyUsRef = useRef(null);
  const bestSellersRef = useRef(null);
  const reviewsRef = useRef(null);
  const footerRef = useRef(null);

  // Fetch real products from backend database
  const loadDbProducts = async () => {
    try {
      const data = await fetchProducts();
      if (data && Array.isArray(data)) {
        setDbProducts(data);
      }
    } catch (err) {
      console.log('No DB products or offline, fallback to built-in catalog');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadDbProducts();
  }, []);

  // Save wishlist
  useEffect(() => {
    localStorage.setItem('user_store_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Combined product list: DB products (at the very top) + default catalog
  const allProducts = [
    ...dbProducts,
    ...DEFAULT_PRODUCTS.filter(
      (def) => !dbProducts.some((db) => db.title?.toLowerCase() === def.title?.toLowerCase())
    ),
  ];

  // Dynamic Categories from all products
  const uniqueCategories = ['All', ...new Set(allProducts.map((p) => p.category || 'General'))];

  // Map category images for "Shop by Category"
  const getCategoryImage = (catName) => {
    const found = allProducts.find((p) => p.category === catName);
    if (found && found.image) return found.image;
    if (catName.toLowerCase().includes('honey'))
      return 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80';
    if (catName.toLowerCase().includes('car'))
      return 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80';
    if (catName.toLowerCase().includes('shoe') || catName.toLowerCase().includes('footwear'))
      return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80';
    if (catName.toLowerCase().includes('cloth') || catName.toLowerCase().includes('fashion'))
      return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80';
    return 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80';
  };

  // ----------------------------------------------------------------------
  // Direct Facebook / Daraz Post Link Handler (?product=<id> or ?id=...)
  // If customer clicks a link from FB post, open Instant Buy Now drawer immediately!
  // ----------------------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedProductId = params.get('product') || params.get('id') || params.get('buy');
    if (linkedProductId) {
      const match = allProducts.find(
        (p) =>
          p._id === linkedProductId ||
          p.slug === linkedProductId ||
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === linkedProductId
      );
      if (match) {
        // Pre-add to cart and open checkout drawer
        addToCart(match, 1);
        setCartDrawerOpen(true);
        setCheckoutStep('checkout');
        setTimeout(() => {
          productsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [allProducts.length]);

  // Price Formatter
  const formatPrice = (amount) => {
    const num = Number(amount) || 0;
    const curr = storeSettings.currency || 'Rs.';
    if (curr === '$') {
      return `$${num.toFixed(2)}`;
    }
    return `Rs. ${num.toLocaleString()}`;
  };

  // Filtered Products
  const filteredProducts = allProducts.filter((p) => {
    const matchCat =
      selectedCategory === 'All' ||
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchSearch =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Best Sellers (first 4 items with high rating)
  const bestSellers = allProducts.slice(0, 4);

  // Cart & Buy Now Handlers
  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setAddedNoticeId(product._id);
    setTimeout(() => setAddedNoticeId(null), 1400);
  };

  const handleBuyNowInstant = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setCartDrawerOpen(true);
    setCheckoutStep('checkout');
  };

  // WhatsApp Order Link Generator
  const openWhatsAppOrder = (product, e) => {
    if (e) e.stopPropagation();
    const phoneClean = (storeSettings.whatsapp || '+923001234567').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi, I want to order this product from your Facebook/Online Store:\n\n📦 Product: ${product.title}\n💰 Price: ${formatPrice(product.price)}\n\nPlease confirm availability and Cash on Delivery details!`
    );
    window.open(`https://wa.me/${phoneClean}?text=${message}`, '_blank');
  };

  // Copy Direct Product Link for Facebook / Daraz Posts
  const handleCopyProductLink = (product, e) => {
    if (e) e.stopPropagation();
    const baseUrl = window.location.origin + window.location.pathname;
    const directUrl = `${baseUrl}?product=${product._id}`;
    navigator.clipboard.writeText(directUrl);
    setCopyLinkNotice(product._id);
    setTimeout(() => setCopyLinkNotice(null), 2000);
  };

  // Wishlist toggle
  const toggleWishlist = (product, e) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      return exists ? prev.filter((item) => item._id !== product._id) : [...prev, product];
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
      setOrderError('Please provide full name, WhatsApp/mobile number, and complete delivery address.');
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
        deliveryCharges: 199,
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
      setTrackSearchId(result.orderNumber || result._id);
      clearCart();
      setCheckoutStep('success');
    } catch (err) {
      console.error('Order placement error:', err);
      setOrderError(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
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
      setTrackingOrder({
        orderNumber: id.trim(),
        status: 'Shipped',
        createdAt: new Date().toISOString(),
        customerName: customerName || 'Valued Buyer',
        trackingSteps: [
          { status: 'Order Placed (Cash on Delivery)', done: true, time: 'Today, 10:30 AM' },
          { status: 'Packed & Verified by Seller', done: true, time: 'Today, 01:15 PM' },
          { status: 'In Transit with Courier (TCS / Leopard)', done: true, time: 'Today, 04:45 PM' },
          { status: 'Delivered to Doorstep', done: false, time: 'Estimated within 24-48 hrs' },
        ],
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        color: '#1E1E24',
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="font-sans"
    >
      {/* ================================================================= */}
      {/* 1. TOP ADVERTISEMENT MARQUEE CAROUSEL (Text flows from right)     */}
      {/* ================================================================= */}
      <div className="advertisement-ticker-wrap">
        <div className="advertisement-ticker-track">
          {[0, 1].map((loopIdx) => (
            <div key={loopIdx} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span className="advertisement-item">
                <span>✨ 100% CASH ON DELIVERY AVAILABLE</span>
                <span className="dot-divider" />
              </span>
              <span className="advertisement-item">
                <span>🚀 2-4 DAYS FAST SHIPPING</span>
                <span className="dot-divider" />
              </span>
              <span className="advertisement-item">
                <span>📦 OPEN PARCEL BEFORE PAYMENT</span>
                <span className="dot-divider" />
              </span>
              <span className="advertisement-item">
                <span>🔄 7-DAY EASY REPLACEMENT & MONEY BACK</span>
                <span className="dot-divider" />
              </span>
              <span className="advertisement-item">
                <span>💬 DIRECT WHATSAPP SELLER HELPLINE: {storeSettings.whatsapp}</span>
                <span className="dot-divider" />
              </span>
              <span className="advertisement-item">
                <span>⭐ VERIFIED QUALITY • FACEBOOK MARKETPLACE & DARAZ STORES</span>
                <span className="dot-divider" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. MAIN HEADER (Logo, Nav Links, Search, Wishlist, Cart)          */}
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
          {/* Left: Brand Logo & Customizable Store Name */}
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
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: theme.primaryLight,
                color: theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <Store size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span
                  className="font-serif"
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: theme.primary,
                    letterSpacing: '-0.02em',
                    display: 'block',
                    lineHeight: 1.1,
                  }}
                >
                  {storeSettings.storeName}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#8A8588',
                  letterSpacing: '0.04em',
                  fontWeight: 600,
                }}
              >
                {storeSettings.storeTagline}
              </span>
            </div>
          </div>

          {/* Center: Navigation Menu Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '2.25rem',
            }}
            className="desktop-nav"
          >
            {[
              { label: 'Home', ref: heroRef },
              { label: 'Shop All', ref: productsRef },
              { label: 'Categories', ref: categoriesRef },
              { label: 'Best Sellers', ref: bestSellersRef },
              { label: 'Contact', ref: footerRef },
            ].map((link, idx) => (
              <button
                key={idx}
                onClick={() => scrollTo(link.ref)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.96rem',
                  fontWeight: 600,
                  color: theme.primary,
                  cursor: 'pointer',
                  padding: '0.35rem 0',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.01em',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.primaryHover;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme.primary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: Search, Wishlist, Account, Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Search */}
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
                cursor: 'pointer',
              }}
              title="Search products"
            >
              <Search size={21} strokeWidth={1.8} />
            </button>

            {/* Wishlist */}
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
                cursor: 'pointer',
              }}
              title="Saved items"
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

            {/* Shopping Bag / Cart */}
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
                cursor: 'pointer',
              }}
              title="Shopping Bag"
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

            {/* Mobile Nav Toggle */}
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
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        <style>{`
          @media (min-width: 900px) {
            .desktop-nav { display: flex !important; }
            .mobile-nav-toggle { display: none !important; }
          }
        `}</style>
      </header>

      {/* ================================================================= */}
      {/* 3. HERO SECTION (Universal All-in-One Multi-Product Store Hero)     */}
      {/* ================================================================= */}
      <section
        ref={heroRef}
        style={{
          background: theme.heroBg,
          padding: '4rem 1.25rem 3.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="bg-botanical hero-fade-in"
      >
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
          <div style={{ flex: 1.15, maxWidth: '600px' }}>
            <div
              className="font-script"
              style={{
                fontSize: '2rem',
                color: theme.accentScriptColor,
                lineHeight: 1.2,
                marginBottom: '0.5rem',
              }}
            >
              ✨ Direct From Verified Sellers
            </div>

            <h1
              className="font-serif"
              style={{
                fontSize: 'clamp(2.3rem, 4.6vw, 3.6rem)',
                fontWeight: 700,
                color: '#260618',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '1.25rem',
              }}
            >
              Premium Quality Products for Everyday Life
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                color: '#635961',
                lineHeight: 1.65,
                marginBottom: '2rem',
              }}
            >
              Shop pure natural honey, luxury car decoration, premium footwear, trending fashion, and daily essentials.
              Order with 100% Cash on Delivery and open parcel delivery.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <button
                onClick={() => scrollTo(productsRef)}
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
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.primaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.primary)}
              >
                <span>Shop All Products</span>
                <ArrowRight size={18} />
              </button>

              {/* Instagram & Facebook Social Icons */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
                <a
                  href={storeSettings.instagram || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    border: `1.5px solid ${theme.primaryBorder}`,
                    backgroundColor: theme.primaryLight,
                    color: theme.primary,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(109, 14, 59, 0.08)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E1306C';
                    e.currentTarget.style.borderColor = '#E1306C';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(225, 48, 108, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primaryLight;
                    e.currentTarget.style.borderColor = theme.primaryBorder;
                    e.currentTarget.style.color = theme.primary;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(109, 14, 59, 0.08)';
                  }}
                  title="Follow on Instagram"
                  aria-label="Instagram"
                >
                  <InstagramIcon size={22} />
                </a>

                <a
                  href={storeSettings.facebook || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    border: `1.5px solid ${theme.primaryBorder}`,
                    backgroundColor: theme.primaryLight,
                    color: theme.primary,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(109, 14, 59, 0.08)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1877F2';
                    e.currentTarget.style.borderColor = '#1877F2';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(24, 119, 242, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primaryLight;
                    e.currentTarget.style.borderColor = theme.primaryBorder;
                    e.currentTarget.style.color = theme.primary;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(109, 14, 59, 0.08)';
                  }}
                  title="Follow on Facebook"
                  aria-label="Facebook"
                >
                  <FacebookIcon size={22} />
                </a>
              </div>
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
              {[
                { title: 'Cash on Delivery', subtitle: 'Pay when parcel arrives', icon: 'truck' },
                { title: '7-Day Return', subtitle: 'Hassle-free guarantee', icon: 'rotate' },
                { title: 'WhatsApp Help', subtitle: storeSettings.whatsapp, icon: 'headset' },
              ].map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
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

          {/* Right Column: Hero Collage Photo Frame + Floating Badge */}
          <div style={{ flex: 0.85, position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div
              className="arch-frame hero-3d-frame"
              style={{
                width: '100%',
                maxWidth: '430px',
                height: '520px',
                position: 'relative',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"
                alt="Online Store Showcase"
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
              className="animate-float font-script depth-badge"
              style={{
                position: 'absolute',
                top: '30px',
                right: '-15px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
              100% Genuine Quality
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. SHOP BY CATEGORY (Dynamically extracted from all products)      */}
      {/* ================================================================= */}
      <ScrollRevealSection direction="left">
        <section
          ref={categoriesRef}
          style={{
            padding: '4.5rem 1.25rem 3rem',
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
                Shop by Category
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#7E757A' }}>
                Explore versatile collections curated directly for social commerce buyers
              </p>
            </div>

            {/* Dynamic Category Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {uniqueCategories
                .filter((c) => c !== 'All')
                .map((catName, idx) => {
                  const count = allProducts.filter((p) => p.category === catName).length;
                  const catImg = getCategoryImage(catName);

                  return (
                    <TiltCard
                      key={idx}
                      onClick={() => {
                        setSelectedCategory(catName);
                        scrollTo(productsRef);
                      }}
                      className="category-card"
                      style={{
                        backgroundColor: '#FCF9FA',
                        borderRadius: '16px',
                        padding: '1.4rem 1rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        className="depth-image"
                        style={{
                          width: '105px',
                          height: '105px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          marginBottom: '1rem',
                          backgroundColor: '#EDE3E7',
                        }}
                      >
                        <img
                          src={catImg}
                          alt={catName}
                          className="cat-img"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                          }}
                        />
                      </div>

                      <div className="depth-content">
                        <h3
                          className="font-serif"
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            color: '#260618',
                            marginBottom: '0.2rem',
                          }}
                        >
                          {catName}
                        </h3>

                        <span style={{ fontSize: '0.78rem', color: '#8F868C', marginBottom: '0.5rem', display: 'block' }}>
                          {count} items
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
                          Explore →
                        </span>
                      </div>
                    </TiltCard>
                  );
                })}
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ================================================================= */}
      {/* 5. PROMO BANNER (Direct From Facebook / Daraz Seller Guarantee)   */}
      {/* ================================================================= */}
      <ScrollRevealSection direction="right">
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
              <div style={{ position: 'relative', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '190px',
                    height: '190px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid rgba(255, 255, 255, 0.35)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                    backgroundColor: '#4A0826',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80"
                    alt="Verified Direct Store"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#ffffff',
                    color: theme.primary,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span>📦 Open Parcel Verified</span>
                </div>
              </div>

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
                  SOCIAL COMMERCE DIRECT STORE
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
                  Buy Direct With Guaranteed Open Parcel Delivery
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
                  Linked here from Facebook Marketplace, Daraz, or Instagram? Enjoy zero marketplace hidden fees,
                  100% verified genuine products, and instant cash on delivery at your doorstep.
                </p>

                <button
                  onClick={() => scrollTo(productsRef)}
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
                  <span>Browse Full Catalog</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ================================================================= */}
      {/* 6. FEATURED COLLECTION (Shows Admin Products & Filter Tabs)        */}
      {/* ================================================================= */}
      <ScrollRevealSection direction="left">
        <section
          ref={productsRef}
          style={{
            padding: '4rem 1.25rem 3rem',
            backgroundColor: '#FFFFFF',
          }}
        >
        <div className="container">
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
              Handpicked items ready for immediate dispatch across the country
            </p>
          </div>

          {/* Dynamic Category Filter Pills */}
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
            {uniqueCategories.map((catName) => {
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

          {/* Products Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
            }}
            className="grid-responsive-4"
          >
            {filteredProducts.map((product) => {
              const inWishlist = isWishlisted(product._id);
              const isJustAdded = addedNoticeId === product._id;
              const isLinkCopied = copyLinkNotice === product._id;

              return (
                <TiltCard
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
                  {/* Product Image */}
                  <div
                    className="depth-image"
                    style={{
                      height: '270px',
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

                    {/* Badge */}
                    {product.badge && (
                      <span
                        className="depth-badge"
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: theme.badgeBg,
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                        }}
                      >
                        {product.badge}
                      </span>
                    )}

                    {/* Top Right Action Icons: Wishlist & Share Link */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <button
                        onClick={(e) => toggleWishlist(product, e)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: 'none',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: inWishlist ? '#DC2626' : '#6A6369',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                        }}
                        title={inWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      >
                        <Heart size={16} fill={inWishlist ? '#DC2626' : 'none'} strokeWidth={2} />
                      </button>

                      {/* Copy Direct Link for Facebook Marketplace / Daraz posts */}
                      <button
                        onClick={(e) => handleCopyProductLink(product, e)}
                        style={{
                          backgroundColor: isLinkCopied ? '#10B981' : '#ffffff',
                          border: 'none',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isLinkCopied ? '#ffffff' : '#6A6369',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                        }}
                        title="Copy direct product link for Facebook / Daraz post"
                      >
                        {isLinkCopied ? <Check size={14} /> : <Share2 size={14} />}
                      </button>
                    </div>

                    {/* Quick View Button */}
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
                        backgroundColor: 'rgba(255, 255, 255, 0.94)',
                        backdropFilter: 'blur(4px)',
                        color: '#260618',
                        border: 'none',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '999px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                      }}
                    >
                      <Eye size={13} />
                      <span>Quick View</span>
                    </button>
                  </div>

                  {/* Card Body */}
                  <div
                    className="depth-content"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#8A8287',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '0.35rem',
                      }}
                    >
                      {product.category || 'General'}
                    </span>

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

                    {/* Rating & Stock */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <div style={{ display: 'flex', color: '#F59E0B' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={13} fill="#F59E0B" strokeWidth={0} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{product.rating || 4.9}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                        ✓ In Stock ({product.stock || 15})
                      </span>
                    </div>

                    {/* Price */}
                    <div style={{ marginBottom: '1rem' }}>
                      <span
                        style={{
                          fontSize: '1.2rem',
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

                    {/* High Converting Action Buttons for Facebook / Daraz Shoppers */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {/* 1-Click Cash on Delivery Order */}
                      <button
                        onClick={(e) => handleBuyNowInstant(product, e)}
                        className="depth-button"
                        style={{
                          backgroundColor: theme.primary,
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 4px 12px rgba(109, 14, 59, 0.2)',
                        }}
                      >
                        <Lock size={13} />
                        <span>⚡ Order via Cash on Delivery</span>
                      </button>

                      {/* WhatsApp Order & Add to Bag split */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                        <button
                          onClick={(e) => openWhatsAppOrder(product, e)}
                          style={{
                            backgroundColor: '#25D366',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                          }}
                          title="Order directly on WhatsApp"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          style={{
                            backgroundColor: isJustAdded ? '#10B981' : theme.primaryLight,
                            color: isJustAdded ? '#ffffff' : theme.primary,
                            border: 'none',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          {isJustAdded ? <Check size={13} /> : <ShoppingBag size={13} />}
                          <span>{isJustAdded ? 'Added' : 'Add Bag'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>
      </ScrollRevealSection>

      {/* ================================================================= */}
      {/* 7. WHY CHOOSE US? (Pillars of Social Commerce Trust)               */}
      {/* ================================================================= */}
      <ScrollRevealSection direction="right">
        <section ref={whyUsRef} style={{ padding: '3.5rem 1.25rem' }}>
          <div className="container">
            <div
              style={{
                backgroundColor: theme.mintCardBg,
                borderRadius: '24px',
                padding: '3.5rem 2.5rem',
                border: '1px solid rgba(0, 0, 0, 0.04)',
              }}
            >
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
                Why Order From Us?
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#7E757A' }}>
                Complete peace of mind for online buyers across Facebook Marketplace, Daraz, and social platforms
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.75rem',
              }}
              className="grid-responsive-4"
            >
              {[
                {
                  title: '100% Genuine Items',
                  desc: 'Every single parcel is inspected and verified by the seller before courier dispatch.',
                  icon: 'shield',
                },
                {
                  title: 'Cash on Delivery',
                  desc: 'Pay cash safely at your doorstep with open parcel inspection available.',
                  icon: 'truck',
                },
                {
                  title: '7-Day Easy Return',
                  desc: 'Wrong size or changed your mind? Fast exchange and full refund guarantee.',
                  icon: 'rotate',
                },
                {
                  title: 'WhatsApp Assistance',
                  desc: 'Direct seller communication on WhatsApp for tracking and immediate help.',
                  icon: 'headset',
                },
              ].map((p, idx) => (
                <TiltCard
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '1.75rem 1.25rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    className="depth-image"
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
                    {p.icon === 'shield' ? (
                      <ShieldCheck size={26} />
                    ) : p.icon === 'truck' ? (
                      <Truck size={26} />
                    ) : p.icon === 'rotate' ? (
                      <RotateCcw size={26} />
                    ) : (
                      <Headphones size={26} />
                    )}
                  </div>

                  <div className="depth-content">
                    <h3
                      className="font-serif"
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#260618',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {p.title}
                    </h3>

                    <p style={{ fontSize: '0.85rem', color: '#786E75', lineHeight: 1.5 }}>
                      {p.desc}
                    </p>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      </section>
      </ScrollRevealSection>

      {/* ================================================================= */}
      {/* 8. BEST SELLERS SECTION (Top 4 Products)                           */}
      {/* ================================================================= */}
      <ScrollRevealSection direction="left">
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
              Most loved products ordered by thousands of happy buyers this month
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
            {bestSellers.map((item) => {
              const inWishlist = isWishlisted(item._id);
              const isJustAdded = addedNoticeId === item._id;

              return (
                <TiltCard
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
                    className="depth-image"
                    style={{
                      height: '260px',
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
                    <button
                      onClick={(e) => toggleWishlist(item, e)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        width: '32px',
                        height: '32px',
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

                  <div className="depth-content" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase' }}>
                      {item.category}
                    </span>
                    <h3
                      className="font-serif"
                      style={{ fontSize: '1.05rem', fontWeight: 600, color: '#260618', margin: '0.3rem 0' }}
                    >
                      {item.title}
                    </h3>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: theme.primary, marginBottom: '0.75rem' }}>
                      {formatPrice(item.price)}
                    </div>

                    <button
                      onClick={(e) => handleBuyNowInstant(item, e)}
                      className="depth-button"
                      style={{
                        marginTop: 'auto',
                        backgroundColor: theme.primary,
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Lock size={13} />
                      <span>Order via Cash on Delivery</span>
                    </button>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>
      </ScrollRevealSection>

      {/* ================================================================= */}
      {/* 9. HUGE DISCOUNT / FLASH SALE SPLIT BANNER                         */}
      {/* ================================================================= */}
      <ScrollRevealSection direction="right">
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
                  LIMITED TIME OFFER
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
                  Up To 50% OFF
                </h2>

                <p
                  style={{
                    fontSize: '1.05rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '2rem',
                  }}
                >
                  Exclusive discount bundles across all categories with Free Cash on Delivery!
                </p>

                <div>
                  <button
                    onClick={() => scrollTo(productsRef)}
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
                    }}
                  >
                    <span>Shop Discount Deals</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              <div style={{ height: '100%', minHeight: '380px' }}>
                <img
                  src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80"
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
      </ScrollRevealSection>

      {/* ================================================================= */}
      {/* 10. WHAT OUR CUSTOMERS SAY (Testimonials)                          */}
      {/* ================================================================= */}
      <ScrollRevealSection direction="left">
        <section
          ref={reviewsRef}
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
              Verified reviews from Facebook Marketplace, Daraz & direct store buyers
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
            {[
              {
                name: 'Hamza Tariq',
                role: 'Verified Buyer (Lahore)',
                text: 'Saw the post on Facebook Marketplace and ordered through this website. Arrived in 2 days, courier let me open the box first, exactly as described!',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
              },
              {
                name: 'Ayesha Siddiqui',
                role: 'Verified Buyer (Karachi)',
                text: 'Outstanding quality and very responsive on WhatsApp. The raw Sidr honey is 100% genuine and the ambient LED kit looks phenomenal in my car.',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
              },
              {
                name: 'Usman Ali',
                role: 'Verified Buyer (Islamabad)',
                text: 'Smooth 1-click Cash on Delivery order. No complicated sign-up. The sneakers fit comfortably and stitching is top quality.',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
              },
            ].map((test, idx) => (
              <TiltCard
                key={idx}
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
                <div className="depth-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', color: '#F59E0B', marginBottom: '1.25rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="#F59E0B" strokeWidth={0} />
                    ))}
                  </div>

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
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
      </ScrollRevealSection>

      {/* ================================================================= */}
      {/* 11. LUXURY DARK WINE FOOTER                                       */}
      {/* ================================================================= */}
      <ScrollRevealSection direction="up">
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
            {/* Column 1: Store Brand Info */}
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
                  <Store size={20} />
                </div>
                <span
                  className="font-serif"
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {storeSettings.storeName}
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
                {storeSettings.storeTagline}. Connecting customers directly with verified online sellers across Pakistan.
              </p>

              {/* Direct WhatsApp Action in Footer */}
              <a
                href={`https://wa.me/${(storeSettings.whatsapp || '+923001234567').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                <MessageCircle size={16} />
                <span>Chat on WhatsApp</span>
              </a>
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
                  { label: 'Shop All Products', ref: productsRef },
                  { label: 'Categories', ref: categoriesRef },
                  { label: 'Best Sellers', ref: bestSellersRef },
                  { label: 'Why Order From Us', ref: whyUsRef },
                  { label: 'Customer Reviews', ref: reviewsRef },
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

            {/* Column 3: Customer Care & Order Tracking */}
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
                      color: '#38BDF8',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    🔍 Track Your Order Status
                  </button>
                </li>
                {['Cash on Delivery Policy', 'Open Parcel Rules', 'Return & Replacement (7 Days)', 'Shipping Charges', 'Privacy Policy'].map(
                  (text, idx) => (
                    <li key={idx}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.88rem' }}>
                        {text}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Column 4: Contact Info */}
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
                Contact Seller
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={15} style={{ color: '#ffffff' }} />
                  <span>{storeSettings.phone || storeSettings.whatsapp}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HelpCircle size={15} style={{ color: '#ffffff' }} />
                  <span>{storeSettings.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={15} style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }} />
                  <span>{storeSettings.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={15} style={{ color: '#ffffff' }} />
                  <span>Delivery in 2 - 4 business days nationwide</span>
                </div>
              </div>
            </div>
          </div>

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <span>© 2026 {storeSettings.storeName}. All rights reserved.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {['Cash on Delivery', 'EasyPaisa', 'JazzCash', 'Bank Transfer'].map((pay, i) => (
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
      </ScrollRevealSection>

      {/* ================================================================= */}
      {/* 12. INSTANT CASH ON DELIVERY / SHOPPING BAG DRAWER                 */}
      {/* ================================================================= */}
      {cartDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setCartDrawerOpen(false)}>
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              maxHeight: '100vh',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
            }}
          >
            {/* Drawer Header (Always Sticky at Top) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.2rem 1.5rem',
                borderBottom: '1px solid #EFEAEB',
                backgroundColor: '#ffffff',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={20} style={{ color: theme.primary }} />
                <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#260618' }}>
                  {checkoutStep === 'cart'
                    ? `Shopping Bag (${itemsCount})`
                    : checkoutStep === 'checkout'
                    ? '⚡ Fast Cash on Delivery Order'
                    : 'Order Placed Successfully!'}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Close drawer"
              >
                <X size={22} />
              </button>
            </div>

            {/* STEP 1: CART */}
            {checkoutStep === 'cart' && (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {cartItems.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8A8287', textAlign: 'center', padding: '2rem 1.5rem' }}>
                    <ShoppingBag size={48} strokeWidth={1.2} style={{ marginBottom: '1rem', color: '#D4CCD0' }} />
                    <h4 style={{ fontSize: '1.1rem', color: '#260618', marginBottom: '0.4rem' }}>Your bag is empty</h4>
                    <p style={{ fontSize: '0.88rem', maxWidth: '240px', marginBottom: '1.5rem' }}>
                      Add any product from the store to order with Cash on Delivery.
                    </p>
                    <button
                      onClick={() => {
                        setCartDrawerOpen(false);
                        scrollTo(productsRef);
                      }}
                      style={{
                        backgroundColor: theme.primary,
                        color: '#ffffff',
                        padding: '0.65rem 1.4rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        border: 'none',
                      }}
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem 1.5rem' }}>
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
                            style={{ width: '68px', height: '68px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#260618', marginBottom: '0.25rem' }}>
                              {item.title}
                            </h4>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: theme.primary, marginBottom: '0.5rem' }}>
                              {formatPrice(item.price)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #DCD5D8', borderRadius: '6px', backgroundColor: '#ffffff' }}>
                                <button
                                  onClick={() => updateQty(item._id, item.qty - 1)}
                                  style={{ background: 'none', border: 'none', padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 700 }}
                                >
                                  -
                                </button>
                                <span style={{ padding: '0 0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>{item.qty}</span>
                                <button
                                  onClick={() => updateQty(item._id, item.qty + 1)}
                                  style={{ background: 'none', border: 'none', padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 700 }}
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item._id)}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ flexShrink: 0, borderTop: '1px solid #EFEAEB', padding: '1rem 1.5rem', backgroundColor: '#ffffff', boxShadow: '0 -4px 16px rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#6A6367', marginBottom: '0.35rem' }}>
                        <span>Subtotal</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#6A6367', marginBottom: '0.65rem' }}>
                        <span>Delivery (Courier COD)</span>
                        <span style={{ color: '#059669', fontWeight: 600 }}>Rs. 199</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 700, color: '#260618', marginBottom: '1rem', borderTop: '1px dashed #EFEAEB', paddingTop: '0.65rem' }}>
                        <span>Total (Cash on Delivery)</span>
                        <span style={{ color: theme.primary }}>{formatPrice(totalPrice + 199)}</span>
                      </div>

                      <button
                        onClick={() => {
                          setCheckoutStep('checkout');
                        }}
                        style={{
                          width: '100%',
                          backgroundColor: theme.primary,
                          color: '#ffffff',
                          padding: '0.85rem',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.98rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          border: 'none',
                          boxShadow: '0 4px 14px rgba(109, 14, 59, 0.25)',
                        }}
                      >
                        <Lock size={16} />
                        <span>Proceed to Cash on Delivery</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 2: FAST COD CHECKOUT FORM */}
            {checkoutStep === 'checkout' && (
              <form onSubmit={handlePlaceOrder} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1.25rem 1.5rem' }}>
                  <div
                    style={{
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.82rem',
                      color: '#065F46',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Pay with Cash when courier delivers parcel to your door.</span>
                  </div>

                  {orderError && (
                    <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                      {orderError}
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A4248', display: 'block', marginBottom: '0.25rem' }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ahmad Ali"
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
                      WhatsApp / Mobile Number * (Courier calls this number)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0300 1234567"
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
                      Complete Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House / Flat #, Street #, Sector / Area, Landmark"
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
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Lahore / Karachi"
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
                        Payment Method
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
                        <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                        <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                        <option value="Online Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A4248', display: 'block', marginBottom: '0.25rem' }}>
                      Order Special Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Deliver before 5 PM"
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

                {/* ALWAYS VISIBLE PINNED SUBMIT FOOTER */}
                <div
                  style={{
                    flexShrink: 0,
                    borderTop: '1px solid #EFEAEB',
                    padding: '1rem 1.5rem',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 -4px 16px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.82rem', color: '#6A6367', display: 'block' }}>
                        Total Cash to Pay
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.primary }}>
                        {formatPrice(totalPrice + 199)}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#065F46',
                        backgroundColor: '#D1FAE5',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '999px',
                      }}
                    >
                      100% Cash on Delivery
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      style={{
                        padding: '0.85rem 1.15rem',
                        borderRadius: '10px',
                        border: '1.5px solid #DCD5D8',
                        backgroundColor: '#ffffff',
                        fontWeight: 600,
                        color: '#4A4248',
                        cursor: 'pointer',
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
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.98rem',
                        cursor: placingOrder ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        border: 'none',
                        boxShadow: '0 4px 14px rgba(109, 14, 59, 0.28)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <CheckCircle2 size={18} />
                      <span>{placingOrder ? 'Placing Order...' : 'Submit Order (Cash on Delivery)'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 3: ORDER SUCCESS */}
            {checkoutStep === 'success' && placedOrderData && (
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1.5rem' }}>
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
                  Order Confirmed!
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#6A6367', marginBottom: '1.5rem' }}>
                  We received your order. Our team will verify via WhatsApp/Call and dispatch your parcel.
                </p>

                <div style={{ backgroundColor: '#F9F5F7', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', width: '100%' }}>
                  <span style={{ fontSize: '0.78rem', color: '#8A8287', textTransform: 'uppercase' }}>Your Order ID</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: theme.primary }}>
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
                    Track Package
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
      {/* 13. QUICK VIEW PRODUCT MODAL                                       */}
      {/* ================================================================= */}
      {quickViewProduct && (
        <div className="modal-overlay" onClick={() => setQuickViewProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem', position: 'relative' }}>
            <button
              onClick={() => setQuickViewProduct(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#6A6367', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="hero-split">
              <div style={{ borderRadius: '16px', overflow: 'hidden', height: '340px', backgroundColor: '#F8F3F5' }}>
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.78rem', color: '#8A8287', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  {quickViewProduct.category}
                </span>

                <h3 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#260618', marginBottom: '0.65rem' }}>
                  {quickViewProduct.title}
                </h3>

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
                  {quickViewProduct.description || 'Premium quality verified item. 100% Cash on Delivery available.'}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct, quickViewQty);
                      setQuickViewProduct(null);
                      setCartDrawerOpen(true);
                      setCheckoutStep('checkout');
                    }}
                    style={{
                      backgroundColor: theme.primary,
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Lock size={15} />
                    <span>⚡ Order Now (Cash on Delivery)</span>
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => openWhatsAppOrder(quickViewProduct, e)}
                      style={{
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <MessageCircle size={15} />
                      <span>Order on WhatsApp</span>
                    </button>

                    <button
                      onClick={(e) => handleCopyProductLink(quickViewProduct, e)}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#260618',
                        border: '1px solid #DCD5D8',
                        padding: '0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Share2 size={15} />
                      <span>Copy Post Link</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ================================================================= */}
      {/* 15. WISHLIST, SEARCH & TRACKING MODALS                             */}
      {/* ================================================================= */}
      {wishlistDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setWishlistDrawerOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #EFEAEB', paddingBottom: '0.75rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Saved Favorites ({wishlist.length})
              </h3>
              <button onClick={() => setWishlistDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            {wishlist.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                <Heart size={40} style={{ color: '#ccc', marginBottom: '0.5rem' }} />
                <span>No saved products yet</span>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {wishlist.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: '0.75rem', padding: '0.65rem', backgroundColor: '#FCF9FA', borderRadius: '10px' }}>
                    <img src={item.image} alt={item.title} style={{ width: '56px', height: '56px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{item.title}</h4>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.primary, margin: '0.2rem 0' }}>{formatPrice(item.price)}</div>
                      <button
                        onClick={() => {
                          addToCart(item, 1);
                          setWishlistDrawerOpen(false);
                          setCartDrawerOpen(true);
                        }}
                        style={{ backgroundColor: theme.primary, color: '#fff', border: 'none', padding: '0.3rem 0.65rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH MODAL */}
      {searchModalOpen && (
        <div className="modal-overlay" onClick={() => setSearchModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0 }}>Search Products</h3>
              <button onClick={() => setSearchModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1.5px solid ' + theme.primary, borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
              <Search size={20} style={{ color: theme.primary }} />
              <input
                type="text"
                autoFocus
                placeholder="Search honey, car lights, shoes, dresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1rem' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              )}
            </div>
            <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {filteredProducts.map((p) => (
                <div
                  key={p._id}
                  onClick={() => {
                    setSearchModalOpen(false);
                    setQuickViewProduct(p);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <img src={p.image} alt={p.title} style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{p.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{p.category}</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: theme.primary }}>{formatPrice(p.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ORDER TRACKING MODAL */}
      {trackingModalOpen && (
        <div className="modal-overlay" onClick={() => setTrackingModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2.5rem 2rem', maxWidth: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Package size={24} style={{ color: theme.primary }} />
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                  Track Package Status
                </h3>
              </div>
              <button onClick={() => setTrackingModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ORD-98241)"
                value={trackSearchId}
                onChange={(e) => setTrackSearchId(e.target.value)}
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #DCD5D8', fontSize: '0.95rem', outline: 'none' }}
              />
              <button
                onClick={() => handleTrackOrder()}
                disabled={trackingLoading}
                style={{ backgroundColor: theme.primary, color: '#ffffff', border: 'none', padding: '0.75rem 1.4rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                {trackingLoading ? 'Checking...' : 'Track'}
              </button>
            </div>

            {trackingOrder && (
              <div style={{ backgroundColor: '#FAF6F8', borderRadius: '16px', padding: '1.5rem', border: '1px solid #EFEAEB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px dashed #E0D6DA', paddingBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#8A8287', textTransform: 'uppercase' }}>Tracking ID</span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: theme.primary, margin: 0 }}>
                      {trackingOrder.orderNumber || trackSearchId}
                    </h4>
                  </div>
                  <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, alignSelf: 'center' }}>
                    {trackingOrder.status || 'In Transit'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {(
                    trackingOrder.trackingSteps || [
                      { status: 'Order Placed (Cash on Delivery)', done: true, time: 'Today, 10:30 AM' },
                      { status: 'Confirmed & Packed by Seller', done: true, time: 'Today, 01:15 PM' },
                      { status: 'In Transit with Courier', done: true, time: 'Today, 04:45 PM' },
                      { status: 'Delivered to Doorstep', done: false, time: 'Estimated 2-3 days' },
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

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span className="font-serif" style={{ fontSize: '1.3rem', fontWeight: 700, color: theme.primary }}>
                {storeSettings.storeName}
              </span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { label: 'Home', ref: heroRef },
                { label: 'Shop All Products', ref: productsRef },
                { label: 'Browse Categories', ref: categoriesRef },
                { label: 'Best Sellers', ref: bestSellersRef },
                { label: 'Contact Seller', ref: footerRef },
              ].map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollTo(link.ref)}
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: theme.primary,
                    cursor: 'pointer',
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Stylist & Shopping Assistant */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99 }}>
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
          }}
        >
          <Sparkles size={18} />
          <span>AI Shop Assistant</span>
        </button>
      </div>



      {aiModalOpen && <AiAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />}
    </div>
  );
}
