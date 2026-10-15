import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { notesApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { addToast } from '../features/toasts/toastSlice.js';
import { NOTE_TOPICS, formatDate } from '../utils/format.js';
import {
  Badge, CardSkeletons, ConfirmDialog, DemoNotice, EmptyState, ErrorState, PageHeader, Pagination, SearchInput, Select,
} from '../components/UI.jsx';
import CodeBlock from '../components/CodeBlock.jsx';

const EMPTY = { title: '', topic: 'General', content: '', codeSnippet: '', complexity: '' };

function NoteForm({ initial, onSaved, onCancel }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.trim().length > 120) e.title = 'Title must be 120 characters or fewer';
    if (!form.content.trim()) e.content = 'Content is required';
    else if (form.content.length > 10000) e.content = 'Content is too long (max 10,000 characters)';
    if (form.complexity.length > 200) e.complexity = 'Keep complexity under 200 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const payload = { title: form.title, topic: form.topic, content: form.content, codeSnippet: form.codeSnippet, complexity: form.complexity };
    try {
      const { data } = initial ? await notesApi.update(initial._id, payload) : await notesApi.create(payload);
      dispatch(addToast(initial ? 'Note updated' : 'Note created'));
      onSaved(data);
    } catch (err) {
      dispatch(addToast(err.details ? `${err.message}: ${err.details.join('; ')}` : err.message, 'error'));
    } finally {
      setBusy(false);
    }
  }

  const err = (k) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>;
  return (
    <form onSubmit={submit} className="card space-y-4" noValidate>
      <h2 className="text-lg font-semibold">{initial ? 'Edit note' : 'New note'}</h2>
      <div>
        <label className="label" htmlFor="n-title">Title</label>
        <input id="n-title" className="input" value={form.title} onChange={set('title')} maxLength={130} />
        {err('title')}
      </div>
      <div>
        <label className="label" htmlFor="n-topic">Topic</label>
        <select id="n-topic" className="input" value={form.topic} onChange={set('topic')}>
          {NOTE_TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="n-content">Content</label>
        <textarea id="n-content" className="input min-h-32" value={form.content} onChange={set('content')} />
        {err('content')}
      </div>
      <div>
        <label className="label" htmlFor="n-code">Code snippet <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea id="n-code" className="input min-h-24 font-mono" value={form.codeSnippet} onChange={set('codeSnippet')} />
      </div>
      <div>
        <label className="label" htmlFor="n-cx">Complexity <span className="font-normal text-slate-400">(optional)</span></label>
        <input id="n-cx" className="input" value={form.complexity} onChange={set('complexity')} placeholder="e.g. O(n log n) time, O(n) space" />
        {err('complexity')}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save note'}</button>
      </div>
    </form>
  );
}

function NoteCard({ note, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <button className="text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
          <h3 className="font-semibold text-slate-900">{note.title}</h3>
          <div className="mt-1"><Badge>{note.topic}</Badge></div>
        </button>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => onEdit(note)}>Edit</button>
          <button className="btn-secondary text-red-700" onClick={() => onDelete(note)}>Delete</button>
        </div>
      </div>
      {open ? (
        <div className="mt-3 space-y-3">
          <p className="whitespace-pre-line text-sm text-slate-700">{note.content}</p>
          {note.complexity && <p className="text-sm"><strong>Complexity:</strong> <span className="font-mono">{note.complexity}</span></p>}
          {note.codeSnippet && <CodeBlock code={note.codeSnippet} />}
        </div>
      ) : (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{note.content}</p>
      )}
      <p className="mt-3 text-xs text-slate-400">Created {formatDate(note.createdAt)} · Updated {formatDate(note.updatedAt)}</p>
    </div>
  );
}

export default function Notes() {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | 'new' | note
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debounced = useDebounce(search);

  const { data, meta, loading, error, reload } = useFetch(
    () => notesApi.list({ search: debounced, topic, page, limit: 8 }),
    [debounced, topic, page]
  );

  async function confirmDelete() {
    setDeleting(true);
    try {
      await notesApi.remove(toDelete._id);
      dispatch(addToast('Note deleted'));
      setToDelete(null);
      if (data.length === 1 && page > 1) setPage(page - 1); else reload();
    } catch (err) {
      dispatch(addToast(err.message, 'error'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Study notes" subtitle="Write down what you learn." actions={<button className="btn-primary" onClick={() => setEditing('new')}>+ New note</button>} />
      <div className="mb-6"><DemoNotice /></div>

      {editing && (
        <div className="mb-6">
          <NoteForm
            initial={editing === 'new' ? null : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => { setEditing(null); reload(); }}
          />
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search notes" />
        <Select value={topic} onChange={(v) => { setTopic(v); setPage(1); }} options={NOTE_TOPICS} allLabel="All topics" label="Topic" />
      </div>

      {loading && !data && <CardSkeletons count={3} />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && data.length === 0 && (
        <EmptyState title={debounced || topic ? 'No notes match' : 'No notes yet'}
          action={!debounced && !topic && <button className="btn-primary" onClick={() => setEditing('new')}>Write your first note</button>}>
          {debounced || topic ? 'Try another search or topic.' : 'Notes you write here are saved to the shared demo database.'}
        </EmptyState>
      )}
      {data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((n) => <NoteCard key={n._id} note={n} onEdit={setEditing} onDelete={setToDelete} />)}
        </div>
      )}
      <Pagination meta={meta} onPage={setPage} />

      <ConfirmDialog open={!!toDelete} title="Delete this note?" busy={deleting}
        message={toDelete ? `"${toDelete.title}" will be permanently deleted.` : ''}
        onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </>
  );
}
