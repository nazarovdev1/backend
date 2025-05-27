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
                return res.json([]); 
            }
            console.error("messages.json faylini o'qishda xatolik (GET):", err);
            return res.status(500).json({ message: 'Xabarlarni o‘qishda server xatoligi' });
        }
        try {
            const messages = JSON.parse(data);
            if (!Array.isArray(messages)) {
                console.warn("messages.json (GET) ichidagi ma'lumot massiv emas. Bo'sh massiv qaytarilmoqda.");
                return res.json([]);
            }
            res.json(messages);
        } catch (parseError) {
            console.error("messages.json (GET) faylini JSON.parse qilishda xatolik:", parseError);
            res.json([]); 
        }
    });
});

// Endpoint to POST a new message
app.post('/api/messages', (req, res) => {
    const newMessage = req.body; 
    newMessage.id = uuidv4(); 
    newMessage.timestamp = new Date().toISOString();
    newMessage.status = newMessage.status || 'Yangi'; // Holat uchun standart qiymat

    fs.readFile('messages.json', 'utf8', (err, data) => {
        let messages = [];
        if (err && err.code !== 'ENOENT') {
            console.error("messages.json o'qishda xatolik (POST):", err);
            return res.status(500).json({ message: 'Xabarlarni o‘qishda server xatoligi' });
        }
        if (!err && data) { // Agar xato bo'lmasa va data mavjud bo'lsa
            try {
                const parsedData = JSON.parse(data);
                if (Array.isArray(parsedData)) {
                    messages = parsedData;
                } else {
                     console.warn("messages.json (POST) massiv emas, qayta yozilmoqda.");
                }
            } catch (parseErr) {
                console.error('messages.json (POST) faylini tahlil qilishda xatolik, fayl ustiga yoziladi:', parseErr);
                // messages bo'sh massivligicha qoladi
            }
        }
        
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
        if (err && err.code !== 'ENOENT') {
            console.error('users.json faylini o‘qishda xatolik:', err);
            return res.status(500).json({ message: 'Ro‘yxatdan o‘tish paytida server xatoligi' });
        }
        const users = data ? JSON.parse(data) : [];
        if (users.find(user => user.username === username)) {
            return res.status(409).json({ message: 'Bunday foydalanuvchi nomi allaqachon mavjud' });
        }
        const newUser = { id: uuidv4(), username, password, fullName, role };
        users.push(newUser);
        fs.writeFile('users.json', JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('users.json fayliga yozishda xatolik:', writeErr);
                return res.status(500).json({ message: 'Ro‘yxatdan o‘tish paytida server xatoligi' });
            }
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
                 return res.status(401).json({ message: 'Kirish ma’lumotlari noto‘g‘ri, users.json fayli topilmadi.' });
            }
            console.error('users.json faylini o‘qishda xatolik:', err);
            return res.status(500).json({ message: 'Kirish paytida server xatoligi' });
        }
        try {
            const users = JSON.parse(data);
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                res.status(200).json({ message: 'Muvaffaqiyatli kirildi', userId: user.id, username: user.username, fullName: user.fullName });
            } else {
                res.status(401).json({ message: 'Kirish ma’lumotlari noto‘g‘ri' });
            }
        } catch (parseError) {
             console.error("users.json faylini JSON.parse qilishda xatolik:", parseError);
             return res.status(500).json({ message: 'Foydalanuvchi ma\'lumotlarini o\'qishda xatolik.' });
        }
    });
});

// --- Server Listen and File Initialization ---
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} da ishlamoqda`);
    // Initialize messages.json if it doesn't exist or is not an array
    fs.readFile('messages.json', 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') { // File doesn't exist
            fs.writeFile('messages.json', JSON.stringify([], null, 2), (writeErr) => {
                if (writeErr) console.error('messages.json faylini ishga tushirishda xatolik:', writeErr);
                else console.log('messages.json fayli bo\'sh massiv bilan yaratildi.');
            });
        } else if (err) { // Other read errors
            console.error("messages.json ni tekshirishda xatolik:", err);
        } else { // File exists, check if it's an array
            try {
                const messages = JSON.parse(data);
                if (!Array.isArray(messages)) {
                    console.warn("messages.json massiv emas. Bo'sh massiv bilan ustiga yozilmoqda.");
                    fs.writeFile('messages.json', JSON.stringify([], null, 2), (writeErr) => {
                        if (writeErr) console.error('messages.json ni bo\'sh massiv bilan ustiga yozishda xatolik:', writeErr);
                        else console.log('messages.json bo\'sh massiv bilan yangilandi.');
                    });
                }
            } catch (parseErr) {
                console.error("messages.json ni tekshirishda JSON parse xatoligi. Bo'sh massiv bilan ustiga yozilmoqda.", parseErr);
                fs.writeFile('messages.json', JSON.stringify([], null, 2), (writeErr) => {
                    if (writeErr) console.error('messages.json ni bo\'sh massiv bilan ustiga yozishda (parse xatosi) xatolik:', writeErr);
                    else console.log('messages.json (parse xatosi) bo\'sh massiv bilan yangilandi.');
                });
            }
        }
    });

    // Initialize users.json (similar logic can be applied if needed)
    fs.access('users.json', fs.constants.F_OK, (errAccess) => {
        if (errAccess) {
            fs.writeFile('users.json', JSON.stringify([], null, 2), (writeErr) => {
                if (writeErr) console.error('users.json faylini ishga tushirishda xatolik:', writeErr);
                else console.log('users.json ishga tushirildi.');
            });
        }
    });
});