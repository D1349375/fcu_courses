// server/course-info-routes.js
const express = require('express')
const router  = express.Router()
const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

// 連接 SQLite 資料庫
const db = new Database(path.join(__dirname, 'fcu_courses.db'))

// 🌟 確保資料庫有 Reviews (課程評論) 的資料表
db.exec(`
  CREATE TABLE IF NOT EXISTS Reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id TEXT NOT NULL,
    user_id INTEGER,
    nickname TEXT,
    rating INTEGER,
    type TEXT,
    content TEXT,
    date TEXT
  )
`)

const jsonPathSem1 = path.join(__dirname, 'fcu_all_courses.json')             // 上學期
const jsonPathSem2 = path.join(__dirname, 'fcu_parsed_courses_113_2.json')    // 下學期

let allCoursesJson_1 = []
let allCoursesJson_2 = []

try {
  const rawData1 = fs.readFileSync(jsonPathSem1, 'utf8')
  allCoursesJson_1 = JSON.parse(rawData1)
  console.log(`✅ 成功載入 [上學期] JSON，共 ${allCoursesJson_1.length} 筆`)
} catch (e) {
  console.error('⚠️ 無法讀取上學期 JSON (fcu_all_courses.json):', e.message)
}

try {
  const rawData2 = fs.readFileSync(jsonPathSem2, 'utf8')
  allCoursesJson_2 = JSON.parse(rawData2)
  console.log(`✅ 成功載入 [下學期] JSON，共 ${allCoursesJson_2.length} 筆`)
} catch (e) {
  console.error('⚠️ 無法讀取下學期 JSON (fcu_parsed_courses_113_2.json):', e.message)
}

// 輔助函式：幫單一 DB 課程自動尋找並貼上 JSON 裡的缺失欄位
const mergeJsonData = (dbCourse) => {
  if (!dbCourse) return dbCourse
  let match = allCoursesJson_1.find(j => j.sub_name === dbCourse.sub_name && j.scr_teacher === dbCourse.prof_name)
  if (!match) match = allCoursesJson_1.find(j => j.sub_id3 === dbCourse.course_code)
  if (!match) return dbCourse

  return {
    ...dbCourse,
    category: match.scj_scr_mso || dbCourse.category,
    scr_period: match.scr_period || '',
    scr_remarks: match.scr_remarks || '',
    cls_name: match.cls_name || ''
  }
}

// ─────────────────────────────────────────────
// GET /api/course-info
// ─────────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    // 🌟 1. 只有當前端明確要求 sem=1 或 sem=2 時，才回傳純 JSON 陣列 (專供個人檔案「課表解析」比對用)
    if (req.query.sem === '1') return res.json(allCoursesJson_1)
    if (req.query.sem === '2') return res.json(allCoursesJson_2)

    // 🌟 2. 預設請求 (主頁測欄、課程資料庫)：統一從 SQLite 撈取真實資料庫，資料就不會不見了！
    const courses = db.prepare('SELECT * FROM Course').all()
    const mergedCourses = courses.map(c => mergeJsonData(c))
    res.json(mergedCourses)

  } catch (err) {
    console.error('[course-info] 查詢失敗:', err)
    res.status(500).json({ error: '查詢課程資料庫失敗' })
  }
})

// ─────────────────────────────────────────────
// GET /api/course-info/:courseId
// ─────────────────────────────────────────────
router.get('/:courseId', (req, res) => {
  try {
    let course = db.prepare(`
      SELECT c.*, COUNT(w.id) AS week_count
      FROM Course c
      LEFT JOIN WeeklySchedule w ON w.course_id = c.course_id
      WHERE c.course_id = ?
      GROUP BY c.course_id
    `).get(req.params.courseId)

    if (!course) {
      return res.status(404).json({ error: '找不到該課程' })
    }

    course = mergeJsonData(course)
    const reviews = db.prepare('SELECT * FROM Reviews WHERE course_id = ? ORDER BY id DESC').all(req.params.courseId)
    course.reviews = reviews
    res.json(course)
  } catch (err) {
    console.error('[course-info] 單課查詢失敗:', err)
    res.status(500).json({ error: '查詢失敗' })
  }
})

// ─────────────────────────────────────────────
// GET /api/course-info/:courseId/schedule
// ─────────────────────────────────────────────
router.get('/:courseId/schedule', (req, res) => {
  try {
    // 🌟 3. 修復 week_num 錯誤！改用 id ASC 排序，確保每週進度正確且不會報錯
    const schedule = db.prepare('SELECT * FROM WeeklySchedule WHERE course_id = ? ORDER BY id ASC').all(req.params.courseId)
    res.json(schedule)
  } catch (err) {
    console.error('[course-info] 查詢歷史走勢失敗:', err)
    res.status(500).json({ error: '查詢走勢失敗' })
  }
})
// ─────────────────────────────────────────────
// POST /api/course-info/:courseId/reviews (新增評論)
// ─────────────────────────────────────────────
router.post('/:courseId/reviews', (req, res) => {
  try {
    const courseId = req.params.courseId
    const { user_id, nickname, rating, type, content } = req.body
    
    // 產生今天的日期 (例如: 2026-06-20)
    const date = new Date().toISOString().split('T')[0]

    const stmt = db.prepare(`
      INSERT INTO Reviews (course_id, user_id, nickname, rating, type, content, date) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const info = stmt.run(courseId, user_id, nickname, rating, type, content, date)

    // 回傳存好的資料給前端即時顯示
    res.json({
      id: info.lastInsertRowid,
      course_id: courseId,
      user_id, nickname, rating, type, content, date
    })
  } catch (err) {
    console.error('[course-info] 寫入評論失敗:', err)
    res.status(500).json({ error: '寫入評論失敗' })
  }
})


module.exports = router