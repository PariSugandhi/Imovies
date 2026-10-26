import React from 'react';

const SeatMap = ({
  seats = [],
  selectedSeats = [],
  onSeatClick,
}) => {
  // Group seats by category and row
  const categories = ['Recliner', 'Prime', 'Classic'];
  const groupedByCategory = {};

  categories.forEach((cat) => {
    groupedByCategory[cat] = {};
  });

  seats.forEach((seat) => {
    const cat = seat.category || 'Classic';
    if (!groupedByCategory[cat]) {
      groupedByCategory[cat] = {};
    }
    if (!groupedByCategory[cat][seat.row]) {
      groupedByCategory[cat][seat.row] = [];
    }
    groupedByCategory[cat][seat.row].push(seat);
  });

  // Sort seats in each row by column
  Object.keys(groupedByCategory).forEach((cat) => {
    Object.keys(groupedByCategory[cat]).forEach((row) => {
      groupedByCategory[cat][row].sort((a, b) => a.col - b.col);
    });
  });

  return (
    <div className="bg-white p-4 rounded-3 border mb-4">
      {/* Cinema Screen Indicator */}
      <div className="cinema-screen-container">
        <div className="cinema-screen-curve"></div>
        <span className="cinema-screen-text">All Eyes This Way (Screen)</span>
      </div>

      {/* Seating Layout By Category */}
      <div className="d-flex flex-column align-items-center">
        {categories.map((category) => {
          const rowsObj = groupedByCategory[category];
          const rowKeys = Object.keys(rowsObj || {}).sort().reverse(); // A at top or bottom depending on convention

          if (rowKeys.length === 0) return null;

          // Price for this category
          const sampleSeat = rowsObj[rowKeys[0]][0];
          const catPrice = sampleSeat ? sampleSeat.price : 0;

          return (
            <div key={category} className="w-100 mb-3" style={{ maxWidth: '640px' }}>
              <div className="seat-category-header d-flex justify-content-between align-items-center">
                <span>{category}</span>
                <span className="text-muted fw-semibold">₹{catPrice}</span>
              </div>

              {rowKeys.map((rowLetter) => {
                const rowSeats = rowsObj[rowLetter];

                return (
                  <div
                    key={rowLetter}
                    className="d-flex align-items-center justify-content-center mb-1"
                  >
                    {/* Row Label Left */}
                    <span
                      className="text-muted fw-bold small text-center"
                      style={{ width: '24px' }}
                    >
                      {rowLetter}
                    </span>

                    {/* Seat Grid */}
                    <div className="d-flex align-items-center mx-2">
                      {rowSeats.map((seat, index) => {
                        const isSelected = selectedSeats.includes(seat.seatNumber);
                        const isBooked = seat.status === 'booked';
                        const isLocked = seat.status === 'locked';

                        let stateClass = 'seat-available';
                        if (isBooked) stateClass = 'seat-booked';
                        else if (isLocked) stateClass = 'seat-locked';
                        else if (isSelected) stateClass = 'seat-selected';

                        // Aisle gap in middle (e.g. after 5th seat)
                        const hasAisle = index === 4 && rowSeats.length > 7;

                        return (
                          <React.Fragment key={seat._id || seat.seatNumber}>
                            <button
                              type="button"
                              className={`seat-btn ${stateClass}`}
                              disabled={isBooked || isLocked}
                              onClick={() => onSeatClick && onSeatClick(seat)}
                              title={`Seat ${seat.seatNumber} — ₹${seat.price} (${category})`}
                            >
                              {seat.col}
                            </button>
                            {hasAisle && <span style={{ width: '20px' }}></span>}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Row Label Right */}
                    <span
                      className="text-muted fw-bold small text-center"
                      style={{ width: '24px' }}
                    >
                      {rowLetter}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeatMap;
