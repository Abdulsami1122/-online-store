import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { fetchProducts, fetchCategories } from '../api/productApi';
import ProductCard from '../components/common/ProductCard';
import Loader from '../components/common/Loader';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get('category') || 'all';
  const urlKeyword = searchParams.get('keyword') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [keyword, setKeyword] = useState(urlKeyword);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Sync category & keyword with URL params
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setKeyword(searchParams.get('keyword') || '');
  }, [searchParams]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catData = await fetchCategories();
        setCategories(catData || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 12,
          sort: sortBy,
        };
        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (keyword.trim()) {
          params.keyword = keyword.trim();
        }

        const data = await fetchProducts(params);
        setProducts(data.products || []);
        setTotalPages(data.pages || 1);
        setTotalProducts(data.totalProducts || 0);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, keyword, sortBy, page]);

  const handleCategoryClick = (catName) => {
    setSelectedCategory(catName);
    setPage(1);
    setSearchParams(
      catName === 'all'
        ? keyword ? { keyword } : {}
        : keyword ? { category: catName, keyword } : { category: catName }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams(
      keyword.trim()
        ? selectedCategory !== 'all'
          ? { keyword: keyword.trim(), category: selectedCategory }
          : { keyword: keyword.trim() }
        : selectedCategory !== 'all'
        ? { category: selectedCategory }
        : {}
    );
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      {/* Page Title & Breadcrumb Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>Explore Collection</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Showing {totalProducts} {totalProducts === 1 ? 'product' : 'products'} available in store
        </p>
      </div>

      {/* Filter and Search Controls Bar */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
          <input
            type="text"
            placeholder="Filter by name, model or keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        </form>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowUpDown size={15} /> Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="form-control"
            style={{ width: 'auto', padding: '0.6rem 1rem' }}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.6rem',
          marginBottom: '2.5rem',
        }}
      >
        <button
          onClick={() => handleCategoryClick('all')}
          className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => handleCategoryClick(cat.name)}
            className={`btn btn-sm ${selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 'btn-primary' : 'btn-secondary'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product List */}
      {loading ? (
        <Loader text="Filtering store items..." />
      ) : products.length === 0 ? (
        <div
          className="glass-card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            margin: '2rem 0',
          }}
        >
          <SlidersHorizontal size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No products match your filter</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Try adjusting your search criteria or resetting categories.
          </p>
          <button onClick={() => handleCategoryClick('all')} className="btn btn-primary">
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '3.5rem',
              }}
            >
              {[...Array(totalPages).keys()].map((x) => (
                <button
                  key={x + 1}
                  onClick={() => setPage(x + 1)}
                  className={`btn btn-sm ${page === x + 1 ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '40px', height: '40px', padding: 0 }}
                >
                  {x + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
