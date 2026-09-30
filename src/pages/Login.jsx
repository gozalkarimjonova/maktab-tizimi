import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../App'
import { api } from '../api'

export default function Login() {
    const { login } = useContext(AuthContext)
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!error) return
        const timer = setTimeout(() => setError(''), 4000)
        return () => clearTimeout(timer)
    }, [error])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await api.login(phone, password)
            if (res?.error) setError(res.error)
            else login(res.user, res.token)
        } catch (err) {
            setError(err.message || 'Serverga ulanib bo‘lmadi')
        }
        setLoading(false)
    }

    return (
        <div className="login-container">
            <div className="login-left">
                <div className="login-left-content">
                    <div className="logo-box"><i className="fas fa-graduation-cap"></i></div>
                    <h1>Maktab boshqaruv tizimi</h1>
                    <p className="login-desc">Maktabingizdagi o‘quvchilar, o‘qituvchilar va ota-onalar uchun yagona boshqaruv paneli.</p>
                    <ul className="feature-list">
                        <li><div className="feature-icon"><i className="fas fa-users"></i></div><span>O‘quvchilar va sinflar boshqaruvi</span></li>
                        <li><div className="feature-icon"><i className="fas fa-chalkboard-teacher"></i></div><span>O‘qituvchilar jamoasi</span></li>
                        <li><div className="feature-icon"><i className="fas fa-user-friends"></i></div><span>Ota-onalar bilan aloqa</span></li>
                        <li><div className="feature-icon"><i className="fas fa-chart-line"></i></div><span>Reyting va jonli ko‘rsatkichlar</span></li>
                    </ul>
                </div>
            </div>
            <div className="login-right">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Kirish</h2>
                    <p className="subtitle">Maktab boshqaruv tizimiga kiring.</p>
                    <div className="form-group">
                            <label>Telefon raqam</label>
                        <div className="input-wrapper">
                            <i className="fas fa-phone input-icon"></i>
                            <input type="tel" autoComplete="username" value={phone} onChange={e => { setPhone(e.target.value); setError('') }} placeholder="+998 90 123 45 67" required />
                        </div>
                    </div>
                    <div className="form-group">
                            <label>Parol</label>
                        <div className="input-wrapper">
                            <i className="fas fa-lock input-icon"></i>
                            <input type="password" autoComplete="current-password" value={password} onChange={e => { setPassword(e.target.value); setError('') }} placeholder="••••••••" required />
                        </div>
                    </div>
                    <button className="login-btn" type="submit" disabled={loading}>
                        {loading ? '...' : <>Kirish <i className="fas fa-arrow-right"></i></>}
                    </button>
                </form>
            </div>
            {error && <div className="login-toast" role="alert"><i className="fas fa-exclamation-circle"></i><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Yopish">×</button></div>}
        </div>
    )
}
