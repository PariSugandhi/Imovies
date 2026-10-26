import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSeat, clearBookingSelection, setActiveShow } from '../redux/slices/bookingSlice';
import api from '../api/axios';
import socket from '../utils/socket';
import SeatMap from '../components/SeatMap';
import SeatLegend from '../components/SeatLegend';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { Film, Calendar, Clock, MapPin, ChevronLeft, ArrowRight, ShieldCheck } from 'lucide-react';

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { selectedSeats, seatDetails, activeShow, convenienceFeePerTicket } = useSelector(
    (state) => state.booking
  );

  const [show, setShow] = useState(activeShow);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowAndSeats();

    // Socket.io room join
    if (showId) {
      socket.emit('join_show_room', showId);

      // Listen for real-time seat availability updates
      socket.on('seats_updated', (data) => {
        if (data.showId === showId && data.seats) {
          setSeats((prevSeats) =>
            prevSeats.map((s) => {
              const updated = data.seats.find((us) => us.seatNumber === s.seatNumber);
              if (updated) {
                // If the user had currently selected a seat that just became booked or locked by someone else
                if (
                  updated.status === 'booked' &&
                  selectedSeats.includes(s.seatNumber)
                ) {
                  toast.warn(`Seat ${s.seatNumber} was just booked by another customer.`);
                  dispatch(toggleSeat(s)); // Deselect
                }
                return { ...s, status: updated.status };
              }
              return s;
            })
          );
        }
      });
    }

    return () => {
      if (showId) {
        socket.emit('leave_show_room', showId);
        socket.off('seats_updated');
      }
    };
  }, [showId]);

  const fetchShowAndSeats = async () => {
    try {
      setLoading(true);
      const [showRes, seatsRes] = await Promise.all([
        api.get(`/shows/${showId}`),
        api.get(`/shows/${showId}/seats`),
      ]);

      if (showRes.data.success) {
        setShow(showRes.data.show);
        dispatch(setActiveShow(showRes.data.show));
      }

      if (seatsRes.data.success) {
        setSeats(seatsRes.data.seats);
      }
    } catch (err) {
      console.error('Failed to load show or seats:', err);
      toast.error('Failed to load seat layout.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') return;

    if (!selectedSeats.includes(seat.seatNumber) && selectedSeats.length >= 8) {
      toast.info('Maximum 8 tickets allowed per booking.');
      return;
    }

    dispatch(toggleSeat(seat));
  };

  // Calculations
  const ticketSubtotal = seatDetails.reduce((sum, s) => sum + s.price, 0);
  const totalFees = selectedSeats.length * convenienceFeePerTicket;
  const grandTotal = ticketSubtotal + totalFees;

  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat to proceed.');
      return;
    }

    if (!isAuthenticated) {
      toast.info('Please log in or register to complete your booking.');
      navigate('/login', { state: { from: `/shows/${showId}/seats` } });
      return;
    }

    try {
      // Temporary hold attempt
      await api.post(`/shows/${showId}/hold`, { seatNumbers: selectedSeats });
      navigate('/checkout');
    } catch (err) {
      toast.error(err.response?.data?.message || 'One or more selected seats are no longer available.');
      fetchShowAndSeats(); // Refresh seats
    }
  };

  if (loading) {
    return <LoadingSpinner message="Configuring cinema screen and loading live seat states..." />;
  }

  if (!show) {
    return (
      <div className="container py-5 text-center">
        <h4>Showtime Not Found</h4>
        <Link to="/movies" className="btn btn-cinema btn-sm mt-3">
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Top Header / Breadcrumb */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center bg-white p-3 rounded-3 border mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light btn-sm border d-flex align-items-center gap-1"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <h5 className="fw-bold mb-0">{show.movieId?.title}</h5>
            <div className="d-flex flex-wrap align-items-center gap-2 text-muted small mt-1">
              <span>{show.theatreId?.name}</span>
              <span>•</span>
              <span>Screen {show.screenNumber}</span>
              <span>•</span>
              <span className="text-danger fw-semibold">{show.startTime}</span>
              <span>•</span>
              <span>{new Date(show.showDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success-subtle text-success border border-success-subtle d-flex align-items-center gap-1">
            <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }}></span>
            <span>Real-time Live Sync</span>
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Seat Map Area */}
        <div className="col-12 col-lg-8">
          <SeatLegend />
          <SeatMap
            seats={seats}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
          />
        </div>

        {/* Right Sidebar: Booking Summary */}
        <div className="col-12 col-lg-4">
          <div className="bg-white p-4 rounded-3 border sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold mb-3">Booking Summary</h5>

            <div className="mb-3 pb-3 border-bottom">
              <h6 className="fw-bold text-dark mb-1">{show.movieId?.title}</h6>
              <p className="text-muted small mb-0">
                {show.theatreId?.name} • Screen {show.screenNumber}
              </p>
              <p className="text-muted small mb-0">
                {show.showDate} at {show.startTime}
              </p>
            </div>

            {/* Selected Seats List */}
            <div className="mb-3 pb-3 border-bottom">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted">Selected Seats:</span>
                {selectedSeats.length > 0 && (
                  <button
                    className="btn btn-link btn-sm text-danger p-0 small text-decoration-none"
                    onClick={() => dispatch(clearBookingSelection())}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {selectedSeats.length === 0 ? (
                <p className="text-muted small fst-italic mb-0">
                  Click on any available seat to make your selection (max 8 seats).
                </p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {seatDetails.map((seat) => (
                    <span
                      key={seat.seatNumber}
                      className="badge bg-light text-dark border px-2 py-1 d-flex align-items-center gap-1"
                    >
                      <strong className="text-danger">{seat.seatNumber}</strong>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                        ₹{seat.price}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="mb-4">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Tickets Subtotal:</span>
                <span>₹{ticketSubtotal}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Convenience Fees (₹25/ticket):</span>
                <span>₹{totalFees}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-5 pt-2 border-top text-dark">
                <span>Grand Total:</span>
                <span className="text-danger">₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              className="btn btn-cinema w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={selectedSeats.length === 0}
              onClick={handleProceedToCheckout}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="mt-3 text-center text-muted small" style={{ fontSize: '0.75rem' }}>
              <ShieldCheck size={14} className="text-success me-1" />
              Seats are temporarily held for 5 minutes during payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
