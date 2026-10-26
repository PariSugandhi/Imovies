import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from './redux/slices/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import TheatresPage from './pages/TheatresPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Customer Pages
import CheckoutPage from './pages/CheckoutPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import BookingHistoryPage from './pages/BookingHistoryPage';

// Protected Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminTheatresPage from './pages/admin/AdminTheatresPage';
import AdminShowsPage from './pages/admin/AdminShowsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // If token exists in storage, verify and load user profile
    if (localStorage.getItem('imovies_token')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-main">
        <Navbar />

        <main className="flex-grow-1">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetailPage />} />
            <Route path="/theatres" element={<TheatresPage />} />
            <Route path="/shows/:showId/seats" element={<SeatSelectionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Customer routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-success/:bookingId"
              element={
                <ProtectedRoute>
                  <BookingSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <BookingHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/movies"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminMoviesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/theatres"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminTheatresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/shows"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminShowsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminBookingsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />

        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </Router>
  );
}

export default App;
