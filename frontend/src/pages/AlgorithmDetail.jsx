import { Link, useParams } from 'react-router-dom';
import { algorithmsApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { Badge, DifficultyBadge, ErrorState, Spinner } from '../components/UI.jsx';
import BookmarkButton from '../components/BookmarkButton.jsx';
import ProgressControl from '../components/ProgressControl.jsx';
import CodeBlock from '../components/CodeBlock.jsx';

export default function AlgorithmDetail() {
  const { slug } = useParams();
  const { data: a, loading, error, reload } = useFetch(() => algorithmsApi.get(slug), [slug]);

  if (loading) return <Spinner />;
  if (error) return error.status === 404
    ? <ErrorState error={{ message: 'That algorithm does not exist.' }} />
    : <ErrorState error={error} onRetry={reload} />;

  return (
    <article className="space-y-6">
      <Link to="/algorithms" className="text-sm text-indigo-700 hover:underline">← All algorithms</Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{a.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2"><Badge>{a.category}</Badge><DifficultyBadge level={a.difficulty} /></div>
          <p className="mt-3 max-w-2xl text-slate-600">{a.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ProgressControl itemType="algorithm" itemId={a._id} />
          <BookmarkButton itemType="algorithm" itemId={a._id} label={a.name} />
        </div>
      </header>

      {a.visualizationAvailable && (
        <Link to={`/visualizer/${a.slug}`} className="btn-primary">▶ Open the visualizer</Link>
      )}

      <section className="card">
        <h2 className="mb-2 text-lg font-semibold">How it works</h2>
        <p className="whitespace-pre-line leading-relaxed text-slate-700">{a.explanation}</p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card"><p className="text-xs font-semibold uppercase text-slate-500">Time complexity</p><p className="mt-1 font-mono text-sm">{a.timeComplexity}</p></div>
        <div className="card"><p className="text-xs font-semibold uppercase text-slate-500">Space complexity</p><p className="mt-1 font-mono text-sm">{a.spaceComplexity}</p></div>
      </div>
      <CodeBlock title="Pseudocode" code={a.pseudocode} />
    </article>
  );
}
