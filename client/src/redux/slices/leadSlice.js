import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  leads: [],
  currentLead: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  }
};

// Async thunks
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/leads', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
    }
  }
);

export const fetchLead = createAsyncThunk(
  'leads/fetchLead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/leads/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead');
    }
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await api.post('/leads', leadData);
      return response.data.data.lead;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create lead');
    }
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/leads/${id}`, data);
      return response.data.data.lead;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead');
    }
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/leads/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lead');
    }
  }
);

export const updateLeadStatus = createAsyncThunk(
  'leads/updateLeadStatus',
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/leads/${id}/status`, { status, notes });
      return response.data.data.lead;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const fetchLeadStats = createAsyncThunk(
  'leads/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leads/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// Lead slice
const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentLead: (state) => {
      state.currentLead = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Lead
      .addCase(fetchLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLead.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLead = action.payload;
      })
      .addCase(fetchLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Lead
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })
      // Update Lead
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex(lead => lead._id === action.payload._id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
        if (state.currentLead?._id === action.payload._id) {
          state.currentLead = { ...state.currentLead, ...action.payload };
        }
      })
      // Update Lead Status
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        const index = state.leads.findIndex(lead => lead._id === action.payload._id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
      })
      // Delete Lead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter(lead => lead._id !== action.payload);
      })
      // Fetch Stats
      .addCase(fetchLeadStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { clearError, clearCurrentLead } = leadSlice.actions;
export default leadSlice.reducer;
