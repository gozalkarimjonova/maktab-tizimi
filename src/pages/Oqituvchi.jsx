import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import { api } from '../api'
import Layout from '../components/Layout'
import { useLang } from '../components/LanguageContext'

export default function Oqituvchi() {
    const { user } = useContext(AuthContext)
    const { t } = useLang()
    const [page, setPage] = useState('dashboard')
    const [users, setUsers] = useState([])
    const [groups, setGroups] = useState([])
    const [attendance, setAttendance] = useState({})
    const [grades, setGrades] = useState([])
    const [homeworks, setHomeworks] = useState([])
    const [tests, setTests] = useState({})
    const [topics, setTopics] = useState([])
    const [testResults, setTestResults] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [activeTab, setActiveTab] = useState('attendance')
    const [activeMonth, setActiveMonth] = useState('Aug 26')

    // Month to number mapping
    const monthMap = { 'Jan':0, 'Feb':1, 'Mar':2, 'Apr':3, 'May':4, 'Jun':5, 'Jul':6, 'Aug':7, 'Sep':8, 'Oct':9, 'Nov':10, 'Dec':11 }
    const months = ['Aug 26','Sep 26','Oct 26','Nov 26','Dec 26','Jan 27','Feb 27','Mar 27','Apr 27','May 27','Jun 27']
    const [selSubj, setSelSubj] = useState('Matematika')
    const [answers, setAnswers] = useState({})
    const [teacherAllocation, setTeacherAllocation] = useState({ allocated: 0, used: 0, remaining: 0 })
    const [coinModal, setCoinModal] = useState(null)
    const [coinAmount, setCoinAmount] = useState('')
    const [coinReason, setCoinReason] = useState('')
    const [attPopup, setAttPopup] = useState(null) // {date, studentId, x, y}
    const [topicModal, setTopicModal] = useState(false)
    const [topicTitle, setTopicTitle] = useState('')
    const [gradeStudent, setGradeStudent] = useState(null)
    const [gradeValue, setGradeValue] = useState(5)
    const [gradeCoins, setGradeCoins] = useState(0)
    const [gradeNote, setGradeNote] = useState('')

    const getToday = () => {
        const now = new Date()
        const uzb = new Date(now.getTime() + (5*60*60*1000) - (now.getTimezoneOffset()*60*1000))
        return uzb.toISOString().split('T')[0]
    }
    const today = getToday()

    const navItems = [
        { id:'dashboard', icon:'fa-chart-pie', labelKey:'navDashboard' },
        { sectionKey:'sectionLessons' },
        { id:'classes', icon:'fa-chalkboard-teacher', labelKey:'navClasses' },
        { id:'grades', icon:'fa-star', labelKey:'navGrades' },
        { sectionKey:'sectionExtra' },
        { id:'tests', icon:'fa-file-alt', labelKey:'navTests' },
        { id:'results', icon:'fa-chart-bar', labelKey:'navResults' },
        { id:'coins', icon:'fa-coins', labelKey:'navCoins' },
        { sectionKey:'sectionPersonal' },
        { id:'profile', icon:'fa-user-circle', labelKey:'navProfile' },
    ]

    const refreshAll = () => {
        api.getUsers().then(d => d && setUsers(d))
        api.getGroups().then(d => d && setGroups(d))
        api.getGrades().then(d => d && setGrades(d))
        api.getHomeworks().then(d => d && setHomeworks(d))
        api.getTests().then(d => d && setTests(d))
        api.getTestResults().then(d => d && setTestResults(d))
        api.getTopics().then(d => d && setTopics(d))
        api.getTeacherAllocation().then(d => d && setTeacherAllocation(d))
    }

    useEffect(() => { refreshAll() }, [])
    // Close attendance popup when clicking outside
    useEffect(() => {
        const handler = () => setAttPopup(null)
        if (attPopup) document.addEventListener('click', handler)
        return () => document.removeEventListener('click', handler)
    }, [attPopup])

    const myGroups = groups.filter(g => g.teacherId === user?.id)
    const allStudents = users.filter(u => u.role === 'oquvchi')

    // Build attendance dates based on selected month, Tashkent timezone
    const getAttendanceDates = (monthStr) => {
        const dates = []
        const parts = monthStr.split(' ')
        const monthName = parts[0]
        const yearShort = parseInt(parts[1])
        const monthIdx = monthMap[monthName]
        const year = 2000 + yearShort
        // Generate all weekdays for this month
        const d = new Date(year, monthIdx, 1)
        while (d.getMonth() === monthIdx) {
            const day = d.getDay()
            if (day !== 0 && day !== 6) {
                // Use local date, not UTC (toISOString shifts by timezone)
                const mm = String(d.getMonth()+1).padStart(2,'0')
                const dd = String(d.getDate()).padStart(2,'0')
                dates.push(`${year}-${mm}-${dd}`)
            }
            d.setDate(d.getDate() + 1)
        }
        return dates
    }
    const attDates = getAttendanceDates(activeMonth)

    const loadAttendance = async (dateStr) => {
        const data = await api.getAttendance(dateStr)
        return data || {}
    }

    const markAtt = async (dateStr, studentId, status) => {
        const existing = allAttendance[dateStr] || await loadAttendance(dateStr)
        const newAtt = { ...existing, [studentId]: status }
        await api.saveAttendance(dateStr, newAtt)
        // Update local state immediately
        setAllAttendance(prev => ({ ...prev, [dateStr]: newAtt }))
        refreshAll()
    }

    // Load all attendance for display
    const [allAttendance, setAllAttendance] = useState({})
    useEffect(() => {
        const loadAll = async () => {
            const result = {}
            for (const date of attDates) {
                result[date] = await loadAttendance(date)
            }
            setAllAttendance(result)
        }
        if (selectedGroup) loadAll()
    }, [selectedGroup, activeMonth])

    const getAttIcon = (status) => {
        if (status === 'present') return <span style={{color:'#28a745',fontSize:20,fontWeight:700}}>✅</span>
        if (status === 'absent') return <span style={{color:'#e74c3c',fontSize:20,fontWeight:700}}>❌</span>
        if (status === 'late') return <span style={{color:'#ffc107',fontSize:20,fontWeight:700}}>⏰</span>
        return <span style={{color:'#e0e0e0',fontSize:16}}> </span>
    }

    const renderDashboard = () => (
        <div>
            <div className="stats-grid">
                <div className="stat-card purple"><div className="stat-icon"><i className="fas fa-layer-group"></i></div><div className="stat-value">{myGroups.length}</div><div className="stat-label">{t('dashMyGroups')}</div></div>
                <div className="stat-card green"><div className="stat-icon"><i className="fas fa-user-graduate"></i></div><div className="stat-value">{allStudents.filter(s => myGroups.some(g => g.id === s.groupId)).length}</div><div className="stat-label">{t('dashMyStudents')}</div></div>
                <div className="stat-card orange"><div className="stat-icon"><i className="fas fa-book-open"></i></div><div className="stat-value">{homeworks.length}</div><div className="stat-label">{t('dashHomeworks')}</div></div>
                <div className="stat-card red"><div className="stat-icon"><i className="fas fa-chalkboard"></i></div><div className="stat-value">{topics.length}</div><div className="stat-label">{t('dashTopics')}</div></div>
            </div>
            {/* Teacher Coin Allocation */}
            <div style={{background:'linear-gradient(135deg,#7b68ee,#5b5ea6)',borderRadius:16,padding:24,marginBottom:24,color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
                <div>
                    <div style={{fontSize:18,fontWeight:700}}><i className="fas fa-coins" style={{marginRight:8}}></i> {t('coinDistribution')}</div>
                    <div style={{opacity:0.8,fontSize:13,marginTop:4}}>{t('coinAllocDesc')}</div>
                </div>
                <div style={{display:'flex',gap:32,alignItems:'center'}}>
                    <div style={{textAlign:'center',minWidth:80}}><div style={{fontSize:32,fontWeight:800}}>{teacherAllocation.allocated}</div><div style={{fontSize:12,opacity:0.8,marginTop:4}}>{t('totalMonthly')}</div></div>
                    <div style={{textAlign:'center',minWidth:80}}><div style={{fontSize:32,fontWeight:800,color:'#ffc107'}}>{teacherAllocation.used}</div><div style={{fontSize:12,opacity:0.8,marginTop:4}}>{t('used')}</div></div>
                    <div style={{textAlign:'center',minWidth:80}}><div style={{fontSize:32,fontWeight:800,color:'#28a745'}}>{teacherAllocation.remaining}</div><div style={{fontSize:12,opacity:0.8,marginTop:4}}>{t('remaining')}</div></div>
                </div>
            </div>
        </div>
    )

    // ===== CLASS VIEW - Like reference image =====
    const renderClasses = () => {
        if (!selectedGroup) {
            return <div>
                <h2 style={{fontSize:22,marginBottom:20}}><i className="fas fa-chalkboard-teacher" style={{color:'#7b68ee'}}></i> {t('myClassesTitle')}</h2>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:20}}>
                    {myGroups.map(g => {
                        const students = allStudents.filter(s => s.groupId === g.id)
                        const groupTopics = topics.filter(t => t.groupId === g.id)
                        const completedTopics = groupTopics.filter(t => t.status === 'completed').length
                        return <div key={g.id} className="card" style={{cursor:'pointer',transition:'all .2s'}} onClick={() => {setSelectedGroup(g);setActiveTab('attendance');}}>
                            <div style={{padding:24}}>
                                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
                                    <div style={{width:50,height:50,borderRadius:14,background:'linear-gradient(135deg,#7b68ee,#5b5ea6)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:20,fontWeight:700}}>{g.name.charAt(0)}</div>
                                    <div>
                                        <div style={{fontSize:18,fontWeight:700}}>{g.name}</div>
                                        <div style={{fontSize:13,color:'#888'}}>{g.className} · {g.room||'Xona'}</div>
                                    </div>
                                </div>
                                <div style={{display:'flex',gap:20,fontSize:13,color:'#666'}}>
                                    <span><i className="fas fa-users" style={{color:'#7b68ee',marginRight:4}}></i> {students.length} {t('students')}</span>
                                    <span><i className="fas fa-book" style={{color:'#ffc107',marginRight:4}}></i> {completedTopics}/{groupTopics.length} {t('topics')}</span>
                                </div>
                                <div style={{marginTop:12,fontSize:13,color:'#888'}}><i className="fas fa-clock" style={{marginRight:4}}></i> {g.schedule}</div>
                            </div>
                        </div>
                    })}
                </div>
            </div>
        }

        // Selected group view - Tabs like reference image
        const groupStudents = allStudents.filter(s => s.groupId === selectedGroup.id)
        const groupTopics = topics.filter(t => t.groupId === selectedGroup.id).sort((a,b) => a.order - b.order)
        const groupHomeworks = homeworks.filter(h => h.groupId === selectedGroup.id)
        const groupResults = testResults.filter(r => groupStudents.some(s => s.id === r.studentId))

        return <div>
            {/* Group Header */}
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20,flexWrap:'wrap'}}>
                <button onClick={() => setSelectedGroup(null)} style={{padding:'8px 16px',border:'2px solid #e0e0e0',borderRadius:10,background:'#fff',cursor:'pointer',fontWeight:600}}>
                    <i className="fas fa-arrow-left" style={{marginRight:6}}></i> {t('backBtn')}
                </button>
                <div style={{flex:1}}>
                    <h2 style={{fontSize:24,margin:0}}>{selectedGroup.name}</h2>
                    <div style={{fontSize:13,color:'#888',marginTop:2}}>
                        {t('curatorLabel')}: <b>{user?.name}</b> · {selectedGroup.schedule} · {t('roomLabel')}: {selectedGroup.room||'A3'}
                    </div>
                </div>
                <div style={{display:'flex',gap:8,fontSize:13}}>
                    <span style={{padding:'4px 12px',background:'#e8e0ff',borderRadius:8,color:'#7b68ee',fontWeight:600}}>{t('curriculumLabel')}: {user?.subject||'Matematika'}</span>
                </div>
            </div>

            {/* Tabs */}
            <div style={{display:'flex',gap:4,marginBottom:20,background:'#fff',borderRadius:12,padding:4,boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                {[
                    {id:'attendance',label:t('tabAttendance'),icon:'fa-clipboard-check'},
                    {id:'topics',label:t('tabTopics'),icon:'fa-book-open'},
                    {id:'grading',label:t('tabGrading'),icon:'fa-star'},
                    {id:'tests',label:t('tabAssignments'),icon:'fa-file-alt'},
                    {id:'homework',label:t('tabHomework'),icon:'fa-home'},
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        style={{flex:1,padding:'12px 16px',border:'none',borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:14,transition:'all .2s',
                            background: activeTab===tab.id?'linear-gradient(135deg,#7b68ee,#5b5ea6)':'transparent',
                            color: activeTab===tab.id?'#fff':'#666'}}>
                        <i className={`fas ${tab.icon}`} style={{marginRight:6}}></i> {tab.label}
                    </button>
                ))}
            </div>

            {/* Attendance Tab */}
            {activeTab === 'attendance' && <div className="card" style={{overflow:'auto'}}>
                {/* Month selector */}
                <div style={{display:'flex',gap:6,padding:'12px 16px',overflowX:'auto',borderBottom:'1px solid #f0f0f0'}}>
                    {months.map(m => (
                        <button key={m} onClick={() => setActiveMonth(m)}
                            style={{padding:'8px 14px',border:'none',borderRadius:8,fontWeight:600,fontSize:12,whiteSpace:'nowrap',cursor:'pointer',
                                background: activeMonth===m?'#7b68ee':'#f5f5f5', color: activeMonth===m?'#fff':'#666'}}>
                            {m}
                        </button>
                    ))}
                </div>
                {/* Attendance Grid */}
                <div style={{overflowX:'auto',padding:0}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                        <thead>
                            <tr>
                                <th style={{textAlign:'left',padding:'12px 16px',position:'sticky',left:0,background:'#fff',zIndex:1,minWidth:180}}>{t('studentList')}</th>
                                <th style={{padding:'12px 8px',textAlign:'center',minWidth:60,color:'#888',fontWeight:600}}>{t('archive')}</th>
                                {attDates.map(d => {
                                    const parts = d.split('-')
                                    const dayNum = parts[2]+'.'+parts[1]
                                    return <th key={d} style={{padding:'12px 6px',textAlign:'center',minWidth:60}}>
                                        <div style={{fontSize:11,color:'#888'}}>{dayNum}</div>
                                        <div style={{fontSize:9,color:'#aaa'}}>{user?.name?.split(' ')[0]||''}</div>
                                    </th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {groupStudents.map((s, idx) => (
                                <tr key={s.id} style={{borderTop:'1px solid #f5f5f5'}}>
                                    <td style={{padding:'10px 16px',position:'sticky',left:0,background:'#fff',zIndex:1}}>
                                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                                            <span style={{fontWeight:700,color:'#888',minWidth:20}}>{idx+1}.</span>
                                            <div style={{width:8,height:8,borderRadius:'50%',background:'#28a745'}}></div>
                                            <div>
                                                <div style={{fontWeight:600}}>{s.name}</div>
                                            </div>
                                            <span style={{fontSize:10,background:'#d4edda',color:'#28a745',padding:'2px 8px',borderRadius:4,fontWeight:600}}>Aktiv</span>
                                        </div>
                                    </td>
                                    <td style={{textAlign:'center',color:'#888',fontSize:12}}>—</td>
                                    {attDates.map(d => {
                                        const att = allAttendance[d] || {}
                                        const isOpen = attPopup?.date === d && attPopup?.studentId === s.id
                                        return <td key={d} style={{textAlign:'center',padding:'6px 2px',position:'relative',width:52}}>
                                            <button onClick={(e) => {
                                                e.stopPropagation()
                                                if (isOpen) { setAttPopup(null); return }
                                                setAttPopup({date:d, studentId:s.id})
                                            }}
                                            style={{width:40,height:40,borderRadius:8,border:`2px solid ${att[s.id]==='present'?'#28a745':att[s.id]==='absent'?'#e74c3c':'#e0e0e0'}`,
                                                background: att[s.id]==='present'?'#d4edda':att[s.id]==='absent'?'#f8d7da':'#fff',
                                                cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',transition:'all .15s',
                                                transform: isOpen?'scale(1.1)':'scale(1)',lineHeight:1}}>
                                                {att[s.id]==='present' ? <i className="fas fa-check-circle" style={{color:'#28a745',fontSize:22}}></i> : att[s.id]==='absent' ? <i className="fas fa-times-circle" style={{color:'#e74c3c',fontSize:22}}></i> : null}
                                            </button>
                                            {isOpen && <div onClick={e => e.stopPropagation()} style={{position:'absolute',top:'100%',left:'50%',transform:'translateX(-50%)',background:'#fff',borderRadius:12,boxShadow:'0 4px 20px rgba(0,0,0,0.2)',display:'flex',gap:4,padding:6,zIndex:100,whiteSpace:'nowrap'}}>
                                                <button onClick={() => {markAtt(d,s.id,'present');setAttPopup(null)}} title="Bor" style={{width:42,height:42,borderRadius:8,border:'2px solid #28a745',background:'#d4edda',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',transition:'transform .15s'}} onMouseOver={e=>e.currentTarget.style.transform='scale(1.15)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}><i className="fas fa-check-circle" style={{color:'#28a745',fontSize:22}}></i></button>
                                                <button onClick={() => {markAtt(d,s.id,'absent');setAttPopup(null)}} title="Yo'q" style={{width:42,height:42,borderRadius:8,border:'2px solid #e74c3c',background:'#f8d7da',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',transition:'transform .15s'}} onMouseOver={e=>e.currentTarget.style.transform='scale(1.15)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}><i className="fas fa-times-circle" style={{color:'#e74c3c',fontSize:22}}></i></button>
                                            </div>
                                        }
                                    </td>
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Group average row */}
                <div style={{padding:'12px 16px',background:'#f8f9fa',borderTop:'2px solid #e0e0e0',fontWeight:700,fontSize:13}}>
                    {activeMonth} — {t('avgScores')}
                </div>
            </div>}

            {/* Topics Tab */}
            {activeTab === 'topics' && <div className="card">
                <div className="card-header">
                    <h2><i className="fas fa-book-open" style={{color:'#7b68ee'}}></i> {t('topicSequence')}</h2>
                    <button className="btn btn-primary btn-sm" onClick={() => { setTopicTitle(''); setTopicModal(true); }}><i className="fas fa-plus"></i> {t('add')}</button>
                </div>
                <div style={{padding:16}}>
                    {groupTopics.map((t, idx) => (
                        <div key={t.id} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',marginBottom:8,borderRadius:12,
                            background: t.status==='completed'?'#d4edda':t.status==='active'?'#e8e0ff':'#f5f5f5',
                            borderLeft: `4px solid ${t.status==='completed'?'#28a745':t.status==='active'?'#7b68ee':'#ccc'}`,
                            cursor:'pointer',transition:'all .2s'}}
                            onMouseOver={e => e.currentTarget.style.transform='translateX(4px)'}
                            onMouseOut={e => e.currentTarget.style.transform='none'}>
                            <div style={{width:36,height:36,borderRadius:10,background:t.status==='completed'?'#28a745':t.status==='active'?'#7b68ee':'#ccc',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>
                                {t.order}
                            </div>
                            <div style={{flex:1}}>
                                <div style={{fontWeight:600,fontSize:15}}>{t.title}</div>
                                <div style={{fontSize:12,color:'#888',marginTop:2}}>
                                    {t.status==='completed' ? `✅ O'tildi — ${t.date}` : t.status==='active' ? '🔵 Hozir otilmoqda' : '⬜ Kutilmoqda'}
                                </div>
                            </div>
                            <div style={{display:'flex',gap:6}}>
                                {t.status === 'upcoming' && (
                                    <button onClick={async () => {
                                        await api.updateTopic(t.id, { status:'active', date: today })
                                        refreshAll()
                                    }} style={{padding:'6px 14px',border:'none',borderRadius:8,background:'#7b68ee',color:'#fff',fontWeight:600,fontSize:12,cursor:'pointer'}}>
                                        <i className="fas fa-play"></i> O'tish
                                    </button>
                                )}
                                {t.status === 'active' && (
                                    <button onClick={async () => {
                                        await api.updateTopic(t.id, { status:'completed' })
                                        refreshAll()
                                    }} style={{padding:'6px 14px',border:'none',borderRadius:8,background:'#28a745',color:'#fff',fontWeight:600,fontSize:12,cursor:'pointer'}}>
                                        <i className="fas fa-check"></i> Tamomlandi
                                    </button>
                                )}
                                <button onClick={async () => {
                                    if (!confirm("O'chirmoqchimisiz?")) return
                                    await api.deleteTopic(t.id)
                                    refreshAll()
                                }} style={{padding:'6px 10px',border:'none',borderRadius:8,background:'#f8d7da',color:'#e74c3c',cursor:'pointer',fontSize:12}}>
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                    {groupTopics.length === 0 && <div style={{textAlign:'center',padding:40,color:'#888'}}><i className="fas fa-book-open" style={{fontSize:40,marginBottom:12,display:'block'}}></i> {t('noTopics')}</div>}
                </div>
            </div>}

            {/* Add Topic Modal */}
            {topicModal && <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={() => setTopicModal(false)}>
                <div style={{background:'#fff',borderRadius:16,padding:32,width:420,maxWidth:'90vw'}} onClick={e => e.stopPropagation()}>
                    <h3 style={{margin:0,fontSize:20,marginBottom:6}}><i className="fas fa-book-open" style={{color:'#7b68ee',marginRight:8}}></i> {t('topicAddTitle')}</h3>
                    <p style={{color:'#888',margin:'0 0 20px',fontSize:14}}>{selectedGroup?.name} {t('topicForGroupMsg')}</p>
                    <div style={{marginBottom:16}}>
                        <label style={{display:'block',fontWeight:600,fontSize:13,marginBottom:6}}>{t('topicNameLabel')}</label>
                        <input type="text" value={topicTitle} onChange={e => setTopicTitle(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && topicTitle.trim()) { api.addTopic({ groupId: selectedGroup.id, title: topicTitle.trim(), order: groupTopics.length + 1 }).then(() => { setTopicModal(false); refreshAll(); }) } }}
                            style={{width:'100%',padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:15}} placeholder="{t('topicNamePlaceholder')}" autoFocus />
                    </div>
                    <div style={{display:'flex',gap:10}}>
                        <button style={{flex:1,padding:'12px',border:'none',borderRadius:10,background:'#f5f5f5',cursor:'pointer',fontWeight:600}} onClick={() => setTopicModal(false)}>{t('cancel')}</button>
                        <button disabled={!topicTitle.trim()} style={{flex:1,padding:'12px',border:'none',borderRadius:10,background:topicTitle.trim()?'linear-gradient(135deg,#7b68ee,#5b5ea6)':'#ccc',color:'#fff',cursor:topicTitle.trim()?'pointer':'not-allowed',fontWeight:600,fontSize:15}} onClick={async () => {
                            if (!topicTitle.trim()) return
                            await api.addTopic({ groupId: selectedGroup.id, title: topicTitle.trim(), order: groupTopics.length + 1 })
                            setTopicModal(false)
                            refreshAll()
                        }}><i className="fas fa-plus"></i> Qo'shish</button>
                    </div>
                </div>
            </div>}

            {/* Grading & Coins Tab */}
            {activeTab === 'grading' && <div className="card">
                <div className="card-header">
                    <h2><i className="fas fa-star" style={{color:'#ffc107'}}></i> {t('tabGrading')} — {selectedGroup.name}</h2>
                </div>
                <div style={{padding:16}}>
                    <p style={{color:'#888',margin:'0 0 20px',fontSize:14}}>{t('gradingDesc')}</p>
                    {groupStudents.map(s => {
                        const g = groups.find(x => x.id === s.groupId)
                        const isEditing = gradeStudent?.id === s.id
                        return <div key={s.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',marginBottom:8,borderRadius:12,border: isEditing ? '2px solid #7b68ee' : '2px solid #f0f0f0',background: isEditing ? '#f8f7ff' : '#fff',transition:'all .2s'}}>
                            <div className="user-avatar" style={{width:36,height:36,fontSize:12,flexShrink:0}}>{s.avatar}</div>
                            <div style={{flex:1,minWidth:0}}>
                                <div style={{fontWeight:600,fontSize:14}}>{s.name}</div>
                                <div style={{fontSize:12,color:'#888'}}>💰 {s.coins || 0} coin</div>
                            </div>
                            {!isEditing ? (
                                <button onClick={() => { setGradeStudent(s); setGradeValue(5); setGradeCoins(0); setGradeNote(''); }} style={{padding:'8px 16px',border:'none',borderRadius:10,background:'linear-gradient(135deg,#ffc107,#ff9800)',color:'#fff',cursor:'pointer',fontWeight:600,fontSize:13,whiteSpace:'nowrap'}}>
                                    <i className="fas fa-star" style={{marginRight:4}}></i> {t('gradeStudent')}
                                </button>
                            ) : (
                                <div style={{display:'flex',flexDirection:'column',gap:10,minWidth:300}}>
                                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                                        <label style={{fontSize:12,fontWeight:600,minWidth:50}}>{t('gradeLabel')}</label>
                                        {[2,3,4,5].map(v => (
                                            <button key={v} onClick={() => setGradeValue(v)} style={{width:36,height:36,borderRadius:8,border: gradeValue===v?'2px solid #7b68ee':'2px solid #e0e0e0',background: gradeValue===v?'#7b68ee':'#fff',color: gradeValue===v?'#fff':'#333',cursor:'pointer',fontWeight:700,fontSize:14}}>{v}</button>
                                        ))}
                                    </div>
                                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                                        <label style={{fontSize:12,fontWeight:600,minWidth:50}}>{t('coinLabel')}</label>
                                        {[0,1,2,3,5].map(v => (
                                            <button key={v} onClick={() => setGradeCoins(v)} style={{padding:'6px 10px',borderRadius:8,border: gradeCoins===v?'2px solid #ffc107':'2px solid #e0e0e0',background: gradeCoins===v?'#fff3cd':'#fff',color: gradeCoins===v?'#b8860b':'#333',cursor:'pointer',fontWeight:600,fontSize:12}}>+{v}</button>
                                        ))}
                                    </div>
                                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                                        <input type="text" value={gradeNote} onChange={e => setGradeNote(e.target.value)} placeholder="{t('noteLabel')}" style={{flex:1,padding:'6px 10px',border:'2px solid #e0e0e0',borderRadius:8,fontSize:12}} />
                                        <button onClick={async () => {
                                            // Save grade
                                            await api.addGrade({ studentId: s.id, subject: user?.subject || 'Matematika', value: gradeValue, note: gradeNote })
                                            // Give coins if any
                                            if (gradeCoins > 0) {
                                                await api.giveCoinToStudent(s.id, gradeCoins, `Baho: ${gradeValue} — ${user?.subject || 'Matematika'}`)
                                            }
                                            setGradeStudent(null)
                                            refreshAll()
                                            alert(`${s.name}: ${gradeValue} baho${gradeCoins > 0 ? ', +' + gradeCoins + ' coin' : ''}`)
                                        }} style={{padding:'8px 16px',border:'none',borderRadius:8,background:'linear-gradient(135deg,#28a745,#20c997)',color:'#fff',cursor:'pointer',fontWeight:600,fontSize:13,whiteSpace:'nowrap'}}>
                                            <i className="fas fa-check" style={{marginRight:4}}></i> Saqlash
                                        </button>
                                        <button onClick={() => setGradeStudent(null)} style={{padding:'8px 10px',border:'2px solid #e0e0e0',borderRadius:8,background:'#fff',cursor:'pointer',fontSize:12}}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    })}
                </div>
            </div>}

            {/* Tests/Assignments Tab - Student Test Ratings */}
            {activeTab === 'tests' && <div className="card">
                <div className="card-header">
                    <h2><i className="fas fa-chart-bar" style={{color:'#7b68ee'}}></i> {t('studentTestRating')}</h2>
                </div>
                <div style={{padding:16}}>
                    {groupStudents.length > 0 ? (
                        <table>
                            <thead>
                                <tr><th>#</th><th>{t('navStudents')}</th><th>{t('navTests')}</th><th>{t('avgScore')} {t('score')}</th><th>{t('testsTitle')}</th><th>{t('totalCoins')}</th></tr>
                            </thead>
                            <tbody>{groupStudents.map((s, idx) => {
                                const myResults = testResults.filter(r => r.studentId === s.id)
                                const avgPct = myResults.length ? Math.round(myResults.reduce((a,r) => a+r.percentage, 0) / myResults.length) : 0
                                const bestPct = myResults.length ? Math.max(...myResults.map(r => r.percentage)) : 0
                                const totalCoins = myResults.reduce((a,r) => a + (r.coins||0), 0)
                                const color = avgPct >= 80 ? '#28a745' : avgPct >= 60 ? '#ffc107' : '#e74c3c'
                                return <tr key={s.id}>
                                    <td>{idx+1}</td>
                                    <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                                        <div className="user-avatar" style={{width:32,height:32,fontSize:11}}>{s.avatar}</div>
                                        <b>{s.name}</b>
                                    </div></td>
                                    <td><span className="badge badge-info">{myResults.length} ta</span></td>
                                    <td><span style={{color,fontWeight:700,fontSize:16}}>{avgPct}%</span></td>
                                    <td><span style={{color:bestPct>=80?'#28a745':'#ffc107',fontWeight:700}}>{bestPct}%</span></td>
                                    <td><span className="badge badge-gold">💰 {totalCoins}</span></td>
                                </tr>
                            })}</tbody>
                        </table>
                    ) : (
                        <div style={{textAlign:'center',padding:40,color:'#888'}}>
                            <i className="fas fa-chart-bar" style={{fontSize:40,marginBottom:12,display:'block'}}></i>
                            {t('noStudentsInGroup')}
                        </div>
                    )}
                </div>
            </div>}

            {/* Homework Tab */}
            {activeTab === 'homework' && <div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
                    <h2 style={{fontSize:20}}><i className="fas fa-home" style={{color:'#7b68ee'}}></i> {t('homeworkTitle')}</h2>
                    <button className="hw-add-btn" onClick={async () => {
                        const title = prompt(t('hwAddTitle'))
                        if (!title) return
                        const desc = prompt(t('hwAddDesc')) || ''
                        await api.addHomework({ subject: user?.subject||'Matematika', title, description: desc, deadline: today, groupId: selectedGroup.id })
                        refreshAll()
                    }}><i className="fas fa-plus"></i> Qo'shish</button>
                </div>
                <div className="homework-list">{groupHomeworks.map(hw => {
                    const completed = hw.completedIds?.length || 0
                    const total = hw.studentIds?.length || 0
                    return <div key={hw.id} className="homework-card normal">
                        <div className="hw-icon" style={{background:'#e8e0ff',color:'#7b68ee'}}><i className="fas fa-book"></i></div>
                        <div className="hw-body">
                            <div className="hw-title">{hw.title}</div>
                            <div className="hw-desc">{hw.description}</div>
                            <div className="hw-meta">
                                <span><i className="fas fa-bookmark"></i> {hw.subject}</span>
                                <span><i className="fas fa-calendar"></i> {hw.deadline}</span>
                            </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <span className="badge badge-info">{completed}/{total} {t('HWcompleted')}</span>
                            <button onClick={async () => {
                                const newTitle = prompt(t('hwTitleLabel'), hw.title)
                                if (newTitle === null) return
                                const newDesc = prompt(t('hwDescLabel'), hw.description)
                                if (newDesc === null) return
                                await api.updateHomework(hw.id, { title: newTitle, description: newDesc })
                                refreshAll()
                                showToast(t('hwEdited'))
                            }} style={{padding:'6px 12px',border:'none',borderRadius:8,background:'#ffc107',color:'#fff',cursor:'pointer',fontSize:12,fontWeight:600}} title="Tahrirlash">
                                <i className="fas fa-edit"></i>
                            </button>
                            <button onClick={async () => {
                                if (!confirm('O\'chirmoqchimisiz?')) return
                                await api.deleteHomework(hw.id)
                                refreshAll()
                            }} style={{padding:'6px 12px',border:'none',borderRadius:8,background:'#e74c3c',color:'#fff',cursor:'pointer',fontSize:12}} title="O'chirish">
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                })}
                {groupHomeworks.length === 0 && <div style={{textAlign:'center',padding:40,color:'#888'}}><i className="fas fa-home" style={{fontSize:40,marginBottom:12,display:'block'}}></i> Uy vazifalar hali berilmagan</div>}
                </div>
            </div>}
        </div>
    }

    const renderGrades = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-star" style={{color:'#ffc107'}}></i> Baholar</h2></div>
            <table><thead><tr><th>O'quvchi</th><th>Sinf</th><th>Fan</th><th>Baho</th><th>Sana</th></tr></thead>
            <tbody>{grades.filter(g => g.subject === user?.subject).map(g => {
                const s = users.find(u => u.id === g.studentId)
                return <tr key={g.id}><td><b>{s?.name||'-'}</b></td><td>{s?.className||'-'}</td><td><span className="badge badge-primary">{g.subject}</span></td>
                    <td><span className={`badge badge-${g.value>=4?'success':g.value>=3?'warning':'danger'}`}>{g.value}</span></td><td>{g.date}</td></tr>
            })}</tbody></table>
        </div>
    )

    const subjects = Object.keys(tests)
    const renderTests = () => {
        const questions = tests[selSubj] || []
        return <div className="tests-container">
            <div className="tests-sidebar"><h3>Fanlar</h3>
                {subjects.map(s => <button key={s} className={`subject-btn ${s===selSubj?'active':''}`} onClick={() => {setSelSubj(s);setAnswers({})}}>{s}</button>)}
                <button className="hw-add-btn" style={{marginTop:12}} onClick={async () => {
                    const title = prompt('Yangi testnomi:')
                    if (!title) return
                    await api.addTestResult({ studentId: user?.id, subject: selSubj, score: 0, total: 0, percentage: 0, coins: 0, date: today })
                    refreshAll()
                }}><i className="fas fa-plus"></i> Test qo'shish</button>
            </div>
            <div className="tests-main">
                {questions.map((q, i) => (
                    <div key={i} className="test-card">
                        <div style={{marginBottom:14}}><span className="question-num">{i+1}</span><span className="question-text">{q.q}</span></div>
                        <div className="options">{q.options.map((opt, j) => (
                            <button key={j} className={`option-btn ${answers[i]===j?'selected':''}`} onClick={() => setAnswers({...answers,[i]:j})}>
                                <span className="option-letter">{['A','B','C','D'][j]}</span>{opt}</button>
                        ))}</div>
                    </div>
                ))}
            </div>
        </div>
    }

    const renderResults = () => {
        const students = allStudents.filter(s => myGroups.some(g => g.id === s.groupId))
        const studentResults = students.map(s => {
            const results = testResults.filter(r => r.studentId === s.id)
            const subjectScores = {}
            subjects.forEach(sub => {
                const subResults = results.filter(r => r.subject === sub)
                if (subResults.length > 0) {
                    subjectScores[sub] = subResults.reduce((best, r) => r.percentage > best.percentage ? r : best, subResults[0])
                }
            })
            const avgPct = results.length ? Math.round(results.reduce((a,r) => a + r.percentage, 0) / results.length) : 0
            return { student: s, subjectScores, avgPct, totalTests: results.length }
        }).sort((a,b) => b.avgPct - a.avgPct)

        return <div className="card" style={{overflowX:'auto'}}>
            <div className="card-header"><h2><i className="fas fa-chart-bar" style={{color:'#7b68ee'}}></i> Test Natijalari — Reyting</h2></div>
            <table>
                <thead><tr><th>#</th><th>O'quvchi</th>
                    {subjects.map(sub => <th key={sub} style={{textAlign:'center',minWidth:80}}>{sub}</th>)}
                    <th style={{textAlign:'center'}}>O'rtacha</th>
                </tr></thead>
                <tbody>{studentResults.map((sr, idx) => (
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
        </div>
    }

    const renderCoins = () => {
        const myStudents = allStudents.filter(s => myGroups.some(g => g.id === s.groupId))
        return <div>
            {/* Teacher Coin Allocation Hero */}
            <div style={{background:'linear-gradient(135deg,#7b68ee,#5b5ea6)',borderRadius:16,padding:28,marginBottom:24,color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:20}}>
                <div>
                    <h2 style={{margin:0,fontSize:22}}><i className="fas fa-coins" style={{marginRight:10}}></i> {t('coinDistribution')}</h2>
                    <p style={{margin:'8px 0 0',opacity:0.8}}>{t('coinAllocDesc')}</p>
                </div>
                <div style={{textAlign:'center'}}>
                    <div style={{fontSize:42,fontWeight:800}}>{teacherAllocation.remaining}</div>
                    <div style={{fontSize:13,opacity:0.8}}>{t('remaining')}</div>
                </div>
            </div>
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16,marginBottom:24}}>
                <div style={{background:'#fff',borderRadius:12,padding:20,textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                    <div style={{fontSize:28,fontWeight:800,color:'#7b68ee'}}>{teacherAllocation.allocated}</div>
                    <div style={{fontSize:13,color:'#888',marginTop:4}}>{t('totalMonthly')}</div>
                </div>
                <div style={{background:'#fff',borderRadius:12,padding:20,textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                    <div style={{fontSize:28,fontWeight:800,color:'#ffc107'}}>{teacherAllocation.used}</div>
                    <div style={{fontSize:13,color:'#888',marginTop:4}}>{t('used')}</div>
                </div>
                <div style={{background:'#fff',borderRadius:12,padding:20,textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                    <div style={{fontSize:28,fontWeight:800,color:'#28a745'}}>{teacherAllocation.remaining}</div>
                    <div style={{fontSize:13,color:'#888',marginTop:4}}>{t('remaining')}</div>
                </div>
            </div>
            {/* Student List for Coin Distribution */}
            <div className="card">
                <div className="card-header">
                    <h2><i className="fas fa-user-graduate" style={{color:'#7b68ee'}}></i> {t('giveCoins')}</h2>
                </div>
                <table>
                    <thead><tr><th>#</th><th>{t('navStudents')}</th><th>{t('navGroups')}</th><th>{t('coins')}</th><th>{t('actions')}</th></tr></thead>
                    <tbody>{myStudents.map((s, idx) => {
                        const g = groups.find(x => x.id === s.groupId)
                        return <tr key={s.id}>
                            <td>{idx+1}</td>
                            <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                                <div className="user-avatar" style={{width:32,height:32,fontSize:11}}>{s.avatar}</div>
                                <b>{s.name}</b>
                            </div></td>
                            <td>{g?.name||'-'}</td>
                            <td><span style={{color:'#ffc107',fontWeight:700}}>💰 {s.coins||0}</span></td>
                            <td><button className="btn btn-primary btn-sm" onClick={() => { setCoinModal(s); setCoinAmount(''); setCoinReason(''); }}>
                                <i className="fas fa-gift"></i> {t('giveCoin')}
                            </button></td>
                        </tr>
                    })}</tbody>
                </table>
            </div>
            {/* Give Coin Modal */}
            {coinModal && <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}} onClick={() => setCoinModal(null)}>
                <div style={{background:'#fff',borderRadius:16,padding:32,width:400,maxWidth:'90vw'}} onClick={e => e.stopPropagation()}>
                    <h3 style={{margin:0,fontSize:20,marginBottom:8}}><i className="fas fa-gift" style={{color:'#ffc107',marginRight:8}}></i> {t('giveCoin')}</h3>
                    <p style={{color:'#888',margin:'0 0 20px',fontSize:14}}>{coinModal.name} {t('coinGiveTo')}</p>
                    <div style={{marginBottom:16}}>
                        <label style={{display:'block',fontWeight:600,fontSize:13,marginBottom:6}}>{t('coinAmount')}</label>
                        <input type="number" min="1" max={teacherAllocation.remaining} value={coinAmount} onChange={e => setCoinAmount(e.target.value)}
                            style={{width:'100%',padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:15}} placeholder="1, 5, 10..." />
                    </div>
                    <div style={{marginBottom:20}}>
                        <label style={{display:'block',fontWeight:600,fontSize:13,marginBottom:6}}>{t('coinReason')}</label>
                        <input type="text" value={coinReason} onChange={e => setCoinReason(e.target.value)}
                            style={{width:'100%',padding:'10px 14px',border:'2px solid #e0e0e0',borderRadius:10,fontSize:14}} placeholder="{t('coinGivePlaceholder')}" />
                    </div>
                    <div style={{display:'flex',gap:10}}>
                        <button style={{flex:1,padding:'12px',border:'none',borderRadius:10,background:'#f5f5f5',cursor:'pointer',fontWeight:600}} onClick={() => setCoinModal(null)}>{t('cancel')}</button>
                        <button style={{flex:1,padding:'12px',border:'none',borderRadius:10,background:'linear-gradient(135deg,#ffc107,#ff9800)',color:'#fff',cursor:'pointer',fontWeight:600,fontSize:15}} onClick={async () => {
                            const amt = parseInt(coinAmount)
                            if (!amt || amt <= 0) return alert(t('coinEnterAmount'))
                            if (amt > teacherAllocation.remaining) return alert(t('coinNotEnough'))
                            const res = await api.giveCoinToStudent(coinModal.id, amt, coinReason)
                            if (res?.error) return alert(res.error)
                            setCoinModal(null)
                            refreshAll()
                            alert(`${coinModal.name} ga ${amt} coin berildi!`)
                        }}><i className="fas fa-paper-plane"></i> Yuborish</button>
                    </div>
                </div>
            </div>}
        </div>
    }

    const renderProfile = () => (
        <div className="profile-layout"><div className="profile-main">
            <div className="profile-avatar-lg">{user?.avatar}</div><div className="profile-name">{user?.name}</div>
            <span className="profile-role-badge" style={{background:'#d4edda',color:'#28a745'}}>{user?.role}</span>
            <div className="profile-fields">
                <div className="profile-field"><span className="pf-label">Telefon</span><span className="pf-value">{user?.phone}</span></div>
                <div className="profile-field"><span className="pf-label">Fan</span><span className="pf-value">{user?.subject}</span></div>
                <div className="profile-field"><span className="pf-label">Guruhlar</span><span className="pf-value">{myGroups.map(g=>g.name).join(', ')}</span></div>
                <div className="profile-field"><span className="pf-label">Coinlar</span><span className="pf-value" style={{color:'#ffc107'}}>💰 {user?.coins||0}</span></div>
            </div></div></div>
    )

    const pages = { dashboard:renderDashboard, classes:renderClasses, grades:renderGrades, tests:renderTests, results:renderResults, coins:renderCoins, profile:renderProfile }

    return <Layout navItems={navItems} title="O'qituvchi">{({ currentPage }) => {
        if (currentPage === 'classes') return renderClasses()
        return (pages[currentPage] || renderDashboard)()
    }}</Layout>
}