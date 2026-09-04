import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import { api } from '../api'
import Layout from '../components/Layout'
import { useLang } from '../components/LanguageContext'

export default function Oquvchi() {
    const { user } = useContext(AuthContext)
    const { t } = useLang()
    const [users, setUsers] = useState([])
    const [groups, setGroups] = useState([])
    const [attendance, setAttendance] = useState({})
    const [grades, setGrades] = useState([])
    const [homeworks, setHomeworks] = useState([])
    const [coinHistory, setCoinHistory] = useState([])
    const [shopItems, setShopItems] = useState([])
    const [ownedItems, setOwnedItems] = useState([])
    const [tests, setTests] = useState({})
    const [selectedSubject, setSelectedSubject] = useState('Matematika')
    const [testAnswers, setTestAnswers] = useState({})
    const [testSubmitted, setTestSubmitted] = useState(false)
    const [testResult, setTestResult] = useState(null)
    const [payments, setPayments] = useState([])
    const [paymentHistory, setPaymentHistory] = useState([])
    const [showOnlinePay, setShowOnlinePay] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [payInputAmount, setPayInputAmount] = useState('')

    const getToday = () => {
        const now = new Date()
        const uzb = new Date(now.getTime() + (5 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000))
        return uzb.toISOString().split('T')[0]
    }
    const today = getToday()

    const navItems = [
        { id:'dashboard', icon:'fa-chart-pie', labelKey:'navDashboard' },
        { sectionKey:'sectionStudy' },
        { id:'attendance', icon:'fa-clipboard-check', labelKey:'navMyAttendance' },
        { id:'grades', icon:'fa-star', labelKey:'navMyGrades' },
        { id:'homework', icon:'fa-book-open', labelKey:'navMyHomework' },
        { id:'tests', icon:'fa-file-alt', labelKey:'navTests' },
        { sectionKey:'sectionPayments' },
        { id:'payments', icon:'fa-credit-card', labelKey:'navPayments' },
        { sectionKey:'sectionShop' },
        { id:'coins', icon:'fa-coins', labelKey:'navMyCoins' },
        { id:'shop', icon:'fa-shopping-bag', labelKey:'navShop' },
        { sectionKey:'sectionPersonal' },
        { id:'profile', icon:'fa-user-circle', labelKey:'navProfile' },
    ]

    const refreshAll = () => {
        api.getUsers().then(d => d && setUsers(d))
        api.getGroups().then(d => d && setGroups(d))
        api.getGrades().then(d => d && setGrades(d))
        api.getHomeworks().then(d => d && setHomeworks(d))
        api.getCoinHistory().then(d => d && setCoinHistory(d))
        api.getShopItems().then(d => d && setShopItems(d))
        api.getOwnedItems().then(d => d && setOwnedItems(d))
        api.getTests().then(d => d && setTests(d))
        api.getAttendance(today).then(d => d && setAttendance(d))
        api.getPayments().then(d => d && setPayments(d))
        api.getPaymentHistory().then(d => d && setPaymentHistory(d))
    }
    useEffect(() => { refreshAll() }, [])

    const myAttendance = Object.keys(attendance).filter(d => attendance[d] === 'present').length
    const myGrades = grades.filter(g => g.studentId === user?.id)
    const avgGrade = myGrades.length ? (myGrades.reduce((a, g) => a + g.value, 0) / myGrades.length).toFixed(1) : '-'
    const pendingHw = homeworks.filter(h => !h.completedIds?.includes(user?.id)).length

    // ===== DASHBOARD =====
    const renderDashboard = () => (
        <div>
            <div style={{marginBottom:24}}>
                <h2 style={{fontSize:22,fontWeight:700,margin:0}}>{t('greeting')}, {user?.name?.split(' ')[0]}! 👋</h2>
                <p style={{color:'#888',margin:'4px 0 0',fontSize:14}}>{t('todayStats')}</p>
            </div>
            <div className="stats-grid">
                <div className="stat-card purple"><div className="stat-icon"><i className="fas fa-clipboard-check"></i></div><div className="stat-value">{myAttendance}</div><div className="stat-label">{t('dashAttendance')}</div></div>
                <div className="stat-card green"><div className="stat-icon"><i className="fas fa-star"></i></div><div className="stat-value">{avgGrade}</div><div className="stat-label">{t('dashAvgGrade')}</div></div>
                <div className="stat-card orange"><div className="stat-icon"><i className="fas fa-coins"></i></div><div className="stat-value">{user?.coins||0}</div><div className="stat-label">{t('dashMyCoins')}</div></div>
                <div className="stat-card red"><div className="stat-icon"><i className="fas fa-book-open"></i></div><div className="stat-value">{pendingHw}</div><div className="stat-label">{t('dashPendingHW')}</div></div>
            </div>
        </div>
    )

    // ===== DAVOMATIM =====
    const renderAttendance = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-clipboard-check" style={{color:'#7b68ee'}}></i> {t('navMyAttendance')}</h2></div>
            <div style={{padding:20,textAlign:'center'}}>
                <div style={{width:80,height:80,borderRadius:20,background:'linear-gradient(135deg,#7b68ee,#5b5ea6)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:36,margin:'0 auto 16px'}}>{user?.avatar}</div>
                <h3 style={{margin:'0 0 4px',fontSize:20}}>{user?.name}</h3>
                <p style={{color:'#888',margin:'0 0 16px',fontSize:14}}>{user?.className || ''}</p>
                <span className={`badge badge-${attendance[user?.id]==='present'?'success':attendance[user?.id]==='absent'?'danger':'warning'}`} style={{fontSize:16,padding:'8px 20px'}}>
                    {attendance[user?.id]==='present'?'✅ Bor':attendance[user?.id]==='absent'?"❌ Yo'q":attendance[user?.id]==='late'?'⏰ Kech':'— Hali belgilanmagan'}
                </span>
            </div>
        </div>
    )

    // ===== BAHOLARIM =====
    const renderGrades = () => (
        <div className="card">
            <div className="card-header"><h2><i className="fas fa-star" style={{color:'#ffc107'}}></i> {t('navMyGrades')}</h2></div>
            {myGrades.length > 0 ? (
                <table><thead><tr><th>{t('subject')}</th><th>{t('grade')}</th><th>{t('date')}</th></tr></thead>
                <tbody>{myGrades.map(g => <tr key={g.id}>
                    <td><span className="badge badge-primary">{g.subject}</span></td>
                    <td><span className={`badge badge-${g.value>=4?'success':g.value>=3?'warning':'danger'}`} style={{fontSize:16,padding:'4px 12px'}}>{g.value}</span></td>
                    <td style={{color:'#888'}}>{g.date}</td>
                </tr>)}</tbody></table>
            ) : <div style={{textAlign:'center',padding:40,color:'#888'}}><i className="fas fa-star" style={{fontSize:40,marginBottom:12,display:'block',opacity:0.3}}></i>Hali baho qo'yilmagan</div>}
        </div>
    )

    // ===== UYGA VAZIFALAR =====
    const renderHomework = () => (
        <div>
            <h2 style={{fontSize:20,marginBottom:20}}><i className="fas fa-book-open" style={{color:'#7b68ee'}}></i> {t('navMyHomework')}</h2>
            <div className="homework-list">{homeworks.map(hw => {
                const isCompleted = hw.completedIds?.includes(user?.id)
                const teacher = users.find(u => u.id === hw.teacherId)
                return <div key={hw.id} className={`homework-card ${isCompleted?'done':'normal'}`}>
                    <div className="hw-icon" style={{background:'#e8e0ff',color:'#7b68ee'}}><i className="fas fa-book"></i></div>
                    <div className="hw-body">
                        <div className="hw-title">{hw.title}</div>
                        <div className="hw-desc">{hw.description}</div>
                        <div className="hw-meta">
                            <span><i className="fas fa-bookmark"></i> {hw.subject}</span>
                            <span><i className="fas fa-calendar"></i> {hw.deadline}</span>
                            {teacher && <span><i className="fas fa-user"></i> {teacher.name}</span>}
                        </div>
                    </div>
                    <button className={`hw-status-btn ${isCompleted?'completed':'pending'}`} onClick={async () => { await api.toggleHomework(hw.id); refreshAll(); }}>
                        {isCompleted ? '✅ Bajarildi' : 'Kutilmoqda'}
                    </button>
                </div>
            })}</div>
            {homeworks.length === 0 && <div style={{textAlign:'center',padding:40,color:'#888'}}><i className="fas fa-book-open" style={{fontSize:40,marginBottom:12,display:'block',opacity:0.3}}></i>Hali uyga vazifa berilmagan</div>}
        </div>
    )

    // ===== TESTLAR =====
    const renderTests = () => {
        const questions = tests[selectedSubject] || []
        const handleAnswer = (qi, ai) => { if (!testSubmitted) setTestAnswers({ ...testAnswers, [qi]: ai }) }
        const submitTest = async () => {
            if (Object.keys(testAnswers).length < questions.length) return alert('Barcha javoblarni bering!')
            const score = questions.filter((q, i) => testAnswers[i] === q.correct).length
            const result = await api.submitTestResult({ subject: selectedSubject, score, total: questions.length, answers: testAnswers })
            setTestResult(result); setTestSubmitted(true); refreshAll()
        }
        const resetTest = () => { setTestAnswers({}); setTestSubmitted(false); setTestResult(null) }
        const score = testSubmitted ? questions.filter((q, i) => testAnswers[i] === q.correct).length : 0
        const pct = testSubmitted ? Math.round((score / questions.length) * 100) : 0

        return <div className="tests-container">
            <div className="tests-sidebar"><h3>Fanlar</h3>
                {Object.keys(tests).map(s => <button key={s} className={`subject-btn ${s===selectedSubject?'active':''}`} onClick={() => { setSelectedSubject(s); setTestAnswers({}); setTestSubmitted(false); setTestResult(null); }}>{s}</button>)}
                {testSubmitted && <div style={{marginTop:20,padding:16,background: pct >= 70 ? '#d4edda' : '#f8d7da',borderRadius:12,textAlign:'center'}}>
                    <div style={{fontSize:36,fontWeight:800,color: pct >= 70 ? '#28a745' : '#e74c3c'}}>{score}/{questions.length}</div>
                    <div style={{fontSize:16,fontWeight:600,color: pct >= 70 ? '#155724' : '#721c24'}}>{pct}%</div>
                    {testResult?.coins > 0 && <div style={{marginTop:8,fontSize:14,color:'#555'}}>🪙 {testResult.coins} coin olindingiz!</div>}
                    <button onClick={resetTest} style={{marginTop:12,padding:'8px 16px',background:'#7b68ee',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>🔄 Qaytadan</button>
                </div>}
            </div>
            <div className="tests-main">
                {questions.map((q, i) => {
                    const isCorrect = testSubmitted && testAnswers[i] === q.correct
                    const isWrong = testSubmitted && testAnswers[i] !== undefined && testAnswers[i] !== q.correct
                    return <div key={i} className="test-card" style={{border: testSubmitted ? (isCorrect ? '3px solid #28a745' : isWrong ? '3px solid #e74c3c' : '3px solid #ffc107') : '1px solid #eee'}}>
                        <div style={{marginBottom:14}}>
                            <span className="question-num" style={{background: testSubmitted ? (isCorrect ? '#28a745' : isWrong ? '#e74c3c' : '#7b68ee') : '#7b68ee'}}>{i+1}</span>
                            <span className="question-text">{q.q}</span>
                            {testSubmitted && isWrong && <span style={{marginLeft:8,fontSize:14,color:'#e74c3c',fontWeight:600}}>❌ Noto'g'ri</span>}
                            {testSubmitted && isCorrect && <span style={{marginLeft:8,fontSize:14,color:'#28a745',fontWeight:600}}>✅ To'g'ri!</span>}
                        </div>
                        <div className="options">{q.options.map((opt, j) => {
                            let cls = 'option-btn'
                            if (testAnswers[i] === j) cls += ' selected'
                            if (testSubmitted && j === q.correct) cls = 'option-btn correct-answer'
                            if (testSubmitted && testAnswers[i] === j && j !== q.correct) cls = 'option-btn wrong-answer'
                            return <button key={j} className={cls} onClick={() => handleAnswer(i, j)}>
                                <span className="option-letter">{['A','B','C','D'][j]}</span>{opt}
                                {testSubmitted && j === q.correct && <span style={{marginLeft:'auto',fontSize:18}}>✅</span>}
                                {testSubmitted && testAnswers[i] === j && j !== q.correct && <span style={{marginLeft:'auto',fontSize:18}}>❌</span>}
                            </button>
                        })}</div>
                    </div>
                })}
                {questions.length > 0 && !testSubmitted && <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:16}} onClick={submitTest}><i className="fas fa-check"></i> Testni topshirish</button>}
            </div>
        </div>
    }

    // ===== COINLARIM =====
    const renderCoins = () => {
        const earned = coinHistory.filter(c => c.type === 'earn')
        const spent = coinHistory.filter(c => c.type === 'spend')
        return <div>
            <div style={{background:'linear-gradient(135deg,#ffc107,#ff9800)',borderRadius:16,padding:28,marginBottom:24,color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div><h2 style={{margin:0,fontSize:22}}>🪙 {t('navMyCoins')}</h2><p style={{margin:'8px 0 0',opacity:0.8}}>Jami coin miqdoringiz</p></div>
                <div style={{textAlign:'center'}}><div style={{fontSize:42,fontWeight:800}}>{user?.coins||0}</div><div style={{fontSize:13,opacity:0.8}}>coin</div></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                <div className="card">
                    <div className="card-header"><h2><i className="fas fa-arrow-up" style={{color:'#28a745'}}></i> Topshirilgan ({earned.length})</h2></div>
                    <div style={{padding:16,maxHeight:400,overflow:'auto'}}>
                        {earned.slice().reverse().map(c => <div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #f5f5f5'}}>
                            <div><div style={{fontWeight:600,fontSize:14}}>{c.reason}</div><div style={{fontSize:12,color:'#888'}}>{c.date}</div></div>
                            <span style={{fontWeight:700,color:'#28a745',fontSize:16}}>+{c.amount}</span>
                        </div>)}
                        {earned.length === 0 && <div style={{textAlign:'center',padding:20,color:'#aaa'}}>Hali coin olinmagan</div>}
                    </div>
                </div>
                <div className="card">
                    <div className="card-header"><h2><i className="fas fa-arrow-down" style={{color:'#e74c3c'}}></i> Sarflangan ({spent.length})</h2></div>
                    <div style={{padding:16,maxHeight:400,overflow:'auto'}}>
                        {spent.slice().reverse().map(c => <div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #f5f5f5'}}>
                            <div><div style={{fontWeight:600,fontSize:14}}>{c.reason}</div><div style={{fontSize:12,color:'#888'}}>{c.date}</div></div>
                            <span style={{fontWeight:700,color:'#e74c3c',fontSize:16}}>-{c.amount}</span>
                        </div>)}
                        {spent.length === 0 && <div style={{textAlign:'center',padding:20,color:'#aaa'}}>Hali coin sarflanmagan</div>}
                    </div>
                </div>
            </div>
        </div>
    }

    // ===== DO'KON =====
    const renderShop = () => (
        <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h2 style={{fontSize:20}}><i className="fas fa-shopping-bag" style={{color:'#7b68ee'}}></i> Do'kon</h2>
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 18px',background:'#fff3cd',borderRadius:12}}>
                    <i className="fas fa-coins" style={{color:'#ffc107',fontSize:20}}></i>
                    <span style={{fontSize:20,fontWeight:800,color:'#b8860b'}}>{user?.coins||0}</span>
                </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:20}}>
                {shopItems.map(item => {
                    const owned = ownedItems.find(o => o.itemId === item.id)
                    const stockLeft = item.stock !== undefined ? item.stock : 0
                    const canBuy = (user?.coins||0) >= item.price && !owned && stockLeft > 0
                    return <div key={item.id} style={{background:'#fff',borderRadius:16,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1px solid #f0f0f0'}}>
                        <div style={{background:'#f8f9fa',padding:20,display:'flex',justifyContent:'center',alignItems:'center',height:140}}>
                            <span style={{fontSize:60}}>{item.icon}</span>
                        </div>
                        <div style={{padding:16}}>
                            <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{item.name}</div>
                            <div style={{fontSize:13,color:'#888',marginBottom:12}}>{item.desc}</div>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                <div style={{display:'flex',alignItems:'center',gap:6}}>
                                    <span style={{fontSize:18,fontWeight:800,color:'#7b68ee'}}>{item.price}</span>
                                    <span style={{fontSize:13,color:stockLeft > 0 ? '#888' : '#e74c3c'}}>{stockLeft > 0 ? stockLeft + ' ta qoldi' : 'Tugadi'}</span>
                                </div>
                            </div>
                            {owned ? <div style={{textAlign:'center',padding:'10px',background:'#d4edda',borderRadius:10,fontWeight:600,color:'#28a745',marginTop:10}}>✅ Sotib olindi</div> :
                                <button style={{width:'100%',padding:'12px',background:canBuy ? '#7b68ee' : '#e0e0e0',color:canBuy ? '#fff' : '#999',border:'none',borderRadius:10,fontWeight:600,fontSize:14,cursor:canBuy ? 'pointer' : 'not-allowed',marginTop:10}} disabled={!canBuy} onClick={async () => {
                                    const pass = prompt('Parolni kiriting:')
                                    if (pass !== user?.password) return alert('Parol xato!')
                                    const res = await api.buyItem(item.id)
                                    if (res?.coins !== undefined) { refreshAll(); alert('Sotib olindi!') }
                                }}>{canBuy ? '🛒 Sotib olish' : stockLeft <= 0 ? 'Tugadi' : 'Yetarli emas'}</button>
                            }
                        </div>
                    </div>
                })}
            </div>
        </div>
    )

    // ===== TO'LOVLARIM =====
    const renderPayments = () => {
        const myPayments = payments.filter(p => p.studentId === user?.id)
        const unpaid = myPayments.filter(p => p.status !== 'paid')
        const paid = myPayments.filter(p => p.status === 'paid')
        const totalDue = unpaid.reduce((s, p) => s + (p.amount - (p.paidAmount || 0)), 0)
        const totalPaid = paid.reduce((s, p) => s + p.amount, 0)

        const handleOnlinePay = async () => {
            if (!selectedPayment) return
            const amount = payInputAmount ? parseFloat(payInputAmount) : (selectedPayment.amount - (selectedPayment.paidAmount || 0))
            if (amount <= 0) return alert('Summa notogri!')
            const res = await api.payPayment(selectedPayment.id, 'online', amount)
            if (res?.success) { alert(`Online tolov ${amount.toLocaleString()} so'm amalga oshirildi! ✅`); setShowOnlinePay(false); setSelectedPayment(null); setPayInputAmount(''); refreshAll() }
        }

        const handleCashPay = async (p) => {
            const remaining = p.amount - (p.paidAmount || 0)
            const res = await api.payPayment(p.id, 'cash', remaining)
            if (res?.success) { alert(`Naqd tolov ${remaining.toLocaleString()} so'm qabul qilindi! ✅`); refreshAll() }
        }

        if (showOnlinePay && selectedPayment) {
            const remaining = selectedPayment.amount - (selectedPayment.paidAmount || 0)
            const displayAmount = payInputAmount ? parseFloat(payInputAmount) : remaining
            return <div>
                <button onClick={() => { setShowOnlinePay(false); setSelectedPayment(null); }} style={{background:'none',border:'none',color:'#7b68ee',fontSize:16,fontWeight:600,cursor:'pointer',marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
                    <i className="fas fa-arrow-left"></i> Orqaga
                </button>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:30}}>
                    <div style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                        <h3 style={{margin:0,fontSize:18,fontWeight:700,marginBottom:20}}>To'lov ma'lumotlari</h3>
                        <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #f0f0f0'}}><span style={{color:'#888'}}>O'quvchi</span><span style={{fontWeight:600}}>{user?.name}</span></div>
                        <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #f0f0f0'}}><span style={{color:'#888'}}>Filial</span><span style={{fontWeight:600}}>MAKTAB 1</span></div>
                        <div style={{display:'flex',justifyContent:'space-between',padding:'16px 0'}}><span style={{color:'#888'}}>To'lov uchun</span><span style={{fontWeight:800,fontSize:22}}>{remaining.toLocaleString()} so'm</span></div>
                    </div>
                    <div style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                        <h3 style={{margin:0,fontSize:18,fontWeight:700,marginBottom:20}}>Summani kiriting</h3>
                        <div style={{position:'relative',marginBottom:16}}>
                            <input type="number" value={payInputAmount} onChange={e => setPayInputAmount(e.target.value)} placeholder={String(remaining)} style={{width:'100%',padding:'16px 60px 16px 16px',border:'2px solid #e0e0e0',borderRadius:12,fontSize:20,fontWeight:700,boxSizing:'border-box'}} />
                            <span style={{position:'absolute',right:16,top:'50%',transform:'translateY(-50%)',color:'#888',fontSize:15}}>so'm</span>
                        </div>
                        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:20}}>
                            {[1000000, 990000, 10000].map(amt => <button key={amt} onClick={() => setPayInputAmount(String(amt))} style={{padding:'8px 16px',border:'1px solid #e0e0e0',borderRadius:8,background:'#fff',fontSize:14,fontWeight:600,cursor:'pointer'}}>{amt.toLocaleString()} so'm</button>)}
                        </div>
                        <button onClick={handleOnlinePay} style={{width:'100%',padding:'16px',background:'#ff6b35',color:'#fff',border:'none',borderRadius:12,fontSize:16,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                            To'lov qilish {displayAmount.toLocaleString()} so'm <i className="fas fa-chevron-right"></i>
                        </button>
                        <p style={{textAlign:'center',color:'#aaa',fontSize:13,marginTop:12}}>To'lov xavfsiz kanallar orqali amalga oshiriladi</p>
                    </div>
                </div>
                <div style={{background:'#fff',borderRadius:16,padding:24,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
                    <h3 style={{margin:0,fontSize:18,fontWeight:700,marginBottom:20}}>To'lov tarixi</h3>
                    {paymentHistory.length === 0 ? <p style={{color:'#aaa',textAlign:'center',padding:20}}>Hali to'lov tarixi yo'q</p> :
                        paymentHistory.slice().reverse().map(h => <div key={h.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:'1px solid #f5f5f5'}}>
                            <div><div style={{fontWeight:700,fontSize:16}}>{h.amount.toLocaleString()} so'm</div><div style={{color:'#888',fontSize:13}}>{h.date} {h.time || ''}</div></div>
                            <span style={{padding:'4px 12px',borderRadius:6,fontSize:12,fontWeight:600,background:'#fff3cd',color:'#856404'}}>Kutilmoqda</span>
                        </div>)}
                </div>
            </div>
        }

        return <div>
            <div className="stats-grid">
                <div className="stat-card red"><div className="stat-icon"><i className="fas fa-exclamation-circle"></i></div><div className="stat-value">{unpaid.length}</div><div className="stat-label">To'lanmagan</div></div>
                <div className="stat-card green"><div className="stat-icon"><i className="fas fa-check-circle"></i></div><div className="stat-value">{paid.length}</div><div className="stat-label">To'langan</div></div>
                <div className="stat-card orange"><div className="stat-icon"><i className="fas fa-money-bill-wave"></i></div><div className="stat-value">{totalDue.toLocaleString()}</div><div className="stat-label">Qarz (so'm)</div></div>
                <div className="stat-card purple"><div className="stat-icon"><i className="fas fa-receipt"></i></div><div className="stat-value">{totalPaid.toLocaleString()}</div><div className="stat-label">To'langan (so'm)</div></div>
            </div>
            {unpaid.length > 0 && <div className="card" style={{marginBottom:20}}>
                <div className="card-header"><h2><i className="fas fa-exclamation-triangle" style={{color:'#e74c3c'}}></i> To'lanmagan to'lovlar</h2></div>
                <div style={{padding:16}}>{unpaid.map(p => {
                    const remaining = p.amount - (p.paidAmount || 0)
                    return <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',marginBottom:8,borderRadius:12,border:'1px solid #f0f0f0',background:'#fff'}}>
                        <div>
                            <div style={{fontWeight:700,fontSize:16}}><i className="fas fa-calendar" style={{marginRight:8,color:'#888'}}></i>{p.month}</div>
                            <div style={{fontSize:14,color:'#888',marginTop:4}}>{p.amount.toLocaleString()} so'm</div>
                            {p.paidAmount > 0 && <div style={{fontSize:12,color:'#ffc107',marginTop:2}}>Qisman: {p.paidAmount.toLocaleString()} so'm</div>}
                        </div>
                        <div style={{display:'flex',gap:8}}>
                            <button style={{padding:'10px 16px',background:'#7b68ee',color:'#fff',border:'none',borderRadius:10,fontWeight:600,cursor:'pointer',fontSize:13}} onClick={() => { setSelectedPayment(p); setPayInputAmount(String(remaining)); setShowOnlinePay(true); }}><i className="fas fa-credit-card"></i> Online To'lash</button>
                            <button style={{padding:'10px 16px',background:'#28a745',color:'#fff',border:'none',borderRadius:10,fontWeight:600,cursor:'pointer',fontSize:13}} onClick={() => handleCashPay(p)}><i className="fas fa-money-bill-wave"></i> Naqd To'lash</button>
                        </div>
                    </div>
                })}</div>
            </div>}
            {paid.length > 0 && <div className="card">
                <div className="card-header"><h2><i className="fas fa-check-circle" style={{color:'#28a745'}}></i> To'langan to'lovlar</h2></div>
                <table><thead><tr><th>Oy</th><th>Summa</th><th>Sana</th><th>Usul</th><th>Holat</th></tr></thead>
                <tbody>{paid.map(p => <tr key={p.id}>
                    <td><b>{p.month}</b></td><td>{p.amount.toLocaleString()} so'm</td><td>{p.paidDate || '-'}</td>
                    <td>{p.payMethod === 'online' ? <span className="badge badge-info"><i className="fas fa-credit-card"></i> Online</span> : <span className="badge badge-warning"><i className="fas fa-money-bill"></i> Naqd</span>}</td>
                    <td><span className="badge badge-success">✅ To'langan</span></td>
                </tr>)}</tbody></table>
            </div>}
        </div>
    }

    // ===== PROFILIM =====
    const renderProfile = () => {
        const group = groups.find(g => g.id === user?.groupId)
        return <div className="profile-layout"><div className="profile-main">
            <div className="profile-avatar-lg">{user?.avatar}</div><div className="profile-name">{user?.name}</div>
            <span className="profile-role-badge" style={{background:'#fff3cd',color:'#ffc107'}}>{user?.role}</span>
            <div className="profile-fields">
                <div className="profile-field"><span className="pf-label">Telefon</span><span className="pf-value">{user?.phone}</span></div>
                {group && <div className="profile-field"><span className="pf-label">Guruh</span><span className="pf-value">{group.name}</span></div>}
                {user?.className && <div className="profile-field"><span className="pf-label">Sinf</span><span className="pf-value">{user.className}</span></div>}
                <div className="profile-field"><span className="pf-label">Coinlar</span><span className="pf-value" style={{color:'#ffc107'}}>💰 {user?.coins||0}</span></div>
                <div className="profile-field"><span className="pf-label">ID</span><span className="pf-value">{user?.id}</span></div>
            </div></div></div>
    }

    const pages = { dashboard:renderDashboard, attendance:renderAttendance, grades:renderGrades, homework:renderHomework, tests:renderTests, coins:renderCoins, shop:renderShop, payments:renderPayments, profile:renderProfile }

    return <Layout navItems={navItems} title="O'quvchi">{({ currentPage }) => (pages[currentPage] || renderDashboard)()}</Layout>
}
