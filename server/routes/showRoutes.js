const express = require('express');
const router = express.Router();
const {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
} = require('../controllers/showController');
const {
  getSeats,
  holdShowSeats,
  releaseShowSeats,
} = require('../controllers/seatController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Seat endpoints for a show
router.get('/:id/seats', getSeats);
router.post('/:id/hold', protect, holdShowSeats);
router.post('/:id/release', protect, releaseShowSeats);

// Show endpoints
router.get('/', getShows);
router.get('/:id', getShowById);
router.post('/', protect, authorize('admin'), createShow);
router.put('/:id', protect, authorize('admin'), updateShow);
router.delete('/:id', protect, authorize('admin'), deleteShow);

module.exports = router;
