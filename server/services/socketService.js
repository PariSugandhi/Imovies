const { getIO } = require('../config/socket');

/**
 * Broadcast seat updates for a specific show
 * @param {string} showId
 * @param {Array<{ seatNumber: string, status: string, category?: string, price?: number }>} updatedSeats
 * @param {string} action - 'locked', 'booked', 'released'
 */
const broadcastSeatUpdate = (showId, updatedSeats, action = 'updated') => {
  try {
    const io = getIO();
    if (!io) return;

    io.to(`show_${showId}`).emit('seats_updated', {
      showId,
      action,
      seats: updatedSeats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Socket] Failed to broadcast seat update:', error.message);
  }
};

module.exports = { broadcastSeatUpdate };
