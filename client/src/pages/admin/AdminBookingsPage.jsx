import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { Ticket, Search, Filter, Eye, X } from 'lucide-react';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter !== 'all'
          ? `/admin/bookings?status=${statusFilter}`
          : '/admin/bookings';
      const res = await api.get(url);
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.bookingReference.toLowerCase().includes(term) ||
      b.userId?.name?.toLowerCase().includes(term) ||
      b.movieId?.title?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1">Customer Bookings & Ticketing</h3>
          <p className="text-muted small mb-0">Audit confirmed and refunded customer reservations</p>
        </div>

        <div className="d-flex gap-2">
          {/* Status filter */}
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-3 border mb-4">
        <div className="input-group input-group-sm" style={{ maxWidth: '380px' }}>
          <span className="input-group-text bg-white">
            <Search size={14} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search booking ref, customer, or movie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Auditing cinema bookings..." />
      ) : (
        <div className="bg-white rounded-3 border overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Movie & Theatre</th>
                  <th>Showtime</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold text-danger">{b.bookingReference}</td>
                    <td>
                      <div>{b.userId?.name}</div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {b.userId?.email}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-truncate" style={{ maxWidth: '160px' }}>
                        {b.movieId?.title}
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {b.theatreId?.name}
                      </span>
                    </td>
                    <td>
                      <div>{b.showId?.showDate}</div>
                      <span className="text-muted">{b.showId?.startTime}</span>
                    </td>
                    <td>
                      {b.seats?.map((s) => s.seatNumber).join(', ')}
                    </td>
                    <td className="fw-bold">₹{b.totalAmount}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.bookingStatus === 'confirmed'
                            ? 'bg-success-subtle text-success'
                            : 'bg-danger-subtle text-danger'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-light border p-1"
                        onClick={() => setSelectedBooking(b)}
                        title="View Full Booking"
                      >
                        <Eye size={14} className="text-secondary" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  Booking #{selectedBooking.bookingReference}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedBooking(null)}></button>
              </div>

              <div className="modal-body">
                <div className="bg-light p-3 rounded-2 border mb-3">
                  <h6 className="fw-bold mb-1">{selectedBooking.movieId?.title}</h6>
                  <p className="text-muted small mb-0">{selectedBooking.theatreId?.name}</p>
                  <p className="text-muted small mb-0">
                    {selectedBooking.showId?.showDate} at {selectedBooking.showId?.startTime}
                  </p>
                </div>

                <div className="row g-2 small mb-3">
                  <div className="col-6">
                    <span className="text-muted d-block">Customer Name</span>
                    <strong>{selectedBooking.userId?.name}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Email</span>
                    <strong>{selectedBooking.userId?.email}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Payment Status</span>
                    <strong>{selectedBooking.paymentStatus?.toUpperCase()}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Transaction Ref</span>
                    <code>{selectedBooking.paymentReference || 'N/A'}</code>
                  </div>
                </div>

                <div className="border-top pt-2">
                  <span className="small text-muted d-block mb-1">Seats Reserved:</span>
                  <div className="d-flex flex-wrap gap-1">
                    {selectedBooking.seats?.map((s) => (
                      <span key={s.seatNumber} className="badge bg-light text-dark border">
                        {s.seatNumber} ({s.category} - ₹{s.price})
                      </span>
                    ))}
                  </div>
                </div>

                {selectedBooking.cancellationDetails?.cancelledAt && (
                  <div className="alert alert-warning py-2 mt-3 small mb-0">
                    <strong>Cancelled on:</strong>{' '}
                    {new Date(selectedBooking.cancellationDetails.cancelledAt).toLocaleString()}
                    <br />
                    <strong>Refund Ref:</strong>{' '}
                    {selectedBooking.cancellationDetails.refundReference}
                  </div>
                )}
              </div>

              <div className="modal-footer border-top">
                <button type="button" className="btn btn-sm btn-light border" onClick={() => setSelectedBooking(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
