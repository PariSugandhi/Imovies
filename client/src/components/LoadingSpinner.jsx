import React from 'react';

const LoadingSpinner = ({ message = 'Loading cinema experience...' }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5 my-5 text-center">
      <div className="spinner-border text-danger mb-3" style={{ width: '2.5rem', height: '2.5rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted small fw-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
