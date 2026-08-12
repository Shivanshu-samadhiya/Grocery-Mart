import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton, CategorySkeleton } from '../components/Skeletons';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const selectedCategoryQuery = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(selectedCategoryQuery);

  // List of all categories matching backend Category enum
  const categoriesList = [
    { id: 'FRUITS_AND_VEGETABLES', name: 'Fruits & Veggies', icon: '🍎' },
    { id: 'DAIRY_AND_EGGS', name: 'Dairy & Eggs', icon: '🥛' },
    { id: 'BAKERY', name: 'Bakery & Bread', icon: '🍞' },
    { id: 'BEVERAGES', name: 'Beverages', icon: '🥤' },
    { id: 'SNACKS', name: 'Munchies & Snacks', icon: '🍪' },
    { id: 'MEAT_AND_SEAFOOD', name: 'Meat & Seafood', icon: '🥩' },
    { id: 'GRAINS_AND_PULSES', name: 'Grains & Pulses', icon: '🌾' },
    { id: 'HOUSEHOLD_ESSENTIALS', name: 'Household', icon: '🧹' },
    { id: 'PERSONAL_CARE', name: 'Personal Care', icon: '🧴' }
  ];

  // Reload query options
  useEffect(() => {
    setSelectedCategory(selectedCategoryQuery);
  }, [selectedCategoryQuery]);

  // Load Products dynamically
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        let url = '/products';
        
        if (searchQuery) {
          url = `/products/search?keyword=${encodeURIComponent(searchQuery)}`;
        } else if (selectedCategory) {
          url = `/products/category/${selectedCategory}`;
        } else {
          // If no filter, fetch all (using large page size)
          url = '/products?page=0&size=100';
        }

        const res = await axiosInstance.get(url);
        
        // Handle paginated responses vs search listings
        if (res.data.products) {
          setProducts(res.data.products);
        } else if (res.data.content) {
          setProducts(res.data.content);
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to load products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchQuery, selectedCategory]);

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory('');
      setSearchParams({});
    } else {
      setSelectedCategory(categoryId);
      setSearchParams({ category: categoryId });
    }
  };

  // Section divisions for display
  const dealsProducts = products.filter(p => p.productId % 2 === 0).slice(0, 4);
  const bestSellers = products.filter(p => p.productId % 3 === 0).slice(0, 4);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="container py-4 flex-grow-1">
        {/* Category horizontal scrolling bar */}
        <div className="mb-5">
          <h5 className="fw-bold mb-3 d-flex align-items-center text-dark">
            <i className="bi bi-grid-fill text-primary me-2"></i> Shop By Category
          </h5>
          <div className="row g-3 flex-nowrap overflow-auto pb-2 px-1">
            {loading ? (
              Array(6).fill(0).map((_, i) => <CategorySkeleton key={i} />)
            ) : (
              categoriesList.map((cat) => (
                <div key={cat.id} className="col-4 col-sm-3 col-md-2" style={{ minWidth: '120px' }}>
                  <button
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-100 border-0 category-item ${selectedCategory === cat.id ? 'border border-primary bg-primary-subtle text-primary shadow-sm' : ''}`}
                    style={{ background: 'var(--gm-card-bg)', borderRadius: '16px' }}
                  >
                    <div className="category-img-wrapper" style={{ fontSize: '1.8rem' }}>
                      {cat.icon}
                    </div>
                    <span className="fw-semibold small text-center text-truncate w-100" style={{ fontSize: '0.8rem' }}>
                      {cat.name}
                    </span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Grid display logic */}
        {searchQuery ? (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold m-0 text-dark">
                Search Results for "{searchQuery}"
              </h4>
              <span className="text-muted small">{products.length} items found</span>
            </div>
            
            {loading ? (
              <div className="row">
                {Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="row">
                {products.map(p => <ProductCard key={p.productId} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 fw-bold">No products found</h5>
                <p className="text-muted small">Try checking for typos or searching a different keyword.</p>
                <button onClick={() => setSearchParams({})} className="btn btn-gm-primary px-4 mt-2">Clear Search</button>
              </div>
            )}
          </div>
        ) : selectedCategory ? (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold m-0 text-dark">
                {categoriesList.find(c => c.id === selectedCategory)?.name || 'Products'}
              </h4>
              <span className="text-muted small">{products.length} items</span>
            </div>

            {loading ? (
              <div className="row">
                {Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="row">
                {products.map(p => <ProductCard key={p.productId} product={p} />)}
              </div>
            ) : (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                <i className="bi bi-box-seam text-success" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 fw-bold">Category is empty</h5>
                <p className="text-muted small">No items are currently listed under this category.</p>
                <button onClick={() => setSelectedCategory('')} className="btn btn-gm-primary px-4 mt-2">View All Products</button>
              </div>
            )}
          </div>
        ) : (
          /* Standard home dashboard view: Deals, Best sellers, all catalog */
          <div>
            {/* Today's Deals */}
            {dealsProducts.length > 0 && (
              <div className="mb-5">
                <h4 className="fw-bold mb-4 text-dark d-flex align-items-center">
                  <i className="bi bi-percent text-danger me-2 fs-4"></i> Today's Hot Deals
                </h4>
                <div className="row">
                  {dealsProducts.map(p => <ProductCard key={p.productId} product={p} />)}
                </div>
              </div>
            )}

            {/* Best Selling */}
            {bestSellers.length > 0 && (
              <div className="mb-5">
                <h4 className="fw-bold mb-4 text-dark d-flex align-items-center">
                  <i className="bi bi-award text-warning me-2 fs-4"></i> Best Selling Items
                </h4>
                <div className="row">
                  {bestSellers.map(p => <ProductCard key={p.productId} product={p} />)}
                </div>
              </div>
            )}

            {/* General Catalog list */}
            <div>
              <h4 className="fw-bold mb-4 text-dark d-flex align-items-center">
                <i className="bi bi-basket3 text-success me-2 fs-4"></i> All Products
              </h4>
              
              {loading ? (
                <div className="row">
                  {Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : products.length > 0 ? (
                <div className="row">
                  {products.map(p => <ProductCard key={p.productId} product={p} />)}
                </div>
              ) : (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                  <i className="bi bi-info-circle text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3 fw-bold">Inventory is currently empty</h5>
                  <p className="text-muted small">No products have been listed by administrators.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
