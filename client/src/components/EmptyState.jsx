import React from 'react';
import { Film } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Film,
  title = 'No items found',
  description = 'Try adjusting your search or filters to discover available titles.',
  actionText,
  onAction,
}) => {
  return (
    <div className="text-center py-5 my-4 px-3 bg-white rounded-3 border">
      <div
        className="d-inline-flex p-3 rounded-circle bg-light text-secondary mb-3"
      >
        <Icon size={32} />
      </div>
      <h5 className="fw-bold mb-2">{title}</h5>
      <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button className="btn btn-sm btn-cinema-outline" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
