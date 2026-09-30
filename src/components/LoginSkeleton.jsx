export default function LoginSkeleton() {
  return (
    <main className="grid min-h-screen animate-pulse md:grid-cols-2" role="status" aria-label="Kirish sahifasi yuklanmoqda" aria-busy="true">
      <div className="hidden flex-col justify-center gap-6 bg-indigo-800 p-12 md:flex">
        <div className="h-16 w-16 rounded-2xl bg-white/20" />
        <div className="h-10 w-80 max-w-full rounded-lg bg-white/20" />
        <div className="h-4 w-96 max-w-full rounded bg-white/15" />
        <div className="h-4 w-72 max-w-full rounded bg-white/15" />
        <div className="mt-5 h-12 w-64 rounded-xl bg-white/15" />
        <div className="h-12 w-64 rounded-xl bg-white/15" />
      </div>
      <div className="flex items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-900">
          <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-64 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="pt-4"><div className="mb-2 h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" /><div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" /></div>
          <div><div className="mb-2 h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" /><div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" /></div>
          <div className="h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950" />
        </div>
      </div>
      <span className="sr-only">Kirish sahifasi yuklanmoqda…</span>
    </main>
  )
}
