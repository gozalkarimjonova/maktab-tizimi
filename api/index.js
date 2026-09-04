import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const JWT_SECRET = 'maktab-secret-key-2026';

app.use(cors());
app.use(express.json());

// ==================== IN-MEMORY DATA STORE ====================
// Vercel serverless = no persistent file storage, use in-memory
let db = null;

function initDB() {
    return {
        users: [
            { id:'u1', name:'Abdullayev Sardor', phone:'+998901111111', password: bcrypt.hashSync('dir123',8), role:'direktor', avatar:'AS', coins:0 },
            { id:'u2', name:'Karimova Nilufar', phone:'+998902222222', password: bcrypt.hashSync('tea123',8), role:'oqituvchi', avatar:'KN', subject:'Matematika', coins:0 },
            { id:'u3', name:'Abdullayev Sardor', phone:'+998903333333', password: bcrypt.hashSync('stu123',8), role:'oquvchi', avatar:'AS', groupId:'g1', className:'5-sinf', coins:50 },
            { id:'u4', name:'Toshmatov Admin', phone:'+998904444444', password: bcrypt.hashSync('adm123',8), role:'admin', avatar:'TA', coins:0 },
            { id:'u5', name:'Ergasheva Malika', phone:'+998902222223', password: bcrypt.hashSync('tea124',8), role:'oqituvchi', avatar:'EM', subject:'Ona tili', coins:0 },
            { id:'u6', name:'Toshmatov Temur', phone:'+998903333334', password: bcrypt.hashSync('stu124',8), role:'oquvchi', avatar:'TT', groupId:'g1', className:'5-sinf', coins:30 },
            { id:'u7', name:'Karimova Nilufar', phone:'+998903333335', password: bcrypt.hashSync('stu125',8), role:'oquvchi', avatar:'KN', groupId:'g1', className:'5-sinf', coins:75 },
            { id:'u8', name:'Ergashev Jasur', phone:'+998903333336', password: bcrypt.hashSync('stu126',8), role:'oquvchi', avatar:'EJ', groupId:'g2', className:'6-sinf', coins:20 },
            { id:'u9', name:'Karimova Sabohat', phone:'+998902222224', password: bcrypt.hashSync('tea125',8), role:'oqituvchi', avatar:'KS', subject:'Tarix', coins:0 },
            { id:'u10', name:'Rahimov Bobur', phone:'+998903333337', password: bcrypt.hashSync('stu127',8), role:'oquvchi', avatar:'RB', groupId:'g2', className:'6-sinf', coins:40 },
            { id:'u11', name:'Nazarova Dildora', phone:'+998903333338', password: bcrypt.hashSync('stu128',8), role:'oquvchi', avatar:'ND', groupId:'g2', className:'6-sinf', coins:35 },
            { id:'u12', name:'Mirzoev Sardor', phone:'+998903333339', password: bcrypt.hashSync('stu129',8), role:'oquvchi', avatar:'MS', groupId:'g2', className:'6-sinf', coins:45 },
            { id:'u13', name:'Aliyeva Malika', phone:'+998903333340', password: bcrypt.hashSync('stu130',8), role:'oquvchi', avatar:'AM', groupId:'g2', className:'6-sinf', coins:60 },
            { id:'u14', name:'Rustamov Oybek', phone:'+998903333341', password: bcrypt.hashSync('stu131',8), role:'oquvchi', avatar:'RO', groupId:'g2', className:'6-sinf', coins:25 },
            { id:'u15', name:'Xolmatov Otabek', phone:'+998903333342', password: bcrypt.hashSync('stu132',8), role:'oquvchi', avatar:'XO', groupId:'g1', className:'5-sinf', coins:55 },
            { id:'u16', name:'Jumaev Baxtiyor', phone:'+998903333343', password: bcrypt.hashSync('stu133',8), role:'oquvchi', avatar:'JB', groupId:'g1', className:'5-sinf', coins:40 },
            { id:'u17', name:'Ismoilov Akbar', phone:'+998903333344', password: bcrypt.hashSync('stu134',8), role:'oquvchi', avatar:'IA', groupId:'g1', className:'5-sinf', coins:30 },
            { id:'u18', name:'Kamoliddinov Shoxruh', phone:'+998903333345', password: bcrypt.hashSync('stu135',8), role:'oquvchi', avatar:'KS', groupId:'g2', className:'6-sinf', coins:50 },
            { id:'u19', name:'Toirov Mironshoh', phone:'+998903333346', password: bcrypt.hashSync('stu136',8), role:'oquvchi', avatar:'TM', groupId:'g1', className:'5-sinf', coins:35 },
        ],
        groups: [
            { id:'g1', name:'5-B guruhi', className:'5-sinf', teacherId:'u2', schedule:'Dushanba, Chorshanba 08:30-09:20', room:'A3' },
            { id:'g2', name:'6-G guruhi', className:'6-sinf', teacherId:'u2', schedule:'Seshanba, Juma 09:30-10:20', room:'A4' },
            { id:'g3', name:'5-A guruhi', className:'5-sinf', teacherId:'u5', schedule:'Dushanba, Payshanba 10:30-11:20', room:'B1' },
            { id:'g4', name:'6-B guruhi', className:'6-sinf', teacherId:'u5', schedule:'Seshanba, Juma 10:30-11:20', room:'B2' },
            { id:'g5', name:'7-A guruhi', className:'7-sinf', teacherId:'u9', schedule:'Dushanba, Chorshanba 11:30-12:20', room:'C1' },
            { id:'g6', name:'7-B guruhi', className:'7-sinf', teacherId:'u9', schedule:'Payshanba, Juma 12:30-13:20', room:'C2' },
        ],
        topics: [
            { id:'t1', groupId:'g1', title:'Tenglamalar asoslari', order:1, status:'completed', date:'2026-08-20' },
            { id:'t2', groupId:'g1', title:'Kvadrat tenglamalar', order:2, status:'completed', date:'2026-08-22' },
            { id:'t3', groupId:'g1', title:'Geometriya: Burchaklar', order:3, status:'completed', date:'2026-08-25' },
            { id:'t4', groupId:'g1', title:'Geometriya: Doiralar', order:4, status:'active', date:'2026-08-27' },
            { id:'t5', groupId:'g1', title:'Fraksiyalar', order:5, status:'upcoming', date:'' },
            { id:'t6', groupId:'g1', title:'Ondlik kasrlar', order:6, status:'upcoming', date:'' },
            { id:'t7', groupId:'g2', title:'Algebra: Tenglamalar', order:1, status:'completed', date:'2026-08-19' },
            { id:'t8', groupId:'g2', title:'Algebra: tenglamalar tizimi', order:2, status:'completed', date:'2026-08-21' },
            { id:'t9', groupId:'g2', title:'Geometriya: Uchburchaklar', order:3, status:'completed', date:'2026-08-24' },
            { id:'t10', groupId:'g2', title:'Geometriya: Chiziqli tenglamalar', order:4, status:'active', date:'2026-08-26' },
            { id:'t11', groupId:'g2', title:'Sonlar va operatsiyalar', order:5, status:'upcoming', date:'' },
            { id:'t12', groupId:'g2', title:'Mantiqiy masalalar', order:6, status:'upcoming', date:'' },
        ],
        attendance: {},
        grades: [],
        coinHistory: [],
        shopItems: [
            { id:'si1', name:'Sun Glass', desc:"Quyoshdan himoya ko'zoynak", icon:'🕶️', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:199, stock:12 },
            { id:'si2', name:'Phone Stand', desc:'Telefon tayanchi', icon:'📱', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:199, stock:11 },
            { id:'si3', name:'Wireless Mouse', desc:"Simlarsiz sichqoncha", icon:'🖱️', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:299, stock:6 },
            { id:'si4', name:'Branded Cap', desc:'Maktab logosi bilan shlyapa', icon:'🧢', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:299, stock:0 },
            { id:'si5', name:'USB Flash Drive', desc:'16 GB fleshka', icon:'💾', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:299, stock:8 },
            { id:'si6', name:'Branded Thermos', desc:'Maktab logosi bilan termos', icon:'🥤', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:349, stock:5 },
            { id:'si7', name:'Mouse', desc:'Maktab sichqonchasi', icon:'🖱️', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:349, stock:13 },
            { id:'si8', name:'Keyboard', desc:'Maktab klaviaturasi', icon:'⌨️', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:399, stock:3 },
            { id:'si9', name:'Sport formasi', desc:'Maktab logosi bilan sport formasi', icon:'👕', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:499, stock:5 },
            { id:'si10', name:'Keyboard&Mouse', desc:"Klaviatura va sichqoncha to'plami", icon:'🖱️', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:549, stock:7 },
        ],
        homeworks: [
            { id:'hw1', subject:'Matematika', title:'Algebra masalalari', description:'Sinf va tenglamalar haqida 10 ta masala yeching.', deadline: new Date().toISOString().split('T')[0], teacherId:'u2', groupId:'g1', studentIds:['u3','u6','u7'], completedIds:[] },
            { id:'hw2', subject:'Ona tili', title:'Insho yozish', description:'"Mening maktabim" mavzusida 200 so\'zdan ortiq insho yozing.', deadline: new Date().toISOString().split('T')[0], teacherId:'u5', groupId:'g1', studentIds:['u3','u6','u7'], completedIds:['u3'] },
            { id:'hw3', subject:'Tarix', title:"Ma'ruza tayyorlash", description:"O'zbekiston mustaqilligi haqida 5 ta slayd tayyorlang.", deadline: new Date().toISOString().split('T')[0], teacherId:'u9', groupId:'g1', studentIds:['u3','u6','u7'], completedIds:[] },
        ],
        payments: [
            { id:'p1', studentId:'u3', month:'2026-08', amount:500000, status:'paid', paidDate:'2026-08-01' },
            { id:'p2', studentId:'u6', month:'2026-08', amount:500000, status:'paid', paidDate:'2026-08-03' },
            { id:'p3', studentId:'u7', month:'2026-08', amount:500000, status:'unpaid', paidDate:'' },
        ],
        ownedItems: [],
        tests: {
            'Matematika': [
                { q:'2 + 3 = ?', options:['4','5','6','7'], correct:1 },
                { q:'12 × 5 = ?', options:['50','55','60','65'], correct:2 },
                { q:'100 ÷ 4 = ?', options:['20','25','30','35'], correct:1 },
                { q:'15 - 8 = ?', options:['5','6','7','8'], correct:2 },
                { q:'9 × 9 = ?', options:['72','81','89','91'], correct:1 },
                { q:'25 × 4 = ?', options:['80','90','100','110'], correct:2 },
                { q:'144 ÷ 12 = ?', options:['11','12','13','14'], correct:1 },
                { q:'7 + 8 = ?', options:['13','14','15','16'], correct:2 },
                { q:'20 - 9 = ?', options:['9','10','11','12'], correct:2 },
                { q:'6 × 7 = ?', options:['36','40','42','48'], correct:2 },
            ],
            'Ona tili': [
                { q:'"Kitob" so\'zida nechta unli harf bor?', options:['2','3','4','1'], correct:1 },
                { q:"Jumlada fe'l qaysi o'rinda turadi?", options:['Boshida','Oxirida',"O'rtada",'Har qanday joyda'], correct:3 },
                { q:'Qaysi so\'z to\'g\'ri yozilgan?', options:['Sprotnik','Sportnik','Sportunik','Spotrenik'], correct:1 },
                { q:"O'zbek tilida nechta unli harf bor?", options:['5','6','7','8'], correct:2 },
                { q:'"Maktab" so\'zi otmi?', options:['Ha',"Yo'q","Fe'l",'Sifat'], correct:0 },
            ],
            'Tarix': [
                { q:"O'zbekiston Mustaqilligi qachon?", options:['1990','1991','1992','1993'], correct:1 },
                { q:"Amir Temur qachon tug'ilgan?", options:['1330','1336','1340','1345'], correct:1 },
                { q:"Buyuk Ipak Yo'li qaysi davlat orqali?", options:['Xitoy','Hindiston',"O'zbekiston",'Turkiya'], correct:2 },
                { q:'Registon qaysi shaharda?', options:['Buxoro','Samarqand','Xiva',"Qo'qon"], correct:1 },
                { q:"O'zbekiston nechta viloyatdan iborat?", options:['10','11','12','13'], correct:2 },
            ],
            'Fizika': [
                { q:"Yorug'lik tezligi?", options:['200 000','300 000','400 000','500 000'], correct:1 },
                { q:"Suvning qaynash harorati?", options:['90°C','95°C','100°C','110°C'], correct:2 },
                { q:"Yer kuchlanishi qancha?", options:['8.8','9.8','10.8','11.8'], correct:1 },
                { q:'Eng katta sayyora?', options:['Yer','Mars','Yupiter','Saturn'], correct:2 },
                { q:"Ovoz suvda tezroqmi?", options:['Ha',"Yo'q",'Barobar','Depends'], correct:0 },
            ],
            'Ingliz tili': [
                { q:'"Hello" ning o\'zbekchasi?', options:['Salom','Rahmat','Kechirasiz','Ha'], correct:0 },
                { q:'"Student" nimani anglatadi?', options:["O'qituvchi","O'quvchi",'Doktor','Ingener'], correct:1 },
                { q:'"Cat" ning ko\'p soni?', options:['Cats','Cates','Catses','Caties'], correct:0 },
                { q:'"Good morning" qachon?', options:['Tushdan keyin','Kechqurun','Ertalab','Tungi'], correct:2 },
                { q:'"Beautiful" ning qarama-qarshisi?', options:['Pretty','Ugly','Nice','Good'], correct:1 },
            ],
        },
        testResults: [],
        teacherCoins: [],
        settings: { schoolName:'Maktab 1' }
    };
}

function getDB() {
    if (!db) db = initDB();
    return db;
}

// ==================== AUTH MIDDLEWARE ====================
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', (req, res) => {
    const d = getDB();
    const { phone, password } = req.body;
    const user = d.users.find(u => u.phone === phone);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, phone: user.phone, avatar: user.avatar }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, phone: user.phone, avatar: user.avatar, coins: user.coins, subject: user.subject, groupId: user.groupId, className: user.className } });
});

// ==================== USERS ====================
app.get('/api/users', auth, (req, res) => {
    const d = getDB();
    res.json(d.users.map(u => ({ id:u.id, name:u.name, phone:u.phone, role:u.role, avatar:u.avatar, coins:u.coins, subject:u.subject, groupId:u.groupId, className:u.className })));
});

app.get('/api/users/:id', auth, (req, res) => {
    const d = getDB();
    const u = d.users.find(x => x.id === req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    res.json({ id:u.id, name:u.name, phone:u.phone, role:u.role, avatar:u.avatar, coins:u.coins, subject:u.subject, groupId:u.groupId, className:u.className });
});

app.post('/api/users', auth, (req, res) => {
    const d = getDB();
    if (req.user.role !== 'direktor' && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { name, phone, password, role, groupId, className, subject } = req.body;
    const id = 'u'+Date.now();
    const avatar = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
    d.users.push({ id, name, phone, password: bcrypt.hashSync(password||'123456',8), role: role||'oquvchi', avatar, coins:0, groupId, className, subject });
    res.json({ id, name, phone, role, avatar });
});

app.put('/api/users/:id', auth, (req, res) => {
    const d = getDB();
    const idx = d.users.findIndex(u => u.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Not found' });
    const { name, phone, password, groupId, className, subject, coins } = req.body;
    if (name) { d.users[idx].name = name; d.users[idx].avatar = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase(); }
    if (phone) d.users[idx].phone = phone;
    if (password) d.users[idx].password = bcrypt.hashSync(password, 8);
    if (groupId !== undefined) d.users[idx].groupId = groupId;
    if (className !== undefined) d.users[idx].className = className;
    if (subject !== undefined) d.users[idx].subject = subject;
    if (coins !== undefined) d.users[idx].coins = coins;
    res.json({ success: true });
});

app.delete('/api/users/:id', auth, (req, res) => {
    const d = getDB();
    d.users = d.users.filter(u => u.id !== req.params.id);
    res.json({ success: true });
});

// ==================== GROUPS ====================
app.get('/api/groups', auth, (req, res) => { res.json(getDB().groups); });

app.post('/api/groups', auth, (req, res) => {
    const d = getDB();
    const { name, className, teacherId, schedule } = req.body;
    const id = 'g'+Date.now();
    d.groups.push({ id, name, className, teacherId, schedule });
    res.json({ id, name, className, teacherId, schedule });
});

app.put('/api/groups/:id', auth, (req, res) => {
    const d = getDB();
    const idx = d.groups.findIndex(g => g.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Not found' });
    Object.assign(d.groups[idx], req.body);
    res.json({ success: true });
});

app.delete('/api/groups/:id', auth, (req, res) => {
    const d = getDB();
    d.groups = d.groups.filter(g => g.id !== req.params.id);
    res.json({ success: true });
});

// ==================== ATTENDANCE ====================
app.get('/api/attendance/:date', auth, (req, res) => { res.json((getDB().attendance[req.params.date]) || {}); });

app.put('/api/attendance/:date', auth, (req, res) => {
    const d = getDB();
    const date = req.params.date;
    const oldAtt = d.attendance[date] || {};
    const newAtt = req.body;
    Object.keys(newAtt).forEach(studentId => {
        if (newAtt[studentId] === 'present' && oldAtt[studentId] !== 'present') {
            const user = d.users.find(u => u.id === studentId);
            if (user) {
                user.coins = (user.coins || 0) + 1;
                if (!d.coinHistory) d.coinHistory = [];
                d.coinHistory.push({ id: 'ch'+Date.now()+Math.random().toString(36).substr(2,4), userId: studentId, amount: 1, reason: 'Davomat: ' + date, date, type: 'earn' });
            }
        }
    });
    d.attendance[date] = newAtt;
    res.json({ success: true });
});

// ==================== GRADES ====================
app.get('/api/grades', auth, (req, res) => {
    let grades = getDB().grades;
    if (req.query.studentId) grades = grades.filter(g => g.studentId === req.query.studentId);
    if (req.query.subject) grades = grades.filter(g => g.subject === req.query.subject);
    res.json(grades);
});

app.post('/api/grades', auth, (req, res) => {
    const d = getDB();
    const { studentId, subject, value, note } = req.body;
    const id = 'gr'+Date.now();
    d.grades.push({ id, studentId, subject, value, note: note||'', teacherId: req.user.id, date: new Date().toISOString().split('T')[0] });
    res.json({ id });
});

// ==================== HOMEWORK ====================
app.get('/api/homeworks', auth, (req, res) => {
    const d = getDB();
    let hw = d.homeworks || [];
    if (req.user.role === 'oquvchi') hw = hw.filter(h => h.studentIds?.includes(req.user.id));
    else if (req.user.role === 'oqituvchi') hw = hw.filter(h => h.teacherId === req.user.id);
    res.json(hw);
});

app.post('/api/homeworks', auth, (req, res) => {
    const d = getDB();
    const { subject, title, description, deadline, groupId } = req.body;
    const id = 'hw'+Date.now();
    const studentIds = d.users.filter(u => u.role === 'oquvchi' && u.groupId === groupId).map(u => u.id);
    d.homeworks.push({ id, subject, title, description, deadline, teacherId: req.user.id, groupId, studentIds, completedIds: [] });
    res.json({ id });
});

app.put('/api/homeworks/:id/toggle', auth, (req, res) => {
    const d = getDB();
    const hw = d.homeworks.find(h => h.id === req.params.id);
    if (!hw) return res.status(404).json({ error: 'Not found' });
    if (!hw.completedIds) hw.completedIds = [];
    const idx = hw.completedIds.indexOf(req.user.id);
    if (idx >= 0) hw.completedIds.splice(idx, 1);
    else hw.completedIds.push(req.user.id);
    res.json({ completed: idx < 0 });
});

app.put('/api/homeworks/:id', auth, (req, res) => {
    const d = getDB();
    const hw = (d.homeworks||[]).find(h => h.id === req.params.id);
    if (!hw) return res.status(404).json({ error: 'Not found' });
    const { title, description, deadline, subject } = req.body;
    if (title) hw.title = title;
    if (description) hw.description = description;
    if (deadline) hw.deadline = deadline;
    if (subject) hw.subject = subject;
    res.json({ success: true });
});

app.delete('/api/homeworks/:id', auth, (req, res) => {
    const d = getDB();
    d.homeworks = (d.homeworks || []).filter(h => h.id !== req.params.id);
    res.json({ success: true });
});

// ==================== COINS ====================
app.get('/api/coins/history', auth, (req, res) => {
    res.json((getDB().coinHistory || []).filter(c => c.userId === req.user.id));
});

app.get('/api/coins/teacher-allocation', auth, (req, res) => {
    const d = getDB();
    if (req.user.role !== 'oqituvchi' && req.user.role !== 'direktor') return res.json({ allocated: 0, used: 0, remaining: 0 });
    const currentMonth = new Date().toISOString().substring(0, 7);
    let tc = (d.teacherCoins || []).find(c => c.teacherId === req.user.id && c.month === currentMonth);
    if (!tc) {
        if (!d.teacherCoins) d.teacherCoins = [];
        tc = { id: 'tc'+Date.now(), teacherId: req.user.id, month: currentMonth, allocated: 1000, used: 0 };
        d.teacherCoins.push(tc);
    }
    res.json({ allocated: tc.allocated, used: tc.used, remaining: tc.allocated - tc.used });
});

app.post('/api/coins/give-to-student', auth, (req, res) => {
    const d = getDB();
    if (req.user.role !== 'oqituvchi' && req.user.role !== 'direktor') return res.status(403).json({ error: 'Ruxsat yo\'q' });
    const { studentId, amount, reason } = req.body;
    if (!studentId || !amount || amount <= 0) return res.status(400).json({ error: 'Noto\'g\'ri ma\'lumot' });
    const currentMonth = new Date().toISOString().substring(0, 7);
    const tc = (d.teacherCoins || []).find(c => c.teacherId === req.user.id && c.month === currentMonth);
    if (!tc || (tc.allocated - tc.used) < amount) return res.status(400).json({ error: 'Yetarli coin yo\'q' });
    const student = d.users.find(u => u.id === studentId);
    if (!student) return res.status(404).json({ error: 'O\'quvchi topilmadi' });
    tc.used += amount;
    student.coins = (student.coins || 0) + amount;
    if (!d.coinHistory) d.coinHistory = [];
    d.coinHistory.push({ id: 'ch'+Date.now()+'t', userId: req.user.id, amount, reason: `${student.name} ga berildi: ${reason||'Vazifa uchun'}`, date: new Date().toISOString().split('T')[0], type: 'give', toStudentId: studentId });
    d.coinHistory.push({ id: 'ch'+Date.now()+'s', userId: studentId, amount, reason: `${req.user.name} dan: ${reason||'Vazifa uchun'}`, date: new Date().toISOString().split('T')[0], type: 'earn', fromTeacherId: req.user.id });
    res.json({ teacherRemaining: tc.allocated - tc.used, studentCoins: student.coins });
});

app.post('/api/coins/earn', auth, (req, res) => {
    const d = getDB();
    const { amount, reason } = req.body;
    const user = d.users.find(u => u.id === req.user.id);
    if (user) user.coins = (user.coins || 0) + amount;
    if (!d.coinHistory) d.coinHistory = [];
    d.coinHistory.push({ id: 'ch'+Date.now(), userId: req.user.id, amount, reason, date: new Date().toISOString().split('T')[0], type: 'earn' });
    res.json({ coins: user?.coins || 0 });
});

// ==================== SHOP ====================
app.get('/api/shop/items', auth, (req, res) => { res.json(getDB().shopItems); });

app.get('/api/shop/owned', auth, (req, res) => {
    res.json((getDB().ownedItems || []).filter(o => o.userId === req.user.id));
});

app.post('/api/shop/buy', auth, (req, res) => {
    const d = getDB();
    const { itemId } = req.body;
    const item = d.shopItems.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.stock !== undefined && item.stock <= 0) return res.status(400).json({ error: 'Sotib bo\'lmadi' });
    const user = d.users.find(u => u.id === req.user.id);
    if (!user || (user.coins || 0) < item.price) return res.status(400).json({ error: 'Not enough coins' });
    user.coins -= item.price;
    if (item.stock !== undefined) item.stock--;
    d.ownedItems.push({ id: 'oi'+Date.now(), userId: req.user.id, itemId, date: new Date().toISOString().split('T')[0] });
    res.json({ coins: user.coins });
});

// ==================== PAYMENTS ====================
app.get('/api/payments', auth, (req, res) => {
    let payments = getDB().payments;
    if (req.user.role === 'oquvchi') payments = payments.filter(p => p.studentId === req.user.id);
    res.json(payments);
});

app.post('/api/payments', auth, (req, res) => {
    const d = getDB();
    const { studentId, month, amount, status } = req.body;
    const id = 'p'+Date.now();
    d.payments.push({ id, studentId, month, amount, status, paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : '' });
    res.json({ id });
});

app.post('/api/payments/pay', auth, (req, res) => {
    const d = getDB();
    const { paymentId, method, amount } = req.body;
    const p = d.payments.find(x => x.id === paymentId);
    if (!p) return res.status(404).json({ error: 'Not found' });
    const paidAmount = amount || p.amount;
    const now = new Date();
    const uzb = new Date(now.getTime() + (5*60*60*1000) - (now.getTimezoneOffset()*60*1000));
    p.status = 'paid'; p.paidDate = uzb.toISOString().split('T')[0]; p.payMethod = method || 'online';
    res.json({ success: true, payment: p });
});

app.get('/api/payments/history', auth, (req, res) => {
    const d = getDB();
    let history = d.paymentHistory || [];
    if (req.user.role === 'oquvchi') history = history.filter(h => h.studentId === req.user.id);
    res.json(history);
});

app.put('/api/payments/:id', auth, (req, res) => {
    const d = getDB();
    const p = d.payments.find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    if (req.body.status === 'paid') { p.status = 'paid'; p.paidDate = new Date().toISOString().split('T')[0]; }
    else Object.assign(p, req.body);
    res.json({ success: true });
});

app.delete('/api/payments/:id', auth, (req, res) => {
    const d = getDB();
    d.payments = d.payments.filter(p => p.id !== req.params.id);
    res.json({ success: true });
});

// ==================== TESTS ====================
app.get('/api/tests', auth, (req, res) => {
    const d = getDB();
    const user = d.users.find(u => u.id === req.user.id);
    if (user && user.role === 'oquvchi' && user.className) {
        const grade = parseInt(user.className);
        const gradeTests = {};
        Object.keys(d.tests).forEach(subject => {
            gradeTests[subject] = grade <= 5 ? d.tests[subject].slice(0, 5) : d.tests[subject].slice(5, 10);
        });
        return res.json(gradeTests);
    }
    res.json(d.tests);
});

app.post('/api/test-results', auth, (req, res) => {
    const d = getDB();
    const { subject, score, total } = req.body;
    let coins = 0;
    if (score === 10) coins = 5;
    else if (score >= 8) coins = 4;
    else if (score === 7) coins = 3;
    else if (score === 6) coins = 2;
    else if (score === 5) coins = 1;
    if (coins > 0) { const user = d.users.find(u => u.id === req.user.id); if (user) user.coins = (user.coins || 0) + coins; }
    const result = { id: 'tr'+Date.now()+Math.random().toString(36).substr(2,4), studentId: req.user.id, subject, score, total, percentage: Math.round((score/total)*100), coins, date: new Date().toISOString().split('T')[0] };
    if (!d.testResults) d.testResults = [];
    d.testResults.push(result);
    res.json({ ...result, userCoins: d.users.find(u => u.id === req.user.id)?.coins || 0 });
});

app.get('/api/test-results', auth, (req, res) => {
    const d = getDB();
    let results = d.testResults || [];
    if (req.user.role === 'oqituvchi') {
        const myGroupIds = d.groups.filter(g => g.teacherId === req.user.id).map(g => g.id);
        const myStudentIds = d.users.filter(u => u.role === 'oquvchi' && myGroupIds.includes(u.groupId)).map(u => u.id);
        results = results.filter(r => myStudentIds.includes(r.studentId));
    } else if (req.user.role === 'oquvchi') {
        results = results.filter(r => r.studentId === req.user.id);
    }
    res.json(results);
});

// ==================== TOPICS ====================
app.get('/api/topics', auth, (req, res) => {
    let topics = getDB().topics || [];
    if (req.query.groupId) topics = topics.filter(t => t.groupId === req.query.groupId);
    res.json(topics);
});

app.post('/api/topics', auth, (req, res) => {
    const d = getDB();
    const { groupId, title, order } = req.body;
    const id = 't'+Date.now();
    if (!d.topics) d.topics = [];
    d.topics.push({ id, groupId, title, order: order||1, status:'upcoming', date:'' });
    res.json({ id });
});

app.put('/api/topics/:id', auth, (req, res) => {
    const d = getDB();
    const t = (d.topics||[]).find(x => x.id === req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    Object.assign(t, req.body);
    res.json({ success: true });
});

app.delete('/api/topics/:id', auth, (req, res) => {
    const d = getDB();
    d.topics = (d.topics||[]).filter(t => t.id !== req.params.id);
    res.json({ success: true });
});

// ==================== TEACHER PAYMENTS ====================
app.get('/api/teacher-payments', auth, (req, res) => {
    const d = getDB();
    if (!d.teacherPayments) d.teacherPayments = [];
    let payments = d.teacherPayments;
    if (req.user.role === 'oqituvchi') payments = payments.filter(p => p.teacherId === req.user.id);
    res.json(payments);
});

app.post('/api/teacher-payments', auth, (req, res) => {
    const d = getDB();
    const { teacherId, month, amount } = req.body;
    if (!d.teacherPayments) d.teacherPayments = [];
    const id = 'tp'+Date.now();
    d.teacherPayments.push({ id, teacherId, month, amount, status:'unpaid', paidDate:'', paidMethod:'' });
    res.json({ id });
});

app.post('/api/teacher-payments/:id/pay', auth, (req, res) => {
    const d = getDB();
    const p = (d.teacherPayments||[]).find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    p.status = 'paid'; p.paidDate = new Date().toISOString().split('T')[0]; p.payMethod = req.body.method || 'online';
    res.json({ success: true });
});

app.put('/api/teacher-payments/:id', auth, (req, res) => {
    const d = getDB();
    const p = (d.teacherPayments||[]).find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    Object.assign(p, req.body);
    res.json({ success: true });
});

app.delete('/api/teacher-payments/:id', auth, (req, res) => {
    const d = getDB();
    d.teacherPayments = (d.teacherPayments||[]).filter(p => p.id !== req.params.id);
    res.json({ success: true });
});

// ==================== SETTINGS ====================
app.get('/api/settings', auth, (req, res) => { res.json(getDB().settings); });

app.put('/api/settings', auth, (req, res) => {
    Object.assign(getDB().settings, req.body);
    res.json({ success: true });
});

// ==================== HEALTH ====================
app.get('/api/health', (req, res) => { res.json({ status: 'ok' }); });

// ==================== CATCH-ALL ====================
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.status(200).json({ message: 'Maktab Boshqaruv Tizimi API' });
    }
});

export default app;
