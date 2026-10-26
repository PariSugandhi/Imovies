const express = require('express');
const router = express.Router();
const {
  createNewBooking,
  getMyBookings,
  getBookingById,
  cancelMyBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createNewBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, cancelMyBooking);

module.exports = router;
