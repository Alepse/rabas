import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  pendingBookings: [],
  activeBookings: [],
  bookingHistory: [],
  chatMessages: [],
  walkInCustomers: [],
  walkInHistory: [],
  loading: false,
  error: null
};

// Fetch bookings thunk
export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/business-bookings', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      const transformed = {
        pendingBookings: [],
        activeBookings: [],
        bookingHistory: [],
        walkInCustomers: []
      };

      data.bookings.forEach(booking => {
        // Convert numeric status to character value
        const getStatusString = (status) => {
          switch(Number(status)) {
            case 0: return 'Pending';
            case 1: return 'Active';
            case 2: return 'Completed';
            default: return 'Pending';
          }
        };
        
        const formattedBooking = {
          // IDs
          id: booking.booking_id,
          userId: booking.user_id,
          businessId: booking.business_id,
          productId: booking.product_id,
          
          // Customer details
          customerName: booking.customerName,
          email: booking.email,
          phone: booking.phone,
          numberOfGuests: booking.numberOfGuests,
          
          // Product details
          productName: booking.productName,
          type: booking.type,
          
          // Dates
          dateIn: booking.dateIn,
          dateOut: booking.dateOut,
          
          // Additional details
          specialRequests: booking.specialRequests || '',
          
          // Pricing
          originalPrice: booking.originalPrice,
          discount: booking.discount,
          amount: booking.discountedPrice,
          
          // Status
          status: getStatusString(booking.status)
        };

        console.log('Formatting booking:', formattedBooking);

        if (formattedBooking.userId === 0) {
          transformed.walkInCustomers.push(formattedBooking);
        } else {
          // Existing sorting logic for regular bookings
          if (formattedBooking.status === 'Pending') {
            transformed.pendingBookings.push(formattedBooking);
          } else if (formattedBooking.status === 'Active') {
            transformed.activeBookings.push(formattedBooking);
          } else {
            transformed.bookingHistory.push(formattedBooking);
          }
        }
      });

      console.log('Transformed data:', transformed);
      return transformed;
    } catch (error) {
      console.error('Error in fetchBookings:', error);
      return rejectWithValue(error.message);
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    addPendingBooking: (state, action) => {
      state.pendingBookings.push(action.payload);
    },
    markBookingAsActive: (state, action) => {
      const bookingId = action.payload;
      const booking = state.pendingBookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = 'Active';
        state.activeBookings.push(booking);
        state.pendingBookings = state.pendingBookings.filter(b => b.id !== bookingId);
      }
    },
    markBookingAsCompleted: (state, action) => {
      const booking = state.activeBookings.find(b => b.id === action.payload);
      if (booking) {
        booking.status = 'Completed';  // Use string status
        state.bookingHistory.push(booking);
        state.activeBookings = state.activeBookings.filter(b => b.id !== action.payload);
      } else {
        console.error('Booking not found for completion:', action.payload);
      }
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    addWalkInCustomer: (state, action) => {
      state.walkInCustomers.push(action.payload);
    },
    updateWalkInCustomerStatus: (state, action) => {
      const { id, status } = action.payload;
      const customer = state.walkInCustomers.find(c => c.id === id);
      if (customer) {
        customer.status = status;
      }
    },
    markWalkInAsCompleted: (state, action) => {
      const customerId = action.payload;
      const customerIndex = state.walkInCustomers.findIndex(c => c.id === customerId);
      if (customerIndex !== -1) {
        const completedCustomer = state.walkInCustomers.splice(customerIndex, 1)[0];
        completedCustomer.status = 'Completed';
        state.walkInHistory.push(completedCustomer);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.pendingBookings = action.payload.pendingBookings;
        state.activeBookings = action.payload.activeBookings;
        state.bookingHistory = action.payload.bookingHistory;
        state.walkInCustomers = action.payload.walkInCustomers;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addChatMessage, markBookingAsCompleted, updateWalkInCustomerStatus, markWalkInAsCompleted, markBookingAsActive } = bookingsSlice.actions;

export default bookingsSlice.reducer;
