// server/server.js
const path = require('path');
// 🌟 讓 Express 提供 Vue 打包後的靜態檔案
app.use(express.static(path.join(__dirname, 'public')));

// 🌟 將所有未知的路由導向 Vue 的 index.html，讓 Vue Router 接管前端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); // 引入我們剛剛寫的資料庫設定

const app = express();
const port = process.env.PORT || 3000;

// Middleware 中介軟體
app.use(cors()); // 允許跨網域請求 (讓前端的 port 5173 可以打到後端的 port 3000)
app.use(express.json()); // 解析 JSON 格式的請求

// ─── API 路由區 ───

// [測試用] 確認伺服器有活著
app.get('/', (req, res) => {
  res.send('二一避險基金 API 伺服器運作中 ⚡');
});

// 載入真實的課程資料庫路由
const courseInfoRoutes = require('./course-info-routes');
app.use('/api/course-info', courseInfoRoutes);

// 🌟🌟🌟 新增這兩行：掛載課表組合的路由 🌟🌟🌟
const portfolioRoutes = require('./portfolio-routes')
app.use('/api/portfolios', portfolioRoutes)

const authRoutes = require('./auth-routes')
app.use('/api/auth', authRoutes)

const uploadRoutes = require('./upload-routes')
app.use('/api/upload', uploadRoutes)

// 啟動伺服器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================`);
  console.log(`🚀 後端伺服器已啟動: http://localhost:${PORT}`);
  console.log(`======================================\n`);
});