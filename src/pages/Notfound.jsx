import { Link, useParams } from 'react-router-dom'

export default function Notfound() {
  const { ['*']: missingPath = '' } = useParams()
  return (
    <main className="not-found-page grid min-h-screen place-items-center px-4 py-8">
      <div className="not-found-card relative w-full max-w-xl overflow-hidden rounded-3xl border bg-white px-6 py-12 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:px-10 sm:py-14">
        <span className="not-found-code absolute right-5 top-4 text-xl font-extrabold text-slate-200 dark:text-slate-700">404</span>
        <span className="not-found-icon mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-indigo-50 text-4xl text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300" aria-hidden="true">⌕</span>
        <p className="not-found-eyebrow mb-2 text-xs font-extrabold tracking-[.16em] text-indigo-600 dark:text-indigo-300">SAHIFA TOPILMADI</p>
        <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">Bu manzil mavjud emas</h2>
        <p className="not-found-copy mx-auto mb-7 max-w-md break-words text-sm leading-7 text-slate-500 dark:text-slate-400">“/{missingPath}” manzilidagi sahifani topa olmadik. Manzilni tekshiring yoki bosh sahifaga qayting.</p>
        <Link className="not-found-home inline-flex items-center gap-3 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-700" to="/">Bosh sahifaga qaytish <span aria-hidden="true">→</span></Link>
      </div>
    </main>
  )
}
