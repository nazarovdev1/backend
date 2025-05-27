const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// --- HTML Serving Routes ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// --- API Routes ---

// Endpoint to GET messages
app.get('/api/messages', (req, res) => {
    fs.readFile('messages.json', 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log("messages.json topilmadi (GET), bo'sh massiv qaytarilmoqda.");
                return res.json([]); // Fayl yo'q bo'lsa, bo'sh massiv qaytaring (200 OK)
            }
            console.error("messages.json faylini o'qishda xatolik (GET):", err);
            return res.status(500).json({ message: 'Xabarlarni o‘qishda server xatoligi' });
        }
        try {
            // Agar fayl bo'sh bo'lsa, data bo'sh string bo'ladi, JSON.parse xato beradi.
            if (!data.trim()) {
                console.log("messages.json bo'sh (GET), bo'sh massiv qaytarilmoqda.");
                return res.json([]);
            }
            const messages = JSON.parse(data);
            if (!Array.isArray(messages)) {
                console.warn("messages.json (GET) ichidagi ma'lumot massiv emas. Bo'sh massiv qaytarilmoqda.");
                return res.json([]);
            }
            res.json(messages);
        } catch (parseError) {
            console.error("messages.json (GET) faylini JSON.parse qilishda xatolik:", parseError);
            res.json([]); // Xatolik bo'lsa ham bo'sh massiv qaytaramiz
        }
    });
});

// Endpoint to POST a new message
app.post('/api/messages', (req, res) => {
    const newMessage = req.body; 
    newMessage.id = uuidv4(); 
    newMessage.timestamp = new Date().toISOString();
    newMessage.status = newMessage.status || 'Yangi';

    fs.readFile('messages.json', 'utf8', (err, data) => {
        let messages = [];
        if (err && err.code !== 'ENOENT') {
            console.error("messages.json o'qishda xatolik (POST):", err);
            return res.status(500).json({ message: 'Xabarlarni o‘qishda server xatoligi' });
        }
        
        if (!err && data && data.trim()) { // Fayl mavjud, xato yo'q va bo'sh emas
            try {
                const parsedData = JSON.parse(data);
                if (Array.isArray(parsedData)) {
                    messages = parsedData;
                } else {
                     console.warn("messages.json (POST) massiv emas. Yangi massivdan boshlanadi.");
                }
            } catch (parseErr) {
                console.error('messages.json (POST) faylini tahlil qilishda xatolik. Yangi massivdan boshlanadi:', parseErr);
            }
        }
        // Agar fayl topilmagan (ENOENT) yoki bo'sh (data.trim() false) yoki parse xatosi bo'lsa, messages = [] bo'lib qoladi
        
        messages.push(newMessage);
        fs.writeFile('messages.json', JSON.stringify(messages, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("messages.json ga yozishda xatolik (POST):", writeErr);
                return res.status(500).json({ message: 'Xabarni saqlashda server xatoligi' });
            }
            res.status(201).json(newMessage);
        });
    });
});

// Endpoint for user registration
app.post('/api/register', (req, res) => {
    const { username, password, fullName, role } = req.body;
    if (!username || !password || !fullName || !role) {
        return res.status(400).json({ message: 'Foydalanuvchi nomi, parol, to‘liq ism va rol talab qilinadi' });
    }
    if (role !== 'user' && role !== 'admin') {
        return res.status(400).json({ message: 'Rol qiymati noto\'g\'ri (faqat "user" yoki "admin")' });
    }

    fs.readFile('users.json', 'utf8', (err, data) => {
        let users = [];
        if (err && err.code !== 'ENOENT') {
            console.error('users.json faylini o‘qishda xatolik:', err);
            return res.status(500).json({ message: 'Ro‘yxatdan o‘tish paytida server xatoligi (faylni o\'qish)' });
        }
        if (!err && data && data.trim()) {
            try {
                const parsedUsers = JSON.parse(data);
                if (Array.isArray(parsedUsers)) {
                    users = parsedUsers;
                } else {
                    console.warn("users.json massiv emas. Yangi massivdan boshlanadi.");
                }
            } catch (parseErr) {
                 console.error('users.json faylini tahlil qilishda xatolik. Yangi massivdan boshlanadi:', parseErr);
            }
        }

        if (users.find(user => user.username === username)) {
            return res.status(409).json({ message: 'Bunday foydalanuvchi nomi allaqachon mavjud' });
        }
        const newUser = { id: uuidv4(), username, password, fullName, role };
        users.push(newUser);
        fs.writeFile('users.json', JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('users.json fayliga yozishda xatolik:', writeErr);
                return res.status(500).json({ message: 'Ro‘yxatdan o‘tish paytida server xatoligi (faylga yozish)' });
            }
            // Javobda fullName va username ham qaytaramiz, chunki auth.js buni ishlatadi
            res.status(201).json({ message: 'Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi', userId: newUser.id, username: newUser.username, fullName: newUser.fullName });
        });
    });
});

// Endpoint for user login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Foydalanuvchi nomi va parol talab qilinadi' });
    }
    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                 return res.status(401).json({ message: 'Kirish ma’lumotlari noto‘g‘ri, foydalanuvchilar fayli topilmadi.' });
            }
            console.error('users.json faylini o‘qishda xatolik:', err);
            return res.status(500).json({ message: 'Kirish paytida server xatoligi' });
        }
        try {
            if (!data.trim()) { // Agar users.json bo'sh bo'lsa
                return res.status(401).json({ message: 'Kirish ma’lumotlari noto‘g‘ri, foydalanuvchilar ro\'yxati bo\'sh.' });
            }
            const users = JSON.parse(data);
            if (!Array.isArray(users)) {
                console.warn("users.json massiv emas.");
                return res.status(500).json({ message: "Foydalanuvchi ma'lumotlari formati noto'g'ri."});
            }
            const user = users.find(u => u.username === username && u.password === password); // Parolni xeshlash kerak!
            if (user) {
                res.status(200).json({ message: 'Muvaffaqiyatli kirildi', userId: user.id, username: user.username, fullName: user.fullName });
            } else {
                res.status(401).json({ message: 'Kirish ma’lumotlari noto‘g‘ri' });
            }
        } catch (parseError) {
             console.error("users.json faylini JSON.parse qilishda xatolik (login):", parseError);
             return res.status(500).json({ message: "Foydalanuvchi ma'lumotlarini qayta ishlashda xatolik."});
        }
    });
});

// --- Server Listen and File Initialization ---
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} da ishlamoqda`);
    
    const filesToInitialize = ['messages.json', 'users.json'];
    filesToInitialize.forEach(fileName => {
        fs.readFile(fileName, 'utf8', (err, fileData) => {
            let needsWrite = false;
            let contentToWrite = [];

            if (err && err.code === 'ENOENT') { // Fayl mavjud emas
                console.log(`${fileName} fayli topilmadi. Yangisi yaratiladi.`);
                needsWrite = true;
            } else if (err) { // Boshqa o'qish xatoliklari
                console.error(`${fileName} ni tekshirishda o'qish xatoligi:`, err);
                return; // Xatolik bo'lsa, yozishga urinmaymiz
            } else { // Fayl mavjud, tarkibini tekshiramiz
                try {
                    if (!fileData.trim()) { // Fayl bo'sh
                        console.log(`${fileName} fayli bo'sh. Massiv bilan to'ldiriladi.`);
                        needsWrite = true;
                    } else {
                        const parsedData = JSON.parse(fileData);
                        if (!Array.isArray(parsedData)) {
                            console.warn(`${fileName} massiv emas. Bo'sh massiv bilan ustiga yozilmoqda.`);
                            needsWrite = true;
                        }
                        // Agar fayl mavjud va yaroqli massiv bo'lsa, yozish shart emas
                    }
                } catch (parseErr) {
                    console.error(`${fileName} ni tekshirishda JSON parse xatoligi. Bo'sh massiv bilan ustiga yozilmoqda.`, parseErr);
                    needsWrite = true;
                }
            }

            if (needsWrite) {
                fs.writeFile(fileName, JSON.stringify(contentToWrite, null, 2), (writeErr) => {
                    if (writeErr) console.error(`${fileName} faylini (${needsWrite ? "yangi" : "yangilangan"}) ishga tushirishda xatolik:`, writeErr);
                    else console.log(`${fileName} fayli muvaffaqiyatli ${needsWrite ? "yaratildi/yangilandi" : "tekshirildi"}.`);
                });
            }
        });
    });
});