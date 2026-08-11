export default function JobsLoading() {
  return (
    <div className="min-h-screen bg-[#05080f]" role="status" aria-live="polite">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <div className="mb-10 h-40 animate-pulse rounded-2xl bg-white/5" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading jobs</span>
    </div>
  );
}
