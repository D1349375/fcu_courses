// server/upload-routes.js
const express = require('express')
const router = express.Router()
const multer = require('multer')
const { GoogleGenerativeAI } = require('@google/generative-ai')

// 1. 設定 Multer：暫存於記憶體
const upload = multer({ storage: multer.memoryStorage() })

// 2. 初始化 Gemini API
console.log('測試讀取 API KEY:', process.env.GEMINI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// 3. 接收檔案並解析的 API
router.post('/parse-schedule', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '沒有收到檔案' })

    const userId = req.headers['x-user-id']
    if (!userId) return res.status(401).json({ error: '拒絕存取：未登入' })

    const mimeType = req.file.mimetype
    const fileData = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: mimeType
      }
    }

    // 🌟 強化版 Prompt：強迫限制 JSON 格式與英文欄位
    const prompt = `
    你是一個專業的大學課表與成績單解析系統。
    請從這份文件/圖片中擷取所有的「課程資訊」，並「必須以純 JSON 陣列 (Array)」的格式回傳。
    ⚠️ 絕對不要在最外層包裝任何 Object，直接回傳 [ { ... } ] 格式！
    
    每個課程物件必須嚴格包含以下【英文欄位】：
    - name: 課程名稱 (字串)
    - code: 課程代碼 (字串，無則回傳 "")
    - credits: 學分數 (數字，無則回傳 0)
    - score: 成績 (數字，若為修習中或無成績請回傳 "--")
    - category: 分類 (字串，若無標示請發揮常識判斷為通識人文、社會、自然，或選修必修)
    - timeSlots: 陣列，包含: { "day": 星期(1~7), "start": 開始節次, "end": 結束節次, "loc": "教室地點" }

    ⚠️【絕對防呆指令】：
    1. 逢甲大學的課表常出現「資電234(電腦實習)」、「圖213_程式實作」、「理109」、「資505」等字眼，這些是【教室名稱與備註】，絕對不可以把它們當作獨立的課程！
    2. 真實的課程名稱通常會伴隨教授名字，例如「微積分(一)(黃新峰)」，請將 name 萃取為「微積分(一)」，prof 為「黃新峰」，並將伴隨的「忠211」視為 loc。
    `

    let parsedData = []
    let retryCount = 0
    const maxRetries = 3

    // 🌟 自動重試迴圈：防範 503 與 429 錯誤
    while (retryCount < maxRetries) {
      try {
        console.log(`🤖 正在呼叫 Gemini 解析檔案 (第 ${retryCount + 1} 次嘗試)...`)
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: "application/json" } 
        })
        
        const result = await model.generateContent([prompt, fileData])
        const responseText = result.response.text()
        const jsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
        
        let rawParsed = JSON.parse(jsonString)
        
        // 🌟 萬能陣列挖掘機：不管 AI 把陣列包在 data 還是 courses 裡面，硬挖出來
        if (Array.isArray(rawParsed)) {
          parsedData = rawParsed
        } else if (typeof rawParsed === 'object' && rawParsed !== null) {
          const arrayValues = Object.values(rawParsed).filter(v => Array.isArray(v))
          if (arrayValues.length > 0) {
            // 如果有多個陣列，取長度最長的那個（通常就是課表清單）
            parsedData = arrayValues.sort((a, b) => b.length - a.length)[0]
          }
        }

        // 🌟 欄位強制校正機：防範 AI 擅自把欄位翻譯成中文
        parsedData = parsedData.map(c => ({
          name: c.name || c.課程名稱 || c.Name || c.courseName || '',
          code: String(c.code || c.課程代碼 || c.Code || ''),
          credits: Number(c.credits || c.學分 || c.Credits || 0),
          score: c.score || c.成績 || c.Score || '--',
          category: c.category || c.分類 || c.Category || '',
          timeSlots: Array.isArray(c.timeSlots) ? c.timeSlots : []
        }))

        // 🌟 終極過濾器：攔截 AI 誤判的教室名稱 (包含 '資')
        const buildingRegex = /^(資|資電|人|理|忠|丘|語|土木|商|工|學思|科航|建設)\s*\d+/;
        parsedData = parsedData.filter(c => {
          if (c.name && buildingRegex.test(c.name)) {
            console.log(`🛡️ 成功攔截 AI 誤判的教室：${c.name}`);
            return false;
          }
          return true;
        })

        break; // 成功解析與清洗就跳出迴圈

      } catch (error) {
        console.error(`❌ 第 ${retryCount + 1} 次解析失敗:`, error.message || error);
        
        const is503 = error.status === 503 || (error.message && error.message.includes('503'));
        const is429 = error.status === 429 || (error.message && error.message.includes('429'));

        if (is503 || is429) {
          retryCount++;
          if (retryCount >= maxRetries) {
            return res.status(error.status || 503).json({ 
              error: is429 ? 'API 請求太頻繁，請稍等一分鐘後再試' : 'AI 伺服器持續滿載，請稍後再試' 
            });
          }
          
          const waitTime = is429 ? 10000 : 5000;
          console.log(`⏳ 遇到 ${is429 ? '429 超速' : '503 滿載'}，等待 ${waitTime / 1000} 秒後自動重試...`);
          await new Promise(resolve => setTimeout(resolve, waitTime)); 
        } else {
          return res.status(500).json({ error: 'AI 回傳格式不正確或解析失敗' });
        }
      }
    }

    // 成功回傳給前端
    console.log(`✅ 解析成功！共找出 ${parsedData.length} 門課程。`)
    res.json({ success: true, courses: parsedData })

  } catch (error) {
    console.error('❌ 伺服器發生嚴重錯誤:', error)
    res.status(500).json({ error: '後端解析發生異常，請確認伺服器狀態' })
  }
})

module.exports = router