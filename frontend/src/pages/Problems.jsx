import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { problemsApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { DIFFICULTIES } from '../utils/format.js';
import { CardSkeletons, EmptyState, ErrorState, PageHeader, Pagination, SearchInput, Select } from '../components/UI.jsx';
import { ProblemCard } from '../components/Cards.jsx';

const TOPICS = ['Arrays', 'Strings', 'Math', 'Stacks', 'Two Pointers', 'Binary Search', 'Sorting', 'Heaps', 'Graphs', 'BFS', 'DFS', 'Dynamic Programming'];

export default function Problems() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const difficulty = params.get('difficulty') || '';
  const topic = params.get('topic') || '';
  const page = Number(params.get('page') || 1);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const { data, meta, loading, error, reload } = useFetch(
    () => problemsApi.list({ difficulty, topic, search: debounced, page, limit: 9 }),
    [difficulty, topic, debounced, page]
  );

  return (
    <>
      <PageHeader title="Practice problems" subtitle="Original problems for studying. Read the statement, think it through, then check the hints and explanation. (There is no code judge in this version.)" />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search problems" />
        <Select value={topic} onChange={(v) => setParam('topic', v)} options={TOPICS} allLabel="All topics" label="Topic" />
        <Select value={difficulty} onChange={(v) => setParam('difficulty', v)} options={DIFFICULTIES} allLabel="All difficulties" label="Difficulty" />
      </div>
      {loading && !data && <CardSkeletons />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No problems match">Try a different search or clear the filters.</EmptyState>}
      {data && data.length > 0 && (
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
          {data.map((p) => <ProblemCard key={p._id} problem={p} />)}
        </div>
      )}
      <Pagination meta={meta} onPage={(p) => setParam('page', String(p))} />
    </>
  );
}
