import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setActiveShow } from '../redux/slices/bookingSlice';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { MapPin, Search, Phone, Mail, Film } from 'lucide-react';

const TheatresPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All');
  const [theatreSearch, setTheatreSearch] = useState('');

  const cities = ['All', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Hyderabad'];

  useEffect(() => {
    fetchTheatres();
  }, [selectedCity]);

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const url =
        selectedCity !== 'All'
          ? `/theatres?city=${encodeURIComponent(selectedCity)}`
          : '/theatres';
      const res = await api.get(url);
      if (res.data.success) {
        setTheatres(res.data.theatres);
      }
    } catch (err) {
      console.error('Failed to fetch theatres:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTheatres = theatres.filter((t) => {
    if (!theatreSearch.trim()) return true;
    const term = theatreSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) ||
      t.location.toLowerCase().includes(term) ||
      t.city.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Cinemas & Theatres</h2>
          <p className="text-muted small mb-0">
            Discover premium multiplexes with IMAX, Dolby Atmos and Luxury Recliners
          </p>
        </div>

        {/* Search input */}
        <div style={{ maxWidth: '320px', width: '100%' }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white">
              <Search size={14} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search theatre name or area..."
              value={theatreSearch}
              onChange={(e) => setTheatreSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* City Filters */}
      <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
        {cities.map((c) => (
          <button
            key={c}
            className={`filter-pill ${selectedCity === c ? 'active' : ''}`}
            onClick={() => setSelectedCity(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Locating theatres..." />
      ) : filteredTheatres.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No theatres found"
          description="We couldn't find any theatre matching your city or search term."
          actionText="Clear Search"
          onAction={() => {
            setSelectedCity('All');
            setTheatreSearch('');
          }}
        />
      ) : (
        <div className="row g-4">
          {filteredTheatres.map((theatre) => (
            <div key={theatre._id} className="col-12 col-md-6">
              <div className="bg-white p-4 rounded-3 border h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-1">{theatre.name}</h5>
                    <span className="badge bg-light text-dark border">
                      {theatre.city}
                    </span>
                  </div>

                  <p className="text-muted small mb-2 d-flex align-items-center gap-1">
                    <MapPin size={14} className="text-danger flex-shrink-0" />
                    <span>{theatre.address}</span>
                  </p>

                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {theatre.facilities?.map((f, i) => (
                      <span
                        key={i}
                        className="badge bg-light text-secondary border fw-normal"
                        style={{ fontSize: '0.72rem' }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {theatre.contactInfo && (
                    <div className="text-muted small d-flex flex-column gap-1 mb-3">
                      {theatre.contactInfo.phone && (
                        <div className="d-flex align-items-center gap-2">
                          <Phone size={12} />
                          <span>{theatre.contactInfo.phone}</span>
                        </div>
                      )}
                      {theatre.contactInfo.email && (
                        <div className="d-flex align-items-center gap-2">
                          <Mail size={12} />
                          <span>{theatre.contactInfo.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                  <span className="small text-muted">
                    {theatre.seatingConfiguration?.totalScreens || 3} Screens Available
                  </span>
                  <button
                    className="btn btn-sm btn-cinema-outline"
                    onClick={() => navigate('/movies')}
                  >
                    View Movie Schedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TheatresPage;
