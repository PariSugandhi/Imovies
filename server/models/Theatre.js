const mongoose = require('mongoose');

const screenCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['Classic', 'Prime', 'Recliner'],
      required: true,
    },
    rows: {
      type: [String], // e.g. ['A', 'B', 'C']
      required: true,
    },
    basePrice: {
      type: Number,
      default: 200,
    },
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    screenNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      default: function () {
        return `Audi ${this.screenNumber}`;
      },
    },
    totalRows: {
      type: Number,
      default: 8,
    },
    seatsPerRow: {
      type: Number,
      default: 10,
    },
    categories: {
      type: [screenCategorySchema],
      default: () => [
        { name: 'Classic', rows: ['A', 'B', 'C', 'D'], basePrice: 180 },
        { name: 'Prime', rows: ['E', 'F', 'G'], basePrice: 280 },
        { name: 'Recliner', rows: ['H'], basePrice: 450 },
      ],
    },
  },
  { _id: false }
);

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location / Area is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    seatingConfiguration: {
      totalScreens: {
        type: Number,
        default: 3,
      },
      screens: {
        type: [screenSchema],
        default: () => [
          { screenNumber: 1, name: 'Audi 1 - IMAX', totalRows: 8, seatsPerRow: 10 },
          { screenNumber: 2, name: 'Audi 2 - Dolby Atmos', totalRows: 8, seatsPerRow: 10 },
          { screenNumber: 3, name: 'Audi 3 - Gold Class', totalRows: 6, seatsPerRow: 8 },
        ],
      },
    },
    contactInfo: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    facilities: {
      type: [String],
      default: ['Dolby 7.1', 'Parking', 'Food Court', 'Wheelchair Access', 'Recliners'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

theatreSchema.index({ city: 1, location: 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
