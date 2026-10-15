import { configureStore } from '@reduxjs/toolkit';
import bookmarks from './features/bookmarks/bookmarksSlice.js';
import toasts from './features/toasts/toastSlice.js';

export const store = configureStore({ reducer: { bookmarks, toasts } });
