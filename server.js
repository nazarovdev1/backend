const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // uuid paketini import qilish

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Explicitly serve auth.html for the /auth.html route
app.get('/auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Endpoint to get messages
app.get('/api/messages', (req, res) => {
    fs.readFile('messages.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading messages');
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint to send a new message
app.post('/api/messages', (req, res) => {
    const newMessage = req.body;
    newMessage.id = uuidv4(); // Yangi xabar uchun noyob ID yaratish
    newMessage.timestamp = new Date().toISOString();

    fs.readFile('messages.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading messages');
        }
        const messages = JSON.parse(data);
        messages.push(newMessage);
        fs.writeFile('messages.json', JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving message');
            }
            res.status(201).json(newMessage);
        });
    });
});

// Endpoint for user registration
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading users file:', err);
            return res.status(500).json({ message: 'Server error during registration' });
        }

        const users = data ? JSON.parse(data) : [];

        if (users.find(user => user.username === username)) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const newUser = { id: uuidv4(), username, password }; // Foydalanuvchi uchun noyob ID
        users.push(newUser);

        fs.writeFile('users.json', JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing users file:', writeErr);
                return res.status(500).json({ message: 'Server error during registration' });
            }
            res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
        });
    });
});

// Endpoint for user login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') { // users.json fayli mavjud bo'lmasa
                 return res.status(401).json({ message: 'Invalid credentials, users file not found.' });
            }
            console.error('Error reading users file:', err);
            return res.status(500).json({ message: 'Server error during login' });
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            res.status(200).json({ message: 'Login successful', userId: user.id, username: user.username });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});