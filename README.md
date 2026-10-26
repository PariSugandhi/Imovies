# IMovies — Movie Ticket Booking & Cinema Management System

> **MERN Stack Cinema Ticketing & Theatre Operations Platform**  
> Built for College Full-Stack Web Development Practical Examination and Viva.

---

## 1. Project Overview

**IMovies** is a full-stack cinema ticket booking and management system. It provides customers with a responsive cinema-going experience (browsing movies, filtering showtimes, interactive seat selection, simulated payment, instant QR-code tickets, booking history, and cancellation) while giving cinema administrators control over movies, theatres, screenings, seat inventory, and revenue analytics.

### Key Highlights
- **Real-Time Seat Availability**: Powered by Socket.IO rooms per show (`show_<showId>`), preventing stale views and syncing across connected clients instantly.
- **Race-Safe Atomic Booking**: Database-level concurrency protection preventing double-booking of the same seat under concurrent requests.
- **Auditorium Seat Generation**: Automatic generation of tiered auditorium seating layouts (Classic, Prime, Recliner) whenever an administrator schedules a new screening.
- **Simulated Payment Gateway**: Complete test checkout with both successful payment and gateway-failure recovery paths for seamless viva demonstrations.
- **Eligible Cancellation with Cutoff**: Self-service user cancellations permitted up to 2 hours before showtime with automated seat release and refund simulation.
- **Embedded Database Fallback**: Built-in `mongodb-memory-server` fallback ensuring zero-setup execution if a local MongoDB daemon is not running.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19 / Vite, React Router DOM v7, Redux Toolkit, React Redux, Axios, Bootstrap 5, React Toastify, Socket.IO Client, Lucide React Icons |
| **Backend** | Node.js, Express.js, MongoDB / Mongoose, Socket.IO, Multer (file uploads), bcryptjs, jsonwebtoken (JWT), Helmet, express-rate-limit, cors, dotenv |
| **Testing** | Jest, Supertest, mongodb-memory-server |
| **Styling** | Custom Clean Cinema Design System (Off-white `#F8F9FA`, Charcoal `#1A1D20`, Cinema-Red `#E50914`, Google Fonts *Outfit* & *Inter*) |

---

## 3. Demo Credentials

For convenience during evaluative viva demonstrations, quick-fill buttons are provided on the Login page:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Cinema Admin** | `admin@imovies.com` | `AdminPassword123` | Full access to Admin Operations, Analytics, Movie CRUD, Theatre CRUD, Show Scheduling, Bookings Audit |
| **Customer User** | `user@imovies.com` | `UserPassword123` | Movie browsing, seat selection, checkout, ticket voucher, booking history, self-service cancellation |

---

## 4. Folder Structure

```
/Users/neev/Imovies/
├── client/                              # React + Vite Frontend
│   ├── index.html                       # HTML5, Google Fonts, Bootstrap CDN, meta tags
│   ├── package.json                     # Frontend dependencies & scripts
│   ├── vite.config.js                   # Vite configuration
│   └── src/
│       ├── main.jsx                     # Application root with Redux Provider
│       ├── App.jsx                      # Router & Route declarations (Public & Protected)
│       ├── index.css                    # Cinema design tokens & custom seat map styling
│       ├── api/
│       │   └── axios.js                 # Centralized Axios client with JWT interceptors
│       ├── components/
│       │   ├── Navbar.jsx               # Brand, search, notifications, auth profile menu
│       │   ├── Footer.jsx               # Architecture details, quick links & viva notes
│       │   ├── MovieCard.jsx            # Poster, rating, genres, duration, booking CTA
│       │   ├── ProtectedRoute.jsx       # Route guard for authenticated & admin users
│       │   ├── LoadingSpinner.jsx       # Cinema red loader
│       │   ├── EmptyState.jsx           # Clean zero-data placeholder
│       │   ├── SeatMap.jsx              # Curved cinema screen & categorized seat grid
│       │   └── SeatLegend.jsx           # Available, Selected, Booked, On Hold legend
│       ├── pages/
│       │   ├── HomePage.jsx             # Hero banner, now showing, coming soon, theatres
│       │   ├── MoviesPage.jsx           # Server-side search, genre/lang filters, pagination
│       │   ├── MovieDetailPage.jsx      # Backdrop, synopsis, cast, dates & showtime picker
│       │   ├── TheatresPage.jsx         # Multiplexes by city with facility badges
│       │   ├── SeatSelectionPage.jsx    # Real-time interactive seat booking (Socket.IO)
│       │   ├── CheckoutPage.jsx         # Demo payment interface & failure simulation
│       │   ├── BookingSuccessPage.jsx   # Cinema pass voucher with QR code & print
│       │   ├── BookingHistoryPage.jsx   # Upcoming/past tickets & 2-hr cutoff cancel modal
│       │   ├── LoginPage.jsx            # Sign in with quick-fill demo buttons
│       │   ├── RegisterPage.jsx         # Customer registration with validation
│       │   ├── NotFoundPage.jsx         # 404 screen
│       │   └── admin/
│       │       ├── AdminDashboardPage.jsx  # Operations metrics, revenue & top movies
│       │       ├── AdminMoviesPage.jsx     # Movie catalog management with Multer upload
│       │       ├── AdminTheatresPage.jsx   # Multiplex & screen layout management
│       │       ├── AdminShowsPage.jsx      # Conflict-safe screening schedule & seat generation
│       │       └── AdminBookingsPage.jsx   # Customer reservations audit & transaction ref
│       ├── redux/
│       │   ├── store.js                 # Redux store configuration
│       │   └── slices/
│       │       ├── authSlice.js         # User state, JWT storage & async thunks
│       │       └── bookingSlice.js      # Selected seats, active show & price computation
│       └── utils/
│           └── socket.js                # Socket.IO client connection
│
├── server/                              # Express + Node.js Backend
│   ├── package.json                     # Backend dependencies & test scripts
│   ├── server.js                        # App entrypoint, HTTP + Socket.IO server on port 5001
│   ├── .env.example                     # Environment variables template
│   ├── .env                             # Local development configuration
│   ├── config/
│   │   ├── db.js                        # Mongoose connection with automatic in-memory fallback
│   │   └── socket.js                    # Socket.IO initialization & show room handling
│   ├── models/
│   │   ├── User.js                      # User model with bcrypt password hashing
│   │   ├── Movie.js                     # Movie model with text search indexes
│   │   ├── Theatre.js                   # Theatre & screen layout schema
│   │   ├── Show.js                      # Show model with collision prevention indexes
│   │   ├── Seat.js                      # Show-specific seat availability model
│   │   ├── Booking.js                   # Booking reference, seats summary & cancellation details
│   │   ├── Payment.js                   # Simulated payment records & transaction refs
│   │   └── Notification.js              # In-app alerts for bookings and cancellations
│   ├── controllers/
│   │   ├── authController.js            # Registration, login, getMe
│   │   ├── movieController.js           # Filtering, pagination, CRUD, upload
│   │   ├── theatreController.js         # Theatres CRUD & show discovery
│   │   ├── showController.js            # Conflict checking & seat generation
│   │   ├── seatController.js            # Real-time seat availability & temporary holds
│   │   ├── bookingController.js         # Race-safe atomic booking & cutoff cancellation
│   │   ├── paymentController.js         # Simulated gateway outcomes & rollback
│   │   ├── notificationController.js    # In-app alerts
│   │   └── adminController.js           # Analytics, revenue aggregation & top movies
│   ├── routes/                          # Express modular route definitions
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT verification & role authorization
│   │   ├── rateLimiter.js               # express-rate-limit protection
│   │   ├── uploadMiddleware.js          # Multer poster image upload & validation
│   │   └── errorHandler.js              # Centralized JSON error response handler
│   ├── services/
│   │   ├── bookingService.js            # Atomic seat locking & cancellation cutoff rules
│   │   ├── seatService.js               # Seat generation & lock release routines
│   │   └── socketService.js             # Real-time seat broadcast service
│   ├── scripts/
│   │   └── seed.js                      # Database seeding script & auto-seed on startup
│   ├── tests/
│   │   └── api.test.js                  # Jest/Supertest suite (13 passing tests)
│   └── uploads/                         # Uploaded movie posters
│
├── package.json                         # Root package for running client & server concurrently
└── README.md                            # Comprehensive project guide & viva notes
```

---

## 5. Environment Configuration

### Backend Configuration (`server/.env`)
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=imovies_super_secret_jwt_key_2026_cinema_booking_app
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(Note: Port 5001 is used by default to prevent conflicts with macOS AirPlay Receiver on port 5000).*

---

## 6. Installation & Running Locally

### Step 1: Install Dependencies
```bash
# In the project root:
npm run install:all
```

### Step 2: Seed the Database
```bash
npm run seed
```
*(Note: If local MongoDB is not running, the system automatically uses an in-memory embedded MongoDB instance and auto-seeds on first launch).*

### Step 3: Run Development Server
```bash
npm run dev
```
- **Backend API**: `http://localhost:5001`
- **Frontend App**: `http://localhost:5173`

### Step 4: Run Automated Tests
```bash
npm test
```
Executes Jest & Supertest integration tests covering authentication, role-based protection, catalog filters, seat generation, race-safe booking, and cancellation rules.

---

## 7. REST API Reference

### Authentication
- `POST /api/auth/register` — Register customer account (enforces role `user`, hashes password).
- `POST /api/auth/login` — Login user or admin, returns signed JWT.
- `GET /api/auth/me` — Return current authenticated user profile.

### Movies Catalog
- `GET /api/movies` — List movies with query params: `search`, `genre`, `language`, `status`, `sort`, `page`, `limit`.
- `GET /api/movies/:id` — Single movie details and upcoming showtimes.
- `POST /api/movies` — *(Admin)* Create movie title (supports file upload via `poster` multipart field).
- `PUT /api/movies/:id` — *(Admin)* Update movie details or status.
- `DELETE /api/movies/:id` — *(Admin)* Safe deletion (verifies no active scheduled shows exist).

### Theatres
- `GET /api/theatres` — List active theatres with optional `city` or `search` filters.
- `GET /api/theatres/:id` — Theatre details and screening schedule.
- `POST /api/theatres` — *(Admin)* Create theatre with screen specifications.
- `PUT /api/theatres/:id` — *(Admin)* Update theatre details.
- `DELETE /api/theatres/:id` — *(Admin)* Safe deletion check.

### Shows & Seats
- `GET /api/shows` — Discovery by `movieId`, `theatreId`, `showDate`, `city`, `location`.
- `GET /api/shows/:id` — Show details with movie and theatre populated.
- `POST /api/shows` — *(Admin)* Schedule show with schedule collision prevention and automatic seat layout creation.
- `DELETE /api/shows/:id` — *(Admin)* Cancel / delete show and associated seats.
- `GET /api/shows/:id/seats` — Return all seats for a show (cleans up stale locks).
- `POST /api/shows/:id/hold` — Place 5-minute temporary hold on chosen seats.
- `POST /api/shows/:id/release` — Release held seats back to available.

### Bookings & Payments
- `POST /api/bookings` — Create and confirm booking with race-safe atomic seat check.
- `GET /api/bookings/my` — Get user's bookings with filter: `all`, `upcoming`, `past`, `cancelled`.
- `GET /api/bookings/:id` — Booking voucher details with ownership verification.
- `PATCH /api/bookings/:id/cancel` — Cancel eligible booking (enforces 2-hour cutoff rule, releases seats, refunds payment).
- `POST /api/payments/demo` — Simulate payment outcomes (`success` or `failure`).
- `GET /api/payments/:bookingId` — Retrieve transaction reference.

### Admin Operations
- `GET /api/admin/stats` — Operations metrics: Total Movies, Theatres, Shows, Bookings, Revenue, Recent Bookings, Top Movies.
- `GET /api/admin/bookings` — Audit all customer bookings with reference search and status filter.

### User Notifications
- `GET /api/notifications` — In-app alerts for confirmed and cancelled bookings.
- `PATCH /api/notifications/:id/read` — Mark notification read.
- `PATCH /api/notifications/read-all` — Mark all notifications read.

---

## 8. Viva Examination Preparation Guide

### Q1: How does IMovies prevent double-booking when two users click the same seat simultaneously?
> **Answer**:  
> Availability supplied by the browser is never trusted. In `bookingService.confirmBooking`, the server executes an atomic query:
> ```js
> const updateResult = await Seat.updateMany(
>   {
>     showId,
>     seatNumber: { $in: seatNumbers },
>     $or: [{ status: 'available' }, { status: 'locked', lockedBy: userId }]
>   },
>   { $set: { status: 'booked', bookingId: booking._id, lockedBy: null, lockedAt: null } }
> );
> ```
> If `updateResult.modifiedCount !== seatNumbers.length`, another user claimed one of the seats in that exact millisecond. The server immediately rolls back, aborts the booking, and returns `409 Conflict` with a clear message.

### Q2: How does real-time seat synchronization work with Socket.IO?
> **Answer**:  
> When a client navigates to `/shows/:showId/seats`, they emit `join_show_room(showId)`. The server joins the socket to a room named `show_<showId>`. Whenever seats are held, booked, or released through cancellation, `broadcastSeatUpdate(showId, updatedSeats, action)` emits `seats_updated` strictly to clients in that room. Clients update their local React state without needing to refresh.

### Q3: How are seats tracked and generated?
> **Answer**:  
> Seats are tracked **per show** (not globally per theatre) using a compound unique index `{ showId: 1, seatNumber: 1 }`. When an admin creates a show, `seatService.generateSeatsForShow` automatically reads the theatre screen configuration (total rows, seats per row, and category tiers: Classic, Prime, Recliner) and bulk-inserts all seats for that specific show.

### Q4: How is security and role-based access enforced?
> **Answer**:  
> - Passwords are salted and hashed with `bcryptjs`.
> - JWT tokens are verified using `authMiddleware.protect`.
> - `roleMiddleware.authorize('admin')` protects all administrative endpoints.
> - Normal users cannot self-assign `admin` during registration or profile updates.
> - `express-rate-limit` prevents brute-force attacks on `/api/auth/login` and `/api/auth/register`.
> - `helmet` sets secure HTTP headers.
> - Password hashes are excluded from API outputs via Mongoose `select: false` and `toJSON` transform.

---

## 9. Requirement-by-Requirement Checklist

- [x] **Frontend**: React.js with Vite, React Router DOM, Redux Toolkit, React Redux, Axios, Bootstrap 5, React Toastify, Socket.IO Client, Lucide React icons.
- [x] **Backend**: Node.js, Express.js, MongoDB with Mongoose, bcryptjs, jsonwebtoken, multer, socket.io, express-rate-limit, helmet.
- [x] **Design Direction**: Clean, minimal cinema interface (off-white, charcoal typography, restrained cinema-red accents, generous whitespace, high quality artwork).
- [x] **Home Page**: Hero banner, Now Showing, Coming Soon, Genre filter pills, Featured Theatres preview, Footer.
- [x] **Movie Listing & Search**: Server-side query parameters (`search`, `genre`, `language`, `status`, `sort`, `page`, `limit`), pagination, empty-state messaging.
- [x] **Movie Details**: Poster, backdrop, metadata, synopsis, cast cards, trailer link, date picker, theatre grouped showtimes.
- [x] **Authentication**: Register, login, role authorization (`user` vs `admin`), password hashing, token validation, duplicate email prevention.
- [x] **Seat Selection & Real-Time Sync**: Cinema screen curve, organized seating layout (Classic, Prime, Recliner), live status colors, price calculation, Socket.IO room per showId, atomic revalidation.
- [x] **Checkout & Demo Payment**: Simulated gateway (UPI, Card, Net Banking), "Simulate Success" and "Simulate Failure" outcomes, payment rollback, confirmation pass with QR code.
- [x] **Booking History & Cancellation**: Upcoming, past, and cancelled tabs, 2-hour cutoff rule enforcement, atomic seat release, simulated refund.
- [x] **Admin Dashboard**: Overview metrics (Movies, Theatres, Shows, Bookings, Revenue), Movie CRUD with Multer image upload, Theatre CRUD, Show scheduling with collision checks, Customer Bookings audit.
- [x] **Testing & Validation**: 13 automated integration tests with Jest, Supertest and MongoDB in-memory server. End-to-end browser subagent recording verified.
- [x] **Developer Experience**: Root `concurrently` dev scripts, `.env.example`, automated seed script with rich realistic demo data and accounts.
