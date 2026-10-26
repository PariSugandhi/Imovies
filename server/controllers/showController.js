const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const { generateSeatsForShow } = require('../services/seatService');

// @desc    Get shows with filtering by movie, theatre, date, city
// @route   GET /api/shows
// @access  Public
const getShows = async (req, res, next) => {
  try {
    const { movieId, theatreId, showDate, city, location } = req.query;
    const query = { status: 'scheduled' };

    if (movieId) query.movieId = movieId;
    if (theatreId) query.theatreId = theatreId;
    if (showDate) query.showDate = showDate;

    let shows = await Show.find(query)
      .populate('movieId', 'title posterUrl duration rating genre language')
      .populate('theatreId', 'name location city address facilities')
      .sort({ showDate: 1, startTime: 1 });

    // Filter by city or location if specified
    if (city && city !== 'All') {
      shows = shows.filter(
        (s) => s.theatreId && s.theatreId.city.toLowerCase() === city.toLowerCase()
      );
    }
    if (location && location !== 'All') {
      shows = shows.filter(
        (s) => s.theatreId && s.theatreId.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: shows.length,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show details
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    res.status(200).json({
      success: true,
      show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create show and generate seats (Admin only)
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res, next) => {
  try {
    const {
      movieId,
      theatreId,
      screenNumber = 1,
      showDate,
      startTime,
      endTime,
      ticketPricing,
    } = req.body;

    if (!movieId || !theatreId || !showDate || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movieId, theatreId, showDate, and startTime.',
      });
    }

    // Verify Movie and Theatre
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Referenced movie does not exist.' });
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Referenced theatre does not exist.' });
    }

    // Collision check: same screen, same date, same start time
    const collision = await Show.findOne({
      theatreId,
      screenNumber: Number(screenNumber),
      showDate,
      startTime,
      status: { $ne: 'cancelled' },
    });

    if (collision) {
      return res.status(409).json({
        success: false,
        message: `Schedule conflict: Screen ${screenNumber} at ${theatre.name} already has a show scheduled at ${startTime} on ${showDate}.`,
      });
    }

    // Create the show
    const show = await Show.create({
      movieId,
      theatreId,
      screenNumber: Number(screenNumber),
      showDate,
      startTime,
      endTime: endTime || '',
      ticketPricing: ticketPricing || { classic: 180, prime: 280, recliner: 450 },
      status: 'scheduled',
    });

    // Automatically generate seats for this show
    await generateSeatsForShow(show._id, theatre, screenNumber, show.ticketPricing);

    const populatedShow = await Show.findById(show._id)
      .populate('movieId', 'title posterUrl duration')
      .populate('theatreId', 'name city location');

    res.status(201).json({
      success: true,
      message: 'Show created and seating layout generated successfully.',
      show: populatedShow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update show (Admin only)
// @route   PUT /api/shows/:id
// @access  Private/Admin
const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    const updated = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('movieId')
      .populate('theatreId');

    res.status(200).json({
      success: true,
      message: 'Show updated successfully.',
      show: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or cancel show safely (Admin only)
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found.',
      });
    }

    // Check if any bookings exist for this show
    const existingBookings = await Booking.countDocuments({
      showId: show._id,
      bookingStatus: 'confirmed',
    });

    if (existingBookings > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete show: There are ${existingBookings} active confirmed customer bookings for this show. Cancel the bookings or mark the show as cancelled instead.`,
      });
    }

    // Clean up seats and show
    await Seat.deleteMany({ showId: show._id });
    await Show.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Show and associated seats deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
};
