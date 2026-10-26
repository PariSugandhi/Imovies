const Seat = require('../models/Seat');
const { broadcastSeatUpdate } = require('./socketService');

// 5 minutes temporary hold expiration
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Automatically generate seats for a newly scheduled show based on theatre screen setup
 */
const generateSeatsForShow = async (showId, theatre, screenNumber, ticketPricing) => {
  const screen =
    theatre.seatingConfiguration?.screens?.find((s) => s.screenNumber === Number(screenNumber)) ||
    {
      totalRows: 8,
      seatsPerRow: 10,
      categories: [
        { name: 'Classic', rows: ['A', 'B', 'C', 'D'], basePrice: ticketPricing?.classic || 180 },
        { name: 'Prime', rows: ['E', 'F', 'G'], basePrice: ticketPricing?.prime || 280 },
        { name: 'Recliner', rows: ['H'], basePrice: ticketPricing?.recliner || 450 },
      ],
    };

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].slice(0, screen.totalRows || 8);
  const seatsPerRow = screen.seatsPerRow || 10;
  const categories = screen.categories || [];

  const seatsToInsert = [];

  for (const row of rows) {
    // Determine category and price for this row
    let category = 'Classic';
    let price = ticketPricing?.classic || 180;

    const matchedCat = categories.find((c) => c.rows?.includes(row));
    if (matchedCat) {
      category = matchedCat.name;
      if (category === 'Prime') price = ticketPricing?.prime || 280;
      else if (category === 'Recliner') price = ticketPricing?.recliner || 450;
      else price = ticketPricing?.classic || 180;
    }

    for (let col = 1; col <= seatsPerRow; col++) {
      const seatNumber = `${row}${col}`;
      seatsToInsert.push({
        showId,
        seatNumber,
        row,
        col,
        category,
        price,
        status: 'available',
        lockedBy: null,
        lockedAt: null,
      });
    }
  }

  // Insert all seats with unique error catch
  return Seat.insertMany(seatsToInsert, { ordered: false });
};

/**
 * Release any locks older than 5 minutes for a show
 */
const cleanupExpiredLocks = async (showId) => {
  const expirationThreshold = new Date(Date.now() - LOCK_TIMEOUT_MS);
  const expiredSeats = await Seat.find({
    showId,
    status: 'locked',
    lockedAt: { $lt: expirationThreshold },
  });

  if (expiredSeats.length > 0) {
    const seatNumbers = expiredSeats.map((s) => s.seatNumber);
    await Seat.updateMany(
      { _id: { $in: expiredSeats.map((s) => s._id) } },
      { $set: { status: 'available', lockedBy: null, lockedAt: null } }
    );

    broadcastSeatUpdate(
      showId,
      seatNumbers.map((num) => ({ seatNumber: num, status: 'available' })),
      'released'
    );
  }
};

/**
 * Get all seats for a show, automatically cleaning up any stale locks
 */
const getShowSeats = async (showId) => {
  await cleanupExpiredLocks(showId);
  return Seat.find({ showId }).sort({ row: 1, col: 1 });
};

/**
 * Hold / lock seats temporarily during checkout
 */
const holdSeats = async (showId, seatNumbers, userId) => {
  await cleanupExpiredLocks(showId);

  // Check if all requested seats are currently available or already locked by this user
  const seats = await Seat.find({
    showId,
    seatNumber: { $in: seatNumbers },
  });

  if (seats.length !== seatNumbers.length) {
    throw new Error('One or more selected seats do not exist in this auditorium.');
  }

  for (const s of seats) {
    if (s.status === 'booked') {
      throw new Error(`Seat ${s.seatNumber} has already been booked.`);
    }
    if (s.status === 'locked' && s.lockedBy && s.lockedBy.toString() !== userId.toString()) {
      throw new Error(`Seat ${s.seatNumber} is currently selected by another customer.`);
    }
  }

  // Atomically lock them for this user
  await Seat.updateMany(
    {
      showId,
      seatNumber: { $in: seatNumbers },
      $or: [{ status: 'available' }, { status: 'locked', lockedBy: userId }],
    },
    {
      $set: {
        status: 'locked',
        lockedBy: userId,
        lockedAt: new Date(),
      },
    }
  );

  broadcastSeatUpdate(
    showId,
    seatNumbers.map((num) => ({ seatNumber: num, status: 'locked' })),
    'locked'
  );

  return true;
};

/**
 * Release temporary hold
 */
const releaseSeats = async (showId, seatNumbers, userId) => {
  await Seat.updateMany(
    {
      showId,
      seatNumber: { $in: seatNumbers },
      status: 'locked',
      lockedBy: userId,
    },
    {
      $set: {
        status: 'available',
        lockedBy: null,
        lockedAt: null,
      },
    }
  );

  broadcastSeatUpdate(
    showId,
    seatNumbers.map((num) => ({ seatNumber: num, status: 'available' })),
    'released'
  );

  return true;
};

module.exports = {
  generateSeatsForShow,
  getShowSeats,
  cleanupExpiredLocks,
  holdSeats,
  releaseSeats,
};
