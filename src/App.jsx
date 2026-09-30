import { createContext, lazy, Suspense, useContext, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from './components/LanguageContext'
import AdminSkeleton from './components/AdminSkeleton'
import DirectoryPageSkeleton from './components/DirectoryPageSkeleton'
import LoginSkeleton from './components/LoginSkeleton'
import NotfoundSkeleton from './components/NotfoundSkeleton'
import PageSkeleton from './components/PageSkeleton'
import ProfileSkeleton from './components/ProfileSkeleton'

const Admin = lazy(() => import('./pages/Admin'))
const Courses = lazy(() => import('./pages/Courses'))
const Groups = lazy(() => import('./pages/Groups'))
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Notfound = lazy(() => import('./pages/Notfound'))
const Parents = lazy(() => import('./pages/Parents'))
const Profil = lazy(() => import('./pages/Profil'))
const Students = lazy(() => import('./pages/Students'))
const Teachers = lazy(() => import('./pages/Teachers'))
const Users = lazy(() => import('./pages/Users'))
export const AuthContext = createContext(null)

const withSkeleton = (page, skeleton) => <Suspense fallback={skeleton}>{page}</Suspense>

function Protected() {
  const { user } = useContext(AuthContext)
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })
  const login = (data, token) => {
    setUser(data)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(data))
    localStorage.removeItem('schoolData')
    localStorage.removeItem('schoolUsers')
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('schoolData')
    localStorage.removeItem('schoolUsers')
  }
  useEffect(() => {
    document.body.classList.toggle('dark', localStorage.getItem('theme') === 'dark')
    localStorage.removeItem('schoolData')
    localStorage.removeItem('schoolUsers')
  }, [])
  return <LanguageProvider><AuthContext.Provider value={{ user, login, logout }}><BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : withSkeleton(<Login />, <LoginSkeleton />)} />
        <Route element={<Protected />}>
          <Route element={withSkeleton(<Admin />, <AdminSkeleton />)}>
            <Route index element={withSkeleton(<Home />, <PageSkeleton dashboard />)} />
            <Route path="students" element={withSkeleton(<Students />, <DirectoryPageSkeleton collection="students" />)} />
            <Route path="parents" element={withSkeleton(<Parents />, <DirectoryPageSkeleton collection="parents" />)} />
            <Route path="teachers" element={withSkeleton(<Teachers />, <DirectoryPageSkeleton collection="teachers" />)} />
            <Route path="users" element={withSkeleton(<Users />, <DirectoryPageSkeleton collection="users" />)} />
            <Route path="courses" element={withSkeleton(<Courses />, <DirectoryPageSkeleton collection="courses" />)} />
            <Route path="groups" element={withSkeleton(<Groups />, <DirectoryPageSkeleton collection="groups" />)} />
            <Route path="profile" element={withSkeleton(<Profil />, <ProfileSkeleton />)} />
          </Route>
          <Route path="*" element={withSkeleton(<Notfound />, <NotfoundSkeleton />)} />
        </Route>
        <Route path="*" element={withSkeleton(<Notfound />, <NotfoundSkeleton />)} />
      </Routes>
  </BrowserRouter></AuthContext.Provider></LanguageProvider>
}
