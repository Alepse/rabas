import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch initial business data
export const fetchBusinessData = createAsyncThunk(
  'business/fetchBusinessData',
  async () => {
    const response = await axios.get('http://localhost:5000/get-businessData', {
      withCredentials: true, // Ensure cookies are sent with the request if needed
    });
    return response.data.businessData[0]; // Return the first business object
  }
);

const initialState = {
  businessId: null,           // Update business ID
  businessName: '',           // Update business name
  businessLogo: null,         // Update business logo
  coverPhoto: null,           // Update cover photo
  businessCard: {             // Update business card details
    cardImage: null,          // Update card image 
    category: '',             // Update category
    location: '',             // Update location
    description: '',          // Update description
    priceRange: '',           // Update price range
  },
  heroImages: [],             // Update hero images
  aboutUs: '',                // Update about us section
  facilities: [],             // Update facilities
  policies: [],               // Update policies
  contactInfo: [],            // Update contact info
  openingHours: [],           // Update opening hours
};

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    // General business data update
    updateBusinessData: (state, action) => {
      Object.assign(state, action.payload);
    },

    // Facilities-related reducers
    addFacility: (state) => {
      if (!state.facilities) {
        state.facilities = [];
      }
      state.facilities.push({ id: Date.now(), icon: null, name: '', items: [{ name: '', icon: null }] });
    },
    updateFacility: (state, action) => {
      const { index, field, value } = action.payload || {};
      if (index === undefined || !field || value === undefined) {
        console.error('Invalid payload for updateFacility:', action.payload);
        return;
      }
      state.facilities[index][field] = value;
    },
    removeFacility: (state, action) => {
      const { index } = action.payload || {};
      if (index === undefined) {
        console.error('Invalid payload for removeFacility:', action.payload);
        return;
      }
      state.facilities.splice(index, 1);
    },
    updateFacilityIcon: (state, action) => {
      const { index, icon } = action.payload || {};
      if (index === undefined || !icon) {
        console.error('Invalid payload for updateFacilityIcon:', action.payload);
        return;
      }
      state.facilities[index].icon = icon;
    },
    updateFacilityItem: (state, action) => {
      const { facilityIndex, itemIndex, field, value } = action.payload || {};
      if (facilityIndex === undefined || itemIndex === undefined || !field || value === undefined) {
        console.error('Invalid payload for updateFacilityItem:', action.payload);
        return;
      }
      state.facilities[facilityIndex].items[itemIndex][field] = value;
    },
    updateFacilityItemIcon: (state, action) => {
      const { facilityIndex, itemIndex, icon } = action.payload || {};
      if (facilityIndex === undefined || itemIndex === undefined || !icon) {
        console.error('Invalid payload for updateFacilityItemIcon:', action.payload);
        return;
      }
      state.facilities[facilityIndex].items[itemIndex].icon = icon;
    },
    addFacilityItem: (state, action) => {
      const { facilityIndex } = action.payload || {};
      if (facilityIndex === undefined) {
        console.error('Invalid payload for addFacilityItem:', action.payload);
        return;
      }
      state.facilities[facilityIndex].items.push({ name: '', icon: null });
    },
    removeFacilityItem: (state, action) => {
      const { facilityIndex, itemIndex } = action.payload || {};
      if (
        facilityIndex === undefined || 
        itemIndex === undefined || 
        !state.facilities[facilityIndex] || 
        !state.facilities[facilityIndex].items[itemIndex]
      ) {
        console.error('Invalid payload or indices for removeFacilityItem:', action.payload);
        return;
      }
      state.facilities[facilityIndex].items.splice(itemIndex, 1);
    },

    // Policies-related reducers
    addPolicy: (state) => {
      if (!state.policies) {
        state.policies = [];
      }
      state.policies.push({ title: '', items: [''] });
    },
    updatePolicy: (state, action) => {
      const { index, field, value } = action.payload || {};
      if (index === undefined || !field || value === undefined) {
        console.error('Invalid payload for updatePolicy:', action.payload);
        return;
      }
      state.policies[index][field] = value;
    },
    removePolicy: (state, action) => {
      const { policyIndex } = action.payload || {};
      if (policyIndex === undefined || !state.policies[policyIndex]) {
        console.error('Invalid payload or index for removePolicy:', action.payload);
        return;
      }
      state.policies.splice(policyIndex, 1);
    },
    addPolicyItem: (state, action) => {
      const { policyIndex } = action.payload || {};
      if (policyIndex === undefined) {
        console.error('Invalid payload for addPolicyItem:', action.payload);
        return;
      }
      state.policies[policyIndex].items.push('');
    },
    updatePolicyItem: (state, action) => {
      const { policyIndex, itemIndex, value } = action.payload || {};
      if (policyIndex === undefined || itemIndex === undefined || value === undefined) {
        console.error('Invalid payload for updatePolicyItem:', action.payload);
        return;
      }
      state.policies[policyIndex].items[itemIndex] = value;
    },
    removePolicyItem: (state, action) => {
      const { policyIndex, itemIndex } = action.payload || {};
      if (
        policyIndex === undefined || 
        itemIndex === undefined || 
        !state.policies[policyIndex] || 
        !state.policies[policyIndex].items[itemIndex]
      ) {
        console.error('Invalid payload or indices for removePolicyItem:', action.payload);
        return;
      }
      state.policies[policyIndex].items.splice(itemIndex, 1);
    },

    // Contact Info reducers
    addContactInfo: (state) => {
      if (!state.contactInfo) {
        state.contactInfo = [];
      }
      state.contactInfo.push({ id: Date.now(), icon: 'FaPlus', label: '', value: '' });
    },
    updateContactInfo: (state, action) => {
      const { id, field, value } = action.payload || {};
      if (!id || !field || value === undefined) {
        console.error('Invalid payload for updateContactInfo:', action.payload);
        return;
      }
      state.contactInfo = state.contactInfo.map(info =>
        info.id === id ? { ...info, [field]: value } : info
      );
    },
    removeContactInfo: (state, action) => {
      const { id } = action.payload || {};
      if (!id) {
        console.error('Invalid payload for removeContactInfo:', action.payload);
        return;
      }
      state.contactInfo = state.contactInfo.filter(info => info.id !== id);
    },
    cancelContactInfo: (state) => {
      // Reset the contactInfo to the initial state
      state.contactInfo = initialState.contactInfo;
    },
    updateContactIcon: (state, action) => {
      const { id, icon } = action.payload || {};
      if (!id || !icon) {
        console.error('Invalid payload for updateContactIcon:', action.payload);
        return;
      }
      state.contactInfo = state.contactInfo.map(info =>
        info.id === id ? { ...info, icon } : info
      );
    },
    updateBusinessCard: (state, action) => {
      const { cardImage, description, location, priceRange } = action.payload;
      if (cardImage !== undefined) state.businessCard.cardImage = cardImage;
      if (description !== undefined) state.businessCard.description = description;
      if (location !== undefined) state.businessCard.location = location;
      if (priceRange !== undefined) state.businessCard.priceRange = priceRange;
    },

    // Add a new hero image with a title
    addHeroImage: (state, action) => {
      const { path, title = '' } = action.payload;
      state.heroImages.push({ path, title });
    },

    // Update the title of a specific hero image
    updateHeroImageTitle: (state, action) => {
      const { id, title } = action.payload;
      if (!id) {
        console.error('Invalid payload for updateHeroImageTitle:', action.payload);
      }
      state.heroImages = state.heroImages.map(image =>
        image.id == id ? { ...image, title } : image
      );
    },

    // Remove a hero image
    removeHeroImage: (state, action) => {
      const { id } = action.payload || {};
      if (!id) {
        console.error('Invalid payload for removeHeroImage:', action.payload);
        return;
      }
      state.heroImages = state.heroImages.filter(image => image.id!== id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessData.fulfilled, (state, action) => {
        const fetchedData = action.payload;

        // Log the fetched data
        console.log('Fetched Business Data:', fetchedData);

        // Update the state with fetched data
        state.businessId = fetchedData.business_id;
        state.businessName = fetchedData.businessName;
        state.businessLogo = fetchedData.businessLogo;
        state.coverPhoto = fetchedData.coverPhoto || null;
        state.businessCard = {
          cardImage: fetchedData.businessCard.cardImage,
          category: fetchedData.businessCard.category,
          location: fetchedData.businessCard.location,
          description: fetchedData.businessCard.description,
          priceRange: fetchedData.businessCard.priceRange,
        };
        state.heroImages = fetchedData.heroImages.map(image => ({
          id: image.id,
          path: image.path,
          title: image.title || ''
        }));
        state.aboutUs = fetchedData.aboutUs;
        state.facilities = fetchedData.facilities || [];
        state.policies = fetchedData.policies || [];
        state.contactInfo = fetchedData.contactInfo || [];
        state.openingHours = fetchedData.openingHours || [];
      })
      .addCase(fetchBusinessData.rejected, (state, action) => {
        console.error('Failed to fetch business data:', action.error.message);
      });
  },
});

// Export actions and reducer
export const {
  updateBusinessData,
  addFacility,
  updateFacility,
  removeFacility,
  updateFacilityIcon,
  addPolicy,
  updatePolicy,
  removePolicy,
  addPolicyItem,
  updatePolicyItem,
  removePolicyItem,
  addContactInfo,
  updateContactInfo,
  removeContactInfo,
  cancelContactInfo,
  updateContactIcon,
  updateBusinessCard,
  addHeroImage,
  updateHeroImageTitle,
  removeHeroImage,
  addFacilityItem,
  updateFacilityItem,
  removeFacilityItem,
  updateFacilityItemIcon,
} = businessSlice.actions;

export default businessSlice.reducer;
