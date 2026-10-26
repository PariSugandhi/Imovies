import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, ShieldCheck, Video, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-top mt-5 py-5">
      <div className="container">
        <div className="row g-4">
          {/* Brand Info */}
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="brand-badge d-flex align-items-center gap-1">
                <Film size={18} />
                <span>IMOVIES</span>
              </span>
            </div>
            <p className="text-secondary small mb-3">
              Movie Ticket Booking Made Simple. A modern cinema booking platform featuring real-time seat availability, auditorium management, and seamless ticketing.
            </p>
            <div className="badge bg-light text-dark border p-2 small">
              College Full-Stack MERN Project
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-2">
            <h6 className="fw-bold mb-3 small text-uppercase text-secondary">Quick Links</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/movies" className="text-muted hover-danger">
                  Explore Movies
                </Link>
              </li>
              <li>
                <Link to="/theatres" className="text-muted hover-danger">
                  Discover Theatres
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-muted hover-danger">
                  Booking History
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-muted hover-danger">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Key Features */}
          <div className="col-6 col-md-3">
            <h6 className="fw-bold mb-3 small text-uppercase text-secondary">Architecture</h6>
            <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-0">
              <li className="d-flex align-items-center gap-2">
                <Video size={14} className="text-danger" />
                <span>Socket.IO Live Seat Sync</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <ShieldCheck size={14} className="text-success" />
                <span>Race-safe Atomic Booking</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Clock size={14} className="text-primary" />
                <span>2-Hour Cutoff Cancellation</span>
              </li>
            </ul>
          </div>

          {/* Viva / Demo Notes */}
          <div className="col-12 col-md-3">
            <h6 className="fw-bold mb-3 small text-uppercase text-secondary">Demo Credentials</h6>
            <div className="bg-light p-3 rounded-3 border small">
              <p className="mb-1">
                <strong>Admin:</strong> <code>admin@imovies.com</code>
              </p>
              <p className="mb-2">
                <strong>User:</strong> <code>user@imovies.com</code>
              </p>
              <p className="mb-0 text-muted" style={{ fontSize: '0.78rem' }}>
                Passwords: <code>AdminPassword123</code> / <code>UserPassword123</code>
              </p>
            </div>
          </div>
        </div>

        <div className="border-top mt-4 pt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small text-muted">
          <div>
            &copy; {new Date().getFullYear()} IMovies Cinema Management. All rights reserved.
          </div>
          <div className="d-flex align-items-center gap-1">
            Built with React, Redux Toolkit, Node.js, Express & MongoDB
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
