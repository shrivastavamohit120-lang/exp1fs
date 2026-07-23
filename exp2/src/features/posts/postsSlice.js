import { createSlice, createAsyncThunk, createEntityAdapter, nanoid } from "@reduxjs/toolkit";
import { fetchPostsRequest, createPostRequest } from "../../api/mockApi";

// --- Assignment 3: State Normalization -------------------------------------
// createEntityAdapter stores posts as { ids: [], entities: {} } instead of a
// plain array. Lookups by id become O(1) and updates never require scanning
// the whole array, which is what "non-normalized" state would force you to do
// (e.g. items.find(p => p.id === id) on every update).
const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
});

const initialState = postsAdapter.getInitialState({
  loading: false,
  error: null
});

// --- Assignment 2: Async Data Handling -------------------------------------
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const data = await fetchPostsRequest();
  return data;
});

export const addPostAsync = createAsyncThunk("posts/addPostAsync", async (newPost) => {
  const created = await createPostRequest(newPost);
  return created;
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    // --- Assignment 1: Redux Slice Implementation (sync CRUD) -------------
    addPost: {
      reducer: (state, action) => {
        postsAdapter.addOne(state, action.payload);
      },
      prepare: ({ content, platform }) => ({
        payload: { id: nanoid(), content, platform, createdAt: new Date().toISOString() }
      })
    },
    updatePost: (state, action) => {
      const { id, changes } = action.payload;
      postsAdapter.updateOne(state, { id, changes });
    },
    deletePost: (state, action) => {
      postsAdapter.removeOne(state, action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchPosts lifecycle
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        postsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // addPostAsync lifecycle
      .addCase(addPostAsync.fulfilled, (state, action) => {
        postsAdapter.addOne(state, action.payload);
      });
  }
});

export const { addPost, updatePost, deletePost } = postsSlice.actions;
export default postsSlice.reducer;

// Base adapter selectors, scoped to `state.posts`
export const postsAdapterSelectors = postsAdapter.getSelectors((state) => state.posts);
