import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch business products (restaurants)
export const fetchBusinessProducts = createAsyncThunk(
  'business/fetchRestaurants',
  async () => {
    try {
      const response = await axios.get('http://localhost:5000/getBusinessProduct', {
        params: { category: 'restaurant'},
        withCredentials: true,
      });
      return response.data.businessProducts || []; // Return an empty array if no products
    } catch (error) {
      throw new Error(error.response?.data.message || 'Failed to fetch activities');
    }
  }
);

// Async thunk to add a new business product (activity)
export const addProduct = createAsyncThunk(
  'business/addProduct',
  async (formData, { dispatch }) => {
    const response = await axios.post('http://localhost:5000/add-product', formData, {
      withCredentials: true,
    });

    const product = response.data;
    if (!product || !product.product_id || !product.name) {
      throw new Error('Invalid activity data received from the server');
    }

    const restaurantData = {
      id: product.product_id,
      category: product.product_category,
      restaurantName: product.name,
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
      restaurantType: product.type || "Unknown",
    };

    // console.log(restaurantData);
    // Dispatch action to add restaurant to the state
    dispatch(addRestaurant(restaurantData));

    return response.data;
  }
);

// Async thunk to handle restaurant update
export const handleUpdateRestaurant = createAsyncThunk(
  'restaurant/update',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put('http://localhost:5000/update-product', formData, {
        withCredentials: true,
      });

      const product = response.data;
      if (!product || !product.product_id || !product.name) {
        throw new Error('Invalid activity data received from the server');
      }
      console.log(formData, product);

      const restaurantData = {
        product_id: product.product_id,
        category: product.category,
        restaurantName: product.name,
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
        restaurantType: product.type || "Unknown",        
      };

      // console.log('aaaaaaaaaaaaaaaa', restaurantData);
      // Dispatch action to update restaurant to the state
      dispatch(updateRestaurant(restaurantData));

      return response.data; // This will be the payload for the fulfilled action
    } catch (error) {
      console.error('Error updating restaurant:', error);
      // Check if error.response exists before accessing its properties
      return rejectWithValue(error.response ? error.response.data : { message: 'An error occurred' });
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState: {
    restaurants: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addRestaurant: (state, action) => {
      const newRestaurant = action.payload;
      state.restaurants.push({
        id: newRestaurant.id,
        category: newRestaurant.category,
        restaurantName: newRestaurant.restaurantName || "N/A",
        pricing: newRestaurant.pricing || "0",
        pricingUnit: newRestaurant.pricingUnit || "per night",
        description: newRestaurant.description || "",
        hasBooking: newRestaurant.hasBooking || false,
        inclusions: newRestaurant.inclusions.map(inclusion => ({
          id: inclusion.id,
          item: inclusion.item,
        })),
        termsAndConditions: newRestaurant.termsAndConditions.map(term => ({
          id: term.id,
          item: term.item,
        })),
        images: newRestaurant.images.map((img) => ({
          id: img.id,
            path: img.path,
            title: img.title || '',
        })),
        restaurantType: newRestaurant.restaurantType || "Unknown",
      });
    },
    updateRestaurant: (state, action) => {
      const updatedRestaurant = action.payload;
      console.log("Restaurant: ", updatedRestaurant);
      console.log("All restaurant IDs in state:", state.restaurants.map(restaurant => restaurant.id));

      const restaurantIndex = state.restaurants.findIndex(
        restaurant => restaurant.id.toString() === updatedRestaurant.product_id.toString()
      );

      // console.log("Restaurant Index: ", restaurantIndex);

      if (restaurantIndex !== -1) {
        // Update the existing accommodation
        state.restaurants[restaurantIndex] = {
          id: updatedRestaurant.product_id,
          restaurantName: updatedRestaurant.restaurantName || "N/A",
          pricing: updatedRestaurant.pricing || "0",
          pricingUnit: updatedRestaurant.pricingUnit || "per night",
          description: updatedRestaurant.description || "",
          hasBooking: updatedRestaurant.hasBooking || false,
          inclusions: updatedRestaurant.inclusions.map(inclusion => ({
            id: inclusion.id,
            item: inclusion.item,
          })),
          termsAndConditions: updatedRestaurant.termsAndConditions.map(term => ({
            id: term.id,
            item: term.item,
          })),
          images: updatedRestaurant.images.map((img) => ({
            id: img.id,
            path: img.path,
            title: img.title || '',
          })),
          restaurantType: updatedRestaurant.restaurantType || "Unknown",
        };
      }
    },
    deleteRestaurants: (state, action) => {
      const idsToDelete = action.payload;
      state.restaurants = state.restaurants.filter(
        (restaurant) => !idsToDelete.includes(restaurant.id)
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
        state.restaurants = action.payload.map((product) => ({
          id: product.product_id,
          restaurantName: product.name,
          pricing: product.price,
          pricingUnit: product.pricing_unit,
          description: product.description,
          hasBooking: product.booking_operation === 1,
          inclusions: product.inclusions || [],
          termsAndConditions: product.termsAndConditions || [],
          images: product.images || [],
          restaurantType: product.type || "Unknown",
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
        // The restaurant is already added via dispatch in the thunk
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add product';
      })
      .addCase(handleUpdateRestaurant.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleUpdateRestaurant.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // The restaurant is already updated via dispatch in the thunk
      })
      .addCase(handleUpdateRestaurant.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update restaurant';
      });
  },
});

// Export the action creators
export const { addRestaurant, updateRestaurant, deleteRestaurants } = restaurantSlice.actions;
export default restaurantSlice.reducer;