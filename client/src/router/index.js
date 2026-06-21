import { createRouter, createWebHistory } from 'vue-router'
import MarketView from '../views/MarketView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'market',
      component: MarketView
    },
    // 登入介面
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { hideTopbar: true }
    },
    // 註冊/建立個人檔案介面
    {
      path: '/setup',
      name: 'setup',
      component: () => import('../views/ProfileSetupView.vue'),
      meta: { hideTopbar: true }
    },
    // 單一課程看盤頁 (動態路由)
    {
      path: '/course/:id',
      name: 'courseDetail',
      component: () => import('../views/CourseDetailView.vue')
    },
    // 回測引擎 (你的視覺化課表與回測功能)
    {
      path: '/backtest',
      name: 'backtest',
      component: () => import('../views/BacktestView.vue')
    },
    // 我的課表 (組合列表頁)
    {
      path: '/portfolio',
      name: 'portfolio',
      component: () => import('../views/PortfolioView.vue')
    },
    // 個人設定檔頁面
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    },
    // 課程資訊頁
    {
      path: '/course-info',
      name: 'courseInfo',
      component: () => import('../views/CourseInfoView.vue')
    }
  ]
})

export default router