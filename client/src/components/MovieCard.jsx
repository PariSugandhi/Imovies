import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

const MovieCard = ({ movie }) => {
  if (!movie) return null;

  const fallbackPoster =
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80';

  // Format duration in hours & minutes
  const formatDuration = (mins) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const posterSrc = movie.posterUrl?.startsWith('/uploads')
    ? `http://localhost:5001${movie.posterUrl}`
    : movie.posterUrl || fallbackPoster;

  return (
    <div className="movie-card">
      <div className="movie-poster-container">
        <img
          src={posterSrc}
          alt={movie.title}
          className="movie-poster-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackPoster;
          }}
          loading="lazy"
        />
        {movie.rating && (
          <div className="movie-rating-badge">
            <Star size={13} fill="#FFC107" color="#FFC107" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          <h6 className="fw-bold text-truncate mb-1" title={movie.title}>
            {movie.title}
          </h6>

          <div className="d-flex align-items-center gap-2 mb-2 text-muted small">
            <span>{movie.language}</span>
            <span>•</span>
            <span className="d-flex align-items-center gap-1">
              <Clock size={12} />
              {formatDuration(movie.duration)}
            </span>
          </div>

          <div className="d-flex flex-wrap gap-1 mb-3">
            {movie.genre?.slice(0, 2).map((g, idx) => (
              <span
                key={idx}
                className="badge bg-light text-secondary border fw-normal"
                style={{ fontSize: '0.72rem' }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        <Link
          to={`/movies/${movie._id}`}
          className="btn btn-sm btn-cinema w-100 text-center"
        >
          {movie.status === 'coming_soon' ? 'View Details' : 'Book Tickets'}
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;
