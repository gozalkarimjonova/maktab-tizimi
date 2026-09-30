import { useContext, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AuthContext } from '../App'
import { api } from '../api'

const collections=['students','parents','teachers','users','courses','groups']
const nav=[
 {to:'/',icon:'⌂',label:'Bosh sahifa'},
 {to:'/students',icon:'♧',label:'O‘quvchilar',key:'students'},
 {to:'/parents',icon:'♙',label:'Ota-onalar',key:'parents'},
 {to:'/teachers',icon:'✦',label:'O‘qituvchilar',key:'teachers'},
 {to:'/users',icon:'♙',label:'Foydalanuvchilar',key:'users'},
 {to:'/courses',icon:'▤',label:'Kurslar',key:'courses'},
 {to:'/groups',icon:'▦',label:'Guruhlar',key:'groups'},
 {to:'/profile',icon:'♙',label:'Profil'},
]
const emptyData=()=>Object.fromEntries(collections.map(name=>[name,[]]))

function AccountModal({user,onClose,onLogout}){
 if(!user)return null
 const details=[['Ism familiya',user.name],['Email',user.email],['Telefon',user.phone],['Lavozim',user.role],['Holati',user.status]]
 return <div className="modal-backdrop account-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onClose()}><section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-title"><header className="account-modal-head"><div><span>HISOB</span><h2 id="account-title">Hisob menyusi</h2></div><button className="account-close" onClick={onClose} aria-label="Yopish">×</button></header><button className="profile-entry" onClick={()=>document.getElementById('account-profile')?.scrollIntoView({behavior:'smooth',block:'nearest'})}><span className="profile-entry-icon">♙</span><span>Profilim</span><small>{user.name}</small></button><div className="account-profile" id="account-profile"><div className="account-profile-top"><div className="account-avatar">{user.avatar||user.name?.split(/\s+/).map(part=>part[0]).join('').slice(0,2)}</div><div><b>{user.name}</b><span>{user.email||'Email kiritilmagan'}</span></div></div><div className="account-details">{details.filter(([,value])=>value).map(([label,value])=><div className="account-detail" key={label}><span>{label}</span><b>{value}</b></div>)}</div></div><footer className="account-modal-foot"><button onClick={onLogout}><span>⇥</span>Hisobdan chiqish</button></footer></section></div>
}

function LogoutConfirm({onCancel,onConfirm}){
 return <div className="modal-backdrop logout-backdrop" onMouseDown={event=>event.target===event.currentTarget&&onCancel()}><section className="logout-modal" role="alertdialog" aria-modal="true" aria-labelledby="logout-title"><button className="account-close logout-close" onClick={onCancel} aria-label="Yopish">×</button><div className="logout-symbol">⇥</div><div className="logout-eyebrow">SESSIA YAKUNLANADI</div><h2 id="logout-title">Hisobdan chiqmoqchimisiz?</h2><p>Joriy akkauntdan chiqasiz va login sahifasiga qaytasiz.</p><div className="logout-actions"><button className="logout-cancel" onClick={onCancel}>Bekor qilish</button><button className="logout-confirm-button" onClick={onConfirm}>Ha, hisobdan chiqish <span>→</span></button></div></section></div>
}

export default function Admin(){
 const {user,logout}=useContext(AuthContext)
 const [data,setData]=useState(emptyData)
 const [busy,setBusy]=useState(false)
 const [accountOpen,setAccountOpen]=useState(false)
 const [logoutConfirmOpen,setLogoutConfirmOpen]=useState(false)
 const [theme,setTheme]=useState(()=>localStorage.getItem('theme')==='dark'?'dark':'light')
 const location=useLocation()
 const refresh=async()=>{setBusy(true);try{const entries=await Promise.all(collections.map(async name=>[name,await api.getCollection(name)]));const next={...emptyData(),...Object.fromEntries(entries.map(([name,rows])=>[name,Array.isArray(rows)?rows:[]]))};setData(next)}catch{/* keep the visible data if refresh fails */}finally{setBusy(false)}}
 useEffect(()=>{refresh()},[])
 useEffect(()=>{document.body.classList.toggle('dark',theme==='dark');localStorage.setItem('theme',theme)},[theme])
 useEffect(()=>{const close=event=>event.key==='Escape'&&setAccountOpen(false);window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[])
 const active=nav.find(item=>item.to===location.pathname)
 const askSignOut=()=>{setAccountOpen(false);setLogoutConfirmOpen(true)}
 const signOut=()=>{setLogoutConfirmOpen(false);logout()}
 return <div className="school-shell"><aside className="school-sidebar"><div className="brand"><span className="brand-mark">M</span><span><b>MAKTAB</b><small>Boshqaruv tizimi</small></span></div><div className="side-label">ASOSIY MENYU</div><nav>{nav.map(item=><NavLink key={item.to} to={item.to} end={item.to==='/'} className={({isActive})=>`school-nav ${isActive?'selected':''}`}><span className="nav-icon">{item.icon}</span>{item.label}{item.key&&<em>{data[item.key]?.length||0}</em>}</NavLink>)}</nav><div className="side-bottom"><div className="school-mini"><div className="mini-icon">✦</div><div><b>Maktab paneli</b><small>Ta’lim boshqaruvi</small></div></div><button className="side-user account-trigger" onClick={()=>setAccountOpen(true)} aria-label="Akkaunt menyusini ochish"><div className="avatar">{user?.avatar||user?.name?.[0]}</div><div className="user-meta"><b>{user?.name||'Administrator'}</b><small>{user?.email||'Email kiritilmagan'}</small></div><span className="account-chevron">⌄</span></button></div></aside>
 <main className="school-main"><header className="school-topbar"><div><div className="breadcrumb">Maktab <span>/</span> <b>{active?.label||'Bosh sahifa'}</b></div><h1>{active?.label||'Bosh sahifa'}</h1></div><div className="top-actions"><span className="today-pill">● &nbsp; Tizim faol</span><button className="refresh-btn" onClick={refresh} title="Yangilash">⟳</button><button className="theme-toggle-button" onClick={()=>setTheme(current=>current==='dark'?'light':'dark')} title={theme==='dark'?'Light mode':'Dark mode'} aria-label={theme==='dark'?'Light mode ga o‘tish':'Dark mode ga o‘tish'}><span>{theme==='dark'?'☀':'☾'}</span><small>{theme==='dark'?'Light':'Dark'}</small></button><button className="top-account" onClick={()=>setAccountOpen(true)} aria-label="Akkaunt menyusini ochish"><span className="top-avatar">{user?.avatar||user?.name?.[0]}</span><span className="top-account-copy"><b>{user?.name||'Administrator'}</b><small>{user?.email||'Email kiritilmagan'}</small></span><span className="account-chevron">⌄</span></button></div></header>
 <div className="school-content"><Outlet context={{data,loading:busy,refresh}} /></div></main><AccountModal user={accountOpen?user:null} onClose={()=>setAccountOpen(false)} onLogout={askSignOut}/>{logoutConfirmOpen&&<LogoutConfirm onCancel={()=>setLogoutConfirmOpen(false)} onConfirm={signOut}/>}</div>
}
