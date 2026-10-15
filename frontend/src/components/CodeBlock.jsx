export default function CodeBlock({ code, title }) {
  return (
    <figure>
      {title && <figcaption className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</figcaption>}
      <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm leading-relaxed text-slate-100"><code className="font-mono">{code}</code></pre>
    </figure>
  );
}
