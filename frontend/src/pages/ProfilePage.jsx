import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, CheckCircle, Clock, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders } from '../api/orderApi';
import { updateProfile } from '../api/authApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import Loader from '../components/common/Loader';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'details'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.shippingAddress?.address || '');
  const [city, setCity] = useState(user?.shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(user?.shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(user?.shippingAddress?.country || '');
  const [password, setPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await fetchMyOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    loadOrders();
  }, [user, navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);
    try {
      const payload = {
        name,
        email,
        phone,
        shippingAddress: { address, city, postalCode, country },
      };
      if (password.trim()) {
        payload.password = password;
      }

      const updated = await updateProfile(payload);
      updateUser(updated);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setPassword('');
    } catch (err) {
      setProfileMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user.name}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }}
          />
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{user.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {user.email} • Role: <strong style={{ color: 'var(--accent-primary)', textTransform: 'capitalize' }}>{user.role}</strong>
            </p>
          </div>
        </div>

        <button onClick={logout} className="btn btn-secondary btn-sm">
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            color: activeTab === 'orders' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            borderBottom: activeTab === 'orders' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Package size={18} /> My Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('details')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            color: activeTab === 'details' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            borderBottom: activeTab === 'details' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <User size={18} /> Account Details & Shipping
        </button>
      </div>

      {/* Orders Tab Content */}
      {activeTab === 'orders' && (
        <div>
          {loadingOrders ? (
            <Loader text="Fetching your orders..." />
          ) : orders.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <Package size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No orders placed yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Your completed orders will appear here for easy tracking.
              </p>
              <button onClick={() => navigate('/shop')} className="btn btn-primary">
                Explore Products
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map((ord) => (
                <div key={ord._id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '1rem',
                      marginBottom: '1rem',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Order ID:</span>{' '}
                      <strong style={{ fontSize: '0.9rem' }}>#{ord._id}</strong>
                      <span style={{ margin: '0 0.5rem', color: 'var(--text-dim)' }}>•</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(ord.createdAt)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span
                        className={`badge ${
                          ord.status === 'Delivered'
                            ? 'badge-success'
                            : ord.status === 'Cancelled'
                            ? 'badge-sale'
                            : 'badge-primary'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                        {formatCurrency(ord.totalPrice)}
                      </strong>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {ord.orderItems?.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img
                          src={it.image}
                          alt={it.title}
                          style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{it.title}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Qty: {it.qty} × {formatCurrency(it.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Shipped to: {ord.shippingAddress?.address}, {ord.shippingAddress?.city}, {ord.shippingAddress?.country} • Payment: {ord.paymentMethod}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Account Details Tab Content */}
      {activeTab === 'details' && (
        <div className="glass-card" style={{ maxWidth: '640px' }}>
          {profileMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: profileMsg.type === 'success' ? '#34d399' : '#f87171',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
              }}
            >
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="form-control"
              />
            </div>

            <h3 style={{ fontSize: '1.1rem', marginTop: '1.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--accent-primary)" /> Saved Shipping Address
            </h3>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Street Name"
                className="form-control"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal / ZIP Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Change Password (leave blank to keep current)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="form-control"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {saving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
