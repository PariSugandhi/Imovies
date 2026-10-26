const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true,
    },
    screenNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    showDate: {
      type: String, // Stored as YYYY-MM-DD for reliable day matching
      required: [true, 'Show date is required (YYYY-MM-DD)'],
      index: true,
    },
    startTime: {
      type: String, // e.g. "10:30 AM" or "19:00"
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      default: '',
    },
    ticketPricing: {
      classic: { type: Number, default: 180 },
      prime: { type: Number, default: 280 },
      recliner: { type: Number, default: 450 },
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent schedule collisions: ensure same screen cannot have identical start times on the same date
showSchema.index({ theatreId: 1, showDate: 1, screenNumber: 1, startTime: 1 }, { unique: true });
showSchema.index({ movieId: 1, showDate: 1 });

module.exports = mongoose.model('Show', showSchema);
