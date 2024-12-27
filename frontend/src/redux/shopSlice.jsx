import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

// Async thunk to fetch business products (shops)
export const fetchBusinessProducts = createAsyncThunk(
  'business/fetchShopProducts',
  async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getBusinessProduct`, {
        params: { category: 'shop'},
        withCredentials: true,
      });
      console.log(response.data);
      return response.data.businessProducts || []; // Return an empty array if no products
    } catch (error) {
      throw new Error(error.response?.data.message || 'Failed to fetch shops');
    }
  }
);

// Async thunk to add a new business product (product)
export const addProduct = createAsyncThunk(
  'business/addProduct',
  async (formData, { dispatch }) => {
    const response = await axios.post(`${BASE_URL}/add-product`, formData, {
      withCredentials: true,
    });

    const product = response.data;
    if (!product || !product.product_id || !product.name) {
      throw new Error('Invalid shop data received from the server');
    }

    const shopData = {
      id: product.product_id,
      category: product.category,
      productName: product.name,
      pricing: product.price,
      pricingUnit: product.pricing_unit,
      description: product.description,
      images: product.images.map(image => ({
        id: image.id,
        path: image.path,
        title: image.title || '', // Handle title or default to an empty string
      })),
      productType: product.type || "Unknown",
    };

    // console.log(shopData);
    // Dispatch action to add shop product to the state
    dispatch(addShopProduct(shopData));

    return response.data;
  }
);

// Async thunk to handle shop product update
export const handleUpdateShopProduct = createAsyncThunk(
  'shop/update',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      // Log formData content
      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }
      const response = await axios.put(`${BASE_URL}/update-product`, formData, {
        withCredentials: true,
      });

      const product = response.data;
      if (!product || !product.product_id || !product.name) {
        throw new Error('Invalid shop product data received from the server');
      }
      // console.log(formData, product);

      const shopData = {
        product_id: product.product_id,
        category: product.category,
        productName: product.name,
        pricing: product.price,
        pricingUnit: product.pricing_unit,
        description: product.description,
        images: product.images.map(image => ({
          id: image.id,
          path: image.path,
          title: image.title || '', // Handle title or default to an empty string
        })),
        productType: product.type || "Unknown",        
      };

      // console.log('aaaaaaaaaaaaaaaa', shopData);
      // Dispatch action to update shop product to the state
      dispatch(updateShopProduct(shopData));

      return response.data; // This will be the payload for the fulfilled action
    } catch (error) {
      console.error('Error updating shop product:', error);
      // Check if error.response exists before accessing its properties
      return rejectWithValue(error.response ? error.response.data : { message: 'An error occurred' });
    }
  }
);

const shopSlice = createSlice({
  name: 'shopProducts',
  initialState: {
    shopProducts: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addShopProduct: (state, action) => {
      const newShopProduct = action.payload;
      state.shopProducts.push({
        id: newShopProduct.id,
        category: newShopProduct.category,
        productName: newShopProduct.productName || "N/A",
        pricing: newShopProduct.pricing || "0",
        pricingUnit: newShopProduct.pricingUnit || "per item",
        description: newShopProduct.description || "",
        images: newShopProduct.images.map((img) => ({
          id: img.id,
            path: img.path,
            title: img.title || '',
        })),
        productType: newShopProduct.productType || "Unknown",
      });
    },
    updateShopProduct: (state, action) => {
      const updatedShopProduct = action.payload;
      console.log("Shop Product: ", updatedShopProduct);
      console.log("All products IDs in state:", state.shopProducts.map(product => product.id));

      const productIndex = state.shopProducts.findIndex(
        product => product.id.toString() === updatedShopProduct.product_id.toString()
      );

      // console.log("Product Index: ", productIndex);

      if (productIndex !== -1) {
        // Update the existing product
        state.shopProducts[productIndex] = {
          id: updatedShopProduct.product_id,
          productName: updatedShopProduct.productName || "N/A",
          pricing: updatedShopProduct.pricing || "0",
          pricingUnit: updatedShopProduct.pricingUnit || "per item",
          description: updatedShopProduct.description || "",
          images: updatedShopProduct.images.map((img) => ({
            id: img.id,
            path: img.path,
            title: img.title || '',
          })),
          productType: updatedShopProduct.productType || "Unknown",
        };
      }
    },
    deleteShopProducts: (state, action) => {
      const idsToDelete = action.payload;
      state.shopProducts = state.shopProducts.filter(
        (product) => !idsToDelete.includes(product.id)
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
        state.shopProducts = action.payload.map((product) => ({
          id: product.product_id,
          productName: product.name,
          pricing: product.price,
          pricingUnit: product.pricing_unit,
          description: product.description,
          images: product.images || [],
          productType: product.type || "Unknown",
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
        // The product is already added via dispatch in the thunk
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add product';
      })
      .addCase(handleUpdateShopProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(handleUpdateShopProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // The product is already updated via dispatch in the thunk
      })
      .addCase(handleUpdateShopProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update products';
      });
  },
});

// Export the action creators
export const { addShopProduct, updateShopProduct, deleteShopProducts } = shopSlice.actions;
export default shopSlice.reducer;
