export default function LocaleLoading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center bg-[#05080f]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400/30 border-t-teal-300" />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
