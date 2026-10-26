import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeShow: null,
  selectedSeats: [], // Array of seatNumber strings: ['A1', 'A2']
  seatDetails: [],   // Array of seat objects with row, col, category, price
  convenienceFeePerTicket: 25,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setActiveShow: (state, action) => {
      state.activeShow = action.payload;
      // Reset seat selection if switching shows
      state.selectedSeats = [];
      state.seatDetails = [];
    },
    toggleSeat: (state, action) => {
      const seat = action.payload; // { seatNumber, row, col, category, price }
      const exists = state.selectedSeats.includes(seat.seatNumber);

      if (exists) {
        state.selectedSeats = state.selectedSeats.filter((num) => num !== seat.seatNumber);
        state.seatDetails = state.seatDetails.filter((s) => s.seatNumber !== seat.seatNumber);
      } else {
        // Max 10 seats per booking
        if (state.selectedSeats.length >= 10) {
          return;
        }
        state.selectedSeats.push(seat.seatNumber);
        state.seatDetails.push(seat);
      }
    },
    clearBookingSelection: (state) => {
      state.selectedSeats = [];
      state.seatDetails = [];
    },
    resetBookingState: (state) => {
      state.activeShow = null;
      state.selectedSeats = [];
      state.seatDetails = [];
    },
  },
});

export const {
  setActiveShow,
  toggleSeat,
  clearBookingSelection,
  resetBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;
