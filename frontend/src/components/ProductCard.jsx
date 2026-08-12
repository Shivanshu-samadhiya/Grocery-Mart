import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { getProductQuantity, getCartItemId, addToCart, updateQuantity } = useCart();
  const quantity = getProductQuantity(product.productId);
  const cartItemId = getCartItemId(product.productId);

  // Helper: Extract or mock a product unit
  const getProductUnit = (name = '', desc = '', category = '') => {
    const combined = `${name} ${desc}`.toLowerCase();
    const unitMatch = combined.match(/\b\d+\s*(kg|g|l|ml|pcs|pack|pieces|kg|gm)\b/i);
    if (unitMatch) return unitMatch[0];
    
    // Fallback units based on category
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

  // Helper: Stable deterministic rating and discount based on ID
  const rating = ((product.productId * 7) % 10) * 0.1 + 4.0; // Stable between 4.0 and 4.9
  const hasDiscount = product.productId % 3 !== 0; // 66% of items have discounts
  const discountPercent = hasDiscount ? ((product.productId * 5) % 15) + 10 : 0; // 10% to 25%
  
  const discountPrice = product.price;
  const originalPrice = hasDiscount 
    ? parseFloat((product.price / (1 - discountPercent / 100)).toFixed(2))
    : product.price;

  // Add to cart handler
  const handleAdd = () => {
    addToCart(product.productId, 1);
  };

  // Quantity change handler
  const handleQuantityChange = (newQty) => {
    if (newQty < 1) {
      updateQuantity(cartItemId, 0);
    } else {
      updateQuantity(cartItemId, newQty);
    }
  };

  // Check stock status
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="col-6 col-md-4 col-lg-3 mb-4">
      <motion.div 
        className="card border-0 bg-white rounded-4 shadow-sm h-100 position-relative overflow-hidden d-flex flex-column"
        whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)' }}
        transition={{ duration: 0.2 }}
      >
        {/* Discount Badge */}
        {hasDiscount && (
          <span className="badge bg-danger position-absolute m-2 top-0 start-0 z-1" style={{ borderRadius: '20px' }}>
            {discountPercent}% OFF
          </span>
        )}

        {/* Product Image Link */}
        <Link to={`/product/${product.productId}`} className="text-decoration-none">
          <div className="p-3 text-center bg-light rounded-top-4 d-flex justify-content-center align-items-center" style={{ height: '180px' }}>
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="img-fluid" 
                style={{ maxHeight: '140px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
                }}
              />
            ) : (
              <div className="text-success" style={{ fontSize: '3rem' }}>
                <i className="bi bi-box-seam"></i>
              </div>
            )}
          </div>
        </Link>

        {/* Card Body */}
        <div className="card-body p-3 d-flex flex-column flex-grow-1">
          {/* Category & Rating */}
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-uppercase font-weight-bold text-success" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              {product.category?.replace(/_/g, ' ')}
            </span>
            <div className="d-flex align-items-center text-warning" style={{ fontSize: '0.8rem' }}>
              <i className="bi bi-star-fill me-1"></i>
              <span className="text-dark fw-bold">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.productId}`} className="text-decoration-none text-dark">
            <h6 className="card-title text-truncate fw-semibold mb-1" title={product.name}>
              {product.name}
            </h6>
          </Link>

          {/* Unit size */}
          <p className="text-muted small mb-2">{unit}</p>

          {/* Footer of Card: Price and ADD Button */}
          <div className="mt-auto d-flex justify-content-between align-items-center">
            {/* Price section */}
            <div>
              <div className="d-flex align-items-center">
                <span className="fw-bold fs-5 text-dark">₹{discountPrice}</span>
                {hasDiscount && (
                  <span className="text-muted text-decoration-line-through ms-2 small">₹{originalPrice}</span>
                )}
              </div>
              {isOutOfStock ? (
                <span className="text-danger small fw-semibold">Out of Stock</span>
              ) : (
                <span className="text-success small fw-semibold" style={{ fontSize: '0.75rem' }}>
                  {product.stockQuantity} Left
                </span>
              )}
            </div>

            {/* Animated Add button or Quantity counter */}
            <div className="add-btn-container" style={{ width: '90px' }}>
              <AnimatePresence mode="wait">
                {isOutOfStock ? (
                  <button className="btn btn-sm btn-secondary disabled rounded" disabled style={{ width: '100%' }}>
                    Sold Out
                  </button>
                ) : quantity === 0 ? (
                  <motion.button
                    key="add-btn"
                    className="add-btn-trigger"
                    onClick={handleAdd}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    ADD
                  </motion.button>
                ) : (
                  <motion.div
                    key="quantity-selector"
                    className="quantity-selector"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button onClick={() => handleQuantityChange(quantity - 1)}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => handleQuantityChange(quantity + 1)}>+</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductCard;
