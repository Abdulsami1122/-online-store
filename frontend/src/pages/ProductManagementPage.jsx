import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Check, Image as ImageIcon, Upload } from 'lucide-react';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../api/productApi';
import API from '../api/axios';
import { formatCurrency } from '../utils/formatters';

export default function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('General');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setTitle('');
    setPrice('');
    setStock('10');
    setCategory('General');
    setImage('');
    setImageError('');
    setDescription('High quality item with fast delivery.');
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setTitle(p.title);
    setPrice(p.price);
    setStock(p.stock);
    setCategory(p.category || 'General');
    setImage(p.image || '');
    setImageError('');
    setDescription(p.description || '');
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');

    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image file is too large (maximum 10MB).');
      return;
    }

    setUploadingImage(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setImage(dataUrl);

      // Try uploading to backend /api/upload (Cloudinary storage)
      try {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await API.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (data?.url) {
          setImage(data.url);
        }
      } catch (err) {
        console.warn('Backend upload fallback to local data:', err);
      } finally {
        setUploadingImage(false);
      }
    };

    reader.onerror = () => {
      setImageError('Failed to read image from device.');
      setUploadingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!image) {
      setImageError('Please select a product image from your gallery.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        price: Number(price),
        stock: Number(stock),
        category,
        image,
        description,
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct._id, payload);
        setProducts(products.map((p) => (p._id === updated._id ? updated : p)));
      } else {
        const created = await addProduct(payload);
        setProducts([created, ...products]);
      }
      setModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header (Screen 3 Mockup) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
            Products
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Manage inventory, images, prices and product descriptions
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{
            backgroundColor: '#5C3A21',
            borderColor: '#5C3A21',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1.15rem',
            fontWeight: 700,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(92, 58, 33, 0.2)',
          }}
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Product List Cards / Table (Screen 3 Mockup) */}
      <div className="card" style={{ padding: '0.5rem 1.5rem' }}>
        {loading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading products...</p>
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>No products found in your store catalog.</p>
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              + Add First Product
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.15rem 0',
                  borderBottom: '1px solid #f1f5f9',
                  gap: '1rem',
                }}
              >
                {/* Image & Title & Stock */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}
                    alt={product.title}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                      {product.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      <strong style={{ color: '#334155' }}>{formatCurrency(product.price)}</strong> • Stock: {product.stock}
                    </p>
                  </div>
                </div>

                {/* Actions: [Edit] [Delete] */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="btn btn-outline btn-sm"
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                    }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    style={{
                      backgroundColor: '#fef2f2',
                      color: '#ef4444',
                      border: '1px solid #fee2e2',
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
          💡 <strong>Inventory Management:</strong> Manage your active storefront products, pricing, stock levels, and promotional images. Any changes update your customer storefront immediately.
        </p>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card modal-content"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '2rem',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Classic T-Shirt"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price (Rs.)</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-control"
                >
                  <option value="General">General</option>
                  <option value="Honey & Organics">Honey & Organics</option>
                  <option value="Car Accessories">Car Accessories</option>
                  <option value="Footwear & Shoes">Footwear & Shoes</option>
                  <option value="Fashion & Clothes">Fashion & Clothes</option>
                  <option value="Bags & Accessories">Bags & Accessories</option>
                </select>
              </div>

              {/* Direct Gallery Image Upload (No URL needed) */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Product Image *</span>
                  {image && (
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                      ✓ Image Attached
                    </span>
                  )}
                </label>

                {/* Hidden File Input for Device Gallery / Files */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />

                {image ? (
                  /* Image Preview Card */
                  <div
                    style={{
                      border: '1.5px solid #E2D9DC',
                      borderRadius: '12px',
                      padding: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      backgroundColor: '#FCF7F9',
                    }}
                  >
                    <img
                      src={image}
                      alt="Product preview"
                      style={{
                        width: '74px',
                        height: '74px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid #EFE7DC',
                        backgroundColor: '#ffffff',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#2C1810', marginBottom: '0.2rem' }}>
                        Image Loaded from Gallery
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#8C7D73', display: 'block', marginBottom: '0.5rem' }}>
                        {uploadingImage ? 'Processing & uploading image...' : 'Ready to save with product'}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid #E8DEC8',
                            backgroundColor: '#ffffff',
                            color: '#2C1810',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Upload size={13} />
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImage('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid #FECACA',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty Upload Dropzone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #E8DEC8',
                      borderRadius: '12px',
                      padding: '1.6rem 1rem',
                      textAlign: 'center',
                      backgroundColor: '#FAF7F2',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#5C3A21';
                      e.currentTarget.style.backgroundColor = '#F5EBE0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E8DEC8';
                      e.currentTarget.style.backgroundColor = '#FAF7F2';
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.65rem',
                        boxShadow: '0 2px 8px rgba(44, 24, 16, 0.06)',
                        color: '#5C3A21',
                      }}
                    >
                      <Upload size={20} />
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2C1810', marginBottom: '0.2rem' }}>
                      Click to Select Image from Gallery
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#8C7D73' }}>
                      Supports PNG, JPG, JPEG, WEBP from your phone or PC
                    </div>
                  </div>
                )}

                {imageError && (
                  <div style={{ fontSize: '0.8rem', color: '#DC2626', marginTop: '0.4rem', fontWeight: 500 }}>
                    {imageError}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#5C3A21',
                    borderColor: '#5C3A21',
                    fontWeight: 700,
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(92, 58, 33, 0.25)',
                  }}
                >
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
