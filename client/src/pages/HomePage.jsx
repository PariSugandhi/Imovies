import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Film, Calendar, MapPin, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

const HomePage = () => {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');

  const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Animation'];

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [nowRes, soonRes, theatresRes] = await Promise.all([
        api.get('/movies?status=now_showing&limit=8'),
        api.get('/movies?status=coming_soon&limit=4'),
        api.get('/theatres'),
      ]);

      if (nowRes.data.success) setNowShowing(nowRes.data.movies);
      if (soonRes.data.success) setComingSoon(soonRes.data.movies);
      if (theatresRes.data.success) setTheatres(theatresRes.data.theatres);
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNowShowing =
    selectedGenre === 'All'
      ? nowShowing
      : nowShowing.filter((m) =>
          m.genre?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
        );

  if (loading) {
    return <LoadingSpinner message="Fetching cinema schedule and latest movies..." />;
  }

  return (
    <div className="container py-4">
      {/* Compact Cinematic Hero Section */}
      <div className="hero-banner shadow-sm">
        <div className="row align-items-center">
          <div className="col-12 col-lg-8">
            <span className="badge bg-danger mb-3 px-3 py-2 text-uppercase fw-bold letter-spacing-1">
              Now In Cinemas
            </span>
            <h1 className="display-5 fw-bold text-white mb-3">
              Cinema Booking, Engineered for Simplicity.
            </h1>
            <p className="lead text-light mb-4" style={{ maxWidth: '600px' }}>
              Select preferred auditoriums, choose seats with real-time availability, and get instant digital tickets.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/movies" className="btn btn-cinema px-4 py-2">
                Browse All Movies
              </Link>
              <Link to="/theatres" className="btn btn-outline-light px-4 py-2">
                Find Theatres Near You
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Genre Filters */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2 overflow-auto py-1">
          <span className="fw-bold small text-secondary me-2">Genre:</span>
          {genres.map((genre) => (
            <button
              key={genre}
              className={`filter-pill ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
        <Link to="/movies" className="text-danger fw-semibold small d-flex align-items-center gap-1">
          <span>View All Movies</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Now Showing Section */}
      <section className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 className="fw-bold mb-1">Now Showing</h3>
            <p className="text-muted small mb-0">Book tickets for shows playing this week</p>
          </div>
        </div>

        {filteredNowShowing.length === 0 ? (
          <div className="text-center py-4 text-muted bg-white border rounded">
            No movies available in this genre right now.
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {filteredNowShowing.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h3 className="fw-bold mb-1">Coming Soon</h3>
              <p className="text-muted small mb-0">Upcoming blockbuster releases</p>
            </div>
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {comingSoon.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Discover Theatres Section */}
      <section className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 className="fw-bold mb-1">Featured Theatres</h3>
            <p className="text-muted small mb-0">Experience world-class IMAX, Dolby Atmos & ScreenX projection</p>
          </div>
          <Link to="/theatres" className="text-danger fw-semibold small d-flex align-items-center gap-1">
            <span>All Theatres</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3">
          {theatres.slice(0, 4).map((theatre) => (
            <div key={theatre._id} className="col">
              <div className="bg-white p-3 rounded-3 border h-100 d-flex flex-column justify-content-between">
                <div>
                  <h6 className="fw-bold mb-1">{theatre.name}</h6>
                  <p className="text-muted small mb-2 d-flex align-items-center gap-1">
                    <MapPin size={13} className="text-danger flex-shrink-0" />
                    <span className="text-truncate">{theatre.location}, {theatre.city}</span>
                  </p>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {theatre.facilities?.slice(0, 2).map((fac, idx) => (
                      <span key={idx} className="badge bg-light text-dark border fw-normal" style={{ fontSize: '0.7rem' }}>
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
                <Link to={`/theatres?theatreId=${theatre._id}`} className="btn btn-sm btn-outline-secondary w-100">
                  View Showtimes
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
