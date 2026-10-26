import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center my-5">
      <div className="d-inline-flex p-4 rounded-circle bg-light border mb-4">
        <Film size={48} className="text-danger" />
      </div>
      <h1 className="display-4 fw-bold mb-2">404</h1>
      <h4 className="fw-semibold mb-3">Screen Not Found</h4>
      <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
        The page or showtime you are looking for has been moved, removed, or never existed in our cinema database.
      </p>
      <Link to="/" className="btn btn-cinema btn-sm d-inline-flex align-items-center gap-2">
        <Home size={16} />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
