import { useOutletContext } from 'react-router-dom'
import PageSkeleton from '../components/PageSkeleton'

const personName=row=>[row.name,row.surname].filter(Boolean).join(' ')
export default function Home(){
 const {data,loading}=useOutletContext()
 if(loading) return <PageSkeleton dashboard />
 const students=data.students||[],teachers=data.teachers||[],parents=data.parents||[],courses=data.courses||[],groups=data.groups||[]
 const average=students.length?(students.reduce((sum,row)=>sum+Number(row.averageScore||0),0)/students.length).toFixed(1):'—'
 const stats=[
  {label:'O‘quvchilar',value:students.length,icon:'♧',color:'violet',note:'Jami ro‘yxatda'},
  {label:'O‘qituvchilar',value:teachers.length,icon:'✦',color:'blue',note:'Ta’lim jamoasi'},
  {label:'Ota-onalar',value:parents.length,icon:'♙',color:'orange',note:'Bog‘langan ota-onalar'},
  {label:'O‘rtacha reyting',value:average,icon:'★',color:'green',note:'Baho / 5'},
 ]
 const topStudents=[...students].sort((a,b)=>Number(b.averageScore||0)-Number(a.averageScore||0)).slice(0,5)
 return <><div className="welcome-banner"><div><div className="eyebrow light">MAKTAB TA’LIM TIZIMI</div><h2>Assalomu alaykum! 👋</h2><p>O‘quvchilar, ota-onalar, o‘qituvchilar, kurslar va guruhlarni bitta panelda boshqaring.</p></div><div className="banner-art"><div className="banner-orbit orbit-one"></div><div className="banner-orbit orbit-two"></div><div className="banner-cap">✦</div></div></div>
 <div className="section-heading"><div><h2>Umumiy ko‘rsatkichlar</h2><p>data.json API kolleksiyalaridan olingan ma’lumot</p></div><span className="live-indicator">● &nbsp; {loading?'Yuklanmoqda':'Jonli ma’lumot'}</span></div>
 <div className="overview-grid">{stats.map(stat=><article className="overview-card" key={stat.label}><div className={`overview-icon ${stat.color}`}>{stat.icon}</div><div className="overview-label">{stat.label}</div><div className="overview-value">{loading?'…':stat.value}</div><div className="overview-note"><i>↗</i> {stat.note}</div></article>)}</div>
 <div className="home-summary-grid"><section className="directory-card rating-card"><div className="directory-head"><div><h3>O‘quvchilar reytingi</h3><p>O‘rtacha baho bo‘yicha yuqori natijalar</p></div><span className="rating-badge">★ Reyting</span></div>{topStudents.length?<div className="rating-list">{topStudents.map((student,index)=>{const score=Number(student.averageScore||0);return <div className="rating-row" key={student.id}><span className={`rank rank-${index+1}`}>{String(index+1).padStart(2,'0')}</span><div className="person-avatar">{personName(student).split(/\s+/).map(part=>part[0]).join('').slice(0,2)}</div><div className="rating-person"><b>{personName(student)}</b><small>{student.class||'Sinf belgilanmagan'}</small></div><div className="rating-track"><span style={{width:`${Math.min(100,Math.max(4,score*20))}%`}}/></div><b className="rating-score">{score.toFixed(1)} / 5</b></div>})}</div>:<div className="empty-rating">O‘quvchilar topilmadi.</div>}</section>
 <section className="directory-card mini-stats-card"><div className="directory-head"><div><h3>Boshqa kolleksiyalar</h3><p>API’dagi qolgan ro‘yxatlar</p></div></div><div className="mini-stat-line"><span>Kurslar</span><b>{loading?'…':courses.length}</b></div><div className="mini-stat-line"><span>Guruhlar</span><b>{loading?'…':groups.length}</b></div><div className="mini-stat-line"><span>Foydalanuvchilar</span><b>{loading?'…':(data.users||[]).length}</b></div></section></div>
 </>
}
