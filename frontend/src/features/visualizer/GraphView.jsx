import { Legend } from './SortView.jsx';

const sameEdge = (e, u, v) => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u);

export default function GraphView({ graph, step, start, end, weighted }) {
  const pos = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
  const visited = new Set(step.visited);
  const frontier = new Set(step.frontier);

  function nodeStyle(id) {
    if (step.path.includes(id)) return { fill: '#10b981', stroke: '#047857', text: '#fff' };
    if (id === step.current) return { fill: '#f59e0b', stroke: '#b45309', text: '#fff' };
    if (visited.has(id)) return { fill: '#6366f1', stroke: '#4338ca', text: '#fff' };
    if (frontier.has(id)) return { fill: '#bfdbfe', stroke: '#3b82f6', text: '#1e3a8a' };
    return { fill: '#fff', stroke: '#94a3b8', text: '#334155' };
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-slate-100 p-2">
        <svg viewBox="0 0 620 310" className="h-auto w-full" role="img" aria-label="Graph visualization">
          {graph.edges.map((e) => {
            const a = pos[e.from], b = pos[e.to];
            const onPath = step.pathEdges.some((pe) => sameEdge(pe, e.from, e.to));
            const isCurrent = step.edge && sameEdge(step.edge, e.from, e.to);
            return (
              <g key={`${e.from}-${e.to}`}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={onPath ? '#10b981' : isCurrent ? '#f59e0b' : '#cbd5e1'} strokeWidth={onPath || isCurrent ? 5 : 2.5} />
                {weighted && (
                  <g>
                    <rect x={(a.x + b.x) / 2 - 10} y={(a.y + b.y) / 2 - 10} width="20" height="20" rx="4" fill="#fff" stroke="#e2e8f0" />
                    <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 4} textAnchor="middle" fontSize="12" fill="#334155">{e.weight}</text>
                  </g>
                )}
              </g>
            );
          })}
          {graph.nodes.map((n) => {
            const s = nodeStyle(n.id);
            return (
              <g key={n.id}>
                {(n.id === start || n.id === end) && (
                  <circle cx={n.x} cy={n.y} r="27" fill="none" stroke={n.id === start ? '#4f46e5' : '#dc2626'} strokeWidth="2.5" strokeDasharray="4 3" />
                )}
                <circle cx={n.x} cy={n.y} r="20" fill={s.fill} stroke={s.stroke} strokeWidth="2.5" />
                <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="15" fontWeight="600" fill={s.text}>{n.id}</text>
                {step.dist && (
                  <text x={n.x} y={n.y + 42} textAnchor="middle" fontSize="12" fill="#475569">
                    {step.dist[n.id] === Infinity ? '∞' : step.dist[n.id]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <Legend items={[
        ['bg-amber-500', 'Current node / edge'], ['bg-indigo-500', step.dist ? 'Finalized' : 'Visited'],
        ['bg-blue-200', step.dist ? 'Has tentative distance' : 'In queue / stack'], ['bg-emerald-500', 'Result path'],
      ]} />
      <p className="text-xs text-slate-500">Dashed indigo ring = start · dashed red ring = destination.{step.dist ? ' Numbers under nodes are current distances.' : ''}</p>
    </div>
  );
}
