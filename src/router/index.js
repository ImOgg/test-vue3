import { createRouter, createWebHistory } from 'vue-router'

// 路由組件（懶加載）
const Home = () => import('../views/Home.vue')
const UserList = () => import('../views/UserList.vue')
const UserDetail = () => import('../views/UserDetail.vue')
const UserForm = () => import('../views/UserForm.vue')
const PostList = () => import('../views/PostList.vue')
const PostForm = () => import('../views/PostForm.vue')
const PostDetail = () => import('../views/PostDetail.vue')
const Dashboard = () => import('../views/Dashboard.vue')

// 路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: '首頁' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { 
      title: '儀表板'
    }
  },
  {
    path: '/users',
    name: 'users',
    component: UserList,
    meta: { 
      title: '用戶管理'
    }
  },
  {
    path: '/users/create',
    name: 'user-create',
    component: UserForm,
    meta: { 
      title: '新增用戶'
    }
  },
  {
    path: '/users/:id',
    name: 'user-detail',
    component: UserDetail,
    props: true,
    meta: { 
      title: '用戶詳情'
    }
  },
  {
    path: '/users/:id/edit',
    name: 'user-edit',
    component: UserForm,
    props: true,
    meta: { 
      title: '編輯用戶'
    }
  },
  {
    path: '/posts',
    name: 'posts',
    component: PostList,
    meta: { title: '文章列表' }
  },
  {
    path: '/posts/create',
    name: 'post-create',
    component: PostForm,
    meta: { 
      title: '發表文章'
    }
  },
  {
    path: '/posts/:id',
    name: 'post-detail',
    component: PostDetail,
    props: true,
    meta: { title: '文章詳情' }
  },
  {
    path: '/posts/:id/edit',
    name: 'post-edit',
    component: PostForm,
    props: true,
    meta: { 
      title: '編輯文章'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '頁面不存在' }
  }
]

// 創建路由器
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 返回儲存的位置或回到頂部
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})


// 路由錯誤處理
router.onError((error) => {
  console.error('路由錯誤:', error)
})

export default router