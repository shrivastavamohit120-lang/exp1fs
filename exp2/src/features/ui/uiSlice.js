import { createSlice } from "@reduxjs/toolkit";

// --- Section 4 of the PDF: "Separation of UI state and data state" --------
// platformFilter is view-only state. It doesn't belong inside postsSlice
// or platformsSlice because it doesn't describe *data*, it describes what
// the current screen is showing.
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    platformFilter: "All"
  },
  reducers: {
    setPlatformFilter: (state, action) => {
      state.platformFilter = action.payload;
    }
  }
});

export const { setPlatformFilter } = uiSlice.actions;
export default uiSlice.reducer;
