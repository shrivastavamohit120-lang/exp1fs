import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import { fetchPlatformsRequest } from "../../api/mockApi";

const platformsAdapter = createEntityAdapter();

const initialState = platformsAdapter.getInitialState({
  loading: false,
  error: null
});

export const fetchPlatforms = createAsyncThunk("platforms/fetchPlatforms", async () => {
  return await fetchPlatformsRequest();
});

const platformsSlice = createSlice({
  name: "platforms",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatforms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatforms.fulfilled, (state, action) => {
        state.loading = false;
        platformsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPlatforms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default platformsSlice.reducer;
export const platformsAdapterSelectors = platformsAdapter.getSelectors((state) => state.platforms);
