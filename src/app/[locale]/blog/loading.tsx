export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[#05080f]" role="status" aria-live="polite">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-24">
        <div className="mb-8 h-10 w-48 animate-pulse rounded bg-white/5" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading blog</span>
    </div>
  );
}