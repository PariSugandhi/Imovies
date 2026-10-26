const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { releaseSeats } = require('../services/seatService');
const Notification = require('../models/Notification');

// @desc    Simulate payment processing (Demo Gateway)
// @route   POST /api/payments/demo
// @access  Private
const processDemoPayment = async (req, res, next) => {
  try {
    const {
      showId,
      seatNumbers,
      amount,
      paymentMethodType = 'upi',
      simulateOutcome = 'success', // 'success' or 'failure'
    } = req.body;

    if (simulateOutcome === 'failure') {
      // Payment simulated failure: release held seats immediately
      if (showId && seatNumbers) {
        await releaseSeats(showId, seatNumbers, req.user._id);
      }

      await Notification.create({
        userId: req.user._id,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: 'Your simulated payment transaction could not be processed. Held seats have been released.',
      });

      return res.status(402).json({
        success: false,
        message: 'Payment simulation failed. Transaction was declined by demo bank. Held seats have been released.',
        status: 'failed',
      });
    }

    // Success outcome will be handled via confirmed booking
    res.status(200).json({
      success: true,
      message: 'Demo payment authorized successfully.',
      status: 'authorized',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment status for a booking
// @route   GET /api/payments/:bookingId
// @access  Private
const getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.bookingId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found for this booking.',
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processDemoPayment,
  getPaymentStatus,
};
