<template>
  <div class="layout-two-col">

    <!-- ═══════════════ LEFT SIDEBAR ═══════════════ -->
    <div class="sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">課程資料庫</span>
        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">{{ filteredCourses.length }} 筆</span>
      </div>

      <div class="search-box">
        <span class="search-icon">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <circle cx="5.5" cy="5.5" r="4"/><line x1="8.8" y1="8.8" x2="12" y2="12"/>
          </svg>
        </span>
        <input type="text" placeholder="搜尋選課代號、課程名稱、教授..." v-model="searchQuery" />
      </div>

      <div class="filter-bar">
        <button class="filter-toggle-btn" :class="{ active: isFilterOpen }" @click="isFilterOpen = !isFilterOpen">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="3" x2="10" y2="3"/><line x1="4" y1="6" x2="8" y2="6"/><line x1="5" y1="9" x2="7" y2="9"/></svg>
          進階篩選設定
          <span v-if="filterMainDept !== 'all' || filterReq !== 'all' || filterCredit !== 'all'" class="filter-dot"></span>
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

        <div class="filter-group">
          <label>4. 學分數</label>
          <div class="filter-radio-group">
            <button :class="{ active: filterCredit === 'all' }" @click="filterCredit = 'all'">全部</button>
            <button :class="{ active: filterCredit === '1' }" @click="filterCredit = '1'">1</button>
            <button :class="{ active: filterCredit === '2' }" @click="filterCredit = '2'">2</button>
            <button :class="{ active: filterCredit === '3' }" @click="filterCredit = '3'">3</button>
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn-ghost" @click="resetFilter" style="padding: 4px 10px;">重設</button>
          <button class="btn-primary" @click="isFilterOpen = false" style="padding: 4px 10px;">套用</button>
        </div>
      </div>

      <div class="course-list">
        <div
          v-if="isLoading"
          class="sidebar-empty"
        >
          <div class="loading-dots">
            <span></span><span></span><span></span>
          </div>
          <span>載入中...</span>
        </div>

        <div
          v-else-if="filteredCourses.length === 0"
          class="sidebar-empty"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>無符合結果</span>
        </div>

        <div
          v-else
          v-for="c in filteredCourses"
          :key="c.course_id"
          class="course-row"
          :class="{ selected: selectedId === c.course_id }"
          @click="selectCourse(c)"
        >
          <div class="course-row-main">
            <div class="course-code">{{ c.courseCode }}</div>
            <div class="course-name">{{ c.sub_name }}</div>
            <div class="course-prof">
              {{ c.scr_teacher }}
              <span class="credit-badge">{{ c.scr_credit }} 學分</span>
            </div>
          </div>
          <div class="course-row-meta">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="2" width="10" height="9" rx="1"/><line x1="1" y1="5" x2="11" y2="5"/><line x1="4" y1="1" x2="4" y2="3"/><line x1="8" y1="1" x2="8" y2="3"/>
            </svg>
            {{ getWeekCount(c) }} 週
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ MAIN PANEL ═══════════════ -->
    <div class="main-panel">

      <!-- Empty State -->
      <div v-if="!selectedCourse && !isLoading" class="empty-state">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="28" height="32" rx="3"/>
            <line x1="13" y1="13" x2="27" y2="13"/>
            <line x1="13" y1="19" x2="27" y2="19"/>
            <line x1="13" y1="25" x2="21" y2="25"/>
          </svg>
        </div>
        <div class="empty-title">選擇一門課程</div>
        <div class="empty-sub">從左側列表點選課程，查看完整課綱、教學進度與課堂規定</div>
      </div>

      <!-- Course Detail -->
      <div v-else-if="selectedCourse" class="content-area">

        <!-- ── Hero Banner ── -->
        <div class="course-hero-card">
          <div class="hero-top">
            <div>
              <div class="hero-id">{{ selectedCourse.courseCode }}</div>
              <div class="hero-name">{{ selectedCourse.sub_name }}</div>
              <div class="hero-meta">
                <span class="hero-meta-item">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                    <circle cx="6" cy="4" r="2.5"/><path d="M1 11c0-2.76 2.24-5 5-5s5 2.24 5 5"/>
                  </svg>
                  {{ selectedCourse.scr_teacher }}
                </span>
                <span class="hero-meta-item">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="2" width="10" height="9" rx="1"/><line x1="1" y1="5" x2="11" y2="5"/><line x1="4" y1="1" x2="4" y2="3"/><line x1="8" y1="1" x2="8" y2="3"/>
                  </svg>
                  115-1 學期
                </span>
                <span class="hero-meta-item">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                    <circle cx="6" cy="6" r="5"/><path d="M6 3v3l2 1"/>
                  </svg>
                  {{ selectedCourse.scr_periodly }}
                </span>
              </div>
            </div>
            <div class="hero-badges">
              <div class="credit-chip">
                <div class="credit-chip-num">{{ selectedCourse.scr_credit }}</div>
                <div class="credit-chip-label">學分</div>
              </div>
              <div class="week-chip">
                <div class="week-chip-num">{{ getWeekCount(selectedCourse) }}</div>
                <div class="week-chip-label">週次</div>
              </div>
            </div>
          </div>

          <div class="hero-actions">
            <button class="btn-ghost" @click="clearSelection">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <line x1="10" y1="2" x2="2" y2="10"/><line x1="2" y1="2" x2="10" y2="10"/>
              </svg>
              關閉
            </button>
            <button class="btn-primary" @click="goToMarket">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="8" width="2.5" height="5"/><rect x="5.5" y="5" width="2.5" height="8"/><rect x="10" y="2" width="2.5" height="11"/>
              </svg>
              查看市場行情
            </button>
          </div>
        </div>

        <!-- ── Tabs ── -->
        <div class="tab-row">
          <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">課程總覽</button>
          <button class="tab-btn" :class="{ active: activeTab === 'schedule' }" @click="activeTab = 'schedule'">
            每週進度
            <span class="tab-count">{{ weeklySchedule.length }}</span>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'policy' }" @click="activeTab = 'policy'">課堂規定</button>
          <button class="tab-btn" :class="{ active: activeTab === 'textbook' }" @click="activeTab = 'textbook'">教科書</button>
        </div>

        <!-- ──────── TAB: OVERVIEW ──────── -->
        <div v-if="activeTab === 'overview'">
          <div class="info-grid">
            <div class="card">
              <div class="card-header">
                <span class="card-title">基本資訊</span>
              </div>
              <div class="info-list">
                <div class="info-row">
                  <span class="info-key">課程代碼</span>
                  <span class="info-val mono">{{ selectedCourse.course_id }}</span>
                </div>
                <div class="info-row">
                  <span class="info-key">課程名稱</span>
                  <span class="info-val">{{ selectedCourse.sub_name }}</span>
                </div>
                <div class="info-row">
                  <span class="info-key">授課教師</span>
                  <span class="info-val">{{ selectedCourse.scr_teacher }}</span>
                </div>
                <div class="info-row">
                  <span class="info-key">學分數</span>
                  <span class="info-val mono accent">{{ selectedCourse.scr_credit }} 學分</span>
                </div>
                <div class="info-row">
                  <span class="info-key">上課時間</span>
                  <span class="info-val mono">{{ selectedCourse.scr_periodly }}</span>
                </div>
                <div class="info-row">
                  <span class="info-key">週次進度</span>
                  <span class="info-val mono">{{ getWeekCount(selectedCourse) }} 週</span>
                </div>
              </div>
            </div>

            <!-- Credit Progress -->
            <div class="card">
              <div class="card-header">
                <span class="card-title">學期負載分析</span>
              </div>
              <div class="load-meter">
                <div class="load-row">
                  <span class="load-label">週作業量</span>
                  <div class="load-bar-wrap">
                    <div class="load-bar" :style="{ width: getAssignmentLoad() + '%', background: getLoadColor(getAssignmentLoad()) }"></div>
                  </div>
                  <span class="load-val mono" :style="{ color: getLoadColor(getAssignmentLoad()) }">{{ getAssignmentLoad() }}%</span>
                </div>
                <div class="load-row">
                  <span class="load-label">課程密度</span>
                  <div class="load-bar-wrap">
                    <div class="load-bar" :style="{ width: getDensityLoad() + '%', background: getLoadColor(getDensityLoad()) }"></div>
                  </div>
                  <span class="load-val mono" :style="{ color: getLoadColor(getDensityLoad()) }">{{ getDensityLoad() }}%</span>
                </div>
                <div class="load-row">
                  <span class="load-label">學分比重</span>
                  <div class="load-bar-wrap">
                    <div class="load-bar" :style="{ width: getCreditWeight() + '%', background: 'var(--accent-teal)' }"></div>
                  </div>
                  <span class="load-val mono" style="color:var(--accent-teal)">{{ getCreditWeight() }}%</span>
                </div>
              </div>
              <div class="load-hint">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6" cy="6" r="5"/><line x1="6" y1="5" x2="6" y2="9"/><circle cx="6" cy="3.5" r="0.5" fill="currentColor"/></svg>
                根據每週進度表的作業欄位自動估算
              </div>
            </div>
          </div>

          <!-- Course Description -->
          <div v-if="selectedCourse.describe_ch" class="card mt-4">
            <div class="card-header">
              <span class="card-title">課程描述與教學目標</span>
            </div>
            <div class="prose-block" v-html="formatText(selectedCourse.describe_ch)"></div>
          </div>

          <div v-else class="card mt-4">
            <div class="card-header"><span class="card-title">課程描述與教學目標</span></div>
            <div class="no-data">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="9" cy="9" r="7.5"/><line x1="9" y1="8" x2="9" y2="13"/><circle cx="9" cy="5.5" r="0.6" fill="currentColor"/></svg>
              此課程尚未提供課程描述
            </div>
          </div>
        </div>

        <!-- ──────── TAB: SCHEDULE ──────── -->
        <div v-if="activeTab === 'schedule'">
          <div v-if="scheduleLoading" class="card mt-0">
            <div class="loading-row">
              <div class="loading-dots"><span></span><span></span><span></span></div>
              載入每週進度中...
            </div>
          </div>

          <div v-else-if="weeklySchedule.length === 0" class="card mt-0">
            <div class="no-data">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="9" cy="9" r="7.5"/><line x1="9" y1="8" x2="9" y2="13"/><circle cx="9" cy="5.5" r="0.6" fill="currentColor"/></svg>
              此課程尚未提供每週進度表
            </div>
          </div>

          <div v-else class="schedule-wrap">
            <!-- 進度熱力軸 -->
            <div class="progress-track">
              <div
                v-for="w in weeklySchedule"
                :key="w.week"
                class="progress-node"
                :class="{
                  'has-assignment': w.assignment && w.assignment.trim(),
                  'no-assignment': !w.assignment || !w.assignment.trim(),
                  'active': selectedWeek === w.week
                }"
                @click="selectedWeek = selectedWeek === w.week ? null : w.week"
                :title="`第 ${w.week} 週`"
              >
                {{ w.week }}
              </div>
            </div>
            <div class="progress-legend">
              <span class="legend-item"><span class="legend-dot dot-assignment"></span>有作業</span>
              <span class="legend-item"><span class="legend-dot dot-no-assignment"></span>無作業</span>
            </div>

            <!-- 週次列表 -->
            <div class="schedule-table-wrap card">
              <table class="data-table schedule-table">
                <thead>
                  <tr>
                    <th style="width:60px">週次</th>
                    <th>課程主題 / 閱讀內容</th>
                    <th style="width:240px">作業 / 評量</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="w in weeklySchedule"
                    :key="w.week"
                    :class="{ 'row-highlighted': selectedWeek === w.week }"
                    @click="selectedWeek = selectedWeek === w.week ? null : w.week"
                    style="cursor:pointer"
                  >
                    <td>
                      <span class="week-num">W{{ String(w.week).padStart(2, '0') }}</span>
                    </td>
                    <td>
                      <div class="schedule-content" v-html="formatText(w.reading_content || '—')"></div>
                    </td>
                    <td>
                      <div v-if="w.assignment && w.assignment.trim()" class="assignment-cell">
                        <span class="assignment-dot"></span>
                        <span class="schedule-content" v-html="formatText(w.assignment)"></span>
                      </div>
                      <span v-else class="no-assignment-text">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 作業統計 -->
            <div class="stat-row mt-4">
              <div class="stat-chip">
                <div class="stat-chip-label">總週數</div>
                <div class="stat-chip-value" style="color:var(--text-primary)">{{ weeklySchedule.length }}</div>
                <div class="stat-chip-sub">本學期規劃</div>
              </div>
              <div class="stat-chip">
                <div class="stat-chip-label">有作業週</div>
                <div class="stat-chip-value" style="color:var(--amber)">{{ assignmentWeeks }}</div>
                <div class="stat-chip-sub">需繳交評量</div>
              </div>
              <div class="stat-chip">
                <div class="stat-chip-label">無作業週</div>
                <div class="stat-chip-value" style="color:var(--green)">{{ weeklySchedule.length - assignmentWeeks }}</div>
                <div class="stat-chip-sub">較輕鬆週次</div>
              </div>
              <div class="stat-chip">
                <div class="stat-chip-label">作業密度</div>
                <div class="stat-chip-value" :style="{ color: assignmentDensityColor }">
                  {{ assignmentDensity }}%
                </div>
                <div class="stat-chip-sub">有作業週佔比</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ──────── TAB: POLICY ──────── -->
        <div v-if="activeTab === 'policy'">
          <div class="card mt-0">
            <div class="card-header">
              <span class="card-title">課堂規定</span>
              <span class="card-hint">由授課教師自行訂定</span>
            </div>
            <div v-if="selectedCourse.course_policy && selectedCourse.course_policy.trim()">
              <div class="prose-block policy-block" v-html="formatText(selectedCourse.course_policy)"></div>
            </div>
            <div v-else class="no-data">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="9" cy="9" r="7.5"/><line x1="9" y1="8" x2="9" y2="13"/><circle cx="9" cy="5.5" r="0.6" fill="currentColor"/></svg>
              此課程尚未提供課堂規定
            </div>
          </div>
        </div>

        <!-- ──────── TAB: TEXTBOOK ──────── -->
        <div v-if="activeTab === 'textbook'">
          <div class="card mt-0">
            <div class="card-header">
              <span class="card-title">指定教科書 / 參考資料</span>
            </div>
            <div v-if="selectedCourse.textbooks && selectedCourse.textbooks.trim()">
              <div class="textbook-block" v-html="selectedCourse.textbooks"></div>
            </div>
            <div v-else class="no-data">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="9" cy="9" r="7.5"/><line x1="9" y1="8" x2="9" y2="13"/><circle cx="9" cy="5.5" r="0.6" fill="currentColor"/></svg>
              此課程尚未提供教科書資訊
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ─── 狀態 ───
const searchQuery   = ref('')
// 🌟 原本的 creditFilter 我們換成了 filterCredit 統一名稱
const courses       = ref([])
const selectedCourse = ref(null)
const selectedId    = ref(null)
const weeklySchedule = ref([])
const activeTab     = ref('overview')
const selectedWeek  = ref(null)
const isLoading     = ref(true)
const scheduleLoading = ref(false)

// ─── 🌟 新增的進階篩選狀態 ───
const isFilterOpen = ref(false)
const filterMainDept = ref('all')
const filterSubClass = ref('all')
const filterReq = ref('all')
const filterCredit = ref('all')

// ─── 🌟 自動解析系所 ───
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
  const depts = new Set(courses.value.map(c => c.deptGroup))
  return Array.from(depts).filter(d => d && d !== '未知').sort()
})

const subClassList = computed(() => {
  if (filterMainDept.value === 'all') return []
  const filteredDepts = courses.value.filter(c => c.deptGroup === filterMainDept.value)
  const classes = new Set(filteredDepts.map(c => c.dept))
  return Array.from(classes).sort()
})

// ─── 🌟 計算屬性 (結合所有條件的過濾器) ───
const filteredCourses = computed(() => {
  const q = String(searchQuery.value || '').trim().toLowerCase()
  
  return courses.value.filter(c => {
    if (!c) return false 

    const matchMain = filterMainDept.value === 'all' || c.deptGroup === filterMainDept.value
    const matchSub = filterSubClass.value === 'all' || c.dept === filterSubClass.value
    const matchReq = filterReq.value === 'all' || c.reqType === filterReq.value
    const matchCredit = filterCredit.value === 'all' || String(c.scr_credit) === filterCredit.value

    const safeName = String(c.sub_name || '').toLowerCase()
    const safeProf = String(c.scr_teacher || '').toLowerCase()
    const safeCode = String(c.courseCode || '').toLowerCase()
    const safeSelCode = String(c.scr_selcode || '').toLowerCase() // 🌟 新增選課代號
    
    // 🌟 讓選課代號也加入比對範圍
    const matchSearch = !q || safeName.includes(q) || safeProf.includes(q) || safeCode.includes(q) || safeSelCode.includes(q)
    
    return matchMain && matchSub && matchReq && matchCredit && matchSearch
  })
})

const resetFilter = () => {
  filterMainDept.value = 'all'
  filterSubClass.value = 'all'
  filterReq.value = 'all'
  filterCredit.value = 'all'
  searchQuery.value = ''
}

// ─── 工具函式 ───
const getWeekCount = (c) => c.week_count ?? '—'

const assignmentWeeks = computed(() =>
  weeklySchedule.value.filter(w => w.assignment && w.assignment.trim()).length
)

const assignmentDensity = computed(() => {
  if (!weeklySchedule.value.length) return 0
  return Math.round((assignmentWeeks.value / weeklySchedule.value.length) * 100)
})

const assignmentDensityColor = computed(() => {
  const d = assignmentDensity.value
  if (d >= 70) return 'var(--red)'
  if (d >= 40) return 'var(--amber)'
  return 'var(--green)'
})

const getAssignmentLoad = () => {
  if (!weeklySchedule.value.length) return 0
  const base = assignmentDensity.value
  return Math.min(base + Math.floor(Math.random() * 10), 100)
}

const getDensityLoad = () => {
  const wc = weeklySchedule.value.length
  if (!wc) return 0
  return Math.round((wc / 18) * 100)
}

const getCreditWeight = () => {
  const credit = selectedCourse.value?.scr_credit ?? 0
  return Math.round((credit / 6) * 100)
}

const getLoadColor = (pct) => {
  if (pct >= 70) return 'var(--red)'
  if (pct >= 45) return 'var(--amber)'
  return 'var(--green)'
}

const formatText = (text) => {
  if (!text) return ''
  if (/<[a-z][\s\S]*>/i.test(text)) return text
  return text.replace(/\n/g, '<br>')
}

// ─── API 呼叫 ───
const fetchCourses = async () => {
  isLoading.value = true
  try {
    const res = await fetch('/api/course-info')
    const data = await res.json()
    
    // 💡 防呆機制：如果後端沒開或回傳錯誤，立刻在 Console 報警，避免整個畫面壞掉
    if (!Array.isArray(data)) {
      console.error('⚠️ 後端回傳的不是陣列，請確認 Node.js 伺服器是否正常運作：', data)
      return
    }

    courses.value = data.map(c => {
        const rawDept = c.cls_name || '其他'
        const rawReq = c.scj_scr_mso || '未知'
        // 🌟 將預設使用的代碼改為優先顯示 scr_selcode
        const realCode = c.scr_selcode || (c.course_id ? String(c.course_id).slice(-4) : c.sub_id3)

        return {
            ...c, 
            courseCode: realCode,
            dept: rawDept,                           
            deptGroup: parseDeptGroup(rawDept),      
            reqType: rawReq,                         
        }
    })
  } catch (e) {
    console.error('無法載入課程資料庫:', e)
  } finally {
    isLoading.value = false
  }
}

const fetchWeeklySchedule = async (courseId) => {
  scheduleLoading.value = true
  weeklySchedule.value = []
  try {
    const res = await fetch(`/api/course-info/${courseId}/schedule`)
    const data = await res.json()
    weeklySchedule.value = data
  } catch (e) {
    console.error('無法載入每週進度:', e)
  } finally {
    scheduleLoading.value = false
  }
}

// ─── 互動邏輯 ───
const selectCourse = (c) => {
  selectedCourse.value = c
  selectedId.value = c.course_id
  activeTab.value = 'overview'
  selectedWeek.value = null
  fetchWeeklySchedule(c.course_id)
}

const clearSelection = () => {
  selectedCourse.value = null
  selectedId.value = null
  weeklySchedule.value = []
  selectedWeek.value = null
}

const goToMarket = () => {
  router.push('/')
}

// ─── 初始化 ───
fetchCourses()
</script>

<style scoped>
/* ─── 主佈局 ─── */
.layout-two-col {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: calc(100vh - 80px);
}

/* ─── SIDEBAR ─── */
.sidebar {
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
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
  margin: 10px 12px 0;
  position: relative;
  flex-shrink: 0;
}
.search-box input {
  width: 100%;
  box-sizing: border-box;
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
}

.filter-tabs {
  display: flex;
  gap: 0;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-soft);
  flex-shrink: 0;
}
.filter-tab {
  padding: 4px 11px;
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

.course-list {
  overflow-y: auto;
  flex: 1;
}
.course-row {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-soft);
  cursor: pointer;
  transition: background 0.1s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.course-row:hover { background: var(--bg-hover); }
.course-row.selected {
  background: var(--bg-hover);
  border-left: 2px solid var(--accent-teal);
}
.course-row-main { flex: 1; min-width: 0; }
.course-code {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.06em;
}
.course-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.course-prof {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.credit-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 100px;
  background: var(--bg-input);
  color: var(--text-muted);
  border: 1px solid var(--border-soft);
}
.course-row-meta {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

.sidebar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 200px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
}

/* ─── MAIN PANEL ─── */
.main-panel {
  overflow-y: auto;
  background: var(--bg-base);
}
.content-area {
  padding: 20px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ─── Empty State ─── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 14px;
  color: var(--text-muted);
  text-align: center;
}
.empty-icon { color: var(--border); }
.empty-title {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--text-secondary);
  letter-spacing: 0.06em;
}
.empty-sub {
  font-size: 12px;
  color: var(--text-muted);
  max-width: 280px;
  line-height: 1.7;
}

/* ─── Hero Card ─── */
.course-hero-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  margin-bottom: 16px;
}
.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.hero-id {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}
.hero-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.3;
}
.hero-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.hero-meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}
.hero-badges {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.credit-chip, .week-chip {
  text-align: center;
  padding: 10px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--bg-input);
}
.credit-chip-num {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-teal);
  line-height: 1;
}
.credit-chip-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  margin-top: 3px;
  text-transform: uppercase;
}
.week-chip-num {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  color: var(--blue);
  line-height: 1;
}
.week-chip-label {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  margin-top: 3px;
  text-transform: uppercase;
}
.hero-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--border-soft);
}

/* ─── Tabs ─── */
.tab-row {
  display: flex;
  gap: 2px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border-soft);
  padding-bottom: 0;
}
.tab-btn {
  padding: 7px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.12s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tab-btn:hover { color: var(--text-secondary); }
.tab-btn.active {
  color: var(--text-primary);
  border-bottom-color: var(--accent-teal);
  font-weight: 600;
}
.tab-count {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 100px;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  color: var(--text-muted);
}

/* ─── Info Grid ─── */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.card-title {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.card-hint {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.mt-4 { margin-top: 14px; }
.mt-0 { margin-top: 0; }

.info-list { display: flex; flex-direction: column; gap: 8px; }
.info-row { display: flex; align-items: center; justify-content: space-between; }
.info-key { font-size: 12px; color: var(--text-muted); }
.info-val { font-size: 12px; color: var(--text-primary); }
.info-val.mono { font-family: var(--font-mono); }
.info-val.accent { color: var(--accent-teal); }

/* ─── Load Meter ─── */
.load-meter { display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; }
.load-row { display: flex; align-items: center; gap: 10px; }
.load-label { font-size: 11px; color: var(--text-muted); width: 60px; flex-shrink: 0; }
.load-bar-wrap {
  flex: 1;
  height: 4px;
  background: var(--bg-hover);
  border-radius: 100px;
  overflow: hidden;
}
.load-bar {
  height: 100%;
  border-radius: 100px;
  transition: width 0.6s ease;
}
.load-val {
  font-size: 11px;
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}
.load-hint {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  display: flex;
  align-items: center;
  gap: 5px;
  padding-top: 8px;
  border-top: 1px solid var(--border-soft);
}

/* ─── Prose / Policy Block ─── */
.prose-block {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
}
.policy-block {
  padding: 14px 16px;
  background: var(--bg-input);
  border-radius: var(--radius);
  border-left: 3px solid var(--border);
}

/* ─── Textbook ─── */
.textbook-block {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
}
:deep(.textbook-block a) {
  color: var(--accent-teal);
  text-decoration: none;
}
:deep(.textbook-block a:hover) {
  text-decoration: underline;
}

/* ─── No Data ─── */
.no-data {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 24px 0;
  justify-content: center;
}

/* ─── Schedule ─── */
.schedule-wrap { display: flex; flex-direction: column; gap: 14px; }
.schedule-table-wrap { padding: 0; overflow: hidden; }

.progress-track {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
}
.progress-node {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s;
  border: 1px solid transparent;
}
.progress-node.has-assignment {
  background: var(--amber-dim);
  color: var(--amber);
  border-color: rgba(245,166,35,0.2);
}
.progress-node.no-assignment {
  background: var(--green-dim);
  color: var(--green);
  border-color: rgba(61,214,140,0.15);
}
.progress-node.active {
  border-color: var(--accent-teal);
  box-shadow: 0 0 0 2px var(--accent-teal-glow);
}
.progress-node:hover {
  transform: scale(1.12);
}
.progress-legend {
  display: flex;
  gap: 16px;
  padding: 0 2px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
}
.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.dot-assignment { background: var(--amber); }
.dot-no-assignment { background: var(--green); }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: left;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  font-weight: 500;
}
.data-table td {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-soft);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  vertical-align: top;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: var(--bg-hover); }
.row-highlighted td { background: rgba(61,214,140,0.04) !important; }
.week-num {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}
.schedule-content {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.7;
}
.assignment-cell {
  display: flex;
  align-items: flex-start;
  gap: 7px;
}
.assignment-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--amber);
  margin-top: 5px;
  flex-shrink: 0;
}
.no-assignment-text { color: var(--text-muted); }

/* ─── Stat Row ─── */
.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.mt-4 { margin-top: 0; }
.stat-chip {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
}
.stat-chip-label {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.stat-chip-value {
  font-family: var(--font-mono);
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}
.stat-chip-sub {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 4px;
  font-family: var(--font-mono);
}

/* ─── Buttons ─── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--text-primary);
  color: var(--bg-deep);
  border: none;
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.85; }
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* ─── Loading Dots ─── */
.loading-dots {
  display: flex;
  gap: 4px;
}
.loading-dots span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: dot-pulse 1.2s ease-in-out infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot-pulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
.loading-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  padding: 24px 0;
  justify-content: center;
}

/* ─── Utils ─── */
.up { color: var(--green) !important; }
.dn { color: var(--red) !important; }

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
.disabled-group { opacity: 0.4; pointer-events: none; }
.filter-radio-group { display: flex; gap: 4px; }
.filter-radio-group button {
  flex: 1; padding: 6px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px;
  color: var(--text-secondary); font-size: 11px; cursor: pointer; transition: all 0.1s;
}
.filter-radio-group button.active { background: var(--text-secondary); color: var(--bg-deep); border-color: var(--text-secondary); font-weight: 600; }
.filter-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
</style>