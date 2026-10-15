import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { algorithmsApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { VISUALIZERS } from '../algorithms/index.js';
import { randomArray, randomInt, randomSortedArray } from '../utils/random.js';
import { makeGraph } from '../data/graph.js';
import { useStepPlayer } from '../features/visualizer/useStepPlayer.js';
import PlayerControls from '../features/visualizer/PlayerControls.jsx';
import SortView from '../features/visualizer/SortView.jsx';
import SearchView from '../features/visualizer/SearchView.jsx';
import GraphView from '../features/visualizer/GraphView.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import { EmptyState } from '../components/UI.jsx';

const delayFor = (speed) => 1100 - speed * 100; // speed 1..10 -> 1000ms..100ms

function InfoPanels({ meta, metaError, step, labels }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="card" aria-live="polite">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">What's happening</h2>
          <p className="mt-1 min-h-12 text-slate-800">{step.message}</p>
        </div>
        <div className="card">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Live statistics</h2>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(labels).map(([key, label]) => (
              <div key={key}><dt className="text-xs text-slate-500">{label}</dt><dd className="text-xl font-semibold">{step.stats[key]}</dd></div>
            ))}
          </dl>
        </div>
      </div>
      <div className="space-y-4">
        {meta && (
          <div className="card text-sm">
            <p><strong>Time:</strong> <span className="font-mono">{meta.timeComplexity}</span></p>
            <p className="mt-1"><strong>Space:</strong> <span className="font-mono">{meta.spaceComplexity}</span></p>
          </div>
        )}
        {meta && <CodeBlock title="Pseudocode" code={meta.pseudocode} />}
        {metaError && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Couldn't load pseudocode and complexity from the server ({metaError.message}). The visualizer still works.</p>}
      </div>
    </div>
  );
}

function SortRunner({ viz, meta, metaError }) {
  const [size, setSize] = useState(15);
  const [speed, setSpeed] = useState(6);
  const [array, setArray] = useState(() => randomArray(15));
  const steps = useMemo(() => viz.run(array), [viz, array]);
  const player = useStepPlayer(steps, delayFor(speed));
  return (
    <div className="space-y-4">
      <PlayerControls player={player} speed={speed} onSpeed={setSpeed}>
        <div className="flex items-end gap-3">
          <label className="block flex-1 text-sm">
            <span className="label">Array size: {size}</span>
            <input type="range" className="w-full accent-indigo-600" min={5} max={40} value={size}
              onChange={(e) => { const n = Number(e.target.value); setSize(n); setArray(randomArray(n)); }} />
          </label>
          <button className="btn-secondary" onClick={() => setArray(randomArray(size))}>New array</button>
        </div>
      </PlayerControls>
      <div className="card"><SortView step={player.step} /></div>
      <InfoPanels meta={meta} metaError={metaError} step={player.step} labels={viz.statLabels} />
    </div>
  );
}

function SearchRunner({ viz, meta, metaError }) {
  const [size, setSize] = useState(15);
  const [speed, setSpeed] = useState(4);
  const [array, setArray] = useState(() => randomSortedArray(15));
  const [target, setTarget] = useState(() => array[randomInt(0, array.length - 1)]);
  const steps = useMemo(() => viz.run(array, target), [viz, array, target]);
  const player = useStepPlayer(steps, delayFor(speed));

  function regenerate(n) {
    const arr = randomSortedArray(n);
    setArray(arr);
    setTarget(arr[randomInt(0, arr.length - 1)]);
  }
  return (
    <div className="space-y-4">
      <PlayerControls player={player} speed={speed} onSpeed={setSpeed}>
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="label">Array size: {size}</span>
            <input type="range" className="w-full accent-indigo-600" min={5} max={30} value={size}
              onChange={(e) => { const n = Number(e.target.value); setSize(n); regenerate(n); }} />
          </label>
          <label className="block text-sm">
            <span className="label">Target value</span>
            <input type="number" className="input" value={target} min={0} max={999}
              onChange={(e) => e.target.value !== '' && setTarget(Number(e.target.value))} />
          </label>
          <div className="flex items-end gap-2">
            <button className="btn-secondary" onClick={() => regenerate(size)}>New array</button>
            <button className="btn-secondary" onClick={() => setTarget(randomInt(1, 99))} title="May not be in the array">Random target</button>
          </div>
        </div>
      </PlayerControls>
      <div className="card"><SearchView step={player.step} /></div>
      <InfoPanels meta={meta} metaError={metaError} step={player.step} labels={viz.statLabels} />
    </div>
  );
}

function GraphRunner({ viz, meta, metaError }) {
  const [graph, setGraph] = useState(() => makeGraph(false));
  const [start, setStart] = useState('A');
  const [end, setEnd] = useState(viz.needsEnd ? 'H' : '');
  const [speed, setSpeed] = useState(4);
  const steps = useMemo(() => viz.run(graph, start, end || null), [viz, graph, start, end]);
  const player = useStepPlayer(steps, delayFor(speed));
  const ids = graph.nodes.map((n) => n.id);
  return (
    <div className="space-y-4">
      <PlayerControls player={player} speed={speed} onSpeed={setSpeed}>
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
          <label className="block text-sm"><span className="label">Start node</span>
            <select className="input" value={start} onChange={(e) => setStart(e.target.value)}>{ids.map((id) => <option key={id}>{id}</option>)}</select>
          </label>
          <label className="block text-sm"><span className="label">Destination</span>
            <select className="input" value={end} onChange={(e) => setEnd(e.target.value)}>
              <option value="">{viz.needsEnd ? 'None (all nodes)' : 'None (visit everything)'}</option>
              {ids.filter((id) => id !== start).map((id) => <option key={id}>{id}</option>)}
            </select>
          </label>
          {viz.weighted && (
            <div className="flex items-end"><button className="btn-secondary" onClick={() => setGraph(makeGraph(true))}>Randomize weights</button></div>
          )}
        </div>
      </PlayerControls>
      <div className="card"><GraphView graph={graph} step={player.step} start={start} end={end} weighted={!!viz.weighted} /></div>
      <InfoPanels meta={meta} metaError={metaError} step={player.step} labels={viz.statLabels} />
    </div>
  );
}

export default function VisualizerPage() {
  const { slug } = useParams();
  const viz = VISUALIZERS[slug];
  // Metadata (pseudocode, complexity, name) comes from the backend; the animation itself runs locally.
  const { data: meta, error: metaError } = useFetch(() => algorithmsApi.get(slug), [slug]);

  if (!viz) {
    return (
      <EmptyState title="No visualizer for this algorithm yet" action={<Link to="/visualizer" className="btn-primary">See available visualizers</Link>}>
        You can still read its explanation on the algorithm page.
      </EmptyState>
    );
  }
  const Runner = { sort: SortRunner, search: SearchRunner, graph: GraphRunner }[viz.type];
  return (
    <div className="space-y-4">
      <div>
        <Link to="/visualizer" className="text-sm text-indigo-700 hover:underline">← All visualizers</Link>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{meta?.name || slug}</h1>
          {meta && <Link to={`/algorithms/${slug}`} className="btn-secondary">Read the explanation</Link>}
        </div>
      </div>
      <Runner key={slug} viz={viz} meta={meta} metaError={metaError} />
    </div>
  );
}
