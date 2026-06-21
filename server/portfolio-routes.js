// server/portfolio-routes.js
const express = require('express')
const router = express.Router()
const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'fcu_courses.db'))

// 🌟 1. 確保資料表結構包含 user_id
db.exec(`
  CREATE TABLE IF NOT EXISTS Portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    course_ids TEXT DEFAULT '[]',
    user_id INTEGER NOT NULL
  )
`)

// 🌟 2. 建立攔截器 (Middleware)：檢查前端有沒有帶上識別證 (x-user-id)
router.use((req, res, next) => {
  const userId = req.headers['x-user-id']
  if (!userId) {
    return res.status(401).json({ error: '拒絕存取：缺少使用者驗證資訊' })
  }
  // 將識別證存入 req，讓後面的路由可以使用
  req.userId = parseInt(userId, 10)
  next()
})

// 3. 取得「當前登入使用者」的所有組合
router.get('/', (req, res) => {
  try {
    // 🌟 加上 WHERE user_id = ?
    const rows = db.prepare('SELECT * FROM Portfolio WHERE user_id = ? ORDER BY id DESC').all(req.userId)
    rows.forEach(r => r.course_ids = JSON.parse(r.course_ids))
    res.json(rows)
  } catch (err) {
    console.error('查詢組合失敗:', err)
    res.status(500).json({ error: '查詢失敗' })
  }
})

// 4. 新增一個組合 (強制綁定當前 user_id)
router.post('/', (req, res) => {
  try {
    const { name } = req.body
    // 🌟 寫入時加上 user_id
    const info = db.prepare('INSERT INTO Portfolio (name, user_id) VALUES (?, ?)').run(name, req.userId)
    res.json({ id: info.lastInsertRowid, name, course_ids: [], user_id: req.userId })
  } catch (err) {
    console.error('新增組合失敗:', err)
    res.status(500).json({ error: '新增失敗' })
  }
})

// 5. 更新組合裡的課程 (確保只能改自己的)
router.put('/:id', (req, res) => {
  try {
    const { courseIds } = req.body
    // 🌟 加上 AND user_id = ? 避免有心人士亂改別人課表
    db.prepare('UPDATE Portfolio SET course_ids = ? WHERE id = ? AND user_id = ?').run(JSON.stringify(courseIds), req.params.id, req.userId)
    res.json({ success: true })
  } catch (err) {
    console.error('更新組合失敗:', err)
    res.status(500).json({ error: '更新失敗' })
  }
})

// 6. 刪除組合 (確保只能刪自己的)
router.delete('/:id', (req, res) => {
  try {
    // 🌟 加上 AND user_id = ?
    db.prepare('DELETE FROM Portfolio WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)
    res.json({ success: true })
  } catch (err) {
    console.error('刪除組合失敗:', err)
    res.status(500).json({ error: '刪除失敗' })
  }
})

module.exports = router