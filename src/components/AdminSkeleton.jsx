export default function AdminSkeleton() {
  return (
    <div className="flex min-h-screen animate-pulse bg-slate-50 dark:bg-slate-950" role="status" aria-label="Boshqaruv paneli yuklanmoqda" aria-busy="true">
      <aside className="hidden w-64 shrink-0 flex-col gap-5 bg-slate-900 p-5 md:flex">
        <div className="h-12 rounded-xl bg-white/10" />
        <div className="mt-5 h-3 w-28 rounded bg-white/10" />
        {[0, 1, 2, 3, 4, 5, 6].map(item => <div key={item} className="h-10 rounded-xl bg-white/10" />)}
      </aside>
      <main className="flex-1 p-5 sm:p-8">
        <header className="mb-8 flex justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
          <div className="space-y-2"><div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" /><div className="h-7 w-48 rounded bg-slate-200 dark:bg-slate-700" /></div>
          <div className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </header>
        <div className="h-8 w-56 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-6 h-96 rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" />
      </main>
      <span className="sr-only">Boshqaruv paneli yuklanmoqda…</span>
    </div>
  )
}
