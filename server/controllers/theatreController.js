const Theatre = require('../models/Theatre');
const Show = require('../models/Show');

// @desc    Get all theatres with optional city/search filter
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { status: 'active' };

    if (city && city !== 'All') {
      query.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
        { address: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const theatres = await Theatre.find(query).sort({ city: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: theatres.length,
      theatres,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.',
      });
    }

    // Fetch shows running at this theatre
    const todayStr = new Date().toISOString().split('T')[0];
    const shows = await Show.find({
      theatreId: theatre._id,
      status: 'scheduled',
      showDate: { $gte: todayStr },
    })
      .populate('movieId', 'title posterUrl duration rating genre language')
      .sort({ showDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      theatre,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create theatre (Admin only)
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res, next) => {
  try {
    const { name, location, address, city, seatingConfiguration, contactInfo, facilities } = req.body;

    if (!name || !location || !address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, location, address, and city for the theatre.',
      });
    }

    const theatre = await Theatre.create({
      name,
      location,
      address,
      city,
      seatingConfiguration: seatingConfiguration || undefined,
      contactInfo: contactInfo || {},
      facilities: facilities || ['Dolby 7.1', 'Parking', 'Food Court', 'Wheelchair Access'],
    });

    res.status(201).json({
      success: true,
      message: 'Theatre created successfully.',
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update theatre (Admin only)
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.',
      });
    }

    const updated = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Theatre updated successfully.',
      theatre: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theatre safely (Admin only)
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found.',
      });
    }

    const activeShows = await Show.countDocuments({
      theatreId: theatre._id,
      status: 'scheduled',
    });

    if (activeShows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete theatre: There are ${activeShows} active scheduled shows running at this theatre. Cancel them first.`,
      });
    }

    await Theatre.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Theatre deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
};
