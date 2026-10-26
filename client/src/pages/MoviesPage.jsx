import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || 'All';
  const language = searchParams.get('language') || 'All';
  const status = searchParams.get('status') || 'now_showing';
  const sort = searchParams.get('sort') || '-releaseDate';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(search);

  const genresList = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Animation', 'Crime', 'Biography'];
  const languagesList = ['All', 'English', 'Hindi', 'Telugu', 'Tamil'];

  useEffect(() => {
    setSearchInput(search);
    fetchMovies();
  }, [searchParams]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genre && genre !== 'All') params.append('genre', genre);
      if (language && language !== 'All') params.append('language', language);
      if (status && status !== 'all') params.append('status', status);
      params.append('sort', sort);
      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/movies?${params.toString()}`);
      if (res.data.success) {
        setMovies(res.data.movies);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'All' && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // reset page on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({ status: 'now_showing' });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage.toString());
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Movie Catalog</h2>
          <p className="text-muted small mb-0">
            Showing {movies.length} of {total} titles currently cataloged
          </p>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '360px', width: '100%' }}>
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Search movie title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="btn btn-cinema" type="submit">
              <Search size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="bg-white p-3 rounded-3 border mb-4">
        <div className="row g-2 align-items-center">
          {/* Status Tab */}
          <div className="col-12 col-sm-6 col-md-3">
            <label className="form-label small text-muted mb-1">Show Category</label>
            <select
              className="form-select form-select-sm"
              value={status}
              onChange={(e) => updateParam('status', e.target.value)}
            >
              <option value="now_showing">Now Showing</option>
              <option value="coming_soon">Coming Soon</option>
              <option value="all">All Releases</option>
            </select>
          </div>

          {/* Genre */}
          <div className="col-6 col-sm-6 col-md-3">
            <label className="form-label small text-muted mb-1">Genre</label>
            <select
              className="form-select form-select-sm"
              value={genre}
              onChange={(e) => updateParam('genre', e.target.value)}
            >
              {genresList.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="col-6 col-sm-6 col-md-3">
            <label className="form-label small text-muted mb-1">Language</label>
            <select
              className="form-select form-select-sm"
              value={language}
              onChange={(e) => updateParam('language', e.target.value)}
            >
              {languagesList.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="col-12 col-sm-6 col-md-2">
            <label className="form-label small text-muted mb-1">Sort By</label>
            <select
              className="form-select form-select-sm"
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
            >
              <option value="-releaseDate">Newest First</option>
              <option value="-rating">Highest Rated</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="duration">Shortest Duration</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="col-12 col-sm-6 col-md-1 d-flex align-items-end">
            <button
              className="btn btn-sm btn-outline-secondary w-100"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <LoadingSpinner message="Searching catalog..." />
      ) : movies.length === 0 ? (
        <EmptyState
          title="No matching movies found"
          description="We couldn't find any movie matching your current filters. Try changing or clearing your search criteria."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-4">
            {movies.map((movie) => (
              <div key={movie._id} className="col">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <span className="small text-muted px-2">
                Page {page} of {totalPages}
              </span>

              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MoviesPage;
