import React from 'react';

const SeatLegend = () => {
  return (
    <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 py-3 px-4 bg-white rounded-3 border mb-4">
      <div className="d-flex align-items-center gap-2">
        <span className="seat-btn seat-available" style={{ cursor: 'default' }}>
          ✓
        </span>
        <span className="small text-secondary">Available</span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <span className="seat-btn seat-selected" style={{ cursor: 'default' }}>
          ✓
        </span>
        <span className="small text-secondary">Selected</span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <span className="seat-btn seat-booked" style={{ cursor: 'default' }}>
          ✕
        </span>
        <span className="small text-secondary">Booked</span>
      </div>

      <div className="d-flex align-items-center gap-2">
        <span className="seat-btn seat-locked" style={{ cursor: 'default' }}>
          ⏳
        </span>
        <span className="small text-secondary">On Hold</span>
      </div>
    </div>
  );
};

export default SeatLegend;
