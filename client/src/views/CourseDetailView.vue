<template>
  <div v-if="!course" class="loading-state">
    資料載入中...
  </div>
  
  <div v-else>
    
    <div class="page-detail main-panel">
      
      <div class="course-hero">
        <div class="hero-inner">
          <div class="course-hero-top">
            <div>
              <div class="course-ticker">{{ course.id }} · {{ course.dept.toUpperCase() }} · {{ course.credits }} 學分</div>
              <div class="course-hero-name">{{ course.name }}</div>
              <div class="course-hero-prof">
                <span style="display:flex;align-items:center;gap:4px;">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6" cy="4" r="2.5"/><path d="M1 11c0-2.76 2.24-5 5-5s5 2.24 5 5"/></svg> 
                  {{ course.prof }}
                </span>
              </div>
            </div>
            <div class="price-display">
              <div class="price-big" :class="passClass">{{ course.passRate }}%</div>
              <div class="price-change-row">
                <span :class="changeClass">{{ course.change >= 0 ? '▲' : '▼' }}{{ Math.abs(course.change).toFixed(1) }}%</span>
                <span style="color:var(--text-muted);">過課率</span>
              </div>
            </div>
          </div>
          
          <div class="ohlcv-row">
            <div class="ohlcv-item"><div class="ohlcv-label">平均分 AVG</div><div class="ohlcv-val">{{ course.avgScore }}</div></div>
            <div class="ohlcv-item"><div class="ohlcv-label">最高 HIGH</div><div class="ohlcv-val" style="color:var(--green)">{{ course.hi }}</div></div>
            <div class="ohlcv-item"><div class="ohlcv-label">最低 LOW</div><div class="ohlcv-val" style="color:var(--red)">{{ course.lo }}</div></div>
            <div class="ohlcv-item">
              <div class="ohlcv-label">風險等級</div>
              <div class="ohlcv-val" :style="{ color: riskColor }">{{ riskLabel }}</div>
            </div>
            <div style="margin-left:auto; display: flex; gap: 10px;">
              <button class="btn-ghost" @click="router.push('/')">返回大盤</button>
              <button class="btn-primary" @click="router.push('/backtest')">＋ 加入回測</button>
            </div>
          </div>
        </div>
      </div>

      <div class="content-area">
        <div class="two-col-layout">
          <div>
            <div class="chart-wrap">
              <div class="card-header">
                <span class="card-title">歷年盤勢 — 過課率 K 線</span>
                <div class="chart-controls">
                  <button class="chart-btn" :class="{ active: chartType === 'bar' }" @click="toggleChart('bar')">K線</button>
                  <button class="chart-btn" :class="{ active: chartType === 'line' }" @click="toggleChart('line')">折線</button>
                </div>
              </div>
              <div style="position: relative; height: 240px; width: 100%;"><canvas id="detailChart"></canvas></div>
            </div>
          </div>

          <div>
            <div class="card mb-4" style="margin-bottom:12px;">
              <div class="card-header"><span class="card-title">課程資訊</span></div>
              <div style="display:flex;flex-direction:column;gap:8px;">
                <div class="info-row"><span class="info-key">課程代碼</span><span class="info-val">{{ course.id }}</span></div>
                <div class="info-row"><span class="info-key">學分數</span><span class="info-val">{{ course.credits }} 學分</span></div>
                <div class="info-row"><span class="info-key">授課教授</span><span class="info-val">{{ course.prof }}</span></div>
                <div class="info-row"><span class="info-key">開課學系</span><span class="info-val">{{ course.dept.toUpperCase() }}</span></div>
                
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-soft);">
                  <button class="btn-outline-primary" style="width: 100%; justify-content: center;" @click="openInfoPanel">
                    📄 查看完整課綱與每週進度
                  </button>
                </div>
                
                <div style="margin-top: 6px;">
                  <button class="btn-outline-accent" style="width: 100%; justify-content: center;" @click="openReviewPanel">
                    💬 查看市場情緒 / 歷年評價
                  </button>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header"><span class="card-title">選課建議</span></div>
              <div :class="['advice-card', getAdviceClass(course.passRate)]">
                <div style="font-size:12px;font-weight:600;margin-bottom:4px;">{{ adviceTitle }}</div>
                <div style="font-size:11px;color:var(--text-secondary);line-height:1.6;">{{ course.advice }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="review-overlay" :class="{ open: isReviewOpen }">
        <div class="review-page-inner">
          
          <div class="review-header">
            <button class="review-back-btn" @click="isReviewOpen = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              返回看盤
            </button>
            <div class="review-header-title">
              <div style="font-weight:700; font-size:15px; color:var(--text-primary)">{{ course.name }}</div>
              <div style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted); margin-top:2px;">{{ course.prof }} · 歷年評價</div>
            </div>
            <div style="width:80px;"></div> 
          </div>

          <div class="review-content">
            <div class="summary-card">
              <div class="score-main">
                <div class="score-number">{{ reviewStats.avg.toFixed(1) }}</div>
                <div class="score-stars">
                  <span v-for="n in 5" :key="n" :class="n <= Math.round(reviewStats.avg) ? 'star-filled' : 'star-empty'">★</span>
                </div>
                <div class="score-total">根據 {{ reviews.length }} 則評價</div>
              </div>
              <div class="score-bars">
                <div class="bar-row" v-for="n in 5" :key="n">
                  <div class="bar-label">{{ 6 - n }} 星</div>
                  <div class="bar-track">
                    <div class="bar-fill" :style="{ width: (reviewStats.counts[6-n] / reviews.length * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="review-filters">
              <div class="tag-cloud">
                <button class="cloud-tag" :class="{ active: activeTag === 'all' }" @click="activeTag = 'all'">全部</button>
                <button v-for="tag in availableTags" :key="tag" class="cloud-tag" :class="{ active: activeTag === tag }" @click="activeTag = tag">
                  #{{ tag }}
                </button>
              </div>
            </div>

            <div class="review-list">
              <div v-if="filteredReviews.length === 0" style="text-align:center; padding: 40px; color: var(--text-muted); font-size:13px;">
                無符合條件的評價
              </div>
              
              <div v-for="r in filteredReviews" :key="r.id" class="review-card">
                <div class="rc-header">
                  <div class="rc-user">
                    <div class="rc-avatar">{{ r.author.charAt(0) }}</div>
                    <div>
                      <div class="rc-name">{{ r.author }}</div>
                      <div class="rc-meta">{{ r.semester }} 修課 · {{ r.dept }}</div>
                    </div>
                  </div>
                  <div class="rc-stars">
                    <span v-for="n in 5" :key="n" :class="n <= r.rating ? 'star-filled' : 'star-empty'">★</span>
                  </div>
                </div>
                <div class="rc-content" v-html="formatText(r.content)"></div>
                <div class="rc-tags">
                  <span v-for="t in r.tags" :key="t" class="rc-tag">#{{ t }}</span>
                </div>
                <div class="rc-footer">
                  <span class="rc-date">{{ r.date }}</span>
                  <button class="rc-like-btn" :class="{ liked: r.isLiked }" @click="toggleLike(r)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                    有用 ({{ r.likes }})
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button v-if="course" class="fab-review" @click="isWriteModalOpen = true">
            <span style="font-size: 20px;">✍️</span> 寫評論
          </button>
        </div>
      </div>

      <div class="write-modal-overlay" :class="{ open: isWriteModalOpen }" @click.self="isWriteModalOpen = false">
        <div class="write-modal">
          <div class="write-modal-header">
            <h3>撰寫課程評價</h3>
            <button class="btn-ghost" style="padding: 4px; border: none;" @click="isWriteModalOpen = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="write-modal-body">
            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px;">課程整體評分</label>
              <div class="write-stars">
                <span v-for="n in 5" :key="n" @click="newReview.rating = n" :class="n <= newReview.rating ? 'star-filled' : 'star-empty'">★</span>
              </div>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px;">修課學期</label>
              <select v-model="newReview.semester" class="write-select">
                <option value="113-1">113-1</option>
                <option value="112-2">112-2</option>
                <option value="112-1">112-1</option>
              </select>
            </div>
            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px;">評價內容</label>
              <textarea v-model="newReview.content" class="write-textarea" placeholder="這堂課的作業量如何？考試難度？給分甜嗎？分享你的修課心得..."></textarea>
            </div>
            <button class="write-submit-btn" @click="submitReview" :disabled="!newReview.content.trim() || newReview.rating === 0">
              發布評價
            </button>
          </div>
        </div>
      </div>

      <div class="drawer-overlay" :class="{ open: isSyllabusModalOpen }" @click.self="isSyllabusModalOpen = false">
        <div class="drawer-panel" :class="{ 'is-fullscreen': isSyllabusFullscreen }">
          
          <div class="drawer-header">
            <h3 style="font-size: 16px; color: var(--text-primary); font-weight: 600;">課程詳細資訊 - {{ course?.name }}</h3>
            <div style="display: flex; gap: 8px;">
              <button class="btn-ghost" @click="isSyllabusFullscreen = !isSyllabusFullscreen">
                {{ isSyllabusFullscreen ? '🗗 縮小' : '🖵 全螢幕' }}
              </button>
              <button class="btn-ghost" style="padding: 4px; border: none;" @click="isSyllabusModalOpen = false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
          
          <div class="drawer-body" style="background: var(--bg-base);">
            <div class="card mb-4">
              <div class="card-header"><span class="card-title">基本資料</span></div>
              <div style="display:flex;flex-direction:column;gap:12px;">
                <div class="info-row"><span class="info-key">課程名稱</span><span class="info-val">{{ course?.name }}</span></div>
                <div class="info-row"><span class="info-key">課程代碼</span><span class="info-val">{{ course?.id }}</span></div>
                <div class="info-row"><span class="info-key">授課教授</span><span class="info-val">{{ course?.prof }}</span></div>
                <div class="info-row"><span class="info-key">開課單位</span><span class="info-val">{{ course?.dept }}</span></div>
                <div class="info-row"><span class="info-key">學分數</span><span class="info-val">{{ course?.credits }} 學分</span></div>
                <div class="info-row"><span class="info-key">修別分類</span><span class="info-val"><span class="tag tag-info">{{ course?.category }}</span></span></div>
              </div>
            </div>

            <div class="card mb-4">
              <div class="card-header"><span class="card-title">上課時間與地點</span></div>
              <div style="font-family: var(--font-mono); color: var(--accent-teal); font-size: 14px; background: rgba(45, 212, 191, 0.05); padding: 14px; border-radius: var(--radius); border-left: 3px solid var(--accent-teal);">
                {{ course?.scr_period }}
              </div>
            </div>

            <div class="card">
              <div class="card-header"><span class="card-title">課程備註與大綱</span></div>
              <div style="font-size: 13px; line-height: 1.8; color: var(--text-secondary); white-space: pre-wrap;">
                {{ course?.scr_remarks }}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Chart from 'chart.js/auto'

const route = useRoute()
const router = useRouter()

// ─── 🌟 補上這三個 UI 狀態控制開關 ───
const isSyllabusModalOpen = ref(false)    // 控制右側課綱抽屜開關
const isSyllabusFullscreen = ref(false)   // 控制抽屜是否放大為全螢幕
const isWriteModalOpen = ref(false)       // 控制寫評論的彈窗開關

// ─── 看盤頁基本狀態 ───
const course = ref(null)
const chartType = ref('bar')
let detailChartInstance = null

// ─── 評價系統狀態 (新增) ───
const isReviewOpen = ref(false)
const reviews = ref([])
const activeTag = ref('all')
const newReview = ref({ rating: 0, semester: '113-1', content: '' })

// ─── 假資料引擎：根據過課率生成市場情緒 ───
const generateMockReviews = (passRate) => {
  const isSweet = passRate >= 75
  const isHard = passRate < 60
  
  const sweetComments = [
    { text: "教授人超好，只要有出席作業有交基本上都會過，期末大推！", tags: ["甜課", "輕鬆", "推薦"] },
    { text: "考試都是考上課講過的，不刁難學生，給分很佛。", tags: ["給分甜", "考試簡單"] },
    { text: "上課滿有趣的，雖然有分組報告但不會太重，適合想拿高分的人。", tags: ["甜課", "報告不重"] }
  ]
  
  const midComments = [
    { text: "中規中矩的課，要花點時間念書，但學得到東西。", tags: ["中規中矩", "充實"] },
    { text: "作業偏多，但給分算合理。期中考偏難要小心。", tags: ["作業偏多", "考試偏難"] },
    { text: "教授上課有點催眠，但考前會洩題，有背有分。", tags: ["催眠", "背多分"] }
  ]
  
  const hardComments = [
    { text: "快逃！傳說中的大刀，期中考一半人不及格，作業又超硬。", tags: ["快逃", "大刀", "作業超硬"] },
    { text: "給分超級嚴格，小考錯一題扣超重，心臟大顆再來修。", tags: ["給分嚴", "硬課"] },
    { text: "外系去修根本是去當砲灰，如果不是必修千萬別碰。", tags: ["外系不友善", "快逃"] }
  ]

  // 根據過課率決定留言的分佈
  let pool = []
  if (isSweet) pool = [...sweetComments, ...sweetComments, ...midComments]
  else if (isHard) pool = [...hardComments, ...hardComments, ...midComments]
  else pool = [...midComments, ...midComments, ...sweetComments, ...hardComments]

  const result = []
  const reviewCount = Math.floor(Math.random() * 8) + 3 // 3 ~ 10 則假留言
  
  for(let i=0; i<reviewCount; i++) {
    const template = pool[Math.floor(Math.random() * pool.length)]
    // 評分邏輯
    let rating = isSweet ? (Math.random() > 0.3 ? 5 : 4) : 
                 isHard ? (Math.random() > 0.4 ? 1 : 2) : 
                 (Math.floor(Math.random() * 3) + 3)

    result.push({
      id: i,
      author: ['王同學','林同學','陳同學','張同學','李同學','許同學'][Math.floor(Math.random()*6)],
      dept: ['資訊系','電機系','企管系','財金系','通訊系'][Math.floor(Math.random()*5)],
      semester: ['112-1','112-2','111-2'][Math.floor(Math.random()*3)],
      rating: rating,
      content: template.text,
      tags: template.tags,
      likes: Math.floor(Math.random() * 20),
      isLiked: false,
      date: '2023-12-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
    })
  }
  
  // 按讚數排序
  return result.sort((a,b) => b.likes - a.likes)
}

// ─── 評價系統計算屬性 ───
const reviewStats = computed(() => {
  const counts = { 1:0, 2:0, 3:0, 4:0, 5:0 }
  let sum = 0
  reviews.value.forEach(r => {
    counts[r.rating]++
    sum += r.rating
  })
  return {
    avg: reviews.value.length ? (sum / reviews.value.length) : 0,
    counts: counts
  }
})

const availableTags = computed(() => {
  const tags = new Set()
  reviews.value.forEach(r => r.tags.forEach(t => tags.add(t)))
  return Array.from(tags)
})

const filteredReviews = computed(() => {
  if (activeTag.value === 'all') return reviews.value
  return reviews.value.filter(r => r.tags.includes(activeTag.value))
})

// ─── 評價系統方法 ───
const openReviewPanel = () => { isReviewOpen.value = true }

const toggleLike = (review) => {
  if (review.isLiked) { review.likes--; review.isLiked = false; }
  else { review.likes++; review.isLiked = true; }
}

// 🌟 串接後端：寫入資料庫
// 🌟 串接後端：寫入資料庫與即時更新畫面
const submitReview = async () => {
  if (!newReview.value.content.trim()) return

  // 抓取當前登入者
  const currentUser = JSON.parse(localStorage.getItem('fce_user') || '{}')
  const reviewPayload = {
    user_id: currentUser.id || 0,
    nickname: currentUser.nickname || '匿名使用者',
    rating: newReview.value.rating,
    type: newReview.value.type || '推',
    content: newReview.value.content
  }

  try {
    const res = await fetch(`/api/course-info/${route.params.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewPayload)
    })

    if (res.ok) {
      const savedReview = await res.json()
      
      // 🌟 關鍵修復：將後端回傳的資料，轉換成前端 UI 讀得懂的格式！
      const newFormattedReview = {
        id: 'db-' + savedReview.id,
        author: savedReview.nickname || '匿名使用者',
        dept: currentUser.dept || '本校學生', 
        semester: newReview.value.semester || '113-1',
        rating: savedReview.rating,
        content: savedReview.content,
        tags: ['最新評價'], // 給自己寫的評論上個標籤
        likes: 0,
        isLiked: false,
        date: savedReview.date
      }
      
      // 將這筆新評論推到畫面的「最上方」
      reviews.value.unshift(newFormattedReview)

      // 清空表單並關閉彈窗
      isWriteModalOpen.value = false
      newReview.value = { rating: 5, semester: '113-1', content: '' } 
      
      // 跳出成功通知
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'success', icon: '✅', title: '發布成功', msg: '您的評論已永久寫入資料庫！' } }))
    }
  } catch (error) {
    console.error('評論寫入失敗:', error)
  }
}

const formatText = (text) => text ? text.replace(/\n/g, '<br>') : ''

// ─── 看盤頁基本邏輯 (保留原有) ───
const passClass = computed(() => course.value.passRate >= 80 ? 'up' : course.value.passRate >= 65 ? 'neutral' : 'dn')
const changeClass = computed(() => course.value.change >= 0 ? 'up' : 'dn')
const riskLabel = computed(() => course.value.passRate >= 80 ? 'LOW' : course.value.passRate >= 65 ? 'MID' : 'HIGH')
const riskColor = computed(() => course.value.passRate >= 80 ? 'var(--green)' : course.value.passRate >= 65 ? 'var(--amber)' : 'var(--red)')
const adviceTitle = computed(() => course.value.passRate >= 80 ? '◎ 適合選修' : course.value.passRate >= 65 ? '△ 謹慎選修' : '✕ 高風險課程')
const getAdviceClass = (rate) => { if (rate >= 80) return 'advice-safe'; if (rate >= 65) return 'advice-mid'; return 'advice-high'; }

onMounted(async () => {
  try {
    const courseId = route.params.id
    const res = await fetch(`/api/course-info/${courseId}`)
    const c = await res.json()

    if (c && !c.error) {
      const fakePassRate = Math.floor(Math.random() * 46) + 50;
      course.value = {
        raw: c, id: c.scr_selcode || (c.course_id ? String(c.course_id).slice(-4) : c.sub_id3),
        name: c.sub_name, prof: c.scr_teacher || '未知',
        credits: c.scr_credit || 3, dept: c.cls_name || '未知',
        scr_period: c.scr_period || '暫無上課時間與地點資料',
        scr_remarks: c.scr_remarks || '本課程暫無詳細備註與大綱',
        category: c.category || c.scj_scr_mso || '未分類',
        passRate: fakePassRate, avgScore: fakePassRate - 5,
        hi: 95, lo: 42, change: parseFloat((Math.random() * 10 - 5).toFixed(1)),
        history: [fakePassRate - 4, fakePassRate + 2, fakePassRate - 1, fakePassRate + 3, fakePassRate],
        advice: fakePassRate >= 80 ? '基礎課程，只要定期出席並完成作業，即可輕鬆拿高分。' 
              : fakePassRate >= 65 ? '難度適中，需要花費一定時間複習，建議搭配相關先修課程。' 
              : '此為大刀課程，過課率極低，強烈建議衡量自身學習負載後再決定是否選修。'
      }
      
      // 🌟 關鍵修復：將「資料庫的真實留言」與「系統生成的假留言」合併
      // 1. 處理真實留言
      const dbReviews = (c.reviews || []).map(r => ({
        id: 'db-' + r.id,
        author: r.nickname || '匿名使用者',
        dept: '本校學生',
        semester: '歷史修課', 
        rating: r.rating,
        content: r.content,
        tags: [],
        likes: 0,
        isLiked: false,
        date: r.date
      }))

      // 2. 處理假留言
      const mockReviews = generateMockReviews(course.value.passRate)
      
      // 3. 真實留言排在最上面，後面接著假留言
      reviews.value = [...dbReviews, ...mockReviews]
      
      await nextTick()
      renderCharts()
    } else { alert('找不到該課程'); router.push('/'); }
  } catch (error) { console.error('載入失敗:', error) }
})

const toggleChart = (type) => { chartType.value = type; renderCharts(); }

const renderCharts = () => {
  if (!course.value) return
  if (detailChartInstance) detailChartInstance.destroy()
  const ctx = document.getElementById('detailChart').getContext('2d')
  detailChartInstance = new Chart(ctx, {
    type: chartType.value,
    data: {
      labels: ['111-1','111-2','112-1','112-2','113-1'],
      datasets: [{
        label: '過課率 %', data: course.value.history,
        backgroundColor: chartType.value === 'bar' ? course.value.history.map(v => v >= 75 ? 'rgba(90,158,111,0.55)' : v >= 60 ? 'rgba(196,154,60,0.55)' : 'rgba(184,92,82,0.55)') : 'rgba(212,212,212,0.08)',
        borderColor: chartType.value === 'bar' ? course.value.history.map(v => v >= 75 ? '#5A9E6F' : v >= 60 ? '#C49A3C' : '#B85C52') : '#D4D4D4',
        borderWidth: chartType.value === 'bar' ? 1 : 2, borderRadius: chartType.value === 'bar' ? 4 : 0, tension: 0.3, fill: chartType.value === 'line'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#505050', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: '#2E2E2E' } },
        y: { ticks: { color: '#505050', font: { family: 'JetBrains Mono', size: 10 }, callback: v => v+'%' }, grid: { color: '#2E2E2E' }, min: 30, max: 100 }
      }
    }
  })
}

// 將原本的 alert 替換成打開抽屜變數
const openInfoPanel = () => { 
  isSyllabusModalOpen.value = true 
}
</script>

<style scoped>
/* ─── 基本看盤頁 CSS (原有) ─── */
.loading-state { display: flex; justify-content: center; align-items: center; height: 100vh; font-family: var(--font-mono); color: var(--text-muted); font-size: 14px; letter-spacing: 0.1em; }
.page-detail { height: calc(100vh - 80px); }
.main-panel { overflow-y: auto; background: var(--bg-base); }
.content-area { padding: 20px 24px; max-width: 1400px; margin: 0 auto; }
.two-col-layout { display: grid; grid-template-columns: 1fr 280px; gap: 16px; }

.course-hero { background: var(--bg-card); border-bottom: 1px solid var(--border); padding: 20px 24px; }
.hero-inner { max-width: 1352px; margin: 0 auto; }
.course-hero-top { display: flex; align-items: flex-start; justify-content: space-between; }
.course-ticker { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); letter-spacing: 0.1em; margin-bottom: 4px; }
.course-hero-name { font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.course-hero-prof { font-size: 13px; color: var(--text-secondary); display: flex; gap: 12px; }
.price-display { text-align: right; }
.price-big { font-family: var(--font-mono); font-size: 32px; font-weight: 700; line-height: 1; }
.price-change-row { font-family: var(--font-mono); font-size: 12px; margin-top: 4px; display: flex; gap: 8px; justify-content: flex-end; }

.ohlcv-row { display: flex; gap: 24px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-soft); align-items: center; }
.ohlcv-label { font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.08em; margin-bottom: 2px; }
.ohlcv-val { font-family: var(--font-mono); font-size: 13px; font-weight: 600; color: var(--text-primary); }

.info-row { display: flex; justify-content: space-between; align-items: center; }
.info-key { font-size: 11px; color: var(--text-muted); }
.info-val { font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); }

.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 20px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.card-title { font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
.chart-wrap { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 16px; }
.chart-controls { display: flex; gap: 4px; margin-bottom: 12px; }
.chart-btn { padding: 3px 10px; border-radius: 4px; background: transparent; border: 1px solid var(--border); color: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.12s; }
.chart-btn:hover, .chart-btn.active { background: var(--bg-hover); border-color: var(--border); color: var(--text-primary); }

.btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: var(--text-primary); color: var(--bg-deep); border: none; border-radius: var(--radius); font-family: var(--font-mono); font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
.btn-primary:hover { opacity: 0.85; }
.btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: transparent; color: var(--text-secondary); border: 1px solid var(--border); border-radius: var(--radius); font-family: var(--font-mono); font-size: 12px; cursor: pointer; transition: all 0.15s; }
.btn-ghost:hover { background: var(--bg-hover); color: var(--text-primary); }

.btn-outline-primary { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: var(--bg-input); color: var(--text-primary); border: 1px dashed var(--border); border-radius: var(--radius); font-family: var(--font-ui); font-size: 13px; cursor: pointer; transition: all 0.15s; }
.btn-outline-primary:hover { border-color: var(--text-secondary); background: var(--bg-hover); }

/* 新增的評價按鈕樣式 */
.btn-outline-accent { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: rgba(90, 158, 111, 0.05); color: var(--green); border: 1px solid rgba(90, 158, 111, 0.3); border-radius: var(--radius); font-family: var(--font-ui); font-size: 13px; cursor: pointer; transition: all 0.15s; font-weight: 500;}
.btn-outline-accent:hover { background: rgba(90, 158, 111, 0.15); border-color: var(--green); }

.advice-card { padding: 16px; border-radius: var(--radius); border-left: 4px solid transparent; }
.advice-high { background: var(--red-dim); border-left-color: var(--red); }
.advice-mid { background: var(--amber-dim); border-left-color: var(--amber); }
.advice-safe { background: var(--green-dim); border-left-color: var(--green); }
.up { color: var(--green) !important; }
.dn { color: var(--red) !important; }
.neutral { color: var(--text-secondary) !important; }

/* 🌟🌟🌟 全螢幕評價系統 (Slide-Up Full Screen Overlay) 🌟🌟🌟 */
.review-overlay {
  position: fixed; inset: 0; top: 80px; /* 避開 Topbar */
  background: var(--bg-base); z-index: 400;
  transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  overflow-y: auto;
}
.review-overlay.open { transform: translateY(0); }

.review-page-inner {
  max-width: 800px; margin: 0 auto; padding: 0 20px 80px;
}

.review-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 0; border-bottom: 1px solid var(--border);
  position: sticky; top: 0; background: rgba(22, 22, 22, 0.9); backdrop-filter: blur(8px); z-index: 10;
}
.review-back-btn {
  background: transparent; border: none; color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; gap: 6px; font-size: 13px; transition: color 0.15s;
}
.review-back-btn:hover { color: var(--text-primary); }
.review-header-title { text-align: center; }

.review-content { margin-top: 24px; }

/* 統計區塊 */
.summary-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 24px; display: flex; gap: 32px; align-items: center;
}
.score-main { text-align: center; padding-right: 32px; border-right: 1px solid var(--border-soft); }
.score-number { font-family: var(--font-mono); font-size: 48px; font-weight: 700; color: var(--text-primary); line-height: 1; }
.score-stars { color: var(--accent-teal); font-size: 18px; margin: 8px 0; letter-spacing: 2px; }
.star-filled { color: var(--accent-teal); }
.star-empty { color: var(--border); }
.score-total { font-size: 11px; color: var(--text-muted); }

.score-bars { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.bar-row { display: flex; align-items: center; gap: 12px; }
.bar-label { font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); width: 30px; }
.bar-track { flex: 1; height: 6px; background: var(--bg-hover); border-radius: 100px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--accent-teal); border-radius: 100px; }

/* 雲端標籤 */
.review-filters { margin: 24px 0; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
.cloud-tag {
  padding: 6px 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 100px;
  color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all 0.15s;
}
.cloud-tag:hover { border-color: var(--text-secondary); color: var(--text-primary); }
.cloud-tag.active { background: rgba(90, 158, 111, 0.15); border-color: var(--green); color: var(--green); font-weight: 500; }

/* 留言列表 */
.review-list { display: flex; flex-direction: column; gap: 16px; }
.review-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px;
}
.rc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.rc-user { display: flex; align-items: center; gap: 12px; }
.rc-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: var(--bg-hover); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: var(--text-secondary);
}
.rc-name { font-size: 14px; font-weight: 500; color: var(--text-primary); }
.rc-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.rc-stars { font-size: 14px; letter-spacing: 1px; }

.rc-content { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px; }
.rc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.rc-tag { font-size: 11px; color: var(--text-muted); background: var(--bg-input); padding: 3px 8px; border-radius: 4px; }

.rc-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-soft); }
.rc-date { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
.rc-like-btn {
  display: flex; align-items: center; gap: 6px; background: transparent; border: 1px solid var(--border);
  color: var(--text-secondary); padding: 6px 12px; border-radius: 100px; font-size: 11px; cursor: pointer; transition: all 0.15s;
}
.rc-like-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.rc-like-btn.liked { background: rgba(90, 158, 111, 0.1); border-color: var(--green); color: var(--green); }

/* 撰寫評價按鈕 */
.fab-write {
  position: fixed; bottom: 32px; right: 32px; background: var(--text-primary); color: var(--bg-deep);
  border: none; border-radius: 100px; padding: 14px 24px; font-size: 14px; font-weight: 600;
  display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  transition: transform 0.2s; z-index: 100;
}
.fab-write:hover { transform: translateY(-3px); }

/* 撰寫評價 Modal */
.write-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 500; backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.2s;
}
.write-modal-overlay.open { opacity: 1; pointer-events: auto; }
.write-modal {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 500px;
  transform: translateY(20px); transition: transform 0.3s;
}
.write-modal-overlay.open .write-modal { transform: translateY(0); }
.write-modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.write-modal-header h3 { font-size: 16px; color: var(--text-primary); font-weight: 600; }
.write-close { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
.write-modal-body { padding: 24px; }
.write-stars { font-size: 28px; cursor: pointer; display: flex; gap: 4px; }
.write-select { width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary); font-size: 13px; outline: none; }
.write-textarea { width: 100%; padding: 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary); font-size: 13px; outline: none; min-height: 120px; resize: vertical; line-height: 1.6; }
.write-submit-btn { width: 100%; background: var(--text-primary); color: var(--bg-deep); border: none; padding: 12px; border-radius: var(--radius); font-weight: 600; font-size: 14px; cursor: pointer; transition: opacity 0.2s; }
.write-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 🌟 右側抽屜 Drawer 樣式 */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 900; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
.drawer-overlay.open { opacity: 1; pointer-events: auto; }
.drawer-panel { position: absolute; top: 0; right: 0; bottom: 0; width: 450px; background: var(--bg-card); box-shadow: -5px 0 30px rgba(0,0,0,0.4); transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease; display: flex; flex-direction: column; border-left: 1px solid var(--border); }
.drawer-overlay.open .drawer-panel { transform: translateX(0); }
.drawer-panel.is-fullscreen { width: 100vw; } /* 全螢幕模式 */
.drawer-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg-input); }
.drawer-body { padding: 24px; overflow-y: auto; flex: 1; line-height: 1.8; color: var(--text-secondary); }

/* 🌟 右下角浮動寫評論按鈕 (FAB) */
.fab-review {
  position: fixed; bottom: 40px; right: 40px; z-index: 800;
  background: var(--text-primary); color: var(--bg-deep); font-weight: 700;
  border: none; border-radius: 100px; padding: 14px 28px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5); cursor: pointer;
  display: flex; align-items: center; gap: 10px; font-size: 15px; font-family: var(--font-ui);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.fab-review:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 15px 35px rgba(45, 212, 191, 0.3); background: var(--accent-teal); color: #000; }
</style>