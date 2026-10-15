import { Legend } from './SortView.jsx';

export default function SearchView({ step }) {
  const { array, low, high, mid, found } = step;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 rounded-lg bg-slate-100 p-3" role="img" aria-label="Sorted array being searched">
        {array.map((v, i) => {
          const inRange = i >= low && i <= high;
          let cls = inRange ? 'border-indigo-400 bg-white' : 'border-slate-200 bg-slate-200 text-slate-400';
          if (i === mid) cls = 'border-amber-500 bg-amber-200 font-bold';
          if (i === found) cls = 'border-emerald-600 bg-emerald-300 font-bold';
          return (
            <div key={i} className="flex flex-col items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded border-2 text-sm sm:h-11 sm:w-11 ${cls}`}>{v}</div>
              <span className="mt-0.5 text-[10px] text-slate-500">{i}</span>
              <span className="h-4 text-[10px] font-semibold text-indigo-700">
                {[i === low && inRange ? 'L' : '', i === mid ? 'M' : '', i === high && inRange ? 'H' : ''].filter(Boolean).join('·')}
              </span>
            </div>
          );
        })}
      </div>
      <Legend items={[['bg-white border border-indigo-400', 'Search range'], ['bg-slate-200', 'Discarded'], ['bg-amber-300', 'Middle (M)'], ['bg-emerald-300', 'Found']]} />
    </div>
  );
}
