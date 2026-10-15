import { Link } from 'react-router-dom';
import { Badge, DifficultyBadge } from './UI.jsx';

export function AlgorithmCard({ algo }) {
  return (
    <Link to={`/algorithms/${algo.slug}`} className="card block transition hover:border-indigo-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{algo.name}</h3>
        <DifficultyBadge level={algo.difficulty} />
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{algo.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge>{algo.category}</Badge>
        {algo.visualizationAvailable && <Badge className="bg-indigo-100 text-indigo-800">Visualizer</Badge>}
      </div>
    </Link>
  );
}

export function ProblemCard({ problem }) {
  return (
    <Link to={`/problems/${problem.slug}`} className="card block transition hover:border-indigo-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{problem.title}</h3>
        <DifficultyBadge level={problem.difficulty} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {problem.topics.map((t) => <Badge key={t}>{t}</Badge>)}
      </div>
    </Link>
  );
}
