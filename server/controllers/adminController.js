const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Payment = require('../models/Payment');

// @desc    Get dashboard metrics & overview statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalTheatres = await Theatre.countDocuments();
    const totalShows = await Show.countDocuments({ status: 'scheduled' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });

    // Calculate revenue from confirmed bookings
    const revenueAggregate = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed', paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0;

    // Recent 5 bookings
    const recentBookings = await Booking.find()
      .populate('movieId', 'title posterUrl')
      .populate('theatreId', 'name city')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top 5 booked movies
    const topMovies = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      { $group: { _id: '$movieId', bookingCount: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movie',
        },
      },
      { $unwind: '$movie' },
      {
        $project: {
          movieId: '$_id',
          title: '$movie.title',
          posterUrl: '$movie.posterUrl',
          bookingCount: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalMovies,
        totalTheatres,
        totalShows,
        totalUsers,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
      },
      recentBookings,
      topMovies,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
};
