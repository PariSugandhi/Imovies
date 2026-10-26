const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show ID is required'],
      index: true,
    },
    seatNumber: {
      type: String, // e.g. "A1", "C8"
      required: [true, 'Seat number is required'],
      trim: true,
    },
    row: {
      type: String, // "A", "B", "C"...
      required: true,
      trim: true,
    },
    col: {
      type: Number, // 1, 2, 3...
      required: true,
    },
    category: {
      type: String,
      enum: ['Classic', 'Prime', 'Recliner'],
      default: 'Classic',
    },
    price: {
      type: Number,
      required: [true, 'Seat price is required'],
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
      index: true,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique seat per show ensures no duplicates
seatSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ showId: 1, status: 1 });

module.exports = mongoose.model('Seat', seatSchema);
