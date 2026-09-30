export default function NotfoundSkeleton() {
  return (
    <main className="grid min-h-screen animate-pulse place-items-center bg-slate-50 p-5 dark:bg-slate-950" role="status" aria-label="404 sahifasi yuklanmoqda" aria-busy="true">
      <section className="w-full max-w-xl space-y-5 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-indigo-100 dark:bg-indigo-950" />
        <div className="mx-auto h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mx-auto h-8 w-64 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mx-auto h-4 w-80 max-w-full rounded bg-slate-100 dark:bg-slate-800" />
        <div className="mx-auto h-11 w-48 rounded-xl bg-indigo-100 dark:bg-indigo-950" />
      </section>
      <span className="sr-only">404 sahifasi yuklanmoqda…</span>
    </main>
  )
}
