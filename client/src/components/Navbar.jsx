import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import api from '../api/axios';
import {
  Film,
  Search,
  Ticket,
  Bell,
  User,
  LogOut,
  ShieldAlert,
  MapPin,
  Menu,
  X,
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch notifications if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // Quiet fail for notifications
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // Ignored
    }
  };

  return (
    <header className="navbar-custom sticky-top">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          {/* Logo */}
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <span className="brand-badge d-flex align-items-center gap-1">
              <Film size={18} />
              <span>IMOVIES</span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="d-none d-md-flex align-items-center position-relative mx-3"
            style={{ maxWidth: '380px', width: '100%' }}
          >
            <Search
              size={16}
              className="position-absolute text-muted"
              style={{ left: '12px' }}
            />
            <input
              type="text"
              className="form-control form-control-sm ps-5 pe-3 py-2 border rounded-pill"
              placeholder="Search movies, genres, or actors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.88rem', backgroundColor: '#F8F9FA' }}
            />
          </form>

          {/* Navigation Links */}
          <nav className="d-none d-lg-flex align-items-center gap-4">
            <Link
              to="/movies"
              className={`fw-semibold ${
                location.pathname === '/movies' ? 'text-danger' : 'text-dark'
              }`}
            >
              Movies
            </Link>
            <Link
              to="/theatres"
              className={`fw-semibold ${
                location.pathname === '/theatres' ? 'text-danger' : 'text-dark'
              }`}
            >
              Theatres
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`fw-semibold d-flex align-items-center gap-1 ${
                  location.pathname === '/my-bookings' ? 'text-danger' : 'text-dark'
                }`}
              >
                <Ticket size={16} />
                <span>My Bookings</span>
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="badge bg-dark text-white px-2 py-1 text-decoration-none d-flex align-items-center gap-1"
              >
                <ShieldAlert size={14} className="text-warning" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* User / Auth Actions */}
          <div className="d-flex align-items-center gap-3 position-relative">
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="position-relative">
                <button
                  className="btn btn-light btn-sm rounded-circle p-2 position-relative border"
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    if (!showNotifDropdown && unreadCount > 0) {
                      markAllRead();
                    }
                  }}
                  title="Notifications"
                >
                  <Bell size={18} className="text-secondary" />
                  {unreadCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifDropdown && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white rounded-3 shadow border p-2"
                    style={{ width: '300px', zIndex: 1050 }}
                  >
                    <div className="d-flex justify-content-between align-items-center px-2 py-1 border-bottom mb-2">
                      <span className="fw-bold small">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          className="btn btn-link btn-sm p-0 text-muted small text-decoration-none"
                          onClick={markAllRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-muted small text-center my-3">No notifications yet</p>
                    ) : (
                      <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                        {notifications.slice(0, 6).map((notif) => (
                          <div
                            key={notif._id}
                            className={`p-2 rounded mb-1 ${
                              notif.read ? 'bg-white' : 'bg-light'
                            }`}
                          >
                            <p className="fw-semibold mb-0" style={{ fontSize: '0.82rem' }}>
                              {notif.title}
                            </p>
                            <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                              {notif.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-1"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <User size={15} />
                  <span className="small fw-semibold">{user?.name?.split(' ')[0]}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border mt-2">
                  <li className="px-3 py-1 border-bottom mb-1">
                    <p className="mb-0 fw-bold small">{user?.name}</p>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {user?.email}
                    </span>
                  </li>
                  {user?.role === 'admin' && (
                    <li>
                      <Link className="dropdown-item small text-primary fw-semibold" to="/admin">
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link className="dropdown-item small" to="/my-bookings">
                      My Bookings
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider my-1" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item small text-danger d-flex align-items-center gap-1"
                      onClick={handleLogout}
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-sm btn-cinema rounded-pill px-3">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="btn btn-light btn-sm d-lg-none p-1 border"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu accordion */}
        {mobileMenuOpen && (
          <div className="d-lg-none mt-3 pt-3 border-top">
            <form onSubmit={handleSearchSubmit} className="mb-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            <div className="d-flex flex-column gap-2 mb-2">
              <Link
                to="/movies"
                className="text-dark fw-semibold py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Movies
              </Link>
              <Link
                to="/theatres"
                className="text-dark fw-semibold py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Theatres
              </Link>
              {isAuthenticated && (
                <Link
                  to="/my-bookings"
                  className="text-dark fw-semibold py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-primary fw-semibold py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
