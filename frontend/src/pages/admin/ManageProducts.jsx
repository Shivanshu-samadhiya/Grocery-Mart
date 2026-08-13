import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import AdminSidebar from '../../components/AdminSidebar';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals visibility toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // react-hook-form instances
  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, formState: { errors: errorsAdd } } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, setValue: setValueEdit, formState: { errors: errorsEdit } } = useForm();

  const categories = [
    'FRUITS_AND_VEGETABLES',
    'DAIRY_AND_EGGS',
    'BAKERY',
    'BEVERAGES',
    'SNACKS',
    'MEAT_AND_SEAFOOD',
    'GRAINS_AND_PULSES',
    'FROZEN_FOODS',
    'HOUSEHOLD_ESSENTIALS',
    'PERSONAL_CARE',
    'OTHERS'
  ];

  const fetchProducts = async (page = 0, query = '') => {
    try {
      setLoading(true);
      let url = `/products?page=${page}&size=8&sortBy=productId&direction=desc`;
      
      if (query) {
        url = `/products/search?keyword=${encodeURIComponent(query)}`;
      }

      const res = await axiosInstance.get(url);
      
      if (res.data.products) {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      } else if (res.data.content) {
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.number);
      } else if (Array.isArray(res.data)) {
        setProducts(res.data);
        setTotalPages(1);
        setCurrentPage(0);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, searchQuery);
  }, [currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchProducts(0, searchQuery);
  };

  // Add Product submit handler
  const onAddSubmit = async (data) => {
    try {
      await axiosInstance.post('/products', {
        name: data.name,
        description: data.description,
        category: data.category,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity),
        imageUrl: data.imageUrl
      });
      toast.success("Product added successfully!");
      setShowAddModal(false);
      resetAdd();
      fetchProducts(currentPage, searchQuery);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to add product";
      toast.error(errMsg);
    }
  };

  // Edit modal opening handler
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setValueEdit('name', product.name);
    setValueEdit('description', product.description);
    setValueEdit('category', product.category);
    setValueEdit('price', product.price);
    setValueEdit('stockQuantity', product.stockQuantity);
    setValueEdit('imageUrl', product.imageUrl);
    setShowEditModal(true);
  };

  // Edit Product submit handler
  const onEditSubmit = async (data) => {
    try {
      await axiosInstance.put(`/products/${selectedProduct.productId}`, {
        name: data.name,
        description: data.description,
        category: data.category,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity),
        imageUrl: data.imageUrl
      });
      toast.success("Product updated successfully!");
      setShowEditModal(false);
      fetchProducts(currentPage, searchQuery);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to update product";
      toast.error(errMsg);
    }
  };

  // Delete Product handler
  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axiosInstance.delete(`/products/${productId}`);
        toast.success("Product deleted successfully");
        fetchProducts(currentPage, searchQuery);
      } catch (err) {
        toast.error("Failed to delete product. It might be linked to active orders.");
      }
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar navigation */}
      <div style={{ width: '260px', flexShrink: 0 }}>
        <AdminSidebar />
      </div>

      {/* Main Admin Workspace */}
      <main className="admin-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">Manage Products</h3>
          <button className="btn btn-gm-primary shadow-sm" onClick={() => setShowAddModal(true)} style={{ backgroundColor: 'var(--gm-primary)' }}>
            <i className="bi bi-plus-circle me-1"></i> Add Product
          </button>
        </div>

        {/* Filter controls search box */}
        <div className="card border-0 p-3 rounded-4 bg-white shadow-sm mb-4">
          <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '400px' }}>
            <input 
              type="text" 
              className="form-control border-light-subtle shadow-none py-2" 
              placeholder="Search product by keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: '8px' }}
            />
            <button type="submit" className="btn btn-success px-4" style={{ backgroundColor: 'var(--gm-primary)', borderRadius: '8px' }}>
              Search
            </button>
            {searchQuery && (
              <button 
                type="button" 
                className="btn btn-light border" 
                onClick={() => { setSearchQuery(''); fetchProducts(0, ''); }}
                style={{ borderRadius: '8px' }}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Products Table Grid */}
        <div className="gm-table-container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted">Updating inventory details...</p>
            </div>
          ) : products.length > 0 ? (
            <table className="gm-table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Supplier</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.productId}>
                    {/* Image thumb */}
                    <td>
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="rounded" 
                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&auto=format&fit=crop&q=60';
                        }}
                      />
                    </td>

                    {/* Product Name */}
                    <td className="fw-semibold text-dark">{product.name}</td>

                    {/* Category tag */}
                    <td>
                      <span className="badge bg-light text-success border border-success-subtle px-2.5 py-1.5" style={{ borderRadius: '30px' }}>
                        {product.category?.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="fw-bold">₹{product.price}</td>

                    {/* Stock */}
                    <td>
                      <span className={`badge ${product.stockQuantity < 10 ? 'bg-danger' : 'bg-success'} px-2.5 py-1.5`} style={{ borderRadius: '30px' }}>
                        {product.stockQuantity} items
                      </span>
                    </td>

                    {/* Supplier */}
                    <td className="small text-muted">{product.supplierName || 'System Admin'}</td>

                    {/* Actions */}
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button className="btn btn-outline-success btn-sm border-0" onClick={() => handleEditClick(product)}>
                          <i className="bi bi-pencil-square fs-5"></i>
                        </button>
                        <button className="btn btn-outline-danger btn-sm border-0" onClick={() => handleDeleteProduct(product.productId)}>
                          <i className="bi bi-trash fs-5"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-info-circle fs-2"></i>
              <h5 className="mt-2 fw-semibold">No products found</h5>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {!searchQuery && totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination shadow-sm" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                  <button className="page-item page-link text-success border-0 py-2.5 px-3.5" onClick={() => setCurrentPage(currentPage - 1)}>
                    Previous
                  </button>
                </li>
                {Array(totalPages).fill(0).map((_, idx) => (
                  <li key={idx} className={`page-item ${currentPage === idx ? 'active' : ''}`}>
                    <button 
                      className={`page-link border-0 py-2.5 px-3.5 ${currentPage === idx ? 'bg-success text-white' : 'text-success'}`}
                      onClick={() => setCurrentPage(idx)}
                    >
                      {idx + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                  <button className="page-item page-link text-success border-0 py-2.5 px-3.5" onClick={() => setCurrentPage(currentPage + 1)}>
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {/* MODAL: ADD PRODUCT */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: '1050' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 p-3 rounded-4 bg-white shadow-lg">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold">Add Product</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <form onSubmit={handleSubmitAdd(onAddSubmit)}>
                  <div className="modal-body">
                    {/* NAME */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Product Name</label>
                      <input 
                        type="text" 
                        className={`form-control ${errorsAdd.name ? 'border-danger' : 'border-light-subtle'}`} 
                        placeholder="e.g. Fresh Tomatoes" 
                        {...registerAdd("name", { required: "Name is required" })}
                        style={{ borderRadius: '8px' }}
                      />
                      {errorsAdd.name && <span className="text-danger small mt-1 d-block">{errorsAdd.name.message}</span>}
                    </div>

                    {/* CATEGORY */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Category</label>
                      <select 
                        className="form-select border-light-subtle" 
                        {...registerAdd("category", { required: "Category is required" })}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      {errorsAdd.category && <span className="text-danger small mt-1 d-block">{errorsAdd.category.message}</span>}
                    </div>

                    {/* PRICE AND STOCK */}
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold">Price (₹)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          className={`form-control ${errorsAdd.price ? 'border-danger' : 'border-light-subtle'}`} 
                          placeholder="0.00" 
                          {...registerAdd("price", { required: "Price is required", min: { value: 0.01, message: "Must be > 0" } })}
                          style={{ borderRadius: '8px' }}
                        />
                        {errorsAdd.price && <span className="text-danger small mt-1 d-block">{errorsAdd.price.message}</span>}
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Stock Quantity</label>
                        <input 
                          type="number" 
                          className={`form-control ${errorsAdd.stockQuantity ? 'border-danger' : 'border-light-subtle'}`} 
                          placeholder="e.g. 100" 
                          {...registerAdd("stockQuantity", { required: "Stock is required", min: { value: 0, message: "Must be >= 0" } })}
                          style={{ borderRadius: '8px' }}
                        />
                        {errorsAdd.stockQuantity && <span className="text-danger small mt-1 d-block">{errorsAdd.stockQuantity.message}</span>}
                      </div>
                    </div>

                    {/* IMAGE URL */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Image URL</label>
                      <input 
                        type="text" 
                        className={`form-control ${errorsAdd.imageUrl ? 'border-danger' : 'border-light-subtle'}`} 
                        placeholder="https://..." 
                        {...registerAdd("imageUrl", { required: "Image URL is required" })}
                        style={{ borderRadius: '8px' }}
                      />
                      {errorsAdd.imageUrl && <span className="text-danger small mt-1 d-block">{errorsAdd.imageUrl.message}</span>}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Description</label>
                      <textarea 
                        className={`form-control ${errorsAdd.description ? 'border-danger' : 'border-light-subtle'}`} 
                        rows="2" 
                        placeholder="Details highlights..." 
                        {...registerAdd("description", { required: "Description is required" })}
                        style={{ borderRadius: '8px', resize: 'none' }}
                      />
                      {errorsAdd.description && <span className="text-danger small mt-1 d-block">{errorsAdd.description.message}</span>}
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button type="button" className="btn btn-light border px-4" onClick={() => setShowAddModal(false)} style={{ borderRadius: '8px' }}>Cancel</button>
                    <button type="submit" className="btn btn-success px-4" style={{ backgroundColor: 'var(--gm-primary)', borderRadius: '8px' }}>Save Product</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: EDIT PRODUCT */}
        {showEditModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: '1050' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 p-3 rounded-4 bg-white shadow-lg">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold">Edit Product</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <form onSubmit={handleSubmitEdit(onEditSubmit)}>
                  <div className="modal-body">
                    {/* NAME */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Product Name</label>
                      <input 
                        type="text" 
                        className={`form-control ${errorsEdit.name ? 'border-danger' : 'border-light-subtle'}`} 
                        placeholder="e.g. Fresh Tomatoes" 
                        {...registerEdit("name", { required: "Name is required" })}
                        style={{ borderRadius: '8px' }}
                      />
                      {errorsEdit.name && <span className="text-danger small mt-1 d-block">{errorsEdit.name.message}</span>}
                    </div>

                    {/* CATEGORY */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Category</label>
                      <select 
                        className="form-select border-light-subtle" 
                        {...registerEdit("category", { required: "Category is required" })}
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      {errorsEdit.category && <span className="text-danger small mt-1 d-block">{errorsEdit.category.message}</span>}
                    </div>

                    {/* PRICE AND STOCK */}
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold">Price (₹)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          className={`form-control ${errorsEdit.price ? 'border-danger' : 'border-light-subtle'}`} 
                          placeholder="0.00" 
                          {...registerEdit("price", { required: "Price is required", min: { value: 0.01, message: "Must be > 0" } })}
                          style={{ borderRadius: '8px' }}
                        />
                        {errorsEdit.price && <span className="text-danger small mt-1 d-block">{errorsEdit.price.message}</span>}
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Stock Quantity</label>
                        <input 
                          type="number" 
                          className={`form-control ${errorsEdit.stockQuantity ? 'border-danger' : 'border-light-subtle'}`} 
                          placeholder="e.g. 100" 
                          {...registerEdit("stockQuantity", { required: "Stock is required", min: { value: 0, message: "Must be >= 0" } })}
                          style={{ borderRadius: '8px' }}
                        />
                        {errorsEdit.stockQuantity && <span className="text-danger small mt-1 d-block">{errorsEdit.stockQuantity.message}</span>}
                      </div>
                    </div>

                    {/* IMAGE URL */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Image URL</label>
                      <input 
                        type="text" 
                        className={`form-control ${errorsEdit.imageUrl ? 'border-danger' : 'border-light-subtle'}`} 
                        placeholder="https://..." 
                        {...registerEdit("imageUrl", { required: "Image URL is required" })}
                        style={{ borderRadius: '8px' }}
                      />
                      {errorsEdit.imageUrl && <span className="text-danger small mt-1 d-block">{errorsEdit.imageUrl.message}</span>}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Description</label>
                      <textarea 
                        className={`form-control ${errorsEdit.description ? 'border-danger' : 'border-light-subtle'}`} 
                        rows="2" 
                        placeholder="Details highlights..." 
                        {...registerEdit("description", { required: "Description is required" })}
                        style={{ borderRadius: '8px', resize: 'none' }}
                      />
                      {errorsEdit.description && <span className="text-danger small mt-1 d-block">{errorsEdit.description.message}</span>}
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button type="button" className="btn btn-light border px-4" onClick={() => setShowEditModal(false)} style={{ borderRadius: '8px' }}>Cancel</button>
                    <button type="submit" className="btn btn-success px-4" style={{ backgroundColor: 'var(--gm-primary)', borderRadius: '8px' }}>Update Product</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ManageProducts;
