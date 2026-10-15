const LEGEND = [
  ['bg-slate-300', 'Unsorted'], ['bg-amber-500', 'Comparing'], ['bg-red-500', 'Swap / write'],
  ['bg-purple-500', 'Marked (min / key)'], ['bg-emerald-500', 'Sorted'],
];

export function Legend({ items }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
      {items.map(([color, label]) => (
        <li key={label} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded-sm ${color}`} />{label}</li>
      ))}
    </ul>
  );
}

export default function SortView({ step }) {
  const { array, active, marked, range, sorted, kind } = step;
  const max = Math.max(...array, 1);
  const sortedSet = new Set(sorted);
  const showValues = array.length <= 20;

  function color(i) {
    if (active.includes(i)) return kind === 'swap' ? 'bg-red-500' : 'bg-amber-500';
    if (marked.includes(i)) return 'bg-purple-500';
    if (sortedSet.has(i)) return 'bg-emerald-500';
    if (range && i >= range[0] && i <= range[1]) return 'bg-indigo-300';
    return 'bg-slate-300';
  }

  return (
    <div className="space-y-3">
      <div className="flex h-64 items-end gap-0.5 rounded-lg bg-slate-100 p-2 sm:gap-1" role="img"
        aria-label={`Array of ${array.length} values: ${array.join(', ')}`}>
        {array.map((v, i) => (
          <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
            {showValues && <span className="mb-0.5 text-[10px] text-slate-600 sm:text-xs">{v}</span>}
            <div className={`w-full rounded-t transition-colors ${color(i)}`} style={{ height: `${(v / max) * 85}%` }} />
          </div>
        ))}
      </div>
      <Legend items={range ? [...LEGEND, ['bg-indigo-300', 'Current sub-array']] : LEGEND} />
    </div>
  );
}
