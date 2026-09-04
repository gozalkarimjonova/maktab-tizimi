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
        { id:'testratings', icon:'fa-chart-bar', labelKey:'navTestRating' },
        { id:'schedule', icon:'fa-calendar-alt', labelKey:'navSchedule' },
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
                <div className="stat-card purple"><div className="stat-icon"><i className="fas fa-user-graduate"></i></div><div className="stat-value">{students.length}</div><div className="stat-label">{t('dirStatStudents')}</div></div>
                <div className="stat-card green"><div className="stat-icon"><i className="fas fa-chalkboard-teacher"></i></div><div className="stat-value">{teachers.length}</div><div className="stat-label">{t('dirStatTeachers')}</div></div>
                <div className="stat-card orange"><div className="stat-icon"><i className="fas fa-layer-group"></i></div><div className="stat-value">{groups.length}</div><div className="stat-label">{t('dirStatGroups')}</div></div>
                <div className="stat-card blue"><div className="stat-icon"><i className="fas fa-clipboard-check"></i></div><div className="stat-value">{presentCount}/{students.length}</div><div className="stat-label">{t('dirStatToday')}</div></div>
                <div className="stat-card red"><div className="stat-icon"><i className="fas fa-star"></i></div><div className="stat-value">{grades.length}</div><div className="stat-label">{t('dirStatGrades')}</div></div>
                <div className="stat-card purple"><div className="stat-icon"><i className="fas fa-file-alt"></i></div><div className="stat-value">{testResults.length}</div><div className="stat-label">{t('dirStatTests')}</div></div>
            </div>
            {/* O'quvchilar soni va baholari */}
            <div className="card" style={{marginTop:20}}>
                <div className="card-header"><h2><i className="fas fa-user-graduate" style={{color:'#7b68ee'}}></i> {t('dirStudentStats')}</h2></div>
                <table>
                    <thead><tr><th>#</th><th>{t('dirStudent')}</th><th>{t('dirClassName')}</th><th>{t('dirGroup')}</th><th>{t('dirAvgGrade')}</th><th>{t('dirTests')}</th><th>{t('coins')}</th></tr></thead>
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
            <div className="card-header"><h2><i className="fas fa-clipboard-check" style={{color:'#7b68ee'}}></i> {t('dirDailyAtt')} — {today}</h2>
                <select value={attGroup} onChange={e => setAttGroup(e.target.value)} style={{padding:'8px 12px',border:'2px solid #e0e0e0',borderRadius:8,fontSize:13}}>
                    <option value="all">{t('dirAllGroups')}</option>
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
                                <button className="att-btn p" onClick={() => markAtt(s.id, 'present')}>✅ {t('dirPresent')}</button>
                                <button className="att-btn a" onClick={() => markAtt(s.id, 'absent')}>❌ {t('dirAbsent')}</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )

    const renderGrades = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-star" style={{color:'#ffc107'}}></i> {t('navGrades')}</h2></div>
            <table>
                <thead><tr><th>{t('dirStudent')}</th><th>{t('dirClassName')}</th><th>Matematika</th><th>Ona tili</th><th>Tarix</th><th>Fizika</th><th>Ingliz tili</th><th>{t('dirAvg')}</th></tr></thead>
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
            <div className="card-header"><h2><i className="fas fa-user-graduate" style={{color:'#7b68ee'}}></i> {t('navStudents')}</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('addStudent')}><i className="fas fa-plus"></i> {t('dirAddBtn')}</button></div>
            <table><thead><tr><th></th><th>{t('dirName')}</th><th>{t('dirPhone')}</th><th>{t('dirGroup')}</th><th>{t('dirClassName')}</th><th>{t('coins')}</th><th>{t('dirActions')}</th></tr></thead>
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
            <div className="card-header"><h2><i className="fas fa-chalkboard-teacher" style={{color:'#28a745'}}></i> {t('navTeachers')}</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('addTeacher')}><i className="fas fa-plus"></i> {t('dirAddBtn')}</button></div>
            <table><thead><tr><th></th><th>{t('dirName')}</th><th>{t('dirPhone')}</th><th>{t('dirSubject')}</th><th>{t('dirGroups')}</th><th>{t('dirActions')}</th></tr></thead>
            <tbody>{teachers.map(teach => {
                const tGroups = groups.filter(g => g.teacherId === teach.id)
                return <tr key={teach.id}>
                    <td><div className="user-avatar" style={{width:38,height:38,fontSize:13,background:'#d4edda',color:'#28a745'}}>{teach.avatar}</div></td>
                    <td><b>{teach.name}</b></td><td>{teach.phone}</td><td><span className="badge badge-primary">{teach.subject||'-'}</span></td>
                    <td>{tGroups.map(g => <span key={g.id} className="badge badge-info" style={{marginRight:4}}>{g.name}</span>)}</td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => setModal({type:'editTeacher', data:teach})}><i className="fas fa-edit"></i></button> <button className="btn btn-danger btn-sm" onClick={async () => { await api.deleteUser(teach.id); refreshAll(); }}><i className="fas fa-trash"></i></button></td>
                </tr>
            })}</tbody></table>
        </div>
    )

    const renderGroups = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-layer-group" style={{color:'#17a2b8'}}></i> {t('navGroups')}</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setModal('addGroup')}><i className="fas fa-plus"></i> {t('dirAddBtn')}</button></div>
            <table><thead><tr><th>{t('name')}</th><th>{t('dirClassName')}</th><th>{t('dirTeacher')}</th><th>{t('dirStatStudents')}</th><th>{t('dirSchedule')}</th><th>{t('dirActions')}</th></tr></thead>
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
            <div className="card-header"><h2><i className="fas fa-chart-bar" style={{color:'#7b68ee'}}></i> {t('dirTestRatingDaily')}</h2></div>
            {testResults.length > 0 ? (
                <table>
                    <thead><tr><th>#</th><th>O'quvchi</th>
                        {subjects.map(sub => <th key={sub} style={{textAlign:'center',minWidth:80}}>{sub}</th>)}
                        <th style={{textAlign:'center'}}>{t('dirAvg')}</th>
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
                    {t('dirNoTests')}
                </div>
            )}
        </div>
    }

    // ==================== SCHEDULE ====================
    const schedDays = ['Dushanba','Seshanba','Chorshanba','Payshanba','Juma']
    const schedHours = ['08:30','09:30','10:30','11:30','12:30','13:30']
    const dayColors = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ef4444']

    const renderSchedule = () => (
        <div>
            <div className="card" style={{overflowX:'auto'}}>
                <div className="card-header"><h2><i className="fas fa-calendar-week" style={{color:'#3b82f6'}}></i> {t('dirScheduleTitle')}</h2></div>
                <table style={{minWidth:800}}>
                    <thead><tr>
                        <th style={{width:80}}></th>
                        {schedDays.map((d,i) => <th key={d} style={{textAlign:'center',background:dayColors[i],color:'#fff',padding:'10px 8px',fontSize:12,fontWeight:700}}>{d}</th>)}
                    </tr></thead>
                    <tbody>{schedHours.map((h) => (
                        <tr key={h}>
                            <td style={{textAlign:'center',fontWeight:700,color:'#6366f1',fontSize:12,background:'#f8fafc'}}>{h}</td>
                            {schedDays.map((d,di) => {
                                const slot = groups.find(g => {
                                    const sched = g.schedule || ''
                                    return sched.includes(d) && sched.includes(h)
                                })
                                if (slot) {
                                    const teach = users.find(u => u.id === slot.teacherId)
                                    return <td key={d} style={{padding:6,border:'1px solid #f1f5f9'}}>
                                        <div style={{padding:8,borderRadius:8,background:dayColors[di]+'11',borderLeft:'3px solid '+dayColors[di]}}>
                                            <div style={{fontWeight:700,fontSize:11,color:dayColors[di]}}>{slot.name}</div>
                                            <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{teach?.name||'-'}</div>
                                            <div style={{fontSize:10,color:'#94a3b8',marginTop:1}}><i className="fas fa-map-marker-alt" style={{marginRight:3}}></i>{slot.room||'-'}</div>
                                        </div>
                                    </td>
                                }
                                return <td key={d} style={{padding:6,border:'1px solid #f1f5f9'}}></td>
                            })}
                        </tr>
                    ))}</tbody>
                </table>
            </div>

            <div className="card" style={{marginTop:20}}>
                <div className="card-header"><h2><i className="fas fa-chalkboard-teacher" style={{color:'#10b981'}}></i> {t('navTeachers')} — {t('dirSchedule')}</h2></div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16,padding:16}}>
                    {teachers.map(teach => {
                        const tGroups = groups.filter(g => g.teacherId === teach.id)
                        return <div key={teach.id} style={{padding:20,borderRadius:14,border:'1px solid #e2e8f0',background:'#fff'}}>
                            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                                <div className="user-avatar" style={{width:48,height:48,fontSize:15,background:'#d4edda',color:'#10b981'}}>{teach.avatar}</div>
                                <div>
                                    <div style={{fontWeight:700,fontSize:15}}>{teach.name}</div>
                                    <div style={{fontSize:12,color:'#94a3b8'}}>{teach.subject||'-'}</div>
                                </div>
                            </div>
                            {tGroups.length > 0 ? tGroups.map(g => {
                                const stCount = students.filter(s => s.groupId === g.id).length
                                return <div key={g.id} style={{padding:12,marginBottom:8,borderRadius:10,background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                                        <span style={{fontWeight:700,color:'#6366f1',fontSize:13}}><i className="fas fa-layer-group" style={{marginRight:6}}></i>{g.name}</span>
                                        <span className="badge badge-info" style={{fontSize:10}}>{stCount} {t('dirNafar')}</span>
                                    </div>
                                    <div style={{fontSize:12,color:'#64748b',display:'flex',flexDirection:'column',gap:4}}>
                                        <span><i className="fas fa-clock" style={{marginRight:6,width:14,color:'#6366f1'}}></i>{g.schedule||t('schedule')}</span>
                                        <span><i className="fas fa-map-marker-alt" style={{marginRight:6,width:14,color:'#6366f1'}}></i>{t('room')}: {g.room||'-'}</span>
                                        <span><i className="fas fa-graduation-cap" style={{marginRight:6,width:14,color:'#6366f1'}}></i>{g.className||'-'}</span>
                                    </div>
                                </div>
                            }) : <div style={{color:'#94a3b8',fontSize:13,padding:8}}>{t('dirNoGroups')}</div>}
                        </div>
                    })}
                </div>
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

