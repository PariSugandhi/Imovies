const express = require('express');
const router = express.Router();
const { processDemoPayment, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/demo', protect, processDemoPayment);
router.get('/:bookingId', protect, getPaymentStatus);

module.exports = router;
