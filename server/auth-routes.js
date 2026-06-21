// server/auth-routes.js
const express = require('express')
const router = express.Router()
const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'fcu_courses.db'))

// 🌟 自動建立 Users 資料表
db.exec(`
  CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT,
    entry_year TEXT,
    dept TEXT
  )
`)

// 🌟 同時幫 Portfolio 表格加上 user_id (讓課表能認主人)
try {
  db.exec('ALTER TABLE Portfolio ADD COLUMN user_id INTEGER')
} catch (e) {
  // 如果欄位已經存在會報錯，我們直接忽略即可
}

// 1. 註冊 API (建立個人檔案)
router.post('/register', (req, res) => {
  const { studentId, password, nickname, entryYear, dept } = req.body
  try {
    const stmt = db.prepare('INSERT INTO Users (student_id, password, nickname, entry_year, dept) VALUES (?, ?, ?, ?, ?)')
    const info = stmt.run(studentId, password, nickname, entryYear, dept)
    
    // 註冊成功，回傳使用者無密碼的資料
    res.json({ 
      success: true, 
      user: { id: info.lastInsertRowid, studentId, nickname, entryYear, dept } 
    })
  } catch (e) {
    // 捕捉學號重複的錯誤
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: '此學號已經註冊過囉！' })
    } else {
      res.status(500).json({ error: '註冊失敗' })
    }
  }
})

// 2. 登入 API
router.post('/login', (req, res) => {
  const { studentId, password } = req.body
  try {
    const user = db.prepare('SELECT id, student_id, nickname, entry_year, dept FROM Users WHERE student_id = ? AND password = ?').get(studentId, password)
    
    if (user) {
      res.json({ success: true, user })
    } else {
      res.status(401).json({ error: '學號或密碼錯誤' })
    }
  } catch (e) {
    res.status(500).json({ error: '登入失敗' })
  }
})

module.exports = router