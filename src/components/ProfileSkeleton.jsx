export default function ProfileSkeleton() {
  return (
    <main className="mx-auto max-w-5xl animate-pulse space-y-6" aria-label="Profil yuklanmoqda" aria-busy="true">
      <header className="space-y-3">
        <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-72 max-w-full rounded bg-slate-100 dark:bg-slate-800" />
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="h-32 rounded-t-3xl bg-slate-200 dark:bg-slate-700 sm:h-40" />
        <div className="px-5 pb-8 sm:px-8">
          <div className="mt-4 h-24 w-24 rounded-3xl border-4 border-white bg-slate-300 dark:border-slate-900 dark:bg-slate-600 sm:h-28 sm:w-28" />
          <div className="mt-5 h-7 w-64 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-3 h-4 w-28 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-7">
        <div className="mb-6 h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map(item => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-40 max-w-full rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <span className="sr-only">Profil ma’lumotlari yuklanmoqda…</span>
    </main>
  )
}
