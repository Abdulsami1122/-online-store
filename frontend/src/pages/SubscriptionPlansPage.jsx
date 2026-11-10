import { useState, useEffect } from 'react';
import { Store, Phone, MapPin, Mail, DollarSign, Truck, Check, Save, Lock, ShieldCheck, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/authApi';

export default function AdminSettingsPage() {
  const { user, updateUser } = useAuth();

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('user_store_custom_info');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      storeName: user?.storeName || 'TrendBazaar',
      storeTagline: user?.storeTagline || 'Quality Products • Best Prices • 100% Cash on Delivery',
      whatsapp: user?.whatsapp || '+92 306 5779097',
      currency: 'Rs.',
      phone: user?.phone || '+92 306 5779097',
      email: user?.email || 'admin@store.com',
      address: user?.address || 'Shop #12, Commercial Plaza, Main Boulevard, Lahore',
      deliveryCharges: 199,
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

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword && newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please verify.');
      return;
    }

    setSaving(true);
    try {
      // Save local store display info
      localStorage.setItem('user_store_custom_info', JSON.stringify(settings));

      // If user wants to change password or profile details in backend
      const profilePayload = {
        name: user?.name || 'Store Administrator',
        email: settings.email || user?.email,
        phone: settings.phone,
        address: settings.address,
        storeName: settings.storeName,
        storeTagline: settings.storeTagline,
        whatsapp: settings.whatsapp,
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

      if (newPassword) {
        profilePayload.password = newPassword;
      }

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

      setNewPassword('');
      setConfirmPassword('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Store Settings
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#64748B', marginTop: '0.25rem' }}>
          Configure your online store identity, WhatsApp ordering, Cash on Delivery fee, and admin credentials.
        </p>
      </div>

      {savedSuccess && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontWeight: 600,
          }}
        >
          <Check size={20} />
          <span>Store settings & administrator configurations saved successfully!</span>
        </div>
      )}

      {passwordError && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {passwordError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        {/* Section 1: Store Identity */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={18} color="#6D0E3B" />
            Store Identity & Branding
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>Store / Brand Name *</label>
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
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>Currency Symbol</label>
              <select
                className="form-control"
                value={settings.currency || 'Rs.'}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                style={{ padding: '0.65rem 0.85rem' }}
              >
                <option value="Rs.">Rs. (Pakistani Rupees / PKR)</option>
                <option value="$">$ (USD)</option>
                <option value="AED">AED (Dirhams)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.85rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>Store Slogan / Tagline</label>
            <input
              type="text"
              className="form-control"
              value={settings.storeTagline}
              onChange={(e) => setSettings({ ...settings, storeTagline: e.target.value })}
              placeholder="e.g. Quality Products • Best Prices • 100% Cash on Delivery"
              style={{ padding: '0.65rem 0.85rem' }}
            />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: 0 }} />

        {/* Section 2: Contact, WhatsApp & Delivery Fee */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={18} color="#16A34A" />
            WhatsApp Orders & Courier Delivery Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>WhatsApp Number for Customer Orders *</label>
              <input
                type="text"
                required
                className="form-control"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                placeholder="+92 300 1234567"
                style={{ padding: '0.65rem 0.85rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', display: 'block' }}>
                Used for instant WhatsApp customer verification and direct orders.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>Standard Delivery Fee (Rs.)</label>
              <input
                type="number"
                className="form-control"
                value={settings.deliveryCharges}
                onChange={(e) => setSettings({ ...settings, deliveryCharges: Number(e.target.value) })}
                placeholder="199"
                style={{ padding: '0.65rem 0.85rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', display: 'block' }}>
                Added to cart automatically during Cash on Delivery checkout.
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>Customer Helpline / Phone</label>
              <input
                type="text"
                className="form-control"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+92 (300) 123-4567"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>Support Email Address</label>
              <input
                type="email"
                className="form-control"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="admin@store.com"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.85rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>Store Physical Location / Warehouse Address</label>
            <input
              type="text"
              className="form-control"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Shop #12, Commercial Plaza, Main Boulevard, Lahore"
              style={{ padding: '0.65rem 0.85rem' }}
            />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: 0 }} />

        {/* Section: Online Payment Accounts (EasyPaisa, JazzCash, Bank Transfer) */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={18} color="#2563EB" />
            Online Payment Accounts (Bank Transfer, EasyPaisa, JazzCash)
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1.25rem' }}>
            When a customer selects online payment at checkout, these account numbers are shown on the website and customers will upload their payment screenshot.
          </p>

          {/* EasyPaisa Box */}
          <div style={{ backgroundColor: '#F0FDF4', padding: '1.25rem', borderRadius: '12px', border: '1px solid #BBF7D0', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🟢</span> EasyPaisa Account
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#166534' }}>EasyPaisa Account Title (Name) *</label>
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
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#166534' }}>EasyPaisa Mobile / Account Number *</label>
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
          </div>

          {/* JazzCash Box */}
          <div style={{ backgroundColor: '#FEF2F2', padding: '1.25rem', borderRadius: '12px', border: '1px solid #FECACA', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🔴</span> JazzCash Account
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#991B1B' }}>JazzCash Account Title (Name) *</label>
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
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', color: '#991B1B' }}>JazzCash Mobile / Account Number *</label>
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
          </div>

          {/* Bank Transfer Box */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #CBD5E1', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🏦</span> Bank Transfer (Meezan, HBL, etc.)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Bank Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.bankName || ''}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  placeholder="e.g. Meezan Bank / HBL / Bank Alfalah"
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Bank Account Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.bankAccountTitle || ''}
                  onChange={(e) => setSettings({ ...settings, bankAccountTitle: e.target.value })}
                  placeholder="e.g. Abdul Sami"
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Account / IBAN Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.bankAccountNumber || ''}
                  onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                  placeholder="e.g. 01020304050607 / PK36MEZN..."
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem' }}>Branch / Swift Code (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.bankIban || ''}
                  onChange={(e) => setSettings({ ...settings, bankIban: e.target.value })}
                  placeholder="e.g. Main Branch Lahore"
                  style={{ padding: '0.6rem 0.85rem' }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>Payment Instructions for Customer</label>
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

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: 0 }} />

        {/* Section 3: Admin Security & Password Update */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} color="#6D0E3B" />
            Security & Admin Credentials
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '1rem' }}>
            Leave blank if you do not want to change your current password. Passwords are encrypted with bcrypt.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>New Admin Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={{ padding: '0.65rem 0.85rem' }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#6D0E3B',
              borderColor: '#6D0E3B',
              padding: '0.75rem 1.5rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: '8px',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(109, 14, 59, 0.25)',
            }}
          >
            <Save size={18} />
            <span>{saving ? 'Saving Settings...' : 'Save Store Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
