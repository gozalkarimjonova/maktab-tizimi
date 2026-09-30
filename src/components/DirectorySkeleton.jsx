export default function DirectorySkeleton({ columns = 5 }) {
  const count = Math.min(columns, 6)
  return (
    <div className="min-w-[620px] animate-pulse p-4" role="status" aria-label="Ro‘yxat yuklanmoqda" aria-busy="true">
      <div className="mb-5 flex gap-3 border-b border-slate-100 pb-3 dark:border-slate-700">
        {Array.from({ length: count }, (_, index) => <div key={index} className="h-3 flex-1 rounded bg-slate-200 dark:bg-slate-700" />)}
      </div>
      {Array.from({ length: 6 }, (_, row) => (
        <div key={row} className="flex items-center gap-3 border-b border-slate-50 py-4 dark:border-slate-800">
          {Array.from({ length: count }, (_, column) => <div key={column} className={`h-4 rounded bg-slate-100 dark:bg-slate-800 ${column === 0 ? 'w-28' : 'flex-1'}`} />)}
        </div>
      ))}
      <span className="sr-only">Ma’lumotlar yuklanmoqda…</span>
    </div>
  )
}
