import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Image as ImageIcon } from 'lucide-react';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../api/productApi';
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
  const [category, setCategory] = useState('Fashion');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

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
    setCategory('Fashion');
    setImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600');
    setDescription('High quality item with fast delivery.');
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setTitle(p.title);
    setPrice(p.price);
    setStock(p.stock);
    setCategory(p.category || 'Fashion');
    setImage(p.image);
    setDescription(p.description || '');
    setModalOpen(true);
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

        <button onClick={handleOpenAdd} className="btn btn-primary">
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

      <p style={{ marginTop: '2.5rem', fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
        Yahan seller apne products add, edit, delete kar sakta hai. Image, price aur stock bhi yahan manage hota hai.
      </p>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            className="card"
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
                  <option value="Fashion">Fashion & Apparel</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories & Bags</option>
                  <option value="Watches">Watches & Jewelry</option>
                  <option value="Cosmetics">Cosmetics & Beauty</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                  className="form-control"
                />
                {/* Preset image suggestions for convenience */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600')}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '4px' }}
                  >
                    T-Shirt
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600')}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '4px' }}
                  >
                    Shoes
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage('https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600')}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '4px' }}
                  >
                    Handbag
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600')}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '4px' }}
                  >
                    Watch
                  </button>
                </div>
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
