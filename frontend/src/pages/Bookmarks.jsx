import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookmarks, toggleBookmark } from '../features/bookmarks/bookmarksSlice.js';
import { Badge, CardSkeletons, DifficultyBadge, EmptyState, ErrorState, PageHeader } from '../components/UI.jsx';

export default function Bookmarks() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.bookmarks);
  const [tab, setTab] = useState('all');
  const shown = items.filter((b) => b.item && (tab === 'all' || b.itemType === tab));

  return (
    <>
      <PageHeader title="Bookmarks" subtitle="Algorithms and problems you saved in the shared demo workspace." />
      <div className="mb-6 flex gap-2" role="tablist">
        {[['all', 'All'], ['algorithm', 'Algorithms'], ['problem', 'Problems']].map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      {status === 'loading' && items.length === 0 && <CardSkeletons count={3} />}
      {status === 'error' && <ErrorState error={{ message: error }} onRetry={() => dispatch(fetchBookmarks())} />}
      {status === 'ready' && shown.length === 0 && (
        <EmptyState title="Nothing bookmarked here yet" action={<Link to="/algorithms" className="btn-primary">Browse algorithms</Link>}>
          Use the Bookmark button on any algorithm or problem page.
        </EmptyState>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((b) => (
          <div key={b._id} className="card flex flex-col">
            <Link to={`/${b.itemType === 'algorithm' ? 'algorithms' : 'problems'}/${b.item.slug}`} className="font-semibold text-slate-900 hover:text-indigo-700">
              {b.item.name || b.item.title}
            </Link>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="bg-slate-100 capitalize">{b.itemType}</Badge>
              <DifficultyBadge level={b.item.difficulty} />
            </div>
            <button className="btn-secondary mt-4 self-start" onClick={() => dispatch(toggleBookmark({ itemType: b.itemType, itemId: b.itemId, label: b.item.name || b.item.title }))}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
