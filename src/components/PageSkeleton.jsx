export default function PageSkeleton({ dashboard = false }) {
  return (
    <main className="mx-auto max-w-6xl animate-pulse space-y-6" role="status" aria-label="Sahifa yuklanmoqda" aria-busy="true">
      <header className="space-y-3">
        <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-8 w-64 max-w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-100 dark:bg-slate-800" />
      </header>
      {dashboard ? (
        <>
          <div className="h-36 rounded-3xl bg-indigo-100 dark:bg-slate-800 sm:h-44" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map(item => <div key={item} className="h-36 rounded-2xl border border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-900" />)}
          </div>
          <div className="h-64 rounded-3xl border border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-900" />
        </>
      ) : (
        <div className="h-96 rounded-3xl border border-slate-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-6 h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
          {Array.from({ length: 7 }, (_, item) => <div key={item} className="mb-4 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/70" />)}
        </div>
      )}
      <span className="sr-only">Sahifa yuklanmoqda…</span>
    </main>
  )
}
