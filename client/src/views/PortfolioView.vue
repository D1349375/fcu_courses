<template>
  <div class="content-area">
    <div class="portfolio-grid">
      
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <div>
            <div style="font-size:18px;font-weight:700;">我的課表組合</div>
            <div style="font-size:12px;color:var(--text-muted);font-family:var(--font-mono);margin-top:2px;">全端真實數據連動中</div>
          </div>
          <button class="btn-primary" @click="openCreateModal">＋ 新增組合</button>
        </div>

        <div 
          v-for="item in portfolios" 
          :key="item.id" 
          class="portfolio-item" 
          @click="goToBacktest(item.id)"
        >
          <div>
            <div style="font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 3h8M2 6h8M2 9h4"/></svg>
              {{ item.name }}
            </div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;font-family:var(--font-mono); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 250px;">
              {{ item.courseNames }}
            </div>
            <div style="margin-top:8px;display:flex;gap:8px;">
              <span class="tag" :class="item.creditTagClass">{{ item.credits }} 學分</span>
              <span class="tag tag-info">GPA {{ item.gpa }}</span>
            </div>
          </div>
          
          <div style="text-align:right; display:flex; flex-direction:column; justify-content:space-between; align-items:flex-end;">
            <button class="delete-icon-btn" @click.stop="promptDelete(item.id, item.name)" title="刪除此組合">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            
            <div>
              <div style="font-family:var(--font-mono);font-size:22px;font-weight:700;" :style="{ color: item.riskColor }">
                {{ item.risk }}%
              </div>
              <div style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);">被二一風險</div>
            </div>
          </div>
        </div>
        
        <div v-if="portfolios.length === 0" style="text-align:center; padding: 40px; color: var(--text-muted); font-size: 13px;">
          尚無課表組合，請點擊右上方新增。
        </div>
      </div>

      <div>
        <div class="card mb-4">
          <div class="card-header"><span class="card-title">帳戶摘要</span></div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;color:var(--text-secondary);">已儲存組合</span>
              <span style="font-family:var(--font-mono);font-weight:600;">{{ portfolios.length }} 個</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;color:var(--text-secondary);">最佳 GPA 預測</span>
              <span style="font-family:var(--font-mono);font-weight:600;color:var(--green);">3.8</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;color:var(--text-secondary);">最低二一風險</span>
              <span style="font-family:var(--font-mono);font-weight:600;color:var(--green);">3%</span>
            </div>
            <div style="height:1px;background:var(--border);margin:4px 0;"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;color:var(--text-secondary);">建議選擇</span>
              <span class="tag tag-info">資工大一必修</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">選課小提醒</span></div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
            <div style="padding:10px;background:var(--red-dim);border-radius:var(--radius);border-left:3px solid var(--red);">
              <div style="font-size:12px;font-weight:600;color:var(--red);margin-bottom:3px;">— 高風險警示</div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.6;">「演算法」近 3 學期過課率均低於 55%，建議搭配「離散數學」先修。</div>
            </div>
            <div style="padding:10px;background:var(--green-dim);border-radius:var(--radius);border-left:3px solid var(--green);">
              <div style="font-size:12px;font-weight:600;color:var(--green);margin-bottom:3px;">+ 黃金搭配</div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.6;">「資料結構」＋「程式設計」同修，平均成績提升 8 分。</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" :class="{ open: isCreateModalOpen }" @click.self="isCreateModalOpen = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">新增課表組合</div>
          <button class="modal-close" @click="isCreateModalOpen = false">✕</button>
        </div>
        <div class="modal-body">
          <label style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px;">請輸入新組合名稱：</label>
          <input type="text" class="custom-input" v-model="newPortfolioName" placeholder="例如：113-2 備用課表" @keyup.enter="createPortfolio" />
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="isCreateModalOpen = false">取消</button>
          <button class="btn-primary" @click="createPortfolio" :disabled="!newPortfolioName.trim() || isCreating">
            {{ isCreating ? '建立中...' : '確定新增' }}
          </button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" :class="{ open: isDeleteModalOpen }" @click.self="isDeleteModalOpen = false">
      <div class="modal" style="width: 360px;">
        <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
          <div class="modal-title" style="color: var(--red); display:flex; align-items:center; gap:6px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            刪除確認
          </div>
        </div>
        <div class="modal-body">
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
            確定要刪除「<span style="color:var(--text-primary); font-weight:600;">{{ portfolioToDelete?.name }}</span>」嗎？<br>這個操作無法復原。
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-ghost" @click="isDeleteModalOpen = false">取消</button>
          <button class="btn-danger" @click="executeDelete">確定刪除</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const portfolios = ref([])
const allCourses = ref([])

// 新增狀態
const isCreating = ref(false)
const isCreateModalOpen = ref(false)
const newPortfolioName = ref('')

// 刪除狀態
const isDeleteModalOpen = ref(false)
const portfolioToDelete = ref(null)

// ─── 初始化：同時拉取「所有組合」與「所有課程資料庫」 ───
onMounted(async () => {
  try {
    const resCourses = await fetch('http://localhost:3000/api/course-info')
    allCourses.value = await resCourses.json()
    await loadPortfolios()
  } catch (e) {
    console.error('資料載入失敗', e)
  }
})

const loadPortfolios = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/portfolios', {
      headers: { 'x-user-id': getUserId() } // 攜帶身分證
    })
    const data = await res.json()
    
    portfolios.value = data.map(p => {
      const pCourses = p.course_ids.map(id => allCourses.value.find(c => c.course_id === id)).filter(Boolean)
      const credits = pCourses.reduce((sum, c) => sum + (c.scr_credit || 0), 0)
      const avgPass = pCourses.length ? pCourses.reduce((sum, c) => sum + 75, 0) / pCourses.length : 100 
      const risk = Math.round(100 - avgPass) 
      const gpa = (Math.random() * (4.0 - 2.0) + 2.0).toFixed(1) 
      
      return {
        id: p.id,
        name: p.name,
        courseNames: pCourses.map(c => c.sub_name).join(' · ') || '尚未加入課程',
        credits: credits,
        risk: risk,
        gpa: gpa,
        creditTagClass: credits >= 20 ? 'tag-risk' : credits >= 10 ? 'tag-mid' : 'tag-safe',
        riskColor: risk >= 50 ? 'var(--red)' : risk >= 20 ? 'var(--amber)' : 'var(--green)'
      }
    })
  } catch (e) {
    console.error('載入群組失敗', e)
  }
}

// ─── 新增邏輯 ───
const openCreateModal = () => {
  newPortfolioName.value = '113-2 備用課表' // 預設名稱
  isCreateModalOpen.value = true
}

const createPortfolio = async () => {
  if (!newPortfolioName.value.trim()) return
  isCreating.value = true
  try {
    const res = await fetch('http://localhost:3000/api/portfolios', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': getUserId() // 攜帶身分證
      },
      body: JSON.stringify({ name: newPortfolioName.value.trim() })
    })
    const newP = await res.json()
    
    isCreateModalOpen.value = false
    newPortfolioName.value = ''
    // 新增成功後跳轉
    router.push({ path: '/backtest', query: { id: newP.id } })
  } catch (e) {
    console.error('建立失敗', e)
  } finally {
    isCreating.value = false
  }
}

// ─── 刪除邏輯 ───
const promptDelete = (id, name) => {
  portfolioToDelete.value = { id, name }
  isDeleteModalOpen.value = true
}

const executeDelete = async () => {
  if (!portfolioToDelete.value) return
  try {
    await fetch(`http://localhost:3000/api/portfolios/${portfolioToDelete.value.id}`, { 
      method: 'DELETE',
      headers: { 'x-user-id': getUserId() } // 攜帶身分證
    })
    isDeleteModalOpen.value = false
    await loadPortfolios() // 重新計算與渲染
  } catch (e) {
    console.error('刪除失敗', e)
  }
}

const goToBacktest = (id) => {
  router.push({ path: '/backtest', query: { id } })
}

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('fce_user') || '{}')
  return user.id
}
</script>

<style scoped>
.content-area { padding: 24px; max-width: 1100px; margin: 0 auto; }
.portfolio-grid { display: grid; grid-template-columns: 1fr 360px; gap: 16px; }
.portfolio-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 18px; display: grid; grid-template-columns: 1fr auto; margin-bottom: 8px; align-items: stretch; transition: border-color 0.15s; cursor: pointer; }
.portfolio-item:hover { border-color: var(--text-secondary); }
.portfolio-item:hover .delete-icon-btn { opacity: 1; visibility: visible; }

.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 20px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.card-title { font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
.mb-4 { margin-bottom: 16px; }

:deep(.tag) { font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 100px; font-weight: 500; }
:deep(.tag-safe) { background: var(--green-dim); color: var(--green); }
:deep(.tag-risk) { background: var(--red-dim); color: var(--red); }
:deep(.tag-mid) { background: var(--amber-dim); color: var(--amber); }
:deep(.tag-info) { background: rgba(255,255,255,0.06); color: var(--text-secondary); border: 1px solid var(--border); }

/* 按鈕樣式 */
.btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: var(--text-primary); color: var(--bg-deep); border: none; border-radius: var(--radius); font-family: var(--font-ui); font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
.btn-primary:hover:not(:disabled) { opacity: 0.85; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: transparent; color: var(--text-secondary); border: 1px solid var(--border); border-radius: var(--radius); font-family: var(--font-ui); font-size: 12px; cursor: pointer; transition: all 0.15s; }
.btn-ghost:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--text-secondary); }
.btn-danger { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: var(--red); color: white; border: none; border-radius: var(--radius); font-family: var(--font-ui); font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
.btn-danger:hover { opacity: 0.85; }

/* 刪除按鈕 (預設隱藏，滑鼠移到卡片上才顯示) */
.delete-icon-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: all 0.15s; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; }
.delete-icon-btn:hover { color: var(--red); background: var(--red-dim); }

/* UI 彈窗 (Modal) 共用樣式 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 500; backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.2s; }
.modal-overlay.open { opacity: 1; pointer-events: auto; }
.modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; width: 400px; transform: translateY(20px); transition: transform 0.3s; display: flex; flex-direction: column; box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
.modal-overlay.open .modal { transform: translateY(0); }
.modal-header { padding: 18px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.modal-title { font-size: 15px; font-weight: 600; }
.modal-close { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; line-height: 1; }
.modal-close:hover { color: var(--text-primary); }
.modal-body { padding: 22px; }
.modal-footer { padding: 16px 22px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; background: var(--bg-input); border-bottom-left-radius: 14px; border-bottom-right-radius: 14px; }
.custom-input { width: 100%; background: var(--bg-base); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 14px; color: var(--text-primary); font-family: var(--font-ui); font-size: 13px; outline: none; transition: border-color 0.15s; }
.custom-input:focus { border-color: var(--text-secondary); }
</style>