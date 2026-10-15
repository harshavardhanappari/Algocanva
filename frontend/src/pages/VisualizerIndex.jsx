import { Link } from 'react-router-dom';
import { algorithmsApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { VISUALIZERS } from '../algorithms/index.js';
import { CardSkeletons, ErrorState, PageHeader } from '../components/UI.jsx';
import { AlgorithmCard } from '../components/Cards.jsx';

export default function VisualizerIndex() {
  const { data, loading, error, reload } = useFetch(() => algorithmsApi.list({ limit: 100 }), []);
  const list = (data || []).filter((a) => VISUALIZERS[a.slug]);
  return (
    <>
      <PageHeader title="Visualizers" subtitle="Pick an algorithm to run it step by step." />
      {loading && <CardSkeletons />}
      {error && <ErrorState error={error} onRetry={reload} />}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <div key={a._id} className="relative">
            <AlgorithmCard algo={a} />
            <Link to={`/visualizer/${a.slug}`} className="btn-primary mt-2 w-full">▶ Visualize</Link>
          </div>
        ))}
      </div>
    </>
  );
}
