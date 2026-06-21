<template>
  <div class="setup-page">
    <div class="setup-bg-grid"></div>

    <div class="setup-card">
      <div class="setup-logo">
        <div class="setup-logo-mark">FCE</div>
        <div class="setup-title">建立個人檔案</div>
        <div class="setup-sub">PROFILE SETUP · 首次登入設定</div>
      </div>

      <div class="step-bar">
        <div class="step done">
          <div class="step-dot">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="2,6.5 5,9.5 10,3.5"/>
            </svg>
          </div>
          <span class="step-label">登入</span>
        </div>
        <div class="step-line"></div>
        <div class="step active">
          <div class="step-dot">02</div>
          <span class="step-label">個人資料</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-dot">03</div>
          <span class="step-label">完成</span>
        </div>
      </div>

      <div class="avatar-row">
        <div class="avatar-circle" :style="{ color: nickname ? 'var(--text-primary)' : 'var(--text-secondary)' }">
          {{ avatarChar }}
        </div>
        <div class="avatar-info">
          <div class="avatar-name">{{ nickname || '輸入暱稱後顯示' }}</div>
          <div class="avatar-sub">{{ avatarSubtitle }}</div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">

        <div class="form-group">
          <label class="form-label"><span class="label-required"></span>名稱 / 暱稱 &nbsp;DISPLAY NAME</label>
          <input class="form-input" type="text" v-model="nickname" placeholder="e.g. 李安、minhao" maxlength="20" />
          <div class="form-hint">最多 20 字，將顯示於課表與排名中</div>
        </div>

        <div class="form-group">
          <label class="form-label"><span class="label-required"></span>學號 &nbsp;STUDENT ID</label>
          <input class="form-input" type="text" v-model="studentId" placeholder="D1234567" maxlength="8" />
          <div class="form-hint">與校務系統登入帳號相同</div>
        </div>
        <div class="form-group">
          <label class="form-label"><span class="label-required"></span>密碼 &nbsp;PASSWORD</label>
          <input class="form-input" type="password" v-model="password" placeholder="請設定您的登入密碼" />
        </div>

        <div class="form-row">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label"><span class="label-required"></span>入學年度 &nbsp;YEAR</label>
            <div class="input-wrap">
              <select class="form-input" v-model="entryYear">
                <option value="" disabled selected>選擇年度</option>
                <option>113</option><option>112</option><option>111</option>
                <option>110</option><option>109</option><option>108</option><option>107</option>
              </select>
              <svg class="select-arrow" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="2,4 6,8 10,4"/></svg>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label"><span class="label-required"></span>科系 &nbsp;DEPARTMENT</label>
            <div class="input-wrap">
              <select class="form-input" v-model="dept">
                <option value="" disabled selected>選擇科系</option>
                <optgroup label="資電學院">
                  <option value="資工系">資訊工程學系</option><option value="電機系">電機工程學系</option>
                  <option value="通訊系">通訊工程學系</option><option value="資科系">資訊科技與工程學系</option>
                </optgroup>
                <optgroup label="商學院">
                  <option value="企管系">企業管理學系</option><option value="財金系">財務金融學系</option>
                  <option value="會計系">會計學系</option><option value="統計系">統計學系</option>
                </optgroup>
                <optgroup label="工學院">
                  <option value="機械系">機械與電腦輔助工程學系</option><option value="工業系">工業工程與系統科學學系</option>
                  <option value="化工系">化學工程學系</option><option value="土木系">土木工程學系</option>
                </optgroup>
              </select>
              <svg class="select-arrow" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="2,4 6,8 10,4"/></svg>
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="!isFormValid">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="7" cy="7" r="5.5"/><polyline points="4.5,7 6.5,9 9.5,5"/>
          </svg>
          確認並進入交易所
        </button>
      </form>

      <p class="setup-disclaimer">
        填寫完成後可隨時至「帳戶設定」修改<br>個人資料僅供平台內部識別，<a href="#">隱私政策</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表單狀態
const nickname = ref('')
const studentId = ref('')
const password = ref('') // 🌟 新增密碼狀態
const entryYear = ref('')
const dept = ref('')
const isLoading = ref(false)

const avatarChar = computed(() => nickname.value ? nickname.value.charAt(0).toUpperCase() : '—')

const avatarSubtitle = computed(() => {
  const parts = []
  if (dept.value) parts.push(dept.value)
  if (entryYear.value) parts.push(entryYear.value + ' 級')
  if (studentId.value) parts.push(studentId.value.toUpperCase())
  return parts.length ? parts.join(' · ') : '科系 · 入學年度'
})

// 🌟 驗證現在包含密碼了
const isFormValid = computed(() => {
  return nickname.value.trim() && studentId.value.trim() && password.value.trim() && entryYear.value && dept.value
})

const handleSubmit = async () => {
  if (!isFormValid.value) return
  isLoading.value = true
  
  const userData = {
    nickname: nickname.value.trim(),
    studentId: studentId.value.trim().toUpperCase(),
    password: password.value.trim(),
    entryYear: entryYear.value,
    dept: dept.value
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    const data = await res.json()

    if (res.ok) {
      // 註冊成功，自動幫他登入並跳轉
      localStorage.setItem('fce_user', JSON.stringify(data.user))
      alert('個人資料設定完成！即將進入交易所。')
      router.push('/')
    } else {
      alert(data.error || '註冊失敗')
    }
  } catch (e) {
    alert('伺服器連線失敗')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ─── CSS 變數（與 main.css 保持一致）─── */
.setup-page {
  min-height: calc(100vh - 80px); /* 扣掉 Topbar 的高度 */
  display: flex; align-items: center; justify-content: center;
  position: relative; padding: 40px 20px;
  background: var(--bg-deep);
}

.setup-bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(var(--border-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-soft) 1px, transparent 1px);
  background-size: 40px 40px; opacity: 0.5;
}

.setup-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px;
  padding: 40px 44px; width: 460px; position: relative; z-index: 1;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.setup-logo { text-align: center; margin-bottom: 28px; }
.setup-logo-mark {
  width: 52px; height: 52px; background: var(--bg-hover); border: 1px solid var(--border);
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--text-primary);
  margin: 0 auto 12px;
}
.setup-title { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
.setup-sub { font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }

.step-bar { display: flex; align-items: center; gap: 0; margin-bottom: 28px; }
.step { display: flex; align-items: center; gap: 7px; flex: 1; }
.step-dot {
  width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--border);
  background: var(--bg-hover); display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--text-muted);
  flex-shrink: 0; transition: all 0.2s;
}
.step.active .step-dot { background: var(--text-primary); border-color: var(--text-primary); color: var(--bg-deep); }
.step.done .step-dot { background: transparent; border-color: var(--text-secondary); color: var(--text-secondary); }
.step-label { font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.06em; white-space: nowrap; }
.step.active .step-label { color: var(--text-primary); }
.step-line { flex: 1; height: 1px; background: var(--border); margin: 0 8px; }

.form-group { margin-bottom: 16px; }
.form-label {
  display: flex; align-items: center; gap: 6px; font-size: 11px; font-family: var(--font-mono);
  color: var(--text-muted); letter-spacing: 0.08em; margin-bottom: 6px; text-transform: uppercase;
}
.form-label .label-required { width: 4px; height: 4px; border-radius: 50%; background: var(--accent-teal); flex-shrink: 0; }
.form-input {
  width: 100%; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 10px 14px; color: var(--text-primary); font-family: var(--font-mono); font-size: 13px;
  outline: none; transition: border-color 0.15s; appearance: none; -webkit-appearance: none;
}
.form-input:focus { border-color: var(--text-secondary); }
.form-input::placeholder { color: var(--text-muted); }
.input-wrap { position: relative; }
.input-wrap select { padding-right: 34px; cursor: pointer; }
.input-wrap .select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted); }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-hint { margin-top: 5px; font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }

.avatar-row {
  display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding: 14px;
  background: var(--bg-hover); border: 1px solid var(--border-soft); border-radius: var(--radius);
}
.avatar-circle {
  width: 48px; height: 48px; border-radius: 50%; background: var(--bg-deep); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 18px;
  font-weight: 700; flex-shrink: 0; transition: all 0.2s;
}
.avatar-info { flex: 1; }
.avatar-name { font-size: 14px; font-weight: 600; color: var(--text-primary); font-family: var(--font-mono); min-height: 20px; }
.avatar-sub { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px; min-height: 16px; }

.submit-btn {
  width: 100%; background: var(--text-primary); color: var(--bg-deep); border: none; border-radius: var(--radius);
  padding: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: var(--font-mono);
  transition: opacity 0.15s; margin-top: 6px; letter-spacing: 0.04em; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.submit-btn:hover { opacity: 0.85; }
.submit-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.setup-disclaimer {
  text-align: center; margin-top: 20px; font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); line-height: 1.5;
}
.setup-disclaimer a { color: var(--text-secondary); text-decoration: none; }
.setup-disclaimer a:hover { color: var(--text-primary); }
</style>