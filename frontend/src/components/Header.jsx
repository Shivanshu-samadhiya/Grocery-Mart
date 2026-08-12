import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import axiosInstance from '../api/axiosInstance';
import logo from '../assets/logo.png';
import { toast } from 'react-toastify';

const Header = () => {
  const { user, logout } = useAuth();
  const { totalItemsCount, subtotal } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const suggestionRef = useRef(null);

  // Popular and Recent searches (mock data for visual excellence)
  const popularSearches = ['Fresh Milk', 'Organic Tomatoes', 'Bread', 'Coca Cola', 'Apples'];

  // Fetch search suggestions from API
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await axiosInstance.get(`/products/search?keyword=${searchQuery}`);
        setSuggestions(response.data.slice(0, 5)); // show top 5 matches
      } catch (err) {
        console.error("Error fetching suggestions", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside listener for search suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (productId) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/product/${productId}`);
  };


  return (
    <nav className="navbar navbar-expand-lg sticky-navbar py-2 bg-white">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center me-4" to="/">
          <img 
            src={logo} 
            alt="GroceryMart Logo" 
            height="40" 
            className="d-inline-block align-top me-2 rounded-2"
            style={{ objectFit: 'cover' }}
          />
          <span className="fw-extrabold text-success fs-4" style={{ letterSpacing: '-0.5px' }}>
            Grocery<span className="text-warning">Mart</span>
          </span>
        </Link>

        {/* Location Selector */}
        <div className="me-auto d-none d-lg-block">
          <button 
            className="btn btn-light btn-sm text-start bg-transparent border-0 d-flex flex-column align-items-start px-2 py-1" 
            type="button" 
            onClick={() => navigate(user ? '/profile' : '/login')}
            title={user ? "Edit address in profile" : "Log in to set address"}
          >
            <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600 }}>DELIVERING TO</span>
            <span className="fw-semibold text-dark d-flex align-items-center text-truncate" style={{ fontSize: '0.85rem', maxWidth: '220px' }}>
              <i className="bi bi-geo-alt-fill text-success me-1"></i>
              {user ? (user.address || 'Set Address in Profile') : 'Login to set address'}
              {user && <i className="bi bi-pencil ms-1" style={{ fontSize: '0.7rem', color: 'var(--gm-primary)' }}></i>}
            </span>
          </button>
        </div>

        {/* Live Search bar */}
        <div className="mx-lg-4 flex-grow-1 position-relative my-2 my-lg-0" style={{ maxWidth: '600px' }} ref={suggestionRef}>
          <form onSubmit={handleSearchSubmit} className="position-relative w-100">
            <div className="input-group bg-light rounded-3 overflow-hidden border border-light">
              <span className="input-group-text bg-light border-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control bg-light border-0 shadow-none py-2" 
                placeholder='Search "milk", "tomato", "banana"...'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                style={{ fontSize: '0.9rem' }}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="btn border-0 text-muted bg-light"
                  onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>
          </form>

          {/* Search Suggestion Dropdown */}
          {showSuggestions && (searchQuery.trim().length >= 2 || suggestions.length > 0) && (
            <div className="position-absolute w-100 bg-white shadow-lg rounded-3 border-0 mt-1 p-2 z-3" style={{ top: '100%' }}>
              {isSearching ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                  <span className="ms-2 text-muted small">Searching...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div>
                  <div className="px-3 py-1 text-muted small fw-bold">SUGGESTIONS</div>
                  {suggestions.map((item) => (
                    <button
                      key={item.productId}
                      className="dropdown-item d-flex align-items-center gap-3 py-2 rounded-2"
                      onClick={() => handleSuggestionClick(item.productId)}
                      style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                    >
                      <img 
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&auto=format&fit=crop&q=60'} 
                        alt={item.name} 
                        style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                      />
                      <div>
                        <div className="fw-semibold text-dark small">{item.name}</div>
                        <div className="text-success small">₹{item.price}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-muted small">
                  No products match "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* User, Wishlist and Cart buttons */}
        <div className="d-flex align-items-center gap-3 ms-lg-auto">


          {/* Cart Badge (First Item) */}
          <Link 
            className="btn d-flex align-items-center gap-2 px-3 py-2 rounded-3 border-0 position-relative btn-cart-red text-white shadow-sm" 
            to="/cart"
          >
            <i className="bi bi-cart3 fs-5"></i>
            {totalItemsCount > 0 && (
              <span className="badge bg-warning text-dark rounded-circle position-absolute top-0 start-100 translate-middle-x">
                {totalItemsCount}
              </span>
            )}
            <span className="d-none d-sm-inline fw-bold" style={{ fontSize: '0.9rem' }}>
              Cart
            </span>
          </Link>

          {/* User Profile / Login dropdown (Second Item) */}
          {user ? (
            <div className="dropdown">
              <button 
                className="btn btn-light border-0 bg-transparent text-dark fw-semibold py-2 px-3 rounded-3 d-flex align-items-center gap-2" 
                type="button" 
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle fs-5 text-primary"></i>
                <span className="d-none d-md-inline" style={{ fontSize: '0.9rem' }}>Hi, {user.username}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end border-0 shadow rounded-3 p-2" style={{ minWidth: '180px' }}>
                <li>
                  <Link className="dropdown-item py-2 rounded-2" to="/">
                    🏠 Home
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item py-2 rounded-2" to="/profile">
                    👤 My Profile
                  </Link>
                </li>
                {user.role === 'USER' && (
                  <li>
                    <Link className="dropdown-item py-2 rounded-2" to="/my-orders">
                      📦 My Orders
                    </Link>
                  </li>
                )}
                <li>
                  <Link className="dropdown-item py-2 rounded-2" to="/profile">
                    📍 My Addresses
                  </Link>
                </li>
                {user.role === 'ADMIN' && (
                  <li>
                    <Link className="dropdown-item py-2 rounded-2 fw-semibold text-primary" to="/admin/dashboard">
                      ⚙️ Admin Panel
                    </Link>
                  </li>
                )}
                {user.role === 'SUPPLIER' && (
                  <li>
                    <Link className="dropdown-item py-2 rounded-2 fw-semibold text-primary" to="/supplier/dashboard">
                      🏭 Supplier Dashboard
                    </Link>
                  </li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item py-2 rounded-2 text-danger" onClick={logout}>
                    🚪 Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link className="btn btn-success px-4 fw-semibold rounded-3" to="/login" style={{ fontSize: '0.9rem', backgroundColor: 'var(--gm-primary)' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
