import { useDispatch, useSelector } from 'react-redux';
import { toggleBookmark } from '../features/bookmarks/bookmarksSlice.js';

export default function BookmarkButton({ itemType, itemId, label }) {
  const dispatch = useDispatch();
  const active = useSelector((s) => s.bookmarks.items.some((b) => b.itemType === itemType && b.itemId === itemId));
  return (
    <button
      type="button"
      className={active ? 'btn-primary' : 'btn-secondary'}
      aria-pressed={active}
      onClick={() => dispatch(toggleBookmark({ itemType, itemId, label }))}
    >
      {active ? '★ Bookmarked' : '☆ Bookmark'}
    </button>
  );
}
