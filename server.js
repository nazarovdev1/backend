const express = require("express")
const path = require("path")
const fs = require("fs")
const { v4: uuidv4 } = require("uuid")

const app = express()
const PORT = process.env.PORT || 3000

const MESSAGES_FILE_PATH = path.join(__dirname, "messages.json")
const USERS_FILE_PATH = path.join(__dirname, "users.json")

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// HTML Serving Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.get("/auth.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "auth.html"))
})

app.get("/dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"))
})

// Helper functions
function readJsonFile(filePath, callback) {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        console.log(`${filePath} topilmadi, bo'sh massiv qaytariladi.`)
        return callback(null, [])
      }
      console.error(`${filePath} faylini o'qishda xatolik:`, err)
      return callback(err)
    }
    try {
      if (!data.trim()) {
        console.log(`${filePath} bo'sh, bo'sh massiv qaytariladi.`)
        return callback(null, [])
      }
      const jsonData = JSON.parse(data)
      if (!Array.isArray(jsonData)) {
        console.warn(`${filePath} ichidagi ma'lumot massiv emas. Bo'sh massiv qaytariladi.`)
        return callback(null, [])
      }
      callback(null, jsonData)
    } catch (parseError) {
      console.error(`${filePath} faylini JSON.parse qilishda xatolik:`, parseError)
      callback(null, [])
    }
  })
}

function writeJsonFile(filePath, data, callback) {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8", callback)
}

// API Endpoints

// GET messages
app.get("/api/messages", (req, res) => {
  readJsonFile(MESSAGES_FILE_PATH, (err, messages) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Xabarlarni o'qishda server xatoligi",
      })
    }

    const sortedMessages = messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    res.json(sortedMessages)
  })
})

// POST new message
app.post("/api/messages", (req, res) => {
  const { name, email, phone, subject, message } = req.body

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Ism, Email, Mavzu va Xabar maydonlari to'ldirilishi shart.",
    })
  }

  const newMessage = {
    id: uuidv4(),
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : "",
    subject: subject.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString(),
    status: "Yangi",
  }

  readJsonFile(MESSAGES_FILE_PATH, (err, messages) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Xabarlarni o'qishda server xatoligi",
      })
    }

    messages.push(newMessage)

    writeJsonFile(MESSAGES_FILE_PATH, messages, (writeErr) => {
      if (writeErr) {
        console.error("messages.json ga yozishda xatolik:", writeErr)
        return res.status(500).json({
          success: false,
          message: "Xabarni saqlashda server xatoligi",
        })
      }

      console.log("Yangi xabar qo'shildi:", newMessage.id)
      res.status(201).json({
        success: true,
        message: "Xabar muvaffaqiyatli yuborildi",
        data: newMessage,
      })
    })
  })
})

// Mark message as read
app.post("/api/messages/:id/read", (req, res) => {
  const messageId = req.params.id

  readJsonFile(MESSAGES_FILE_PATH, (err, messages) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Xabarlarni o'qishda xatolik",
      })
    }

    const messageIndex = messages.findIndex((msg) => msg.id === messageId)
    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Xabar topilmadi",
      })
    }

    messages[messageIndex].status = "O'qilgan"

    writeJsonFile(MESSAGES_FILE_PATH, messages, (writeErr) => {
      if (writeErr) {
        return res.status(500).json({
          success: false,
          message: "Xabarni yangilashda xatolik",
        })
      }

      res.json({
        success: true,
        message: "Xabar o'qilgan deb belgilandi",
        data: messages[messageIndex],
      })
    })
  })
})

// DELETE message
app.delete("/api/messages/:id", (req, res) => {
  const messageId = req.params.id

  readJsonFile(MESSAGES_FILE_PATH, (err, messages) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Xabarlarni o'qishda xatolik",
      })
    }

    const filteredMessages = messages.filter((msg) => msg.id !== messageId)
    if (filteredMessages.length === messages.length) {
      return res.status(404).json({
        success: false,
        message: "O'chirish uchun xabar topilmadi",
      })
    }

    writeJsonFile(MESSAGES_FILE_PATH, filteredMessages, (writeErr) => {
      if (writeErr) {
        return res.status(500).json({
          success: false,
          message: "Xabarni o'chirishda xatolik",
        })
      }

      res.json({
        success: true,
        message: "Xabar muvaffaqiyatli o'chirildi",
      })
    })
  })
})

// User registration with role validation
app.post("/api/register", (req, res) => {
  const { username, password, fullName, role } = req.body

  if (!username || !password || !fullName || !role) {
    return res.status(400).json({
      success: false,
      message: "Foydalanuvchi nomi, parol, to'liq ism va rol talab qilinadi",
    })
  }

  if (role !== "user" && role !== "admin") {
    return res.status(400).json({
      success: false,
      message: 'Rol qiymati noto\'g\'ri (faqat "user" yoki "admin")',
    })
  }

  readJsonFile(USERS_FILE_PATH, (err, users) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Ro'yxatdan o'tish paytida server xatoligi",
      })
    }

    // Check if username already exists
    if (users.find((user) => user.username === username)) {
      return res.status(409).json({
        success: false,
        message: "Bunday foydalanuvchi nomi allaqachon mavjud",
      })
    }

    const newUser = {
      id: uuidv4(),
      username: username.trim(),
      password: password.trim(),
      fullName: fullName.trim(),
      role: role,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    writeJsonFile(USERS_FILE_PATH, users, (writeErr) => {
      if (writeErr) {
        console.error("users.json fayliga yozishda xatolik:", writeErr)
        return res.status(500).json({
          success: false,
          message: "Ro'yxatdan o'tish paytida server xatoligi",
        })
      }

      res.status(201).json({
        success: true,
        message: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
        user: {
          id: newUser.id,
          username: newUser.username,
          fullName: newUser.fullName,
          role: newUser.role,
        },
      })
    })
  })
})

// User login with role validation
app.post("/api/login", (req, res) => {
  const { username, password, role } = req.body

  if (!username || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Foydalanuvchi nomi, parol va rol talab qilinadi",
    })
  }

  readJsonFile(USERS_FILE_PATH, (err, users) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Kirish paytida server xatoligi",
      })
    }

    // Find user with matching username, password AND role
    const user = users.find((u) => u.username === username && u.password === password && u.role === role)

    if (user) {
      res.status(200).json({
        success: true,
        message: "Muvaffaqiyatli kirildi",
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
        },
      })
    } else {
      // Check if user exists with different role
      const userWithDifferentRole = users.find((u) => u.username === username && u.password === password)

      if (userWithDifferentRole) {
        return res.status(403).json({
          success: false,
          message: `Bu hisobga ${userWithDifferentRole.role} sifatida ro'yxatdan o'tgansiz. ${role} sifatida kira olmaysiz.`,
        })
      }

      res.status(401).json({
        success: false,
        message: "Kirish ma'lumotlari noto'g'ri",
      })
    }
  })
})

// Initialize JSON files
function initializeFiles() {
  ;[MESSAGES_FILE_PATH, USERS_FILE_PATH].forEach((filePath) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.log(`${path.basename(filePath)} topilmadi. Bo'sh massiv bilan yangisi yaratiladi.`)
        writeJsonFile(filePath, [], (initWriteErr) => {
          if (initWriteErr) {
            console.error(`${path.basename(filePath)} faylini ishga tushirishda xatolik:`, initWriteErr)
          } else {
            console.log(`${path.basename(filePath)} fayli muvaffaqiyatli yaratildi.`)
          }
        })
      } else {
        fs.readFile(filePath, "utf8", (readErr, fileData) => {
          if (readErr) {
            console.error(`${path.basename(filePath)} ni o'qishda xatolik:`, readErr)
            return
          }
          try {
            if (!fileData.trim()) throw new Error("Fayl bo'sh")
            const parsedData = JSON.parse(fileData)
            if (!Array.isArray(parsedData)) throw new Error("Massiv emas")
            console.log(`${path.basename(filePath)} fayli yaroqli.`)
          } catch (parseOrEmptyErr) {
            console.warn(`${path.basename(filePath)} yaroqsiz yoki bo'sh. Bo'sh massiv bilan qayta yoziladi.`)
            writeJsonFile(filePath, [], (fixWriteErr) => {
              if (fixWriteErr) {
                console.error(`${path.basename(filePath)} ni tuzatishda xatolik:`, fixWriteErr)
              } else {
                console.log(`${path.basename(filePath)} fayli muvaffaqiyatli tuzatildi.`)
              }
            })
          }
        })
      }
    })
  })
}

// Start server
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} da ishlamoqda`)
  initializeFiles()
})
