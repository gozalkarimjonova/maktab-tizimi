import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import { api } from '../api'
import Layout from '../components/Layout'
import { useLang } from '../components/LanguageContext'

export default function Admin() {
    const { user } = useContext(AuthContext)
    const { t } = useLang()
    const [page, setPage] = useState('dashboard')
    const [users, setUsers] = useState([])
    const [groups, setGroups] = useState([])
    const [attendance, setAttendance] = useState({})
    const [grades, setGrades] = useState([])
    const [homeworks, setHomeworks] = useState([])
    const [payments, setPayments] = useState([])
    const [settings, setSettings] = useState({})
    const [tests, setTests] = useState({})
    const [attGroup, setAttGroup] = useState('all')

    const getToday = () => {
        const now = new Date()
        const uzb = new Date(now.getTime() + (5 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000))
        return uzb.toISOString().split('T')[0]
    }
    const today = getToday()

    const navItems = [
        { id:'dashboard', icon:'fa-chart-pie', labelKey:'navDashboard' },
        { sectionKey:'sectionLessons' },
        { id:'attendance', icon:'fa-clipboard-check', labelKey:'navAttendance' },
        { id:'grades', icon:'fa-star', labelKey:'navGrades' },
        { id:'students', icon:'fa-user-graduate', labelKey:'navStudents' },
        { id:'teachers', icon:'fa-chalkboard-teacher', labelKey:'navTeachers' },
        { id:'groups', icon:'fa-layer-group', labelKey:'navGroups' },
        { sectionKey:'sectionExtra' },
        { id:'homework', icon:'fa-book-open', labelKey:'navHomework' },
        { id:'payments', icon:'fa-money-check-alt', labelKey:'navPayments' },
        { sectionKey:'sectionPersonal' },
        { id:'profile', icon:'fa-user-circle', labelKey:'navProfile' },
        { id:'settings', icon:'fa-cog', labelKey:'navSettings' },
    ]

    const refreshAll = () => {
        api.getUsers().then(d => d && setUsers(d))
        api.getGroups().then(d => d && setGroups(d))
        api.getGrades().then(d => d && setGrades(d))
        api.getHomeworks().then(d => d && setHomeworks(d))
        api.getPayments().then(d => d && setPayments(d))
        api.getSettings().then(d => d && setSettings(d))
        api.getAttendance(today).then(d => d && setAttendance(d))
    }
    useEffect(() => { refreshAll() }, [])

    const students = users.filter(u => u.role === 'oquvchi')
    const teachers = users.filter(u => u.role === 'oqituvchi')

    const renderDashboard = () => (
        <div className="stats-grid">
            <div className="stat-card purple"><div className="stat-icon"><i className="fas fa-user-graduate"></i></div><div className="stat-value">{students.length}</div><div className="stat-label">O'quvchilar</div></div>
            <div className="stat-card green"><div className="stat-icon"><i className="fas fa-chalkboard-teacher"></i></div><div className="stat-value">{teachers.length}</div><div className="stat-label">O'qituvchilar</div></div>
            <div className="stat-card orange"><div className="stat-icon"><i className="fas fa-layer-group"></i></div><div className="stat-value">{groups.length}</div><div className="stat-label">Guruhlar</div></div>
            <div className="stat-card blue"><div className="stat-icon"><i className="fas fa-money-check-alt"></i></div><div className="stat-value">{payments.filter(p=>p.status==='paid').length}/{payments.length}</div><div className="stat-label">To'lovlar</div></div>
        </div>
    )

    const renderPayments = () => {
        const paidCount = payments.filter(p => p.status === 'paid').length
        const unpaidCount = payments.filter(p => p.status === 'unpaid').length
        return <div>
            <div className="payments-header"><div><h2><i className="fas fa-money-check-alt"></i> Oylik To'lovlar</h2></div>
                <button className="btn btn-primary" onClick={async () => {
                    const studentId = students[0]?.id
                    const amount = parseInt(prompt('Summa (so\'m):') || '500000')
                    if (!studentId || !amount) return
                    await api.addPayment({ studentId, month: today.substring(0,7), amount, status: 'unpaid' })
                    refreshAll()
                }}><i className="fas fa-plus"></i> To'lov qo'shish</button></div>
            <div className="payments-summary">
                <div className="payment-stat paid"><div className="ps-value">{paidCount}</div><div className="ps-label">To'langan</div></div>
                <div className="payment-stat unpaid"><div className="ps-value">{unpaidCount}</div><div className="ps-label">To'lanmagan</div></div>
                <div className="payment-stat"><div className="ps-value" style={{color:'#7b68ee'}}>{payments.reduce((s,p)=>s+p.amount,0).toLocaleString()} so'm</div><div className="ps-label">Jami</div></div>
            </div>
            <div className="card"><table><thead><tr><th>O'quvchi</th><th>Oy</th><th>Summa</th><th>Holat</th><th>Amallar</th></tr></thead>
            <tbody>{payments.map(p => {
                const s = users.find(u => u.id === p.studentId)
                return <tr key={p.id}><td><b>{s?.name||'-'}</b></td><td>{p.month}</td><td>{p.amount.toLocaleString()} so'm</td>
                    <td><span className={`badge badge-${p.status==='paid'?'success':'danger'}`}>{p.status==='paid'?'✅ To\'langan':'❌ To\'lanmagan'}</span></td>
                    <td>{p.status!=='paid' && <button className="btn btn-success btn-sm" onClick={async () => { await api.updatePayment(p.id, {status:'paid'}); refreshAll(); }}>To'lash</button>}
                        <button className="btn btn-danger btn-sm" onClick={async () => { await api.deletePayment(p.id); refreshAll(); }}><i className="fas fa-trash"></i></button></td>
                </tr>
            })}</tbody></table></div>
        </div>
    }

    const renderStudents = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-user-graduate" style={{color:'#7b68ee'}}></i> O'quvchilar</h2>
                <button className="btn btn-primary btn-sm" onClick={async () => {
                    const name = prompt('Ism:')
                    if (!name) return
                    const phone = prompt('Telefon:') || ''
                    const groupId = groups[0]?.id || ''
                    const className = '5-sinf'
                    await api.createUser({ name, phone, password: '123456', role: 'oquvchi', groupId, className })
                    refreshAll()
                }}><i className="fas fa-plus"></i> Qo'shish</button></div>
            <table><thead><tr><th></th><th>Ism</th><th>Telefon</th><th>Guruh</th><th>Coin</th><th>Amallar</th></tr></thead>
            <tbody>{students.map(s => <tr key={s.id}>
                <td><div className="user-avatar" style={{width:38,height:38,fontSize:13}}>{s.avatar}</div></td>
                <td><b>{s.name}</b></td><td>{s.phone}</td><td>{groups.find(g=>g.id===s.groupId)?.name||'-'}</td>
                <td><span className="badge badge-gold">💰 {s.coins||0}</span></td>
                <td><button className="btn btn-danger btn-sm" onClick={async () => { await api.deleteUser(s.id); refreshAll(); }}><i className="fas fa-trash"></i></button></td>
            </tr>)}</tbody></table>
        </div>
    )

    const renderTeachers = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-chalkboard-teacher" style={{color:'#28a745'}}></i> O'qituvchilar</h2>
                <button className="btn btn-primary btn-sm" onClick={async () => {
                    const name = prompt('Ism:')
                    if (!name) return
                    const phone = prompt('Telefon:') || ''
                    const subject = prompt('Fan:') || 'Matematika'
                    await api.createUser({ name, phone, password: '123456', role: 'oqituvchi', subject })
                    refreshAll()
                }}><i className="fas fa-plus"></i> Qo'shish</button></div>
            <table><thead><tr><th></th><th>Ism</th><th>Telefon</th><th>Fan</th><th>Amallar</th></tr></thead>
            <tbody>{teachers.map(t => <tr key={t.id}>
                <td><div className="user-avatar" style={{width:38,height:38,fontSize:13,background:'#d4edda',color:'#28a745'}}>{t.avatar}</div></td>
                <td><b>{t.name}</b></td><td>{t.phone}</td><td><span className="badge badge-primary">{t.subject||'-'}</span></td>
                <td><button className="btn btn-danger btn-sm" onClick={async () => { await api.deleteUser(t.id); refreshAll(); }}><i className="fas fa-trash"></i></button></td>
            </tr>)}</tbody></table>
        </div>
    )

    const renderGroups = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-layer-group" style={{color:'#17a2b8'}}></i> Guruhlar</h2>
                <button className="btn btn-primary btn-sm" onClick={async () => {
                    const name = prompt('Guruh nomi:')
                    if (!name) return
                    const teacherId = teachers[0]?.id || ''
                    await api.createGroup({ name, className: '5-sinf', teacherId, schedule: 'Dushanba 15:00' })
                    refreshAll()
                }}><i className="fas fa-plus"></i> Qo'shish</button></div>
            <table><thead><tr><th>Nomi</th><th>Sinf</th><th>O'qituvchi</th><th>Amallar</th></tr></thead>
            <tbody>{groups.map(g => <tr key={g.id}><td><b>{g.name}</b></td><td>{g.className}</td><td>{users.find(u=>u.id===g.teacherId)?.name||'-'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={async () => { await api.deleteGroup(g.id); refreshAll(); }}><i className="fas fa-trash"></i></button></td></tr>)}</tbody></table>
        </div>
    )

    const [editingField, setEditingField] = useState(null)

    const renderSettings = () => {
        return <div>
            {/* Maktab ma'lumotlari */}
            <div className="card" style={{marginBottom:20}}>
                <div className="card-header"><h2><i className="fas fa-school" style={{color:'#7b68ee'}}></i> Maktab Sozlamalari</h2></div>
                <div style={{padding:20}}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
                        <div>
                            <label style={{display:'block',fontWeight:600,fontSize:13,marginBottom:6}}>Maktab nomi</label>
                            <input id="settingSchoolName" defaultValue={settings.schoolName || ''} style={{width:'100%',padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:14}} />
                        </div>
                        <div>
                            <label style={{display:'block',fontWeight:600,fontSize:13,marginBottom:6}}>Maktab Manzili</label>
                            <input id="settingAddress" defaultValue={settings.address || ''} placeholder="Toshkent sh., ..." style={{width:'100%',padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:14}} />
                        </div>
                        <div>
                            <label style={{display:'block',fontWeight:600,fontSize:13,marginBottom:6}}>Telefon Raqam</label>
                            <input id="settingPhone" defaultValue={settings.schoolPhone || ''} placeholder="+998 90 123 45 67" style={{width:'100%',padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:14}} />
                        </div>
                        <div>
                            <label style={{display:'block',fontWeight:600,fontSize:13,marginBottom:6}}>O'quv Yili</label>
                            <select id="settingYear" defaultValue={settings.academicYear || '2026-2027'} style={{width:'100%',padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:14}}>
                                <option value="2025-2026">2025-2026</option>
                                <option value="2026-2027">2026-2027</option>
                                <option value="2027-2028">2027-2028</option>
                            </select>
                        </div>
                        <div>
                            <label style={{display:'block',fontWeight:600,fontSize:13,marginBottom:6}}>Oylik To'lov Summasi (so'm)</label>
                            <input id="settingPaymentAmount" type="number" defaultValue={settings.monthlyPayment || 500000} style={{width:'100%',padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:14}} />
                        </div>
                        <div>
                            <label style={{display:'block',fontWeight:600,fontSize:13,marginBottom:6}}>O'qituvchi Oylik Maoshi (so'm)</label>
                            <input id="settingTeacherSalary" type="number" defaultValue={settings.teacherSalary || 1500000} style={{width:'100%',padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:14}} />
                        </div>
                    </div>
                    <button className="btn btn-primary" style={{marginTop:20}} onClick={async () => {
                        await api.updateSettings({
                            schoolName: document.getElementById('settingSchoolName').value,
                            address: document.getElementById('settingAddress').value,
                            schoolPhone: document.getElementById('settingPhone').value,
                            academicYear: document.getElementById('settingYear').value,
                            monthlyPayment: parseInt(document.getElementById('settingPaymentAmount').value),
                            teacherSalary: parseInt(document.getElementById('settingTeacherSalary').value),
                        })
                        refreshAll()
                        alert('Saqlandi!')
                    }}><i className="fas fa-save"></i> Saqlash</button>
                </div>
            </div>
            {/* Tizim statisticsi */}
            <div className="card" style={{marginBottom:20}}>
                <div className="card-header"><h2><i className="fas fa-chart-bar" style={{color:'#28a745'}}></i> Tizim Statistikasi</h2></div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16,padding:20}}>
                    <div style={{textAlign:'center',padding:20,background:'#f8f9fa',borderRadius:12}}>
                        <div style={{fontSize:28,fontWeight:800,color:'#7b68ee'}}>{users.length}</div>
                        <div style={{fontSize:13,color:'#888'}}>Foydalanuvchilar</div>
                    </div>
                    <div style={{textAlign:'center',padding:20,background:'#f8f9fa',borderRadius:12}}>
                        <div style={{fontSize:28,fontWeight:800,color:'#28a745'}}>{students.length}</div>
                        <div style={{fontSize:13,color:'#888'}}>O'quvchilar</div>
                    </div>
                    <div style={{textAlign:'center',padding:20,background:'#f8f9fa',borderRadius:12}}>
                        <div style={{fontSize:28,fontWeight:800,color:'#ffc107'}}>{teachers.length}</div>
                        <div style={{fontSize:13,color:'#888'}}>O'qituvchilar</div>
                    </div>
                    <div style={{textAlign:'center',padding:20,background:'#f8f9fa',borderRadius:12}}>
                        <div style={{fontSize:28,fontWeight:800,color:'#17a2b8'}}>{groups.length}</div>
                        <div style={{fontSize:13,color:'#888'}}>Guruhlar</div>
                    </div>
                    <div style={{textAlign:'center',padding:20,background:'#f8f9fa',borderRadius:12}}>
                        <div style={{fontSize:28,fontWeight:800,color:'#28a745'}}>{payments.filter(p=>p.status==='paid').length}</div>
                        <div style={{fontSize:13,color:'#888'}}>To'langan</div>
                    </div>
                    <div style={{textAlign:'center',padding:20,background:'#f8f9fa',borderRadius:12}}>
                        <div style={{fontSize:28,fontWeight:800,color:'#e74c3c'}}>{payments.filter(p=>p.status==='unpaid').length}</div>
                        <div style={{fontSize:13,color:'#888'}}>To'lanmagan</div>
                    </div>
                </div>
            </div>
            {/* Foydalanuvchilar ro'yxati */}
            <div className="card">
                <div className="card-header"><h2><i className="fas fa-users" style={{color:'#7b68ee'}}></i> Foydalanuvchilar</h2></div>
                <table>
                    <thead><tr><th></th><th>Ism</th><th>Telefon</th><th>Role</th><th>Guruh</th></tr></thead>
                    <tbody>{users.map(u => {
                        const g = groups.find(x => x.id === u.groupId)
                        const roleColor = u.role==='direktor'?'#7b68ee':u.role==='oqituvchi'?'#28a745':u.role==='admin'?'#e74c3c':'#ffc107'
                        return <tr key={u.id}>
                            <td><div className="user-avatar" style={{width:32,height:32,fontSize:11}}>{u.avatar}</div></td>
                            <td><b>{u.name}</b></td><td>{u.phone}</td>
                            <td><span style={{padding:'2px 10px',borderRadius:6,background:roleColor+'20',color:roleColor,fontWeight:600,fontSize:12}}>{u.role}</span></td>
                            <td>{g?.name||'-'}</td>
                        </tr>
                    })}</tbody>
                </table>
            </div>
        </div>
    }

    const renderProfile = () => (
        <div className="profile-layout"><div className="profile-main">
            <div className="profile-avatar-lg">{user?.avatar}</div><div className="profile-name">{user?.name}</div>
            <span className="profile-role-badge" style={{background:'#f8d7da',color:'#e74c3c'}}>{user?.role}</span>
            <div className="profile-fields">
                <div className="profile-field"><span className="pf-label">Telefon</span><span className="pf-value">{user?.phone}</span></div>
                <div className="profile-field"><span className="pf-label">Coinlar</span><span className="pf-value" style={{color:'#ffc107'}}>💰 {user?.coins||0}</span></div>
            </div></div></div>
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
            <div className="att-grid">{filteredStudents.map(s => (
                <div key={s.id} className={`att-card ${attendance[s.id]||''}`}>
                    <div className="att-avatar" style={{background:'#fff3cd',color:'#ffc107'}}>{s.avatar}</div>
                    <div className="att-name">{s.name}</div><div className="att-class">{s.className||''}</div>
                    {attendance[s.id] ? (
                        <div style={{marginTop:8,fontSize:24}}>
                            {attendance[s.id]==='present' ? '✅' : attendance[s.id]==='absent' ? '❌' : '⏰'}
                        </div>
                    ) : (
                        <div className="att-btns">
                            <button className="att-btn p" onClick={async () => { const a={...attendance,[s.id]:'present'}; setAttendance(a); await api.saveAttendance(today,a); }}>✅ Bor</button>
                            <button className="att-btn a" onClick={async () => { const a={...attendance,[s.id]:'absent'}; setAttendance(a); await api.saveAttendance(today,a); }}>❌ Yo'q</button>
                            <button className="att-btn l" onClick={async () => { const a={...attendance,[s.id]:'late'}; setAttendance(a); await api.saveAttendance(today,a); }}>⏰ Kech</button>
                        </div>
                    )}
                </div>
            ))}</div>
        </div>
    )

    const renderGrades = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-star" style={{color:'#ffc107'}}></i> Baholar</h2></div>
            <table><thead><tr><th>O'quvchi</th><th>Fan</th><th>Baho</th><th>Sana</th></tr></thead>
            <tbody>{grades.map(g => {
                const s = users.find(u => u.id === g.studentId)
                return <tr key={g.id}><td><b>{s?.name||'-'}</b></td><td><span className="badge badge-primary">{g.subject}</span></td>
                    <td><span className={`badge badge-${g.value>=4?'success':g.value>=3?'warning':'danger'}`}>{g.value}</span></td><td>{g.date}</td></tr>
            })}</tbody></table>
        </div>
    )

    const renderHomework = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-book-open" style={{color:'#7b68ee'}}></i> Uy Vazifalari</h2></div>
            <div className="homework-list">{homeworks.map(hw => (
                <div key={hw.id} className="homework-card normal">
                    <div className="hw-icon" style={{background:'#e8e0ff',color:'#7b68ee'}}><i className="fas fa-book"></i></div>
                    <div className="hw-body"><div className="hw-title">{hw.title}</div><div className="hw-desc">{hw.description}</div></div>
                    <span className="badge badge-info">{hw.completedIds?.length||0}/{hw.studentIds?.length||0}</span>
                </div>
            ))}</div>
        </div>
    )

    const pages = { dashboard:renderDashboard, attendance:renderAttendance, grades:renderGrades, students:renderStudents, teachers:renderTeachers, groups:renderGroups, homework:renderHomework, payments:renderPayments, settings:renderSettings, profile:renderProfile }

    return <Layout navItems={navItems} title="Admin">{({ currentPage }) => (pages[currentPage] || renderDashboard)()}</Layout>
}