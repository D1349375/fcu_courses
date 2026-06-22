<template>
  <div class="content-area">
    
    <div class="card profile-hero">
      <div class="profile-avatar">{{ avatarChar }}</div>
      <div>
        <div class="profile-name-row">
          <span class="profile-name">{{ currentUser.nickname }}</span>
          <span class="profile-id">{{ currentUser.studentId }}</span>
          <span class="tag tag-info">{{ currentUser.dept }}</span>
          <span class="tag tag-mid">{{ gradeText }} · {{ currentAcademicYear }}學年</span>
          
          <button class="btn-ghost" style="padding: 2px 8px; font-size: 11px; margin-left: 6px;" @click="openEditProfile">✏️ 編輯資料</button>
        </div>
        <div class="profile-meta">
          <span class="profile-meta-item">🎓 入學年度：{{ currentUser.entryYear }}學年</span>
          <span class="profile-meta-item">📚 已上傳 {{ uploadedSemesters.length }} 個學期課表</span>
        </div>
      </div>
      <div class="profile-gpa-display">
        <div class="profile-gpa-value">{{ cumulativeGPA }}</div>
        <div class="profile-gpa-label">累計 GPA</div>
      </div>
    </div>

    <div class="tab-row">
      <button class="tab-btn" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">📈 總覽</button>
      <button class="tab-btn" :class="{ active: activeTab === 'semesters' }" @click="activeTab = 'semesters'">🗂️ 課表上傳</button>
      <button class="tab-btn" :class="{ active: activeTab === 'graduation' }" @click="activeTab = 'graduation'">🎯 畢業學分</button>
      <button class="tab-btn" :class="{ active: activeTab === 'privacy' }" @click="activeTab = 'privacy'">🔒 資料授權</button>
    </div>

    <div class="tab-panel" v-show="activeTab === 'overview'">
      <div class="stat-row">
        <div class="stat-chip"><div class="stat-chip-label">累計學分</div><div class="stat-chip-value" style="color:var(--accent-teal)">82</div><div class="stat-chip-sub">畢業需 128 學分</div></div>
        <div class="stat-chip">
          <div class="stat-chip-label">累計 GPA</div>
          <div class="stat-chip-value" style="color:var(--green)">{{ cumulativeGPA }}</div>
          <div class="stat-chip-sub">即時動態計算</div>
        </div>
        <div class="stat-chip"><div class="stat-chip-label">已確認畢業學分</div><div class="stat-chip-value" style="color:var(--text-primary)">61</div><div class="stat-chip-sub">佔總需求 47.7%</div></div>
        <div class="stat-chip"><div class="stat-chip-label">缺額學分</div><div class="stat-chip-value" style="color:var(--amber)">46</div><div class="stat-chip-sub">含修習中 21 學分</div></div>
      </div>

      <div class="chart-wrap">
        <div class="card-header">
          <span class="card-title">歷年 GPA 趨勢</span>
          <div class="chart-controls"><button class="chart-btn active">學期 GPA</button><button class="chart-btn">累計 GPA</button></div>
        </div>
        <div style="position: relative; height: 220px; width: 100%;"><canvas id="gpaChart"></canvas></div>
      </div>

      <div class="two-col">
        <div class="card">
          <div class="card-header"><span class="card-title">學分結構分布</span></div>
          <div style="position: relative; height: 220px; width: 100%;"><canvas id="creditDonut"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">系統優化提示</span></div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
            <div style="padding:12px;background:var(--accent-teal-dim);border-radius:var(--radius);border-left:3px solid var(--accent-teal);">
              <div style="font-weight:600;color:var(--accent-teal);margin-bottom:4px;font-size:12px;">💡 模型已校準</div>
              <div style="font-size:11.5px;color:var(--text-secondary);line-height:1.6;">你已上傳 5 個學期的真實成績，GPA 試算系統的預測誤差已從 ±0.35 降至 ±0.09。</div>
            </div>
            <div style="padding:12px;background:var(--green-dim);border-radius:var(--radius);border-left:3px solid var(--green);">
              <div style="font-weight:600;color:var(--green);margin-bottom:4px;font-size:12px;">✅ 個人化過課率</div>
              <div style="font-size:11.5px;color:var(--text-secondary);line-height:1.6;">根據你的歷史修課表現，回測引擎現在會優先採用「你個人」的過課率，而非全校平均值。</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tab-panel" v-show="activeTab === 'semesters'">
      <div class="card mb-4">
        <div class="card-header">
          <span class="card-title">已上傳學期課表</span>
          <button class="btn-primary" @click="openUploadModal">＋ 上傳新學期課表</button>
        </div>
        <div class="semester-grid">
          
          <div v-for="sem in uploadedSemesters" :key="sem.id" class="semester-card uploaded" @click="openSemesterDetail(sem.id)">
            <button class="delete-sem-btn" @click.stop="deleteSemester(sem.id)" title="刪除此學期">✕</button>
            <div class="semester-top"><span class="semester-label">{{ sem.id }}</span><span class="semester-status done">已解析</span></div>
            <div class="semester-gpa" :style="{ color: sem.gpa === '--' ? 'var(--text-muted)' : '' }">{{ sem.gpa }}</div>
            <div class="semester-gpa-sub">學期 GPA</div>
            <div class="semester-credits"><span>{{ sem.credits }} 學分</span><span>{{ sem.count }} 門課</span></div>
          </div>
          
          <div class="semester-card empty" @click="openUploadModal">
            <span style="font-size:22px;">＋</span><span style="font-size:12px;">上傳新課表</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">為什麼要上傳課表？</span></div>
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.8;">
          系統會自動比對課程資料庫，將每一門課分類為「院系必修」、「本系專業選修」、「通識社會／人文／自然」等類別，
          並即時更新你的畢業學分進度。同時，你的真實成績會回饋給 GPA 試算與回測引擎，讓破產機率與預期均分的預測更貼近你個人的修課狀況。
        </div>
      </div>
    </div>


    <div class="tab-panel" v-show="activeTab === 'graduation'">
      <div class="card mb-4">
        <div class="card-header">
          <span class="card-title">畢業學分總進度</span>
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);">{{ currentUser.dept }} {{ currentUser.entryYear }}學年入學適用</span>
        </div>
        <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px;">
          <span style="font-family:var(--font-mono);font-size:28px;font-weight:700;color:var(--accent-teal);">{{ totalCredits.confirmed }}</span>
          <span style="font-size:13px;color:var(--text-muted);">/ {{ totalCredits.required }} 學分已確認畢業</span>
          <span class="tag tag-mid" style="margin-left:auto;">修習中 {{ totalCredits.pending }} 學分</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: Math.min((totalCredits.confirmed / totalCredits.required) * 100, 100) + '%' }"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:10px;color:var(--text-muted);font-family:var(--font-mono);">
          <span>{{ ((totalCredits.confirmed / totalCredits.required) * 100).toFixed(1) }}% 已確認</span>
          <span>尚缺 {{ Math.max(totalCredits.required - totalCredits.confirmed - totalCredits.pending, 0) }} 學分</span>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <span class="card-title">畢業學分明細表</span>
          <span style="font-size:11px;color:var(--text-muted);">💡 點擊有底線的學分數字可查看修課明細</span>
        </div>
        <div class="credit-table-wrap">
          <table class="credit-table">
            <thead>
              <tr><th>課程類別</th><th>應修學分</th><th>已確認</th><th>待確認</th><th>修習中</th><th>合計</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>通識教育基礎課程</td><td>{{ creditStats.basicGenEd.required }}</td>
                <td class="clickable-credit" @click="openCreditDetail('通識基礎(已確認)', creditStats.basicGenEd.courses.filter(c=>c.status==='已確認'))">{{ creditStats.basicGenEd.confirmed }}</td>
                <td>0</td>
                <td class="clickable-credit pending" @click="openCreditDetail('通識基礎(修習中)', creditStats.basicGenEd.courses.filter(c=>c.status==='修習中'))">{{ creditStats.basicGenEd.pending }}</td>
                <td>{{ creditStats.basicGenEd.confirmed + creditStats.basicGenEd.pending }}</td>
              </tr>
              <tr>
                <td>院系必修</td><td>{{ creditStats.majorRequired.required }}</td>
                <td class="clickable-credit" @click="openCreditDetail('院系必修(已確認)', creditStats.majorRequired.courses.filter(c=>c.status==='已確認'))">{{ creditStats.majorRequired.confirmed }}</td>
                <td>0</td>
                <td class="clickable-credit pending" @click="openCreditDetail('院系必修(修習中)', creditStats.majorRequired.courses.filter(c=>c.status==='修習中'))">{{ creditStats.majorRequired.pending }}</td>
                <td>{{ creditStats.majorRequired.confirmed + creditStats.majorRequired.pending }}</td>
              </tr>
              
              <tr class="subtotal"><td>--- 必修合計 ---</td><td>{{ creditStats.basicGenEd.required + creditStats.majorRequired.required }}</td>
                <td class="credit-confirmed">{{ creditStats.basicGenEd.confirmed + creditStats.majorRequired.confirmed }}</td><td>0</td>
                <td>{{ creditStats.basicGenEd.pending + creditStats.majorRequired.pending }}</td>
                <td>{{ creditStats.basicGenEd.confirmed + creditStats.majorRequired.confirmed + creditStats.basicGenEd.pending + creditStats.majorRequired.pending }}</td>
              </tr>

              <tr v-for="cat in [{key:'genEdSocial', name:'通識社會'}, {key:'genEdHumanities', name:'通識人文'}, {key:'genEdNature', name:'通識自然'}]" :key="cat.key">
                <td>{{ cat.name }}</td><td>{{ creditStats[cat.key].required }}</td>
                <td class="clickable-credit" @click="openCreditDetail(cat.name, creditStats[cat.key].courses.filter(c=>c.status==='已確認'))">{{ creditStats[cat.key].confirmed }}</td>
                <td>0</td>
                <td class="clickable-credit pending" @click="openCreditDetail(cat.name, creditStats[cat.key].courses.filter(c=>c.status==='修習中'))">{{ creditStats[cat.key].pending }}</td>
                <td>{{ creditStats[cat.key].confirmed + creditStats[cat.key].pending }}</td>
              </tr>

              <tr>
                <td>本系專業選修</td><td>{{ creditStats.majorElective.required }}</td>
                <td class="clickable-credit" @click="openCreditDetail('本系選修', creditStats.majorElective.courses.filter(c=>c.status==='已確認'))">{{ creditStats.majorElective.confirmed }}</td>
                <td>0</td>
                <td class="clickable-credit pending" @click="openCreditDetail('本系選修', creditStats.majorElective.courses.filter(c=>c.status==='修習中'))">{{ creditStats.majorElective.pending }}</td>
                <td>{{ creditStats.majorElective.confirmed + creditStats.majorElective.pending }}</td>
              </tr>
              <tr>
                <td>非本系專業選修</td><td>{{ creditStats.freeElective.required }}</td>
                <td class="clickable-credit" @click="openCreditDetail('自由選修', creditStats.freeElective.courses.filter(c=>c.status==='已確認'))">{{ creditStats.freeElective.confirmed }}</td>
                <td>0</td>
                <td class="clickable-credit pending" @click="openCreditDetail('自由選修', creditStats.freeElective.courses.filter(c=>c.status==='修習中'))">{{ creditStats.freeElective.pending }}</td>
                <td>{{ creditStats.freeElective.confirmed + creditStats.freeElective.pending }}</td>
              </tr>

              <tr class="grandtotal"><td>總計畢業學分</td><td>{{ totalCredits.required }}</td>
                <td class="credit-confirmed">{{ totalCredits.confirmed }}</td><td>0</td>
                <td style="color:var(--amber);">{{ totalCredits.pending }}</td>
                <td>{{ totalCredits.total }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">缺額提醒與建議</span></div>
        <div style="margin-top:4px;">
          <div class="gap-card urgent">
            <div class="gap-top"><span class="gap-title">⚠️ 通識自然 — 尚缺 2 學分</span><span class="tag tag-risk">未排入課表</span></div>
            <div class="gap-desc">建議於 {{ currentAcademicYear }}-2 或 {{ currentAcademicYear + 1 }}-1 排入「物理導論」等課程，避免延畢風險。</div>
          </div>
          <div class="gap-card ok">
            <div class="gap-top"><span class="gap-title">✅ 通識社會 — 已達標</span><span class="tag tag-safe">已完成</span></div>
            <div class="gap-desc">2/2 學分已確認畢業，此類別不需再選修。</div>
          </div>
        </div>
      </div>

    </div>
    
    <div class="tab-panel" v-show="activeTab === 'privacy'">
      <div class="card mb-4">
        <div class="card-header"><span class="card-title">資料使用授權</span></div>
        <div>
          <div class="privacy-row">
            <div>
              <div class="privacy-label">允許用我的成績優化 GPA 試算模型</div>
              <div class="privacy-desc">歷史成績將以匿名化方式用於改進預測準確度</div>
            </div>
            <label class="toggle-switch"><input type="checkbox" checked /><span class="toggle-slider"></span></label>
          </div>
          <div class="privacy-row">
            <div>
              <div class="privacy-label">在排行榜顯示我的暱稱</div>
              <div class="privacy-desc">系排名是否顯示匿名暱稱（如「資工三 #042」）</div>
            </div>
            <label class="toggle-switch"><input type="checkbox" /><span class="toggle-slider"></span></label>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal-overlay" :class="{ open: isModalOpen }" @click.self="closeUploadModal">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">上傳學期課表 / 成績單</div>
        <button class="modal-close" @click="closeUploadModal">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">選擇學期 SEMESTER</label>
          <select class="form-input" v-model="selectedUploadSemester">
            <option :value="(currentAcademicYear + 1) + '-1'">{{ currentAcademicYear + 1 }}-1 (下學年)</option>
            <option :value="currentAcademicYear + '-2'">{{ currentAcademicYear }}-2</option>
            <option :value="currentAcademicYear + '-1'">{{ currentAcademicYear }}-1</option>
            <option :value="(currentAcademicYear - 1) + '-2'">{{ currentAcademicYear - 1 }}-2</option>
            <option :value="(currentAcademicYear - 1) + '-1'">{{ currentAcademicYear - 1 }}-1</option>
            <option :value="(currentAcademicYear - 2) + '-2'">{{ currentAcademicYear - 2 }}-2</option>
            <option :value="(currentAcademicYear - 2) + '-1'">{{ currentAcademicYear - 2 }}-1</option>
          </select>
        </div>

        <div>
          <label class="form-label">上傳檔案 (背景 AI 解析)</label>
          <input type="file" ref="fileInputRef" style="display: none;" accept="image/png, image/jpeg, application/pdf" @change="handleFileUpload" />
          <div class="dropzone" @click="triggerFileInput">
            <div class="dropzone-icon">🤖</div>
            <div class="dropzone-title">點擊上傳圖檔 / PDF</div>
            <div class="dropzone-sub">上傳後將在背景為您自動解析並排入課表</div>
          </div>
        </div>

        <div v-if="uploadStep === 'result'" id="parseResultStep">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="color:var(--green);font-size:16px;">✓</span>
              <span style="font-size:13px;font-weight:600;">AI 辨識完成，共匯入 {{ parsedCourses.length }} 門課程</span>
            </div>
            <span class="tag tag-mid">總計 {{ parsedTotalCredits }} 學分</span>
          </div>
          <div class="parse-row header"><span>課程名稱</span><span>學分</span><span>成績</span><span>分類</span></div>
          <div v-for="(course, idx) in parsedCourses" :key="idx" class="parse-row">
            <div>
              <div class="parse-course-name">{{ course.name }}</div>
              <div class="parse-course-code">{{ course.code || '無代碼' }}</div>
            </div>
            <span>{{ course.credits }}</span>
            <span :class="course.score >= 60 || course.score === '通過' ? 'up' : 'neutral'">{{ course.score }}</span>
            <span class="tag tag-info" style="font-size:9px;">{{ course.category || '未分類' }}</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" @click="closeUploadModal">取消</button>
        <button v-if="uploadStep === 'result'" class="btn-primary" @click="confirmUpload">確認並儲存</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" :class="{ open: isDetailModalOpen }" @click.self="checkBeforeClose">
    <div class="modal" :class="{ 'fullscreen-modal': isFullscreen }" style="width: 800px; max-width: 90vw;">
      
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap: 12px;">
          <div class="modal-title">{{ selectedSemesterName }} 學期修課明細</div>
          <span class="tag" :class="hasUnsavedChanges ? 'tag-risk' : 'tag-safe'">
            {{ hasUnsavedChanges ? '⚠️ 尚未儲存' : '✅ 已存檔' }}
          </span>
        </div>
        <div style="display:flex; gap: 10px; align-items:center;">
          <button v-if="hasUnsavedChanges" class="btn-primary" style="background: var(--red);" @click="saveChanges">💾 儲存變更</button>
          <button class="btn-outline-primary" @click="isManualAddOpen = true">＋ 手動新增課程</button>
          <button class="btn-ghost" @click="isFullscreen = !isFullscreen" style="padding: 6px 10px;">
            {{ isFullscreen ? '🗗 縮小' : '🖵 全螢幕' }}
          </button>
          <button class="modal-close" @click="checkBeforeClose">✕</button>
        </div>
      </div>
      
      <div class="modal-body" style="background: var(--bg-base); padding: 20px;">
        <div style="display:flex; gap: 16px; margin-bottom: 16px;">
          <div class="stat-chip" style="flex:1; padding: 12px 16px;">
            <div class="stat-chip-label">本學期總學分</div>
            <div class="stat-chip-value" style="color:var(--text-primary)">{{ selectedSemesterData?.totalCredits || 0 }}</div>
          </div>
          <div class="stat-chip" style="flex:1; padding: 12px 16px;">
            <div class="stat-chip-label">學期 GPA <span style="color:var(--accent-teal); cursor:pointer; text-transform:none;">(✏️點擊可修改)</span></div>
            <input type="number" step="0.01" min="0" max="4.3" class="gpa-edit-input"
                   v-model="selectedSemesterData.gpa"
                   @input="markUnsaved"
                   :style="{ color: (selectedSemesterData?.gpa >= 3.0 ? 'var(--green)' : 'var(--amber)') }" />
          </div>
        </div>
        
        <div class="schedule-grid" v-if="selectedSemesterData?.blocks?.length > 0">
          <div class="grid-header-cell corner-cell">節次</div>
          <div v-for="day in ['星期一','星期二','星期三','星期四','星期五']" :key="day" class="grid-header-cell">{{ day }}</div>
          
          <template v-for="row in 14" :key="'row-'+row">
            <div class="grid-time-cell" :style="{ gridColumn: 1, gridRow: row + 1 }">{{ row }}</div>
            <div v-for="col in 5" :key="'cell-'+row+'-'+col" 
                 class="grid-bg-cell drop-zone" 
                 :style="{ gridColumn: col + 1, gridRow: row + 1 }"
                 @dragover.prevent
                 @drop="handleDrop($event, col, row)">
            </div>
          </template>
          
          <div v-for="b in selectedSemesterData?.blocks || []" :key="b.id" 
               class="course-block"
               :class="{ 'draggable': !isResizingMode }" 
               :draggable="!isResizingMode"
               @dragstart="handleDragStart($event, b)"
               :style="{ gridColumn: (b.day + 1) + ' / span 1', gridRow: (b.start + 1) + ' / span ' + (b.end - b.start + 1) }">
            
            <button class="block-delete-btn" @click.stop="deleteBlock(b.id)" title="刪除此課程">✕</button>
            <div class="cb-name">{{ b.name }}</div>
            <div class="cb-prof">{{ b.prof }}</div>
            <div class="cb-loc">{{ b.loc }}</div>
            
            <div class="resizer-handle" @mousedown.prevent.stop="startResize($event, b)"></div>
          </div>
        </div>

        <div v-if="(!selectedSemesterData?.blocks || selectedSemesterData.blocks.length === 0) && selectedSemesterData?.courses?.length > 0">
          <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">💡 此為 AI 匯入之成績單，無上課節次時間資料：</div>
          <div class="parse-row header" style="border-bottom: 1px solid var(--border); padding-left: 0; padding-right: 0;">
            <span>課程名稱</span><span>學分</span><span>成績</span><span>分類</span>
          </div>
          <div v-for="(c, idx) in selectedSemesterData.courses" :key="idx" class="parse-row" style="padding-left: 0; padding-right: 0;">
            <div>
              <div class="parse-course-name">{{ c.name }}</div>
              <div class="parse-course-code">{{ c.code || '無代碼' }}</div>
            </div>
            <span>{{ c.credits }}</span>
            <span :class="c.score >= 60 || c.score === '通過' ? 'up' : 'neutral'">{{ c.score }}</span>
            <span class="tag tag-info" style="font-size:9px;">{{ c.category }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal-overlay" :class="{ open: isManualAddOpen }" @click.self="isManualAddOpen = false" style="z-index: 600;">
    <div class="modal" style="width: 400px;">
      <div class="modal-header">
        <div class="modal-title">手動新增課程</div>
        <button class="modal-close" @click="isManualAddOpen = false">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">課程名稱</label>
          <input type="text" class="form-input" v-model="manualCourse.name" placeholder="例如：微積分(一)" />
        </div>
        <div style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label class="form-label">星期</label>
            <select class="form-input" v-model="manualCourse.day">
              <option value="1">星期一</option><option value="2">星期二</option>
              <option value="3">星期三</option><option value="4">星期四</option><option value="5">星期五</option>
            </select>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">開始節次</label>
            <select class="form-input" v-model="manualCourse.start"><option v-for="n in 14" :key="n" :value="n">第 {{n}} 節</option></select>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">結束節次</label>
            <select class="form-input" v-model="manualCourse.end"><option v-for="n in 14" :key="n" :value="n">第 {{n}} 節</option></select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" @click="isManualAddOpen = false">取消</button>
        <button class="btn-primary" @click="confirmManualAdd">新增至課表</button>
      </div>
    </div>
  </div>

  <div class="modal-overlay" :class="{ open: confirmDialog.isOpen }" style="z-index: 9999;">
    <div class="modal" style="width: 380px; max-width: 90vw;">
      <div class="modal-header">
        <div class="modal-title" style="color: var(--amber);">⚠️ 系統提示</div>
      </div>
      <div class="modal-body" style="padding: 24px 20px; font-size: 13px; color: var(--text-primary); line-height: 1.6; white-space: pre-wrap;">
        {{ confirmDialog.message }}
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" @click="resolveConfirm(false)">取消</button>
        <button class="btn-primary" style="background: var(--red);" @click="resolveConfirm(true)">確定執行</button>
      </div>
    </div>
  </div>
  <div class="modal-overlay" :class="{ open: creditDetailModal.isOpen }" @click.self="creditDetailModal.isOpen = false" style="z-index: 600;">
    <div class="modal" style="width: 450px;">
      <div class="modal-header">
        <div class="modal-title">{{ creditDetailModal.title }} - 課程明細</div>
        <button class="modal-close" @click="creditDetailModal.isOpen = false">✕</button>
      </div>
      <div class="modal-body" style="padding: 16px;">
        <div class="parse-row header" style="grid-template-columns: 1fr 40px 50px 60px;">
          <span>課程名稱</span><span>學分</span><span>成績</span><span>狀態</span>
        </div>
        <div v-for="(c, idx) in creditDetailModal.courses" :key="idx" class="parse-row" style="grid-template-columns: 1fr 40px 50px 60px;">
          <div>
            <div class="parse-course-name">{{ c.name }}</div>
            <div class="parse-course-code">學期: {{ c.semester }}</div>
          </div>
          <span style="font-weight:600; color:var(--text-primary);">{{ c.credits }}</span>
          <span :class="c.score >= 60 || c.score === '通過' ? 'up' : 'neutral'">{{ c.score || '--' }}</span>
          <span class="tag" :class="c.status === '修習中' ? 'tag-mid' : 'tag-safe'">{{ c.status }}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="modal-overlay" :class="{ open: isEditProfileOpen }" @click.self="isEditProfileOpen = false" style="z-index: 800;">
    <div class="modal" style="width: 400px;">
      <div class="modal-header">
        <div class="modal-title">修改個人檔案</div>
        <button class="modal-close" @click="isEditProfileOpen = false">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">暱稱</label>
          <input type="text" class="form-input" v-model="editProfileData.nickname" />
        </div>
        
        <div class="form-group">
          <label class="form-label">入學學年</label>
          <select class="form-input" v-model="editProfileData.entryYear">
            <option v-for="y in 7" :key="y" :value="String(currentAcademicYear - y + 2)">
              {{ currentAcademicYear - y + 2 }} 學年
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">所屬科系 (從資料庫動態撈取)</label>
          <select class="form-input" v-model="editProfileData.dept">
            <option value="">請選擇科系</option>
            <option v-for="dept in availableDepartments" :key="dept" :value="dept">{{ dept }}</option>
          </select>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
            💡 修改科系後，系統會自動幫您重新掃描並校正所有已上傳課表的學分類別。
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" @click="isEditProfileOpen = false">取消</button>
        <button class="btn-primary" @click="saveProfile">儲存並重新校正學分</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import Chart from 'chart.js/auto'

const router = useRouter()

// ─── 1. UI 與狀態變數 ───
const activeTab = ref('overview')
const hasUnsavedChanges = ref(false)
const isFullscreen = ref(false)
const isModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isManualAddOpen = ref(false)
const uploadStep = ref('dropzone')
const fileInputRef = ref(null)
const isUploading = ref(false)

// ─── 2. 資料變數 ───
const currentUser = ref({ nickname: '載入中...', studentId: '', dept: '', entryYear: '113', id: 0 })
const allCoursesDB = ref({ '1': [], '2': [] })
const uploadedSemesters = ref([])
const mockSemesterDB = ref({})
// ─── 🌟 動態學年與學期引擎 ───
// 動態計算當前學年 (8月起算新學年)
const currentAcademicYear = computed(() => { 
  const d = new Date()
  return (d.getMonth() + 1) >= 8 ? (d.getFullYear() - 1911) : (d.getFullYear() - 1911 - 1) 
})

// 動態計算當前是 -1 (上學期) 還是 -2 (下學期)
const currentSemesterSuffix = computed(() => {
  const m = new Date().getMonth() + 1
  return (m >= 8 || m === 1) ? '-1' : '-2'
})

// 自動組合出當前正在進行的學期 (例如 '114-2')
const currentActiveSemester = computed(() => `${currentAcademicYear.value}${currentSemesterSuffix.value}`)

// 上傳預設選項直接綁定當前學期
const selectedUploadSemester = ref(currentActiveSemester.value)
const selectedSemesterData = ref({ 
  totalCredits: 0, 
  gpa: '--', 
  courses: [], 
  blocks: [] 
})
const parsedCourses = ref([])
const parsedTotalCredits = ref(0)
const manualCourse = ref({ name: '', day: 1, start: 1, end: 1 })

// 補回遺失的選中學期變數 (修復點不開課表的 Bug)
const selectedSemesterName = ref('')

// ─── 🌟 修改個人檔案功能 ───
const isEditProfileOpen = ref(false)
const editProfileData = ref({ nickname: '', dept: '', entryYear: '' })

// 從資料庫動態萃取所有科系名稱 (過濾掉年級、班級代號)
const availableDepartments = computed(() => {
  const deptSet = new Set()
  const allDB = [...(allCoursesDB.value['1'] || []), ...(allCoursesDB.value['2'] || [])]
  
  allDB.forEach(c => {
    if (c.cls_name) {
      // 利用正規表達式抓取中文字首，遇到數字、中英文年級班級就截斷
      const match = c.cls_name.split(' ')[0].match(/^([\u4e00-\u9fa5]+?)(?:[一二三四五六七八九十]|[甲乙丙丁戊己庚辛壬癸]|[A-Z]|\d|$)/)
      if (match && match[1] && match[1].length >= 2 && !match[1].includes('通識') && !match[1].includes('軍訓') && !match[1].includes('體育')) {
        let deptName = match[1]
        // 幫短名稱補上「系」字以統一格式
        if (!deptName.endsWith('系') && !deptName.endsWith('學程') && !deptName.endsWith('班') && deptName.length <= 4) {
           deptName += '系'
        }
        deptSet.add(deptName)
      }
    }
  })
  return Array.from(deptSet).sort()
})

const openEditProfile = () => {
  editProfileData.value = { ...currentUser.value }
  isEditProfileOpen.value = true
}

const saveProfile = () => {
  // 1. 儲存新資料
  currentUser.value = { ...currentUser.value, ...editProfileData.value }
  localStorage.setItem('fce_user', JSON.stringify(currentUser.value))

  // 2. 🌟 關鍵：重新校正所有已上傳課程的分類！
  const userDeptWord = currentUser.value.dept ? currentUser.value.dept.replace(/學?系/g, '') : '' 
  
  for (const semId in mockSemesterDB.value) {
    const semSuffix = semId.endsWith('-1') ? '1' : '2'
    const targetDB = allCoursesDB.value[semSuffix] || []
    
    mockSemesterDB.value[semId].courses.forEach(c => {
      const cBaseName = getBaseName(c.name)
      const matched = targetDB.find(dbC => dbC.sub_id3 === c.code || getBaseName(dbC.sub_name) === cBaseName)
      
      if (matched) {
        const dbType = matched.scj_scr_mso || ''  
        const dbClass = matched.cls_name || ''    
        const prefixMatch = String(c.code || '').match(/^[A-Za-z]+/)
        const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : ''

        if (['CHIN', 'ENGL', 'ATHL', 'MILT', 'GEID'].includes(prefix)) {
          c.category = '通識教育基礎課程'
        } else if (prefix === 'GEH') {
          c.category = '通識人文'
        } else if (prefix === 'GEW') {
          c.category = '通識社會'
        } else if (prefix === 'GEG' || prefix === 'GEK') {
          c.category = '通識自然'
        } else {
          const isMajor = userDeptWord && dbClass.includes(userDeptWord)
          if (dbType === '必修') {
             c.category = isMajor ? '院系必修' : '外系必修(另配到)'
          } else {
             c.category = isMajor ? '本系專業選修' : '非本系專業選修'
          }
        }
      }
    })
  }
  
  saveToLocalStorage()
  isEditProfileOpen.value = false
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'success', icon: '✅', title: '修改成功', msg: '資料已更新，且所有學分類別已重新校正計算！' } }))
}

// ─── 🌟 自訂確認視窗底層邏輯 ───
const confirmDialog = ref({ isOpen: false, message: '', resolve: null })

// ─── 🌟 新增：課程名稱正規化 (自動剝除序號與括號) ───
// 加上 String() 保護，避免 AI 傳回數字導致系統崩潰
const getBaseName = (name) => {
  if (!name) return ''
  return String(name).replace(/[\(（][一二三四五六上下IV]+[\)）]/gi, '').trim()
}

const showConfirm = (message) => {
  return new Promise((resolve) => {
    confirmDialog.value = { isOpen: true, message, resolve }
  })
}

const resolveConfirm = (result) => {
  if (confirmDialog.value.resolve) confirmDialog.value.resolve(result)
  confirmDialog.value.isOpen = false
}

// 拖曳與拉長控制變數
const draggedBlock = ref(null)
const resizingBlock = ref(null)
const resizeStartY = ref(0)
const originalEnd = ref(0)
const isResizingMode = ref(false)

// ─── 3. 計算屬性 (Computeds) ───
const getStorageKey = (keyName) => `${keyName}_${currentUser.value.id}`

const sortedSemesters = computed(() => {
  return [...uploadedSemesters.value].sort((a, b) => a.id.localeCompare(b.id))
})

const cumulativeGPA = computed(() => {
  const validSems = uploadedSemesters.value.filter(s => s.gpa && s.gpa !== '--' && !isNaN(s.gpa))
  if (validSems.length === 0) return '0.00'
  let totalPts = 0; let totalCreds = 0;
  validSems.forEach(s => {
    totalPts += Number(s.gpa) * Number(s.credits || 0)
    totalCreds += Number(s.credits || 0)
  })
  return totalCreds ? (totalPts / totalCreds).toFixed(2) : '0.00'
})

const avatarChar = computed(() => currentUser.value.nickname ? currentUser.value.nickname.charAt(0).toUpperCase() : '—')
const gradeText = computed(() => {
  if (!currentUser.value.entryYear) return '大一'
  const diff = currentAcademicYear.value - parseInt(currentUser.value.entryYear, 10) + 1
  if (diff === 1) return '大一'; if (diff === 2) return '大二'; if (diff === 3) return '大三'; return '大四'
})

// ─── 🌟 畢業學分計算引擎與狀態 ───
// 定義當前修習中的學期 (未來可以改為由系統時間自動判斷)

// 彈窗狀態
const creditDetailModal = ref({ isOpen: false, title: '', courses: [] })

const openCreditDetail = (title, courses) => {
  if (!courses || courses.length === 0) return
  creditDetailModal.value = { isOpen: true, title, courses }
}

// 動態分類與計算所有學分
const creditStats = computed(() => {
  const stats = {
    basicGenEd: { required: 16, confirmed: 0, pending: 0, courses: [] },
    majorRequired: { required: 63, confirmed: 0, pending: 0, courses: [] },
    genEdSocial: { required: 2, confirmed: 0, pending: 0, courses: [] },
    genEdHumanities: { required: 2, confirmed: 0, pending: 0, courses: [] },
    genEdNature: { required: 2, confirmed: 0, pending: 0, courses: [] },
    majorElective: { required: 28, confirmed: 0, pending: 0, courses: [] },
    freeElective: { required: 9, confirmed: 0, pending: 0, courses: [] },
  }

  // 遍歷所有已存入的學期資料
  for (const [semId, semData] of Object.entries(mockSemesterDB.value)) {
    const isPending = semId === currentActiveSemester.value

    semData.courses.forEach(c => {
      // 若已有成績且不及格 (<60) 則不計入學分
      const scoreNum = Number(c.score)
      if (!isPending && !isNaN(scoreNum) && scoreNum < 60) return
      
      const cred = Number(c.credits) || 0
      if (cred === 0) return

      // 🔍 模糊比對分類邏輯
      let catKey = 'freeElective' // 預設歸類為非本系選修 (自由選修)
      const catStr = c.category || ''

      if (catStr.includes('必修')) catKey = 'majorRequired'
      else if (catStr.includes('社會')) catKey = 'genEdSocial'
      else if (catStr.includes('人文')) catKey = 'genEdHumanities'
      else if (catStr.includes('自然')) catKey = 'genEdNature'
      else if (catStr.includes('通識')) catKey = 'basicGenEd'
      else if (catStr.includes('本系') && catStr.includes('選修')) catKey = 'majorElective'

      // 依狀態累加數字
      if (isPending) stats[catKey].pending += cred
      else stats[catKey].confirmed += cred

      // 存入明細清單以供彈窗顯示
      stats[catKey].courses.push({ ...c, semester: semId, status: isPending ? '修習中' : '已確認' })
    })
  }
  return stats
})

// 計算總進度
const totalCredits = computed(() => {
  let confirmed = 0, pending = 0
  Object.values(creditStats.value).forEach(s => {
    confirmed += s.confirmed; pending += s.pending
  })
  return { confirmed, pending, required: 128, total: confirmed + pending }
})


// ─── 4. 圖表相關函數 ───
let gpaChartInstance = null
let donutChartInstance = null

const updateCharts = () => {
  if (gpaChartInstance) {
    gpaChartInstance.data.labels = sortedSemesters.value.map(s => s.id)
    gpaChartInstance.data.datasets[0].data = sortedSemesters.value.map(s => s.gpa === '--' ? null : Number(s.gpa))
    gpaChartInstance.update()
  }
}

const initCharts = () => {
  const gpaCtx = document.getElementById('gpaChart')
  if (gpaCtx) {
    if (gpaChartInstance) gpaChartInstance.destroy()
    gpaChartInstance = new Chart(gpaCtx, {
      type: 'line',
      data: {
        labels: sortedSemesters.value.map(s => s.id),
        datasets: [{
          label: '學期 GPA',
          data: sortedSemesters.value.map(s => s.gpa === '--' ? null : Number(s.gpa)),
          borderColor: '#2DD4BF', backgroundColor: 'rgba(45, 212, 191, 0.1)',
          borderWidth: 2, pointBackgroundColor: '#18181B', pointBorderColor: '#2DD4BF',
          pointRadius: 4, fill: true, tension: 0.3
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 4.3, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8A8A8A' } }, x: { grid: { display: false }, ticks: { color: '#8A8A8A' } } }
      }
    })
  }

  const donutCtx = document.getElementById('creditDonut')
  if (donutCtx) {
    if (donutChartInstance) donutChartInstance.destroy()
    donutChartInstance = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['院系必修', '通識教育', '本系選修', '自由選修'],
        datasets: [{ data: [37, 15, 5, 4], backgroundColor: ['#2DD4BF', '#F59E0B', '#3B82F6', '#8A8A8A'], borderWidth: 0, hoverOffset: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#8A8A8A', font: { size: 11 }, boxWidth: 10, padding: 10 } } }, cutout: '62%' }
    })
  }
}

// ─── 5. 資料儲存與載入 ───
const loadUserData = () => {
  const savedSemesters = localStorage.getItem(getStorageKey('fce_semesters'))
  const savedDB = localStorage.getItem(getStorageKey('fce_semester_db'))
  if (savedSemesters) uploadedSemesters.value = JSON.parse(savedSemesters)
  else uploadedSemesters.value = []
  if (savedDB) mockSemesterDB.value = JSON.parse(savedDB)
  else mockSemesterDB.value = {}
  
  nextTick(() => updateCharts())
}

const saveToLocalStorage = () => {
  localStorage.setItem(getStorageKey('fce_semesters'), JSON.stringify(uploadedSemesters.value))
  localStorage.setItem(getStorageKey('fce_semester_db'), JSON.stringify(mockSemesterDB.value))
}

// ─── 6. 事件與邏輯處理函數 ───
const markUnsaved = () => { hasUnsavedChanges.value = true }
const saveChanges = () => {
  const targetSem = uploadedSemesters.value.find(s => s.id === selectedSemesterName.value)
  if (targetSem && selectedSemesterData.value) {
    targetSem.gpa = selectedSemesterData.value.gpa
  }
  saveToLocalStorage()
  hasUnsavedChanges.value = false
  // 🌟 將原生的 alert 換成優雅的右下角 Toast 通知
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'success', icon: '💾', title: '儲存成功', msg: '課表變更已成功存檔！' } }))
  updateCharts()
}

// 🌟 將確認行為改為非同步 (async/await) 呼叫自訂視窗
const checkBeforeClose = async () => {
  if (hasUnsavedChanges.value) {
    const confirmed = await showConfirm('你還有未儲存的變更，確定要直接離開嗎？\n(未儲存的心血將會遺失)')
    if (!confirmed) return
  }
  isDetailModalOpen.value = false
  hasUnsavedChanges.value = false
  loadUserData() 
}

const deleteSemester = async (semId) => {
  // 🌟 換成自訂的 showConfirm
  const confirmed = await showConfirm(`確定要刪除 ${semId} 學期的資料嗎？\n(此動作無法復原)`)
  if (!confirmed) return
  
  uploadedSemesters.value = uploadedSemesters.value.filter(s => s.id !== semId)
  delete mockSemesterDB.value[semId]
  saveToLocalStorage()
  updateCharts()
}

const confirmManualAdd = async () => {
  const name = manualCourse.value.name.trim()
  
  // 🌟 將錯誤警告也換成 Toast
  if (!name) return window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'error', icon: '⚠️', title: '格式錯誤', msg: '請輸入課程名稱' } }))
  if (manualCourse.value.start > manualCourse.value.end) return window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'error', icon: '⚠️', title: '時間錯誤', msg: '開始節次不能大於結束節次' } }))

  // 🌟 將輸入的課名去括號後，去「該學期」的資料庫搜尋
  const baseName = getBaseName(name)
  const semSuffix = selectedSemesterName.value.endsWith('-1') ? '1' : '2'
  const targetDB = allCoursesDB.value[semSuffix] || []
  
  const exists = targetDB.some(c => getBaseName(c.sub_name) === baseName)
  if (!exists) {
    const confirmed = await showConfirm('資料庫中找不到這堂課！\n可能是名稱輸入有誤，或是屬於特殊課程。\n\n確定要強制新增嗎？')
    if (!confirmed) return
  }

  selectedSemesterData.value.blocks.push({
    id: Date.now() + Math.random(),
    name: name,
    prof: '手動新增',
    day: parseInt(manualCourse.value.day),
    start: parseInt(manualCourse.value.start),
    end: parseInt(manualCourse.value.end),
    loc: ''
  })
  
  markUnsaved()
  isManualAddOpen.value = false
  manualCourse.value = { name: '', day: 1, start: 1, end: 1 }
}

// 🌟 路由守衛也要換成自訂視窗 (加入 isRouteLeaveConfirmed 防止非同步無限迴圈)
let isRouteLeaveConfirmed = false 
onBeforeRouteLeave(async (to, from, next) => {
  if (hasUnsavedChanges.value && !isRouteLeaveConfirmed) {
    const confirmed = await showConfirm('課表有未儲存的變更，確定要離開此頁面嗎？')
    if (confirmed) {
      isRouteLeaveConfirmed = true
      next()
    } else {
      next(false) // 取消跳轉
    }
  } else {
    next()
  }
})

const handleDragStart = (event, block) => {
  draggedBlock.value = block
  event.dataTransfer.effectAllowed = 'move'
}

const handleDrop = (event, targetDay, targetStartRow) => {
  if (!draggedBlock.value) return
  const duration = draggedBlock.value.end - draggedBlock.value.start
  draggedBlock.value.day = targetDay
  draggedBlock.value.start = targetStartRow
  draggedBlock.value.end = targetStartRow + duration
  draggedBlock.value = null
  markUnsaved()
}

const deleteBlock = (blockId) => {
  selectedSemesterData.value.blocks = selectedSemesterData.value.blocks.filter(b => b.id !== blockId)
  markUnsaved()
}

const startResize = (event, block) => {
  isResizingMode.value = true
  resizingBlock.value = block
  resizeStartY.value = event.clientY
  originalEnd.value = block.end
  window.addEventListener('mousemove', doResize)
  window.addEventListener('mouseup', stopResize)
}

const doResize = (event) => {
  if (!resizingBlock.value) return
  const deltaY = event.clientY - resizeStartY.value
  const addedRows = Math.round(deltaY / 41) 
  
  let newEnd = originalEnd.value + addedRows
  if (newEnd < resizingBlock.value.start) newEnd = resizingBlock.value.start
  if (newEnd > 14) newEnd = 14
  
  if (resizingBlock.value.end !== newEnd) {
    resizingBlock.value.end = newEnd
    markUnsaved()
  }
}

const stopResize = () => {
  isResizingMode.value = false
  resizingBlock.value = null
  window.removeEventListener('mousemove', doResize)
  window.removeEventListener('mouseup', stopResize)
}



const openUploadModal = () => { isModalOpen.value = true; uploadStep.value = 'dropzone'; parsedCourses.value = [] }
const closeUploadModal = () => { isModalOpen.value = false }
const triggerFileInput = () => { if (!isUploading.value && fileInputRef.value) fileInputRef.value.click() }

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  isUploading.value = true
  
  // 觸發背景圖示動畫，並暫時關閉彈窗讓使用者看機器人
  window.dispatchEvent(new CustomEvent('start-processing'))
  closeUploadModal()

  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await fetch('http://localhost:3000/api/upload/parse-schedule', {
      method: 'POST',
      headers: { 'x-user-id': currentUser.value.id },
      body: formData 
    })
    
    const data = await res.json()
    if (res.ok) {
      // 🌟 1. 防呆：確保 AI 給的確實是陣列
      let aiCourses = data.courses
      if (!Array.isArray(aiCourses)) aiCourses = aiCourses.courses || []

      // 🌟 2. 顯示預覽介面，不要立刻儲存
      parsedCourses.value = aiCourses
      parsedTotalCredits.value = aiCourses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0)
      uploadStep.value = 'result'
      
      // 🌟 3. 關閉機器人，並重新打開彈窗讓使用者檢視結果
      window.dispatchEvent(new CustomEvent('stop-processing'))
      isModalOpen.value = true 
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'success', icon: '🤖', title: '解析完成', msg: '請確認課程無誤後點擊儲存！' } }))
    } else { 
      window.dispatchEvent(new CustomEvent('stop-processing'))
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'error', icon: '❌', title: '解析失敗', msg: data.error || '請檢查圖片是否清晰' } }))
    }
  } catch (error) { 
    // 🌟 將真實的錯誤印出，不再被偷偷蓋掉
    console.error('上傳發生例外錯誤:', error) 
    window.dispatchEvent(new CustomEvent('stop-processing'))
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'error', icon: '📡', title: '系統異常', msg: '發生例外錯誤，請按 F12 查看 Console' } }))
  } finally {
    isUploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = '' 
  }
}

// 🌟 補回缺失的「確認並儲存」功能
const confirmUpload = () => {
  const targetSemester = selectedUploadSemester.value
  try {
    autoSaveParsedData(parsedCourses.value, targetSemester)
    closeUploadModal() // 儲存完畢後正式關閉彈窗
  } catch(err) {
    console.error('寫入資料庫時發生錯誤:', err)
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'error', icon: '⚠️', title: '儲存失敗', msg: '寫入資料時發生例外錯誤' } }))
  }
}

// ─── 自動將 AI 資料校正並寫入 ───
const autoSaveParsedData = (courses, semId) => {
  // 🌟 終極版：判斷學期後，利用資料庫代碼前綴進行絕對分類
  const userDeptWord = currentUser.value.dept ? currentUser.value.dept.replace(/學?系/g, '') : '' 

  // 💡 1. 判斷傳入的學期是上學期(-1)還是下學期(-2)，決定要用哪個資料庫
  const semSuffix = semId.endsWith('-1') ? '1' : '2'
  const targetDB = allCoursesDB.value[semSuffix] || []

  courses.forEach(c => {
    const cBaseName = getBaseName(c.name)
    // 💡 2. 從對應的學期資料庫 (targetDB) 中搜尋
    const matched = targetDB.find(dbC => dbC.sub_id3 === c.code || getBaseName(dbC.sub_name) === cBaseName)
    
    if (matched) { 
      c.credits = matched.scr_credit; 
      c.code = matched.sub_id3 || matched.scr_selcode; 
      
      const dbType = matched.scj_scr_mso || ''  
      const dbClass = matched.cls_name || ''    
      
      // 🌟 防彈處理：強制轉為字串，避免 undefined 或數字導致 .match() 系統崩潰
      const prefixMatch = String(c.code || '').match(/^[A-Za-z]+/)
      const prefix = prefixMatch ? prefixMatch[0].toUpperCase() : ''

      if (['CHIN', 'ENGL', 'ATHL', 'MILT', 'GEID'].includes(prefix)) {
        c.category = '通識教育基礎課程'
      } else if (prefix === 'GEH') {
        c.category = '通識人文'
      } else if (prefix === 'GEW') {
        c.category = '通識社會'
      } else if (prefix === 'GEG' || prefix === 'GEK') {
        c.category = '通識自然'
      } else {
        // 🌟 強制覆寫：只要不是通識，就依照系所判斷，絕對不讓 AI 的幻覺殘留！
        const isMajor = userDeptWord && dbClass.includes(userDeptWord)
        
        if (dbType === '必修') {
           c.category = isMajor ? '院系必修' : '外系必修(另配到)'
        } else {
           // 💡 關鍵修復：只要不是必修 (包含選修、群修、空白等奇葩格式)，全部統一判斷是否為本系！
           c.category = isMajor ? '本系專業選修' : '非本系專業選修'
        }
      }
    } else {
      // 🌟 資料庫找不到時的防呆：如果查無此課，但 AI 亂填了「本系」，強制降級為「非本系」避免灌水
      if (c.category && c.category.includes('本系')) {
        c.category = '非本系專業選修'
      }
    }
  })

  // 整理網格方塊
  const newBlocks = []
  courses.forEach(c => {
    if (c.timeSlots && Array.isArray(c.timeSlots)) {
      c.timeSlots.forEach(ts => {
        newBlocks.push({ id: Date.now() + Math.random(), name: c.name, prof: c.prof || '未知', day: ts.day, start: ts.start, end: ts.end, loc: ts.loc || '' })
      })
    }
  })

  // 計算 GPA
  let totalScore = 0, validScoreCount = 0
  courses.forEach(c => {
    const score = Number(c.score); if (!isNaN(score)) { totalScore += score; validScoreCount++ }
  });
  let calculatedGpa = validScoreCount === 0 ? '--' : (validScoreCount ? (totalScore / validScoreCount) : 0 >= 80 ? 4.0 : 3.0).toFixed(2) // 簡化展示

  // 💡 重新讀取最新的 LocalStorage (避免使用者在背景解析期間改了其他東西)
  const currentSemesters = JSON.parse(localStorage.getItem(getStorageKey('fce_semesters')) || '[]').filter(s => s.id !== semId)
  const currentDB = JSON.parse(localStorage.getItem(getStorageKey('fce_semester_db')) || '{}')

  currentSemesters.unshift({
    id: semId, gpa: calculatedGpa,
    credits: courses.reduce((sum, c) => sum + Number(c.credits || 0), 0),
    count: courses.length, status: 'done'
  })

  currentDB[semId] = {
    totalCredits: courses.reduce((sum, c) => sum + Number(c.credits || 0), 0),
    gpa: calculatedGpa, courses: courses, blocks: newBlocks
  }

  // 儲存
  localStorage.setItem(getStorageKey('fce_semesters'), JSON.stringify(currentSemesters))
  localStorage.setItem(getStorageKey('fce_semester_db'), JSON.stringify(currentDB))

  // 更新當前畫面
  uploadedSemesters.value = currentSemesters
  mockSemesterDB.value = currentDB
  updateCharts()

  // 🌟 發送成功通知
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { type: 'success', icon: '✅', title: '課表解析完成', msg: `${semId} 的課表已自動存入您的檔案中！` } }))
}


const openSemesterDetail = (sem) => {
  selectedSemesterName.value = sem
  selectedSemesterData.value = mockSemesterDB.value[sem] || { totalCredits: 0, gpa: '--', courses: [], blocks: [] }
  isDetailModalOpen.value = true
  hasUnsavedChanges.value = false 
}

// ─── 7. 生命週期鉤子 (Lifecycle Hooks) ───
onMounted(async () => {
  const userData = localStorage.getItem('fce_user')
  if (userData) {
    currentUser.value = JSON.parse(userData)
    loadUserData() 
  } else { 
    // 登入驗證邏輯...
    return 
  }
  
  // 🌟 修改：同時向後端請求上學期(1)與下學期(2)的資料庫
  try {
    const [res1, res2] = await Promise.all([
      fetch('http://localhost:3000/api/course-info?sem=1'),
      fetch('http://localhost:3000/api/course-info?sem=2')
    ])
    allCoursesDB.value['1'] = await res1.json()
    allCoursesDB.value['2'] = await res2.json()
  } catch(e) {
    console.error('資料庫載入失敗', e)
  }
  
  nextTick(() => initCharts())
})

</script>

<style scoped>
/* ─── 佈局與共用 ─── */
.content-area { padding: 24px; max-width: 1100px; margin: 0 auto; }
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 20px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.card-title { font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
.mb-4 { margin-bottom: 16px; }

/* ─── HERO 區塊 ─── */
.profile-hero { display: grid; grid-template-columns: auto 1fr auto; gap: 22px; align-items: center; padding: 22px 24px; margin-bottom: 20px; }
.profile-avatar { width: 64px; height: 64px; border-radius: 14px; background: linear-gradient(135deg, var(--bg-hover), var(--border)); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--text-primary); flex-shrink: 0; border: 1px solid var(--border); }
.profile-name-row { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.profile-name { font-size: 19px; font-weight: 700; }
.profile-id { font-family: var(--font-mono); font-size: 14px; color: var(--text-secondary); }
.profile-meta { display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap; }
.profile-meta-item { font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px; }
.profile-gpa-display { text-align: right; border-left: 1px solid var(--border); padding-left: 22px; }
.profile-gpa-value { font-family: var(--font-mono); font-size: 32px; font-weight: 700; color: var(--green); line-height: 1; margin-bottom: 4px; }
.profile-gpa-label { font-size: 11px; color: var(--text-muted); letter-spacing: 0.05em; }

/* ─── TABS ─── */
.tab-row { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid var(--border-soft); padding-bottom: 12px; }
.tab-btn { padding: 8px 16px; border: none; background: transparent; color: var(--text-secondary); font-size: 13px; cursor: pointer; border-radius: var(--radius); transition: all 0.15s; font-weight: 500; }
.tab-btn:hover { color: var(--text-primary); background: var(--bg-hover); }
.tab-btn.active { color: var(--text-primary); background: var(--bg-hover); font-weight: 600; }

/* ─── OVERVIEW TAB ─── */
.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.stat-chip { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 18px; }
.stat-chip-label { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 6px; }
.stat-chip-value { font-size: 22px; font-weight: 700; font-family: var(--font-mono); margin-bottom: 2px; }
.stat-chip-sub { font-size: 11px; color: var(--text-secondary); }
.chart-wrap { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 16px; }
.chart-controls { display: flex; gap: 4px; margin-bottom: 12px; }
.chart-btn { padding: 3px 10px; border-radius: 4px; background: transparent; border: 1px solid var(--border); color: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all 0.12s; }
.chart-btn:hover, .chart-btn.active { background: var(--bg-hover); border-color: var(--border); color: var(--text-primary); }
.two-col { display: grid; grid-template-columns: 1fr 360px; gap: 16px; }

/* ─── SEMESTERS TAB ─── */
.semester-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.semester-card { background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 14px 16px; transition: border-color 0.15s; cursor: pointer; position: relative; }
.semester-card:hover { border-color: var(--text-secondary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
.delete-sem-btn { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); color: white; border: none; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; opacity: 0; transition: all 0.2s; }
.semester-card:hover .delete-sem-btn { opacity: 1; }
.delete-sem-btn:hover { background: var(--red); transform: scale(1.1); }
.semester-card.empty { border-style: dashed; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-height: 118px; color: var(--text-muted); }
.semester-card.empty:hover { color: var(--text-primary); border-color: var(--text-secondary); }
.semester-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.semester-label { font-size: 14px; font-weight: 600; font-family: var(--font-mono); color: var(--text-primary); }
.semester-status { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); }
.semester-status.done { background: var(--green-dim); color: var(--green); }
.semester-status.processing { background: var(--amber-dim); color: var(--amber); }
.semester-gpa { font-size: 24px; font-weight: 700; font-family: var(--font-mono); color: var(--text-primary); line-height: 1; }
.semester-gpa-sub { font-size: 10px; color: var(--text-muted); margin-top: 4px; margin-bottom: 12px; font-family: var(--font-mono); }
.semester-credits { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-secondary); padding-top: 10px; border-top: 1px solid var(--border-soft); }

/* ─── GRADUATION TAB ─── */
.progress-track { height: 6px; background: var(--bg-input); border-radius: 10px; overflow: hidden; margin-top: 8px; }
.progress-fill { height: 100%; background: var(--accent-teal); border-radius: 10px; transition: width 0.5s ease; }
.credit-table-wrap { overflow-x: auto; }
.credit-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.credit-table th { text-align: left; padding: 10px; color: var(--text-muted); font-weight: 500; border-bottom: 1px solid var(--border); font-family: var(--font-ui); }
.credit-table td { padding: 10px; border-bottom: 1px solid var(--border-soft); color: var(--text-secondary); font-family: var(--font-mono); }
.credit-table td:first-child { font-family: var(--font-ui); color: var(--text-primary); }
.credit-table tr:hover td { background: var(--bg-hover); }
.credit-table tr.subtotal td { background: var(--bg-input); font-weight: 700; color: var(--text-primary); }
.credit-table tr.grandtotal td { background: var(--bg-hover); font-weight: 700; color: var(--text-primary); border-top: 2px solid var(--border); }
.credit-confirmed { color: var(--red) !important; font-weight: 700; }
.gap-card { background: var(--bg-input); border: 1px solid var(--border); border-left: 3px solid var(--amber); border-radius: var(--radius); padding: 12px 14px; margin-bottom: 8px; }
.gap-card.urgent { border-left-color: var(--red); }
.gap-card.ok { border-left-color: var(--green); }
.gap-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.gap-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.gap-desc { font-size: 11.5px; color: var(--text-secondary); line-height: 1.6; }

/* ─── PRIVACY TAB ─── */
.privacy-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-soft); }
.privacy-label { font-size: 13px; color: var(--text-primary); }
.privacy-desc { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.toggle-switch { position: relative; width: 38px; height: 21px; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); border-radius: 21px; transition: .2s; }
.toggle-slider:before { position: absolute; content: ""; height: 15px; width: 15px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: .2s; }
.toggle-switch input:checked + .toggle-slider { background-color: var(--accent-teal); }
.toggle-switch input:checked + .toggle-slider:before { transform: translateX(17px); }

/* ─── MODALS 共用 ─── */
.modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 500; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.2s; }
.modal-overlay.open { display: flex; opacity: 1; pointer-events: auto; }
.modal { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; width: 500px; max-width: 90vw; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transform: translateY(20px); transition: transform 0.3s; }
.modal-overlay.open .modal { transform: translateY(0); }
.modal-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg-input); }
.modal-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.modal-close { background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; }
.modal-close:hover { color: var(--text-primary); }
.modal-body { padding: 20px; max-height: 60vh; overflow-y: auto; }
.modal-footer { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; background: var(--bg-input); }
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); margin-bottom: 8px; letter-spacing: 0.05em; text-transform: uppercase; }
.form-input { width: 100%; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 14px; color: var(--text-primary); font-family: var(--font-mono); font-size: 13px; outline: none; transition: border-color 0.15s; }
.form-input:focus { border-color: var(--text-secondary); }
select.form-input { -webkit-appearance: none; appearance: none; cursor: pointer; }
.dropzone { border: 1.5px dashed var(--border); border-radius: var(--radius-lg); padding: 32px 20px; text-align: center; cursor: pointer; transition: all 0.15s; background: var(--bg-input); }
.dropzone:hover:not(.uploading) { border-color: var(--accent-teal); background: rgba(45, 212, 191, 0.05); }
.dropzone.uploading { cursor: wait; border-color: var(--border-soft); }
.dropzone-icon { font-size: 26px; margin-bottom: 8px; opacity: 0.7; }
.dropzone-title { font-size: 13px; font-weight: 500; margin-bottom: 4px; color: var(--text-primary); }
.dropzone-sub { font-size: 11px; color: var(--text-muted); }
.parse-row { display: grid; grid-template-columns: 1fr 40px 50px 60px; gap: 10px; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--border-soft); font-size: 12px; }
.parse-row.header { font-size: 10px; color: var(--text-muted); padding-bottom: 6px; border-bottom: 1px solid var(--border); }
.parse-course-name { font-weight: 500; color: var(--text-primary); margin-bottom: 2px; }
.parse-course-code { font-size: 10px; font-family: var(--font-mono); color: var(--text-secondary); }

/* 🌟 全螢幕專用 CSS */
.fullscreen-modal {
  width: 100vw !important; max-width: 100vw !important; height: 100vh !important;
  border-radius: 0 !important; margin: 0 !important; transform: translateY(0) !important;
}
.fullscreen-modal .modal-body { max-height: calc(100vh - 70px) !important; }

/* ─── Schedule Visualizer Grid ─── */
.schedule-grid { display: grid; grid-template-columns: 40px repeat(5, minmax(100px, 1fr)); grid-template-rows: 30px repeat(14, minmax(40px, auto)); gap: 1px; background: var(--border-soft); border: 1px solid var(--border-soft); border-radius: var(--radius); overflow: hidden; }
.grid-header-cell { background: var(--bg-input); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); padding: 8px 0; }
.corner-cell { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }
.grid-time-cell { background: var(--bg-input); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); font-weight: 600; }
.grid-bg-cell { background: var(--bg-card); transition: background 0.2s; }
.drop-zone:hover { background: rgba(255,255,255,0.05); }

/* 方塊樣式 */
.course-block { 
  background: rgba(45, 212, 191, 0.15); border-left: 3px solid var(--accent-teal); 
  margin: 2px; padding: 6px; border-radius: 4px; display: flex; flex-direction: column; gap: 2px; 
  position: relative; /* 確保按鈕與拉桿有定位基準 */
  user-select: none; /* 防止拖曳時反白文字 */
}
.draggable { cursor: grab; }
.draggable:active { cursor: grabbing; transform: scale(0.98); opacity: 0.8; }
.cb-name { font-size: 10px; font-weight: 600; color: var(--text-primary); line-height: 1.2; }
.cb-prof { font-size: 9px; color: var(--text-secondary); }
.cb-loc { font-family: var(--font-mono); font-size: 8px; color: var(--text-muted); margin-top: auto; }

/* 方塊刪除按鈕 */
.block-delete-btn {
  position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%;
  background: rgba(0, 0, 0, 0.5); color: white; border: none; font-size: 10px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  opacity: 0; transition: all 0.2s;
}
.course-block:hover .block-delete-btn { opacity: 1; }
.block-delete-btn:hover { background: var(--red); transform: scale(1.1); }

/* 🌟 方塊底部拉桿 (Resizer) */
.resizer-handle {
  position: absolute; bottom: 0; left: 0; right: 0; height: 8px; cursor: ns-resize;
  background: transparent; display: flex; justify-content: center; align-items: center;
}
.resizer-handle::after {
  content: ''; width: 20px; height: 2px; border-top: 1px solid rgba(0,0,0,0.2); border-bottom: 1px solid rgba(0,0,0,0.2);
  opacity: 0; transition: opacity 0.2s;
}
.course-block:hover .resizer-handle::after { opacity: 1; }
.resizer-handle:hover { background: rgba(0,0,0,0.1); }

/* ─── UTILS ─── */
.tag { display: inline-flex; align-items: center; padding: 2px 8px; font-size: 10px; border-radius: 100px; font-weight: 500; }
:deep(.tag-safe) { background: var(--green-dim); color: var(--green); }
:deep(.tag-risk) { background: var(--red-dim); color: var(--red); }
:deep(.tag-mid) { background: var(--amber-dim); color: var(--amber); }
:deep(.tag-info) { background: rgba(255,255,255,0.06); color: var(--text-secondary); border: 1px solid var(--border); }
.up { color: var(--green) !important; }
.neutral { color: var(--text-secondary) !important; }
.loading-spinner { width: 24px; height: 24px; border: 3px solid var(--bg-hover); border-top: 3px solid var(--accent-teal); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* 按鈕 */
.btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: var(--text-primary); color: var(--bg-deep); border: none; border-radius: var(--radius); font-family: var(--font-mono); font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
.btn-primary:hover { opacity: 0.85; }
.btn-ghost { padding: 6px 14px; background: transparent; color: var(--text-secondary); border: 1px solid var(--border); border-radius: var(--radius); font-size: 12px; cursor: pointer; transition: all 0.15s; }
.btn-ghost:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--text-secondary); }
.btn-outline-primary { padding: 6px 14px; background: transparent; color: var(--text-primary); border: 1px dashed var(--border); border-radius: var(--radius); font-size: 12px; cursor: pointer; transition: all 0.15s; }
.btn-outline-primary:hover { background: var(--bg-hover); border-color: var(--text-secondary); }

/* 🌟 GPA 編輯輸入框 */
.gpa-edit-input {
  background: transparent; border: none; border-bottom: 1px dashed var(--text-muted);
  font-family: var(--font-mono); font-size: 24px; font-weight: 700; color: inherit;
  width: 100px; outline: none; padding: 0; transition: border-color 0.2s;
}
.gpa-edit-input:focus { border-bottom-color: var(--accent-teal); }

/* 🌟 學分可點擊特效 */
.clickable-credit {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dashed;
  text-underline-offset: 4px;
  color: var(--text-primary) !important;
  transition: all 0.2s;
}
.clickable-credit:hover { color: var(--accent-teal) !important; }
.clickable-credit.pending:hover { color: var(--amber) !important; }
</style>