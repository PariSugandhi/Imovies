import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setActiveShow } from '../redux/slices/bookingSlice';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { Star, Clock, Calendar, MapPin, Play, User, Film, ChevronRight } from 'lucide-react';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  // Available dates for showtimes
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/movies/${id}`);
      if (res.data.success) {
        setMovie(res.data.movie);
        setShows(res.data.shows || []);

        // Extract unique dates from shows
        const uniqueDates = Array.from(
          new Set((res.data.shows || []).map((s) => s.showDate))
        ).sort();

        setAvailableDates(uniqueDates);
        if (uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]);
        } else {
          setSelectedDate(new Date().toISOString().split('T')[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShowtime = (show) => {
    dispatch(
      setActiveShow({
        ...show,
        movie,
      })
    );
    navigate(`/shows/${show._id}/seats`);
  };

  // Group shows on the selected date by theatre
  const showsOnSelectedDate = shows.filter((s) => s.showDate === selectedDate);
  const showsByTheatre = {};
  showsOnSelectedDate.forEach((s) => {
    const theatreId = s.theatreId?._id || 'unknown';
    if (!showsByTheatre[theatreId]) {
      showsByTheatre[theatreId] = {
        theatre: s.theatreId,
        shows: [],
      };
    }
    showsByTheatre[theatreId].shows.push(s);
  });

  if (loading) {
    return <LoadingSpinner message="Loading movie details and cinema showtimes..." />;
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <h4>Movie Not Found</h4>
        <Link to="/movies" className="btn btn-sm btn-cinema mt-3">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { day, dayNum, month };
  };

  return (
    <div>
      {/* Backdrop Hero Header */}
      <div
        className="position-relative text-white py-5"
        style={{
          background: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url(${
            movie.backdropUrl || movie.posterUrl
          }) center/cover no-repeat`,
        }}
      >
        <div className="container">
          <div className="row g-4 align-items-center">
            {/* Poster Card */}
            <div className="col-12 col-md-4 col-lg-3 text-center text-md-start">
              <img
                src={
                  movie.posterUrl?.startsWith('/uploads')
                    ? `http://localhost:5001${movie.posterUrl}`
                    : movie.posterUrl
                }
                alt={movie.title}
                className="img-fluid rounded-3 shadow-lg border border-secondary"
                style={{ maxHeight: '380px', objectFit: 'cover' }}
              />
            </div>

            {/* Movie Info */}
            <div className="col-12 col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger text-uppercase px-2 py-1">
                  {movie.status === 'coming_soon' ? 'Coming Soon' : 'Now Showing'}
                </span>
                <span className="badge bg-light text-dark">{movie.language}</span>
                {movie.rating && (
                  <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                    <Star size={12} fill="#000" />
                    <strong>{movie.rating.toFixed(1)}/10</strong>
                  </span>
                )}
              </div>

              <h1 className="display-6 fw-bold mb-2">{movie.title}</h1>

              <div className="d-flex align-items-center gap-3 text-light small mb-3">
                <span className="d-flex align-items-center gap-1">
                  <Clock size={14} />
                  {formatDuration(movie.duration)}
                </span>
                <span>•</span>
                <span className="d-flex align-items-center gap-1">
                  <Calendar size={14} />
                  {new Date(movie.releaseDate).toLocaleDateString()}
                </span>
              </div>

              <div className="d-flex flex-wrap gap-1 mb-4">
                {movie.genre?.map((g, idx) => (
                  <span key={idx} className="badge bg-secondary text-light fw-normal">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-light lead" style={{ fontSize: '0.98rem', maxWidth: '780px' }}>
                {movie.description}
              </p>

              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-light d-inline-flex align-items-center gap-2"
                >
                  <Play size={14} />
                  <span>Watch Trailer</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4">
          {/* Main Column: Showtimes & Theatres */}
          <div className="col-12 col-lg-8">
            <div className="bg-white p-4 rounded-3 border mb-4">
              <h4 className="fw-bold mb-3">Select Show Date & Time</h4>

              {/* Date Selector Tabs */}
              {availableDates.length === 0 ? (
                <p className="text-muted small">No scheduled showtimes available for this title right now.</p>
              ) : (
                <div className="d-flex gap-2 overflow-auto pb-2 mb-4 border-bottom">
                  {availableDates.map((dateStr) => {
                    const { day, dayNum, month } = formatDateDisplay(dateStr);
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        className={`btn btn-sm p-2 text-center rounded-3 border ${
                          isSelected ? 'btn-danger' : 'btn-light'
                        }`}
                        style={{ minWidth: '70px' }}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        <div className="small fw-bold text-uppercase">{day}</div>
                        <div className="fs-5 fw-bold">{dayNum}</div>
                        <div className="small text-muted">{month}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Theatres and Showtimes on Selected Date */}
              {Object.keys(showsByTheatre).length === 0 ? (
                <p className="text-muted small my-3">
                  No shows running on {selectedDate}. Please select another date.
                </p>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {Object.values(showsByTheatre).map(({ theatre, shows }) => (
                    <div key={theatre._id} className="border-bottom pb-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="fw-bold mb-1">{theatre.name}</h6>
                          <p className="text-muted small mb-0 d-flex align-items-center gap-1">
                            <MapPin size={13} className="text-danger" />
                            <span>
                              {theatre.location}, {theatre.city}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Amenities pills */}
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {theatre.facilities?.slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="badge bg-light text-muted border fw-normal"
                            style={{ fontSize: '0.68rem' }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>

                      {/* Showtimes row */}
                      <div className="d-flex flex-wrap gap-2">
                        {shows.map((show) => (
                          <button
                            key={show._id}
                            className="showtime-pill border text-start"
                            onClick={() => handleSelectShowtime(show)}
                          >
                            <span className="fw-bold d-block">{show.startTime}</span>
                            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                              Screen {show.screenNumber} • From ₹{show.ticketPricing?.classic || 180}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Cast & Movie Info */}
          <div className="col-12 col-lg-4">
            <div className="bg-white p-4 rounded-3 border mb-4">
              <h5 className="fw-bold mb-3">Cast & Crew</h5>
              {movie.cast && movie.cast.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {movie.cast.map((actor, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-muted"
                        style={{ width: '42px', height: '42px', flexShrink: 0 }}
                      >
                        <User size={20} />
                      </div>
                      <div>
                        <p className="fw-bold mb-0 small">{actor.name}</p>
                        <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {actor.role || 'Actor'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted small">Cast information not listed.</p>
              )}
            </div>

            {/* Cinema Assurance */}
            <div className="bg-light p-3 rounded-3 border small">
              <h6 className="fw-bold mb-1">Instant Digital Ticket</h6>
              <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                Confirmed tickets with QR code are delivered immediately to your booking history and email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
