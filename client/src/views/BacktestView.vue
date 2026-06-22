<template>
  <div class="backtest-layout">
    
    <div class="builder-panel">
      <div class="sidebar-header" style="flex-direction: column; align-items: stretch; gap: 12px; padding: 16px;">
        <span class="sidebar-title">我的課表組合</span>
        <select class="filter-select" v-model="activePortfolioId">
          <option v-for="p in portfolios" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
      
      <div class="builder-body">
        <p style="font-size:11px;color:var(--text-muted);margin-bottom:14px;line-height:1.6;">
          將課程加入下方「投資組合」，右側將自動為你排入課表，並計算風險與衝堂狀態。
        </p>

        <div class="portfolio-slots">
          <div v-if="activeCourses.length === 0" style="text-align:center; padding: 30px 0; color:var(--text-muted); font-size:12px; font-family:var(--font-mono);">
            尚無課程，點擊下方新增
          </div>
          
          <div 
            v-for="c in activeCourses" 
            :key="c.id" 
            class="course-picker"
            :class="{ 'picker-conflict': conflictingCourseIds.has(c.id) }" 
          >
            <div class="course-picker-left">
              <div class="picker-code">{{ c.courseCode }}</div>
              <div class="picker-name">{{ c.name }}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="picker-credits">{{ c.credits }}學分</span>
              <button class="picker-remove" @click="removeFromPortfolio(c.id)">✕</button>
            </div>
          </div>
        </div>

        <button class="add-course-btn" @click="isModalOpen = true">
          <span>＋</span> 搜尋與新增課程
        </button>
      </div>
    </div>

    <div class="stats-panel">
      
      <div class="schedule-stats-bar">
        <div class="stat-chip">
          <div class="stat-label">總計學分</div>
          <div class="stat-val mono" style="color:var(--text-primary)">{{ totalCredits }}</div>
        </div>
        <div class="stat-chip">
          <div class="stat-label">大盤過課率</div>
          <div class="stat-val mono" :class="avgPassRate >= 70 ? 'up' : 'dn'">{{ avgPassRate }}%</div>
        </div>
        <div class="stat-chip">
          <div class="stat-label">衝堂警告</div>
          <div class="stat-val mono" style="color:var(--red)" v-if="conflictCount > 0">{{ conflictCount }} 節衝突</div>
          <div class="stat-val mono" style="color:var(--text-muted)" v-else>安全無衝堂</div>
        </div>
        
        <button v-if="!isBacktestMode" class="btn-primary" style="margin-left:auto; padding: 8px 16px;" @click="runDeepBacktest">
          ⚡ 執行深度回測
        </button>
        <button v-else class="btn-ghost" style="margin-left:auto; padding: 8px 16px;" @click="isBacktestMode = false">
          ◀ 返回課表檢視
        </button>
      </div>

      <div v-if="!isBacktestMode" class="schedule-wrapper">
        <div class="schedule-grid">
          <div class="grid-header-cell corner-cell">節次</div>
          <div v-for="day in ['星期一','星期二','星期三','星期四','星期五','星期六','星期日']" :key="day" class="grid-header-cell">
            {{ day }}
          </div>

          <template v-for="row in 14" :key="'row-'+row">
            <div class="grid-time-cell" :style="{ gridColumn: 1, gridRow: row + 1 }">{{ row }}</div>
            
            <div 
              v-for="col in 7" 
              :key="'cell-'+row+'-'+col" 
              class="grid-bg-cell"
              :style="{ gridColumn: col + 1, gridRow: row + 1 }"
            ></div>
          </template>
          
          <div 
            v-for="(b, i) in scheduleBlocks" 
            :key="i" 
            class="course-block"
            :class="{ 'conflict-block': b.isConflict }"
            :style="{ gridColumn: (b.day + 1) + ' / span 1', gridRow: (b.start + 1) + ' / span ' + (b.end - b.start + 1) }"
          >
            <div class="cb-name">{{ b.course.name }}</div>
            <div class="cb-prof">{{ b.course.prof }}</div>
            <div class="cb-loc">{{ b.loc }}</div>
            
            <div v-if="b.isConflict" class="conflict-tooltip">
              <div v-for="name in b.conflictNames" :key="name" class="conflict-name-line">
                {{ name }}
              </div>
              <div class="conflict-status-line">衝堂</div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="result-panel">
        <div v-if="backtestStats" style="width: 100%; max-width: 900px; margin: 0 auto; padding-top: 24px;">
          
          <div class="result-hero">
            <div class="result-grade">回測結果 · {{ backtestStats.date }}</div>
            <div style="font-size:22px;font-weight:700;margin-bottom:6px;">
              課表分析完成 — {{ backtestStats.names }}
            </div>
            <div style="font-size:12px;color:var(--text-secondary);">共 {{ backtestStats.totalCredits }} 學分 · {{ backtestStats.courseCount }} 門課程</div>
            
            <div class="risk-meter">
              <div class="risk-fill" :style="{ width: animatedRiskW + '%' }"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">
              <span>安全</span><span>警戒</span><span>危險</span>
            </div>
          </div>

          <div class="result-metrics">
            <div class="metric-card">
              <div class="metric-label">破產機率 RUIN RISK</div>
              <div class="metric-value" :style="{ color: backtestStats.riskColor }">{{ backtestStats.ruinRisk }}%</div>
              <div class="metric-desc">被二一的統計機率</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">預期學期均分</div>
              <div class="metric-value" style="color:var(--text-primary)">{{ backtestStats.expectedAvgScore.toFixed(1) }}</div>
              <div class="metric-desc">GPA 約 {{ backtestStats.gpa }}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">最大下跌 MAX DD</div>
              <div class="metric-value" style="color:var(--amber)">{{ backtestStats.maxDD }}%</div>
              <div class="metric-desc">最差情境過課率</div>
            </div>
          </div>

          <div style="padding:0 24px 40px;">
            <div class="chart-wrap" style="margin-bottom:16px;">
              <div style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted); letter-spacing:0.1em; margin-bottom:12px;">壓力測試 — 各課程最差情境</div>
              <div style="padding:2px 0;">
                <div class="stress-row" style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);">
                  <span>課程</span><span style="text-align:center;">正常</span><span style="text-align:center;">最差</span>
                </div>
                <div v-for="c in activeCourses" :key="c.id" class="stress-row">
                  <div class="stress-name">{{ c.name }} <span style="color:var(--text-muted);font-size:11px;">{{ c.courseCode }}</span></div>
                  <div class="stress-normal" :class="c.passRate >= 75 ? 'up' : 'neutral'">{{ c.passRate }}%</div>
                  <div class="stress-worst">{{ Math.max(30, c.passRate - 18) }}%</div>
                </div>
              </div>
            </div>

            <div class="card">
              <div style="font-size:11px; font-family:var(--font-mono); color:var(--text-muted); letter-spacing:0.1em; margin-bottom:12px;">AI 選課建議</div>
              <div style="padding:4px 0;display:flex;flex-direction:column;gap:10px;">
                <div v-if="backtestStats.ruinRisk > 40" style="padding:12px;background:var(--red-dim);border-radius:var(--radius);border-left:3px solid var(--red);">
                  <div style="font-weight:600;color:var(--red);margin-bottom:4px;">— 高風險警告</div>
                  <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">
                    目前組合的被二一機率偏高（{{ backtestStats.ruinRisk }}%）。建議移除過課率最低的課程，或換成同類別友善課程。
                  </div>
                </div>
                <div v-else style="padding:12px;background:var(--green-dim);border-radius:var(--radius);border-left:3px solid var(--green);">
                  <div style="font-weight:600;color:var(--green);margin-bottom:4px;">◎ 組合健康</div>
                  <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">
                    這個課表的被二一風險在可接受範圍內。預期學期均分 {{ backtestStats.expectedAvgScore.toFixed(0) }} 分（GPA {{ backtestStats.gpa }}）。建議定期出席所有課程。
                  </div>
                </div>
                <div style="padding:12px;background:var(--bg-hover);border-radius:var(--radius);border-left:3px solid var(--border);">
                  <div style="font-weight:600;color:var(--text-secondary);margin-bottom:4px;">→ 最佳化建議</div>
                  <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">
                    若將高風險課程替換為過課率高的通識課，GPA 可提升約 0.3。總學分 {{ backtestStats.totalCredits > 18 ? '略偏多，建議降至 18 學分以下' : '在合理範圍內' }}。
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>

    <div class="modal-overlay" :class="{ open: isModalOpen }" @click.self="isModalOpen = false">
      <div class="modal" style="width: 700px; max-height: 85vh;">
        <div class="modal-header">
          <div class="modal-title">新增課程至課表</div>
          <button class="modal-close" @click="isModalOpen = false">✕</button>
        </div>
        
        <div class="modal-filter-bar">
          <div class="search-box mb-3">
            <input type="text" placeholder="搜尋代碼、課程名稱、教授..." v-model="searchQuery" />
          </div>
          
          <div class="filter-row">
            <select v-model="filterMainDept" class="filter-select" @change="filterSubClass = 'all'">
              <option value="all">全部主單位</option>
              <option v-for="d in mainDeptList" :key="d" :value="d">{{ d }}</option>
            </select>
            
            <select v-model="filterSubClass" class="filter-select" :disabled="filterMainDept === 'all'">
              <option value="all">全部班級</option>
              <option v-for="c in subClassList" :key="c" :value="c">{{ c }}</option>
            </select>
            
            <select v-model="filterReq" class="filter-select" style="width: 120px;">
              <option value="all">必/選修</option>
              <option value="必修">必修</option>
              <option value="選修">選修</option>
            </select>
          </div>
        </div>

        <div class="modal-body">
          <div v-if="isLoading" style="text-align:center; padding: 40px; color:var(--text-muted); font-size:12px;">載入中...</div>
          <div v-else-if="filteredCourses.length === 0" style="text-align:center; padding: 40px; color:var(--text-muted); font-size:12px;">查無相符課程</div>
          
          <div 
            v-else 
            v-for="c in filteredCourses" 
            :key="c.id" 
            class="modal-course-row" 
            @click="addToPortfolio(c)"
          >
            <div>
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);margin-bottom:2px;">{{ c.courseCode }} · {{ c.dept }}</div>
              <div style="font-size:13px;font-weight:500;color:var(--text-primary);">{{ c.name }}</div>
              <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">
                {{ c.prof }} · {{ c.credits }} 學分 · {{ c.raw.scr_periodly }}
              </div>
            </div>
            <button class="modal-add-btn" :disabled="isCourseInActivePortfolio(c.id)">
              {{ isCourseInActivePortfolio(c.id) ? '已加入' : '加入' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// ─── 狀態：改由從 API 獲取 ───
const portfolios = ref([])
const activePortfolioId = ref(null)

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('fce_user') || '{}')
  return user.id
}

// 當前啟用的課程陣列 (透過 ID 找回真實課程物件)
const activeCourses = computed(() => {
  const p = portfolios.value.find(p => String(p.id) === String(activePortfolioId.value))
  if (!p || !p.course_ids) return []
  return p.course_ids.map(id => availableCourses.value.find(c => c.id === id)).filter(Boolean)
})

// ─── Modal 篩選器狀態 ───
const isModalOpen = ref(false)
const isLoading = ref(true)
const availableCourses = ref([])
const searchQuery = ref('')
const filterMainDept = ref('all')
const filterSubClass = ref('all')
const filterReq = ref('all')

// ─── 自動解析器 (給篩選器用) ───
const parseDeptGroup = (clsName) => {
  if (!clsName || clsName === '未知') return '其他'
  if (clsName.includes('通識')) return '通識中心'
  if (clsName.includes('外語')) return '外語中心'
  if (clsName.includes('體育')) return '體育中心'
  if (clsName.includes('軍訓') || clsName.includes('國防')) return '軍訓室'
  const match = clsName.match(/^([^一二三四五六七八九十碩博]+)/)
  if (match) {
    let group = match[1].trim()
    return group.length >= 2 ? group : clsName
  }
  return clsName
}

const mainDeptList = computed(() => {
  const depts = new Set(availableCourses.value.map(c => c.deptGroup))
  return Array.from(depts).filter(d => d && d !== '未知').sort()
})

const subClassList = computed(() => {
  if (filterMainDept.value === 'all') return []
  const filteredDepts = availableCourses.value.filter(c => c.deptGroup === filterMainDept.value)
  const classes = new Set(filteredDepts.map(c => c.dept))
  return Array.from(classes).sort()
})

const filteredCourses = computed(() => {
  const q = String(searchQuery.value || '').toLowerCase()
  return availableCourses.value.filter(c => {
    const matchMain = filterMainDept.value === 'all' || c.deptGroup === filterMainDept.value
    const matchSub = filterSubClass.value === 'all' || c.dept === filterSubClass.value
    const matchReq = filterReq.value === 'all' || c.reqType === filterReq.value
    
    const safeName = String(c.name || '').toLowerCase()
    const safeProf = String(c.prof || '').toLowerCase()
    const safeCode = String(c.courseCode || '').toLowerCase()
    const safeSelCode = String(c.raw?.scr_selcode || '').toLowerCase() // 🌟 抓取隱藏的選課代號
    
    // 🌟 將選課代號納入搜尋條件
    const matchSearch = safeName.includes(q) || safeProf.includes(q) || safeCode.includes(q) || safeSelCode.includes(q)
    return matchMain && matchSub && matchReq && matchSearch
  })
})

// ─── 初始化：抓課程與抓群組資料 ───
const fetchData = async () => {
  try {
    const resC = await fetch('http://localhost:3000/api/course-info')
    const dataC = await resC.json()
    
    if (Array.isArray(dataC)) {
      availableCourses.value = dataC.map(c => {
        const rawDept = c.cls_name || '其他'
        const rawReq = c.scj_scr_mso || '未知'
        // 🌟 同樣優先使用 scr_selcode 作為清單與已選課程的代碼
        const realCode = c.scr_selcode || (c.course_id ? String(c.course_id).slice(-4) : c.sub_id3)
        const fakePassRate = Math.floor(Math.random() * 46) + 50 

        return {
          raw: c,
          id: c.course_id,
          courseCode: realCode,
          name: c.sub_name,
          prof: c.scr_teacher || '未知',
          credits: c.scr_credit || 3,
          dept: rawDept,                           
          deptGroup: parseDeptGroup(rawDept),      
          reqType: rawReq,    
          passRate: fakePassRate                     
        }
      })
    }

    const resP = await fetch('http://localhost:3000/api/portfolios', {
      headers: { 'x-user-id': getUserId() }
    })
    portfolios.value = await resP.json()
    
    if (route.query.id) {
      activePortfolioId.value = parseInt(route.query.id)
    } else if (portfolios.value.length > 0) {
      activePortfolioId.value = portfolios.value[0].id
    }
  } catch (e) {
    console.error('載入失敗:', e)
  } finally {
    isLoading.value = false
  }
}

// ─── 自動背景存檔魔法 ───
const savePortfolioToDB = async () => {
  const p = portfolios.value.find(p => p.id === activePortfolioId.value)
  if (!p) return
  
  try {
    await fetch(`http://localhost:3000/api/portfolios/${p.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': getUserId() 
      },
      body: JSON.stringify({ courseIds: p.course_ids })
    })
  } catch (e) {
    console.error('自動存檔失敗', e)
  }
}

// ─── 課表操作 (修改陣列後觸發自動存檔) ───
const isCourseInActivePortfolio = (id) => activeCourses.value.some(c => c.id === id)

const addToPortfolio = (course) => {
  if (!isCourseInActivePortfolio(course.id)) {
    const p = portfolios.value.find(p => p.id === activePortfolioId.value)
    p.course_ids.push(course.id) 
    savePortfolioToDB()          
  }
}

const removeFromPortfolio = (id) => {
  const p = portfolios.value.find(p => p.id === activePortfolioId.value)
  p.course_ids = p.course_ids.filter(cid => cid !== id) 
  savePortfolioToDB()                                   
}

// ─── 時間字串解析器 (捕捉衝堂名單) ───
const scheduleData = computed(() => {
  const blocks = []
  const conflictingIds = new Set()
  const dayMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7 }
  
  const gridMatrix = Array(8).fill(null).map(() => Array(15).fill(null).map(() => []))

  activeCourses.value.forEach(c => {
    if (!c.raw || !c.raw.scr_periodly) return
    const regex = /\(([一二三四五六日])\)(\d{2})(?:-(\d{2}))?(?:\s+([^\s,]+))?/g
    let match
    
    while ((match = regex.exec(c.raw.scr_periodly)) !== null) {
      const day = dayMap[match[1]]
      const start = parseInt(match[2], 10)
      const end = match[3] ? parseInt(match[3], 10) : start

      blocks.push({
        course: c,
        day: day,
        start: start,
        end: end,
        loc: match[4] || '',
        isConflict: false,
        conflictNames: [] 
      })

      for (let i = start; i <= end; i++) {
        if (day >= 1 && day <= 7 && i >= 1 && i <= 14) {
          gridMatrix[day][i].push(c)
        }
      }
    }
  })
  
  blocks.forEach(b => {
    let overlapCourses = new Set()
    for (let i = b.start; i <= b.end; i++) {
      const coursesInSlot = gridMatrix[b.day][i]
      if (coursesInSlot.length > 1) {
        b.isConflict = true
        conflictingIds.add(b.course.id)
        coursesInSlot.forEach(overlapCourse => {
          overlapCourses.add(overlapCourse.name)
        })
      }
    }
    b.conflictNames = Array.from(overlapCourses)
  })

  return { blocks, conflictingIds }
})

const scheduleBlocks = computed(() => scheduleData.value.blocks)
const conflictingCourseIds = computed(() => scheduleData.value.conflictingIds)
const conflictCount = computed(() => scheduleBlocks.value.filter(b => b.isConflict).length)

// ─── 狀態列計算 ───
const totalCredits = computed(() => activeCourses.value.reduce((acc, c) => acc + c.credits, 0))
const avgPassRate = computed(() => {
  if (activeCourses.value.length === 0) return 0
  const sum = activeCourses.value.reduce((acc, c) => acc + c.passRate, 0)
  return (sum / activeCourses.value.length).toFixed(1)
})

// ─── 🌟 回測系統引擎 ───
const isBacktestMode = ref(false)
const animatedRiskW = ref(0)

const backtestStats = computed(() => {
  if (activeCourses.value.length === 0) return null
  
  const courses = activeCourses.value
  const totalCreds = courses.reduce((s, c) => s + c.credits, 0)
  const avgPass = courses.reduce((s, c) => s + c.passRate, 0) / courses.length
  
  // 計算預期均分 (拿過課率 - 5 當作平均分計算)
  const expectedAvgScore = courses.reduce((s, c) => s + ((c.passRate - 5) * c.credits), 0) / (totalCreds || 1)
  
  // 被二一統計機率、GPA計算與最大下跌
  const ruinRisk = Math.max(0, Math.round((100 - avgPass) * 0.6 + (totalCreds > 18 ? 15 : 0)))
  const gpa = (expectedAvgScore / 100 * 4).toFixed(1)
  const maxDD = Math.round(avgPass - 15)
  const riskW = Math.min(100, ruinRisk)
  
  const riskColor = ruinRisk < 20 ? 'var(--green)' : ruinRisk < 40 ? 'var(--amber)' : 'var(--red)'
  
  return {
    date: new Date().toLocaleString('zh-TW'),
    names: courses.map(c => c.name).join(' · '),
    totalCredits: totalCreds,
    courseCount: courses.length,
    avgPass: avgPass,
    expectedAvgScore: expectedAvgScore,
    ruinRisk,
    gpa,
    maxDD,
    riskW,
    riskColor
  }
})

const runDeepBacktest = () => {
  if (conflictCount.value > 0) {
    alert('有課程衝堂！請先解決衝突後再執行回測。')
    return
  }
  if (activeCourses.value.length === 0) {
    alert('請先加入課程。')
    return
  }
  
  isBacktestMode.value = true
  animatedRiskW.value = 0
  
  // 讓寬度過渡動畫有時間跑
  setTimeout(() => {
    animatedRiskW.value = backtestStats.value.riskW
  }, 100)
}

// 監聽群組切換，若切換群組則自動返回課表畫面
watch(activePortfolioId, () => {
  isBacktestMode.value = false
})

onMounted(() => { fetchData() })
</script>

<style scoped>
.backtest-layout { display: grid; grid-template-columns: 280px 1fr; height: calc(100vh - 80px); }
.builder-panel { background: var(--bg-card); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
.stats-panel { background: var(--bg-base); display: flex; flex-direction: column; overflow: hidden; }

/* ─── Sidebar ─── */
.sidebar-header { border-bottom: 1px solid var(--border-soft); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.sidebar-title { font-size: 10px; font-family: var(--font-mono); letter-spacing: 0.12em; color: var(--text-muted); text-transform: uppercase; }
.builder-body { padding: 16px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; }
.portfolio-slots { flex: 1; overflow-y: auto; margin-bottom: 16px; }

.course-picker { background: var(--bg-input); border: 1px dashed var(--border); border-radius: var(--radius); padding: 10px 12px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; transition: border-color 0.15s; }
.course-picker:hover { border-color: var(--text-secondary); border-style: solid; }
.course-picker-left { flex: 1; min-width: 0; }
.picker-code { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); margin-bottom: 2px; }
.picker-name { font-size: 12px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.picker-credits { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); background: var(--bg-base); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-soft); }
.picker-remove { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 12px; }
.picker-remove:hover { color: var(--red); }

.add-course-btn { width: 100%; padding: 12px; background: transparent; border: 1px dashed var(--border); border-radius: var(--radius); color: var(--text-secondary); font-size: 12px; font-family: var(--font-mono); cursor: pointer; transition: all 0.15s; display: flex; justify-content: center; align-items: center; gap: 6px; }
.add-course-btn:hover { background: var(--bg-hover); color: var(--text-primary); border-style: solid; border-color: var(--text-secondary); }

/* ─── Top Stats Bar ─── */
.schedule-stats-bar { display: flex; gap: 16px; padding: 16px 24px; background: var(--bg-card); border-bottom: 1px solid var(--border); align-items: center; flex-shrink: 0; }
.stat-chip { padding-right: 20px; border-right: 1px solid var(--border-soft); }
.stat-chip:last-of-type { border-right: none; }
.stat-label { font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
.stat-val { font-size: 16px; font-weight: 700; line-height: 1; }
.mono { font-family: var(--font-mono); }
.up { color: var(--green) !important; }
.dn { color: var(--red) !important; }
.neutral { color: var(--text-secondary) !important; }

/* ─── 按鈕 ─── */
.btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: var(--text-primary); color: var(--bg-deep); border: none; border-radius: var(--radius); font-family: var(--font-mono); font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
.btn-primary:hover { opacity: 0.85; }
.btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: transparent; color: var(--text-secondary); border: 1px solid var(--border); border-radius: var(--radius); font-family: var(--font-mono); font-size: 12px; cursor: pointer; transition: all 0.15s; }
.btn-ghost:hover { background: var(--bg-hover); color: var(--text-primary); }

/* ─── Visual Schedule Grid ─── */
.schedule-wrapper { padding: 24px; overflow-y: auto; flex: 1; display: flex; justify-content: center; align-items: flex-start; }
.schedule-grid {
  display: grid;
  grid-template-columns: 40px repeat(7, minmax(100px, 1fr));
  grid-template-rows: 30px repeat(14, minmax(40px, auto));
  gap: 1px;
  background: var(--border-soft);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
  width: 100%; max-width: 1100px;
}
.grid-header-cell { background: var(--bg-input); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--text-secondary); }
.corner-cell { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
.grid-time-cell { background: var(--bg-input); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); font-weight: 600; }
.grid-bg-cell { background: var(--bg-card); }

/* 課程方塊 */
.course-block {
  background: rgba(61, 214, 140, 0.15);
  border-left: 3px solid var(--green);
  margin: 2px; padding: 6px; border-radius: 4px;
  display: flex; flex-direction: column; gap: 4px;
  z-index: 10;
  transition: transform 0.15s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  position: relative;
}
.course-block:hover { transform: scale(1.02); z-index: 20; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
.conflict-block { background: rgba(235, 87, 87, 0.2); border-left-color: var(--red); box-shadow: 0 0 0 2px rgba(235, 87, 87, 0.5); }
.cb-name, .cb-prof, .cb-loc { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cb-name { font-size: 11px; font-weight: 600; color: var(--text-primary); line-height: 1.3; }
.cb-prof { font-size: 10px; color: var(--text-secondary); }
.cb-loc { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); margin-top: auto; }

/* 衝堂提示框 */
.conflict-tooltip {
  visibility: hidden; opacity: 0;
  position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
  background: var(--bg-deep); border: 1px solid var(--red); border-radius: 6px;
  padding: 8px 12px; z-index: 100;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  pointer-events: none;
}
.conflict-tooltip::after {
  content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
  border-width: 6px; border-style: solid;
  border-color: var(--red) transparent transparent transparent;
}
.course-block.conflict-block:hover .conflict-tooltip { visibility: visible; opacity: 1; bottom: calc(100% + 10px); }
.conflict-name-line { color: var(--text-primary); font-size: 11px; font-weight: 500; white-space: nowrap; margin-bottom: 4px; }
.conflict-status-line { color: var(--red); font-size: 11px; font-weight: 700; margin-top: 6px; padding-top: 4px; border-top: 1px solid var(--border); text-align: center; letter-spacing: 0.1em; }

/* ─── 回測報告介面 ─── */
.result-panel {
  background: var(--bg-base);
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.result-hero {
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin: 0 24px;
}
.result-grade {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}
.risk-meter {
  height: 8px;
  background: var(--border);
  border-radius: 100px;
  margin: 12px 0;
  overflow: hidden;
}
.risk-fill {
  height: 100%;
  border-radius: 100px;
  background: linear-gradient(90deg, var(--green) 0%, var(--amber) 60%, var(--red) 100%);
  transition: width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.result-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 20px 24px;
}
.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
}
.metric-label {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.metric-value {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}
.metric-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
}
.stress-row {
  display: grid;
  grid-template-columns: 1fr 80px 80px;
  gap: 0;
  padding: 9px 14px;
  border-bottom: 1px solid var(--border-soft);
  align-items: center;
}
.stress-row:hover { background: var(--bg-hover); }
.stress-name { font-size: 13px; color: var(--text-primary); }
.stress-normal {
  font-family: var(--font-mono);
  font-size: 12px;
  text-align: center;
}
.stress-worst {
  font-family: var(--font-mono);
  font-size: 12px;
  text-align: center;
  color: var(--red);
}
.chart-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
}
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

/* ─── Modal ─── */
.modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 300; backdrop-filter: blur(4px); align-items: center; justify-content: center; }
.modal-overlay.open { display: flex; }
.modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; }
.modal-header { padding: 18px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.modal-title { font-size: 15px; font-weight: 600; }
.modal-close { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; line-height: 1; }
.modal-close:hover { color: var(--text-primary); }
.modal-filter-bar { padding: 16px 22px; background: var(--bg-input); border-bottom: 1px solid var(--border-soft); }
.search-box input { width: 100%; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 8px 12px; color: var(--text-primary); font-family: var(--font-mono); font-size: 12px; outline: none; }
.mb-3 { margin-bottom: 12px; }
.filter-row { display: flex; gap: 8px; }
.filter-select { flex: 1; padding: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-primary); font-size: 12px; outline: none; }
.modal-body { padding: 16px; overflow-y: auto; flex: 1; }
.modal-course-row { padding: 12px 16px; border-radius: var(--radius); border-bottom: 1px solid var(--border-soft); cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.12s; }
.modal-course-row:hover { background: var(--bg-hover); }
.modal-add-btn { background: var(--text-primary); color: var(--bg-deep); border: none; padding: 6px 14px; border-radius: var(--radius); font-size: 11px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
.modal-add-btn:hover { opacity: 0.85; }
.modal-add-btn:disabled { background: var(--bg-hover); color: var(--text-muted); cursor: not-allowed; border: 1px solid var(--border); }

/* 左側清單衝堂警告 */
.picker-conflict { background: rgba(235, 87, 87, 0.05); border-color: var(--red) !important; border-style: solid; }
.picker-conflict .picker-code { color: var(--red); opacity: 0.8; }

/* ─── 壓力測試區塊排版 ─── */
.stress-row {
  display: grid;
  grid-template-columns: 1fr 80px 80px; /* 第一欄自動延展，後兩欄固定 80px */
  gap: 0;
  padding: 9px 14px;
  border-bottom: 1px solid var(--border-soft);
  align-items: center;
}
.stress-row:hover { background: var(--bg-hover); }
.stress-name { font-size: 13px; color: var(--text-primary); }
.stress-normal {
  font-family: var(--font-mono);
  font-size: 12px;
  text-align: center;
}
.stress-worst {
  font-family: var(--font-mono);
  font-size: 12px;
  text-align: center;
  color: var(--red);
}
</style>