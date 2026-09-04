import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import { api } from '../api'
import Layout from '../components/Layout'
import { useLang } from '../components/LanguageContext'
import Modal from '../components/Modal'

export default function Direktor() {
    const { user } = useContext(AuthContext)
    const { t } = useLang()
    const [page, setPage] = useState('dashboard')
    const [users, setUsers] = useState([])
    const [groups, setGroups] = useState([])
    const [attendance, setAttendance] = useState({})
    const [grades, setGrades] = useState([])
    const [payments, setPayments] = useState([])
    const [teacherPayments, setTeacherPayments] = useState([])
    const [coinHistory, setCoinHistory] = useState([])
    const [testResults, setTestResults] = useState([])
    const [modal, setModal] = useState(null)
    const [dark, setDark] = useState(localStorage.getItem('dark') === 'true')
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'uz')
    const [toast, setToast] = useState(null)
    const [attGroup, setAttGroup] = useState('all')
    const [selectedTeacher, setSelectedTeacher] = useState(null)

    const getToday = () => {
        const now = new Date()
        const uzb = new Date(now.getTime() + (5*60*60*1000) - (now.getTimezoneOffset()*60*1000))
        return uzb.toISOString().split('T')[0]
    }
    const today = getToday()
    const currentMonth = today.substring(0, 7)

    const navItems = [
        { id:'dashboard', icon:'fa-chart-pie', labelKey:'navDashboard' },
        { sectionKey:'sectionLessons' },
        { id:'attendance', icon:'fa-clipboard-check', labelKey:'navAttendance' },
        { id:'grades', icon:'fa-star', labelKey:'navGrades' },
        { id:'students', icon:'fa-user-graduate', labelKey:'navStudents' },
        { id:'teachers', icon:'fa-chalkboard-teacher', labelKey:'navTeachers' },
        { id:'groups', icon:'fa-layer-group', labelKey:'navGroups' },
        { sectionKey:'sectionExtra' },
        { id:'testratings', icon:'fa-chart-bar', labelKey:'Test Reytingi' },
        { id:'teacherpayments', icon:'fa-money-check-alt', labelKey:'O\'qituvchi To\'lov' },
        { id:'schedule', icon:'fa-calendar-alt', labelKey:'Dars Jadvali' },
        { sectionKey:'sectionPersonal' },
        { id:'profile', icon:'fa-user-circle', labelKey:'navProfile' },
    ]

    const refreshAll = () => {
        api.getUsers().then(d => d && setUsers(d))
        api.getGroups().then(d => d && setGroups(d))
        api.getGrades().then(d => d && setGrades(d))
        api.getPayments().then(d => d && setPayments(d))
        api.getTeacherPayments().then(d => d && setTeacherPayments(d))
        api.getCoinHistory().then(d => d && setCoinHistory(d))
        api.getTestResults().then(d => d && setTestResults(d))
        api.getAttendance(today).then(d => d && setAttendance(d))
    }

    useEffect(() => { refreshAll() }, [])
    useEffect(() => { document.body.classList.toggle('dark', dark) }, [dark])
    useEffect(() => { localStorage.setItem('lang', lang) }, [lang])

    const showToast = (msg, type='success') => { setToast({msg, type}); setTimeout(() => setToast(null), 3000) }

    const students = users.filter(u => u.role === 'oquvchi')
    const teachers = users.filter(u => u.role === 'oqituvchi')
    const presentCount = Object.values(attendance).filter(v => v === 'present').length

    const markAtt = async (sid, status) => {
        const newAtt = { ...attendance, [sid]: status }
        setAttendance(newAtt)
        await api.saveAttendance(today, newAtt)
    }

    // ==================== RENDER PAGES ====================
    const renderDashboard = () => (
        <div>
            <div className="stats-grid">
                <div className="stat-card purple"><div className="stat-icon"><i className="fas fa-user-graduate"></i></div><div className="stat-value">{students.length}</div><div className="stat-label">O'quvchilar</div></div>
                <div className="stat-card green"><div className="stat-icon"><i className="fas fa-chalkboard-teacher"></i></div><div className="stat-value">{teachers.length}</div><div className="stat-label">O'qituvchilar</div></div>
                <div className="stat-card orange"><div className="stat-icon"><i className="fas fa-layer-group"></i></div><div className="stat-value">{groups.length}</div><div className="stat-label">Guruhlar</div></div>
                <div className="stat-card blue"><div className="stat-icon"><i className="fas fa-clipboard-check"></i></div><div className="stat-value">{presentCount}/{students.length}</div><div className="stat-label">Bugun kelgan</div></div>
                <div className="stat-card red"><div className="stat-icon"><i className="fas fa-star"></i></div><div className="stat-value">{grades.length}</div><div className="stat-label">Jami baholar</div></div>
                <div className="stat-card purple"><div className="stat-icon"><i className="fas fa-file-alt"></i></div><div className="stat-value">{testResults.length}</div><div className="stat-label">Test natijalari</div></div>
            </div>
            {/* O'quvchilar soni va baholari */}
            <div className="card" style={{marginTop:20}}>
                <div className="card-header"><h2><i className="fas fa-user-graduate" style={{color:'#7b68ee'}}></i> O'quvchilar Statistikasi</h2></div>
                <table>
                    <thead><tr><th>#</th><th>O'quvchi</th><th>Sinf</th><th>Guruh</th><th>O'rtacha baho</th><th>Testlar</th><th>Coin</th></tr></thead>
                    <tbody>{students.map((s, idx) => {
                        const g = groups.find(x => x.id === s.groupId)
                        const myGrades = grades.filter(g => g.studentId === s.id)
                        const avg = myGrades.length ? (myGrades.reduce((a,g) => a+g.value, 0) / myGrades.length).toFixed(1) : '-'
                        const myTests = testResults.filter(r => r.studentId === s.id)
                        const testAvg = myTests.length ? Math.round(myTests.reduce((a,r) => a+r.percentage, 0)/myTests.length) : 0
                        return <tr key={s.id}>
                            <td>{idx+1}</td>
                            <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                                <div className="user-avatar" style={{width:32,height:32,fontSize:11}}>{s.avatar}</div>
                                <b>{s.name}</b>
                            </div></td>
                            <td>{s.className||'-'}</td>
                            <td>{g?.name||'-'}</td>
                            <td><span className={`badge badge-${avg>=4?'success':avg>=3?'warning':'danger'}`}>{avg}</span></td>
                            <td><span style={{color:testAvg>=80?'#28a745':testAvg>=60?'#ffc107':'#e74c3c',fontWeight:700}}>{testAvg}%</span></td>
                            <td><span className="badge badge-gold">💰 {s.coins||0}</span></td>
                        </tr>
                    })}</tbody>
                </table>
            </div>
        </div>
    )

    const filteredStudents = attGroup === 'all' ? students : students.filter(s => s.groupId === attGroup)

    const renderAttendance = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-clipboard-check" style={{color:'#7b68ee'}}></i> Kunlik Davomat — {today}</h2>
                <select value={attGroup} onChange={e => setAttGroup(e.target.value)} style={{padding:'8px 12px',border:'2px solid #e0e0e0',borderRadius:8,fontSize:13}}>
                    <option value="all">Barcha guruhlar</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
            </div>
            <div className="att-grid">
                {filteredStudents.map(s => (
                    <div key={s.id} className={`att-card ${attendance[s.id]||''}`}>
                        <div className="att-avatar" style={{background:'#fff3cd',color:'#ffc107'}}>{s.avatar}</div>
                        <div className="att-name">{s.name}</div>
                        <div className="att-class">{s.className||''} — {groups.find(g=>g.id===s.groupId)?.name||''}</div>
                        {attendance[s.id] ? (
                            <div style={{marginTop:8,fontSize:24}}>
                                {attendance[s.id]==='present' ? '✅' : attendance[s.id]==='absent' ? '❌' : '⏰'}
                            </div>
                        ) : (
                            <div className="att-btns">
                                <button className="att-btn p" onClick={() => markAtt(s.id, 'present')}>✅ Bor</button>
                                <button className="att-btn a" onClick={() => markAtt(s.id, 'absent')}>❌ Yo'q</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )

    const renderGrades = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-star" style={{color:'#ffc107'}}></i> Baholar</h2></div>
            <table>
                <thead><tr><th>O'quvchi</th><th>Sinf</th><th>Matematika</th><th>Ona tili</th><th>Tarix</th><th>Fizika</th><th>Ingliz tili</th><th>O'rtacha</th></tr></thead>
                <tbody>{students.map(s => {
                    const subs = ['Matematika','Ona tili','Tarix','Fizika','Ingliz tili']
                    const myGrades = grades.filter(g => g.studentId === s.id)
                    const cells = subs.map(sub => {
                        const gs = myGrades.filter(g => g.subject === sub)
                        if (!gs.length) return <td key={sub}>—</td>
                        const avg = (gs.reduce((a, g) => a + g.value, 0) / gs.length).toFixed(1)
                        return <td key={sub}><span className={`badge badge-${avg>=4?'success':avg>=3?'warning':'danger'}`}>{avg}</span></td>
                    })
                    const overall = myGrades.length ? (myGrades.reduce((a, g) => a + g.value, 0) / myGrades.length).toFixed(1) : '-'
                    return <tr key={s.id}><td><b>{s.name}</b></td><td>{s.className||'-'}</td>{cells}<td><b>{overall}</b></td></tr>
                })}</tbody>
            </table>
        </div>
    )

    const renderStudents = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-user-graduate" style={{color:'#7b68ee'}}></i> O'quvchilar</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('addStudent')}><i className="fas fa-plus"></i> Qo'shish</button></div>
            <table><thead><tr><th></th><th>Ism</th><th>Telefon</th><th>Guruh</th><th>Sinf</th><th>Coin</th><th>Amallar</th></tr></thead>
            <tbody>{students.map(s => {
                const g = groups.find(x => x.id === s.groupId)
                return <tr key={s.id}>
                    <td><div className="user-avatar" style={{width:38,height:38,fontSize:13}}>{s.avatar}</div></td>
                    <td><b>{s.name}</b></td><td>{s.phone}</td><td>{g?.name||'-'}</td><td>{s.className||'-'}</td>
                    <td><span className="badge badge-gold">💰 {s.coins||0}</span></td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => setModal({type:'editStudent', data:s})}><i className="fas fa-edit"></i></button> <button className="btn btn-danger btn-sm" onClick={async () => { await api.deleteUser(s.id); refreshAll(); }}><i className="fas fa-trash"></i></button></td>
                </tr>
            })}</tbody></table>
        </div>
    )

    const renderTeachers = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-chalkboard-teacher" style={{color:'#28a745'}}></i> O'qituvchilar</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('addTeacher')}><i className="fas fa-plus"></i> Qo'shish</button></div>
            <table><thead><tr><th></th><th>Ism</th><th>Telefon</th><th>Fan</th><th>Guruhlar</th><th>Amallar</th></tr></thead>
            <tbody>{teachers.map(t => {
                const tGroups = groups.filter(g => g.teacherId === t.id)
                return <tr key={t.id}>
                    <td><div className="user-avatar" style={{width:38,height:38,fontSize:13,background:'#d4edda',color:'#28a745'}}>{t.avatar}</div></td>
                    <td><b>{t.name}</b></td><td>{t.phone}</td><td><span className="badge badge-primary">{t.subject||'-'}</span></td>
                    <td>{tGroups.map(g => <span key={g.id} className="badge badge-info" style={{marginRight:4}}>{g.name}</span>)}</td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => setModal({type:'editTeacher', data:t})}><i className="fas fa-edit"></i></button> <button className="btn btn-danger btn-sm" onClick={async () => { await api.deleteUser(t.id); refreshAll(); }}><i className="fas fa-trash"></i></button></td>
                </tr>
            })}</tbody></table>
        </div>
    )

    const renderGroups = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-layer-group" style={{color:'#17a2b8'}}></i> Guruhlar</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('addGroup')}><i className="fas fa-plus"></i> Qo'shish</button></div>
            <table><thead><tr><th>Nomi</th><th>Sinf</th><th>O'qituvchi</th><th>O'quvchilar</th><th>Jadval</th><th>Amallar</th></tr></thead>
            <tbody>{groups.map(g => {
                const teacher = users.find(u => u.id === g.teacherId)
                const sc = students.filter(s => s.groupId === g.id).length
                return <tr key={g.id}><td><b>{g.name}</b></td><td>{g.className}</td><td>{teacher?.name||'-'}</td>
                    <td><span className="badge badge-info">{sc} nafar</span></td><td>{g.schedule}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={async () => { await api.deleteGroup(g.id); refreshAll(); }}><i className="fas fa-trash"></i></button></td>
                </tr>
            })}</tbody></table>
        </div>
    )

    // ==================== TEST RATINGS ====================
    const renderTestRatings = () => {
        const subjects = [...new Set(testResults.map(r => r.subject))]
        const studentRatings = students.map(s => {
            const myResults = testResults.filter(r => r.studentId === s.id)
            const subjectScores = {}
            subjects.forEach(sub => {
                const subResults = myResults.filter(r => r.subject === sub)
                if (subResults.length > 0) {
                    subjectScores[sub] = subResults.reduce((best, r) => r.percentage > best.percentage ? r : best, subResults[0])
                }
            })
            const avgPct = myResults.length ? Math.round(myResults.reduce((a,r) => a + r.percentage, 0) / myResults.length) : 0
            return { student: s, subjectScores, avgPct, totalTests: myResults.length }
        }).sort((a,b) => b.avgPct - a.avgPct)

        return <div className="card" style={{overflowX:'auto'}}>
            <div className="card-header"><h2><i className="fas fa-chart-bar" style={{color:'#7b68ee'}}></i> Test Reytingi — Har kuni</h2></div>
            {testResults.length > 0 ? (
                <table>
                    <thead><tr><th>#</th><th>O'quvchi</th>
                        {subjects.map(sub => <th key={sub} style={{textAlign:'center',minWidth:80}}>{sub}</th>)}
                        <th style={{textAlign:'center'}}>O'rtacha</th>
                    </tr></thead>
                    <tbody>{studentRatings.map((sr, idx) => (
                        <tr key={sr.student.id} style={idx < 3 ? {background:'#f0fff4'} : {}}>
                            <td><b>{idx+1}</b></td>
                            <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                                <div className="user-avatar" style={{width:32,height:32,fontSize:11}}>{sr.student.avatar}</div>
                                <b>{sr.student.name}</b>
                            </div></td>
                            {subjects.map(sub => {
                                const r = sr.subjectScores[sub]
                                if (!r) return <td key={sub} style={{textAlign:'center',color:'#ccc'}}>—</td>
                                const color = r.percentage >= 80 ? '#28a745' : r.percentage >= 60 ? '#ffc107' : '#e74c3c'
                                return <td key={sub} style={{textAlign:'center'}}><span style={{color,fontWeight:700}}>{r.percentage}%</span><br/><small style={{color:'#888'}}>{r.score}/{r.total}</small></td>
                            })}
                            <td style={{textAlign:'center'}}><span style={{fontWeight:800,fontSize:16,color:sr.avgPct>=80?'#28a745':sr.avgPct>=60?'#ffc107':'#e74c3c'}}>{sr.avgPct}%</span></td>
                        </tr>
                    ))}</tbody>
                </table>
            ) : (
                <div style={{textAlign:'center',padding:40,color:'#888'}}>
                    <i className="fas fa-chart-bar" style={{fontSize:40,marginBottom:12,display:'block'}}></i>
                    Hali test topshirilmagan
                </div>
            )}
        </div>
    }

    // ==================== TEACHER PAYMENTS (SALARY) ====================
    const renderTeacherPayments = () => {
        const paidCount = teacherPayments.filter(p => p.status === 'paid').length
        const unpaidCount = teacherPayments.filter(p => p.status === 'unpaid').length
        const totalAmount = teacherPayments.reduce((s,p) => s + (p.amount||0), 0)

        return <div>
            <div className="payments-header">
                <div><h2><i className="fas fa-money-check-alt"></i> O'qituvchilar Oylik To'lovi</h2></div>
                <button className="btn btn-primary" onClick={() => setModal('addTeacherPayment')}><i className="fas fa-plus"></i> To'lov qo'shish</button>
            </div>
            <div className="payments-summary">
                <div className="payment-stat paid"><div className="ps-value">{paidCount}</div><div className="ps-label">To'langan</div></div>
                <div className="payment-stat unpaid"><div className="ps-value">{unpaidCount}</div><div className="ps-label">To'lanmagan</div></div>
                <div className="payment-stat"><div className="ps-value" style={{color:'#7b68ee'}}>{totalAmount.toLocaleString()} so'm</div><div className="ps-label">Jami</div></div>
            </div>
            <div className="card">
                <table>
                    <thead><tr><th>O'qituvchi</th><th>Fan</th><th>Oy</th><th>Summa</th><th>Holat</th><th>Amallar</th></tr></thead>
                    <tbody>{teacherPayments.map(p => {
                        const t = users.find(u => u.id === p.teacherId)
                        return <tr key={p.id}>
                            <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                                <div className="user-avatar" style={{width:32,height:32,fontSize:11,background:'#d4edda',color:'#28a745'}}>{t?.avatar||'?'}</div>
                                <b>{t?.name||'-'}</b>
                            </div></td>
                            <td><span className="badge badge-primary">{t?.subject||'-'}</span></td>
                            <td>{p.month}</td>
                            <td><b>{(p.amount||0).toLocaleString()} so'm</b></td>
                            <td><span className={`badge badge-${p.status==='paid'?'success':'danger'}`}>{p.status==='paid'?'✅ To\'langan':'❌ To\'lanmagan'}</span></td>
                            <td>
                                {p.status !== 'paid' && <button className="btn btn-success btn-sm" onClick={async () => { await api.payTeacherPayment(p.id, 'online'); refreshAll(); showToast('To\'lov amalga oshirildi!'); }}>✅ To'lash</button>}
                                <button className="btn btn-danger btn-sm" onClick={async () => { await api.deleteTeacherPayment(p.id); refreshAll(); }} style={{marginLeft:4}}><i className="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    })}</tbody>
                </table>
            </div>
        </div>
    }

    // ==================== SCHEDULE ====================
    const renderSchedule = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-calendar-alt" style={{color:'#17a2b8'}}></i> Dars Jadvali — O'qituvchilar</h2></div>
            <div style={{padding:16}}>
                {teachers.map(t => {
                    const tGroups = groups.filter(g => g.teacherId === t.id)
                    return <div key={t.id} style={{marginBottom:20,padding:20,borderRadius:12,border:'2px solid #f0f0f0',background:'#fff'}}>
                        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                            <div className="user-avatar" style={{width:44,height:44,fontSize:14,background:'#d4edda',color:'#28a745'}}>{t.avatar}</div>
                            <div>
                                <div style={{fontWeight:700,fontSize:16}}>{t.name}</div>
                                <div style={{fontSize:13,color:'#888'}}>📧 {t.subject||'-'}</div>
                            </div>
                        </div>
                        {tGroups.length > 0 ? (
                            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:12}}>
                                {tGroups.map(g => {
                                    const stCount = students.filter(s => s.groupId === g.id).length
                                    return <div key={g.id} style={{padding:14,borderRadius:10,background:'#f8f9fa',border:'1px solid #e0e0e0'}}>
                                        <div style={{fontWeight:700,color:'#7b68ee',marginBottom:6}}><i className="fas fa-layer-group" style={{marginRight:6}}></i>{g.name}</div>
                                        <div style={{fontSize:13,color:'#666',marginBottom:4}}><i className="fas fa-clock" style={{marginRight:6}}></i>{g.schedule||'Jadval belgilanmagan'}</div>
                                        <div style={{fontSize:13,color:'#666',marginBottom:4}}><i className="fas fa-map-marker-alt" style={{marginRight:6}}></i>Xona: {g.room||'-'}</div>
                                        <div style={{fontSize:13,color:'#666'}}><i className="fas fa-users" style={{marginRight:6}}></i>{stCount} nafar o'quvchi</div>
                                    </div>
                                })}
                            </div>
                        ) : (
                            <div style={{color:'#888',fontSize:14}}>Guruhlar topilmadi</div>
                        )}
                    </div>
                })}
            </div>
        </div>
    )

    const renderProfile = () => (
        <div className="profile-layout">
            <div className="profile-main">
                <div className="profile-avatar-lg">{user?.avatar}</div>
                <div className="profile-name">{user?.name}</div>
                <span className="profile-role-badge" style={{background:'#f0ebff',color:'#7b68ee'}}>{user?.role}</span>
                <div className="profile-fields">
                    <div className="profile-field"><span className="pf-label">Telefon</span><span className="pf-value">{user?.phone}</span></div>
                    <div className="profile-field"><span className="pf-label">Role</span><span className="pf-value">{user?.role}</span></div>
                </div>
            </div>
        </div>
    )

    const pages = {
        dashboard: renderDashboard,
        attendance: renderAttendance,
        grades: renderGrades,
        students: renderStudents,
        teachers: renderTeachers,
        groups: renderGroups,
        testratings: renderTestRatings,
        teacherpayments: renderTeacherPayments,
        schedule: renderSchedule,
        profile: renderProfile
    }

    return (<>
        <Layout navItems={navItems} title="Boshqaruv Paneli">
            {({ currentPage }) => (
                <>
                    {(pages[currentPage] || renderDashboard)()}
                    {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
                </>
            )}
        </Layout>
        {modal === 'addTeacherPayment' && <Modal onClose={() => setModal(null)} title="O'qituvchiga to'lov qo'shish">
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <label style={{fontWeight:600,fontSize:13}}>O'qituvchi</label>
                <select id="tpTeacher" style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:14}}>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name} - {t.subject}</option>)}
                </select>
                <label style={{fontWeight:600,fontSize:13}}>Oy</label>
                <input id="tpMonth" type="month" defaultValue={currentMonth} style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:14}} />
                <label style={{fontWeight:600,fontSize:13}}>Summa (so'm)</label>
                <input id="tpAmount" type="number" defaultValue={1500000} style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:14}} />
                <button className="btn btn-primary" onClick={async () => {
                    const teacherId = document.getElementById('tpTeacher').value
                    const month = document.getElementById('tpMonth').value
                    const amount = parseInt(document.getElementById('tpAmount').value)
                    if (!teacherId || !month || !amount) return alert('Malumotlarni toldiring!')
                    await api.addTeacherPayment({ teacherId, month, amount })
                    setModal(null)
                    refreshAll()
                    showToast('Tolov qoshildi!')
                }}><i className="fas fa-plus"></i> Qo'shish</button>
            </div>
        </Modal>}
        {modal === 'addStudent' && <Modal onClose={() => setModal(null)} title="O'quvchi qo'shish">
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <input id="sName" placeholder="Ism familiya" style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}} />
                <input id="sPhone" placeholder="Telefon" style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}} />
                <select id="sGroup" style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}}>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <button className="btn btn-primary" onClick={async () => {
                    const name = document.getElementById('sName').value
                    const phone = document.getElementById('sPhone').value
                    const groupId = document.getElementById('sGroup').value
                    const g = groups.find(x => x.id === groupId)
                    await api.createUser({ name, phone, password:'123456', role:'oquvchi', groupId, className: g?.className||'5-sinf' })
                    setModal(null); refreshAll()
                }}>Qo'shish</button>
            </div>
        </Modal>}
        {modal === 'addTeacher' && <Modal onClose={() => setModal(null)} title="O'qituvchi qo'shish">
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <input id="tName" placeholder="Ism familiya" style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}} />
                <input id="tPhone" placeholder="Telefon" style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}} />
                <input id="tSubject" placeholder="Fan" style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}} />
                <button className="btn btn-primary" onClick={async () => {
                    const name = document.getElementById('tName').value
                    const phone = document.getElementById('tPhone').value
                    const subject = document.getElementById('tSubject').value
                    await api.createUser({ name, phone, password:'123456', role:'oqituvchi', subject })
                    setModal(null); refreshAll()
                }}>Qo'shish</button>
            </div>
        </Modal>}
        {modal === 'addGroup' && <Modal onClose={() => setModal(null)} title="Guruh qo'shish">
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <input id="gName" placeholder="Guruh nomi" style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}} />
                <select id="gTeacher" style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}}>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button className="btn btn-primary" onClick={async () => {
                    const name = document.getElementById('gName').value
                    const teacherId = document.getElementById('gTeacher').value
                    await api.createGroup({ name, className:'5-sinf', teacherId, schedule:'Dushanba 15:00' })
                    setModal(null); refreshAll()
                }}>Qo'shish</button>
            </div>
        </Modal>}
        {modal?.type === 'editStudent' && <Modal onClose={() => setModal(null)} title="O'quvchini tahrirlash">
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <input id="esName" defaultValue={modal.data.name} style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}} />
                <input id="esPhone" defaultValue={modal.data.phone} style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}} />
                <button className="btn btn-primary" onClick={async () => {
                    await api.updateUser(modal.data.id, { name: document.getElementById('esName').value, phone: document.getElementById('esPhone').value })
                    setModal(null); refreshAll()
                }}>Saqlash</button>
            </div>
        </Modal>}
        {modal?.type === 'editTeacher' && <Modal onClose={() => setModal(null)} title="O'qituvchini tahrirlash">
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <input id="etName" defaultValue={modal.data.name} style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}} />
                <input id="etPhone" defaultValue={modal.data.phone} style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}} />
                <input id="etSubject" defaultValue={modal.data.subject} style={{padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10}} />
                <button className="btn btn-primary" onClick={async () => {
                    await api.updateUser(modal.data.id, { name: document.getElementById('etName').value, phone: document.getElementById('etPhone').value, subject: document.getElementById('etSubject').value })
                    setModal(null); refreshAll()
                }}>Saqlash</button>
            </div>
        </Modal>}
    </>)}

