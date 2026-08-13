import React from 'react';

const DataTable = ({ 
  headers = [], 
  data = [], 
  loading = false, 
  emptyMessage = 'No records found',
  renderRow,
  totalPages = 1,
  currentPage = 0,
  onPageChange
}) => {
  return (
    <div className="gm-admin-table-card">
      <div className="table-responsive">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-2 text-muted small">Updating registry logs...</p>
          </div>
        ) : data.length > 0 ? (
          <table className="gm-admin-table">
            <thead>
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className={h.className || ''} style={h.style || {}}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => renderRow(item, idx))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-1 d-block mb-2 text-muted"></i>
            <span className="small fw-semibold">{emptyMessage}</span>
          </div>
        )}
      </div>

      {/* Pagination component */}
      {!loading && data.length > 0 && totalPages > 1 && onPageChange && (
        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light-subtle">
          <span className="small text-muted">Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong></span>
          <nav>
            <ul className="pagination pagination-sm m-0 shadow-none border-0 gap-1">
              <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                <button 
                  className="page-link border-light-subtle text-primary py-1.5 px-3 rounded-2" 
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, idx) => (
                <li key={idx} className={`page-item ${currentPage === idx ? 'active' : ''}`}>
                  <button 
                    className={`page-link border-light-subtle py-1.5 px-3 rounded-2 ${currentPage === idx ? 'bg-primary border-primary text-white' : 'text-primary'}`}
                    onClick={() => onPageChange(idx)}
                  >
                    {idx + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link border-light-subtle text-primary py-1.5 px-3 rounded-2" 
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default DataTable;
