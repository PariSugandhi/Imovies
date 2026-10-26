const { getShowSeats, holdSeats, releaseSeats } = require('../services/seatService');

// @desc    Get all seats for a specific show
// @route   GET /api/shows/:id/seats
// @access  Public
const getSeats = async (req, res, next) => {
  try {
    const seats = await getShowSeats(req.params.id);

    // Group summary by category and calculate counts
    const totalSeats = seats.length;
    const availableSeats = seats.filter((s) => s.status === 'available').length;
    const bookedSeats = seats.filter((s) => s.status === 'booked').length;
    const lockedSeats = seats.filter((s) => s.status === 'locked').length;

    res.status(200).json({
      success: true,
      summary: {
        totalSeats,
        availableSeats,
        bookedSeats,
        lockedSeats,
      },
      seats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Temporary lock seats during checkout
// @route   POST /api/shows/:id/hold
// @access  Private
const holdShowSeats = async (req, res, next) => {
  try {
    const { seatNumbers } = req.body;
    if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of seat numbers to hold.',
      });
    }

    await holdSeats(req.params.id, seatNumbers, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Seats held temporarily for 5 minutes.',
      seatNumbers,
    });
  } catch (error) {
    res.status(409).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Release temporarily held seats
// @route   POST /api/shows/:id/release
// @access  Private
const releaseShowSeats = async (req, res, next) => {
  try {
    const { seatNumbers } = req.body;
    if (!seatNumbers || !Array.isArray(seatNumbers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide seat numbers to release.',
      });
    }

    await releaseSeats(req.params.id, seatNumbers, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Seats released.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSeats,
  holdShowSeats,
  releaseShowSeats,
};
