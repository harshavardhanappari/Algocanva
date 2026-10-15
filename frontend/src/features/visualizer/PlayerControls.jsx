export default function PlayerControls({ player, speed, onSpeed, children }) {
  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {player.playing
          ? <button className="btn-primary" onClick={player.pause}>⏸ Pause</button>
          : <button className="btn-primary" onClick={player.play}>{player.atEnd && player.index > 0 ? '↻ Replay' : '▶ Start'}</button>}
        <button className="btn-secondary" onClick={player.prev} disabled={player.index === 0} aria-label="Previous step">◀ Step</button>
        <button className="btn-secondary" onClick={player.next} disabled={player.atEnd} aria-label="Next step">Step ▶</button>
        <button className="btn-secondary" onClick={player.reset}>Reset</button>
        <span className="ml-auto text-sm text-slate-500">Step {player.index + 1} / {player.total}</span>
      </div>
      <input type="range" className="w-full accent-indigo-600" min={0} max={player.total - 1} value={player.index}
        onChange={(e) => player.seek(Number(e.target.value))} aria-label="Seek through steps" />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="label">Animation speed</span>
          <input type="range" className="w-full accent-indigo-600" min={1} max={10} value={speed} onChange={(e) => onSpeed(Number(e.target.value))} />
        </label>
        {children}
      </div>
    </div>
  );
}
