// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
// 統一使用大寫的 PORT 變數
const PORT = process.env.PORT || 3000;

// Middleware 中介軟體
app.use(cors()); 
app.use(express.json()); 

// ══════════════════════════════════════════════════════
// 1️⃣ API 路由區 (必須在最上面)
// ══════════════════════════════════════════════════════

// 🌟 修正 1：將測試網址從 '/' 改為 '/api/health'，把根目錄讓給 Vue 網頁
app.get('/api/health', (req, res) => {
  res.send('二一避險基金 API 伺服器運作中 ⚡');
});

const courseInfoRoutes = require('./course-info-routes');
app.use('/api/course-info', courseInfoRoutes);

const portfolioRoutes = require('./portfolio-routes');
app.use('/api/portfolios', portfolioRoutes);

const authRoutes = require('./auth-routes');
app.use('/api/auth', authRoutes);

const uploadRoutes = require('./upload-routes');
app.use('/api/upload', uploadRoutes);


// ══════════════════════════════════════════════════════
// 2️⃣ 前端靜態網頁處理區 (必須放在所有 API 之後！)
// ══════════════════════════════════════════════════════

// 讓 Express 提供 Vue 打包後的 dist 靜態檔案
app.use(express.static(path.join(__dirname, '../client/dist')));

// 🌟 修正 2：改用 app.get('*') 來接管前端路由，避免干擾 API 報錯機制
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// ══════════════════════════════════════════════════════
// 3️⃣ 啟動伺服器
// ══════════════════════════════════════════════════════
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================`);
  console.log(`🚀 後端伺服器已啟動: http://localhost:${PORT}`);
  console.log(`======================================\n`);
});