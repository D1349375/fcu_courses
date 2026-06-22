<template>
  <div class="layout-two-col">
    <div class="sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">課程標的</span>
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">{{ filteredCourses.length }} 檔</span>
      </div>
      
      <div class="search-box">
        <span class="search-icon">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="5.5" cy="5.5" r="4"/><line x1="8.8" y1="8.8" x2="12" y2="12"/></svg>
        </span>
        <input type="text" placeholder="搜尋代碼、名稱、教授..." v-model="searchQuery">
      </div>

      <div class="filter-bar">
        <button class="filter-toggle-btn" :class="{ active: isFilterOpen }" @click="isFilterOpen = !isFilterOpen">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="3" x2="10" y2="3"/><line x1="4" y1="6" x2="8" y2="6"/><line x1="5" y1="9" x2="7" y2="9"/></svg>
          進階篩選設定
          <span v-if="filterMainDept !== 'all' || filterReq !== 'all'" class="filter-dot"></span>
        </button>
      </div>

      <div v-if="isFilterOpen" class="filter-panel">
        
        <div class="filter-group">
          <label>1. 開課單位 (主系所)</label>
          <select v-model="filterMainDept" class="filter-select" @change="filterSubClass = 'all'">
            <option value="all">全部單位</option>
            <option v-for="dept in mainDeptList" :key="dept" :value="dept">{{ dept }}</option>
          </select>
        </div>

        <div class="filter-group" :class="{ 'disabled-group': filterMainDept === 'all' }">
          <label>2. 開課班級</label>
          <select v-model="filterSubClass" class="filter-select" :disabled="filterMainDept === 'all'">
            <option value="all" v-if="filterMainDept === 'all'">請先選擇上方開課單位</option>
            <option value="all" v-else>全部班級</option>
            <option v-for="cls in subClassList" :key="cls" :value="cls">{{ cls }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label>3. 課程屬性</label>
          <div class="filter-radio-group">
            <button :class="{ active: filterReq === 'all' }" @click="filterReq = 'all'">全部</button>
            <button :class="{ active: filterReq === '必修' }" @click="filterReq = '必修'">必修</button>
            <button :class="{ active: filterReq === '選修' }" @click="filterReq = '選修'">選修</button>
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn-ghost" @click="resetFilter" style="padding: 4px 10px;">重設</button>
          <button class="btn-primary" @click="isFilterOpen = false" style="padding: 4px 10px;">套用</button>
        </div>
      </div>
      
      <div class="course-list">
        <div 
          v-for="c in filteredCourses" 
          :key="c.id" 
          class="course-row" 
          :class="{ selected: selectedCourseId === c.id }"
          @click="selectCourse(c.id)"
        >
          <div>
            <div class="course-code">{{ c.courseCode }}</div>
            <div class="course-name">{{ c.name }}</div>
            <div class="course-prof">{{ c.prof }} · {{ c.reqType }}</div>
          </div>
          <div class="course-price-col">
            <div class="course-pass" :class="getPassClass(c.passRate)">{{ c.passRate }}%</div>
            <div class="course-change" :class="c.change >= 0 ? 'up' : 'dn'">
              {{ c.change >= 0 ? '▲' : '▼' }}{{ Math.abs(c.change).toFixed(1) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-panel">
      <div class="content-area">
        <div class="onboarding-banner" v-if="showOnboardBanner">
          <div class="onboarding-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="14" height="16" rx="2"/><line x1="7" y1="7" x2="13" y2="7"/><line x1="7" y1="10" x2="13" y2="10"/><line x1="7" y1="13" x2="10" y2="13"/></svg>
          </div>
          <div class="onboarding-text">
            <h3>新手必讀：如何使用選課交易所？</h3>
            <p>每堂課就是一檔「股票」。<strong>過課率</strong>是股價，<strong>平均成績</strong>是殖利率。點選課程查看 K 線圖，或前往<strong>回測引擎</strong>輸入你的預計課表，計算被二一的機率。</p>
          </div>
          <button class="onboarding-close" @click="showOnboardBanner = false">✕</button>
        </div>

        <div class="stat-row">
          <div class="stat-chip">
            <div class="stat-chip-label">本學期開設課程</div>
            <div class="stat-chip-value" style="color:var(--accent-teal)">{{ COURSES.length }}</div>
            <div class="stat-chip-sub">即時抓取</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">平均過課率</div>
            <div class="stat-chip-value" style="color:var(--green)">78.4%</div>
            <div class="stat-chip-sub">大盤穩健</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">高風險課程</div>
            <div class="stat-chip-value" style="color:var(--red)">7</div>
            <div class="stat-chip-sub">過課率 &lt;60%</div>
          </div>
          <div class="stat-chip">
            <div class="stat-chip-label">市場均分</div>
            <div class="stat-chip-value" style="color:var(--amber)">74.2</div>
            <div class="stat-chip-sub">GPA 2.8</div>
          </div>
        </div>

        <div class="chart-wrap mb-4">
          <div class="card-header">
            <span class="card-title">大盤走勢 — 全校過課率指數</span>
          </div>
          <div style="position: relative; height: 180px; width: 100%;">
            <canvas id="marketChart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">熱門課程排行</span>
            <span style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);">按過課率排序 ↓</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>課程代碼</th>
                <th>課程名稱</th>
                <th>開課班級</th>
                <th>屬性</th>
                <th>過課率</th>
                <th>平均分</th>
                <th>最高 / 最低</th>
                <th>風險等級</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="c in sortedCourses.slice(0, 50)" 
                :key="c.id" 
                @click="goToDetail(c.id)" 
                style="cursor:pointer"
              >
                <td>{{ c.courseCode }}</td>
                <td style="color:var(--text-primary);font-weight:500;">{{ c.name }}</td>
                <td>{{ c.dept }}</td>
                <td>{{ c.reqType }}</td>
                <td :class="getPassClass(c.passRate)">{{ c.passRate }}%</td>
                <td>{{ c.avgScore }}</td>
                <td>{{ c.hi }} / <span class="dn">{{ c.lo }}</span></td>
                <td v-html="getRiskTag(c.passRate)"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'

const router = useRouter()

// ─── 狀態管理 ───
const searchQuery = ref('')
const selectedCourseId = ref(null)
const showOnboardBanner = ref(true)
const COURSES = ref([])

// 🌟 連動篩選器狀態 🌟
const isFilterOpen = ref(false)
const filterMainDept = ref('all') // 第一層：主單位 (例如：資訊、電機、通識)
const filterSubClass = ref('all') // 第二層：具體班級 (例如：資訊三甲)
const filterReq = ref('all')

// 🌟 自動解析器：負責將長長的班級名稱，切分歸類出「主單位」
const parseDeptGroup = (clsName) => {
  if (!clsName || clsName === '未知') return '其他'
  if (clsName.includes('通識')) return '通識中心'
  if (clsName.includes('外語')) return '外語中心'
  if (clsName.includes('體育')) return '體育中心'
  if (clsName.includes('軍訓') || clsName.includes('國防')) return '軍訓室'
  
  // 擷取中文字直到遇到年級數字 (例如: 把 "資訊三甲" 切出 "資訊")
  const match = clsName.match(/^([^一二三四五六七八九十碩博]+)/)
  if (match) {
    let group = match[1].trim()
    return group.length >= 2 ? group : clsName
  }
  return clsName
}

// 第一層清單：所有萃取出的「主單位」
const mainDeptList = computed(() => {
  const depts = new Set(COURSES.value.map(c => c.deptGroup))
  return Array.from(depts).filter(d => d !== '未知').sort()
})

// 第二層清單：根據第一層的選擇，動態載入該單位底下的「所有班級」
const subClassList = computed(() => {
  if (filterMainDept.value === 'all') return []
  // 先濾出該主單位的所有課程，再抓出他們的具體班級名稱
  const filteredDepts = COURSES.value.filter(c => c.deptGroup === filterMainDept.value)
  const classes = new Set(filteredDepts.map(c => c.dept))
  return Array.from(classes).sort()
})

// 🌟 最終過濾邏輯：套用所有條件
const filteredCourses = computed(() => {
  const q = String(searchQuery.value || '').toLowerCase()
  
  return COURSES.value.filter(c => {
    if (!c) return false 

    // 1. 判斷主單位是否符合
    const matchMain = filterMainDept.value === 'all' || c.deptGroup === filterMainDept.value
    // 2. 判斷班級是否符合 (只在有選擇具體班級時才判斷)
    const matchSub = filterSubClass.value === 'all' || c.dept === filterSubClass.value
    // 3. 判斷必選修
    const matchReq = filterReq.value === 'all' || c.reqType === filterReq.value

    // 4. 判斷搜尋字串
    const safeName = String(c.name || '').toLowerCase()
    const safeProf = String(c.prof || '').toLowerCase()
    const safeCode = String(c.courseCode || '').toLowerCase()
    const matchSearch = safeName.includes(q) || safeProf.includes(q) || safeCode.includes(q)
    
    return matchMain && matchSub && matchReq && matchSearch
  })
})

const sortedCourses = computed(() => {
  return [...COURSES.value].sort((a, b) => b.passRate - a.passRate)
})

const resetFilter = () => {
  filterMainDept.value = 'all'
  filterSubClass.value = 'all'
  filterReq.value = 'all'
}

// ─── UI 輔助函數 ───
const getPassClass = (rate) => rate >= 80 ? 'high up' : rate >= 65 ? 'mid neutral' : 'low dn'
const getRiskTag = (rate) => {
  if (rate >= 80) return '<span class="tag tag-safe">低</span>'
  if (rate >= 65) return '<span class="tag tag-mid">中</span>'
  return '<span class="tag tag-risk">高</span>'
}

// ─── 互動與 API 抓取 ───
const selectCourse = (id) => {
  selectedCourseId.value = id
  goToDetail(id)
}
const goToDetail = (id) => {
  router.push(`/course/${id}`)
}

const fetchCourses = async () => {
  try {
    const res = await fetch('/api/course-info')
    const data = await res.json()
    
    COURSES.value = data.map(c => {
      const fakePassRate = Math.floor(Math.random() * 46) + 50 
      
      // 🌟 我們現在可以直接安心使用後端結合好的 JSON 真實欄位了！
      const rawDept = c.cls_name || '其他'
      const rawReq = c.scj_scr_mso || '未知'
      const realCode = c.scr_selcode || (c.course_id ? String(c.course_id).slice(-4) : c.sub_id3)

      return {
        id: c.course_id,
        courseCode: realCode,
        name: c.sub_name,
        prof: c.scr_teacher || '未知',
        credits: c.scr_credit || 3,
        dept: rawDept,                           // 完整的班級名稱
        deptGroup: parseDeptGroup(rawDept),      // 自動解析出主單位 (如：資訊)
        reqType: rawReq,                         // 必修或選修
        passRate: fakePassRate,
        avgScore: fakePassRate - 5 + Math.floor(Math.random() * 10),
        hi: 90 + Math.floor(Math.random() * 10),
        lo: 30 + Math.floor(Math.random() * 20),
        change: parseFloat((Math.random() * 10 - 5).toFixed(1))
      }
    })
  } catch (error) {
    console.error('無法取得課程資料:', error)
  }
}
onMounted(() => {
  fetchCourses()
  const ctx = document.getElementById('marketChart');
  if (ctx) {
    new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['110-1','110-2','111-1','111-2','112-1','112-2','113-1','113-2'],
        datasets: [{
          label: '全校過課率指數', data: [74.2, 75.1, 73.8, 76.3, 77.0, 76.5, 78.1, 78.4],
          borderColor: '#8A8A8A', borderWidth: 2, pointBackgroundColor: '#8A8A8A', pointRadius: 3, tension: 0.4, fill: true, backgroundColor: 'rgba(255,255,255,0.03)',
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { x: { ticks: { color: '#505050', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: '#2E2E2E' } }, y: { ticks: { color: '#505050', font: { family: 'JetBrains Mono', size: 10 }, callback: v => v+'%' }, grid: { color: '#2E2E2E' }, min: 68, max: 85 } }
      }
    });
  }
})
</script>

<style scoped>
/* ─── 佈局 (Layout) ─── */
.layout-two-col {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 0;
  height: calc(100vh - 80px); /* 減去 Topbar 和 Ticker 高度 */
}
.sidebar {
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.main-panel {
  overflow-y: auto;
  background: var(--bg-base);
}
.content-area {
  padding: 20px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ─── SIDEBAR ─── */
.sidebar-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.sidebar-title {
  font-size: 10px;
  font-family: var(--font-mono);
  letter-spacing: 0.12em;
  color: var(--text-muted);
  text-transform: uppercase;
}
.search-box {
  margin: 10px 12px;
  position: relative;
  flex-shrink: 0;
}
.search-box input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 7px 12px 7px 32px;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s;
}
.search-box input:focus { border-color: var(--text-secondary); }
.search-box input::placeholder { color: var(--text-muted); }
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 12px;
}

.filter-tabs {
  display: flex;
  gap: 0;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-soft);
  flex-shrink: 0;
}
.filter-tab {
  padding: 4px 12px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  color: var(--text-muted);
  background: transparent;
  border: none;
  transition: all 0.12s;
}
.filter-tab:hover { color: var(--text-secondary); }
.filter-tab.active {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.course-list { overflow-y: auto; flex: 1; }
.course-row {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-soft);
  cursor: pointer;
  transition: background 0.12s;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px;
  align-items: start;
}
.course-row:hover { background: var(--bg-hover); }
.course-row.selected { background: var(--bg-hover); border-left: 2px solid var(--text-secondary); }
.course-code { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); letter-spacing: 0.06em; }
.course-name { font-size: 13px; font-weight: 500; color: var(--text-primary); margin-top: 1px; }
.course-prof { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
.course-price-col { text-align: right; }
.course-pass { font-family: var(--font-mono); font-size: 14px; font-weight: 600; }
.course-pass.high { color: var(--green); }
.course-pass.mid  { color: var(--amber); }
.course-pass.low  { color: var(--red); }
.course-change { font-family: var(--font-mono); font-size: 10px; margin-top: 2px; }

/* ─── MAIN PANEL CARDS ─── */
.onboarding-banner {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 16px 20px; margin-bottom: 16px; display: flex; align-items: center; gap: 16px;
}
.onboarding-icon { font-size: 24px; color: var(--text-muted); }
.onboarding-text h3 { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
.onboarding-text p { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
.onboarding-close { margin-left: auto; background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; flex-shrink: 0; }

.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-chip { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; }
.stat-chip-label { font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
.stat-chip-value { font-family: var(--font-mono); font-size: 22px; font-weight: 700; line-height: 1; }
.stat-chip-sub { font-size: 10px; color: var(--text-muted); margin-top: 4px; font-family: var(--font-mono); }

.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 20px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.card-title { font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }

.chart-wrap { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 16px; }
.chart-controls { display: flex; gap: 4px; margin-bottom: 12px; }
.chart-btn {
  padding: 3px 10px; border-radius: 4px; background: transparent; border: 1px solid var(--border);
  color: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.12s;
}
.chart-btn:hover, .chart-btn.active { background: var(--bg-hover); border-color: var(--border); color: var(--text-primary); }

/* ─── TABLE ─── */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.1em;
  text-transform: uppercase; text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border); font-weight: 500;
}
.data-table td { padding: 10px 12px; border-bottom: 1px solid var(--border-soft); font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }
.data-table tr:hover td { background: var(--bg-hover); }
.data-table td:first-child { color: var(--text-primary); }

/* ─── UTILS ─── */
.up { color: var(--green) !important; }
.dn { color: var(--red) !important; }
.neutral { color: var(--text-secondary) !important; }
.mb-4 { margin-bottom: 16px; }

:deep(.tag) { font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 100px; font-weight: 500; }
:deep(.tag-safe) { background: var(--green-dim); color: var(--green); }
:deep(.tag-risk) { background: var(--red-dim); color: var(--red); }
:deep(.tag-mid) { background: var(--amber-dim); color: var(--amber); }

/* 🌟 進階篩選器專用 CSS 🌟 */
.filter-bar {
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-soft);
  flex-shrink: 0;
}
.filter-toggle-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 8px; background: transparent; border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.15s;
  position: relative;
}
.filter-toggle-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.filter-toggle-btn.active { background: var(--bg-input); border-color: var(--text-secondary); color: var(--text-primary); }
.filter-dot {
  position: absolute; top: -3px; right: -3px; width: 8px; height: 8px;
  background: var(--accent-teal); border-radius: 50%; border: 2px solid var(--bg-card);
}

.filter-panel {
  background: var(--bg-input); border-bottom: 1px solid var(--border-soft);
  padding: 16px; display: flex; flex-direction: column; gap: 14px; flex-shrink: 0;
}
.filter-group label {
  display: block; font-size: 10px; font-family: var(--font-mono); color: var(--text-muted);
  margin-bottom: 6px; letter-spacing: 0.05em;
}
.filter-select {
  width: 100%; padding: 8px; background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-primary); font-size: 12px; outline: none;
}
/* 當第一層還沒選時，將第二層變暗 */
.disabled-group { opacity: 0.4; pointer-events: none; }

.filter-radio-group { display: flex; gap: 4px; }
.filter-radio-group button {
  flex: 1; padding: 6px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px;
  color: var(--text-secondary); font-size: 11px; cursor: pointer; transition: all 0.1s;
}
.filter-radio-group button.active { background: var(--text-secondary); color: var(--bg-deep); border-color: var(--text-secondary); font-weight: 600; }
.filter-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
</style>