import { api } from './api.js';

export const algorithmsApi = {
  list: (params) => api.get('/algorithms', params),
  get: (slug) => api.get(`/algorithms/${slug}`),
};

export const problemsApi = {
  list: (params) => api.get('/problems', params),
  get: (slug) => api.get(`/problems/${slug}`),
};

export const notesApi = {
  list: (params) => api.get('/notes', params),
  create: (note) => api.post('/notes', note),
  update: (id, changes) => api.patch(`/notes/${id}`, changes),
  remove: (id) => api.delete(`/notes/${id}`),
};

export const bookmarksApi = {
  list: (params) => api.get('/bookmarks', params),
  create: (itemType, itemId) => api.post('/bookmarks', { itemType, itemId }),
  remove: (id) => api.delete(`/bookmarks/${id}`),
};

export const progressApi = {
  list: (params) => api.get('/progress', params),
  create: (itemType, itemId, status) => api.post('/progress', { itemType, itemId, status }),
  update: (id, status) => api.patch(`/progress/${id}`, { status }),
  summary: () => api.get('/progress/summary'),
};
