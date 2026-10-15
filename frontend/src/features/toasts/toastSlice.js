import { createSlice } from '@reduxjs/toolkit';

let nextId = 1;
const toastSlice = createSlice({
  name: 'toasts',
  initialState: [],
  reducers: {
    addToast: {
      reducer: (state, action) => { state.push(action.payload); },
      prepare: (message, type = 'success') => ({ payload: { id: nextId++, message, type } }),
    },
    removeToast: (state, action) => state.filter((t) => t.id !== action.payload),
  },
});
export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
