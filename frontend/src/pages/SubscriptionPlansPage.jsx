import { useState, useEffect } from 'react';
import {
  Store,
  Phone,
  MapPin,
  Mail,
  DollarSign,
  Truck,
  Check,
  Save,
  Lock,
  CreditCard,
  Sparkles,
  Upload,
  Trash2,
  Palette,
  Megaphone,
  Share2,
  ExternalLink,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, fetchStoreSettings } from '../api/authApi';
import { THEME_TEMPLATES, getTheme } from '../utils/themeTemplates';
import { compressImageFile } from '../utils/imageCompressor';

export default function AdminSettingsPage() {
  const { user, updateUser } = useAuth();

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('user_store_custom_info');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      // Store Identity
      storeName: user?.storeName || 'TrendBazaar',
      storeTagline: user?.storeTagline || 'Quality Products • Best Prices • 100% Cash on Delivery',
      currency: user?.currency || 'Rs.',
      deliveryCharges: user?.deliveryCharges !== undefined ? user?.deliveryCharges : 199,
      // Logo & Branding
      storeLogo: user?.storeLogo || '',
      // Active Template
      selectedTemplate: user?.selectedTemplate || 'luxury-boutique',
      // Hero Banner & Text
      heroBannerImage: user?.heroBannerImage || '',
      heroBadgeText: user?.heroBadgeText || '✨ Direct From Verified Sellers',
      heroTitle: user?.heroTitle || 'Premium Quality Products for Everyday Life',
      heroSubtitle:
        user?.heroSubtitle ||
        'Shop pure natural honey, luxury car decoration, premium footwear, trending fashion, and daily essentials. Order with 100% Cash on Delivery and open parcel delivery.',
      heroButtonText: user?.heroButtonText || 'Shop All Products',
      heroFloatingBadge: user?.heroFloatingBadge || '100% Genuine Quality',
      // Announcement Ticker
      tickerText:
        user?.tickerText ||
        '⚡ FLASH SALE LIVE: GET EXTRA 10% OFF • 🚚 FREE OPEN PARCEL CASH ON DELIVERY • ⭐ 100% MONEY-BACK GUARANTEE',
      showTicker: user?.showTicker !== undefined ? user?.showTicker : true,
      // Contact & Social
      whatsapp: user?.whatsapp || '+92 306 5779097',
      phone: user?.phone || '+92 306 5779097',
      email: user?.email || 'admin@store.com',
      address: user?.address || 'Shop #12, Commercial Plaza, Main Boulevard, Lahore',
      instagram: user?.instagram || 'https://instagram.com',
      facebook: user?.facebook || 'https://facebook.com',
      tiktok: user?.tiktok || '',
      // Payment Details
      bankName: user?.bankName || 'Meezan Bank',
      bankAccountTitle: user?.bankAccountTitle || user?.name || 'Abdul Sami',
      bankAccountNumber: user?.bankAccountNumber || '01020304050607',
      bankIban: user?.bankIban || '',
      easypaisaTitle: user?.easypaisaTitle || user?.name || 'Abdul Sami',
      easypaisaNumber: user?.easypaisaNumber || '0306 5779097',
      jazzcashTitle: user?.jazzcashTitle || user?.name || 'Abdul Sami',
      jazzcashNumber: user?.jazzcashNumber || '0306 5779097',
      onlinePaymentInstructions:
        user?.onlinePaymentInstructions ||
        'Please transfer the exact total amount and attach your payment screenshot below.',
    };
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync with live backend settings on mount
  useEffect(() => {
    fetchStoreSettings()
      .then((data) => {
        if (data) {
          setSettings((prev) => ({
            ...prev,
            ...data,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Handle Logo Upload with client-side auto-compression
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      // Compress logo to crisp lightweight image (<200KB)
      const dataUrl = await compressImageFile(file, 600, 0.9);
      setSettings((prev) => ({ ...prev, storeLogo: dataUrl }));
    } catch (err) {
      console.warn('Fallback to raw file reader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings((prev) => ({ ...prev, storeLogo: event.target.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle Hero Banner Upload with client-side auto-compression
  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const dataUrl = await compressImageFile(file, 1200, 0.85);
      setSettings((prev) => ({ ...prev, heroBannerImage: dataUrl }));
    } catch (err) {
      console.warn('Fallback to raw file reader:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings((prev) => ({ ...prev, heroBannerImage: event.target.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingHero(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    if (e) e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please verify.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await updateProfile({ password: newPassword });
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err) {
      setPasswordError(err?.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Save locally for instant frontend sync
      localStorage.setItem('user_store_custom_info', JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('store-settings-updated', { detail: settings }));
      window.dispatchEvent(new Event('storage'));

      const profilePayload = {
        name: user?.name || 'Store Administrator',
        email: settings.email || user?.email,
        phone: settings.phone,
        address: settings.address,
        storeName: settings.storeName,
        storeTagline: settings.storeTagline,
        currency: settings.currency,
        deliveryCharges: settings.deliveryCharges,
        storeLogo: settings.storeLogo,
        selectedTemplate: settings.selectedTemplate,
        heroBannerImage: settings.heroBannerImage,
        heroBadgeText: settings.heroBadgeText,
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        heroButtonText: settings.heroButtonText,
        heroFloatingBadge: settings.heroFloatingBadge,
        tickerText: settings.tickerText,
        showTicker: settings.showTicker,
        whatsapp: settings.whatsapp,
        instagram: settings.instagram,
        facebook: settings.facebook,
        tiktok: settings.tiktok,
        bankName: settings.bankName,
        bankAccountTitle: settings.bankAccountTitle,
        bankAccountNumber: settings.bankAccountNumber,
        bankIban: settings.bankIban,
        easypaisaTitle: settings.easypaisaTitle,
        easypaisaNumber: settings.easypaisaNumber,
        jazzcashTitle: settings.jazzcashTitle,
        jazzcashNumber: settings.jazzcashNumber,
        onlinePaymentInstructions: settings.onlinePaymentInstructions,
      };

      try {
        await updateProfile(profilePayload);
      } catch (err) {
        console.warn('Backend updateProfile offline or skipped:', err);
      }

      if (updateUser) {
        updateUser({
          ...profilePayload,
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const activeTheme = getTheme(settings.selectedTemplate);

  return (
    <div style={{ maxWidth: '950px', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Store Customizer & Settings
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748B', marginTop: '0.25rem' }}>
            Customize your store logo, hero banner, announcement ticker, payment accounts, and publish store themes.
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: '#FFFFFF',
            color: activeTheme.primary,
            border: `1.5px solid ${activeTheme.primaryBorder || '#E2E8F0'}`,
            padding: '0.6rem 1.15rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
          }}
        >
          <span>View Live Storefront</span>
          <ExternalLink size={16} />
        </a>
      </div>

      {savedSuccess && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1.5px solid #10B981',
            color: '#065F46',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#10B981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={18} strokeWidth={3} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem' }}>Store Settings & Theme Published Live!</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#047857' }}>
              Your logo, banner, and active theme are now live on your customer store website.
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* ================================================================= */}
        {/* 1. STORE THEME TEMPLATES (Choose & Publish)                       */}
        {/* ================================================================= */}
        <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Palette size={20} color={activeTheme.primary} />
                Store Theme & Template
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                Select a visual design style. The active template instantly transforms colors, typography, buttons, and accents across your entire storefront.
              </p>
            </div>
            <span
              style={{
                backgroundColor: activeTheme.primaryLight,
                color: activeTheme.primary,
                border: `1px solid ${activeTheme.primaryBorder}`,
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              Active: {activeTheme.name}
            </span>
          </div>

          {/* Template Selection Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {Object.values(THEME_TEMPLATES).map((tmpl) => {
              const isSelected = settings.selectedTemplate === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSettings({ ...settings, selectedTemplate: tmpl.id })}
                  style={{
                    borderRadius: '14px',
                    border: isSelected ? `2.5px solid ${tmpl.primary}` : '1.5px solid #E2E8F0',
                    backgroundColor: isSelected ? tmpl.primaryLight : '#FFFFFF',
                    padding: '1.15rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    boxShadow: isSelected ? `0 8px 24px ${tmpl.primary}25` : '0 2px 6px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Badge & Selection Radio */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: tmpl.primary,
                          color: '#ffffff',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                        }}
                      >
                        {tmpl.badge}
                      </span>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: isSelected ? `6px solid ${tmpl.primary}` : '2px solid #CBD5E1',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem' }}>
                      {tmpl.name}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.85rem', lineHeight: 1.4 }}>
                      {tmpl.subtitle}
                    </p>

                    {/* Color Swatch Dots */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
                      {tmpl.previewColors.map((col, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: col,
                            border: '1.5px solid #ffffff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                          }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Button status preview */}
                  <div
                    style={{
                      borderTop: `1px dashed ${isSelected ? tmpl.primaryBorder : '#E2E8F0'}`,
                      paddingTop: '0.65rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? tmpl.primary : '#64748B' }}>
                      {isSelected ? '✓ Published & Active' : 'Click to Select'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        backgroundColor: tmpl.primary,
                        color: '#ffffff',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}
                    >
                      Preview Button
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. STORE LOGO & BRANDING                                          */}
        {/* ================================================================= */}
        <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={20} color={activeTheme.primary} />
            Store Logo & Brand Identity
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Upload your official brand logo. It will appear at the top header of your storefront, in the shopping bag drawer, and in the website footer.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
            {/* Logo Upload & Preview */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1.5px dashed #CBD5E1' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>
                Store Logo Image
              </label>

              {settings.storeLogo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <img
                    src={settings.storeLogo}
                    alt="Store Logo"
                    style={{
                      maxHeight: '60px',
                      maxWidth: '120px',
                      objectFit: 'contain',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
                      ✓ Custom Logo Active
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, storeLogo: '' })}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        color: '#DC2626',
                        backgroundColor: '#FEE2E2',
                        border: 'none',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      <Trash2 size={13} /> Remove Logo
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.65rem' }}>
                    <Upload size={22} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                    Upload Brand Logo
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                    PNG or JPG with transparent/white background (Recommended 300x100px)
                  </div>
                </div>
              )}

              <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                <label
                  className="btn btn-sm"
                  style={{
                    backgroundColor: activeTheme.primary,
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0.45rem 0.95rem',
                    borderRadius: '6px',
                    cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Upload size={14} />
                  <span>{uploadingLogo ? 'Processing...' : 'Upload Logo File'}</span>
                  <input
                    type="file"
                    accept="image/*,.png,.jpg,.jpeg,.webp,.svg"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Or image URL */}
              <div style={{ marginTop: '0.75rem' }}>
                <input
                  type="url"
                  className="form-control"
                  placeholder="Or paste direct image URL (https://...)"
                  value={settings.storeLogo}
                  onChange={(e) => setSettings({ ...settings, storeLogo: e.target.value })}
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
                />
              </div>
            </div>

            {/* Store Name, Tagline, Currency */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Store / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  placeholder="e.g. TrendBazaar"
                  style={{ padding: '0.65rem 0.85rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                  Store Slogan / Tagline
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.storeTagline}
                  onChange={(e) => setSettings({ ...settings, storeTagline: e.target.value })}
                  placeholder="e.g. Quality Products • Best Prices • 100% Cash on Delivery"
                  style={{ padding: '0.65rem 0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                    Currency Symbol
                  </label>
                  <select
                    className="form-control"
                    value={settings.currency || 'Rs.'}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    style={{ padding: '0.65rem 0.85rem' }}
                  >
                    <option value="Rs.">Rs. (Pakistani Rupees / PKR)</option>
                    <option value="$">$ (USD)</option>
                    <option value="AED">AED (Dirhams)</option>
                    <option value="SAR">SAR (Riyals)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                    Delivery Fee (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={settings.deliveryCharges !== undefined ? settings.deliveryCharges : 199}
                    onChange={(e) => setSettings({ ...settings, deliveryCharges: Number(e.target.value) })}
                    placeholder="199"
                    style={{ padding: '0.65rem 0.85rem' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. HOMEPAGE HERO BANNER & HEADLINES                               */}
        {/* ================================================================= */}
        <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color={activeTheme.primary} />
            Homepage Hero Banner & Headlines
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Customize the main banner photo and headlines shown to every customer when they open your store homepage.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '1.5rem', alignItems: 'flex-start' }}>
            {/* Banner Photo Upload & Preview */}
            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1.5px dashed #CBD5E1' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>
                Hero Showcase Photo
              </label>

              <div style={{ width: '100%', height: '240px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#E2E8F0', position: 'relative', border: '1px solid #CBD5E1' }}>
                <img
                  src={settings.heroBannerImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80'}
                  alt="Hero Banner Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: 'rgba(0,0,0,0.65)', color: '#ffffff', fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600 }}>
                  {settings.heroBannerImage ? 'Custom Banner Active' : 'Default Showcase Photo'}
                </div>
              </div>

              <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <label
                  className="btn btn-sm"
                  style={{
                    backgroundColor: activeTheme.primary,
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0.45rem 0.95rem',
                    borderRadius: '6px',
                    cursor: uploadingHero ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Upload size={14} />
                  <span>{uploadingHero ? 'Compressing...' : 'Upload Hero Photo'}</span>
                  <input
                    type="file"
                    accept="image/*,.png,.jpg,.jpeg,.webp"
                    onChange={handleHeroUpload}
                    disabled={uploadingHero}
                    style={{ display: 'none' }}
                  />
                </label>

                {settings.heroBannerImage && (
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, heroBannerImage: '' })}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.78rem',
                      color: '#DC2626',
                      backgroundColor: '#FEE2E2',
                      border: 'none',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <Trash2 size={13} /> Reset Photo
                  </button>
                )}
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <input
                  type="url"
                  className="form-control"
                  placeholder="Or paste direct image URL (https://...)"
                  value={settings.heroBannerImage}
                  onChange={(e) => setSettings({ ...settings, heroBannerImage: e.target.value })}
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
                />
              </div>
            </div>

            {/* Banner Headlines & Copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  Hero Top Badge / Tag
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.heroBadgeText}
                  onChange={(e) => setSettings({ ...settings, heroBadgeText: e.target.value })}
                  placeholder="e.g. ✨ Direct From Verified Sellers"
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  Hero Main Heading *
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={settings.heroTitle}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  placeholder="e.g. Premium Quality Products for Everyday Life"
                  style={{ padding: '0.6rem 0.85rem', fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  Hero Subtitle / Story Description
                </label>
                <textarea
                  rows={3}
                  className="form-control"
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                  placeholder="e.g. Shop pure natural honey, luxury car decoration, footwear, and essentials with Cash on Delivery..."
                  style={{ padding: '0.6rem 0.85rem', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.heroButtonText}
                    onChange={(e) => setSettings({ ...settings, heroButtonText: e.target.value })}
                    placeholder="e.g. Shop All Products"
                    style={{ padding: '0.6rem 0.85rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                    Floating Photo Badge
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.heroFloatingBadge}
                    onChange={(e) => setSettings({ ...settings, heroFloatingBadge: e.target.value })}
                    placeholder="e.g. 100% Genuine Quality"
                    style={{ padding: '0.6rem 0.85rem' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 4. TOP ANNOUNCEMENT TICKER                                        */}
        {/* ================================================================= */}
        <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Megaphone size={20} color={activeTheme.primary} />
              Top Announcement Ticker Bar
            </h3>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
              <input
                type="checkbox"
                checked={settings.showTicker !== false}
                onChange={(e) => setSettings({ ...settings, showTicker: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: activeTheme.primary }}
              />
              <span>Enable Ticker on Storefront</span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
              Announcement Messages (Separated by •)
            </label>
            <input
              type="text"
              className="form-control"
              value={settings.tickerText}
              onChange={(e) => setSettings({ ...settings, tickerText: e.target.value })}
              placeholder="⚡ FLASH SALE LIVE: GET EXTRA 10% OFF • 🚚 FREE OPEN PARCEL CASH ON DELIVERY • ⭐ 100% MONEY-BACK GUARANTEE"
              style={{ padding: '0.65rem 0.85rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem', display: 'block' }}>
              This text continuously scrolls in a marquee at the very top of your storefront.
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 5. CONTACT & SOCIAL MEDIA HELPLINE                                */}
        {/* ================================================================= */}
        <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={20} color={activeTheme.primary} />
            Contact & Social Media Links
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Customer inquiries, WhatsApp order verification, and social accounts shown in header and footer.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                WhatsApp Number * (For Orders & Support)
              </label>
              <input
                type="text"
                required
                className="form-control"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                placeholder="e.g. +92 306 5779097"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Store Phone Number
              </label>
              <input
                type="text"
                className="form-control"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="e.g. +92 306 5779097"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Support Email
              </label>
              <input
                type="email"
                className="form-control"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="e.g. orders@store.com"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Instagram Profile URL
              </label>
              <input
                type="text"
                className="form-control"
                value={settings.instagram}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                placeholder="https://instagram.com/yourstore"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                Facebook Page URL
              </label>
              <input
                type="text"
                className="form-control"
                value={settings.facebook}
                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                placeholder="https://facebook.com/yourstore"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                TikTok Profile URL
              </label>
              <input
                type="text"
                className="form-control"
                value={settings.tiktok}
                onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@yourstore"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
              Physical Store Address
            </label>
            <input
              type="text"
              className="form-control"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="e.g. Shop #12, Commercial Plaza, Main Boulevard, Lahore"
              style={{ padding: '0.65rem 0.85rem' }}
            />
          </div>
        </div>

        {/* ================================================================= */}
        {/* 6. ONLINE PAYMENT ACCOUNTS                                        */}
        {/* ================================================================= */}
        <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} color={activeTheme.primary} />
            Online Payment Accounts (Bank, EasyPaisa, JazzCash)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
            When a customer chooses online payment at checkout, these account numbers are shown to transfer money and upload screenshot.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* EasyPaisa Box */}
            <div style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🟢</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#166534' }}>EasyPaisa Account</h4>
              </div>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Account Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.easypaisaTitle || ''}
                  onChange={(e) => setSettings({ ...settings, easypaisaTitle: e.target.value })}
                  placeholder="e.g. Abdul Sami"
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Account Number / Mobile</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.easypaisaNumber || ''}
                  onChange={(e) => setSettings({ ...settings, easypaisaNumber: e.target.value })}
                  placeholder="e.g. 0306 5779097"
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>
            </div>

            {/* JazzCash Box */}
            <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🔴</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#991B1B' }}>JazzCash Account</h4>
              </div>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Account Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.jazzcashTitle || ''}
                  onChange={(e) => setSettings({ ...settings, jazzcashTitle: e.target.value })}
                  placeholder="e.g. Abdul Sami"
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Account Number / Mobile</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.jazzcashNumber || ''}
                  onChange={(e) => setSettings({ ...settings, jazzcashNumber: e.target.value })}
                  placeholder="e.g. 0306 5779097"
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>
            </div>

            {/* Bank Transfer Box */}
            <div style={{ backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🏦</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1E40AF' }}>Bank Transfer</h4>
              </div>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Bank Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.bankName || ''}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  placeholder="e.g. Meezan Bank / HBL"
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Account Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.bankAccountTitle || ''}
                  onChange={(e) => setSettings({ ...settings, bankAccountTitle: e.target.value })}
                  placeholder="e.g. Abdul Sami"
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Account / IBAN Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.bankAccountNumber || ''}
                  onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                  placeholder="e.g. 01020304050607 / PK36MEZN..."
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
              Customer Transfer Instructions
            </label>
            <input
              type="text"
              className="form-control"
              value={settings.onlinePaymentInstructions || ''}
              onChange={(e) => setSettings({ ...settings, onlinePaymentInstructions: e.target.value })}
              placeholder="e.g. Please transfer the total amount and attach your payment screenshot below."
              style={{ padding: '0.65rem 0.85rem' }}
            />
          </div>
        </div>

        {/* ================================================================= */}
        {/* 7. ADMIN SECURITY & PASSWORD                                      */}
        {/* ================================================================= */}
        <div className="card" style={{ padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color={activeTheme.primary} />
            Security & Admin Credentials
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
            Optional: Update your store administrator account password. Passwords are securely hashed with bcrypt.
          </p>

          {passwordError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              ⚠️ {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              ✓ Password updated successfully!
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>New Admin Password</label>
              <input
                type="password"
                className="form-control"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              onClick={handlePasswordUpdate}
              disabled={updatingPassword}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#0F172A',
                color: '#ffffff',
                border: 'none',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: updatingPassword ? 'not-allowed' : 'pointer',
              }}
            >
              <Lock size={15} />
              <span>{updatingPassword ? 'Updating Password...' : 'Update Password Only'}</span>
            </button>
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div
          className="admin-sticky-publish-bar"
          style={{
            position: 'sticky',
            bottom: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '1rem 1.5rem',
            borderRadius: '16px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
            border: '1.5px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: activeTheme.primary }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
              Publishing with Theme: <span style={{ color: activeTheme.primary }}>{activeTheme.name}</span>
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-lg"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: activeTheme.primary,
              color: '#ffffff',
              padding: '0.75rem 2rem',
              fontWeight: 800,
              fontSize: '0.98rem',
              borderRadius: '10px',
              cursor: saving ? 'not-allowed' : 'pointer',
              border: 'none',
              boxShadow: `0 4px 14px ${activeTheme.primary}40`,
              transition: 'all 0.2s ease',
            }}
          >
            <Save size={18} />
            <span>{saving ? 'Publishing Changes...' : 'Save & Publish to Live Storefront ↗'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
