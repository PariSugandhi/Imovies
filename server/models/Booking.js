const mongoose = require('mongoose');

const bookingSeatSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true },
    row: { type: String, required: true },
    col: { type: Number },
    category: { type: String, default: 'Classic' },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    seats: {
      type: [bookingSeatSchema],
      required: true,
      validate: [v => v && v.length > 0, 'Booking must include at least one seat'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'refunded'],
      default: 'paid',
    },
    paymentReference: {
      type: String,
      default: '',
    },
    cancellationDetails: {
      cancelledAt: { type: Date },
      cancellationReason: { type: String, default: 'User requested cancellation' },
      refundAmount: { type: Number, default: 0 },
      refundReference: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
