import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { problemsApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { Badge, DifficultyBadge, ErrorState, Spinner } from '../components/UI.jsx';
import BookmarkButton from '../components/BookmarkButton.jsx';
import ProgressControl from '../components/ProgressControl.jsx';
import CodeBlock from '../components/CodeBlock.jsx';

export default function ProblemDetail() {
  const { slug } = useParams();
  const { data: p, loading, error, reload } = useFetch(() => problemsApi.get(slug), [slug]);
  const [shownHints, setShownHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  if (loading) return <Spinner />;
  if (error) return error.status === 404
    ? <ErrorState error={{ message: 'That problem does not exist.' }} />
    : <ErrorState error={error} onRetry={reload} />;

  return (
    <article className="space-y-6">
      <Link to="/problems" className="text-sm text-indigo-700 hover:underline">← All problems</Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{p.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2"><DifficultyBadge level={p.difficulty} />{p.topics.map((t) => <Badge key={t}>{t}</Badge>)}</div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ProgressControl itemType="problem" itemId={p._id} />
          <BookmarkButton itemType="problem" itemId={p._id} label={p.title} />
        </div>
      </header>

      <section className="card space-y-4">
        <p className="whitespace-pre-line leading-relaxed">{p.statement}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><h2 className="label">Input format</h2><p className="text-sm text-slate-700">{p.inputFormat}</p></div>
          <div><h2 className="label">Output format</h2><p className="text-sm text-slate-700">{p.outputFormat}</p></div>
        </div>
        <div><h2 className="label">Constraints</h2><p className="text-sm text-slate-700">{p.constraints}</p></div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Examples</h2>
        {p.examples.map((ex, i) => (
          <div key={i} className="card grid gap-3 sm:grid-cols-2">
            <CodeBlock title="Input" code={ex.input} />
            <CodeBlock title="Output" code={ex.output} />
            {ex.explanation && <p className="text-sm text-slate-600 sm:col-span-2">{ex.explanation}</p>}
          </div>
        ))}
      </section>

      <section className="card">
        <h2 className="mb-2 text-lg font-semibold">Hints</h2>
        {p.hints.length === 0 && <p className="text-sm text-slate-500">No hints for this problem.</p>}
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {p.hints.slice(0, shownHints).map((h, i) => <li key={i}>{h}</li>)}
        </ol>
        {shownHints < p.hints.length && (
          <button className="btn-secondary mt-3" onClick={() => setShownHints(shownHints + 1)}>Show hint {shownHints + 1} of {p.hints.length}</button>
        )}
      </section>

      <section className="card">
        <h2 className="mb-2 text-lg font-semibold">Approach &amp; complexity</h2>
        {showSolution ? (
          <div className="space-y-2 text-sm">
            <p className="leading-relaxed">{p.explanation || 'No explanation provided.'}</p>
            <p><strong>Time:</strong> <span className="font-mono">{p.timeComplexity}</span> · <strong>Space:</strong> <span className="font-mono">{p.spaceComplexity}</span></p>
          </div>
        ) : (
          <button className="btn-secondary" onClick={() => setShowSolution(true)}>Reveal approach</button>
        )}
      </section>
    </article>
  );
}
