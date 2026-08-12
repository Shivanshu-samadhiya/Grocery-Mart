import React from 'react';

export const CategorySkeleton = () => {
  return (
    <div className="col-6 col-md-3 col-lg-2 mb-3">
      <div className="card border-0 bg-white p-3 d-flex flex-column align-items-center rounded-3 shadow-sm">
        <div className="skeleton rounded-circle mb-2" style={{ width: '60px', height: '60px' }}></div>
        <div className="skeleton skeleton-text w-75"></div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="col-6 col-md-4 col-lg-3 mb-4">
      <div className="card border-0 bg-white p-3 rounded-4 shadow-sm h-100">
        <div className="skeleton skeleton-img mb-3"></div>
        <div className="skeleton skeleton-text w-50 mb-2"></div>
        <div className="skeleton skeleton-title mb-2"></div>
        <div className="skeleton skeleton-text w-40 mb-3"></div>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div className="skeleton skeleton-text w-30" style={{ height: '24px' }}></div>
          <div className="skeleton rounded" style={{ width: '70px', height: '36px' }}></div>
        </div>
      </div>
    </div>
  );
};

export const DetailsSkeleton = () => {
  return (
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-md-6">
          <div className="skeleton rounded-4 shadow-sm" style={{ width: '100%', height: '400px' }}></div>
        </div>
        <div className="col-md-6">
          <div className="skeleton skeleton-text w-25 mb-3" style={{ height: '20px' }}></div>
          <div className="skeleton skeleton-title mb-3" style={{ height: '40px' }}></div>
          <div className="skeleton skeleton-text w-50 mb-4" style={{ height: '24px' }}></div>
          <div className="skeleton skeleton-text w-100 mb-2" style={{ height: '16px' }}></div>
          <div className="skeleton skeleton-text w-100 mb-2" style={{ height: '16px' }}></div>
          <div className="skeleton skeleton-text w-75 mb-4" style={{ height: '16px' }}></div>
          <div className="skeleton skeleton-text w-30 mb-4" style={{ height: '30px' }}></div>
          <div className="d-flex gap-3 align-items-center">
            <div className="skeleton rounded" style={{ width: '120px', height: '45px' }}></div>
            <div className="skeleton rounded" style={{ width: '150px', height: '45px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
