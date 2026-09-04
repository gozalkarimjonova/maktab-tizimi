import { useContext, useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AuthContext } from '../App'
import { useLang } from './LanguageContext'
import { api } from '../api'

export default function Layout({ children, navItems, title, teacherCoins }) {
    const { user, logout } = useContext(AuthContext)
    const { lang, switchLang, t } = useLang()
    const location = useLocation()
    const [dark, setDark] = useState(localStorage.getItem('dark') === 'true')
    const [sidebarCoins, setSidebarCoins] = useState(0)

    useEffect(() => {
        if (user?.role === 'oqituvchi') {
            api.getTeacherAllocation().then(d => { if (d) setSidebarCoins(d.remaining) })
        } else {
            setSidebarCoins(user?.coins || 0)
        }
    }, [user])

    const toggleDark = () => {
        const newDark = !dark
        setDark(newDark)
        localStorage.setItem('dark', newDark)
        document.body.classList.toggle('dark', newDark)
    }

    const pathToPage = (pathname) => {
        const segment = pathname.split('/').filter(Boolean).pop() || 'dashboard'
        return segment
    }
    const currentPage = pathToPage(location.pathname)

    return (
        <div className={`layout ${dark ? 'dark' : ''}`}>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="school-logo">
                        <i className="fas fa-graduation-cap"></i>
                        <h3>{t('schoolName')}</h3>
                    </div>
                    <div className="school-role">{user?.role}</div>
                </div>
                <ul className="nav-menu">
                    {navItems.map(item => (
                        (item.section || item.sectionKey) ? (
                            <li key={item.sectionKey || item.section} className="nav-section-label">{t(item.sectionKey) || item.section}</li>
                        ) : (
                            <li key={item.id}>
                                <NavLink
                                    to={`/${item.id}`}
                                    className={({ isActive }) => currentPage === item.id ? 'active' : ''}
                                >
                                    <i className={`fas ${item.icon}`}></i>
                                    <span>{t(item.labelKey) || item.label}</span>
                                </NavLink>
                            </li>
                        )
                    ))}
                </ul>
                <div className="sidebar-footer">
                    <div className="coin-display">
                        <i className="fas fa-coins"></i>
                        <span className="coin-count">{teacherCoins !== undefined ? teacherCoins : sidebarCoins}</span> {t('coins')}
                    </div>
                </div>
            </aside>
            <main className="main-content">
                <div className="top-bar">
                    <div className="top-bar-left">
                        <h1>{(() => {
                            const found = navItems.find(i => i.id === currentPage)
                            if (found?.labelKey) return t(found.labelKey)
                            return found?.label || title
                        })()}</h1>
                    </div>
                    <div className="top-bar-right">
                        <div className="lang-selector">
                            {['uz','ru','en'].map(l => (
                                <button key={l} className={`lang-btn ${lang===l?'active':''}`} onClick={() => switchLang(l)}>
                                    {l.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <div className="theme-toggle" onClick={toggleDark}>
                            <i className={`fas fa-${dark?'moon':'sun'}`} style={{color: dark?'#ffc107':'#ff9800'}}></i>
                            <div className={`toggle-track ${dark?'active':''}`}><div className="toggle-thumb"></div></div>
                        </div>
                        <div className="user-chip">
                            <div className="user-avatar">{user?.avatar}</div>
                            <div>
                                <div className="user-name">{user?.name}</div>
                                <div className="user-role-tag">{user?.role}</div>
                            </div>
                        </div>
                        <button className="logout-btn" onClick={logout}>
                            <i className="fas fa-sign-out-alt"></i> {t('logout')}
                        </button>
                    </div>
                </div>
                <div className="page-content">
                    {typeof children === 'function' ? children({ currentPage }) : children}
                </div>
            </main>
        </div>
    )
}
