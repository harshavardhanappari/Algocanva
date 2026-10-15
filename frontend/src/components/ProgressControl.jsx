import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { progressApi } from '../services/resources.js';
import { addToast } from '../features/toasts/toastSlice.js';
import { STATUS_LABELS } from '../utils/format.js';

// Lets the visitor set not started / in progress / completed for one item.
export default function ProgressControl({ itemType, itemId }) {
  const dispatch = useDispatch();
  const [record, setRecord] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    progressApi.list({ itemType, limit: 200 })
      .then(({ data }) => alive && setRecord(data.find((p) => p.itemId === itemId) || null))
      .catch(() => {});
    return () => { alive = false; };
  }, [itemType, itemId]);

  async function change(status) {
    setBusy(true);
    try {
      let saved;
      if (record) saved = (await progressApi.update(record._id, status)).data;
      else saved = (await progressApi.create(itemType, itemId, status)).data;
      setRecord(saved);
      dispatch(addToast(`Marked as ${STATUS_LABELS[status].toLowerCase()}`));
    } catch (err) {
      dispatch(addToast(err.message, 'error'));
    } finally {
      setBusy(false);
    }
  }

  const current = record?.status || 'not_started';
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium text-slate-700">Status</span>
      <select className="input !w-auto" value={current} disabled={busy} onChange={(e) => change(e.target.value)}>
        {Object.entries(STATUS_LABELS).map(([value, text]) => (
          <option key={value} value={value} disabled={value === 'not_started' && current === 'completed'}>{text}</option>
        ))}
      </select>
    </label>
  );
}
