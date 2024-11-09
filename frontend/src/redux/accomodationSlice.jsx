import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch business products (accommodations)
export const fetchBusinessProducts = createAsyncThunk(
  'business/fetchAccommodations',
  async () => {
    try {
      const response = await axios.get('http://localhost:5000/getBusinessProduct', {
        params: { category: 'accommodation' }, // Set category as 'accommodation'
        withCredentials: true,
      });
      return response.data.businessProducts || []; // Return an empty array if no products
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Async thunk to add a new business product (accommodation)
export const addProduct = createAsyncThunk(
  'business/addProduct',
  async (formData, { dispatch }) => {
    const response = await axios.post('http://localhost:5000/add-product', formData, {
      withCredentials: true,
    });

    const product = response.data;
    if (!product || !product.product_id || !product.name) {
      throw new Error('Invalid accommodation data received from the server');
    }

    const accommodationData = {
      id: product.product_id,
      category: product.product_category,
      accommodationName: product.name,
      pricing: product.price,
      pricingUnit: product.pricing_unit,
      description: product.description,
      hasBooking: parseInt(product.booking_operation) === 1, // Convert to number and compare
      inclusions: (product.inclusions || []).map((inclusion) => ({
        id: inclusion.id,
        item: inclusion.item, // assuming `inclusion` is a text string
      })),
      termsAndConditions: (product.termsAndConditions || []).map((term) => ({
        id: term.id,
        item: term.item, // assuming `term` is a text string
      })),
      images: product.images.map(image => ({
        id: image.id,
        path: image.path,
        title: image.title || '', // Handle title or default to an empty string
      })),
      accommodationType: product.type || "Unknown",
    };

    // console.log(accommodationData);
    // Dispatch action to add accommodation to the state
    dispatch(addAccommodation(accommodationData));

    return response.data;
  }
);

// Async thunk to handle accommodation update
export const handleUpdateAccommodation = createAsyncThunk(
  'accommodation/update',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put('http://localhost:5000/update-product', formData, {
        withCredentials: true,
      });

      const product = response.data;
      if (!product || !product.product_id || !product.name) {
        throw new Error('Invalid accommodation data received from the server');
      }

      const accommodationData = {
        product_id: product.product_id,
        category: product.category,
        accommodationName: product.name,
        pricing: product.price,
        pricingUnit: product.pricing_unit,
        description: product.description,
        hasBooking: parseInt(product.booking_operation) === 1,
        inclusions: (product.inclusions || []).map((inclusion) => ({
          id: inclusion.id,
          item: inclusion.item, // assuming `inclusion` is a text string
        })),
        termsAndConditions: (product.termsAndConditions || []).map((term) => ({
          id: term.id,
          item: term.item, // assuming `term` is a text string
        })),
        images: product.images.map(image => ({
          id: image.id,
          path: image.path,
          title: image.title || '', // Handle title or default to an empty string
        })),
        accommodationType: product.type || "Unknown",
      };

      // console.log(accommodationData);
      // Dispatch action to update accommodation to the state
      dispatch(updateAccommodation(accommodationData));

      return response.data; // This will be the payload for the fulfilled action
    } catch (error) {
      console.error('Error updating accommodation:', error);
      // Check if error.response exists before accessing its properties
      return rejectWithValue(error.response ? error.response.data : { message: 'An error occurred' });
    }
  }
);

const accommodationSlice = createSlice({
  name: 'accommodations',
  initialState: {
    accommodations: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addAccommodation(state, action) {
      const newAccommodation = action.payload;
      state.accommodations.push({
        id: newAccommodation.id,
        category: newAccommodation.category,
        accommodationName: newAccommodation.accommodationName || "N/A",
        pricing: newAccommodation.pricing || "0",
        pricingUnit: newAccommodation.pricingUnit || "per night",
        description: newAccommodation.description || "",
        hasBooking: newAccommodation.hasBooking || false,
        inclusions: newAccommodation.inclusions.map(inclusion => ({
          id: inclusion.id,
          item: inclusion.item,
        })),
        termsAndConditions: newAccommodation.termsAndConditions.map(term => ({
          id: term.id,
          item: term.item,
        })),
        images: newAccommodation.images.map((img) => ({
          id: img.id,
            path: img.path,
            title: img.title || '',
        })),
        accommodationType: newAccommodation.accommodationType || "Unknown",
      });
    },
    updateAccommodation(state, action) {
      const updatedAccommodation = action.payload;
      console.log("Accommodation: ", updatedAccommodation);
      console.log("All accommodation IDs in state:", state.accommodations.map(accommodation => accommodation.id));

      const accommodationIndex = state.accommodations.findIndex(
        accommodation => accommodation.id.toString() === updatedAccommodation.product_id.toString()
      );

      console.log("Accomodation Index: ", accommodationIndex);

      if (accommodationIndex !== -1) {
        // Update the existing accommodation
        state.accommodations[accommodationIndex] = {
          id: updatedAccommodation.product_id,
          accommodationName: updatedAccommodation.accommodationName || "N/A",
          pricing: updatedAccommodation.pricing || "0",
          pricingUnit: updatedAccommodation.pricingUnit || "per night",
          description: updatedAccommodation.description || "",
          hasBooking: updatedAccommodation.hasBooking || false,
          inclusions: updatedAccommodation.inclusions.map(inclusion => ({
            id: inclusion.id,
            item: inclusion.item,
          })),
          termsAndConditions: updatedAccommodation.termsAndConditions.map(term => ({
            id: term.id,
            item: term.item,
          })),
          images: updatedAccommodation.images.map((img) => ({
            id: img.id,
            path: img.path,
            title: img.title || '',
          })),
          accommodationType: updatedAccommodation.accommodationType || "Unknown",
        };
      }
    },
    deleteAccommodations(state, action) {
      const idsToDelete = action.payload;
      state.accommodations = state.accommodations.filter(
        (accommodation) => !idsToDelete.includes(accommodation.id)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBusinessProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accommodations = action.payload.map((product) => ({
          id: product.product_id,
          accommodationName: product.name,
          pricing: product.price,
          pricingUnit: product.pricing_unit,
          description: product.description,
          hasBooking: product.booking_operation === 1,
          inclusions: product.inclusions || [],
          termsAndConditions: product.termsAndConditions || [],
          images: product.images || [],
          accommodationType: product.type || "Unknown",
        }));
      })
      .addCase(fetchBusinessProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch business products';
      })
      .addCase(addProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // The accommodation is already added via dispatch in the thunk
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add product';
      })
      .addCase(handleUpdateAccommodation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleUpdateAccommodation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // The accommodation is already updated via dispatch in the thunk
      })
      .addCase(handleUpdateAccommodation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update accommodation';
      });
  },
});

// Export the action creators
export const { addAccommodation, updateAccommodation, deleteAccommodations } = accommodationSlice.actions;
export default accommodationSlice.reducer;