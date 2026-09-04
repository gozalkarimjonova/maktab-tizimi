import { useState, useContext } from 'react'
import { AuthContext } from '../App'
import { useLang } from '../components/LanguageContext'
import { api } from '../api'

export default function Login() {
    const { login } = useContext(AuthContext)
    const { t, lang, switchLang } = useLang()
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await api.login(phone, password)
            if (res.error) setError(res.error)
            else login(res.user, res.token)
        } catch (err) {
            setError(t('error') + '!')
        }
        setLoading(false)
    }

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="login-left-content">
                    <div className="logo-box"><i className="fas fa-graduation-cap"></i></div>
                    <h1>{t('schoolName')} {t('navDashboard')}</h1>
                    <p className="login-desc">CRM, guruhlar, davomat, uy vazifasi va to'lovlar — chiroyli bog'langan.</p>
                    <ul className="feature-list">
                        <li><div className="feature-icon"><i className="fas fa-users"></i></div><span>{t('navGroups')}, {t('attendanceTitle').toLowerCase()} va {t('dashAvgGrade').toLowerCase()}</span></li>
                        <li><div className="feature-icon"><i className="fas fa-coins"></i></div><span>{t('coins')}, {t('navShop').toLowerCase()} va mukofotlar</span></li>
                        <li><div className="feature-icon"><i className="fas fa-clipboard-check"></i></div><span>{t('navTests')}, {t('navResults')} va {t('navGrades')}</span></li>
                        <li><div className="feature-icon"><i className="fas fa-wallet"></i></div><span>{t('monthlyPayments')} va hisobotlar</span></li>
                    </ul>
                </div>
            </div>
            <div className="login-right" style={{position:'relative'}}>
                <div className="lang-selector" style={{position:'absolute',top:20,right:20,zIndex:10}}>
                    {['uz','ru','en'].map(l => (
                        <button key={l} className={`lang-btn ${lang===l?'active':''}`} onClick={() => switchLang(l)}>
                            {l.toUpperCase()}
                        </button>
                    ))}
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>{t('loginTitle')}</h2>
                    <p className="subtitle">{t('loginSubtitle')}</p>
                    <div className="form-group">
                        <label>{t('loginPhone')}</label>
                        <div className="input-wrapper">
                            <i className="fas fa-phone input-icon"></i>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998 (90) 123-45-67" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t('loginPassword')}</label>
                        <div className="input-wrapper">
                            <i className="fas fa-lock input-icon"></i>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                        </div>
                    </div>
                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? '...' : <>{t('loginBtn')} <i className="fas fa-arrow-right"></i></>}
                    </button>
                    {error && <p className="error-msg" style={{display:'flex'}}><i className="fas fa-exclamation-circle"></i> {error}</p>}
                </form>
            </div>
        </div>
    )
}
