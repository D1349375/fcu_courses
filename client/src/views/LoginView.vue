<template>
  <div class="login-page">
    <div class="login-bg-grid"></div>
    
    <div class="login-card">
      <div class="login-logo">
        <div class="login-logo-mark">FCE</div>
        <div class="login-title">逢甲選課交易所</div>
        <div class="login-sub">FCU COURSE EXCHANGE · v2.5.1</div>
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">學號 STUDENT ID</label>
          <input 
            class="form-input" 
            type="text" 
            placeholder="D1234567" 
            v-model="studentId" 
            required 
          />
        </div>
        <div class="form-group">
          <label class="form-label">密碼 PASSWORD</label>
          <input 
            class="form-input" 
            type="password" 
            placeholder="••••••••" 
            v-model="password" 
            required 
          />
        </div>

        <div v-if="errorMessage" class="error-msg">{{ errorMessage }}</div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? '連線中...' : '⚡ 進入交易所' }}
        </button>
      </form>

      <div class="login-divider">或使用其他方式</div>
      


      <button class="sso-btn register-btn" type="button" @click="$router.push('/setup')">
        首次使用？建立個人檔案 ➔
      </button>

      <p class="login-disclaimer">
        資料來源：校務系統歷年修課紀錄<br>本平台僅供輔助決策，不保證準確性
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 綁定輸入框狀態
const studentId = ref('')
const password = ref('')

// 🌟 新增：錯誤訊息與載入狀態
const errorMessage = ref('')
const isLoading = ref(false)

// 🌟 處理登入邏輯：串接後端 API
const handleLogin = async () => {
  if (!studentId.value || !password.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        studentId: studentId.value.trim().toUpperCase(), 
        password: password.value.trim() 
      })
    })
    
    const data = await res.json()
    
    if (res.ok) {
      // 登入成功：把使用者資料存進瀏覽器 localStorage
      localStorage.setItem('fce_user', JSON.stringify(data.user))
      console.log('登入成功，使用者：', data.user.nickname)
      router.push('/') // 跳轉到「市場總覽」首頁
    } else {
      // 登入失敗：顯示後端回傳的錯誤訊息 (例如：學號或密碼錯誤)
      errorMessage.value = data.error || '登入失敗，請檢查學號密碼'
    }
  } catch (e) {
    errorMessage.value = '伺服器連線失敗，請確認後端已啟動'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ─── 滿版與背景設定 ─── */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-deep);
  position: relative;
}

.login-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-soft) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
}

.login-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 40px 44px;
  width: 400px;
  position: relative;
  z-index: 1;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.login-logo { text-align: center; margin-bottom: 28px; }
.login-logo-mark {
  width: 52px; height: 52px; background: var(--bg-hover); border: 1px solid var(--border);
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--text-primary);
  margin: 0 auto 12px;
}
.login-title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 4px; }
.login-sub { font-size: 12px; color: var(--text-muted); text-align: center; font-family: var(--font-mono); }

.form-group { margin-bottom: 14px; }
.form-label {
  display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);
  letter-spacing: 0.08em; margin-bottom: 6px; text-transform: uppercase;
}
.form-input {
  width: 100%; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 10px 14px; color: var(--text-primary); font-family: var(--font-mono); font-size: 13px;
  outline: none; transition: border-color 0.15s;
}
.form-input:focus { border-color: var(--text-secondary); }
.form-input::placeholder { color: var(--text-muted); }

/* 🌟 錯誤訊息樣式 */
.error-msg {
  color: #ef4444; /* var(--red) */
  font-size: 12px;
  margin-bottom: 12px;
  text-align: center;
}

.login-btn {
  width: 100%; background: var(--text-primary); color: var(--bg-deep); border: none;
  border-radius: var(--radius); padding: 12px; font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: var(--font-mono); transition: opacity 0.15s;
  margin-top: 6px; letter-spacing: 0.04em;
}
.login-btn:hover:not(:disabled) { opacity: 0.85; }
.login-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.login-divider {
  display: flex; align-items: center; gap: 10px; margin: 18px 0;
  color: var(--text-muted); font-size: 11px;
}
.login-divider::before, .login-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}

.sso-btn {
  width: 100%; background: transparent; border: 1px solid var(--border); border-radius: var(--radius);
  padding: 10px; color: var(--text-secondary); font-size: 13px; cursor: pointer;
  font-family: var(--font-ui); transition: all 0.15s; display: flex; align-items: center;
  justify-content: center; gap: 8px;
}
.sso-btn:hover { border-color: var(--text-secondary); color: var(--text-primary); }

/* 🌟 註冊按鈕樣式：採用虛線邊框與 SSO 做出一點視覺區隔 */
.register-btn {
  margin-top: 10px;
  border-style: dashed;
}
.register-btn:hover {
  border-style: solid;
}

.login-disclaimer {
  text-align: center; margin-top: 20px; font-size: 11px; color: var(--text-muted);
  font-family: var(--font-mono); line-height: 1.5;
}
</style>