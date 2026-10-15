import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { algorithmsApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { CATEGORIES, DIFFICULTIES } from '../utils/format.js';
import { CardSkeletons, EmptyState, ErrorState, PageHeader, Pagination, SearchInput, Select } from '../components/UI.jsx';
import { AlgorithmCard } from '../components/Cards.jsx';

export default function Algorithms() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search);
  const category = params.get('category') || '';
  const difficulty = params.get('difficulty') || '';
  const page = Number(params.get('page') || 1);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const { data, meta, loading, error, reload } = useFetch(
    () => algorithmsApi.list({ category, difficulty, search: debounced, page, limit: 9 }),
    [category, difficulty, debounced, page]
  );

  return (
    <>
      <PageHeader title="Algorithm library" subtitle="Explanations, pseudocode and complexity for the algorithms every programmer should know." />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search algorithms" />
        <Select value={category} onChange={(v) => setParam('category', v)} options={CATEGORIES} allLabel="All categories" label="Category" />
        <Select value={difficulty} onChange={(v) => setParam('difficulty', v)} options={DIFFICULTIES} allLabel="All difficulties" label="Difficulty" />
      </div>
      {loading && !data && <CardSkeletons />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No algorithms match">Try a different search or clear the filters.</EmptyState>}
      {data && data.length > 0 && (
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
          {data.map((a) => <AlgorithmCard key={a._id} algo={a} />)}
        </div>
      )}
      <Pagination meta={meta} onPage={(p) => setParam('page', String(p))} />
    </>
  );
}
