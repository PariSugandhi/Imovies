const crypto = require('crypto');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Show = require('../models/Show');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { broadcastSeatUpdate } = require('./socketService');

/**
 * Generate a unique 8-character booking reference: IMV-XXXXXX
 */
const generateBookingReference = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars like 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `IMV-${code}`;
};

/**
 * Atomic seat reservation and booking creation
 */
const confirmBooking = async ({ userId, showId, seatNumbers, paymentMethodType = 'upi' }) => {
  if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    throw new Error('Please select at least one seat to book.');
  }

  // 1. Validate show existence and active status
  const show = await Show.findById(showId).populate('movieId theatreId');
  if (!show) {
    throw new Error('The selected showtime does not exist.');
  }
  if (show.status !== 'scheduled') {
    throw new Error('This show has been cancelled or completed.');
  }

  // 2. Fetch the seats and re-validate availability
  const seats = await Seat.find({
    showId,
    seatNumber: { $in: seatNumbers },
  });

  if (seats.length !== seatNumbers.length) {
    throw new Error('One or more selected seats were not found in this show.');
  }

  // 3. Re-validate on server: check if already booked or locked by someone else
  for (const s of seats) {
    if (s.status === 'booked') {
      throw new Error(`Conflict: Seat ${s.seatNumber} has already been booked by another user.`);
    }
    if (s.status === 'locked' && s.lockedBy && s.lockedBy.toString() !== userId.toString()) {
      // Check if lock expired
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (s.lockedAt && s.lockedAt > fiveMinsAgo) {
        throw new Error(`Conflict: Seat ${s.seatNumber} is currently on hold by another user.`);
      }
    }
  }

  // 4. Calculate total amount
  const totalAmount = seats.reduce((sum, s) => sum + s.price, 0);

  // 5. Generate unique booking reference
  let bookingReference = generateBookingReference();
  let existing = await Booking.findOne({ bookingReference });
  while (existing) {
    bookingReference = generateBookingReference();
    existing = await Booking.findOne({ bookingReference });
  }

  // 6. Create booking record
  const booking = new Booking({
    bookingReference,
    userId,
    showId: show._id,
    movieId: show.movieId._id,
    theatreId: show.theatreId._id,
    seats: seats.map((s) => ({
      seatNumber: s.seatNumber,
      row: s.row,
      col: s.col,
      category: s.category,
      price: s.price,
    })),
    totalAmount,
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
  });

  await booking.save();

  // 7. Atomically lock & mark seats as 'booked'
  const updateResult = await Seat.updateMany(
    {
      showId,
      seatNumber: { $in: seatNumbers },
      $or: [
        { status: 'available' },
        { status: 'locked', lockedBy: userId },
      ],
    },
    {
      $set: {
        status: 'booked',
        bookingId: booking._id,
        lockedBy: null,
        lockedAt: null,
      },
    }
  );

  // Concurrency check: If another user grabbed any seat in the middle of this operation
  if (updateResult.modifiedCount !== seatNumbers.length) {
    // Rollback booking
    await Booking.findByIdAndDelete(booking._id);
    throw new Error('Seat collision detected. One of your selected seats was just taken. Please choose another seat.');
  }

  // 8. Create Payment record
  const transactionReference = `TXN-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
  const payment = new Payment({
    bookingId: booking._id,
    userId,
    amount: totalAmount,
    paymentMethodType,
    transactionReference,
    status: 'success',
  });
  await payment.save();

  booking.paymentReference = transactionReference;
  await booking.save();

  // 9. Send in-app notification
  await Notification.create({
    userId,
    type: 'booking_confirmed',
    title: 'Booking Confirmed!',
    message: `Your tickets for ${show.movieId.title} at ${show.theatreId.name} (${seatNumbers.join(', ')}) are confirmed! Reference: ${bookingReference}`,
    relatedBooking: booking._id,
  });

  // 10. Broadcast real-time seat update via Socket.IO
  broadcastSeatUpdate(
    showId,
    seatNumbers.map((num) => ({ seatNumber: num, status: 'booked' })),
    'booked'
  );

  // Return populated booking
  return Booking.findById(booking._id).populate('movieId theatreId showId');
};

/**
 * Cancel an eligible booking
 */
const cancelBooking = async (bookingId, userId, isAdmin = false) => {
  const booking = await Booking.findById(bookingId).populate('movieId theatreId showId');
  if (!booking) {
    throw new Error('Booking not found.');
  }

  // Ownership check
  if (!isAdmin && booking.userId.toString() !== userId.toString()) {
    throw new Error('Unauthorized to cancel this booking.');
  }

  if (booking.bookingStatus === 'cancelled') {
    throw new Error('This booking has already been cancelled.');
  }

  // Check cancellation eligibility based on show start time
  // Combine showDate (YYYY-MM-DD) and startTime (e.g., "10:30 AM" or "14:00")
  const show = booking.showId;
  if (!show) {
    throw new Error('Associated show information not found.');
  }

  // Compute show datetime
  let showDateTime;
  try {
    const [year, month, day] = show.showDate.split('-');
    // Parse start time (e.g. "10:30 AM" or "06:45 PM")
    const timeMatch = show.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const modifier = timeMatch[3];

      if (modifier && modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (modifier && modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;

      showDateTime = new Date(year, parseInt(month, 10) - 1, day, hours, minutes);
    } else {
      showDateTime = new Date(`${show.showDate}T00:00:00`);
    }
  } catch (e) {
    showDateTime = new Date();
  }

  // Cutoff rule: Must be at least 2 hours before showtime (unless admin cancels)
  const now = new Date();
  const cutoffMs = 2 * 60 * 60 * 1000; // 2 hours
  if (!isAdmin && showDateTime.getTime() - now.getTime() < cutoffMs) {
    throw new Error('Cancellations are only allowed up to 2 hours before the scheduled showtime.');
  }

  // Perform cancellation
  const refundReference = `REF-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;

  booking.bookingStatus = 'cancelled';
  booking.paymentStatus = 'refunded';
  booking.cancellationDetails = {
    cancelledAt: new Date(),
    cancellationReason: isAdmin ? 'Cancelled by Cinema Administrator' : 'Cancelled by User',
    refundAmount: booking.totalAmount,
    refundReference,
  };

  await booking.save();

  // Release the seats back to 'available'
  const seatNumbers = booking.seats.map((s) => s.seatNumber);
  await Seat.updateMany(
    {
      showId: show._id,
      seatNumber: { $in: seatNumbers },
      bookingId: booking._id,
    },
    {
      $set: {
        status: 'available',
        bookingId: null,
        lockedBy: null,
        lockedAt: null,
      },
    }
  );

  // Update payment status
  await Payment.findOneAndUpdate(
    { bookingId: booking._id },
    { $set: { status: 'refunded' } }
  );

  // Notification
  await Notification.create({
    userId: booking.userId,
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: `Your booking for ${booking.movieId.title} (${seatNumbers.join(', ')}) was cancelled. Refund of ₹${booking.totalAmount} will be processed (Ref: ${refundReference}).`,
    relatedBooking: booking._id,
  });

  // Broadcast seat availability update to connected clients
  broadcastSeatUpdate(
    show._id.toString(),
    seatNumbers.map((num) => ({ seatNumber: num, status: 'available' })),
    'released'
  );

  return booking;
};

module.exports = {
  confirmBooking,
  cancelBooking,
};
