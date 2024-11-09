import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch business products (activities)
export const fetchBusinessProducts = createAsyncThunk(
  'business/fetchActivities',
  async () => {
    try {
      const response = await axios.get('http://localhost:5000/getBusinessProduct', {
        params: { category: 'activity'},
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

    const activityData = {
      id: product.product_id,
      category: product.product_category,
      activityName: product.name,
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
      activityType: product.type || "Unknown",
    };

    // console.log(activityData);
    // Dispatch action to add activity to the state
    dispatch(addActivity(activityData));

    return response.data;
  }
);

// Async thunk to handle activity update
export const handleUpdateActivity = createAsyncThunk(
  'activity/update',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put('http://localhost:5000/update-product', formData, {
        withCredentials: true,
      });

      const product = response.data;
      if (!product || !product.product_id || !product.name) {
        throw new Error('Invalid activity data received from the server');
      }
      // console.log(formData, product);

      const activityData = {
        product_id: product.product_id,
        category: product.category,
        activityName: product.name,
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
        activityType: product.type || "Unknown",        
      };

      // console.log('aaaaaaaaaaaaaaaa', activityData);
      // Dispatch action to update activity to the state
      dispatch(updateActivity(activityData));

      return response.data; // This will be the payload for the fulfilled action
    } catch (error) {
      console.error('Error updating activity:', error);
      // Check if error.response exists before accessing its properties
      return rejectWithValue(error.response ? error.response.data : { message: 'An error occurred' });
    }
  }
);

const activitySlice = createSlice({
  name: 'activities',
  initialState: {
    activities: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addActivity: (state, action) => {
      const newActivity = action.payload;
      state.activities.push({
        id: newActivity.id,
        category: newActivity.category,
        activityName: newActivity.activityName || "N/A",
        pricing: newActivity.pricing || "0",
        pricingUnit: newActivity.pricingUnit || "per night",
        description: newActivity.description || "",
        hasBooking: newActivity.hasBooking || false,
        inclusions: newActivity.inclusions.map(inclusion => ({
          id: inclusion.id,
          item: inclusion.item,
        })),
        termsAndConditions: newActivity.termsAndConditions.map(term => ({
          id: term.id,
          item: term.item,
        })),
        images: newActivity.images.map((img) => ({
          id: img.id,
            path: img.path,
            title: img.title || '',
        })),
        activityType: newActivity.activityType || "Unknown",
      });
    },
    updateActivity: (state, action) => {
      const updatedActivity = action.payload;
      console.log("Actvity: ", updatedActivity);
      console.log("All activity IDs in state:", state.activities.map(activity => activity.id));

      const activityIndex = state.activities.findIndex(
        activity => activity.id.toString() === updatedActivity.product_id.toString()
      );

      // console.log("Activity Index: ", activityIndex);

      if (activityIndex !== -1) {
        // Update the existing product
        state.activities[activityIndex] = {
          id: updatedActivity.product_id,
          activityName: updatedActivity.activityName || "N/A",
          pricing: updatedActivity.pricing || "0",
          pricingUnit: updatedActivity.pricingUnit || "per night",
          description: updatedActivity.description || "",
          hasBooking: updatedActivity.hasBooking || false,
          inclusions: updatedActivity.inclusions.map(inclusion => ({
            id: inclusion.id,
            item: inclusion.item,
          })),
          termsAndConditions: updatedActivity.termsAndConditions.map(term => ({
            id: term.id,
            item: term.item,
          })),
          images: updatedActivity.images.map((img) => ({
            id: img.id,
            path: img.path,
            title: img.title || '',
          })),
          activityType: updatedActivity.activityType || "Unknown",
        };
      }
    },
    deleteActivities: (state, action) => {
      const idsToDelete = action.payload;
      state.activities = state.activities.filter(
        (activity) => !idsToDelete.includes(activity.id)
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
        state.activities = action.payload.map((product) => ({
          id: product.product_id,
          activityName: product.name,
          pricing: product.price,
          pricingUnit: product.pricing_unit,
          description: product.description,
          hasBooking: product.booking_operation === 1,
          inclusions: product.inclusions || [],
          termsAndConditions: product.termsAndConditions || [],
          images: product.images || [],
          activityType: product.type || "Unknown",
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
        // The activity is already added via dispatch in the thunk
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add product';
      })
      .addCase(handleUpdateActivity.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleUpdateActivity.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // The activity is already updated via dispatch in the thunk
      })
      .addCase(handleUpdateActivity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update activity';
      });
  },
});

// Export the action creators
export const { addActivity, updateActivity, deleteActivities } = activitySlice.actions;
export default activitySlice.reducer;