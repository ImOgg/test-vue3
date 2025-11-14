<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- 標題與操作按鈕 -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold text-gray-800">📝 文章管理</h1>
      <div class="flex gap-4">
        <Button size="lg" @click="openCreateModal">
          ➕ 發表文章
        </Button>
        <Button variant="outline" size="lg" @click="refreshPosts" :disabled="loading">
          {{ loading ? '載入中...' : '🔄 重新載入' }}
        </Button>
      </div>
    </div>

    <!-- 搜尋與篩選 -->
    <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 搜尋文章標題或內容..."
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-gray-500 transition-colors"
        />
      </div>
      <div class="flex flex-wrap gap-4">
        <select v-model="authorFilter" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors">
          <option value="">所有作者</option>
          <option v-for="author in authors" :key="author.id" :value="author.id">
            {{ author.name }}
          </option>
        </select>
        <select v-model="sortBy" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors">
          <option value="title">按標題排序</option>
          <option value="author">按作者排序</option>
          <option value="createdAt">按發表時間排序</option>
          <option value="comments">按留言數排序</option>
        </select>
        <select v-model="sortOrder" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors">
          <option value="asc">升序</option>
          <option value="desc">降序</option>
        </select>
      </div>
    </div>

    <!-- 文章統計 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-sm text-center">
        <span class="block text-gray-500 text-sm mb-2">文章總數</span>
        <span class="block text-gray-800 text-3xl font-bold">{{ postStore.posts?.length || 0 }}</span>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm text-center">
        <span class="block text-gray-500 text-sm mb-2">作者人數</span>
        <span class="block text-gray-800 text-3xl font-bold">{{ authors?.length || 0 }}</span>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm text-center">
        <span class="block text-gray-500 text-sm mb-2">留言總數</span>
        <span class="block text-gray-800 text-3xl font-bold">{{ postStore.comments?.length || 0 }}</span>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm text-center">
        <span class="block text-gray-500 text-sm mb-2">搜尋結果</span>
        <span class="block text-gray-800 text-3xl font-bold">{{ filteredPosts?.length || 0 }}</span>
      </div>
    </div>

    <!-- 文章列表 -->
    <div v-if="loading" class="text-center py-12">
      <div class="w-12 h-12 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600">載入文章資料中...</p>
    </div>

    <div v-else-if="filteredPosts.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm">
      <div class="text-6xl mb-4">📝</div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">沒有找到文章</h3>
      <p class="text-gray-600 mb-6">{{ searchQuery ? '請嘗試不同的搜尋條件' : '開始發表第一篇文章吧！' }}</p>
      <Button size="lg" @click="openCreateModal">
        發表文章
      </Button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="post in paginatedPosts"
        :key="post.id"
        class="group bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all duration-200 border border-gray-200 hover:-translate-y-1 hover:shadow-md hover:border-gray-900"
        @click="viewPost(post.id)"
      >
        <div class="flex justify-between items-center px-6 pt-6">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {{ getAuthorInitials(post.userId) }}
            </div>
            <div>
              <h4 class="text-sm text-gray-800 font-medium m-0">{{ getAuthorName(post.userId) }}</h4>
              <p class="text-xs text-gray-500 m-0">{{ formatDate(post.createdAt) }}</p>
            </div>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" @click.stop>
            <Button variant="outline" size="xs" @click="editPost(post)" title="編輯">
              ✏️
            </Button>
            <Button variant="outline" size="xs" @click="deletePost(post)" title="刪除">
              🗑️
            </Button>
          </div>
        </div>

        <div class="px-6 py-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4 leading-snug m-0">{{ post.title }}</h2>
          <p class="text-sm text-gray-600 leading-relaxed m-0">{{ getExcerpt(post.content) }}</p>
        </div>

        <div class="px-6 pb-6 flex justify-between items-center">
          <div class="flex gap-2 flex-wrap" v-if="post.tags && post.tags.length">
            <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
              #{{ tag }}
            </span>
          </div>
        </div>
      </article>
    </div>

    <!-- 分頁 -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        @click="currentPage = Math.max(1, currentPage - 1)"
        :disabled="currentPage === 1"
      >
        ◀️ 上一頁
      </Button>

      <div class="flex gap-1">
        <Button
          v-for="page in visiblePages"
          :key="page"
          :variant="page === currentPage ? 'default' : 'outline'"
          @click="currentPage = page"
        >
          {{ page }}
        </Button>
      </div>

      <Button
        variant="outline"
        @click="currentPage = Math.min(totalPages, currentPage + 1)"
        :disabled="currentPage === totalPages"
      >
        下一頁 ▶️
      </Button>
    </div>

    <!-- 文章表單 Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="closeModal">
      <div class="bg-white rounded-lg w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex justify-between items-center px-6 py-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-800 m-0">{{ isEditing ? '編輯文章' : '發表文章' }}</h2>
          <button @click="closeModal" class="bg-transparent border-0 text-2xl cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">✕</button>
        </div>

        <form @submit.prevent="submitForm" class="px-6 py-6">
          <div class="mb-6">
            <label for="title" class="block mb-2 font-medium text-gray-700">文章標題 *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              :class="['w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-gray-500 transition-colors', { 'border-red-500': errors.title }]"
              placeholder="請輸入文章標題"
              required
            />
            <span v-if="errors.title" class="text-red-500 text-sm mt-1 block">{{ errors.title }}</span>
          </div>

          <div class="mb-6">
            <label for="content" class="block mb-2 font-medium text-gray-700">文章內容 *</label>
            <textarea
              id="content"
              v-model="formData.content"
              :class="['w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-gray-500 transition-colors resize-y min-h-[120px]', { 'border-red-500': errors.content }]"
              placeholder="請輸入文章內容"
              rows="10"
              required
            ></textarea>
            <span v-if="errors.content" class="text-red-500 text-sm mt-1 block">{{ errors.content }}</span>
          </div>

          <div class="mb-6">
            <label for="author" class="block mb-2 font-medium text-gray-700">作者</label>
            <select id="author" v-model="formData.userId" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-gray-500 transition-colors">
              <option value="">請選擇作者</option>
              <option v-for="author in userStore.users" :key="author.id" :value="author.id">
                {{ author.name }}
              </option>
            </select>
            <span v-if="errors.userId" class="text-red-500 text-sm mt-1 block">{{ errors.userId }}</span>
          </div>

          <div class="mb-6">
            <label for="tags" class="block mb-2 font-medium text-gray-700">標籤 (可選)</label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              placeholder="請輸入標籤，用逗號分隔"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-gray-500 transition-colors"
            />
            <small class="text-gray-500 text-sm mt-1 block">例如：技術,教學,心得</small>
          </div>

          <div class="flex gap-4 justify-end mt-8">
            <Button type="button" variant="outline" size="lg" @click="closeModal">
              取消
            </Button>
            <Button type="submit" size="lg" :disabled="submitting">
              {{ submitting ? '處理中...' : (isEditing ? '更新' : '發表') }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/post'
import { useUserStore } from '@/stores/user'
import { usePostForm } from '@/composables/usePostForm'
import { Button } from '@/components/ui/button'

const router = useRouter()
const postStore = usePostStore()
const userStore = useUserStore()
const { formData, errors, validate, submitCreate, submitUpdate, reset } = usePostForm()

// 響應式資料
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const currentEditingPost = ref(null)

// 搜尋與篩選
const searchQuery = ref('')
const authorFilter = ref('')
const sortBy = ref('createdAt')
const sortOrder = ref('desc')

// 分頁
const currentPage = ref(1)
const itemsPerPage = ref(9)

// 表單額外欄位
const tagsInput = ref('')

// 計算屬性
const authors = computed(() => {
  const authorIds = [...new Set(postStore.posts.map(post => post.userId))]
  return authorIds.map(id => userStore.users.find(user => user.id === id)).filter(Boolean)
})

const filteredPosts = computed(() => {
  let posts = [...postStore.posts]
  
  // 搜尋篩選
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    posts = posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    )
  }
  
  // 作者篩選
  if (authorFilter.value) {
    posts = posts.filter(post => post.userId === parseInt(authorFilter.value))
  }
  
  // 排序
  posts.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy.value) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'author':
        aValue = getAuthorName(a.userId).toLowerCase()
        bValue = getAuthorName(b.userId).toLowerCase()
        break
      case 'createdAt':
        aValue = new Date(a.createdAt || 0)
        bValue = new Date(b.createdAt || 0)
        break
      case 'comments':
        aValue = getPostComments(a.id).length
        bValue = getPostComments(b.id).length
        break
      default:
        return 0
    }
    
    if (sortOrder.value === 'desc') {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    } else {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    }
  })
  
  return posts
})

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / itemsPerPage.value))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPosts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...', total)
    }
  }
  
  return pages.filter(page => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page))
})

// 方法
const refreshPosts = async () => {
  loading.value = true
  try {
    await Promise.all([
      postStore.fetchPosts(),
      postStore.fetchComments(),
      userStore.fetchUsers()
    ])
  } catch (error) {
    console.error('載入文章失敗:', error)
  } finally {
    loading.value = false
  }
}

const getAuthorName = (userId) => {
  const user = userStore.users.find(u => u.id === userId)
  return user ? user.name : '未知作者'
}

const getAuthorInitials = (userId) => {
  const name = getAuthorName(userId)
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (dateString) => {
  if (!dateString) return '未知時間'
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getExcerpt = (content, maxLength = 150) => {
  if (!content) return ''
  return content.length > maxLength ? content.slice(0, maxLength) + '...' : content
}

const getPostComments = (postId) => {
  return postStore.comments.filter(comment => comment.postId === postId)
}

const viewPost = (postId) => {
  router.push(`/posts/${postId}`)
}

const openCreateModal = () => {
  isEditing.value = false
  currentEditingPost.value = null
  reset()
  tagsInput.value = ''
  showModal.value = true
}

const editPost = (post) => {
  isEditing.value = true
  currentEditingPost.value = post
  Object.assign(formData, {
    title: post.title,
    content: post.content,
    userId: post.userId
  })
  tagsInput.value = post.tags ? post.tags.join(', ') : ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  reset()
  tagsInput.value = ''
}

const submitForm = async () => {
  // 處理標籤
  if (tagsInput.value) {
    formData.tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
  } else {
    formData.tags = []
  }
  
  if (!validate()) return
  
  submitting.value = true
  try {
    if (isEditing.value) {
      await submitUpdate(currentEditingPost.value.id)
    } else {
      await submitCreate()
    }
    closeModal()
    await refreshPosts()
  } catch (error) {
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

const deletePost = async (post) => {
  if (!confirm(`確定要刪除文章「${post.title}」嗎？`)) return
  
  try {
    await postStore.deletePost(post.id)
    await refreshPosts()
  } catch (error) {
    console.error('刪除文章失敗:', error)
  }
}

// 生命週期
onMounted(() => {
  refreshPosts()
})
</script>