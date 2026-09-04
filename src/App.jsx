import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './components/LanguageContext'
import Login from './pages/Login'
import Direktor from './pages/Direktor'
import Oqituvchi from './pages/Oqituvchi'
import Admin from './pages/Admin'
import Oquvchi from './pages/Oquvchi'

export const AuthContext = createContext(null)

function ProtectedRoute({ children }) {
    const { user } = useContext(AuthContext)
    if (!user) return <Navigate to="/login" />
    return children
}

function RoleRouter() {
    const { user } = useContext(AuthContext)
    if (!user) return <Navigate to="/login" />
    
    switch (user.role) {
        case 'direktor': return <Direktor />
        case 'oqituvchi': return <Oqituvchi />
        case 'admin': return <Admin />
        case 'oquvchi': return <Oquvchi />
        default: return <Navigate to="/login" />
    }
}

export default function App() {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))

    useEffect(() => {
        if (token) {
            const saved = localStorage.getItem('user')
            if (saved) setUser(JSON.parse(saved))
        }
    }, [token])

    const login = (userData, tokenStr) => {
        setUser(userData)
        setToken(tokenStr)
        localStorage.setItem('token', tokenStr)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    return (
        <LanguageProvider>
            <AuthContext.Provider value={{ user, token, login, logout }}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                        <Route path="/*" element={
                            <ProtectedRoute>
                                <RoleRouter />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </BrowserRouter>
            </AuthContext.Provider>
        </LanguageProvider>
    )
}
