import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
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
  Copy,
  Upload,
  Image as ImageIcon,
  CreditCard,
} from 'lucide-react';
import { fetchProducts } from '../../api/productApi';
import { createOrder, trackOrder } from '../../api/orderApi';
import { fetchStoreSettings } from '../../api/authApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';
import AiAssistantModal from '../../components/common/AiAssistantModal';

// Curated Standard Categories for the Store
const STORE_CATEGORIES = [
  'Car Accessories',
  'General',
  'Honey & Organics',
  'Footwear & Shoes',
  'Fashion & Clothes',
  'Bags & Accessories',
];

// 100% FIXED Category Pictures for "Shop by Category"
// These NEVER change when products are added or edited by admin!
// Product images uploaded by admin only appear on the product cards in the collection/shop below.
const FIXED_CATEGORY_IMAGES = {
  'Car Accessories': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=500&q=80',
  'General': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=500&q=80',
  'Honey & Organics': '/honey-category.jpg',
  'Footwear & Shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80',
  'Fashion & Clothes': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=500&q=80',
  'Bags & Accessories': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80',
};

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

// Client-side auto-compression utility: scales phone camera photos down to crisp lightweight JPEG (<300KB)
export const compressImageFile = (file, maxWidth = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

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
  const { orderId: routeOrderId } = useParams();

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
      whatsapp: '+92 306 5779097',
      currency: 'Rs.',
      phone: '+92 306 5779097',
      email: 'orders@trendbazaar.pk',
      address: 'Shop #12, Commercial Plaza, Main Boulevard, Lahore',
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      bankName: 'Meezan Bank',
      bankAccountTitle: 'Abdul Sami',
      bankAccountNumber: '01020304050607',
      bankIban: '',
      easypaisaTitle: 'Abdul Sami',
      easypaisaNumber: '0306 5779097',
      jazzcashTitle: 'Abdul Sami',
      jazzcashNumber: '0306 5779097',
      onlinePaymentInstructions: 'Please transfer the exact total amount and attach your payment screenshot below.',
    };
  });

  // Fetch live store & bank settings from backend
  useEffect(() => {
    fetchStoreSettings()
      .then((data) => {
        if (data) {
          setStoreSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

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
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [screenshotFileName, setScreenshotFileName] = useState('');
  const screenshotInputRef = useRef(null);
  const [copiedField, setCopiedField] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const handleCopy = (text, fieldName) => {
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2500);
    }
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingScreenshot(true);
    setOrderError(null);

    try {
      const dataUrl = await compressImageFile(file, 1200, 0.85);
      setPaymentScreenshot(dataUrl);
      setScreenshotFileName(file.name || 'Payment-receipt.jpg');
    } catch (err) {
      console.warn('Canvas compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPaymentScreenshot(uploadEvent.target.result);
        setScreenshotFileName(file.name || 'Payment-receipt.jpg');
      };
      reader.onerror = () => {
        setOrderError('Failed to read image file. Please try another image.');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingScreenshot(false);
    }
  };
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

  // Store products: ONLY real products added by Admin from backend DB (no auto/default items)
  const allProducts = dbProducts;

  // Categories list: Standard curated categories + any custom categories added by admin
  const uniqueCategories = [
    'All',
    ...new Set([
      ...STORE_CATEGORIES,
      ...allProducts.map((p) => p.category).filter(Boolean),
    ]),
  ];

  // Map category images for "Shop by Category"
  // 100% FIXED permanent pictures - NEVER replaced by uploaded product images
  const getCategoryImage = (catName) => {
    if (FIXED_CATEGORY_IMAGES[catName]) return FIXED_CATEGORY_IMAGES[catName];
    const lower = (catName || '').toLowerCase();
    if (lower.includes('honey') || lower.includes('organic'))
      return FIXED_CATEGORY_IMAGES['Honey & Organics'];
    if (lower.includes('car') || lower.includes('auto'))
      return FIXED_CATEGORY_IMAGES['Car Accessories'];
    if (lower.includes('shoe') || lower.includes('footwear'))
      return FIXED_CATEGORY_IMAGES['Footwear & Shoes'];
    if (lower.includes('bag') || lower.includes('handbag'))
      return FIXED_CATEGORY_IMAGES['Bags & Accessories'];
    if (lower.includes('cloth') || lower.includes('fashion') || lower.includes('apparel'))
      return FIXED_CATEGORY_IMAGES['Fashion & Clothes'];
    if (lower.includes('general'))
      return FIXED_CATEGORY_IMAGES['General'];
    return FIXED_CATEGORY_IMAGES['General'];
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

    // MANDATORY PROOF CHECK FOR ONLINE PAYMENTS (EasyPaisa, JazzCash, Bank Transfer)
    if (paymentMethod !== 'Cash on Delivery') {
      if (uploadingScreenshot) {
        setOrderError('Please wait, processing your receipt image...');
        return;
      }
      if (!paymentScreenshot) {
        setOrderError(`⚠️ Please attach your ${paymentMethod} payment receipt screenshot before submitting your order.`);
        return;
      }
    }

    setPlacingOrder(true);
    setOrderError(null);

    try {
      const accountDetailsUsed =
        paymentMethod === 'EasyPaisa'
          ? `EasyPaisa: ${storeSettings.easypaisaNumber} (${storeSettings.easypaisaTitle})`
          : paymentMethod === 'JazzCash'
          ? `JazzCash: ${storeSettings.jazzcashNumber} (${storeSettings.jazzcashTitle})`
          : paymentMethod === 'Online Bank Transfer'
          ? `${storeSettings.bankName}: ${storeSettings.bankAccountNumber} (${storeSettings.bankAccountTitle})`
          : '';

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: `${shippingAddress.trim()}, ${city}${orderNotes ? ' (Note: ' + orderNotes + ')' : ''}`,
        paymentMethod,
        paymentProof: paymentScreenshot || '',
        accountDetailsUsed,
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
    const id = (idToSearch || trackSearchId || '').trim();
    if (!id) return;

    setTrackingLoading(true);
    setTrackingError(null);

    try {
      const data = await trackOrder(id);
      setTrackingOrder(data);
    } catch (err) {
      setTrackingError(err.response?.data?.message || 'Order not found. Please verify your 5-digit order number.');
      setTrackingOrder(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Auto-open tracking modal if URL contains /track or /track/:orderId or defaultSection is 'track'
  useEffect(() => {
    const pathTrackId = location.pathname.includes('/track/') ? location.pathname.split('/track/')[1] : null;
    const targetId = routeOrderId || pathTrackId;
    if (defaultSection === 'track' || location.pathname.startsWith('/track') || targetId) {
      setTrackingModalOpen(true);
      if (targetId) {
        setTrackSearchId(targetId);
        handleTrackOrder(targetId);
      }
    }
  }, [routeOrderId, defaultSection, location.pathname]);

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
                  const count = allProducts.filter(
                    (p) => (p.category || 'General').toLowerCase() === catName.toLowerCase()
                  ).length;
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
                          {count} {count === 1 ? 'item' : 'items'}
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

            {filteredProducts.length === 0 && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '4rem 1.5rem',
                  backgroundColor: '#FAFAFA',
                  borderRadius: '16px',
                  border: '1.5px dashed #E5DCE0',
                  margin: '1rem 0',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#F3E8EE',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    color: theme.primary,
                  }}
                >
                  <ShoppingBag size={28} />
                </div>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#260618',
                    marginBottom: '0.4rem',
                  }}
                >
                  {selectedCategory === 'All'
                    ? 'No products available yet'
                    : `No products in "${selectedCategory}" yet`}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: '#7E757A',
                    maxWidth: '420px',
                    margin: '0 auto 1.5rem',
                    lineHeight: 1.5,
                  }}
                >
                  {selectedCategory === 'All'
                    ? 'Products added from the Admin Dashboard will appear here immediately.'
                    : `There are currently no items under this category. Switch to "All" to browse all available items.`}
                </p>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    style={{
                      backgroundColor: theme.primary,
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.65rem 1.6rem',
                      borderRadius: '999px',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    View All Products
                  </button>
                )}
              </div>
            )}
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
      {/* 8. BEST SELLERS SECTION (Top 4 Products - only when products exist) */}
      {/* ================================================================= */}
      {bestSellers.length > 0 && (
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
      )}

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
                      backgroundColor: paymentMethod === 'Cash on Delivery' ? '#ECFDF5' : '#EFF6FF',
                      border: paymentMethod === 'Cash on Delivery' ? '1px solid #A7F3D0' : '1px solid #BFDBFE',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.82rem',
                      color: paymentMethod === 'Cash on Delivery' ? '#065F46' : '#1E40AF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      {paymentMethod === 'Cash on Delivery'
                        ? 'Pay with Cash when courier delivers parcel to your door.'
                        : 'Online Payment Selected: Please transfer funds and attach screenshot proof below.'}
                    </span>
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
                          fontWeight: 600,
                        }}
                      >
                        <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                        <option value="EasyPaisa">EasyPaisa (Mobile Transfer)</option>
                        <option value="JazzCash">JazzCash (Mobile Transfer)</option>
                        <option value="Online Bank Transfer">Bank Transfer (IBAN / Online Banking)</option>
                      </select>
                    </div>
                  </div>

                  {/* ONLINE PAYMENT ACCOUNT DETAILS & SCREENSHOT UPLOAD */}
                  {paymentMethod !== 'Cash on Delivery' && (
                    <div
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                      }}
                    >
                      {/* EasyPaisa Box */}
                      {paymentMethod === 'EasyPaisa' && (
                        <div
                          style={{
                            backgroundColor: '#F0FDF4',
                            border: '1px solid #86EFAC',
                            borderRadius: '10px',
                            padding: '0.85rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span>🟢</span> EasyPaisa Account Details
                            </span>
                            <span style={{ fontSize: '0.72rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>
                              Instant Mobile Transfer
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#1F2937', marginBottom: '0.35rem' }}>
                            <span style={{ color: '#4B5563', fontSize: '0.78rem' }}>Account Title: </span>
                            <strong style={{ color: '#111827' }}>{storeSettings.easypaisaTitle || 'Abdul Sami'}</strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#6B7280', display: 'block' }}>EasyPaisa Number</span>
                              <strong style={{ fontSize: '1.05rem', color: '#166534', letterSpacing: '0.04em' }}>
                                {storeSettings.easypaisaNumber || '0306 5779097'}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(storeSettings.easypaisaNumber || '0306 5779097', 'easypaisa')}
                              style={{
                                backgroundColor: copiedField === 'easypaisa' ? '#16A34A' : '#15803D',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              <Copy size={13} />
                              <span>{copiedField === 'easypaisa' ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* JazzCash Box */}
                      {paymentMethod === 'JazzCash' && (
                        <div
                          style={{
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FCA5A5',
                            borderRadius: '10px',
                            padding: '0.85rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span>🔴</span> JazzCash Account Details
                            </span>
                            <span style={{ fontSize: '0.72rem', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>
                              Instant Mobile Transfer
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#1F2937', marginBottom: '0.35rem' }}>
                            <span style={{ color: '#4B5563', fontSize: '0.78rem' }}>Account Title: </span>
                            <strong style={{ color: '#111827' }}>{storeSettings.jazzcashTitle || 'Abdul Sami'}</strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #FECACA' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#6B7280', display: 'block' }}>JazzCash Number</span>
                              <strong style={{ fontSize: '1.05rem', color: '#991B1B', letterSpacing: '0.04em' }}>
                                {storeSettings.jazzcashNumber || '0306 5779097'}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(storeSettings.jazzcashNumber || '0306 5779097', 'jazzcash')}
                              style={{
                                backgroundColor: copiedField === 'jazzcash' ? '#DC2626' : '#B91C1C',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              <Copy size={13} />
                              <span>{copiedField === 'jazzcash' ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Bank Transfer Box */}
                      {paymentMethod === 'Online Bank Transfer' && (
                        <div
                          style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #94A3B8',
                            borderRadius: '10px',
                            padding: '0.85rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span>🏦</span> {storeSettings.bankName || 'Meezan Bank'}
                            </span>
                            <span style={{ fontSize: '0.72rem', backgroundColor: '#E2E8F0', color: '#1E293B', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>
                              Bank Transfer
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#1F2937', marginBottom: '0.35rem' }}>
                            <span style={{ color: '#4B5563', fontSize: '0.78rem' }}>Account Title: </span>
                            <strong style={{ color: '#111827' }}>{storeSettings.bankAccountTitle || 'Abdul Sami'}</strong>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                            <div>
                              <span style={{ fontSize: '0.72rem', color: '#6B7280', display: 'block' }}>Account / IBAN Number</span>
                              <strong style={{ fontSize: '0.98rem', color: '#0F172A', letterSpacing: '0.03em', wordBreak: 'break-all' }}>
                                {storeSettings.bankAccountNumber || '01020304050607'}
                              </strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(storeSettings.bankAccountNumber || '01020304050607', 'bank')}
                              style={{
                                backgroundColor: copiedField === 'bank' ? '#16A34A' : '#334155',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                flexShrink: 0,
                                marginLeft: '0.5rem',
                              }}
                            >
                              <Copy size={13} />
                              <span>{copiedField === 'bank' ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Exact Transfer Amount */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          borderRadius: '8px',
                          padding: '0.55rem 0.85rem',
                          fontSize: '0.82rem',
                          color: '#92400E',
                        }}
                      >
                        <span>Exact Amount to Transfer:</span>
                        <strong style={{ fontSize: '0.95rem', color: '#78350F' }}>
                          Rs. {(totalPrice + 199).toLocaleString()}
                        </strong>
                      </div>

                      {/* Instructions */}
                      <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                        ℹ️ {storeSettings.onlinePaymentInstructions || 'Please transfer the exact amount and attach your payment screenshot below.'}
                      </p>

                      {/* Upload Payment Screenshot Area */}
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span>Attach Payment Screenshot / Receipt *</span>
                          {paymentScreenshot ? (
                            <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700 }}>
                              ✓ Screenshot Ready
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 700 }}>
                              * Required
                            </span>
                          )}
                        </label>

                        {/* Native cross-browser file input */}
                        <input
                          id="customer-payment-screenshot-input"
                          ref={screenshotInputRef}
                          type="file"
                          accept="image/*,.png,.jpg,.jpeg,.webp"
                          onChange={handleScreenshotUpload}
                          onClick={(e) => { e.target.value = null; }}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                        />

                        {uploadingScreenshot ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              padding: '1.25rem',
                              backgroundColor: '#EFF6FF',
                              border: '1.5px dashed #3B82F6',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              color: '#1D4ED8',
                              fontWeight: 600,
                            }}
                          >
                            <span className="spin">⏳</span> Reading screenshot...
                          </div>
                        ) : !paymentScreenshot ? (
                          <label
                            htmlFor="customer-payment-screenshot-input"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              padding: '1.35rem 1rem',
                              backgroundColor: '#FFFFFF',
                              border: '2px dashed #6D0E3B',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              textAlign: 'center',
                            }}
                          >
                            <div
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                backgroundColor: '#FDF2F5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '0.2rem',
                              }}
                            >
                              <Upload size={22} color={theme.primary} />
                            </div>
                            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: theme.primary }}>
                              Click to Upload Payment Screenshot
                            </span>
                            <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                              Tap to select receipt from gallery, camera, or screenshots
                            </span>
                            <span
                              style={{
                                marginTop: '0.4rem',
                                backgroundColor: '#FDF2F5',
                                color: theme.primary,
                                border: '1px solid #F2D3DF',
                                padding: '0.4rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'inline-block',
                              }}
                            >
                              Choose File / Photo ↗
                            </span>
                          </label>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: '#F0FDF4',
                              border: '2px solid #16A34A',
                              borderRadius: '10px',
                              padding: '0.75rem 0.95rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
                              <img
                                src={paymentScreenshot}
                                alt="Payment proof preview"
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  border: '1.5px solid #86EFAC',
                                  flexShrink: 0,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                }}
                              />
                              <div style={{ overflow: 'hidden' }}>
                                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <Check size={16} strokeWidth={3} /> Screenshot Attached
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#374151', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '190px', fontWeight: 600 }}>
                                  {screenshotFileName || 'Payment-receipt.jpg'}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: '#059669' }}>
                                  Ready to submit with order
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.45rem', flexShrink: 0 }}>
                              <label
                                htmlFor="customer-payment-screenshot-input"
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  color: '#334155',
                                  border: '1px solid #CBD5E1',
                                  padding: '0.35rem 0.7rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Change
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentScreenshot('');
                                  setScreenshotFileName('');
                                }}
                                style={{
                                  backgroundColor: '#FEE2E2',
                                  color: '#DC2626',
                                  border: 'none',
                                  padding: '0.35rem 0.7rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}

                        {/* WhatsApp Fallback Link */}
                        <div style={{ marginTop: '0.65rem', textAlign: 'center' }}>
                          <a
                            href={`https://wa.me/${(storeSettings.whatsapp || '+923065779097').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${storeSettings.storeName}! I am placing an order for Rs. ${(totalPrice + 199).toLocaleString()} via ${paymentMethod}. Here is my payment receipt screenshot.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.75rem',
                              color: '#15803D',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <span>📲</span> Or Send Screenshot on WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

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
                        {paymentMethod === 'Cash on Delivery' ? 'Total Cash to Pay' : 'Total Amount to Transfer'}
                      </span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.primary }}>
                        {formatPrice(totalPrice + 199)}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: paymentMethod === 'Cash on Delivery' ? '#065F46' : '#1E40AF',
                        backgroundColor: paymentMethod === 'Cash on Delivery' ? '#D1FAE5' : '#DBEAFE',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '999px',
                      }}
                    >
                      {paymentMethod === 'Cash on Delivery' ? '100% Cash on Delivery' : 'Online Payment'}
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
                      type={paymentMethod !== 'Cash on Delivery' && !paymentScreenshot ? 'button' : 'submit'}
                      onClick={(e) => {
                        if (paymentMethod !== 'Cash on Delivery' && !paymentScreenshot) {
                          e.preventDefault();
                          document.getElementById('customer-payment-screenshot-input')?.click();
                          setOrderError('⚠️ Please select your payment screenshot / receipt before submitting.');
                        }
                      }}
                      disabled={placingOrder}
                      style={{
                        flex: 1,
                        backgroundColor:
                          paymentMethod !== 'Cash on Delivery' && !paymentScreenshot
                            ? '#92400E'
                            : theme.primary,
                        color: '#ffffff',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: placingOrder ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        border: 'none',
                        boxShadow: '0 4px 14px rgba(109, 14, 59, 0.28)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <CheckCircle2 size={18} />
                      <span>
                        {placingOrder
                          ? 'Submitting Order...'
                          : paymentMethod === 'Cash on Delivery'
                          ? 'Submit Order (Cash on Delivery)'
                          : paymentScreenshot
                          ? '✓ Submit Order (Proof Attached)'
                          : '📷 Select Screenshot to Submit'}
                      </span>
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

            {trackingError && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  border: '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>⚠️</span>
                <span>{trackingError}</span>
              </div>
            )}

            {trackingOrder && (() => {
              const statusOrder = ['New', 'Confirmed', 'Shipped', 'Delivered'];
              const currentStepIdx = trackingOrder.status === 'Cancelled' ? -1 : statusOrder.indexOf(trackingOrder.status);
              const effectiveIdx = currentStepIdx >= 0 ? currentStepIdx : 0;

              const isCOD = !trackingOrder.paymentMethod || trackingOrder.paymentMethod.toLowerCase().includes('cash on delivery');
              const step1Title = isCOD ? 'Order Placed (Cash on Delivery)' : `Order Placed (${trackingOrder.paymentMethod || 'Online Payment'})`;

              const findTimelineDate = (st) => {
                const item = trackingOrder.timeline?.find((t) => t.status === st);
                return item ? item.date : null;
              };

              const steps = [
                {
                  step: 1,
                  key: 'New',
                  title: step1Title,
                  done: effectiveIdx >= 0,
                  current: effectiveIdx === 0,
                  desc: isCOD ? 'Order placed with Cash on Delivery' : 'Order placed with online payment verification',
                  time: findTimelineDate('New') || trackingOrder.createdAt,
                },
                {
                  step: 2,
                  key: 'Confirmed',
                  title: 'Confirmed',
                  done: effectiveIdx >= 1,
                  current: effectiveIdx === 1,
                  desc: effectiveIdx >= 1 ? 'Order verified & confirmed by store' : 'Waiting for store confirmation...',
                  time: findTimelineDate('Confirmed'),
                },
                {
                  step: 3,
                  key: 'Shipped',
                  title: 'In Transit with Courier',
                  done: effectiveIdx >= 2,
                  current: effectiveIdx === 2,
                  desc: effectiveIdx >= 2 ? 'In transit with courier for doorstep delivery' : 'Pending courier dispatch...',
                  time: findTimelineDate('Shipped'),
                },
                {
                  step: 4,
                  key: 'Delivered',
                  title: 'Delivered to Doorstep',
                  done: effectiveIdx >= 3,
                  current: effectiveIdx === 3,
                  desc: effectiveIdx >= 3 ? 'Package delivered to your doorstep' : 'Estimated delivery within 2-3 business days',
                  time: findTimelineDate('Delivered'),
                },
              ];

              return (
                <div style={{ backgroundColor: '#FAF6F8', borderRadius: '16px', padding: '1.5rem', border: '1px solid #EFEAEB' }}>
                  {/* Tracking Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px dashed #E0D6DA', paddingBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#8A8287', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Live Tracking ID
                      </span>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: theme.primary, margin: '2px 0 0' }}>
                        #{trackingOrder.orderNumber || trackSearchId}
                      </h4>
                    </div>
                    <span
                      style={{
                        backgroundColor:
                          trackingOrder.status === 'Delivered'
                            ? '#DCFCE7'
                            : trackingOrder.status === 'Shipped'
                            ? '#DBEAFE'
                            : trackingOrder.status === 'Confirmed'
                            ? '#E0E7FF'
                            : '#FEF3C7',
                        color:
                          trackingOrder.status === 'Delivered'
                            ? '#166534'
                            : trackingOrder.status === 'Shipped'
                            ? '#1E40AF'
                            : trackingOrder.status === 'Confirmed'
                            ? '#3730A3'
                            : '#92400E',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      ● {trackingOrder.status || 'New'}
                    </span>
                  </div>

                  {/* Horizontal Milestone Connector Bar */}
                  <div style={{ marginBottom: '1.75rem', padding: '0.85rem 0.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #EFEAEB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      {steps.map((st, sIdx) => {
                        const isDone = st.done;
                        const isNextDone = steps[sIdx + 1]?.done;

                        return (
                          <div
                            key={st.step}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              flex: sIdx === steps.length - 1 ? '0 0 auto' : 1,
                              position: 'relative',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                              <div
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  backgroundColor: isDone ? '#10B981' : '#F1F5F9',
                                  border: isDone ? '2px solid #10B981' : '2px solid #CBD5E1',
                                  color: isDone ? '#FFFFFF' : '#94A3B8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                  boxShadow: isDone ? '0 0 10px rgba(16, 185, 129, 0.35)' : 'none',
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                {isDone ? <Check size={16} strokeWidth={3} /> : st.step}
                              </div>
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  fontWeight: isDone ? 700 : 500,
                                  color: isDone ? '#0F172A' : '#94A3B8',
                                  marginTop: '0.35rem',
                                  textAlign: 'center',
                                  maxWidth: '65px',
                                  lineHeight: 1.1,
                                }}
                              >
                                {st.step === 1 ? 'Placed' : st.step === 2 ? 'Confirmed' : st.step === 3 ? 'In Transit' : 'Delivered'}
                              </span>
                            </div>

                            {/* Connecting Line Segment */}
                            {sIdx < steps.length - 1 && (
                              <div
                                style={{
                                  flex: 1,
                                  height: '4px',
                                  backgroundColor: isNextDone ? '#10B981' : '#E2E8F0',
                                  margin: '0 4px',
                                  marginBottom: '1.1rem',
                                  borderRadius: '999px',
                                  transition: 'background-color 0.4s ease',
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step-by-Step Connected Vertical Timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', marginBottom: '1.5rem' }}>
                    {steps.map((st, idx) => {
                      const isDone = st.done;
                      const isNextDone = steps[idx + 1]?.done;
                      const isLast = idx === steps.length - 1;

                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            gap: '1rem',
                            position: 'relative',
                            paddingBottom: isLast ? 0 : '1.75rem',
                          }}
                        >
                          {/* Vertical Connector Column */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '32px', flexShrink: 0 }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: isDone ? '#10B981' : '#F1F5F9',
                                border: isDone ? '2px solid #10B981' : '2px solid #CBD5E1',
                                color: isDone ? '#FFFFFF' : '#94A3B8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                zIndex: 2,
                                boxShadow: isDone ? '0 0 10px rgba(16, 185, 129, 0.35)' : 'none',
                                transition: 'all 0.3s ease',
                              }}
                            >
                              {isDone ? <Check size={18} strokeWidth={3} /> : idx + 1}
                            </div>

                            {/* Connecting Line to next step: Green when next step is confirmed! */}
                            {!isLast && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '32px',
                                  bottom: 0,
                                  width: '3px',
                                  backgroundColor: isNextDone ? '#10B981' : '#E2E8F0',
                                  zIndex: 1,
                                  transition: 'background-color 0.4s ease',
                                }}
                              />
                            )}
                          </div>

                          {/* Content Column */}
                          <div style={{ flex: 1, paddingTop: '3px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <h5
                                style={{
                                  fontSize: '0.92rem',
                                  fontWeight: isDone ? 800 : 600,
                                  color: isDone ? '#0F172A' : '#94A3B8',
                                  margin: 0,
                                }}
                              >
                                {st.title}
                              </h5>
                              {st.current && (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    backgroundColor: '#DCFCE7',
                                    color: '#15803D',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '999px',
                                  }}
                                >
                                  ● Active Status
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: isDone ? '#475569' : '#94A3B8', margin: '0.2rem 0 0.15rem' }}>
                              {st.desc}
                            </p>
                            {st.time && (
                              <span style={{ fontSize: '0.74rem', color: isDone ? '#64748B' : '#CBD5E1', fontWeight: 500 }}>
                                {typeof st.time === 'string' && st.time.includes('T') ? formatDateTime(st.time) : st.time}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary & Customer Details */}
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #EFEAEB',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#64748b' }}>Recipient:</span>
                      <strong>{trackingOrder.customerName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#64748b' }}>Delivery Address:</span>
                      <strong style={{ maxWidth: '240px', textAlign: 'right' }}>{trackingOrder.shippingAddress}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#64748b' }}>Payment Method:</span>
                      <span style={{ fontWeight: 700, color: theme.primary }}>{trackingOrder.paymentMethod || 'Cash on Delivery'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed #E2E8F0', fontSize: '0.95rem', fontWeight: 800 }}>
                      <span>Total Amount:</span>
                      <span style={{ color: theme.primary }}>Rs. {trackingOrder.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
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
