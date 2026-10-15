import { Link } from 'react-router-dom';
import { progressApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { EmptyState, ErrorState, PageHeader, Spinner, Badge, DemoNotice } from '../components/UI.jsx';
import { STATUS_LABELS, formatDate } from '../utils/format.js';

const Stat = ({ label, value, sub }) => (
  <div className="card">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
    {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
  </div>
);

function Bar({ percent }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
    </div>
  );
}

export default function Progress() {
  const { data, loading, error, reload } = useFetch(() => progressApi.summary(), []);
  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const { algorithms: a, problems: p, byTopic, recentAlgorithms, totalBookmarks } = data;
  const nothing = a.inProgress + a.completed + p.attempted === 0;

  return (
    <>
      <PageHeader title="Learning progress" subtitle="Calculated from the status you set on algorithm and problem pages." />
      <div className="mb-6"><DemoNotice /></div>
      {nothing && (
        <div className="mb-6"><EmptyState title="No progress recorded yet" action={<Link to="/algorithms" className="btn-primary">Start with an algorithm</Link>}>
          Open an algorithm or problem and change its Status to start tracking.
        </EmptyState></div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Algorithms completed" value={`${a.completed}/${a.total}`} sub={`${a.completionPercent}% · ${a.inProgress} in progress · ${a.notStarted} not started`} />
        <Stat label="Problems completed" value={`${p.completed}/${p.total}`} sub={`${p.completionPercent}% complete`} />
        <Stat label="Problems attempted" value={p.attempted} sub="In progress or completed" />
        <Stat label="Bookmarks" value={totalBookmarks} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">Problem progress by topic</h2>
          {byTopic.length === 0 && <p className="text-sm text-slate-500">No problems available.</p>}
          <ul className="space-y-3">
            {byTopic.map((t) => (
              <li key={t.topic}>
                <div className="mb-1 flex justify-between text-sm"><span>{t.topic}</span><span className="text-slate-500">{t.completed}/{t.total}</span></div>
                <Bar percent={t.percent} />
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">Recently studied algorithms</h2>
          {recentAlgorithms.length === 0 && <p className="text-sm text-slate-500">Nothing yet.</p>}
          <ul className="divide-y divide-slate-100">
            {recentAlgorithms.map((r) => (
              <li key={r._id} className="flex items-center justify-between gap-2 py-2">
                <div>
                  <Link className="font-medium hover:text-indigo-700" to={`/algorithms/${r.item.slug}`}>{r.item.name}</Link>
                  <p className="text-xs text-slate-500">{formatDate(r.lastStudiedAt)}</p>
                </div>
                <Badge className={r.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>{STATUS_LABELS[r.status]}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
