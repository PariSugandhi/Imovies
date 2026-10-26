const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getMovies);
router.get('/:id', getMovieById);

// Admin-only endpoints
router.post('/', protect, authorize('admin'), upload.single('poster'), createMovie);
router.put('/:id', protect, authorize('admin'), upload.single('poster'), updateMovie);
router.delete('/:id', protect, authorize('admin'), deleteMovie);

module.exports = router;
