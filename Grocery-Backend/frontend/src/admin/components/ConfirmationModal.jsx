import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmationModal = ({
  show = false,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  onConfirm,
  onCancel,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  variant = 'danger' // danger, warning, success
}) => {
  const getButtonClass = () => {
    switch (variant) {
      case 'success': return 'btn-success';
      case 'warning': return 'btn-warning text-dark';
      default: return 'btn-danger';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: '1060' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <motion.div 
              className="modal-content border-0 p-3 rounded-4 bg-white shadow-lg"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
            >
              <div className="modal-header border-0 pb-1">
                <h5 className="modal-title fw-bold text-dark">{title}</h5>
                <button type="button" className="btn-close shadow-none" onClick={onCancel} disabled={loading}></button>
              </div>
              <div className="modal-body py-2">
                <p className="text-muted small m-0" style={{ lineHeight: '1.5' }}>{message}</p>
              </div>
              <div className="modal-footer border-0 pt-3 gap-2">
                <button 
                  type="button" 
                  className="btn btn-light border px-4 py-2" 
                  onClick={onCancel} 
                  disabled={loading}
                  style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                >
                  {cancelText}
                </button>
                <button 
                  type="button" 
                  className={`btn ${getButtonClass()} px-4 py-2 fw-semibold d-flex align-items-center gap-2`} 
                  onClick={onConfirm}
                  disabled={loading}
                  style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                >
                  {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
