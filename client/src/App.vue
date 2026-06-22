<template>
  <div v-if="!$route.meta.hideTopbar" class="main-shell">
    <div class="ticker-tape">
      <div class="ticker-inner">
        <span v-for="(c, index) in duplicatedTickerData" :key="index" class="ticker-item">
          <span class="ticker-code">{{ c.id }}</span>
          <span class="ticker-val">{{ c.passRate }}%</span>
          <span class="ticker-chg" :class="c.change >= 0 ? 'up' : 'dn'">
            {{ c.change >= 0 ? '▲' : '▼' }}{{ Math.abs(c.change).toFixed(1) }}
          </span>
        </span>
      </div>
    </div>

    <div class="topbar">
      <div class="logo" @click="$router.push('/')">
        <div class="logo-mark">FCE</div>
        <div>
          <div class="logo-text">COURSE EXCHANGE</div>
          <div class="logo-sub">逢甲選課交易所</div>
        </div>
      </div>
      
      <div class="nav">
        <router-link to="/" class="nav-btn" active-class="active">市場總覽</router-link>
        <router-link to="/portfolio" class="nav-btn" active-class="active">我的課表</router-link>
        <router-link to="/course-info" class="nav-btn" active-class="active">課程資料庫</router-link>
        <router-link to="/profile" class="nav-btn" active-class="active">個人檔案</router-link>
      </div>

      <div class="topbar-actions">
        <div class="badge-live">LIVE DATA</div>
        <span style="font-size:12px;color:var(--text-secondary);font-family:var(--font-mono);">113-2學期</span>
        <button class="btn-ghost" @click="handleLogout">登出</button>
      </div>
    </div>
  </div>

  <router-view />

  <div class="toast-container">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
      <span class="toast-icon">{{ t.icon }}</span>
      <div class="toast-content">
        <div class="toast-title">{{ t.title }}</div>
        <div class="toast-msg">{{ t.msg }}</div>
      </div>
    </div>
  </div>

  <div class="bg-task-widget" v-if="isProcessing">
    <div class="task-drawer" :class="{ 'open': isDrawerOpen }">
      <div class="drawer-header">
        <span style="font-weight:600; font-size:12px; display:flex; align-items:center; gap:6px;">
          <span class="pulse-green"></span> 背景解析中
        </span>
        <button class="drawer-close" @click.stop="isDrawerOpen = false">✕</button>
      </div>
      <div class="drawer-body">
        <div class="cute-loader">
          <div class="robot-face">🤖</div>
          <div class="loader-dots"><span></span><span></span><span></span></div>
        </div>
        <div class="soothing-text">
          正在用魔法將圖片轉換為課表...<br>您可以先去其他頁面逛逛！
        </div>
      </div>
    </div>

    <div class="fab-icon" @click="isDrawerOpen = !isDrawerOpen" title="查看進度">
      <div class="fab-spinner"></div>
      <span class="fab-emoji">🤖</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const duplicatedTickerData = ref([])
const toasts = ref([])

// 🌟 新增：控制背景任務圖示與抽屜的狀態
const isProcessing = ref(false)
const isDrawerOpen = ref(false)

const fetchTickerData = async () => {
  try {
    const res = await fetch('/api/course-info')
    const data = await res.json()
    const mappedData = data.map(c => {
      return { 
        // 🌟 核心修改：優先拿選課代號，如果只有 course_id，就強制只切出最後 4 碼！
        id: c.scr_selcode || (c.course_id ? String(c.course_id).slice(-4) : c.sub_id3), 
        passRate: Math.floor(Math.random() * 46) + 50, 
        change: parseFloat((Math.random() * 10 - 5).toFixed(1)) 
      }
    })
    const top20Courses = mappedData.slice(0, 20)
    duplicatedTickerData.value = [...top20Courses, ...top20Courses]
  } catch (error) { console.error('無法取得跑馬燈資料:', error) }
}

const handleLogout = () => { router.push('/login') }

onMounted(() => {
  fetchTickerData()

  // 監聽 Toast 通知事件
  window.addEventListener('show-toast', (e) => {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, ...e.detail })
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 5000)
  })

  // 🌟 監聽開始與結束處理事件
  window.addEventListener('start-processing', () => {
    isProcessing.value = true
    isDrawerOpen.value = true // 剛開始先自動打開一下讓使用者看到
    setTimeout(() => { isDrawerOpen.value = false }, 4000) // 4秒後自動收起變小圖示
  })

  window.addEventListener('stop-processing', () => {
    isProcessing.value = false
    isDrawerOpen.value = false
  })
})
</script>

<style scoped>
/* 原本的 Topbar 與跑馬燈 CSS */
.ticker-tape { background: var(--bg-deep); border-bottom: 1px solid var(--border); overflow: hidden; height: 28px; display: flex; align-items: center; position: sticky; top: 0; z-index: 100; }
.ticker-inner { display: flex; animation: ticker 30s linear infinite; white-space: nowrap; gap: 48px; }
.ticker-item { font-family: var(--font-mono); font-size: 11px; display: flex; gap: 8px; align-items: center; }
.ticker-code { color: var(--text-secondary); }
.ticker-val { color: var(--text-primary); font-weight: 600; }
.ticker-chg.up { color: var(--green); }
.ticker-chg.dn { color: var(--red); }
@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

.topbar { background: var(--bg-card); border-bottom: 1px solid var(--border); padding: 0 24px; height: 52px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 28px; z-index: 99; }
.logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.logo-mark { width: 28px; height: 28px; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--text-primary); }
.logo-text { font-family: var(--font-mono); font-size: 14px; font-weight: 600; letter-spacing: 0.05em; color: var(--text-primary); }
.logo-sub { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); letter-spacing: 0.08em; }

.nav { display: flex; gap: 4px; }
.nav-btn { padding: 5px 14px; border-radius: var(--radius); background: transparent; border: none; color: var(--text-secondary); font-family: var(--font-ui); font-size: 13px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 6px; text-decoration: none; }
.nav-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.nav-btn.active { background: var(--bg-hover); color: var(--text-primary); font-weight: 600; border: 1px solid var(--border); }

.topbar-actions { display: flex; align-items: center; gap: 10px; }
.badge-live { display: flex; align-items: center; gap: 5px; font-size: 10px; font-family: var(--font-mono); color: var(--green); background: var(--green-dim); padding: 3px 8px; border-radius: 100px; }
.badge-live::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--green); animation: pulse 1.5s ease-in-out infinite; }

/* 🌟 全域通知 Toast 樣式 */
.toast-container { position: fixed; bottom: 90px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
.toast { background: var(--bg-card); border: 1px solid var(--border); border-left: 4px solid var(--accent-teal); padding: 14px 18px; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 12px; min-width: 280px; max-width: 350px; animation: slideIn 0.4s cubic-bezier(0.25, 1, 0.5, 1); pointer-events: auto; }
.toast.success { border-left-color: var(--green); }
.toast.loading { border-left-color: var(--accent-teal); }
.toast.error { border-left-color: var(--red); }
.toast-icon { font-size: 22px; }
.toast-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
.toast-msg { font-size: 11px; color: var(--text-muted); line-height: 1.4; }
@keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* 🌟 背景處理：外掛容器與懸浮小圖示 */
.bg-task-widget { position: fixed; bottom: 24px; right: 24px; z-index: 9998; display: flex; flex-direction: column; align-items: flex-end; }
.fab-icon { width: 44px; height: 44px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); position: relative; transition: transform 0.2s ease, box-shadow 0.2s ease; margin-top: 10px; }
.fab-icon:hover { transform: scale(1.1); box-shadow: 0 6px 16px rgba(45, 212, 191, 0.3); border-color: var(--accent-teal); }
.fab-emoji { font-size: 20px; z-index: 2; }
.fab-spinner { position: absolute; inset: -3px; border: 2px dashed rgba(45, 212, 191, 0.5); border-radius: 50%; animation: fab-spin 4s linear infinite; }
@keyframes fab-spin { 100% { transform: rotate(360deg); } }

/* 🌟 背景處理：彈出式抽屜 */
.task-drawer { position: absolute; bottom: 54px; right: 0; width: 280px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); opacity: 0; transform: translateY(20px) scale(0.95); pointer-events: none; transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1); transform-origin: bottom right; display: flex; flex-direction: column; overflow: hidden; }
.task-drawer.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
.drawer-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-input); border-bottom: 1px solid var(--border); }
.drawer-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; transition: color 0.15s; }
.drawer-close:hover { color: var(--text-primary); }
.pulse-green { display: inline-block; width: 6px; height: 6px; background: var(--accent-teal); border-radius: 50%; box-shadow: 0 0 6px var(--accent-teal); animation: pulse-ring 1.5s infinite; }
@keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(45, 212, 191, 0.6); } 70% { box-shadow: 0 0 0 6px rgba(45, 212, 191, 0); } 100% { box-shadow: 0 0 0 0 rgba(45, 212, 191, 0); } }

/* 🌟 舒緩情緒小動畫 */
.drawer-body { padding: 24px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.cute-loader { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 12px; }
.robot-face { font-size: 32px; animation: float-bot 2s ease-in-out infinite; }
@keyframes float-bot { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-8px) rotate(5deg); } }
.loader-dots { display: flex; gap: 4px; }
.loader-dots span { width: 6px; height: 6px; background: var(--accent-teal); border-radius: 50%; animation: pulse-dot 1.4s infinite; }
.loader-dots span:nth-child(2) { animation-delay: 0.2s; }
.loader-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse-dot { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
.soothing-text { font-size: 11.5px; color: var(--text-muted); text-align: center; line-height: 1.6; }
</style>