import DirectorySkeleton from './DirectorySkeleton'

const pages = {
  students: { title: 7, columns: 13 },
  parents: { title: 6, columns: 8 },
  teachers: { title: 5, columns: 7 },
  users: { title: 7, columns: 7 },
  courses: { title: 6, columns: 10 },
  groups: { title: 6, columns: 13 },
}

export default function DirectoryPageSkeleton({ collection }) {
  const page = pages[collection] || { title: 5, columns: 6 }
  return (
    <main className="animate-pulse space-y-6" role="status" aria-label="Ro‘yxat sahifasi yuklanmoqda" aria-busy="true">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-3 w-36 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-72 max-w-full rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-11 w-36 shrink-0 rounded-xl bg-indigo-100 dark:bg-indigo-950" />
      </header>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-700">
          <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-56 max-w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
        <DirectorySkeleton columns={page.columns} />
      </section>
      <span className="sr-only">Sahifa yuklanmoqda…</span>
    </main>
  )
}
