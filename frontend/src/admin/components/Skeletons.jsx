import React from 'react';

export const StatCardSkeleton = () => {
  return (
    <div className="card border-0 bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-row align-items-center gap-3">
      <div className="skeleton-loader rounded-3" style={{ width: '48px', height: '48px', flexShrink: 0 }}></div>
      <div className="flex-grow-1">
        <div className="skeleton-loader rounded mb-2" style={{ width: '60px', height: '14px' }}></div>
        <div className="skeleton-loader rounded" style={{ width: '80px', height: '24px' }}></div>
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx}>
          <div className="skeleton-loader rounded" style={{ width: idx === 0 ? '70px' : '100%', height: '16px' }}></div>
        </td>
      ))}
    </tr>
  );
};

export const DashboardGridSkeleton = () => {
  return (
    <div className="row g-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="col-sm-6 col-lg-3">
          <StatCardSkeleton />
        </div>
      ))}
    </div>
  );
};
