const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // JSON request body'larini parse qilish uchun
app.use(express.urlencoded({ extended: true })); // URL encoded request body'larini parse qilish uchun
app.use(express.static(path.join(__dirname, 'public'))); // 'public' papkasidagi statik fayllarni ulash

// Ma'lumotlar bazasi (oddiy JSON fayllar)
const USERS_FILE = path.join(__dirname, 'users.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

// Yordamchi funksiyalar (ma'lumotlarni o'qish/yozish)
const readData = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return [];
    }
};

const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
    }
};

// Asosiy sahifa uchun marshrut
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Marshrutlari

// Foydalanuvchilar uchun API
// 1. Ro'yxatdan o'tish (Sign Up)
app.post('/api/auth/signup', (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: "Barcha maydonlar to'ldirilishi shart." });
    }

    const users = readData(USERS_FILE);

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: "Bu foydalanuvchi nomi band." });
    }
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: "Bu email allaqachon ro'yxatdan o'tgan." });
    }

    // Oddiy parol saqlash (real loyihada bcrypt kabi kutubxona bilan hash qilish kerak)
    const newUser = { id: uuidv4(), username, password, email };
    users.push(newUser);
    writeData(USERS_FILE, users);

    console.log('Yangi foydalanuvchi ro\'yxatdan o\'tdi:', newUser);
    res.status(201).json({ message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!", userId: newUser.id });
});

// 2. Tizimga kirish (Sign In)
app.post('/api/auth/signin', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Foydalanuvchi nomi va parol kiritilishi shart." });
    }

    const users = readData(USERS_FILE);
    const user = users.find(u => u.username === username && u.password === password); // Parolni tekshirish (real loyihada hash bilan solishtirish kerak)

    if (!user) {
        return res.status(401).json({ message: "Foydalanuvchi nomi yoki parol xato." });
    }

    console.log('Foydalanuvchi tizimga kirdi:', user.username);
    // Real loyihada JWT (JSON Web Token) ishlatish tavsiya etiladi
    res.status(200).json({ message: "Tizimga muvaffaqiyatli kirdingiz!", userId: user.id, username: user.username });
});

// Xabarlar uchun API (Contact Form)
// 1. Xabar yuborish
app.post('/api/messages', (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "Barcha maydonlar to'ldirilishi shart." });
    }

    const messages = readData(MESSAGES_FILE);
    const newMessage = { id: uuidv4(), name, email, subject, message, timestamp: new Date().toISOString(), read: false };
    messages.unshift(newMessage); // Yangi xabarni boshiga qo'shish
    writeData(MESSAGES_FILE, messages);

    console.log('Yangi xabar qabul qilindi:', newMessage);
    res.status(201).json({ message: "Xabaringiz muvaffaqiyatli yuborildi!" });
});

// 2. Barcha xabarlarni olish (Admin uchun)
app.get('/api/messages', (req, res) => {
    // Bu yerda admin autentifikatsiyasi qo'shilishi kerak (masalan, maxsus token yoki sessiya orqali)
    // Hozircha soddalik uchun barcha xabarlarni qaytaramiz
    const messages = readData(MESSAGES_FILE);
    res.status(200).json(messages);
});

// 3. Xabarni o'qilgan deb belgilash (Admin uchun)
app.put('/api/messages/:id/read', (req, res) => {
    const messageId = req.params.id;
    const messages = readData(MESSAGES_FILE);
    const messageIndex = messages.findIndex(msg => msg.id === messageId);

    if (messageIndex === -1) {
        return res.status(404).json({ message: "Xabar topilmadi." });
    }

    messages[messageIndex].read = true;
    writeData(MESSAGES_FILE, messages);
    console.log('Xabar o\'qildi:', messageId);
    res.status(200).json({ message: "Xabar o'qilgan deb belgilandi.", message: messages[messageIndex] });
});


// Serverni ishga tushirish
app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda ishlamoqda...`);
    // Kerakli JSON fayllar mavjudligini tekshirish va yaratish
    if (!fs.existsSync(USERS_FILE)) {
        writeData(USERS_FILE, []);
        console.log(`${USERS_FILE} fayli yaratildi.`);
    }
    if (!fs.existsSync(MESSAGES_FILE)) {
        writeData(MESSAGES_FILE, []);
        console.log(`${MESSAGES_FILE} fayli yaratildi.`);
    }
     // 'public' papkasini yaratish, agar mavjud bo'lmasa
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
        console.log(`'public' papkasi yaratildi.`);
    }
});