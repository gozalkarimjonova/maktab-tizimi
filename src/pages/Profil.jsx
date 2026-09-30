import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'
import { api } from '../api'
import ProfileSkeleton from '../components/ProfileSkeleton'

const roleNames = {
  admin: 'Administrator',
  teacher: 'O‘qituvchi',
  oqituvchi: 'O‘qituvchi',
  student: 'O‘quvchi',
  oquvchi: 'O‘quvchi',
  parent: 'Ota-ona',
}

export default function Profil() {
  const { user } = useContext(AuthContext)
  const [profile, setProfile] = useState(user)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    let loadingTimer
    if (!user?.id) {
      setProfile(user)
      setLoading(false)
      return () => { active = false }
    }

    setLoading(true)
    api.getCollection('users')
      .then(rows => {
        if (!active) return
        const record = Array.isArray(rows) && rows.find(item => String(item.id) === String(user.id))
        setProfile(record ? { ...user, ...record } : user)
      })
      .catch(() => { if (active) setProfile(user) })
      .finally(() => {
        const remaining = Math.max(0, 450 - (Date.now() - startedAt))
        loadingTimer = window.setTimeout(() => {
          if (active) setLoading(false)
        }, remaining)
      })

    const startedAt = Date.now()
    return () => {
      active = false
      window.clearTimeout(loadingTimer)
    }
  }, [user])

  if (loading) return <ProfileSkeleton />
  const currentUser = profile || user

  const fullName = [currentUser?.name, currentUser?.surname]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Foydalanuvchi'
  const initials = fullName
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const role = roleNames[currentUser?.role] || currentUser?.role || 'Foydalanuvchi'
  const details = [
    { label: 'To‘liq ism', value: fullName, icon: '♙' },
    { label: 'Lavozim', value: role, icon: '✦' },
    { label: 'Email manzil', value: currentUser?.email, icon: '✉' },
    { label: 'Telefon raqam', value: currentUser?.phone, icon: '☎' },
    { label: 'Sinf yoki guruh', value: currentUser?.className || currentUser?.class || currentUser?.groupName, icon: '▦' },
    { label: 'Manzil', value: currentUser?.address, icon: '⌖' },
    { label: 'Hisob holati', value: currentUser?.status, icon: '●' },
    { label: 'Foydalanuvchi ID', value: currentUser?.id, icon: '#' },
  ].filter(item => item.value !== undefined && item.value !== null && item.value !== '')

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600 dark:text-indigo-300">Shaxsiy kabinet</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Mening profilim</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tizimga kirgan foydalanuvchining akkaunt ma’lumotlari.</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-indigo-300">
          <span aria-hidden="true">←</span> Bosh sahifa
        </Link>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative h-36 overflow-hidden rounded-t-3xl bg-gradient-to-r from-indigo-700 via-violet-600 to-fuchsia-500 sm:h-44">
          <div className="absolute -right-8 -top-24 h-64 w-64 rounded-full border border-white/15" />
          <div className="absolute -right-1 top-[-4.5rem] h-48 w-48 rounded-full border border-white/20" />
          <div className="absolute bottom-5 left-6 text-xs font-bold uppercase tracking-[.2em] text-white/75 sm:left-8">MAKTAB · SHAXSIY KABINET</div>
          <div className="absolute bottom-4 right-8 hidden text-4xl text-white/60 sm:block" aria-hidden="true">✦</div>
        </div>
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-indigo-100 text-2xl font-extrabold text-indigo-700 shadow-md dark:border-slate-900 dark:bg-indigo-950 dark:text-indigo-200 sm:h-28 sm:w-28 sm:text-3xl">
              {currentUser?.avatar || initials}
            </div>
            <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Tizimga kirilgan
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{fullName}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{role}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Akkaunt ma’lumotlari</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kirish paytida aniqlangan foydalanuvchi ma’lumotlari.</p>
        </div>
        {details.length ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            {details.map(({ label, value, icon }) => (
              <div key={label} className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-indigo-900">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-lg text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300" aria-hidden="true">{icon}</span>
                <div className="min-w-0">
                  <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">{String(value)}</dd>
                </div>
              </div>
            ))}
          </dl>
        ) : (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">Profil ma’lumotlari topilmadi.</p>
        )}
      </section>
    </main>
  )
}
