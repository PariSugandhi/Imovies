import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle2, Calendar, Clock, MapPin, Printer, Ticket, Home, QrCode } from 'lucide-react';

const BookingSuccessPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    if (!booking) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/${bookingId}`);
      if (res.data.success) {
        setBooking(res.data.booking);
      }
    } catch (err) {
      console.error('Failed to load booking details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generating your cinema voucher..." />;
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4>Booking details unavailable</h4>
        <Link to="/my-bookings" className="btn btn-cinema btn-sm mt-3">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container py-5" style={{ maxWidth: '680px' }}>
      {/* Top Banner */}
      <div className="text-center mb-4">
        <CheckCircle2 size={54} className="text-success mb-2" />
        <h2 className="fw-bold mb-1">Booking Confirmed!</h2>
        <p className="text-muted small">
          Your e-ticket has been generated. Show this reference at the cinema entrance.
        </p>
      </div>

      {/* Cinema Ticket Voucher */}
      <div className="ticket-voucher mb-4">
        <div className="ticket-notch-left"></div>
        <div className="ticket-notch-right"></div>

        <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
          <div>
            <span className="badge bg-danger mb-1">IMOVIES PASS</span>
            <h4 className="fw-bold text-dark mb-0">{booking.movieId?.title}</h4>
            <span className="text-muted small">{booking.theatreId?.name}</span>
          </div>
          <div className="text-end">
            <span className="text-muted small d-block">Booking Reference</span>
            <span className="fw-bold fs-5 text-danger letter-spacing-1">
              {booking.bookingReference}
            </span>
          </div>
        </div>

        {/* Showtime details grid */}
        <div className="row g-3 py-2 border-bottom mb-3">
          <div className="col-6 col-sm-3">
            <span className="text-muted small d-block">Date</span>
            <span className="fw-bold small">{booking.showId?.showDate}</span>
          </div>
          <div className="col-6 col-sm-3">
            <span className="text-muted small d-block">Time</span>
            <span className="fw-bold small text-danger">{booking.showId?.startTime}</span>
          </div>
          <div className="col-6 col-sm-3">
            <span className="text-muted small d-block">Screen</span>
            <span className="fw-bold small">Audi {booking.showId?.screenNumber || 1}</span>
          </div>
          <div className="col-6 col-sm-3">
            <span className="text-muted small d-block">Total Paid</span>
            <span className="fw-bold small">₹{booking.totalAmount}</span>
          </div>
        </div>

        {/* Booked Seats */}
        <div className="mb-4">
          <span className="text-muted small d-block mb-1">Confirmed Seats:</span>
          <div className="d-flex flex-wrap gap-2">
            {booking.seats?.map((seat) => (
              <span
                key={seat.seatNumber}
                className="badge bg-light text-dark border px-3 py-2 fs-6"
              >
                {seat.seatNumber} ({seat.category})
              </span>
            ))}
          </div>
        </div>

        {/* QR Code and Address Footer */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center pt-3 border-top gap-3">
          <div className="text-muted small text-center text-sm-start">
            <div className="d-flex align-items-center gap-1 mb-1">
              <MapPin size={13} className="text-danger flex-shrink-0" />
              <span>{booking.theatreId?.address}</span>
            </div>
            <span>Payment Status: <strong>PAID (Simulated)</strong></span>
          </div>

          <div className="text-center">
            {/* Simulated QR Code Box */}
            <div
              className="bg-light p-2 border rounded d-inline-flex flex-column align-items-center"
              style={{ width: '80px', height: '80px', justifyContent: 'center' }}
            >
              <QrCode size={48} className="text-dark" />
            </div>
            <span className="d-block text-muted" style={{ fontSize: '0.65rem' }}>
              SCAN AT GATE
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-wrap justify-content-center gap-3">
        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
          onClick={handlePrint}
        >
          <Printer size={15} />
          <span>Print Ticket</span>
        </button>

        <Link
          to="/my-bookings"
          className="btn btn-sm btn-cinema d-flex align-items-center gap-2"
        >
          <Ticket size={15} />
          <span>View My Bookings</span>
        </Link>

        <Link
          to="/"
          className="btn btn-sm btn-light border d-flex align-items-center gap-2"
        >
          <Home size={15} />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
