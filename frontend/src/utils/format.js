export const formatDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const STATUS_LABELS = { not_started: 'Not started', in_progress: 'In progress', completed: 'Completed' };
export const DIFFICULTY_STYLES = {
  Easy: 'bg-emerald-100 text-emerald-800',
  Medium: 'bg-amber-100 text-amber-800',
  Hard: 'bg-red-100 text-red-800',
};
export const CATEGORIES = ['Sorting', 'Searching', 'Graph Algorithms', 'Dynamic Programming', 'Trees and Recursion'];
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
export const NOTE_TOPICS = ['General', 'Arrays', 'Strings', 'Sorting', 'Searching', 'Graph Algorithms', 'Dynamic Programming', 'Trees and Recursion'];
