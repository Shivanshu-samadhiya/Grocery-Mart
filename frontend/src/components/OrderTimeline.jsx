import React from 'react';

const OrderTimeline = ({ status }) => {
  const steps = [
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const getStepIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING': return -1;
      case 'CONFIRMED': return 0;
      case 'ASSIGNED': return 1;
      case 'PICKED_UP': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return -1;
    }
  };

  const currentIndex = getStepIndex(status);

  if (status === 'CANCELLED') {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2 m-0 mt-3 py-2 px-3 small border-0" style={{ borderRadius: '10px' }}>
        <i className="bi bi-x-circle-fill"></i>
        <span>This order has been cancelled and cannot be tracked.</span>
      </div>
    );
  }

  return (
    <div className="py-3 px-2">
      <div className="position-relative d-flex justify-content-between align-items-center w-100" style={{ minWidth: '280px' }}>
        {/* Timeline connector bar */}
        <div 
          className="position-absolute start-0 end-0 bg-light" 
          style={{ height: '3px', top: '50%', transform: 'translateY(-50%)', zIndex: 0 }}
        />
        {/* Filled timeline connector bar */}
        <div 
          className="position-absolute start-0 bg-success transition-all" 
          style={{ 
            height: '3px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            zIndex: 0,
            width: currentIndex >= 0 ? `${(currentIndex / (steps.length - 1)) * 100}%` : '0%',
            transition: 'width 0.4s ease'
          }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || (status === 'DELIVERED' && idx === 4);
          const isActive = idx === currentIndex && status !== 'DELIVERED';
          const isPending = idx > currentIndex && !isCompleted;

          return (
            <div key={step.key} className="d-flex flex-column align-items-center position-relative z-1">
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center transition-all ${
                  isCompleted 
                    ? 'bg-success text-white' 
                    : isActive 
                      ? 'bg-success text-white shadow-lg' 
                      : 'bg-white border text-muted'
                }`}
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  fontSize: '0.75rem',
                  borderWidth: '2px',
                  borderColor: isCompleted || isActive ? '#198754' : '#dee2e6',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isCompleted ? (
                  <i className="bi bi-check-lg fw-bold"></i>
                ) : isActive ? (
                  <span className="spinner-grow spinner-grow-sm" role="status" style={{ width: '10px', height: '10px' }} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span 
                className={`small mt-2 text-center text-truncate fw-semibold ${isActive ? 'text-success' : isCompleted ? 'text-dark' : 'text-muted'}`}
                style={{ fontSize: '0.7rem', width: '70px' }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
