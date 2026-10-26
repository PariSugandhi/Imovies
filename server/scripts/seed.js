require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { generateSeatsForShow } = require('../services/seatService');

const seedDatabase = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to database...');
      await connectDB();
    }

    console.log('[Seed] Clearing existing collection data...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({}),
      Seat.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const adminUser = await User.create({
      name: 'Cinema Admin',
      email: 'admin@imovies.com',
      password: 'AdminPassword123',
      role: 'admin',
      phone: '+91 98765 43210',
    });

    const demoUser = await User.create({
      name: 'Neev Nagaria',
      email: 'user@imovies.com',
      password: 'UserPassword123',
      role: 'user',
      phone: '+91 98111 22334',
    });

    console.log(`[Seed] Created Admin: admin@imovies.com / AdminPassword123`);
    console.log(`[Seed] Created User: user@imovies.com / UserPassword123`);

    console.log('[Seed] Creating realistic movies...');
    const moviesData = [
      {
        title: 'Interstellar: Beyond Time',
        description:
          'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: 'English',
        duration: 169,
        releaseDate: new Date('2024-11-07'),
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        cast: [
          { name: 'Matthew McConaughey', role: 'Cooper' },
          { name: 'Anne Hathaway', role: 'Brand' },
          { name: 'Jessica Chastain', role: 'Murph' },
          { name: 'Michael Caine', role: 'Professor Brand' },
        ],
        rating: 9.2,
        status: 'now_showing',
      },
      {
        title: 'The Dark Knight Protocol',
        description:
          'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genre: ['Action', 'Crime', 'Drama'],
        language: 'English',
        duration: 152,
        releaseDate: new Date('2024-07-18'),
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        cast: [
          { name: 'Christian Bale', role: 'Bruce Wayne / Batman' },
          { name: 'Heath Ledger', role: 'Joker' },
          { name: 'Aaron Eckhart', role: 'Harvey Dent' },
          { name: 'Gary Oldman', role: 'Jim Gordon' },
        ],
        rating: 9.0,
        status: 'now_showing',
      },
      {
        title: 'Dune: Prophecy of Arrakis',
        description:
          'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between love and destiny, he endeavors to prevent a terrible future.',
        genre: ['Sci-Fi', 'Action', 'Adventure'],
        language: 'English',
        duration: 166,
        releaseDate: new Date('2025-03-01'),
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        cast: [
          { name: 'Timothée Chalamet', role: 'Paul Atreides' },
          { name: 'Zendaya', role: 'Chani' },
          { name: 'Rebecca Ferguson', role: 'Lady Jessica' },
          { name: 'Javier Bardem', role: 'Stilgar' },
        ],
        rating: 8.8,
        status: 'now_showing',
      },
      {
        title: 'Kalki 2898 AD',
        description:
          'A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to the earth to protect the world from evil forces in a dystopian futuristic city.',
        genre: ['Action', 'Sci-Fi', 'Fantasy'],
        language: 'Hindi',
        duration: 181,
        releaseDate: new Date('2024-06-27'),
        posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
        cast: [
          { name: 'Prabhas', role: 'Bhairava' },
          { name: 'Amitabh Bachchan', role: 'Ashwatthama' },
          { name: 'Kamal Haasan', role: 'Supreme Yaskin' },
          { name: 'Deepika Padukone', role: 'SUM-80' },
        ],
        rating: 8.5,
        status: 'now_showing',
      },
      {
        title: 'Oppenheimer',
        description:
          'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        genre: ['Biography', 'Drama', 'History'],
        language: 'English',
        duration: 180,
        releaseDate: new Date('2024-07-21'),
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        cast: [
          { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer' },
          { name: 'Emily Blunt', role: 'Katherine Oppenheimer' },
          { name: 'Matt Damon', role: 'Leslie Groves' },
          { name: 'Robert Downey Jr.', role: 'Lewis Strauss' },
        ],
        rating: 8.9,
        status: 'now_showing',
      },
      {
        title: 'Spider-Man: Beyond The Multiverse',
        description:
          'Miles Morales embarks on a high-stakes adventure across alternate dimensions alongside Gwen Stacy and an elite squad of Spider-Heroes to protect the fabric of reality.',
        genre: ['Animation', 'Action', 'Adventure'],
        language: 'English',
        duration: 140,
        releaseDate: new Date('2026-12-15'),
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1400&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=shW9i6k8cB0',
        cast: [
          { name: 'Shameik Moore', role: 'Miles Morales' },
          { name: 'Hailee Steinfeld', role: 'Gwen Stacy' },
          { name: 'Oscar Isaac', role: 'Miguel O’Hara' },
        ],
        rating: 9.1,
        status: 'coming_soon',
      },
      {
        title: 'Avatar: Fire and Ash',
        description:
          'Jake Sully and Neytiri encounter a mysterious and aggressive new volcanic Na’vi tribe on Pandora, forcing them into their most intense conflict yet.',
        genre: ['Sci-Fi', 'Action', 'Fantasy'],
        language: 'English',
        duration: 190,
        releaseDate: new Date('2026-12-19'),
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        cast: [
          { name: 'Sam Worthington', role: 'Jake Sully' },
          { name: 'Zoe Saldana', role: 'Neytiri' },
          { name: 'Sigourney Weaver', role: 'Kiri' },
        ],
        rating: 8.7,
        status: 'coming_soon',
      },
    ];

    const createdMovies = await Movie.insertMany(moviesData);
    console.log(`[Seed] Seeded ${createdMovies.length} movies.`);

    console.log('[Seed] Creating theatres...');
    const theatresData = [
      {
        name: 'PVR ICON: Infiniti Mall',
        location: 'Versova, Andheri West',
        address: 'Infiniti Mall, Link Road, Andheri West, Mumbai, Maharashtra 400053',
        city: 'Mumbai',
        seatingConfiguration: {
          totalScreens: 3,
          screens: [
            {
              screenNumber: 1,
              name: 'Audi 1 - IMAX with Laser',
              totalRows: 8,
              seatsPerRow: 10,
              categories: [
                { name: 'Classic', rows: ['A', 'B', 'C', 'D'], basePrice: 200 },
                { name: 'Prime', rows: ['E', 'F', 'G'], basePrice: 320 },
                { name: 'Recliner', rows: ['H'], basePrice: 500 },
              ],
            },
            {
              screenNumber: 2,
              name: 'Audi 2 - Dolby Atmos 4K',
              totalRows: 8,
              seatsPerRow: 10,
              categories: [
                { name: 'Classic', rows: ['A', 'B', 'C', 'D'], basePrice: 180 },
                { name: 'Prime', rows: ['E', 'F', 'G'], basePrice: 280 },
                { name: 'Recliner', rows: ['H'], basePrice: 450 },
              ],
            },
          ],
        },
        facilities: ['IMAX Laser', 'Dolby Atmos', 'Valet Parking', 'Gourmet Lounge', 'Wheelchair Friendly'],
        contactInfo: { phone: '+91 22 6677 8899', email: 'infiniti@pvr.cinemas' },
      },
      {
        name: 'INOX Megaplex: Inorbit Mall',
        location: 'Malad West',
        address: 'Inorbit Mall, Link Road, Malad West, Mumbai, Maharashtra 400064',
        city: 'Mumbai',
        seatingConfiguration: {
          totalScreens: 2,
          screens: [
            {
              screenNumber: 1,
              name: 'Audi 1 - ScreenX',
              totalRows: 8,
              seatsPerRow: 10,
              categories: [
                { name: 'Classic', rows: ['A', 'B', 'C', 'D'], basePrice: 190 },
                { name: 'Prime', rows: ['E', 'F', 'G'], basePrice: 300 },
                { name: 'Recliner', rows: ['H'], basePrice: 480 },
              ],
            },
          ],
        },
        facilities: ['ScreenX 270°', 'Dolby 7.1', 'Food Court', 'Free WiFi'],
        contactInfo: { phone: '+91 22 4000 1122', email: 'inorbit@inox.cinemas' },
      },
      {
        name: 'Cinepolis VIP: Forum Shantiniketan',
        location: 'Whitefield',
        address: 'Forum Shantiniketan Mall, ITPL Main Road, Whitefield, Bengaluru, Karnataka 560067',
        city: 'Bengaluru',
        seatingConfiguration: {
          totalScreens: 2,
          screens: [
            {
              screenNumber: 1,
              name: 'Audi 1 - VIP Luxury Recliner',
              totalRows: 7,
              seatsPerRow: 8,
              categories: [
                { name: 'Prime', rows: ['A', 'B', 'C', 'D'], basePrice: 350 },
                { name: 'Recliner', rows: ['E', 'F', 'G'], basePrice: 550 },
              ],
            },
          ],
        },
        facilities: ['Full Recliner', 'In-Seat Dining', 'Dolby Atmos', 'VIP Valet'],
        contactInfo: { phone: '+91 80 4455 6677', email: 'whitefield@cinepolis.com' },
      },
      {
        name: 'PVR Superplex: Logix City Center',
        location: 'Sector 32',
        address: 'Logix City Center, Sector 32, Noida, Uttar Pradesh 201301',
        city: 'Delhi NCR',
        seatingConfiguration: {
          totalScreens: 2,
          screens: [
            {
              screenNumber: 1,
              name: 'Audi 1 - IMAX 3D',
              totalRows: 8,
              seatsPerRow: 10,
              categories: [
                { name: 'Classic', rows: ['A', 'B', 'C', 'D'], basePrice: 210 },
                { name: 'Prime', rows: ['E', 'F', 'G'], basePrice: 340 },
                { name: 'Recliner', rows: ['H'], basePrice: 520 },
              ],
            },
          ],
        },
        facilities: ['IMAX 3D', '4DX Motion', 'Food Hall', 'Kids Zone'],
        contactInfo: { phone: '+91 120 4567 890', email: 'logix@pvr.cinemas' },
      },
    ];

    const createdTheatres = await Theatre.insertMany(theatresData);
    console.log(`[Seed] Seeded ${createdTheatres.length} theatres.`);

    console.log('[Seed] Generating shows and auditorium seats...');
    // Schedule shows for today and next 3 days
    const today = new Date();
    const dateStrings = [];
    for (let i = 0; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dateStrings.push(d.toISOString().split('T')[0]);
    }

    const showTimes = ['10:30 AM', '02:00 PM', '05:30 PM', '09:00 PM'];
    const nowShowingMovies = createdMovies.filter((m) => m.status === 'now_showing');

    const scheduledShows = [];

    // Schedule shows across theatres
    for (const theatre of createdTheatres) {
      for (let sIndex = 0; sIndex < nowShowingMovies.length; sIndex++) {
        const movie = nowShowingMovies[sIndex];
        const screenNum = (sIndex % (theatre.seatingConfiguration?.screens?.length || 1)) + 1;
        const timeSlot = showTimes[sIndex % showTimes.length];

        for (const dateStr of dateStrings) {
          const show = await Show.create({
            movieId: movie._id,
            theatreId: theatre._id,
            screenNumber: screenNum,
            showDate: dateStr,
            startTime: timeSlot,
            endTime: '03h 00m later',
            ticketPricing: {
              classic: 190,
              prime: 290,
              recliner: 480,
            },
            status: 'scheduled',
          });

          // Generate seats for this show!
          await generateSeatsForShow(show._id, theatre, screenNum, show.ticketPricing);
          scheduledShows.push(show);
        }
      }
    }

    console.log(`[Seed] Successfully scheduled ${scheduledShows.length} shows and populated seats.`);

    // Create a demo confirmed booking for the demo user on the first show
    if (scheduledShows.length > 0) {
      const firstShow = scheduledShows[0];
      const seatsToBook = await Seat.find({
        showId: firstShow._id,
        seatNumber: { $in: ['E4', 'E5'] },
      });

      if (seatsToBook.length === 2) {
        const bookingRef = 'IMV-7K9A2X';
        const totalAmount = seatsToBook.reduce((s, seat) => s + seat.price, 0);

        const demoBooking = await Booking.create({
          bookingReference: bookingRef,
          userId: demoUser._id,
          showId: firstShow._id,
          movieId: firstShow.movieId,
          theatreId: firstShow.theatreId,
          seats: seatsToBook.map((s) => ({
            seatNumber: s.seatNumber,
            row: s.row,
            col: s.col,
            category: s.category,
            price: s.price,
          })),
          totalAmount,
          bookingStatus: 'confirmed',
          paymentStatus: 'paid',
          paymentReference: 'TXN-DEMO87654321',
        });

        // Mark seats as booked
        await Seat.updateMany(
          { _id: { $in: seatsToBook.map((s) => s._id) } },
          { $set: { status: 'booked', bookingId: demoBooking._id } }
        );

        // Create Payment record
        await Payment.create({
          bookingId: demoBooking._id,
          userId: demoUser._id,
          amount: totalAmount,
          paymentMethodType: 'upi',
          transactionReference: 'TXN-DEMO87654321',
          status: 'success',
          upiId: 'neev@okaxis',
        });

        // Create welcome notification
        await Notification.create({
          userId: demoUser._id,
          type: 'booking_confirmed',
          title: 'Welcome to IMovies!',
          message: `Your booking #${bookingRef} for ${nowShowingMovies[0].title} is confirmed at seats E4, E5!`,
          relatedBooking: demoBooking._id,
        });

        console.log(`[Seed] Created sample booking ${bookingRef} for user@imovies.com`);
      }
    }

    console.log('\n=========================================');
    console.log(' DATABASE SEEDED SUCCESSFULLY! ');
    console.log('=========================================');
    console.log('Admin Account: admin@imovies.com / AdminPassword123');
    console.log('User Account:  user@imovies.com / UserPassword123');
    console.log('=========================================\n');

    if (shouldExit) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
    if (shouldExit) {
      await disconnectDB();
      process.exit(1);
    }
    throw error;
  }
};

const seedIfEmpty = async () => {
  try {
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[Seed] Database is empty. Auto-seeding initial movies, theatres and shows...');
      await seedDatabase(false);
    }
  } catch (error) {
    console.error('[Seed] Auto-seed check error:', error.message);
  }
};

if (require.main === module) {
  seedDatabase(true);
}

module.exports = { seedDatabase, seedIfEmpty };

