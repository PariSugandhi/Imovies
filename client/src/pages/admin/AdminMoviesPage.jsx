import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { Film, Plus, Edit, Trash2, Search, X, Upload } from 'lucide-react';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('English');
  const [duration, setDuration] = useState('120');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [posterUrl, setPosterUrl] = useState('');
  const [posterFile, setPosterFile] = useState(null);
  const [rating, setRating] = useState('8.0');
  const [status, setStatus] = useState('now_showing');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/movies?limit=50&status=all');
      if (res.data.success) {
        setMovies(res.data.movies);
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
      toast.error('Failed to load movies.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setTitle('');
    setDescription('');
    setGenre('Action, Sci-Fi');
    setLanguage('English');
    setDuration('120');
    setReleaseDate(new Date().toISOString().split('T')[0]);
    setPosterUrl('https://images.unsplash.com/photo-1534447677768-be436bb09401');
    setPosterFile(null);
    setRating('8.0');
    setStatus('now_showing');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setDescription(movie.description);
    setGenre(movie.genre?.join(', ') || '');
    setLanguage(movie.language);
    setDuration(movie.duration?.toString() || '120');
    setReleaseDate(new Date(movie.releaseDate).toISOString().split('T')[0]);
    setPosterUrl(movie.posterUrl);
    setPosterFile(null);
    setRating(movie.rating?.toString() || '8.0');
    setStatus(movie.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.warning('Please provide title and description.');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('genre', genre);
      formData.append('language', language);
      formData.append('duration', duration);
      formData.append('releaseDate', releaseDate);
      formData.append('rating', rating);
      formData.append('status', status);

      if (posterFile) {
        formData.append('poster', posterFile);
      } else {
        formData.append('posterUrl', posterUrl);
      }

      if (editingMovie) {
        await api.put(`/movies/${editingMovie._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Movie updated successfully.');
      } else {
        await api.post('/movies', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('New movie created successfully.');
      }

      setIsModalOpen(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save movie.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await api.delete(`/movies/${id}`);
      if (res.data.success) {
        toast.success('Movie deleted successfully.');
        fetchMovies();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete movie.');
    }
  };

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1">Movie Management</h3>
          <p className="text-muted small mb-0">Create, edit, or archive movies and poster art</p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-cinema d-flex align-items-center gap-1" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add New Movie</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-3 border mb-4">
        <div className="input-group input-group-sm" style={{ maxWidth: '350px' }}>
          <span className="input-group-text bg-white">
            <Search size={14} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search movie by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading movie library..." />
      ) : (
        <div className="bg-white rounded-3 border overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '60px' }}>Poster</th>
                  <th>Title</th>
                  <th>Genre & Language</th>
                  <th>Duration</th>
                  <th>Release Date</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((movie) => (
                  <tr key={movie._id}>
                    <td>
                      <img
                        src={
                          movie.posterUrl?.startsWith('/uploads')
                            ? `http://localhost:5001${movie.posterUrl}`
                            : movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401'
                      }
                        alt={movie.title}
                        className="rounded border"
                        style={{ width: '36px', height: '48px', objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-bold">{movie.title}</td>
                    <td>
                      <div>{movie.genre?.join(', ')}</div>
                      <span className="text-muted">{movie.language}</span>
                    </td>
                    <td>{movie.duration} mins</td>
                    <td>{new Date(movie.releaseDate).toLocaleDateString()}</td>
                    <td>★ {movie.rating}</td>
                    <td>
                      <span
                        className={`badge ${
                          movie.status === 'now_showing'
                            ? 'bg-success-subtle text-success'
                            : movie.status === 'coming_soon'
                            ? 'bg-primary-subtle text-primary'
                            : 'bg-secondary'
                        }`}
                      >
                        {movie.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-light border p-1"
                          onClick={() => handleOpenEdit(movie)}
                          title="Edit Movie"
                        >
                          <Edit size={14} className="text-primary" />
                        </button>
                        <button
                          className="btn btn-sm btn-light border p-1"
                          onClick={() => handleDelete(movie._id, movie.title)}
                          title="Delete Movie"
                        >
                          <Trash2 size={14} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold">
                    {editingMovie ? 'Edit Movie Details' : 'Add New Movie Title'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-secondary">Movie Title *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="now_showing">Now Showing</option>
                        <option value="coming_soon">Coming Soon</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Description / Synopsis *</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <div className="col-6 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Genre (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                      />
                    </div>

                    <div className="col-6 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Language</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      />
                    </div>

                    <div className="col-6 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">Duration (minutes)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>

                    <div className="col-6 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Release Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                      />
                    </div>

                    <div className="col-6 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Rating (0 - 10)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="form-control form-control-sm"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                      />
                    </div>

                    {/* Poster URL or File Upload */}
                    <div className="col-12 col-md-7">
                      <label className="form-label small fw-semibold text-secondary">Poster Image URL</label>
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="https://..."
                        value={posterUrl}
                        onChange={(e) => setPosterUrl(e.target.value)}
                        disabled={!!posterFile}
                      />
                    </div>

                    <div className="col-12 col-md-5">
                      <label className="form-label small fw-semibold text-secondary">Or Upload Poster File</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control form-control-sm"
                        onChange={(e) => setPosterFile(e.target.files[0])}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-sm btn-light border" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-cinema" disabled={submitting}>
                    {submitting ? 'Saving...' : editingMovie ? 'Save Changes' : 'Create Movie'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMoviesPage;
