import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { bookmarksApi } from '../../services/resources.js';
import { addToast } from '../toasts/toastSlice.js';

// Bookmarks are shared between cards, detail pages and the bookmarks page,
// so they live in Redux. Everything else stays in component state.
export const fetchBookmarks = createAsyncThunk('bookmarks/fetch', async () => (await bookmarksApi.list({ limit: 100 })).data);

export const toggleBookmark = createAsyncThunk('bookmarks/toggle', async ({ itemType, itemId, label }, { getState, dispatch }) => {
  const existing = getState().bookmarks.items.find((b) => b.itemType === itemType && b.itemId === itemId);
  try {
    if (existing) {
      await bookmarksApi.remove(existing._id);
      dispatch(addToast(`Removed bookmark${label ? `: ${label}` : ''}`));
      return { removed: existing._id };
    }
    const { data } = await bookmarksApi.create(itemType, itemId);
    dispatch(addToast(`Bookmarked${label ? `: ${label}` : ''}`));
    dispatch(fetchBookmarks()); // reload so each bookmark carries its item summary
    return { added: data };
  } catch (err) {
    dispatch(addToast(err.message, 'error'));
    throw err;
  }
});

const slice = createSlice({
  name: 'bookmarks',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchBookmarks.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(fetchBookmarks.fulfilled, (s, a) => { s.items = a.payload; s.status = 'ready'; })
      .addCase(fetchBookmarks.rejected, (s, a) => { s.status = 'error'; s.error = a.error.message; })
      .addCase(toggleBookmark.fulfilled, (s, a) => {
        if (a.payload.removed) s.items = s.items.filter((x) => x._id !== a.payload.removed);
      });
  },
});
export default slice.reducer;
