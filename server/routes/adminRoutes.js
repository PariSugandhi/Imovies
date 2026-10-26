const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');
const { getAllBookings } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/bookings', getAllBookings);

module.exports = router;
