const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Booking = require('../models/Booking');

// @desc    Get all movies with filtering, sorting and pagination
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      status,
      sort = '-releaseDate',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // Search by title or description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by genre
    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(`^${genre.trim()}$`, 'i')] };
    }

    // Filter by language
    if (language && language !== 'All') {
      query.language = { $regex: new RegExp(`^${language.trim()}$`, 'i') };
    }

    // Filter by status (now_showing / coming_soon / archived)
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID with available shows
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    // Fetch active shows for this movie
    const todayStr = new Date().toISOString().split('T')[0];
    const shows = await Show.find({
      movieId: movie._id,
      status: 'scheduled',
      showDate: { $gte: todayStr },
    })
      .populate('theatreId', 'name location city address facilities')
      .sort({ showDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      movie,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new movie (Admin only)
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    let {
      title,
      description,
      genre,
      language,
      duration,
      releaseDate,
      posterUrl,
      backdropUrl,
      trailerUrl,
      cast,
      rating,
      status,
    } = req.body;

    // Handle poster file upload if provided
    if (req.file) {
      posterUrl = `/uploads/${req.file.filename}`;
    }

    if (!posterUrl) {
      return res.status(400).json({
        success: false,
        message: 'A poster image URL or file upload is required.',
      });
    }

    // Parse array fields if passed as JSON string from multipart form
    if (typeof genre === 'string') {
      try {
        genre = JSON.parse(genre);
      } catch (e) {
        genre = genre.split(',').map((g) => g.trim());
      }
    }

    if (typeof cast === 'string') {
      try {
        cast = JSON.parse(cast);
      } catch (e) {
        cast = cast.split(',').map((c) => ({ name: c.trim(), role: 'Actor' }));
      }
    }

    const movie = await Movie.create({
      title,
      description,
      genre,
      language,
      duration: Number(duration),
      releaseDate,
      posterUrl,
      backdropUrl: backdropUrl || posterUrl,
      trailerUrl,
      cast: cast || [],
      rating: rating ? Number(rating) : 8.0,
      status: status || 'now_showing',
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully.',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie (Admin only)
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.posterUrl = `/uploads/${req.file.filename}`;
    }

    if (typeof updateData.genre === 'string') {
      try {
        updateData.genre = JSON.parse(updateData.genre);
      } catch (e) {
        updateData.genre = updateData.genre.split(',').map((g) => g.trim());
      }
    }

    if (typeof updateData.cast === 'string') {
      try {
        updateData.cast = JSON.parse(updateData.cast);
      } catch (e) {
        updateData.cast = updateData.cast.split(',').map((c) => ({ name: c.trim(), role: 'Actor' }));
      }
    }

    const updated = await Movie.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully.',
      movie: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie safely (Admin only)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    // Check if there are active shows scheduled for this movie
    const activeShows = await Show.countDocuments({
      movieId: movie._id,
      status: 'scheduled',
    });

    if (activeShows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete movie: There are ${activeShows} active scheduled shows referencing this title. Please cancel or remove the shows first.`,
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
