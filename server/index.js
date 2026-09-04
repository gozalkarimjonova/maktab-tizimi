import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const JWT_SECRET = 'maktab-secret-key-2026';

app.use(cors());
app.use(express.json());

// ==================== DATA STORE ====================
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

function loadDB() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (e) {}
    return initDB();
}

function saveDB(db) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function initDB() {
    const db = {
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
            { id:'g1', name:'5-B guruhi', className:'5-sinf', teacherId:'u2', schedule:'Dushanba, Chorshanba 15:00', room:'A3' },
            { id:'g2', name:'6-G guruhi', className:'6-sinf', teacherId:'u2', schedule:'Seshanba, Juma 15:10', room:'A4' },
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
            { id:'si1', name:'Sun Glass', desc:'Quyoshdan himoya ko\'zoynak', icon:'🕶️', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:199, stock:12 },
            { id:'si2', name:'Phone Stand', desc:'Telefon tayanchi', icon:'📱', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:199, stock:11 },
            { id:'si3', name:'Wireless Mouse', desc:'Simlarsiz sichqoncha', icon:'🖱️', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:299, stock:6 },
            { id:'si4', name:'Branded Cap', desc:'Maktab logosi bilan shlyapa', icon:'🧢', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:299, stock:0 },
            { id:'si5', name:'USB Flash Drive', desc:'16 GB fleshka', icon:'💾', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:299, stock:8 },
            { id:'si6', name:'Branded Thermos', desc:'Maktab logosi bilan termos', icon:'🥤', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:349, stock:5 },
            { id:'si7', name:'Mouse', desc:'Maktab sichqonchasi', icon:'🖱️', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:349, stock:13 },
            { id:'si8', name:'Keyboard', desc:'Maktab klaviaturasi', icon:'⌨️', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:399, stock:3 },
            { id:'si9', name:'Sport formasi', desc:'Maktab logosi bilan sport formasi', icon:'👕', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:499, stock:5 },
            { id:'si10', name:'Keyboard&Mouse', desc:'Klaviatura va sichqoncha to\'plami', icon:'🖱️', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:549, stock:7 },
            { id:'si11', name:'Wireless Keyboard & Mouse', desc:'Simlarsiz to\'plam', icon:'⌨️', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:599, stock:0 },
            { id:'si12', name:'AirPods Max', desc:'Premium quloqlik', icon:'🎧', iconBg:'linear-gradient(135deg,#f0f0f0,#e8e8e8)', price:599, stock:0 },
        ],
        homeworks: [
            { id:'hw1', subject:'Matematika', title:'Algebra masalalari', description:'Sinf va tenglamalar haqida 10 ta masala yeching.', deadline: new Date().toISOString().split('T')[0], teacherId:'u2', groupId:'g1', studentIds:['u3','u6','u7'], completedIds:[] },
            { id:'hw2', subject:'Ona tili', title:'Insho yozish', description:'"Mening maktabim" mavzusida 200 so\'zdan ortiq insho yozing.', deadline: new Date().toISOString().split('T')[0], teacherId:'u5', groupId:'g1', studentIds:['u3','u6','u7'], completedIds:['u3'] },
            { id:'hw3', subject:'Tarix', title:'Ma\'ruza tayyorlash', description:'O\'zbekiston mustaqilligi haqida 5 ta slayd tayyorlang.', deadline: new Date().toISOString().split('T')[0], teacherId:'u9', groupId:'g1', studentIds:['u3','u6','u7'], completedIds:[] },
            { id:'hw4', subject:'Matematika', title:'Geometriya mashqlari', description:'Doiralar va burchaklar haqida 8 ta masala yeching.', deadline: new Date().toISOString().split('T')[0], teacherId:'u2', groupId:'g2', studentIds:['u8','u10'], completedIds:['u10'] },
            { id:'hw5', subject:'Ingliz tili', title:'Vocabulary list', description:'Learn 20 new English words and write sentences.', deadline: new Date().toISOString().split('T')[0], teacherId:'u2', groupId:'g2', studentIds:['u8','u10'], completedIds:[] },
        ],
        payments: [
            { id:'p1', studentId:'u3', month:'2026-08', amount:500000, status:'paid', paidDate:'2026-08-01' },
            { id:'p2', studentId:'u6', month:'2026-08', amount:500000, status:'paid', paidDate:'2026-08-03' },
            { id:'p3', studentId:'u7', month:'2026-08', amount:500000, status:'unpaid', paidDate:'' },
            { id:'p4', studentId:'u8', month:'2026-08', amount:400000, status:'partial', paidDate:'2026-08-05', paidAmount:200000 },
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
                { q:'Jumlada fe\'l qaysi o\'rinda turadi?', options:['Boshida','Oxirida','O\'rtada','Har qanday joyda'], correct:3 },
                { q:'Qaysi so\'z to\'g\'ri yozilgan?', options:['Sprotnik','Sportnik','Sportunik','Spotrenik'], correct:1 },
                { q:'O\'zbek tilida nechta unli harf bor?', options:['5','6','7','8'], correct:2 },
                { q:'"Maktab" so\'zi otmi?', options:['Ha','Yo\'q','Fe\'l','Sifat'], correct:0 },
                { q:'Qo\'shma so\'z qaysi?', options:['Kitob','Maktab','Chevarlik','O\'qituvchi'], correct:2 },
                { q:'Jumladagi ot nima?', options:['Katta','Yugurdi','Bolalar','Tez'], correct:2 },
                { q:'"Yaxshi" so\'zi nimani bildiradi?', options:['Sifat','Ot','Fe\'l','Olmosh'], correct:0 },
                { q:'Birlik soni qaysi?', options:['Bir','Ikki','Uch','Hammasi'], correct:0 },
                { q:'"Erdagek" so\'zida nechta bo\'g\'in bor?', options:['2','3','4','5'], correct:1 },
            ],
            'Tarix': [
                { q:'O\'zbekiston Mustaqilligi qachon?', options:['1990','1991','1992','1993'], correct:1 },
                { q:'Amir Temur qachon tug\'ilgan?', options:['1330','1336','1340','1345'], correct:1 },
                { q:'Buyuk Ipak Yo\'li qaysi davlat orqali?', options:['Xitoy','Hindiston','O\'zbekiston','Turkiya'], correct:2 },
                { q:'Registon qaysi shaharda?', options:['Buxoro','Samarqand','Xiva','Qo\'qon'], correct:1 },
                { q:'O\'zbekiston nechta viloyatdan iborat?', options:['10','11','12','13'], correct:2 },
                { q:'Beruniy qachon yashagan?', options:['900','973','1050','1100'], correct:1 },
                { q:'Alisher Navoiy qachon tug\'ilgan?', options:['1410','1441','1460','1500'], correct:1 },
                { q:'Birinchi konstitutsiya qachon qabul qilindi?', options:['1978','1990','1992','1993'], correct:2 },
                { q:'Qadimgi Xiva qal\'asi qachon qurilgan?', options:['5-asr','9-asr','12-asr','15-asr'], correct:1 },
                { q:'Temuriylar davlati markazi?', options:['Buxoro','Samarqand','Xiva','Qandahor'], correct:1 },
            ],
            'Fizika': [
                { q:'Yorug\'lik tezligi?', options:['200 000','300 000','400 000','500 000'], correct:1 },
                { q:'Suvning qaynash harorati?', options:['90°C','95°C','100°C','110°C'], correct:2 },
                { q:'Yer kuchlanishi qancha?', options:['8.8','9.8','10.8','11.8'], correct:1 },
                { q:'Eng katta sayyora?', options:['Yer','Mars','Yupiter','Saturn'], correct:2 },
                { q:'Ovoz suvda tezroqmi?', options:['Ha','Yo\'q','Barobar','Depends'], correct:0 },
                { q:'Elektr toki birligi?', options:['Volt','Vatt','Amper','Om'], correct:2 },
                { q:'Toroo\'lik birligi?', options:['Kg','Metr','Sekund','Nyuton'], correct:0 },
                { q:'Quyosh energiyasi turi?', options:['Yadroviy','Kimyoviy','Elektr','Magnit'], correct:0 },
                { q:'Harorat birligi?', options:['Fahrenheit','Kelvin','Celsius','Hammasi'], correct:3 },
                { q:'Gidrostatika qonuni kimniki?', options:['Nyuton','Arximed','Galiley','Eynshteyn'], correct:1 },
            ],
            'Ingliz tili': [
                { q:'"Hello" ning o\'zbekchasi?', options:['Salom','Rahmat','Kechirasiz','Ha'], correct:0 },
                { q:'"Student" nimani anglatadi?', options:['O\'qituvchi','O\'quvchi','Doktor','Ingener'], correct:1 },
                { q:'"Cat" ning ko\'p soni?', options:['Cats','Cates','Catses','Caties'], correct:0 },
                { q:'"Good morning" qachon?', options:['Tushdan keyin','Kechqurun','Ertalab','Tungi'], correct:2 },
                { q:'"Beautiful" ning qarama-qarshisi?', options:['Pretty','Ugly','Nice','Good'], correct:1 },
                { q:'"Big" ning sinonimi?', options:['Small','Large','Tiny','Short'], correct:1 },
                { q:'"Go" ning o\'tmish zamoni?', options:['Went','Goed','Goned','Going'], correct:0 },
                { q:'"She ___ a teacher" bo\'lish kerak?', options:['is','am','are','be'], correct:0 },
                { q:'"Book" ning ko\'p soni?', options:['Bookes','Books','Bookies','Bookses'], correct:1 },
                { q:'"Thank you" ning javobi?', options:['Hello','OK','You\'re welcome','Yes'], correct:2 },
            ],
        },
        testResults: [],
        settings: { schoolName:'Maktab 1' }
    };
    // Generate demo grades
    const students = db.users.filter(u => u.role === 'oquvchi');
    const subjects = ['Matematika','Ona tili','Tarix','Fizika','Ingliz tili'];
    students.forEach(s => subjects.forEach(sub => {
        db.grades.push({ id: 'g'+Date.now()+Math.random().toString(36).substr(2,4), studentId: s.id, subject: sub, value: Math.floor(Math.random()*3)+3, note:'', teacherId:'u2', date: new Date().toISOString().split('T')[0] });
    }));
    saveDB(db);
    return db;
}

let db = loadDB();

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
    const { phone, password } = req.body;
    const user = db.users.find(u => u.phone === phone);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, phone: user.phone, avatar: user.avatar }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, phone: user.phone, avatar: user.avatar, coins: user.coins, subject: user.subject, groupId: user.groupId, className: user.className } });
});

app.post('/api/auth/change-password', auth, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = db.users.find(u => u.id === req.user.id);
    if (!user || !bcrypt.compareSync(currentPassword, user.password)) return res.status(400).json({ error: 'Wrong password' });
    user.password = bcrypt.hashSync(newPassword, 8);
    saveDB(db);
    res.json({ success: true });
});

// ==================== USERS ROUTES ====================
app.get('/api/users', auth, (req, res) => {
    const users = db.users.map(u => ({ id:u.id, name:u.name, phone:u.phone, role:u.role, avatar:u.avatar, coins:u.coins, subject:u.subject, groupId:u.groupId, className:u.className }));
    res.json(users);
});

app.get('/api/users/:id', auth, (req, res) => {
    const u = db.users.find(x => x.id === req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    res.json({ id:u.id, name:u.name, phone:u.phone, role:u.role, avatar:u.avatar, coins:u.coins, subject:u.subject, groupId:u.groupId, className:u.className });
});

app.post('/api/users', auth, (req, res) => {
    if (req.user.role !== 'direktor' && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { name, phone, password, role, groupId, className, subject } = req.body;
    const id = 'u'+Date.now();
    const avatar = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
    db.users.push({ id, name, phone, password: bcrypt.hashSync(password||'123456',8), role: role||'oquvchi', avatar, coins:0, groupId, className, subject });
    saveDB(db);
    res.json({ id, name, phone, role, avatar });
});

app.put('/api/users/:id', auth, (req, res) => {
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Not found' });
    const { name, phone, password, groupId, className, subject, coins } = req.body;
    if (name) { db.users[idx].name = name; db.users[idx].avatar = name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase(); }
    if (phone) db.users[idx].phone = phone;
    if (password) db.users[idx].password = bcrypt.hashSync(password, 8);
    if (groupId !== undefined) db.users[idx].groupId = groupId;
    if (className !== undefined) db.users[idx].className = className;
    if (subject !== undefined) db.users[idx].subject = subject;
    if (coins !== undefined) db.users[idx].coins = coins;
    saveDB(db);
    res.json({ success: true });
});

app.delete('/api/users/:id', auth, (req, res) => {
    db.users = db.users.filter(u => u.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

// ==================== GROUPS ROUTES ====================
app.get('/api/groups', auth, (req, res) => res.json(db.groups));

app.post('/api/groups', auth, (req, res) => {
    const { name, className, teacherId, schedule } = req.body;
    const id = 'g'+Date.now();
    db.groups.push({ id, name, className, teacherId, schedule });
    saveDB(db);
    res.json({ id, name, className, teacherId, schedule });
});

app.put('/api/groups/:id', auth, (req, res) => {
    const idx = db.groups.findIndex(g => g.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: 'Not found' });
    Object.assign(db.groups[idx], req.body);
    saveDB(db);
    res.json({ success: true });
});

app.delete('/api/groups/:id', auth, (req, res) => {
    db.groups = db.groups.filter(g => g.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

// ==================== ATTENDANCE ROUTES ====================
app.get('/api/attendance/:date', auth, (req, res) => res.json(db.attendance[req.params.date] || {}));

app.put('/api/attendance/:date', auth, (req, res) => {
    const date = req.params.date;
    const oldAtt = db.attendance[date] || {};
    const newAtt = req.body;
    
    // Give coins for present students (1 coin per day)
    Object.keys(newAtt).forEach(studentId => {
        if (newAtt[studentId] === 'present' && oldAtt[studentId] !== 'present') {
            const user = db.users.find(u => u.id === studentId);
            if (user) {
                user.coins = (user.coins || 0) + 1;
                if (!db.coinHistory) db.coinHistory = [];
                db.coinHistory.push({
                    id: 'ch'+Date.now()+Math.random().toString(36).substr(2,4),
                    userId: studentId,
                    amount: 1,
                    reason: 'Davomat: ' + date,
                    date: date,
                    type: 'earn'
                });
            }
        }
    });
    
    db.attendance[date] = newAtt;
    saveDB(db);
    res.json({ success: true });
});

// ==================== GRADES ROUTES ====================
app.get('/api/grades', auth, (req, res) => {
    let grades = db.grades;
    if (req.query.studentId) grades = grades.filter(g => g.studentId === req.query.studentId);
    if (req.query.subject) grades = grades.filter(g => g.subject === req.query.subject);
    res.json(grades);
});

app.post('/api/grades', auth, (req, res) => {
    const { studentId, subject, value, note } = req.body;
    const id = 'gr'+Date.now();
    db.grades.push({ id, studentId, subject, value, note: note||'', teacherId: req.user.id, date: new Date().toISOString().split('T')[0] });
    saveDB(db);
    res.json({ id });
});

// ==================== HOMEWORK ROUTES ====================
app.get('/api/homeworks', auth, (req, res) => {
    let hw = db.homeworks || [];
    if (req.user.role === 'oquvchi') hw = hw.filter(h => h.studentIds?.includes(req.user.id));
    else if (req.user.role === 'oqituvchi') hw = hw.filter(h => h.teacherId === req.user.id);
    res.json(hw);
});

app.post('/api/homeworks', auth, (req, res) => {
    const { subject, title, description, deadline, groupId } = req.body;
    const id = 'hw'+Date.now();
    const studentIds = db.users.filter(u => u.role === 'oquvchi' && u.groupId === groupId).map(u => u.id);
    db.homeworks.push({ id, subject, title, description, deadline, teacherId: req.user.id, groupId, studentIds, completedIds: [] });
    saveDB(db);
    res.json({ id });
});

app.put('/api/homeworks/:id/toggle', auth, (req, res) => {
    const hw = db.homeworks.find(h => h.id === req.params.id);
    if (!hw) return res.status(404).json({ error: 'Not found' });
    if (!hw.completedIds) hw.completedIds = [];
    const idx = hw.completedIds.indexOf(req.user.id);
    if (idx >= 0) hw.completedIds.splice(idx, 1);
    else hw.completedIds.push(req.user.id);
    saveDB(db);
    res.json({ completed: idx < 0 });
});

app.delete('/api/homeworks/:id', auth, (req, res) => {
    db.homeworks = (db.homeworks || []).filter(h => h.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

// ==================== COINS ROUTES ====================
app.get('/api/coins/history', auth, (req, res) => {
    res.json((db.coinHistory || []).filter(c => c.userId === req.user.id));
});

// Teacher monthly coin allocation - 1000 coins per month
app.get('/api/coins/teacher-allocation', auth, (req, res) => {
    if (req.user.role !== 'oqituvchi' && req.user.role !== 'direktor') return res.json({ allocated: 0, used: 0, remaining: 0 });
    const currentMonth = new Date().toISOString().substring(0, 7); // '2026-08'
    const teacherCoins = (db.teacherCoins || []).find(c => c.teacherId === req.user.id && c.month === currentMonth);
    if (!teacherCoins) {
        // First time this month - allocate 1000 coins
        if (!db.teacherCoins) db.teacherCoins = [];
        const alloc = { id: 'tc'+Date.now(), teacherId: req.user.id, month: currentMonth, allocated: 1000, used: 0 };
        db.teacherCoins.push(alloc);
        saveDB(db);
        return res.json({ allocated: 1000, used: 0, remaining: 1000 });
    }
    res.json({ allocated: teacherCoins.allocated, used: teacherCoins.used, remaining: teacherCoins.allocated - teacherCoins.used });
});

// Teacher gives coins to student
app.post('/api/coins/give-to-student', auth, (req, res) => {
    if (req.user.role !== 'oqituvchi' && req.user.role !== 'direktor') return res.status(403).json({ error: 'Ruxsat yo\'q' });
    const { studentId, amount, reason } = req.body;
    if (!studentId || !amount || amount <= 0) return res.status(400).json({ error: 'Noto\'g\'ri ma\'lumot' });
    
    const currentMonth = new Date().toISOString().substring(0, 7);
    const teacherCoins = (db.teacherCoins || []).find(c => c.teacherId === req.user.id && c.month === currentMonth);
    if (!teacherCoins || (teacherCoins.allocated - teacherCoins.used) < amount) {
        return res.status(400).json({ error: 'Yetarli coin yo\'q' });
    }
    
    const student = db.users.find(u => u.id === studentId);
    if (!student) return res.status(404).json({ error: 'O\'quvchi topilmadi' });
    
    // Deduct from teacher's allocation
    teacherCoins.used += amount;
    
    // Add to student's coins
    student.coins = (student.coins || 0) + amount;
    
    // Record in coin history - teacher side
    if (!db.coinHistory) db.coinHistory = [];
    db.coinHistory.push({
        id: 'ch'+Date.now()+'t',
        userId: req.user.id,
        amount: amount,
        reason: `${student.name} ga berildi: ${reason || 'Vazifa uchun'}`,
        date: new Date().toISOString().split('T')[0],
        type: 'give',
        toStudentId: studentId
    });
    
    // Record in coin history - student side
    db.coinHistory.push({
        id: 'ch'+Date.now()+'s',
        userId: studentId,
        amount: amount,
        reason: `${req.user.name} dan: ${reason || 'Vazifa uchun'}`,
        date: new Date().toISOString().split('T')[0],
        type: 'earn',
        fromTeacherId: req.user.id
    });
    
    saveDB(db);
    res.json({ 
        teacherRemaining: teacherCoins.allocated - teacherCoins.used,
        studentCoins: student.coins 
    });
});

app.post('/api/coins/earn', auth, (req, res) => {
    const { amount, reason } = req.body;
    const user = db.users.find(u => u.id === req.user.id);
    if (user) { user.coins = (user.coins || 0) + amount; }
    db.coinHistory.push({ id: 'ch'+Date.now(), userId: req.user.id, amount, reason, date: new Date().toISOString().split('T')[0], type: 'earn' });
    saveDB(db);
    res.json({ coins: user?.coins || 0 });
});

// ==================== SHOP ROUTES ====================
app.get('/api/shop/items', auth, (req, res) => res.json(db.shopItems));

app.get('/api/shop/owned', auth, (req, res) => {
    res.json((db.ownedItems || []).filter(o => o.userId === req.user.id));
});

app.post('/api/shop/buy', auth, (req, res) => {
    const { itemId } = req.body;
    const item = db.shopItems.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.stock !== undefined && item.stock <= 0) return res.status(400).json({ error: 'Sotib bo\'lmadi - qoldiq yo\'q' });
    const user = db.users.find(u => u.id === req.user.id);
    if (!user || (user.coins || 0) < item.price) return res.status(400).json({ error: 'Not enough coins' });
    user.coins -= item.price;
    if (item.stock !== undefined) item.stock--;
    db.ownedItems.push({ id: 'oi'+Date.now(), userId: req.user.id, itemId, date: new Date().toISOString().split('T')[0] });
    db.coinHistory.push({ id: 'ch'+Date.now(), userId: req.user.id, amount: item.price, reason: item.name, date: new Date().toISOString().split('T')[0], type: 'spend' });
    saveDB(db);
    res.json({ coins: user.coins });
});

// ==================== PAYMENTS ROUTES ====================
app.get('/api/payments', auth, (req, res) => {
    let payments = db.payments;
    if (req.user.role === 'oquvchi') payments = payments.filter(p => p.studentId === req.user.id);
    res.json(payments);
});

app.post('/api/payments', auth, (req, res) => {
    const { studentId, month, amount, status } = req.body;
    const id = 'p'+Date.now();
    db.payments.push({ id, studentId, month, amount, status, paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : '' });
    saveDB(db);
    res.json({ id });
});

// Student-initiated payment (online or cash)
app.post('/api/payments/pay', auth, (req, res) => {
    const { paymentId, method, amount } = req.body;
    const p = db.payments.find(x => x.id === paymentId);
    if (!p) return res.status(404).json({ error: 'Payment not found' });
    if (p.studentId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    if (p.status === 'paid') return res.status(400).json({ error: 'Already paid' });
    
    const paidAmount = amount || p.amount;
    const now = new Date();
    const uzb = new Date(now.getTime() + (5 * 60 * 60 * 1000) - (now.getTimezoneOffset() * 60 * 1000));
    const payDate = uzb.toISOString().split('T')[0];
    const payTime = uzb.toTimeString().split(' ')[0];
    
    if (paidAmount >= p.amount) {
        p.status = 'paid';
        p.paidDate = payDate;
        p.paidTime = payTime;
    } else {
        p.status = 'partial';
        p.paidAmount = (p.paidAmount || 0) + paidAmount;
        p.paidDate = payDate;
        p.paidTime = payTime;
        if (p.paidAmount >= p.amount) { p.status = 'paid'; }
    }
    p.payMethod = method; // 'online' or 'cash'
    
    if (!db.paymentHistory) db.paymentHistory = [];
    db.paymentHistory.push({
        id: 'ph'+Date.now(),
        paymentId: p.id,
        studentId: req.user.id,
        amount: paidAmount,
        method,
        date: payDate,
        time: payTime
    });
    
    saveDB(db);
    res.json({ success: true, payment: p });
});

// Get payment history for student
app.get('/api/payments/history', auth, (req, res) => {
    let history = db.paymentHistory || [];
    if (req.user.role === 'oquvchi') history = history.filter(h => h.studentId === req.user.id);
    res.json(history);
});

app.put('/api/payments/:id', auth, (req, res) => {
    const p = db.payments.find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    if (req.body.status === 'paid') { p.status = 'paid'; p.paidDate = new Date().toISOString().split('T')[0]; }
    else Object.assign(p, req.body);
    saveDB(db);
    res.json({ success: true });
});

app.delete('/api/payments/:id', auth, (req, res) => {
    db.payments = db.payments.filter(p => p.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

// ==================== TESTS ====================
app.get('/api/tests', auth, (req, res) => {
    // If student requests, return grade-appropriate tests
    const user = db.users.find(u => u.id === req.user.id);
    if (user && user.role === 'oquvchi' && user.className) {
        const grade = parseInt(user.className);
        const gradeTests = {};
        Object.keys(db.tests).forEach(subject => {
            if (grade <= 5) {
                // 5-sinf: oddiy savollar (first 5 questions)
                gradeTests[subject] = db.tests[subject].slice(0, 5);
            } else {
                // 6-sinf va yuqori: qiyin savollar (last 5 questions)
                gradeTests[subject] = db.tests[subject].slice(5, 10);
            }
        });
        return res.json(gradeTests);
    }
    res.json(db.tests);
});

// ==================== TEST RESULTS ====================
app.post('/api/test-results', auth, (req, res) => {
    const { subject, score, total, answers } = req.body;
    const percentage = Math.round((score / total) * 100);
    
    // Coin reward based on score: 10/10=5, 9=4, 8=4, 7=3, 6=2, 5=1
    let coins = 0;
    if (score === 10) coins = 5;
    else if (score >= 8) coins = 4;
    else if (score === 7) coins = 3;
    else if (score === 6) coins = 2;
    else if (score === 5) coins = 1;
    
    if (coins > 0) {
        const user = db.users.find(u => u.id === req.user.id);
        if (user) user.coins = (user.coins || 0) + coins;
        db.coinHistory.push({
            id: 'ch'+Date.now()+Math.random().toString(36).substr(2,4),
            userId: req.user.id, amount: coins,
            reason: `Test: ${subject} (${score}/${total})`,
            date: new Date().toISOString().split('T')[0], type: 'earn'
        });
    }
    
    const result = {
        id: 'tr'+Date.now()+Math.random().toString(36).substr(2,4),
        studentId: req.user.id, subject, score, total, percentage, coins,
        date: new Date().toISOString().split('T')[0]
    };
    if (!db.testResults) db.testResults = [];
    db.testResults.push(result);
    saveDB(db);
    res.json({ ...result, userCoins: db.users.find(u => u.id === req.user.id)?.coins || 0 });
});

app.get('/api/test-results', auth, (req, res) => {
    let results = db.testResults || [];
    // Teachers and directors see all results for their students
    if (req.user.role === 'oqituvchi') {
        const myGroupIds = db.groups.filter(g => g.teacherId === req.user.id).map(g => g.id);
        const myStudentIds = db.users.filter(u => u.role === 'oquvchi' && myGroupIds.includes(u.groupId)).map(u => u.id);
        results = results.filter(r => myStudentIds.includes(r.studentId));
    } else if (req.user.role === 'oquvchi') {
        results = results.filter(r => r.studentId === req.user.id);
    }
    res.json(results);
});

// ==================== TOPICS ====================
app.get('/api/topics', auth, (req, res) => {
    let topics = db.topics || [];
    if (req.query.groupId) topics = topics.filter(t => t.groupId === req.query.groupId);
    res.json(topics);
});

app.post('/api/topics', auth, (req, res) => {
    const { groupId, title, order } = req.body;
    const id = 't'+Date.now();
    if (!db.topics) db.topics = [];
    db.topics.push({ id, groupId, title, order: order||1, status:'upcoming', date:'' });
    saveDB(db);
    res.json({ id });
});

app.put('/api/topics/:id', auth, (req, res) => {
    const t = (db.topics||[]).find(x => x.id === req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    Object.assign(t, req.body);
    saveDB(db);
    res.json({ success: true });
});

app.delete('/api/topics/:id', auth, (req, res) => {
    db.topics = (db.topics||[]).filter(t => t.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

// ==================== TEACHER SALARY PAYMENTS ====================
app.get('/api/teacher-payments', auth, (req, res) => {
    if (!db.teacherPayments) db.teacherPayments = [];
    let payments = db.teacherPayments;
    if (req.user.role === 'oqituvchi') payments = payments.filter(p => p.teacherId === req.user.id);
    res.json(payments);
});

app.post('/api/teacher-payments', auth, (req, res) => {
    const { teacherId, month, amount } = req.body;
    if (!db.teacherPayments) db.teacherPayments = [];
    const id = 'tp'+Date.now();
    db.teacherPayments.push({ id, teacherId, month, amount, status:'unpaid', paidDate:'', paidMethod:'' });
    saveDB(db);
    res.json({ id });
});

app.post('/api/teacher-payments/:id/pay', auth, (req, res) => {
    const p = (db.teacherPayments||[]).find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    const { method } = req.body;
    const now = new Date();
    const uzb = new Date(now.getTime() + (5*60*60*1000) - (now.getTimezoneOffset()*60*1000));
    p.status = 'paid';
    p.paidDate = uzb.toISOString().split('T')[0];
    p.paidMethod = method || 'online';
    saveDB(db);
    res.json({ success: true });
});

app.put('/api/teacher-payments/:id', auth, (req, res) => {
    const p = (db.teacherPayments||[]).find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    Object.assign(p, req.body);
    saveDB(db);
    res.json({ success: true });
});

app.delete('/api/teacher-payments/:id', auth, (req, res) => {
    db.teacherPayments = (db.teacherPayments||[]).filter(p => p.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
});

// ==================== HOMEWORK EDIT ====================
app.put('/api/homeworks/:id', auth, (req, res) => {
    const hw = (db.homeworks||[]).find(h => h.id === req.params.id);
    if (!hw) return res.status(404).json({ error: 'Not found' });
    const { title, description, deadline, subject } = req.body;
    if (title) hw.title = title;
    if (description) hw.description = description;
    if (deadline) hw.deadline = deadline;
    if (subject) hw.subject = subject;
    saveDB(db);
    res.json({ success: true });
});

// ==================== SETTINGS ====================
app.get('/api/settings', auth, (req, res) => res.json(db.settings));

app.put('/api/settings', auth, (req, res) => {
    Object.assign(db.settings, req.body);
    saveDB(db);
    res.json({ success: true });
});

// ==================== START SERVER ====================
app.listen(PORT, () => console.log(`✅ Backend server running on http://localhost:${PORT}`));