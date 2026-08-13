import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import { useCart } from '../contexts/CartContext';
import { DetailsSkeleton } from '../components/Skeletons';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProductDetails = () => {
  const { id } = useParams();
  const { getProductQuantity, getCartItemId, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  const quantity = product ? getProductQuantity(product.productId) : 0;
  const cartItemId = product ? getCartItemId(product.productId) : null;

  const handleQuantityChange = (newQty) => {
    if (newQty < 1) {
      updateQuantity(cartItemId, 0);
    } else {
      updateQuantity(cartItemId, newQty);
    }
  };

  // Fetch product data on load
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/products/${id}`);
        setProduct(res.data);
        
        // Fetch related products in category
        if (res.data && res.data.category) {
          const relatedRes = await axiosInstance.get(`/products/category/${res.data.category}`);
          const filtered = relatedRes.data.filter(p => p.productId !== res.data.productId).slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error("Failed to load details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Handle image magnifying hover
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${product?.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60'})`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Header />
        <DetailsSkeleton />
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Header />
        <div className="container py-5 text-center my-auto">
          <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '3rem' }}></i>
          <h4 className="mt-3 fw-bold">Product Not Found</h4>
          <p className="text-muted">The product you are trying to view does not exist or has been removed.</p>
          <Link to="/" className="btn btn-gm-primary px-4 mt-2">Back to Home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Deterministic ratings and discounts matching ProductCard
  const rating = ((product.productId * 7) % 10) * 0.1 + 4.0;
  const hasDiscount = product.productId % 3 !== 0;
  const discountPercent = hasDiscount ? ((product.productId * 5) % 15) + 10 : 0;
  const discountPrice = product.price;
  const originalPrice = hasDiscount 
    ? parseFloat((product.price / (1 - discountPercent / 100)).toFixed(2))
    : product.price;

  // Helper unit
  const getProductUnit = (name = '', desc = '', category = '') => {
    const combined = `${name} ${desc}`.toLowerCase();
    const unitMatch = combined.match(/\b\d+\s*(kg|g|l|ml|pcs|pack|pieces)\b/i);
    if (unitMatch) return unitMatch[0];
    switch (category) {
      case 'FRUITS_AND_VEGETABLES': return '500 g';
      case 'DAIRY_AND_EGGS': return '500 g';
      case 'BEVERAGES': return '500 ml';
      case 'SNACKS': return '150 g';
      case 'BAKERY': return '400 g';
      default: return '1 unit';
    }
  };
  const unit = getProductUnit(product.name, product.description, product.category);
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />

      <main className="container py-5 flex-grow-1">
        {/* Navigation Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-success text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item text-muted">
              {product.category?.replace(/_/g, ' ')}
            </li>
            <li className="breadcrumb-item active text-truncate" aria-current="page" style={{ maxWidth: '300px' }}>
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Details Wrapper */}
        <div className="card border-0 bg-white shadow-sm p-4 p-md-5 rounded-4 mb-5">
          <div className="row g-5">
            {/* Left Column: Image with Hover Zoom */}
            <div className="col-md-6">
              <div className="position-relative border rounded-4 overflow-hidden bg-light d-flex justify-content-center align-items-center" style={{ height: '400px', cursor: 'zoom-in' }}>
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="img-fluid p-4" 
                  style={{ maxHeight: '350px', objectFit: 'contain' }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60';
                  }}
                />

                {/* Magnifier Panel */}
                <div 
                  className="position-absolute border border-success rounded shadow-lg d-none d-lg-block"
                  style={{ 
                    ...zoomStyle, 
                    right: '-360px', 
                    top: '0', 
                    width: '350px', 
                    height: '350px', 
                    zIndex: '10', 
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '200%'
                  }} 
                />
              </div>
            </div>

            {/* Right Column: Descriptions & Controls */}
            <div className="col-md-6 d-flex flex-column">
              <span className="badge bg-success-subtle text-success text-uppercase align-self-start mb-2 px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
                {product.category?.replace(/_/g, ' ')}
              </span>
              
              <h2 className="fw-bold mb-1">{product.name}</h2>
              <p className="text-muted small mb-3">{unit}</p>

              {/* Rating */}
              <div className="d-flex align-items-center mb-4">
                <div className="text-warning me-2">
                  {Array(5).fill(0).map((_, i) => (
                    <i key={i} className={`bi ${i < Math.floor(rating) ? 'bi-star-fill' : 'bi-star'} me-1`}></i>
                  ))}
                </div>
                <span className="fw-bold text-dark me-2">{rating.toFixed(1)} Rating</span>
                <span className="text-muted text-decoration-underline small">(Verified Customers)</span>
              </div>

              <hr className="my-3 text-muted" />

              {/* Price details */}
              <div className="my-3">
                <div className="d-flex align-items-center mb-1">
                  <span className="fs-1 fw-bold text-dark">₹{discountPrice}</span>
                  {hasDiscount && (
                    <span className="text-muted text-decoration-line-through fs-5 ms-3">₹{originalPrice}</span>
                  )}
                  {hasDiscount && (
                    <span className="badge bg-danger ms-3 px-3 py-1.5 rounded-pill fs-6">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <span className="text-muted small">Inclusive of all taxes</span>
              </div>

              {/* Inventory status */}
              <div className="mb-4">
                {isOutOfStock ? (
                  <span className="badge bg-danger px-3 py-2 rounded-pill">Out of Stock</span>
                ) : (
                  <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold">
                    In Stock: {product.stockQuantity} items remaining
                  </span>
                )}
              </div>

              {/* Description text */}
              <div className="mb-4">
                <h6 className="fw-bold text-dark">Product Highlights</h6>
                <p className="text-muted small" style={{ lineHeight: '1.6' }}>
                  {product.description || "This item is freshly sourced directly from local producers. Packaged under high hygiene standards, ensuring maximum quality, nutrition, and freshness when delivered directly to you."}
                </p>
              </div>

              {/* Add / Adjust quantity actions */}
              <div className="mt-auto">
                <div className="d-flex align-items-center gap-3">
                  {isOutOfStock ? (
                    <button className="btn btn-secondary btn-lg disabled px-5 py-2.5 rounded-3" disabled>
                      Sold Out
                    </button>
                  ) : quantity === 0 ? (
                    <button 
                      className="btn btn-gm-primary btn-lg px-5 py-2.5 rounded-3 shadow-sm"
                      onClick={() => addToCart(product.productId, 1)}
                      style={{ backgroundColor: 'var(--gm-primary)' }}
                    >
                      <i className="bi bi-cart-plus me-2"></i> Add To Cart
                    </button>
                  ) : (
                    <div className="d-flex align-items-center gap-2">
                      <div className="quantity-selector d-flex align-items-center border rounded-3 overflow-hidden shadow-sm" style={{ width: '120px', height: '48px', backgroundColor: '#7C3AED', borderColor: '#7C3AED' }}>
                        <button className="btn text-white w-30 fw-bold shadow-none border-0" onClick={() => handleQuantityChange(quantity - 1)} style={{ fontSize: '1.2rem' }}>-</button>
                        <span className="text-white text-center flex-grow-1 fw-bold fs-5">{quantity}</span>
                        <button className="btn text-white w-30 fw-bold shadow-none border-0" onClick={() => handleQuantityChange(quantity + 1)} style={{ fontSize: '1.2rem' }}>+</button>
                      </div>
                      <span className="text-muted small ms-2">Adjust items</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products list */}
        {relatedProducts.length > 0 && (
          <div>
            <h4 className="fw-bold mb-4 text-dark d-flex align-items-center">
              <i className="bi bi-arrow-repeat text-success me-2 fs-4"></i> Related Products
            </h4>
            <div className="row">
              {relatedProducts.map(p => <ProductCard key={p.productId} product={p} />)}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;
