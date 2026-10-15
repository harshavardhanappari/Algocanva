import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchBookmarks } from '../features/bookmarks/bookmarksSlice.js';
import { Toaster } from '../components/UI.jsx';

const LINKS = [
  ['/', 'Home'], ['/algorithms', 'Algorithms'], ['/visualizer', 'Visualizer'], ['/problems', 'Problems'],
  ['/notes', 'Notes'], ['/bookmarks', 'Bookmarks'], ['/progress', 'Progress'],
];

export default function MainLayout() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { dispatch(fetchBookmarks()); }, [dispatch]);
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="text-lg font-bold text-indigo-700">AlgoCanvas</NavLink>
          <button className="btn-secondary md:hidden" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
            {open ? 'Close' : 'Menu'}
          </button>
          <nav id="main-nav" className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-slate-200 bg-white p-3 md:static md:flex md:flex-row md:border-0 md:p-0`}>
            {LINKS.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={linkClass}>{label}</NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8"><Outlet /></main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        AlgoCanvas · Notes, bookmarks and progress live in a shared demo workspace (no accounts).
      </footer>
      <Toaster />
    </div>
  );
}
