const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true,
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true,
    },
    language: {
      type: String,
      required: [true, 'Movie language is required'],
      trim: true,
      index: true,
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Movie duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true,
    },
    backdropUrl: {
      type: String,
      trim: true,
      default: '',
    },
    trailerUrl: {
      type: String,
      trim: true,
      default: '',
    },
    cast: [
      {
        name: { type: String, required: true },
        role: { type: String, default: 'Actor' },
        image: { type: String, default: '' },
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.0,
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'archived'],
      default: 'now_showing',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
