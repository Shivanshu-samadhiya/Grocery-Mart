import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { supplierApi } from '../../api/supplierApi';

const CATEGORIES = [
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

const SupplierProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, formState: { errors: errorsAdd } } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, setValue: setValueEdit, formState: { errors: errorsEdit } } = useForm();

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const data = await supplierApi.getMyProducts();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onAddSubmit = async (data) => {
    try {
      await supplierApi.addProduct({
        name: data.name,
        description: data.description,
        category: data.category,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity),
        imageUrl: data.imageUrl
      });
      toast.success('Product added to your catalog!');
      setShowAddModal(false);
      resetAdd();
      fetchMyProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    }
  };

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

  const onEditSubmit = async (data) => {
    try {
      await supplierApi.updateProduct(selectedProduct.productId, {
        name: data.name,
        description: data.description,
        category: data.category,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity),
        imageUrl: data.imageUrl
      });
      toast.success('Product updated!');
      setShowEditModal(false);
      fetchMyProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Remove this product from your catalog?')) {
      try {
        await supplierApi.deleteProduct(productId);
        toast.success('Product removed');
        fetchMyProducts();
      } catch (err) {
        toast.error('Failed to delete product. It might be linked to active orders.');
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0">My Products</h3>
        <button
          className="btn shadow-sm text-white"
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: 'var(--gm-admin-primary)', borderRadius: '8px' }}
        >
          <i className="bi bi-plus-circle me-1"></i> Add Product
        </button>
      </div>

      {/* Search box */}
      <div className="admin-card mb-4">
        <div className="d-flex gap-2" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            className="form-control border-light-subtle shadow-none py-2"
            placeholder="Search your products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ borderRadius: '8px' }}
          />
          {searchQuery && (
            <button type="button" className="btn btn-light border" onClick={() => setSearchQuery('')} style={{ borderRadius: '8px' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Products table */}
      <div className="gm-table-container">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-2 text-muted">Loading your catalog...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <table className="gm-table table-hover">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.productId}>
                  <td>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="rounded"
                      style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&auto=format&fit=crop&q=60'; }}
                    />
                  </td>
                  <td className="fw-semibold text-dark">{product.name}</td>
                  <td>
                    <span className="badge bg-light text-success border border-success-subtle px-2.5 py-1.5" style={{ borderRadius: '30px' }}>
                      {product.category?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="fw-bold">₹{product.price}</td>
                  <td>
                    <span className={`badge ${product.stockQuantity < 10 ? 'bg-danger' : 'bg-success'} px-2.5 py-1.5`} style={{ borderRadius: '30px' }}>
                      {product.stockQuantity} items
                    </span>
                  </td>
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
            <i className="bi bi-box-seam fs-2"></i>
            <h5 className="mt-2 fw-semibold">
              {searchQuery ? 'No matching products' : "You haven't added any products yet"}
            </h5>
            {!searchQuery && <p className="small">Click "Add Product" to list your first item.</p>}
          </div>
        )}
      </div>

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
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Product Name</label>
                    <input
                      type="text"
                      className={`form-control ${errorsAdd.name ? 'border-danger' : 'border-light-subtle'}`}
                      placeholder="e.g. Fresh Tomatoes"
                      {...registerAdd('name', { required: 'Name is required' })}
                      style={{ borderRadius: '8px' }}
                    />
                    {errorsAdd.name && <span className="text-danger small mt-1 d-block">{errorsAdd.name.message}</span>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Category</label>
                    <select
                      className="form-select border-light-subtle"
                      {...registerAdd('category', { required: 'Category is required' })}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                    {errorsAdd.category && <span className="text-danger small mt-1 d-block">{errorsAdd.category.message}</span>}
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className={`form-control ${errorsAdd.price ? 'border-danger' : 'border-light-subtle'}`}
                        placeholder="0.00"
                        {...registerAdd('price', { required: 'Price is required', min: { value: 0.01, message: 'Must be > 0' } })}
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
                        {...registerAdd('stockQuantity', { required: 'Stock is required', min: { value: 0, message: 'Must be >= 0' } })}
                        style={{ borderRadius: '8px' }}
                      />
                      {errorsAdd.stockQuantity && <span className="text-danger small mt-1 d-block">{errorsAdd.stockQuantity.message}</span>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Image URL</label>
                    <input
                      type="text"
                      className={`form-control ${errorsAdd.imageUrl ? 'border-danger' : 'border-light-subtle'}`}
                      placeholder="https://..."
                      {...registerAdd('imageUrl', { required: 'Image URL is required' })}
                      style={{ borderRadius: '8px' }}
                    />
                    {errorsAdd.imageUrl && <span className="text-danger small mt-1 d-block">{errorsAdd.imageUrl.message}</span>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea
                      className={`form-control ${errorsAdd.description ? 'border-danger' : 'border-light-subtle'}`}
                      rows="2"
                      placeholder="Details, highlights..."
                      {...registerAdd('description', { required: 'Description is required' })}
                      style={{ borderRadius: '8px', resize: 'none' }}
                    />
                    {errorsAdd.description && <span className="text-danger small mt-1 d-block">{errorsAdd.description.message}</span>}
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light border px-4" onClick={() => setShowAddModal(false)} style={{ borderRadius: '8px' }}>Cancel</button>
                  <button type="submit" className="btn text-white px-4" style={{ backgroundColor: 'var(--gm-admin-primary)', borderRadius: '8px' }}>Save Product</button>
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
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Product Name</label>
                    <input
                      type="text"
                      className={`form-control ${errorsEdit.name ? 'border-danger' : 'border-light-subtle'}`}
                      {...registerEdit('name', { required: 'Name is required' })}
                      style={{ borderRadius: '8px' }}
                    />
                    {errorsEdit.name && <span className="text-danger small mt-1 d-block">{errorsEdit.name.message}</span>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Category</label>
                    <select
                      className="form-select border-light-subtle"
                      {...registerEdit('category', { required: 'Category is required' })}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                    {errorsEdit.category && <span className="text-danger small mt-1 d-block">{errorsEdit.category.message}</span>}
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className={`form-control ${errorsEdit.price ? 'border-danger' : 'border-light-subtle'}`}
                        {...registerEdit('price', { required: 'Price is required', min: { value: 0.01, message: 'Must be > 0' } })}
                        style={{ borderRadius: '8px' }}
                      />
                      {errorsEdit.price && <span className="text-danger small mt-1 d-block">{errorsEdit.price.message}</span>}
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Stock Quantity</label>
                      <input
                        type="number"
                        className={`form-control ${errorsEdit.stockQuantity ? 'border-danger' : 'border-light-subtle'}`}
                        {...registerEdit('stockQuantity', { required: 'Stock is required', min: { value: 0, message: 'Must be >= 0' } })}
                        style={{ borderRadius: '8px' }}
                      />
                      {errorsEdit.stockQuantity && <span className="text-danger small mt-1 d-block">{errorsEdit.stockQuantity.message}</span>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Image URL</label>
                    <input
                      type="text"
                      className={`form-control ${errorsEdit.imageUrl ? 'border-danger' : 'border-light-subtle'}`}
                      {...registerEdit('imageUrl', { required: 'Image URL is required' })}
                      style={{ borderRadius: '8px' }}
                    />
                    {errorsEdit.imageUrl && <span className="text-danger small mt-1 d-block">{errorsEdit.imageUrl.message}</span>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea
                      className={`form-control ${errorsEdit.description ? 'border-danger' : 'border-light-subtle'}`}
                      rows="2"
                      {...registerEdit('description', { required: 'Description is required' })}
                      style={{ borderRadius: '8px', resize: 'none' }}
                    />
                    {errorsEdit.description && <span className="text-danger small mt-1 d-block">{errorsEdit.description.message}</span>}
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light border px-4" onClick={() => setShowEditModal(false)} style={{ borderRadius: '8px' }}>Cancel</button>
                  <button type="submit" className="btn text-white px-4" style={{ backgroundColor: 'var(--gm-admin-primary)', borderRadius: '8px' }}>Update Product</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierProducts;
