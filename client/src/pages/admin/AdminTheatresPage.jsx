import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { Building, Plus, Edit, Trash2, MapPin, Search } from 'lucide-react';

const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [totalScreens, setTotalScreens] = useState('3');
  const [facilities, setFacilities] = useState('Dolby 7.1, Parking, Food Court, Wheelchair Access');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchTheatres();
  }, []);

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const res = await api.get('/theatres');
      if (res.data.success) {
        setTheatres(res.data.theatres);
      }
    } catch (err) {
      console.error('Failed to load theatres:', err);
      toast.error('Failed to load theatres.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTheatre(null);
    setName('');
    setLocation('');
    setAddress('');
    setCity('Mumbai');
    setTotalScreens('3');
    setFacilities('IMAX Laser, Dolby Atmos, Valet Parking, Food Court');
    setPhone('+91 22 1234 5678');
    setEmail('contact@theatre.com');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTheatre(t);
    setName(t.name);
    setLocation(t.location);
    setAddress(t.address);
    setCity(t.city);
    setTotalScreens(t.seatingConfiguration?.totalScreens?.toString() || '3');
    setFacilities(t.facilities?.join(', ') || '');
    setPhone(t.contactInfo?.phone || '');
    setEmail(t.contactInfo?.email || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !address.trim() || !city.trim()) {
      toast.warning('Please fill in name, location, address, and city.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        location: location.trim(),
        address: address.trim(),
        city: city.trim(),
        facilities: facilities.split(',').map((f) => f.trim()).filter(Boolean),
        contactInfo: { phone: phone.trim(), email: email.trim() },
        seatingConfiguration: {
          totalScreens: Number(totalScreens),
          screens: Array.from({ length: Number(totalScreens) }, (_, i) => ({
            screenNumber: i + 1,
            name: `Audi ${i + 1}`,
            totalRows: 8,
            seatsPerRow: 10,
          })),
        },
      };

      if (editingTheatre) {
        await api.put(`/theatres/${editingTheatre._id}`, payload);
        toast.success('Theatre updated successfully.');
      } else {
        await api.post('/theatres', payload);
        toast.success('Theatre added successfully.');
      }

      setIsModalOpen(false);
      fetchTheatres();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save theatre.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, theatreName) => {
    if (!window.confirm(`Are you sure you want to delete "${theatreName}"?`)) return;

    try {
      const res = await api.delete(`/theatres/${id}`);
      if (res.data.success) {
        toast.success('Theatre deleted successfully.');
        fetchTheatres();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete theatre.');
    }
  };

  const filtered = theatres.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1">Theatre Management</h3>
          <p className="text-muted small mb-0">Configure cinema complexes, screens and seating layouts</p>
        </div>

        <button className="btn btn-sm btn-cinema d-flex align-items-center gap-1" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add New Theatre</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-3 border mb-4">
        <div className="input-group input-group-sm" style={{ maxWidth: '350px' }}>
          <span className="input-group-text bg-white">
            <Search size={14} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search theatre or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading theatres..." />
      ) : (
        <div className="bg-white rounded-3 border overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Theatre Name</th>
                  <th>Location & City</th>
                  <th>Screens</th>
                  <th>Facilities</th>
                  <th>Contact</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((theatre) => (
                  <tr key={theatre._id}>
                    <td className="fw-bold">{theatre.name}</td>
                    <td>
                      <div>{theatre.location}</div>
                      <span className="text-muted">{theatre.city}</span>
                    </td>
                    <td>{theatre.seatingConfiguration?.totalScreens || 3} screens</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '280px' }}>
                        {theatre.facilities?.slice(0, 3).map((f, i) => (
                          <span key={i} className="badge bg-light text-muted border fw-normal" style={{ fontSize: '0.68rem' }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {theatre.contactInfo?.phone}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          className="btn btn-sm btn-light border p-1"
                          onClick={() => handleOpenEdit(theatre)}
                          title="Edit Theatre"
                        >
                          <Edit size={14} className="text-primary" />
                        </button>
                        <button
                          className="btn btn-sm btn-light border p-1"
                          onClick={() => handleDelete(theatre._id, theatre.name)}
                          title="Delete Theatre"
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

      {/* Add / Edit Theatre Modal */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold">
                    {editingTheatre ? 'Edit Theatre' : 'Add New Cinema Theatre'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold text-secondary">Theatre Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. PVR ICON: Grand Central"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-secondary">City *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Mumbai, Bengaluru"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Area / Location *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Andheri West, Whitefield"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Total Screens</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="form-control form-control-sm"
                        value={totalScreens}
                        onChange={(e) => setTotalScreens(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Full Street Address *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Mall Name, Street, Landmark, Pincode"
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">Facilities (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={facilities}
                        onChange={(e) => setFacilities(e.target.value)}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Phone Contact</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Email</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-sm btn-light border" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-cinema" disabled={submitting}>
                    {submitting ? 'Saving...' : editingTheatre ? 'Save Changes' : 'Create Theatre'}
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

export default AdminTheatresPage;
