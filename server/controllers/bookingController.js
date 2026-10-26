const Booking = require('../models/Booking');
const { confirmBooking, cancelBooking } = require('../services/bookingService');

// @desc    Create a new booking (race-safe)
// @route   POST /api/bookings
// @access  Private
const createNewBooking = async (req, res, next) => {
  try {
    const { showId, seatNumbers, paymentMethodType } = req.body;

    if (!showId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide showId and an array of seatNumbers.',
      });
    }

    const booking = await confirmBooking({
      userId: req.user._id,
      showId,
      seatNumbers,
      paymentMethodType: paymentMethodType || 'upi',
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking,
    });
  } catch (error) {
    if (error.message.includes('Conflict') || error.message.includes('collision') || error.message.includes('already been booked')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc    Get logged in user's booking history
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const { filter = 'all', page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id };

    if (filter === 'cancelled') {
      query.bookingStatus = 'cancelled';
    } else if (filter === 'confirmed') {
      query.bookingStatus = 'confirmed';
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('movieId', 'title posterUrl duration language genre')
      .populate('theatreId', 'name location city address')
      .populate('showId', 'showDate startTime screenNumber ticketPricing')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Classify into upcoming vs past based on show date
    const todayStr = new Date().toISOString().split('T')[0];
    const categorized = bookings.map((b) => {
      const bObj = b.toObject();
      const showDate = b.showId ? b.showId.showDate : '';
      if (b.bookingStatus === 'cancelled') {
        bObj.timingStatus = 'cancelled';
      } else if (showDate >= todayStr) {
        bObj.timingStatus = 'upcoming';
      } else {
        bObj.timingStatus = 'past';
      }
      return bObj;
    });

    let filteredList = categorized;
    if (filter === 'upcoming') {
      filteredList = categorized.filter((b) => b.timingStatus === 'upcoming');
    } else if (filter === 'past') {
      filteredList = categorized.filter((b) => b.timingStatus === 'past');
    }

    res.status(200).json({
      success: true,
      count: filteredList.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      bookings: filteredList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId')
      .populate('showId')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Only owner or admin
    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking.',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an eligible booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelMyBooking = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const booking = await cancelBooking(req.params.id, req.user._id, isAdmin);

    res.status(200).json({
      success: true,
      message: 'Booking has been cancelled and seats released. Refund initiated.',
      booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    if (search && search.trim() !== '') {
      query.bookingReference = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('movieId', 'title posterUrl')
      .populate('theatreId', 'name city location')
      .populate('showId', 'showDate startTime screenNumber')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNewBooking,
  getMyBookings,
  getBookingById,
  cancelMyBooking,
  getAllBookings,
};
