// server/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 建立或連線到 SQLite 資料庫檔案 (會在 server 目錄下產生 database.sqlite)
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('資料庫連線失敗：', err.message);
  } else {
    console.log('✅ 成功連線到 SQLite 資料庫');
  }
});

// 初始化資料庫結構與假資料
db.serialize(() => {
  // 1. 建立課程基本資料表
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT,
    prof TEXT,
    credits INTEGER,
    dept TEXT,
    passRate INTEGER,
    avgScore INTEGER,
    hi INTEGER,
    lo INTEGER,
    change REAL
  )`);

  // 2. 清空現有資料 (方便我們重複啟動測試)
  db.run(`DELETE FROM courses`);

  // 3. 準備寫入假資料 (這些是你原本寫在前端的 COURSES 陣列)
  const stmt = db.prepare(`INSERT INTO courses (id, name, prof, credits, dept, passRate, avgScore, hi, lo, change) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  const seedCourses = [
    { id:'CS101', name:'python程式設計', prof:'林建宏', credits:3, dept:'cs', passRate:88, avgScore:79, hi:95, lo:58, change:+2.3 },
    { id:'CS201', name:'資料結構', prof:'陳志遠', credits:3, dept:'cs', passRate:71, avgScore:72, hi:92, lo:42, change:-1.8 },
    { id:'CS301', name:'演算法', prof:'王俊傑', credits:3, dept:'cs', passRate:54, avgScore:65, hi:88, lo:38, change:-5.2 },
    { id:'CS401', name:'作業系統', prof:'張明德', credits:3, dept:'cs', passRate:68, avgScore:70, hi:91, lo:45, change:+0.5 },
    { id:'MATH101', name:'微積分', prof:'李美惠', credits:4, dept:'math', passRate:62, avgScore:66, hi:98, lo:30, change:-3.1 },
    { id:'MATH201', name:'線性代數', prof:'吳政諺', credits:3, dept:'math', passRate:73, avgScore:74, hi:96, lo:44, change:+1.2 },
    { id:'MATH301', name:'離散數學', prof:'劉書宏', credits:3, dept:'math', passRate:77, avgScore:76, hi:95, lo:50, change:+3.0 },
    { id:'ENG101', name:'英文（一）', prof:'Catherine Wu', credits:2, dept:'eng', passRate:91, avgScore:82, hi:99, lo:62, change:+0.8 },
    { id:'PE101', name:'體育（一）', prof:'蔡坤霖', credits:1, dept:'pe', passRate:96, avgScore:88, hi:100, lo:70, change:+0.2 },
    { id:'CS501', name:'計算機組織', prof:'黃志成', credits:3, dept:'cs', passRate:60, avgScore:68, hi:89, lo:40, change:-2.0 }
  ];

  seedCourses.forEach(c => {
    stmt.run(c.id, c.name, c.prof, c.credits, c.dept, c.passRate, c.avgScore, c.hi, c.lo, c.change);
  });
  stmt.finalize();

  console.log('✅ 資料表已建立，並成功寫入初始課程資料！');
});

module.exports = db;