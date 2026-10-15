import { Link } from 'react-router-dom';
import { algorithmsApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { CATEGORIES } from '../utils/format.js';
import { CardSkeletons, ErrorState } from '../components/UI.jsx';
import { AlgorithmCard } from '../components/Cards.jsx';

export default function Home() {
  const { data, loading, error, reload } = useFetch(() => algorithmsApi.list({ limit: 100 }), []);
  const visual = (data || []).filter((a) => a.visualizationAvailable);
  const countFor = (c) => (data || []).filter((a) => a.category === c).length;

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white sm:p-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">See how algorithms actually work</h1>
        <p className="mt-3 max-w-2xl text-indigo-100">
          Step through sorting, searching and graph algorithms, read the pseudocode, practise problems,
          keep study notes and track what you have covered.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/visualizer" className="btn bg-white text-indigo-700 hover:bg-indigo-50">Open the visualizer</Link>
          <Link to="/algorithms" className="btn border border-white/40 text-white hover:bg-white/10">Browse algorithms</Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Categories</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/algorithms?category=${encodeURIComponent(c)}`} className="card transition hover:border-indigo-300">
              <p className="font-medium">{c}</p>
              {data && <p className="mt-1 text-sm text-slate-500">{countFor(c)} algorithm{countFor(c) === 1 ? '' : 's'}</p>}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Try a visualizer</h2>
        {loading && <CardSkeletons count={3} />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visual.slice(0, 6).map((a) => <AlgorithmCard key={a._id} algo={a} />)}
          </div>
        )}
      </section>
    </div>
  );
}
