import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import DataTable from '../components/DataTable';
import ConfirmationModal from '../components/ConfirmationModal';
import { TableRowSkeleton } from '../components/Skeletons';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Detail Modal / Panel States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // CRUD Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms setup
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
      let data;
      if (query.trim()) {
        data = await productService.searchProducts(query);
      } else {
        data = await productService.getProducts(page, 8, 'productId', 'desc');
      }

      if (data.products) {
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else if (Array.isArray(data)) {
        setProducts(data);
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

  // Add Product Submit
  const onAddSubmit = async (data) => {
    try {
      setActionLoading(true);
      await productService.addProduct({
        name: data.name,
        description: data.description,
        category: data.category,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity),
        imageUrl: data.imageUrl
      });
      toast.success("Product created successfully!");
      setShowAddModal(false);
      resetAdd();
      fetchProducts(currentPage, searchQuery);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to create product";
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Form
  const handleEditClick = (product) => {
    setProductToEdit(product);
    setValueEdit('name', product.name);
    setValueEdit('description', product.description);
    setValueEdit('category', product.category);
    setValueEdit('price', product.price);
    setValueEdit('stockQuantity', product.stockQuantity);
    setValueEdit('imageUrl', product.imageUrl);
    setShowEditModal(true);
  };

  // Edit Product Submit
  const onEditSubmit = async (data) => {
    try {
      setActionLoading(true);
      await productService.updateProduct(productToEdit.productId, {
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
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Confirm Action
  const handleConfirmDelete = async () => {
    try {
      setActionLoading(true);
      await productService.deleteProduct(productToDelete.productId);
      toast.success("Product deleted successfully");
      setShowDeleteModal(false);
      fetchProducts(currentPage, searchQuery);
    } catch (err) {
      toast.error("Failed to delete product. It might be linked to active orders.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStockBadge = (qty) => {
    if (qty === 0) {
      return <span className="admin-badge admin-badge-danger">Out Of Stock</span>;
    }
    if (qty < 10) {
      return <span className="admin-badge admin-badge-warning">Low Stock</span>;
    }
    return <span className="admin-badge admin-badge-success">In Stock</span>;
  };

  const tableHeaders = [
    { label: 'Image' },
    { label: 'Name' },
    { label: 'Category' },
    { label: 'Price' },
    { label: 'Stock' },
    { label: 'Supplier' },
    { label: 'Actions', className: 'text-end' }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold m-0 text-dark">Product Catalog</h4>
        <button className="btn btn-admin-primary shadow-sm" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-circle me-1"></i> Add Product
        </button>
      </div>

      {/* Filter and search panel */}
      <div className="card border-0 p-3 rounded-4 bg-white shadow-sm mb-4">
        <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '450px' }}>
          <input 
            type="text" 
            className="form-control border-light-subtle shadow-none py-2" 
            placeholder="Search products by keyword..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ borderRadius: '8px', fontSize: '0.9rem' }}
          />
          <button type="submit" className="btn btn-success px-4" style={{ backgroundColor: 'var(--gm-admin-primary)', borderRadius: '8px' }}>
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

      {/* DataTable component */}
      <DataTable 
        headers={tableHeaders}
        data={products}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
        emptyMessage="No products match your search query."
        renderRow={(product) => (
          <tr key={product.productId}>
            <td>
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="rounded border p-1"
                style={{ width: '40px', height: '40px', objectFit: 'contain', cursor: 'pointer' }}
                onClick={() => { setSelectedProduct(product); setShowDetailPanel(true); }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&auto=format&fit=crop&q=60'; }}
              />
            </td>
            <td className="fw-semibold text-dark" style={{ cursor: 'pointer' }} onClick={() => { setSelectedProduct(product); setShowDetailPanel(true); }}>
              {product.name}
            </td>
            <td>
              <span className="badge bg-light text-success border border-success-subtle px-2.5 py-1.5 rounded-pill">
                {product.category?.replace(/_/g, ' ')}
              </span>
            </td>
            <td className="fw-bold">₹{product.price}</td>
            <td>
              <div className="d-flex flex-column align-items-start gap-1">
                <span className="fw-bold small">{product.stockQuantity} items</span>
                {getStockBadge(product.stockQuantity)}
              </div>
            </td>
            <td className="small text-muted">{product.supplierName || 'Console System'}</td>
            <td className="text-end">
              <div className="d-inline-flex gap-2">
                <button className="btn btn-light border btn-sm" onClick={() => { setSelectedProduct(product); setShowDetailPanel(true); }} title="View details">
                  <i className="bi bi-eye"></i>
                </button>
                <button className="btn btn-outline-success btn-sm border-0" onClick={() => handleEditClick(product)} title="Edit product">
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button className="btn btn-outline-danger btn-sm border-0" onClick={() => { setProductToDelete(product); setShowDeleteModal(true); }} title="Delete product">
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationModal 
        show={showDeleteModal}
        title="Delete Product"
        message={`Are you sure you want to delete ${productToDelete?.name}? This action will permanently remove it from the catalog.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        loading={actionLoading}
      />

      {/* MODAL: ADD PRODUCT */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: '1050' }}>
            <div className="modal-dialog modal-dialog-centered">
              <motion.div 
                className="modal-content border-0 p-3 rounded-4 bg-white shadow-lg"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
              >
                <div className="modal-header border-0 pb-1">
                  <h5 className="modal-title fw-bold">Add Product</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => { setShowAddModal(false); resetAdd(); }}></button>
                </div>
                <form onSubmit={handleSubmitAdd(onAddSubmit)}>
                  <div className="modal-body py-2">
                    {/* Name */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Product Name</label>
                      <input 
                        type="text" 
                        className={`form-control shadow-none ${errorsAdd.name ? 'border-danger' : 'border-light-subtle'}`} 
                        placeholder="e.g. Organic Bananas" 
                        style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                        {...registerAdd("name", { required: "Name is required" })}
                      />
                      {errorsAdd.name && <span className="text-danger small mt-1 d-block">{errorsAdd.name.message}</span>}
                    </div>

                    {/* Category */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Category</label>
                      <select 
                        className="form-select shadow-none border-light-subtle" 
                        style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                        {...registerAdd("category", { required: "Category is required" })}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      {errorsAdd.category && <span className="text-danger small mt-1 d-block">{errorsAdd.category.message}</span>}
                    </div>

                    {/* Price and Stock */}
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold">Price (₹)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          className={`form-control shadow-none ${errorsAdd.price ? 'border-danger' : 'border-light-subtle'}`} 
                          placeholder="0.00" 
                          style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                          {...registerAdd("price", { required: "Price is required", min: { value: 0.01, message: "Price must be > 0" } })}
                        />
                        {errorsAdd.price && <span className="text-danger small mt-1 d-block">{errorsAdd.price.message}</span>}
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Stock Quantity</label>
                        <input 
                          type="number" 
                          className={`form-control shadow-none ${errorsAdd.stockQuantity ? 'border-danger' : 'border-light-subtle'}`} 
                          placeholder="e.g. 100" 
                          style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                          {...registerAdd("stockQuantity", { required: "Stock is required", min: { value: 0, message: "Must be >= 0" } })}
                        />
                        {errorsAdd.stockQuantity && <span className="text-danger small mt-1 d-block">{errorsAdd.stockQuantity.message}</span>}
                      </div>
                    </div>

                    {/* Image URL */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Image URL</label>
                      <input 
                        type="text" 
                        className={`form-control shadow-none ${errorsAdd.imageUrl ? 'border-danger' : 'border-light-subtle'}`} 
                        placeholder="https://..." 
                        style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                        {...registerAdd("imageUrl", { required: "Image URL is required" })}
                      />
                      {errorsAdd.imageUrl && <span className="text-danger small mt-1 d-block">{errorsAdd.imageUrl.message}</span>}
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Description</label>
                      <textarea 
                        className={`form-control shadow-none ${errorsAdd.description ? 'border-danger' : 'border-light-subtle'}`} 
                        rows="2" 
                        placeholder="Detail specifications..." 
                        style={{ borderRadius: '8px', resize: 'none', fontSize: '0.9rem' }}
                        {...registerAdd("description", { required: "Description is required" })}
                      />
                      {errorsAdd.description && <span className="text-danger small mt-1 d-block">{errorsAdd.description.message}</span>}
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-3 gap-2">
                    <button type="button" className="btn btn-light border px-4 py-2" onClick={() => { setShowAddModal(false); resetAdd(); }} style={{ borderRadius: '10px', fontSize: '0.9rem' }}>Cancel</button>
                    <button type="submit" className="btn btn-success px-4 py-2 fw-semibold" disabled={actionLoading} style={{ borderRadius: '10px', fontSize: '0.9rem', backgroundColor: 'var(--gm-admin-primary)' }}>
                      {actionLoading ? 'Saving...' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT PRODUCT */}
      <AnimatePresence>
        {showEditModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: '1050' }}>
            <div className="modal-dialog modal-dialog-centered">
              <motion.div 
                className="modal-content border-0 p-3 rounded-4 bg-white shadow-lg"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
              >
                <div className="modal-header border-0 pb-1">
                  <h5 className="modal-title fw-bold">Edit Product</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowEditModal(false)}></button>
                </div>
                <form onSubmit={handleSubmitEdit(onEditSubmit)}>
                  <div className="modal-body py-2">
                    {/* Name */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Product Name</label>
                      <input 
                        type="text" 
                        className={`form-control shadow-none ${errorsEdit.name ? 'border-danger' : 'border-light-subtle'}`} 
                        placeholder="e.g. Organic Bananas" 
                        style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                        {...registerEdit("name", { required: "Name is required" })}
                      />
                      {errorsEdit.name && <span className="text-danger small mt-1 d-block">{errorsEdit.name.message}</span>}
                    </div>

                    {/* Category */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Category</label>
                      <select 
                        className="form-select shadow-none border-light-subtle" 
                        style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                        {...registerEdit("category", { required: "Category is required" })}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      {errorsEdit.category && <span className="text-danger small mt-1 d-block">{errorsEdit.category.message}</span>}
                    </div>

                    {/* Price and Stock */}
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold">Price (₹)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          className={`form-control shadow-none ${errorsEdit.price ? 'border-danger' : 'border-light-subtle'}`} 
                          placeholder="0.00" 
                          style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                          {...registerEdit("price", { required: "Price is required", min: { value: 0.01, message: "Price must be > 0" } })}
                        />
                        {errorsEdit.price && <span className="text-danger small mt-1 d-block">{errorsEdit.price.message}</span>}
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Stock Quantity</label>
                        <input 
                          type="number" 
                          className={`form-control shadow-none ${errorsEdit.stockQuantity ? 'border-danger' : 'border-light-subtle'}`} 
                          placeholder="e.g. 100" 
                          style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                          {...registerEdit("stockQuantity", { required: "Stock is required", min: { value: 0, message: "Must be >= 0" } })}
                        />
                        {errorsEdit.stockQuantity && <span className="text-danger small mt-1 d-block">{errorsEdit.stockQuantity.message}</span>}
                      </div>
                    </div>

                    {/* Image URL */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Image URL</label>
                      <input 
                        type="text" 
                        className={`form-control shadow-none ${errorsEdit.imageUrl ? 'border-danger' : 'border-light-subtle'}`} 
                        placeholder="https://..." 
                        style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                        {...registerEdit("imageUrl", { required: "Image URL is required" })}
                      />
                      {errorsEdit.imageUrl && <span className="text-danger small mt-1 d-block">{errorsEdit.imageUrl.message}</span>}
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Description</label>
                      <textarea 
                        className={`form-control shadow-none ${errorsEdit.description ? 'border-danger' : 'border-light-subtle'}`} 
                        rows="2" 
                        placeholder="Detail specifications..." 
                        style={{ borderRadius: '8px', resize: 'none', fontSize: '0.9rem' }}
                        {...registerEdit("description", { required: "Description is required" })}
                      />
                      {errorsEdit.description && <span className="text-danger small mt-1 d-block">{errorsEdit.description.message}</span>}
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-3 gap-2">
                    <button type="button" className="btn btn-light border px-4 py-2" onClick={() => setShowEditModal(false)} style={{ borderRadius: '10px', fontSize: '0.9rem' }}>Cancel</button>
                    <button type="submit" className="btn btn-success px-4 py-2 fw-semibold" disabled={actionLoading} style={{ borderRadius: '10px', fontSize: '0.9rem', backgroundColor: 'var(--gm-admin-primary)' }}>
                      {actionLoading ? 'Updating...' : 'Save Updates'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL DRAWER / OVERLAY PANEL */}
      <AnimatePresence>
        {showDetailPanel && selectedProduct && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: '1050' }}>
            <div className="modal-dialog modal-dialog-centered">
              <motion.div 
                className="modal-content border-0 p-4 rounded-4 bg-white shadow-lg"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
              >
                <div className="modal-header border-0 pb-1 align-items-start justify-content-between p-0">
                  <div>
                    <h5 className="modal-title fw-bold text-dark m-0">{selectedProduct.name}</h5>
                    <span className="small text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>{selectedProduct.category?.replace(/_/g, ' ')}</span>
                  </div>
                  <button type="button" className="btn-close shadow-none p-1 m-0" onClick={() => setShowDetailPanel(false)}></button>
                </div>
                <div className="modal-body py-4 px-0">
                  <div className="row g-4 align-items-center">
                    <div className="col-4 text-center">
                      <img 
                        src={selectedProduct.imageUrl} 
                        alt={selectedProduct.name} 
                        className="img-fluid rounded border p-2 bg-light"
                        style={{ maxHeight: '120px', objectFit: 'contain' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=60'; }}
                      />
                    </div>
                    <div className="col-8">
                      <div className="mb-2">
                        <span className="text-muted small d-block fw-semibold" style={{ fontSize: '0.7rem' }}>CATALOG PRICE</span>
                        <h4 className="fw-bold text-success m-0">₹{selectedProduct.price}</h4>
                      </div>
                      <div className="mb-2">
                        <span className="text-muted small d-block fw-semibold" style={{ fontSize: '0.7rem' }}>CURRENT INVENTORY</span>
                        <div className="d-flex align-items-center gap-2">
                          <h6 className="fw-bold m-0">{selectedProduct.stockQuantity} items</h6>
                          {getStockBadge(selectedProduct.stockQuantity)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="my-3 text-muted" />

                  <div className="mb-3">
                    <span className="text-muted small d-block fw-semibold mb-1" style={{ fontSize: '0.7rem' }}>HIGHLIGHTS DESCRIPTION</span>
                    <p className="small text-muted m-0" style={{ lineHeight: '1.5' }}>{selectedProduct.description || 'No description details listed.'}</p>
                  </div>

                  <div className="row g-3 bg-light p-3 rounded-3 small">
                    <div className="col-6">
                      <span className="text-muted d-block" style={{ fontSize: '0.65rem' }}>PRODUCT ID</span>
                      <strong className="text-dark">#GM-{selectedProduct.productId}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block" style={{ fontSize: '0.65rem' }}>SUPPLIER REF</span>
                      <strong className="text-dark">{selectedProduct.supplierName || 'Console Admin'}</strong>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-0 pt-2 gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-success px-4" 
                    onClick={() => { setShowDetailPanel(false); handleEditClick(selectedProduct); }}
                    style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                  >
                    Edit Item
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-light border px-4" 
                    onClick={() => setShowDetailPanel(false)}
                    style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ManageProducts;
